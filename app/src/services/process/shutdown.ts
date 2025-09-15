import { Server } from "http";
// import { ServerManager } from "../../minecraft/ServerManager";
import { DatabaseConnection } from "../db/mysqld/DatabaseConnection";
import { logger } from "../log/logger";
import { Interface } from 'readline';
import { MongoConnection } from "../db/mongod/MongoConnection";

// ==== アプリを正常終了させる ====
export async function shutdown (httpServer: Server, rl: Interface, mongodb: MongoConnection): Promise<void> {
    logger.info('Server stop requested.');
    logger.info('Stopping server...');

    // await manager.stop(); // マインクラフト統合版サーバーを停止
    await DatabaseConnection.disconnect(); // MySQLから切断
    await mongodb.disconnect() // MongoDBから切断
    rl.close(); // CLIを閉じる
    httpServer.close(() => {
        logger.info('Quit correctly');
        process.exit(0);
    });
}
