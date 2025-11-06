/*
    BDS Obsidianのすべての機能の統括部分
    Obsidianのすべての機能はこのクラスを介してでしか呼び出してはならない。
 */
import { ServerManager } from "./ServerManager";
import { bedrockPorts } from '../../config/serverSettings.json';
import { logger } from "../../services/log/logger";
import { ServerConfig } from "../entities/instanceConfigSchema";
import { ConfigService } from "../installer/config/ConfigService";
import { CORE_STATUS } from "../errors/coreStatus";
import { ObsidianParamError } from "../errors/ObsidianParamError";
import { isObsidianError } from "../errors/ObsidianError";

type Ports = {
    port: number;
    used: boolean;
}

interface ReturnType {
    result: boolean;
    code: number;
    message: string;
}

export class ObsidianCore {
    private instance: Map<string, ServerManager> = new Map();
    private confService: ConfigService = new ConfigService();

    // BDSが利用できるポート番号
    private ports: Ports[] = bedrockPorts.map((port) =>({
        port,
        used: false
    }));

    public async createServer(serverConfig: ServerConfig): Promise<ReturnType> {
        try {
            logger.info('Check the available port numbers.');

            const ports = this.ports.filter(port => port.used === false);

            if (ports.length <= 0) {
                // portが空配列だとインスタンスを作成するのに必要なポートがすべて利用されているため作成しない
                logger.error('The maximum number of instances has been reached.');
                return { result: false, code: 2, message: 'Maximum number of instances' };
            }

            logger.info('Start creating an instance.');
            logger.info('Save config data to the database.');

            // MongoDBにサーバー設定と基本情報を保存
            const parseConfig = await this.confService.registerAndPrepareConfig(serverConfig, ports[0].port);

            if (!parseConfig) {
                logger.error('The instance settings data format is incorrect.');
                throw new ObsidianParamError(CORE_STATUS.BAT_REQUEST, 'Config format Error.', 'The data format of the configuration file is different.');
            }

            logger.info('Instance settings saved successfully.');
            // 以下にサーバーをダウンロードして設定を書き換える処理を行う。

            

            return { result: true, code: CORE_STATUS.SUCCESS, message: 'Instance creation complete.' };
        } catch(error) {
            if (isObsidianError(error)) {
                return { result: false, code: error.code, message: `${error.message} | ${error.detail}`};
            }
            return { result: false, code: CORE_STATUS.INTERNAL_SERVER_ERROR, message: `Internal Obsidian Error: ${error}` };
        }
    }
}