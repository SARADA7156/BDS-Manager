import { Server } from "http";
// import { ServerManager } from "../../minecraft/ServerManager";
import { DatabaseConnection } from "../db/mysqld/DatabaseConnection";
import { logger } from "../log/logger";
import { Interface } from 'readline';
import { MongoConnection } from "../db/mongod/MongoConnection";
import { BullMQRedisClient } from "../db/redis/BullmqRedisClient";
import { RedisClient } from "../db/redis/RedisClient";

// ==== アプリを正常終了させる ====
export async function shutdown (httpServer: Server, rl: Interface, mongodb: MongoConnection): Promise<void> {
    logger.info('Server stop requested.');
    logger.info('Stopping server...');

    await DatabaseConnection.disconnect(); // MySQLから切断
    await mongodb.disconnect() // MongoDBから切断
    await BullMQRedisClient.disconnect(); // Redisから切断(BullMQ)
    await RedisClient.disconnect(); // Redisから切断(通常版)
    rl.close(); // CLIを閉じる
    httpServer.close(() => {
        logger.info('Quit correctly');
        process.exit(0);
    });
}
