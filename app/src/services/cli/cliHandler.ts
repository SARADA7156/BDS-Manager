import { Server } from "http";
// import { NotificationManager } from "../../minecraft/commands/NotificationManager";
// import { ServerManager } from "../../minecraft/ServerManager";
// import { FullBackup } from "../../minecraft/worldUtils/FullBackup";
import { logger } from "../log/logger";
import { shutdown } from "../process/shutdown";
import { Interface } from "readline";
import { MongoConnection } from "../db/mongod/MongoConnection";

export async function handler(httpServer: Server, rl: Interface, command: string, mongodb: MongoConnection): Promise<void> {
    switch(command) {
        case 'stop':
            shutdown(httpServer, rl, mongodb);
            break;
        default:
            logger.warn(`non-existent query: \"${command}\"`);
    }
}