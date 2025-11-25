import { Queue } from "bullmq";
import { Job } from "../types/job";
import { BullMQRedisClient } from "../../services/db/redis/BullmqRedisClient";

export interface IServerJobQueue {
    addJob(job: Job): Promise<void>;

    clean(): Promise<void>;
}

export class ServerJobQueue implements IServerJobQueue {
    private queue: Queue<Job>;

    constructor() {
        const redisClient = BullMQRedisClient.getConnection();

        this.queue = new Queue<Job>('server-jobs', {
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

    public async clean(): Promise<void> {
        await this.queue.clean(1000 * 60 * 10, 1000, 'completed');
    }
}