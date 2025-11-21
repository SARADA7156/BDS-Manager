import { IServerProcessManager, ServerProcessManager } from "./ServerProcessManager";
import { serverBin } from '../../config/serverSettings.json';
import { ServerLogParser } from "../monitor/ServerLogParser";
import { IRestartPolicy, RestartPolicy } from "./RestartPolicy";
import { IObsidianProcessLogger, ObsidianProcessLogger } from "../logger/ObsidianProcessLogger";
import { ObsidianLogger } from "../logger/ObsidianLogger";
import { validatePath } from "../utils/validatePath";
import { ReturnType } from "../types/ObsidianCore";
import { CORE_STATUS } from "../errors/coreStatus";
import { bedrockPorts } from '../../config/serverSettings.json';

export interface IServerManager {
    buildInstance(instanceName: string, serverPath: string): ReturnType;
    getManager(instanceName: string): IServerProcessManager | undefined;
}

export class ServerManager implements IServerManager {
    private managers = new Map<string, IServerProcessManager>();
    private debug: boolean;
    private logger: ObsidianLogger;
    private projectRoot: string;

    constructor(debug: boolean, projectRoot: string, logger: ObsidianLogger) {
        this.debug = debug;
        this.projectRoot = projectRoot;
        this.logger = logger;
    }

    public buildInstance(instanceName: string, serverPath: string): ReturnType {
        if (this.managers.size >= bedrockPorts.length) {
            return { result: false, code: CORE_STATUS.MAX_INSTANCE, message: 'インスタンスの最大上限に達しています。' };
        }
        try {
            this.logger.info(`${instanceName}のServerProcessManagerをインスタンス化します。`);
            const logParser: ServerLogParser = new ServerLogParser(instanceName, this.debug);
            const restartPolicy: IRestartPolicy = new RestartPolicy();
            const processLogger: IObsidianProcessLogger = new ObsidianProcessLogger(instanceName, this.logger);

            const validPath = validatePath(this.projectRoot, serverPath, 'serverPath');

            this.managers.set(
                instanceName,
                new ServerProcessManager(
                    validPath,
                    serverBin,
                    instanceName,
                    logParser,
                    restartPolicy,
                    processLogger
                )
            );

            return { result: true, code: CORE_STATUS.SUCCESS, message: 'ProcessManagerは正常にインスタンス化されました。' };
        } catch(err) {
            const errorDetail = (err instanceof Error) ? err.message : String(err);
            return { result: false, code: CORE_STATUS.INTERNAL_SERVER_ERROR, message: `インスタンス化エラー: ${errorDetail}` };
        }
    }

    public async destroy(instanceName: string): Promise<ReturnType> {
        const manager = this.getManager(instanceName);

        if (!manager)
            return { result: false, code: CORE_STATUS.NOT_FOUND, message: `${instanceName}は存在しません。` };

        this.logger.info(`${instanceName}のServerProcessManagerをクリーンアップします。`);

        try {
            await manager.dispose(); // 全リスナー削除・子プロセス終了・タイマー解除
        } catch (err) {
            this.logger.error(`dispose中にエラー: ${String(err)}`);
        }

        this.managers.delete(instanceName);

        return {
            result: true,
            code: CORE_STATUS.SUCCESS,
            message: 'インスタンスは正常に削除されました。'
        };
    }

    public getManager(instanceName: string): IServerProcessManager | undefined {
        return this.managers.get(instanceName);
    }
}