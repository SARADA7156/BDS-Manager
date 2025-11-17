import { Logger } from "winston";

export interface ILogger {
    info(message: string, context?: string): void;
    warn(message: string, context?: string): void;
    error(message: string, context?: string): void;
    debug(message: string, context?: string): void;
}

export class ObsidianLogger implements ILogger {
    constructor(private baseLogger: Logger) {}

    private log(level: "info" | "warn" | "error" | "debug", message: string, context?: string) {
        const formatted = `[Obsidian] ${message}`;
        this.baseLogger[level](formatted, context || "CORE");
    }

    info(message: string, context?: string) { this.log("info", message, context); }
    warn(message: string, context?: string) { this.log("warn", message, context); }
    error(message: string, context?: string) { this.log("error", message, context); }
    debug(message: string, context?: string) { this.log("debug", message, context); }
}
