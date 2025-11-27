/*
    BDS Obsidianのすべての機能の統括部分
    Obsidianのすべての機能はこのクラスを介してでしか呼び出してはならない。
 */
import { JobInfo } from "@shared/types/job";
import { ServerConfig } from "../entities/instanceConfigSchema";
import { CORE_STATUS } from "../errors/coreStatus";
import { isObsidianError } from "../errors/ObsidianError";
import { IJobPlan } from "../jobs/JobPlan";
import { IServerJobQueue } from "../queue/serverJobQueue";
import { ReturnType } from "../types/ObsidianCore";

export interface IObsidianCore {
    createServer(serverConfig: ServerConfig, executedBy: string): Promise<ReturnType>;

    getJobs(): Promise<JobInfo[]>
}

export class ObsidianCore implements IObsidianCore {
    private readonly queue: IServerJobQueue;
    private readonly plan: IJobPlan;

    constructor (
        queue: IServerJobQueue,
        plan: IJobPlan
    ) {
        this.queue = queue;
        this.plan = plan;
    }

    public async createServer(serverConfig: ServerConfig, executedBy: string): Promise<ReturnType> {
        try {
            const jobPlans = this.plan.CreateJobPlan(serverConfig, 'user', executedBy);

            if (!jobPlans) {
                return { result: true, code: CORE_STATUS.BAD_REQUEST, message: 'インスタンスコンフィグの形式が正しくありません。' };
            }

            for (const job of jobPlans) {
                console.log('jobを追加')
                await this.queue.addJob(job);
            }

            return { result: true, code: CORE_STATUS.ACCEPTED, message: 'インスタンスの作成リクエストをキューに保存しました。'};
        } catch(error) {
            if (isObsidianError(error)) {
                return { result: false, code: error.code, message: `${error.message} | ${error.detail}`};
            }
            return { result: false, code: CORE_STATUS.INTERNAL_SERVER_ERROR, message: `Internal Obsidian Error: ${error}` };
        }
    }

    public async getJobs(): Promise<JobInfo[]> {
        return await this.queue.getJobs();
    }
}