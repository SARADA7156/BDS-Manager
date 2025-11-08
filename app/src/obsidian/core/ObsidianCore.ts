/*
    BDS Obsidianのすべての機能の統括部分
    Obsidianのすべての機能はこのクラスを介してでしか呼び出してはならない。
 */
import { ServerManager } from "./ServerManager";
import { bedrockPorts } from '../../config/serverSettings.json';
import { ServerConfig } from "../entities/instanceConfigSchema";
import { ConfigService } from "../installer/config/ConfigService";
import { CORE_STATUS } from "../errors/coreStatus";
import { isObsidianError } from "../errors/ObsidianError";
import { Ports, ReturnType } from "../types/ObsidianCore";
import { ObsidianLogger } from "./ObsidianLogger";
import { logger } from "../../services/log/logger";

export class ObsidianCore {
    private logger: ObsidianLogger = new ObsidianLogger(logger);
    private instance: Map<string, ServerManager> = new Map();
    private confService: ConfigService = new ConfigService(this.logger);

    // BDSが利用できるポート番号
    private ports: Ports[] = bedrockPorts.map((port) =>({
        port,
        used: false
    }));

    public async createServer(serverConfig: ServerConfig): Promise<ReturnType> {
        try {

            

            return { result: true, code: CORE_STATUS.ACCEPTED, message: 'The instance creation has been accepted.' };
        } catch(error) {
            if (isObsidianError(error)) {
                return { result: false, code: error.code, message: `${error.message} | ${error.detail}`};
            }
            return { result: false, code: CORE_STATUS.INTERNAL_SERVER_ERROR, message: `Internal Obsidian Error: ${error}` };
        }
    }
}