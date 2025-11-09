import { ObsidianLogger } from "../core/ObsidianLogger";
import { ServerConfig } from "../entities/instanceConfigSchema"
import { ReturnType } from "../types/ObsidianCore";
import { IServerCreator } from "./ServerCreator";

type ServerJob = {
    config: ServerConfig;
    resolve: (value: ReturnType) => void;
    reject: (reason: any) => void;
};

export class ServerJobQueue {
    private queue: ServerJob[] = [];
    private isProcessing = false;

    constructor(private creator: IServerCreator, private logger: ObsidianLogger) {}

    // サーバー作成の呼び出し口
    public enqueue(config: ServerConfig): Promise<ReturnType> {
        return new Promise((resolve, reject) => {
            this.logger.info('Add instance build process to queue.')
            this.queue.push({ config, resolve, reject });
            this.processQueue();
        });
    }

    // サーバーの作成を順次行う
    private async processQueue() {
        if (this.isProcessing) return; // 二重呼び出し防止
        this.isProcessing = true;

        while (this.queue.length > 0) {
            const job = this.queue.shift()!;
            try {
                const result: ReturnType = await this.creator.create(job.config);
                job.resolve(result);
            } catch(err) {
                job.reject(err);
            }
        }

        this.isProcessing = false;
    }
}