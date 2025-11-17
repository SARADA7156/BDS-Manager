import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { ServerLogger } from "./ServerLogger";
import { ServerLogParser } from "../monitor/ServerLogParser";

export class ServerManager {
    private serverPath: string;
    private serverBin: string;
    private serverProcess: ChildProcessWithoutNullStreams | null;
    private instanceName: string;
    private logger: ServerLogger;
    private logParser: ServerLogParser;
    private retries = 0;
    private maxRetries = 3;

    constructor(serverPath: string, serverBin: string, instanceName: string) {
        this.serverPath = serverPath;
        this.serverBin = serverBin;
        this.serverProcess = null;
        this.instanceName = instanceName;
        this.logger = new ServerLogger(this.instanceName);
        this.logParser = new ServerLogParser(this.instanceName);
    }

    // Minecraftサーバーを起動させる。
    public start(): void {
        // サーバーが起動していると処理を終了
        if (this.serverProcess) {
            this.logger.warn('Server is already running.');
            return;
        }

        // サーバーを起動
        this.logger.info('Starting Minecraft server...');
        this.serverProcess = spawn(this.serverBin, [], {cwd: this.serverPath, stdio: 'pipe'});

        const resetTimer = setTimeout(() => {
            this.retries = 0; // リトライ回数をリセット
            this.logger.info('The Minecraft server started successfully.')
        }, 1000);

        // Minecraftサーバーのログを ServerLogParserに流し込む
        this.serverProcess.stdout.on('data', (data: Buffer) => {
            this.logParser.handle(data);
        });

        this.serverProcess.on('exit', (code: number, signal) => {
            this.logger.info(`(exit) Server process exited with code: ${code}, signal=${signal}`);
            this.serverProcess = null; // プロセス終了時にnullに戻す。

            if (code === 0) {
                this.logger.info(`The server has shut down successfully.`);
                return;
            }

            this.retries++; // リトライ回数をカウント
            // 3回連続で再起動に失敗すると処理を断念
            if (this.retries > this.maxRetries) {
                this.logger.error(`All retry attempts have been used up: ${this.retries}/${this.maxRetries}`);
                this.logger.error(`Stop automatic restart...`);
                return;
            }

            this.logger.warn(`The server crashed. Restarting ${this.retries}/${this.maxRetries} ...`);
            setTimeout(() => this.start()); // 間隔をあけて再起動を試みる。
        });

        // ストリームがすべて閉じた後に発火
        this.serverProcess.on('close', (code) => {
            this.logger.info(`(close) The process has been completely terminated: code=${code}`);
            // 完全に停止した後の処理を必要であれば記述
        });

        this.serverProcess.on('error', (err) => {
            clearTimeout(resetTimer);
            this.logger.error(`Process startup error:`, err);
        });
    }

    public getLogParser(): ServerLogParser {
        return this.logParser;
    }

    public sendCommand(command: string): void {
        if (!this.serverProcess) {
            this.logger.error(`Cannot send command: Server is not running.`);
            return;
        }
        this.logger.info(`Sending command to server: ${command}`);
        this.serverProcess.stdin.write(`${command}\n`);
    }

    // Minecraftサーバーを停止する。
    public stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.serverProcess) {
                this.logger.info(`Minecraft server is already down.`);
                return resolve();
            }

            const proc = this.serverProcess;

            const timeoutId = setTimeout(() => {
                if (this.serverProcess !== null) {
                    this.logger.error('Server did not shut down gracefully. killing...');
                    proc.kill('SIGKILL');
                }
            }, 5000);

            const onExit = () => {
                clearTimeout(timeoutId);
                this.serverProcess = null;
                resolve();
            };

            proc.once('exit', onExit);

            try {
                this.logger.info('Terminating child process');
                this.sendCommand('stop');
            } catch (err) {
                clearTimeout(timeoutId);
                proc.off('exit', onExit);
                reject(err);
            }
        });
    }

    // Minecraftサーバーの再起動
    public async restart() {
        this.logger.info('Restart the Minecraft server.');

        await this.stop();
        // サーバーが停止するのを待ってから再起動
        this.start();
        this.logger.info('Restart successfully.');
    }

    // サーバー初回起動時に呼び出されるセットアップ関数
    public firstLaunch() {
        this.start();
    }
}