import { ServerConfig } from "../entities/instanceConfigSchema";
import { IServerCreator } from "../installer/ServerCreator";
import { IObsidianWorkerLogger } from "../logger/ObsidianWorkerLogger";
import { IServerProcessManager } from "../process/ServerProcessManager";
import { Job } from "../types/job";

export interface IServerJobWorker {
    handle(job: Job, manager: IServerProcessManager): Promise<void>;
}

export class ServerJobWorker implements IServerJobWorker {
    private creator: IServerCreator;
    private logger: IObsidianWorkerLogger;

    constructor(creator: IServerCreator, logger: IObsidianWorkerLogger) {
        this.creator = creator;
        this.logger = logger;
    }

    public async handle(job: Job, manager: IServerProcessManager): Promise<void> {
        const start = Date.now();
        this.logger.info(`${manager.instanceName} に対してジョブ ${job.type} を開始します。`);

        try {
            switch (job.type) {
                case 'start':
                    await this.startServer(manager);
                    break;
                case 'stop':
                    await this.stopServer(manager);
                    break;
                case 'restart':
                    await this.restartServer(manager);
                    break;
                case 'command':
                    if (!job.command) {
                        throw new Error('コマンドが適切に渡されていません。');
                    }
                    await this.sendCommand(manager, job.command);
                    break;
                case 'create':
                    if (!job.config) {
                        throw new Error('インスタンスコンフィグが適切に渡されていません。');
                    }
                    await this.createServer(job.config);
                    break;
                default:
                    this.logger.warn(`${manager.instanceName} に対して不明なジョブタイプが実行されました。`);
            }
        } catch (err) {
            const errorDetail = (err instanceof Error) ? err.message : String(err);
            this.logger.error(`${manager.instanceName} のジョブ ${job.type} 中にエラーが発生しました。 詳細: ${errorDetail}`);
            throw err;
        }

        const end = Date.now();
        const seconds = (end - start) / 1000;
        this.logger.info(`${manager.instanceName} に対してジョブ ${job.type} を ${seconds}秒 で完了しました。`)
    }

    private async startServer(manager: IServerProcessManager): Promise<void> {
        await manager.start();
    }

    private async stopServer(manager: IServerProcessManager): Promise<void> {
        await manager.stop();
    }

    private async restartServer(manager: IServerProcessManager): Promise<void> {
        await manager.restart();
    }

    private sendCommand(manager: IServerProcessManager, command: string): void {
        manager.sendCommand(command);
    }

    private async createServer(config: ServerConfig): Promise<void> {
        await this.creator.create(config);
    }
}