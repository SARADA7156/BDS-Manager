import { IServerProcessManager, ServerProcessManager } from "./ServerProcessManager";
import { serverBin } from '../../config/serverSettings.json';
import { ServerLogParser } from "../monitor/ServerLogParser";
import { IRestartPolicy, RestartPolicy } from "./RestartPolicy";
import { IObsidianProcessLogger, ObsidianProcessLogger } from "../logger/ObsidianProcessLogger";
import { ObsidianLogger } from "../logger/ObsidianLogger";

export interface IServerManager {
    buildInstance(instanceName: string): void;
    getManager(instanceName: string): IServerProcessManager | undefined;
}

export class ServerManager implements IServerManager {
    private managers = new Map<string, IServerProcessManager>();
    private debug: boolean;
    private logger: ObsidianLogger;

    constructor(debug: boolean, logger: ObsidianLogger) {
        this.debug = debug;
        this.logger = logger;
    }

    public buildInstance(instanceName: string): void {
        const logParser: ServerLogParser = new ServerLogParser(instanceName, this.debug);
        const restartPolicy: IRestartPolicy = new RestartPolicy();
        const processLogger: IObsidianProcessLogger = new ObsidianProcessLogger(instanceName, this.logger);

        this.managers.set(
            instanceName,
            new ServerProcessManager(
                '',
                serverBin,
                instanceName,
                logParser,
                restartPolicy,
                processLogger
            )
        );
    }



    public getManager(instanceName: string): IServerProcessManager | undefined {
        return this.managers.get(instanceName);
    }
}