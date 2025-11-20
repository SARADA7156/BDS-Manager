import mysql from 'mysql2/promise';
import { logger } from '../../log/logger';

export class DatabaseConnection {
    private static pool: mysql.Pool;

    public static async init(config: mysql.PoolOptions): Promise<void> {
        if (!DatabaseConnection.pool) {
            DatabaseConnection.pool = mysql.createPool(config);
        }

        // 接続テスト
        try {
            const conn = await DatabaseConnection.pool.getConnection();
            await conn.ping();
            conn.release();
            logger.info('✅ MySQLへ正常に接続しました。');
        } catch (error) {
            const errorDetail = (error instanceof Error) ? error.message : String(error);
            logger.error(`❌ MySQLへの接続に失敗しました。 詳細: ${errorDetail}`);
            throw error;
        }
    }

    public static getPool(): mysql.Pool {
        if (!DatabaseConnection.pool) {
            throw new Error('データベースが初期化されていません。まずinit()を呼び出してください。');
        }
        return DatabaseConnection.pool;
    }

    public static async getConnection(): Promise<mysql.PoolConnection> {
        return this.getPool().getConnection();
    }

    public static async disconnect(): Promise<void> {
        if (DatabaseConnection.pool) {
            await DatabaseConnection.pool.end();
            logger.info('🔌 MySQLから正常に切断しました。');
        }
    }
}