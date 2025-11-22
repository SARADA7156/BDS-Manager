import { ZodSafeParseResult } from "zod";
import { ulid } from "ulid";
import { InstanceConfig, InstanceConfigSchema, ServerConfig } from "../entities/instanceConfigSchema";
import { CORE_STATUS } from "../errors/coreStatus";
import { isObsidianParamError, ObsidianParamError } from "../errors/ObsidianParamError";
import { BaseJob, CommandJob, CreateJob, Job, RestartJob, StartJob, StopJob } from "../types/job";
import { commandProperties } from './settingsMap.json';
import { generateRandomSuffix } from "../../utils/randomSuffix";
import { ObsidianLogger } from "../logger/ObsidianLogger";

interface IJobPlan {
    CreateJobPlan(config: ServerConfig, executorType: 'user' | 'system', executedBy: string): Job[] | undefined;
    createJob(type: 'start', instanceName: string, executorType: 'user' | 'system', executedBy: string): StartJob;
    createJob(type: 'stop', instanceName: string, executorType: 'user' | 'system', executedBy: string): StopJob;
    createJob(type: 'restart', instanceName: string, executorType: 'user' | 'system', executedBy: string): RestartJob;
    createJob(type: 'command', instanceName: string, executorType: 'user' | 'system', executedBy: string, command: string, expect: string | RegExp, timeoutMs: number, coolTime: number): CommandJob;
    createJob(type: 'create', instanceName: string, executorType: 'user' | 'system', executedBy: string, config: InstanceConfig): CreateJob;

}

export class JobPlan implements IJobPlan {
    constructor(private logger: ObsidianLogger) {};

    public CreateJobPlan(config: ServerConfig, executorType: 'user' | 'system', executedBy: string): Job[] | undefined {
        try {
            config.instanceName = `${config.instanceName}-${generateRandomSuffix()}`; // インスタンス名にランダム文字列を付けて一意に
            const convertedCfg = this.convertConfig(config).data;

            // 設定データにエラーがある際は例外を投げる
            if (!convertedCfg) {
                throw new ObsidianParamError(CORE_STATUS.BAD_REQUEST, '設定データ変化エラー', '設定データの形式が違います。');
            }

            const jobPlans: Job[] = []; // ジョブのプランが格納された配列

            // まずstartジョブを追加
            jobPlans.push(this.createJob('start', convertedCfg.instanceName, executorType, executedBy));

            // その後にゲームルール変更コマンドジョブを追加してゆく
            for (const key of Object.keys(convertedCfg) as (keyof InstanceConfig)[]) {
                if (Object.prototype.hasOwnProperty.call(convertedCfg, key)) {
                    // JSONに登録されているコマンドだけJobデータを作成する
                    if (commandProperties.includes(key)) {
                        const propKey = key as keyof InstanceConfig;

                        const value = convertedCfg[propKey];

                        const job: Job = this.createJob(
                            'command',
                            convertedCfg.instanceName,
                            executorType,
                            executedBy,
                            `gamerule ${key} ${value}`,
                            `Game rule ${key} has been updated to ${value}`,
                            2000,
                            3000
                        );

                        jobPlans.push(job);
                    }
                }
            }

            return jobPlans;

        } catch(err) {
            if (isObsidianParamError(err)) {
                this.logger.error('引数エラー', err.detail);
            } else {
                const errorDetail = (err instanceof Error) ? err.message : String(err);
                this.logger.error('ジョブプラン作成エラー', errorDetail)
            }
            return undefined;
        }
    }

    // オーバーロードシグネチャ
    public createJob(type: 'start', instanceName: string, executorType: 'user' | 'system', executedBy: string): StartJob;
    public createJob(type: 'stop', instanceName: string, executorType: 'user' | 'system', executedBy: string): StopJob;
    public createJob(type: 'restart', instanceName: string, executorType: 'user' | 'system', executedBy: string): RestartJob;
    public createJob(type: 'command', instanceName: string, executorType: 'user' | 'system', executedBy: string, command: string, expect: string | RegExp, timeoutMs: number, coolTime: number): CommandJob;
    public createJob(type: 'create', instanceName: string, executorType: 'user' | 'system', executedBy: string, config: InstanceConfig): CreateJob;
    // 実装シグネチャ
    public createJob(
        type: Job['type'],
        instanceName: string,
        executorType: 'user' | 'system',
        executedBy: string,
        ...args: any[]
    ): Job {
        const commonProps: BaseJob = {
            jobId: ulid(),
            instanceName,
            executorType,
            executedBy,
            createdAt: new Date(),
        }

        switch(type) {
            case 'start':
            case "stop":
            case "restart":
                return { ...commonProps, type };
            case "command":
                const [command, expect, timeoutMs, coolTime] = args;
                return { ...commonProps, type, command, expect, timeoutMs, coolTime };
            case "create":
                const [config] = args;
                return { ...commonProps, type, config };
        }
    }

    private convertConfig(config: ServerConfig): ZodSafeParseResult<InstanceConfig> {
        return InstanceConfigSchema.safeParse(config);
    }
}