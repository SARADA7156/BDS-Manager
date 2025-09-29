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
            logger.info('✅ Connection to the MySQL successfully.')
        } catch (error) {
            logger.error('❌ Failed to connect to the database:', error);
            throw error;
        }
    }

    public static getPool(): mysql.Pool {
        if (!DatabaseConnection.pool) {
            throw new Error('Database not initialized. Call init() first.');
        }
        return DatabaseConnection.pool;
    }

    public static async getConnection(): Promise<mysql.PoolConnection> {
        return this.getPool().getConnection();
    }

    public static async disconnect(): Promise<void> {
        if (DatabaseConnection.pool) {
            await DatabaseConnection.pool.end();
            logger.info('🔌 MySQL disconnected...');
        }
    }
}