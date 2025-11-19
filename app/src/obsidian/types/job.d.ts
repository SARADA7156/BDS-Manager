import { ServerConfig } from "../entities/instanceConfigSchema";

export type StartJob = {
    jobId: string;
    type: 'start';
    instanceName: string;
    executorType: 'user' | 'system';
    executedBy: string;
    createdAt: Date;
};

export type StopJob = {
    jobId: string;
    type: 'stop';
    instanceName: string;
    executorType: 'user' | 'system';
    executedBy: string;
    createdAt: Date;
};

export type RestartJob = {
    jobId: string;
    type: 'restart';
    instanceName: string;
    executorType: 'user' | 'system';
    executedBy: string;
    createdAt: Date;
};

export type CommandJob = {
    jobId: string;
    type: 'command';
    instanceName: string;
    executorType: 'user' | 'system';
    executedBy: string;
    createdAt: Date;
    command: string;
};

export type CreateJob = {
    jobId: string;
    type: 'create';
    instanceName: string;
    executorType: 'user' | 'system';
    executedBy: string;
    createdAt: Date;
    config: ServerConfig;
};

export type Job =
    | StartJob
    | StopJob
    | RestartJob
    | CommandJob
    | CreateJob;
