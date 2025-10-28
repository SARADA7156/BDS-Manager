import { logger } from "../../services/log/logger";

export class ServerLogger {
    instanceName: string;

    constructor(instanceName: string) {
        this.instanceName = instanceName
    }

    info(log: string): void {
        logger.info(`${this.instanceName} ${log}`);
    }

    warn(log: string): void {
        logger.warn(`${this.instanceName} ${log}`);
    }

    error(log: string, err?: Error): void {
        logger.error(`${this.instanceName} ${log}`, err ? err : '');
    }

}