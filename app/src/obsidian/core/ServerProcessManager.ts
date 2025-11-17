import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { ServerState } from "./serverState";
import { EventEmitter } from 'events';
import { IServerLogObserver, ServerLogParser } from "../monitor/ServerLogParser";
import { ObsidianProcessError } from "../errors/ObsidianProcessError";
import { CORE_STATUS } from "../errors/coreStatus";
import { IObsidianProcessLogger } from "../logger/ObsidianProcessLogger";
import { IRestartPolicy } from "./RestartPolicy";

export interface IServerProcessManager {
    start(timeoutMs?: number): Promise<void>; // BDSスタート
    stop(timeoutMs: number): Promise<void>; // BDS終了
    restart(timeoutMs: number): Promise<void>; // 再起動
    sendCommand(command: string): void;

    getPid(): number | undefined; // PID提供
    getState(): ServerState; // 現在の状態を返す
    getLogObserver(): IServerLogObserver;

    // on(event: "started" | "stopped" | "crashed" | "log", listener: (data?: string) => void): void;
}

export class ServerProcessManager implements IServerProcessManager {
    // 重要な情報は基本的にハードプライベート
    readonly #serverPath: string;
    readonly #serverBin: string;
    readonly #instanceName: string;
    #serverProcess: ChildProcessWithoutNullStreams | null;
    #processPid: number | undefined = undefined;
    #state: ServerState = ServerState.STOPPED;
    #isDisposed: boolean = false;
    #isManualStop: boolean = false;
    #isRestarting: boolean = false;
    #logParser: ServerLogParser;
    #restartPolicy: IRestartPolicy;
    private logger: IObsidianProcessLogger;

    constructor(
        serverPath: string,
        serverBin: string,
        instanceName: string,
        logParser: ServerLogParser,
        restartPolicy: IRestartPolicy,
        logger: IObsidianProcessLogger
    ) {
        this.#serverPath = serverPath;
        this.#serverBin = serverBin;
        this.#instanceName = instanceName;
        this.#serverProcess = null;
        this.#logParser = logParser;
        this.#restartPolicy = restartPolicy;
        this.logger = logger;
    }

    public async start(timeoutMs: number = 20000): Promise<void> {
        let timeoutId: NodeJS.Timeout | undefined;

        if (this.#serverProcess) {
            this.logger.warn('Server is already running.');
            return;
        }

        try {
            this.logger.info('Starting Minecraft server...');
            this.#setState(ServerState.STARTING);

            // 1. bedrock_serverを子プロセスとして実行
            this.#serverProcess = spawn(this.#serverBin, [], { cwd: this.#serverPath, stdio: 'pipe' });
            this.#processPid = this.#serverProcess.pid

            // 2. stdoutをparserにパース
            this.#serverProcess.stdout.on('data', (data: Buffer) => {
                this.#logParser.handle(data);
            });

            // Exitイベントを監視
            this.#serverProcess.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
                this.logger.info(`Server process exited with code: ${code}, signal=${signal}`);
                this.#serverProcess = null;

                // リスナー等を破棄
                this.#dispose();

