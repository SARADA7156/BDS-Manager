import { Queue } from "bullmq";
import { Job } from "../types/job";
import { BullMQRedisClient } from "../../services/db/redis/BullmqRedisClient";

export class ServerJobQueue {
    private queue: Queue<Job>;

    constructor() {
        const redisClient = BullMQRedisClient.getConnection();

        this.queue = new Queue<Job>('server-job', {
            connection: redisClient,
        });
    }

    public async addJob(job: Job): Promise<void> {
        await this.queue.add(job.type, job, {
            removeOnComplete: 100,
            removeOnFail: 100,
            attempts: 1,
        });
    }
}