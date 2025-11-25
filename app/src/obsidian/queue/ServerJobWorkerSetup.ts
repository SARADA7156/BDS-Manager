import { Queue, Worker } from "bullmq";
import { IServerJobWorker, ServerJobWorker } from "./ServerJobWorker";
import { Job } from "../types/job";
import { IServerProcessManager } from "../process/ServerProcessManager";
import { IServerManager } from "../process/ServerManager";
import { BullMQRedisClient } from "../../services/db/redis/BullmqRedisClient";
import { IServerCreator } from "../installer/ServerCreator";
import { IObsidianWorkerLogger } from "../logger/ObsidianWorkerLogger";

export interface IServerJobWorkerBootstrapper {
    start(): void;
    stop(): void;
}

export class ServerJobWorkerBootstrapper implements IServerJobWorkerBootstrapper {
    private worker?: Worker;
    private readonly workerLogic: IServerJobWorker;

    constructor(
        private creator: IServerCreator,
        private logger: IObsidianWorkerLogger,
        private serverManager: IServerManager
    ) {
        this.workerLogic = new ServerJobWorker(this.creator, this.logger);
    }

    start() {
        if (this.worker) return;

        this.worker = new Worker<Job>(
            'server-jobs',
            async (job) => {
                if (job.data.type !== 'create') {
                    const manager: IServerProcessManager | undefined = this.serverManager.getManager(job.data.instanceName);
                    if (!manager) {
                        this.logger.error(`ジョブの種類: ${job.data.type}, ${job.data.instanceName}という名前のインスタンスは存在しません。`);
                        return;
                    }
                    await this.workerLogic.handle(job.data, manager);
                } else {
                    await this.workerLogic.handle(job.data);
                }
            },
            { connection: BullMQRedisClient.getConnection() }
        );

        this.worker.on('failed', async (job, err) => {
            if (!job) return;

            const { instanceName, type } = job.data;

            if (type === 'start') {
                this.logger.warn(`${instanceName}のstartジョブが失敗したため影響の受けるジョブをキャンセルします。`);

                const queue = new Queue('server-jobs', {
                    connection: BullMQRedisClient.getConnection()
                });

                const watingJobs = await queue.getJobs(['wait']);
                const targetJobs = watingJobs.filter(j => j.data.instanceName === instanceName);

                for (const j of targetJobs) {
                    await queue.remove(j.data.jobId);
                }

                this.logger.info(`インスタンス ${instanceName} の後続のジョブを削除しました。`);
            }
        });
    }

    async stop() {
        await this.worker?.close();
        this.worker = undefined;
    }
}
