import { InstanceConfRepo } from "../../../services/db/mongod/repositories/ConfigRepo";
import { InstanceConfig, InstanceConfigSchema, ServerConfig } from "../../entities/instanceConfigSchema";
import crypto from 'crypto';
import stringify from 'json-stable-stringify';
import { InstanceRepo } from "../../../services/db/mongod/repositories/InstanceRepo";
import { generateRandomSuffix } from "../../../utils/randomSuffix";
import { isObsidianError } from "../../errors/ObsidianError";
import { ObsidianDatabaseError } from "../../errors/ObsidianDatabaseError";
import { ObsidianParamError } from "../../errors/ObsidianParamError";
import { CORE_STATUS } from "../../errors/coreStatus";
import { ObsidianLogger } from "../../logger/ObsidianLogger";

export interface IConfigService {
    registerAndPrepareConfig: (config: ServerConfig, port: number) => Promise<InstanceConfig | undefined>;
}

export class ConfigService implements IConfigService {
    private configRepo: InstanceConfRepo;
    private instanceRepo: InstanceRepo;

    constructor(private logger: ObsidianLogger, configRepo: InstanceConfRepo, instanceRepo: InstanceRepo) {
        this.configRepo = configRepo;
        this.instanceRepo = instanceRepo;
    }

    // サーバー設定をMongoDBに保存する
    public async registerAndPrepareConfig(config: ServerConfig, port: number): Promise<InstanceConfig | undefined> {
        try {
            const transformedConfig = InstanceConfigSchema.safeParse(config);

            if (!transformedConfig.success) {
                // データ変換で不具合が発生するとundefinedを返し処理を中断
                this.logger.warn(`Config parse failed: ${JSON.stringify(transformedConfig.error.issues, null, 2)}`);
                throw new ObsidianParamError(CORE_STATUS.BAT_REQUEST, 'Config format Error.', 'The data format of the configuration file is different.')
            }

            const instanceConfig = transformedConfig.data;

            // 差分検知のためハッシュを作成。インスタンス名を除外し同じ設定がマッチしやすいように調整
            const { instanceName, ...otherConfs } = instanceConfig; 
            const hash = this.generateConfigHash(otherConfs);

            const saveConfResult = await this.configRepo.create(instanceConfig, hash); // MongoDBへ設定データを格納

            // インスタンスの基本情報をMongoDBに格納
            await this.instanceRepo.registerInstance(instanceName, saveConfResult._id, port, `${instanceName}-${generateRandomSuffix()}`);
            return instanceConfig;
        } catch(error) {
            if (isObsidianError(error)) {
                throw error;
            }
            throw new ObsidianDatabaseError(CORE_STATUS.INTERNAL_SERVER_ERROR, 'Database processing error.', 'An error occurred while saving data to the database.');
        }
    }

    // InstanceConfigをハッシュ化する関数
    private generateConfigHash(config: Object): string {
        const json = stringify(config) ?? '';
        return crypto.createHash('sha256').update(json).digest('hex');
    }
}