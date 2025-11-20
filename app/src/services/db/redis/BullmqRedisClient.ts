import { Redis } from 'ioredis';
import type { RedisOptions } from 'ioredis';
import { logger } from '../../log/logger';

export class BullMQRedisClient {
    private static client: Redis;

    public static async init(config: RedisOptions): Promise<void> {
        if (this.client) {
            return;
        }

        try {
            this.client = new Redis(config);

            this.client.on('connect', () => {
                logger.info('✅ [BullMQ] Redisへの接続が完了しました。');
            });

            this.client.on('error', (err: Error) => {
                logger.error(`❌ [BullMQ] Redisへの接続を確立できませんでした。 詳細: ${err.message}`);
            });

        } catch(err) {
            const errorDetail = (err instanceof Error) ? err.message : String(err);
            logger.info(`❌ [BullMQ] Redis接続エラー 詳細: ${errorDetail}`);
            throw err;
        }
    }

    public static getConnection(): Redis {
        if (!BullMQRedisClient.client) {
            throw new Error('Redisが初期化されていません。まずinit()を呼び出してください。');
        }
        return BullMQRedisClient.client;
    }

    public static async disconnect(): Promise<void> {
        if (BullMQRedisClient.client) {
            await BullMQRedisClient.client.quit();
            logger.info('🔌 [BullMQ] Redisから正常に切断しました。');
        }
    }
}