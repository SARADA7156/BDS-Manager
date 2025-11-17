import { InstanceConfig, ServerConfig } from "../entities/instanceConfigSchema";
import { CORE_STATUS } from "../errors/coreStatus";
import { ConfigService } from "./config/ConfigService";
import { ReturnType } from "../types/ObsidianCore";
import { ObsidianPortManager } from "../core/ObsidianPortManager";
import { ObsidianLogger } from "../logger/ObsidianLogger";
import { ObsidianParamError } from "../errors/ObsidianParamError";
import { BdsDownloadService } from "./downloader/BdsDownloadService";
import { IObsidianIOService } from "../utils/ObsidianOIService";
import { generateRandomSuffix } from "../../utils/randomSuffix";
import { IBdsPropertiesService } from "./config/BdsPropertiesService";
import { ServerProcessManager } from "../core/ServerProcessManager";
import { validatePath } from "../utils/validatePath";
import { RestartPolicy } from "../core/RestartPolicy";
import { ServerLogParser } from "../monitor/ServerLogParser";
import { ObsidianProcessLogger } from "../logger/ObsidianProcessLogger";

export interface IServerCreator {
    create(serverConfig: ServerConfig): Promise<ReturnType>;
}

export class ServerCreator implements IServerCreator {
    #reservedPort: number | undefined;
    constructor(
        private portManager: ObsidianPortManager,
        private confService: ConfigService,
        private downloader: BdsDownloadService,
        private io: IObsidianIOService,
        private writer: IBdsPropertiesService,
        private logger: ObsidianLogger,
        private readonly instanceDir: string,
        private readonly projectRoot: string
    ) {}

    public async create(serverConfig: ServerConfig): Promise<ReturnType> {
        this.#reservedPort = undefined;
        try {
            // 利用可能なポートを取得
            const port = this.#reservePort();
            if (!port) {
                // 利用可能なポートがない場合はその後の処理を行わない。
                this.logger.error('No available ports.');
                return { result: false, code: CORE_STATUS.MAX_INSTANCE, message: 'Maximum number of instances.'};
            }
            this.#reservedPort = port;

            this.logger.info(`The port used by the [${serverConfig.instanceName}] is ${this.#reservedPort}.`);

            // 設定保存フェーズ
            const config: InstanceConfig = await this.#registerConfig(serverConfig, this.#reservedPort);

            // I/Oフェーズ
            await this.#downloadAndCopyAssets(config.instanceName);

            // 設定書き込み
            await this.#writeServerProperties(config, this.#reservedPort, config.instanceName);

            // 試験的にbedrock_serverを起動(絶対に消すこと)
            const serverPath = validatePath(this.projectRoot, `${this.instanceDir}/${config.instanceName}/`, 'server_bin')
            const manager = new ServerProcessManager(
                serverPath,
                './bedrock_server',
                config.instanceName,
                new ServerLogParser(config.instanceName, true),
                new RestartPolicy(),
                new ObsidianProcessLogger(config.instanceName, this.logger)
            );

            await manager.start();

            setTimeout(async () => {
                await manager.stop();
            }, 7000);

            return { result: true, code: CORE_STATUS.SUCCESS, message: 'Instance creation complete.' };
        } catch(err) {
            this.#handleCreationError(err);
            return { result: false, code: CORE_STATUS.INTERNAL_SERVER_ERROR, message: `Internal Obsidian Error: ${err}` };
        }
    }

    #reservePort(): number | null {
        return this.portManager.reserveAvailablePort();
    }

    async #registerConfig(serverConfig: ServerConfig, port: number): Promise<InstanceConfig> {
        // インスタンス名にランダムな文字列をつける
        serverConfig.instanceName = `${serverConfig.instanceName}-${generateRandomSuffix()}`;

        // MongoDBへ保存し、フォーマットした設定を取得
        const config: InstanceConfig | undefined = await this.confService.registerAndPrepareConfig(serverConfig, port);
        if (!config) {
            this.logger.error('The instance settings data format is incorrect.')
            throw new ObsidianParamError(CORE_STATUS.BAT_REQUEST, 'Config format Error.', 'The data format of the configuration file is different.');
        }
        return config;
    }

    async #downloadAndCopyAssets(instanceName: string): Promise<void> {
        // ファイルを一時ファイルにダウンロードして展開
        await this.downloader.downloadAndExtract();

        const serverDir = `${this.instanceDir}/${instanceName}/`;

        // BDSのアセットをインスタンス専用のディレクトリへコピー
        this.logger.info(`Copy BDS assets to the instance directory: ${serverDir}`);
        const startTime = Date.now(); // 時間計測開始
        await this.io.copyDir('app/src/obsidian/installer/tmp', serverDir); // コピー
        const endTime = Date.now();
        this.logger.info(`Copy complete. (${(endTime - startTime) / 1000} seconds)`);

        await this.io.chmod(`${serverDir}/bedrock_server`, 0o755);
    }

    async #writeServerProperties(config: InstanceConfig, port: number, instanceName: string): Promise<void> {
        // server.propertiesファイルを編集する
        const propertiesFile = `${this.instanceDir}/${instanceName}/server.properties`;
        this.logger.info('Modify server.properties...');
        await this.writer.setProperty({...config, port}, propertiesFile);
    }

    #handleCreationError(err: unknown): void {
        this.logger.error(`Creation failed: ${err}`);
        // ポートが予約されていたら必ず開放する
        if (this.#reservedPort) {
            this.portManager.releasePort(this.#reservedPort);
            this.logger.warn(`Reserved port ${this.#reservedPort} released due to error.`);
        }
    }
}