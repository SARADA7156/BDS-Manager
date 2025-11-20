import { Worker } from "bullmq";
import { IServerJobWorker, ServerJobWorker } from "../obsidian/queue/ServerJobWorker";
import { Job } from "../obsidian/types/job";
import { IServerProcessManager } from "../obsidian/process/ServerProcessManager";
import { IServerManager } from "../obsidian/process/ServerManager";
import { BullMQRedisClient } from "../services/db/redis/BullmqRedisClient";
import { IServerCreator } from "../obsidian/installer/ServerCreator";
import { ObsidianWorkerLogger } from "../obsidian/logger/ObsidianWorkerLogger";

export class ServerJobWorkerBootstrapper {
    private worker?: Worker;
    private readonly workerLogic: IServerJobWorker;

    constructor(
        private creator: IServerCreator,
        private logger: ObsidianWorkerLogger,
        private serverManager: IServerManager
    ) {
        this.workerLogic = new ServerJobWorker(this.creator, this.logger);
    }

    start() {
        if (this.worker) return;

        this.worker = new Worker<Job>(
            'server-jobs',
            async (job) => {
                const manager: IServerProcessManager | undefined = this.serverManager.getManager(job.data.instanceName);
                if (!manager) {
                    this.logger.error(`${job.data.instanceName}という名前のインスタンスは存在しません。`);
                    return;
                }

                await this.workerLogic.handle(job.data, manager);
            },
            { connection: BullMQRedisClient.getConnection() }
        );
    }

    async stop() {
        await this.worker?.close();
        this.worker = undefined;
    }
}
