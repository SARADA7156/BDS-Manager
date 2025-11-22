import { InstanceConfig } from "../entities/instanceConfigSchema";

export type BaseJob = {
    jobId: string;
    instanceName: string;
    executorType: 'user' | 'system';
    executedBy: string;
    createdAt: Date;
};

export type StartJob = BaseJob & {
    type: 'start';
};

export type StopJob = BaseJob & {
    type: 'stop';
};

export type RestartJob = BaseJob & {
    type: 'restart';
};

export type CommandJob = BaseJob & {
    type: 'command';
    command: string;
    expect: string | RegExp;
    timeoutMs: number;
    coolTime: number
};

export type CreateJob = BaseJob & {
    type: 'create';
    config: InstanceConfig;
};

export type Job =
    | StartJob
    | StopJob
    | RestartJob
    | CommandJob
    | CreateJob;
