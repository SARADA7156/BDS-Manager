import { logger } from "../../../log/logger";
import { ConfigModel, IConfig } from "../models/configModel";

export class InstanceConfRepo {
    // インスタンスの設定を取得
    public async find(instanceName: string): Promise<IConfig | null> {
        try {
            return await ConfigModel.findOne({ instanceName: instanceName });
        } catch(err) {
            logger.error(`Error finding instance config ${instanceName}:`, err);
            throw err;
        }
    }

    // インスタンスの設定を新規保存
    public async create(config: Partial<IConfig>, hash: string): Promise<IConfig> {
        try {
            const existing = await this.findByHash(hash);
            if (existing) {
                logger.info(`Reuse existing settings. configId: ${existing._id}`);
                return existing;
            }

            // 同じ設定がない場合は新しく保存する。
            return await ConfigModel.create({
                ...config,
                hash,
            });
        } catch(err) {
            logger.error(`Error saving instance config:`, err);
            throw err;
        }
    }

    // インスタンスの設定をハッシュで検索
    private async findByHash(hash: string): Promise<IConfig | null> {
        return await ConfigModel.findOne({ hash: hash });
    }

}