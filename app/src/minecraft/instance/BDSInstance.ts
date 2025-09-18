import { ChildProcessWithoutNullStreams } from "child_process";
import { logger } from "../../services/log/logger";

export class BDSInstance {
    constructor(
        public id: string,
        public name: string,
        public path: string,
        public process: ChildProcessWithoutNullStreams | null,
    ) {}

    public start() {
        logger.info(`The [${this.name}] server has started.`);
    }

    public stop() {
        logger.info(`The [${this.name}] server has stopped.`);
    }

    public sendCommand(cmd: string) {
        logger.info(`Sent the command: ${cmd}`);
    }
}