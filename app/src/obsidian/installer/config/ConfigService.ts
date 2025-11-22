import { InstanceConfRepo } from "../../../services/db/mongod/repositories/ConfigRepo";
import { InstanceConfig } from "../../entities/instanceConfigSchema";
import crypto from 'crypto';
import stringify from 'json-stable-stringify';
import { InstanceRepo } from "../../../services/db/mongod/repositories/InstanceRepo";
import { generateRandomSuffix } from "../../../utils/randomSuffix";
import { isObsidianError } from "../../errors/ObsidianError";
import { ObsidianDatabaseError } from "../../errors/ObsidianDatabaseError";
import { CORE_STATUS } from "../../errors/coreStatus";
import { ObsidianLogger } from "../../logger/ObsidianLogger";

export interface IConfigService {
    registerAndPrepareConfig: (config: InstanceConfig, port: number) => Promise<void>;
}

export class ConfigService implements IConfigService {
    private configRepo: InstanceConfRepo;
    private instanceRepo: InstanceRepo;

    constructor(private logger: ObsidianLogger, configRepo: InstanceConfRepo, instanceRepo: InstanceRepo) {
        this.configRepo = configRepo;
        this.instanceRepo = instanceRepo;
    }

    // サーバー設定をMongoDBに保存する
    public async registerAndPrepareConfig(config: InstanceConfig, port: number): Promise<void> {
        try {
            // インスタンス名を除外し同じ設定がマッチしやすいように調整
            const { instanceName, ...otherConfs } = config; 
            const hash = this.generateConfigHash(otherConfs);

            const saveConfResult = await this.configRepo.create(config, hash); // MongoDBへ設定データを格納

            // インスタンスの基本情報をMongoDBに格納
            await this.instanceRepo.registerInstance(instanceName, saveConfResult._id, port, `${instanceName}-${generateRandomSuffix()}`);
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