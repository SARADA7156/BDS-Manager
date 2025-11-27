import { Queue } from "bullmq";
import { Job, JobInfo } from "../../../shared/types/job";
import { BullMQRedisClient } from "../../services/db/redis/BullmqRedisClient";
import pLimit from "p-limit";

export interface IServerJobQueue {
    addJob(job: Job): Promise<void>;

    clean(): Promise<void>;

    getJobs(): Promise<JobInfo[]>;
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

    public async getJobs(): Promise<JobInfo[]> {
        const jobs = await this.queue.getJobs(['wait', 'active', 'delayed', 'paused']);

        jobs.sort((a, b) => Number(a.id) - Number(b.id));

        const limit = pLimit(10);

        return Promise.all(
            jobs.map(job =>
                limit(async () => {
                    const state = await job.getState();
                    return { ...job.data, state };
                })
            )
        );
    }
}