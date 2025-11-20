import { createClient, RedisClientType } from 'redis';
import { logger } from '../../log/logger';

export class RedisClient {
    private static client: RedisClientType | null = null;

    public static async init(url: string): Promise<void> {
        if (this.client) return; // すでに初期化済み

        this.client = createClient({ url });

        this.client.on('connect', () => {
            logger.info('✅ Redisへ接続しました。');
        });

        this.client.on('error', (err) => {
            logger.error(`❌ Redisエラー 詳細: ${err.message}`);
        });

        await this.client.connect();
    }

    public static getClient(): RedisClientType {
        if (!this.client) {
            throw new Error('RedisClient が初期化されていません。init() を呼んでください。');
        }
        return this.client;
    }

    public static async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.quit();
            logger.info('🔌 Redisから切断しました。');
        }
    }
}
