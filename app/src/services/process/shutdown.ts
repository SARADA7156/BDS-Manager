import { Server } from "http";
// import { ServerManager } from "../../minecraft/ServerManager";
import { DatabaseConnection } from "../db/mysqld/DatabaseConnection";
import { logger } from "../log/logger";
import { Interface } from 'readline';

// ==== アプリを正常終了させる ====
export async function shutdown (/*manager: ServerManager, */httpServer: Server, rl: Interface): Promise<void> {
    logger.info('Server stop requested.');
    logger.info('Stopping server...');

    // await manager.stop(); // マインクラフト統合版サーバーを停止
    await DatabaseConnection.disconnect(); // MySQLから切断
    rl.close(); // CLIを閉じる
    httpServer.close(() => {
        logger.info('Quit correctly');
        process.exit(0);
    });
}