                if (!this.#isManualStop && code !== 0 && signal !== 'SIGTERM') {
                    this.logger.warn('Unexpected shutdown detected. Restarting...');
                    this.#setState(ServerState.CRASHED);
                    this.#handleRestart();
                } else {
                    this.logger.info('The server has shut down successfully.');
                }
                this.#isManualStop = false;
            });

            // 3. タイムアウト処理(Promise化)
            const timeoutPromise = new Promise<never>((_, reject) => {
                timeoutId = setTimeout(() => {
                    this.logger.error('Startup timeout. killing process...');
                    this.#serverProcess?.kill('SIGKILL');
                    reject(new Error('Server setup timed out.'));
                }, timeoutMs);
            });

            // 4. サーバー起動待ち
            const startupPromise = this.#logParser.waitFor('Server started.');

            // 5. タイムアウトと起動完了の競争
            await Promise.race([
                startupPromise,
                timeoutPromise
            ]);

            // サーバーが起動したことが確認できた後の処理
            if (timeoutId) clearTimeout(timeoutId);
            this.logger.info('Minecraft server started successfully.');
            this.#setState(ServerState.RUNNING);

        } catch(err) {
            if (timeoutId) clearTimeout(timeoutId);
            this.#dispose(); // 初期化処理を必ず呼ぶ
            const errorDetail = (err instanceof Error) ? err.message : String(err);
            this.#handleError(
                CORE_STATUS.PROCESS_START_FAILED,
                `[${this.#instanceName}] bedrock_server process start up error.`,
                `An error occurred while starting the Bedrock server. detail: ${errorDetail}`
            );
        }
    }

    public async stop(timeoutMs: number = 10000): Promise<void> {
        let timeoutId: NodeJS.Timeout | undefined;

        if (!this.#serverProcess || this.#state !== ServerState.RUNNING) {
            this.logger.warn('The server has already been shut down.');
            return;
        }
        this.#isManualStop = true;
        this.#setState(ServerState.STOPPING);

        try {
            this.sendCommand('stop')
            const timeoutPromise = new Promise<never>((_, reject) => {
                timeoutId = setTimeout(() => {
                    this.logger.error('Server did not shut down gracefully. killing...');
                    this.#serverProcess?.kill('SIGKILL');
                    reject(new Error('Timeout: server did not shut down'));
                }, timeoutMs);
            });

            // サーバーシャットダウン待ち
            const stopPromise = Promise.race([
                this.#logParser.waitFor('Quit correctly'),
                new Promise<void>((resolve) => {
                    this.#serverProcess?.once('exit', () => resolve());
                })
            ]).catch(err => {
                this.logger.warn(`stop promise rejected: ${err}`);
                throw err;
            });

            // 停止とタイムアウトの競争
            await Promise.race([
                timeoutPromise,
                stopPromise
            ]);

            if (timeoutId) clearTimeout(timeoutId);
            this.logger.info('The shutdown completed successfully.')

        } catch(err) {
            if (timeoutId) clearTimeout(timeoutId);
            const errorDetail = (err instanceof Error) ? err.message : String(err);
            this.#handleError(
                CORE_STATUS.PROCESS_STOP_FAILED,
                `[${this.#instanceName}] bedrock_server process shutdown error.`,
                `An error occurred while stopping the Bedrock server. detail: ${errorDetail}`
            );
        } finally {
            this.#isManualStop = false;
            this.#dispose(); // 初期化
        }
    }

    public async restart(): Promise<void> {
        this.#isManualStop = true;
        this.logger.info('Restart the Bedrock Server.');
        await this.stop();
        await this.start();
    }

    sendCommand(command: string): void {
        if (!this.#serverProcess || this.#state !== ServerState.RUNNING) {
            this.logger.error(`Cannot send command: Server is not running.`);
            return;
        }
        this.logger.info(`Sending command to server: ${command}`);
        this.#serverProcess.stdin.write(`${command}\n`);
    }

    public getPid(): number | undefined {
        return this.#processPid;
    }

    public getState(): ServerState {
        return this.#state;
    }

    public getLogObserver(): IServerLogObserver {
        return this.#logParser;
    }

    #setState(state: ServerState): void {
        this.#state = state;
    }

    // プロセスを落とす際はすべてのリスナーをクリーンアップ
    #dispose(): void {
        if (this.#isDisposed) return;
        this.#isDisposed = true;

        this.#logParser.clear();
        this.#setState(ServerState.STOPPED);

        if (this.#serverProcess) {
            this.#serverProcess.removeAllListeners();
            this.#serverProcess.stdout.removeAllListeners();
            this.#serverProcess.stderr.removeAllListeners();
            this.#serverProcess = null;
        }
    }

    async #handleRestart(): Promise<void> {
        if (this.#isRestarting) return;
        this.#isRestarting = true;

        try {
            if (!this.#restartPolicy.shouldRetry()) {
                this.logger.error(`Max restart attempts reached. Aborting auto-restart.`);
                return;
            }

            const attempt = this.#restartPolicy.getRetries();
            this.logger.info(`Restaring server (attempt ${attempt})...`);
            await new Promise(res => setTimeout(res, 5000));

            await this.start();
            this.#restartPolicy.reset();
            this.logger.info(`Server restarted successfully.`);
        } catch(err) {
            this.logger.error(`Restart attempt failed: ${(err as Error).message}`);
            setTimeout(() => this.#handleRestart(), 5000); // 再帰的に再試行
        } finally {
            this.#isRestarting = false;
        }
    }

    #handleError(code: number, message: string, detail: string): never {
        throw new ObsidianProcessError(code, message, detail);
    }
}