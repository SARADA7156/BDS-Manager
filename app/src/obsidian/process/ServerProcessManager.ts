import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { ServerState } from "./serverState";
import { EventEmitter } from 'events';
import { IServerLogObserver, ServerLogParser } from "../monitor/ServerLogParser";
import { ObsidianProcessError } from "../errors/ObsidianProcessError";
import { CORE_STATUS } from "../errors/coreStatus";
import { IObsidianProcessLogger } from "../logger/ObsidianProcessLogger";
import { IRestartPolicy } from "./RestartPolicy";

export interface IServerProcessManager {
    instanceName: string;
    start(timeoutMs?: number): Promise<void>; // BDSスタート
    stop(timeoutMs?: number): Promise<void>; // BDS終了
    restart(): Promise<void>; // 再起動
    sendCommand(command: string): void;

    getPid(): number | undefined; // PID提供
    getLogObserver(): IServerLogObserver;
    getState(): string;

    on(event: 'running' | 'stopped' | 'crashed', listener: () => void): void;
}

export class ServerProcessManager extends EventEmitter implements IServerProcessManager {
    // 重要な情報は基本的にハードプライベート
    readonly #serverPath: string;
    readonly #serverBin: string;
    readonly instanceName: string;
    #serverProcess: ChildProcessWithoutNullStreams | null;
    #processPid: number | undefined = undefined;
    #state: ServerState = ServerState.STOPPED;
    #iscleanuped: boolean = false;
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
        super();
        this.#serverPath = serverPath;
        this.#serverBin = serverBin;
        this.instanceName = instanceName;
        this.#serverProcess = null;
        this.#logParser = logParser;
        this.#restartPolicy = restartPolicy;
        this.logger = logger;
    }

    public async start(timeoutMs: number = 20000): Promise<void> {
        let timeoutId: NodeJS.Timeout | undefined;

        if (this.#serverProcess) {
            this.logger.warn('サーバーは既に起動しています。');
            return;
        }

        try {
            this.logger.info('BDSサーバーを起動します...');
            this.#setState(ServerState.STARTING);

            // 1. bedrock_serverを子プロセスとして実行
            this.#serverProcess = spawn(this.#serverBin, [], { cwd: this.#serverPath, stdio: 'pipe' });
            this.#processPid = this.#serverProcess.pid;

            // 2. stdoutをparserにパース
            this.#serverProcess.stdout.on('data', (data: Buffer) => {
                this.#logParser.handle(data);
            });

            // Exitイベントを監視
            this.#serverProcess.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
                this.logger.info(`BDSサーバーがシグナル ${signal}, コード ${code} で終了しました。`);

                // リスナー等を破棄
                this.#cleanupProcess();

                if (!this.#isManualStop && code !== 0 && signal !== 'SIGTERM') {
                    this.logger.warn('BDSサーバーが異常終了しました。再起動を試みます...');
                    this.#setState(ServerState.CRASHED);
                    this.#fire('crashed'); // crashイベントを発火
                    this.#handleRestart();
                } else {
                    this.logger.info('BDSサーバーは正常に停止しました。');
                    this.#fire('stopped'); // stopイベントを発火
                    this.#setState(ServerState.STOPPED);
                }
                this.#isManualStop = false;
            });

            // Errorイベントを監視
            this.#serverProcess.on('error', (err: Error) => {
                this.logger.error('🚨 BDSサーバーの起動に失敗しました。');

                this.#cleanupProcess();
                throw new Error(`Process startup failed. ${err.message}`);
            });

            // 3. タイムアウト処理(Promise化)
            const timeoutPromise = new Promise<never>((_, reject) => {
                timeoutId = setTimeout(() => {
                    this.logger.error('BDSサーバーの起動がタイムアウトしました。強制終了します...');
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
            this.#setState(ServerState.RUNNING);
            this.#fire('running'); // runningイベントを発火
            this.logger.info('BDSサーバーは正常に起動しました。');
            this.#iscleanuped = false;

        } catch(err) {
            if (timeoutId) clearTimeout(timeoutId);
            this.#cleanupProcess(); // 初期化処理を必ず呼ぶ
            const errorDetail = (err instanceof Error) ? err.message : String(err);
            this.#handleError(
                CORE_STATUS.PROCESS_START_FAILED,
                `[${this.instanceName}] BDSサーバー起動エラー.`,
                `BDSサーバーの起動中にエラーが発生しました。 詳細: ${errorDetail}`
            );
        }
    }

    public async stop(timeoutMs: number = 10000): Promise<void> {
        let timeoutId: NodeJS.Timeout | undefined;

        if (!this.#serverProcess || this.#state !== ServerState.RUNNING) {
            this.logger.warn('サーバーは既に停止しています。');
            return;
        }
        this.#isManualStop = true;
        this.#setState(ServerState.STOPPING);

        try {
            this.logger.info('BDSサーバーを停止します...');
            this.sendCommand('stop'); // BDSにstopコマンドを送信

            // 'Quit correctly'を待つ
            const waitPromise = this.#logParser.waitFor('Quit correctly');

            // BDSが固まった際のタイムアウト処理
            const timeoutPromise = new Promise<never>((_, reject) => {
                timeoutId = setTimeout(() => {
                    this.logger.error('BDSサーバーの停止がタイムアウトしました。強制終了します...');
                    this.#serverProcess?.kill('SIGKILL');
                    reject(new Error('Timeout: server did not shut down'));
                }, timeoutMs);
            });

            // 二つを競争
            await Promise.race([waitPromise, timeoutPromise]);

            this.logger.info('BDSサーバーは正常に停止しました。');

        } catch(err) {
            const errorDetail = (err instanceof Error) ? err.message : String(err);
            this.#handleError(
                CORE_STATUS.PROCESS_STOP_FAILED,
                `[${this.instanceName}] BDSサーバー停止エラー.`,
                `BDSサーバーの停止処理中にエラーが発生しました。 詳細: ${errorDetail}`
            );
        } finally {
            this.#isManualStop = false;
            if (timeoutId) clearTimeout(timeoutId);
        }
    }

    public async restart(): Promise<void> {
        this.#isManualStop = true;

        if (this.#state === ServerState.RESTARTING) return;
        this.#setState(ServerState.RESTARTING);

        this.logger.info('BDSサーバーを再起動します...');
        await this.stop();
        await this.start();
    }

    // BDSにコマンドを送信
    sendCommand(command: string): void {
        if (!this.#serverProcess) {
            this.logger.warn(`BDSサーバープロセスが存在しないため、コマンドを送信できません。`);
            return;
        }

        if (this.#state !== ServerState.RUNNING) {
            this.logger.warn(`BDSサーバーが起動していないため、コマンドを送信できません。`);
            return;
        }

        this.logger.info(`BDSサーバーにコマンドを送信します: ${command}`);
        this.#serverProcess.stdin.write(`${command}\n`);
    }

    public getPid(): number | undefined {
        return this.#processPid;
    }

    public getLogObserver(): IServerLogObserver {
        return this.#logParser;
    }

    public getState(): ServerState {
        return this.#state;
    }

    #setState(state: ServerState): void {
        this.#state = state;
    }

    // イベントを発火
    #fire(event: 'running' | 'stopped' | 'crashed'): void {
        this.emit(event);
    }

    // プロセスを落とす際はすべてのリスナーをクリーンアップ
    #cleanupProcess(): void {
        if (this.#iscleanuped) return;
        this.#iscleanuped = true;

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
                this.logger.error(`再起動の最大試行回数に達しました。再起動を中止します。`);
                return;
            }

            const attempt = this.#restartPolicy.getRetries();
            this.logger.info(`再起動を試みます。試行回数: ${attempt}`);
            await new Promise(res => setTimeout(res, 5000));

            await this.start();
            this.#restartPolicy.reset();
            this.logger.info(`BDSサーバーの再起動に成功しました。`);
        } catch(err) {
            this.logger.error(`BDSサーバーの再起動に失敗しました: ${(err as Error).message}`);
            setTimeout(() => this.#handleRestart(), 5000); // 再帰的に再試行
        } finally {
            this.#isRestarting = false;
        }
    }

    #handleError(code: number, message: string, detail: string): never {
        throw new ObsidianProcessError(code, message, detail);
    }
}