import { logger } from "../../../log/logger";
import { ConfigModel, IConfig } from "../models/configModel";

export class InstanceConfRepo {
    // インスタンスの設定を取得
    public async find(instanceName: string): Promise<IConfig | null> {
        return await ConfigModel.findOne({ instanceName: instanceName });
    }

    // インスタンスの設定を新規保存
    public async create(config: Partial<IConfig>, hash: string): Promise<IConfig> {
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
    }

    // インスタンスの設定をハッシュで検索
    private async findByHash(hash: string): Promise<IConfig | null> {
        return await ConfigModel.findOne({ hash: hash });
    }

}