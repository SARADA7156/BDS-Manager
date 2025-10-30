/*
    BDS Obsidianのすべての機能の統括部分
    Obsidianのすべての機能はこのクラスを介してでしか呼び出してはならない。
 */
import { ServerManager } from "./ServerManager";
import { bedrockPorts } from '../../config/serverSettings.json';
import { logger } from "../../services/log/logger";
import { downloadBdsZip } from "../installer/downloader/downloadBdsZip";
import { extractZip } from "../utils/extractZip";
import { ServerConfig } from "../entities/instanceConfigSchema";

type Ports = {
    port: number;
    used: boolean;
}

export class ObsidianCore {
    private instance: Map<string, ServerManager> = new Map();

    // BDSが利用できるポート番号
    private ports: Ports[] = bedrockPorts.map((port) =>({
        port,
        used: false
    }));

    public async createServer(serverConfig: ServerConfig) {
        logger.info('Check the available port numbers.');

        const port = this.ports.filter(port => port.used === false);

        if (port.length <= 0) {
            // portが空配列だとインスタンスを作成するのに必要なポートがすべて利用されているため作成しない
            logger.error('The maximum number of instances has been reached.');
            return { result: false, code: 1 };
        }

        logger.info('Start creating an instance.');
        
    }
}