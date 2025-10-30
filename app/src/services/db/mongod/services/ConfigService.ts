import { InstanceConfRepo } from "../repositories/ConfigRepo";
import { InstanceConfig, InstanceConfigSchema, ServerConfig } from "../../../../obsidian/entities/instanceConfigSchema";
import crypto from 'crypto';
import stringify from 'json-stable-stringify';
import { logger } from "../../../log/logger";
import { InstanceRepo } from "../repositories/InstanceRepo";
import { generateRandomSuffix } from "../../../../utils/randomSuffix";

export class ConfigService {
    private configRepo: InstanceConfRepo = new InstanceConfRepo();
    private instanceRepo: InstanceRepo = new InstanceRepo();

    // サーバー設定をMongoDBに保存する
    public async registerAndPrepareConfig(config: ServerConfig, port: number): Promise<InstanceConfig | undefined> {
        const transformedConfig = InstanceConfigSchema.safeParse(config);

        if (!transformedConfig.success) {
            // データ変換で不具合が発生するとundefinedを返し処理を中断
            logger.warn(`Config parse failed: ${JSON.stringify(transformedConfig.error.issues, null, 2)}`);
            return undefined;
        } 

        const instanceConfig = transformedConfig.data;

        // 差分検知のためハッシュを作成。インスタンス名を除外し同じ設定がマッチしやすいように調整
        const { instanceName, ...otherConfs } = instanceConfig; 
        const hash = this.generateConfigHash(otherConfs);

        const saveConfResult = await this.configRepo.create(instanceConfig, hash); // MongoDBへ設定データを格納
        // インスタンスの基本情報をMongoDBに格納
        await this.instanceRepo.registerInstance(instanceName, saveConfResult._id, port, `${instanceName}-${generateRandomSuffix()}`);

        return instanceConfig;
    }

    // InstanceConfigをハッシュ化する関数
    private generateConfigHash(config: Object): string {
        const json = stringify(config) ?? '';
        return crypto.createHash('sha256').update(json).digest('hex');
    }
}