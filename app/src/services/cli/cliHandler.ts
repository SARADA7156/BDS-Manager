import { Server } from "http";
// import { NotificationManager } from "../../minecraft/commands/NotificationManager";
// import { ServerManager } from "../../minecraft/ServerManager";
// import { FullBackup } from "../../minecraft/worldUtils/FullBackup";
import { logger } from "../log/logger";
import { shutdown } from "../process/shutdown";
import { Interface } from "readline";
import { MongoConnection } from "../db/mongod/MongoConnection";

export async function handler(httpServer: Server, rl: Interface, command: string, mongodb: MongoConnection /*manager: ServerManager, notifier: NotificationManager, fullBackup: FullBackup*/): Promise<void> {
    switch(command) {
        case 'stop':
            shutdown(httpServer, rl, mongodb);
            break;
        // case 'mcstart':
        //     manager.start();
        //     break;
        // case 'mcstop':
        //     await manager.stop();
        //     break;
        // case 'mcrestart':
        //     await manager.restart();
        //     break;
        // case 'mcnotice':
        //     notifier.sendAlert('サーバーshellから意図的に通知を飛ばしました。', 'note.pling');
        //     break;
        // case 'mcbackup':
        //     await fullBackup.executeBackup();
        //     break;
        default:
            logger.warn(`non-existent query: \"${command}\"`);
    }
}