import { ServerConfig } from "../entities/instanceConfigSchema";
import { CORE_STATUS } from "../errors/coreStatus";
import { ConfigService } from "./config/ConfigService";
import { ReturnType } from "../types/ObsidianCore";
import { ObsidianPortManager } from "../core/ObsidianPortManager";
import { ObsidianLogger } from "../core/ObsidianLogger";
import { ObsidianParamError } from "../errors/ObsidianParamError";
import { BdsDownloadService } from "./downloader/BdsDownloadService";

interface IServerCreator {
    create(serverConfig: ServerConfig): Promise<ReturnType>;
}

export class SaverCreator implements IServerCreator {
    constructor(
        private portManager: ObsidianPortManager,
        private confService: ConfigService,
        private downloader: BdsDownloadService,
        private logger: ObsidianLogger,
    ) {}

    public async create(serverConfig: ServerConfig): Promise<ReturnType> {
        try {
            // 利用可能なポートを取得
            const port = this.portManager.reserveAvailablePort();
            if (!port) {
                // 利用可能なポートがない場合はその後の処理を行わない。
                this.logger.error('No available ports.');
                return { result: false, code: CORE_STATUS.MAX_INSTANCE, message: 'Maximum number of instances.'};
            }

            // MongoDBへ保存し、フォーマットしたログを取得
            const config = await this.confService.registerAndPrepareConfig(serverConfig, port);
            if (!config) {
                this.logger.error('The instance settings data format is incorrect.')
                throw new ObsidianParamError(CORE_STATUS.BAT_REQUEST, 'Config format Error.', 'The data format of the configuration file is different.');
            }

            // ファイルを一時ファイルにダウンロードして展開
            this.downloader.downloadAndExtract();

            return { result: true, code: CORE_STATUS.SUCCESS, message: 'Instance creation complete.' };
        } catch(err) {
            return { result: false, code: CORE_STATUS.INTERNAL_SERVER_ERROR, message: `Internal Obsidian Error: ${err}` };
        }
    }
}