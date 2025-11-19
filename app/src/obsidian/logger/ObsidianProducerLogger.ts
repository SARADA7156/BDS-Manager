import { ObsidianLogger } from "./ObsidianLogger";

export interface IObsidianProducerLogger {
    info(message: string, context?: string): void;
    warn(message: string, context?: string): void;
    error(message: string, context?: string): void;
    debug(message: string, context?: string): void;
}

export class ObsidianProducerLogger implements IObsidianProducerLogger {
    constructor(
        private logger: ObsidianLogger
    ) {}

    private log(level: "info" | "warn" | "error" | "debug", message: string, context?: string) {
        const formatted = `[Producer] ${message}`;
        this.logger[level](formatted, context);
    }

    info(message: string, context?: string) { this.log("info", message, context); }
    warn(message: string, context?: string) { this.log("warn", message, context); }
    error(message: string, context?: string) { this.log("error", message, context); }
    debug(message: string, context?: string) { this.log("debug", message, context); }
}
