import { IRedisClient } from "../../services/db/redis/RedisClient";
import { IObsidianProducerLogger } from "../logger/ObsidianProducerLogger";
import { Job } from "../types/job";

export class RedisQueueService {
    private readonly queuekey: string = 'sequential-jobs';
    constructor(private redis: IRedisClient, private logger: IObsidianProducerLogger) {};

    public async setJob(job: Job): Promise<void> {
        try {
            const client = this.redis.getClient();
            const jobString = JSON.stringify(job);

            const length = await client.rPush(this.queuekey, jobString);
            this.logger.info(`ジョブ #${job.jobId} を投入しました。現在のキューサイズは${length}です。`);
        } catch(err) {
            const errorDetail = (err instanceof Error) ? err.message : String(err);
            this.logger.error(`Redisにジョブを投入しようとしましたが、失敗しました。 詳細: ${errorDetail}`);
            throw err;
        }
    }
}