import { Logger } from "winston";

interface ILogger {
    info(message: string, context?: string): void;
    warn(message: string, context?: string): void;
    error(message: string, context?: string): void;
}

export class ObsidianLogger implements ILogger {
    constructor(private baseLogger: Logger) {}

    info(message: string, context?: string): void {
        const obsidianMessage = `[Obsidian] ${message}`;
        this.baseLogger.info(obsidianMessage, context || 'CORE');
    }

    warn(message: string, context?: string): void {
        const obsidianMessage = `[Obsidian] ${message}`;
        this.baseLogger.warn(obsidianMessage, context || 'CORE');
    }

    error(message: string, context?: string): void {
        const obsidianMessage = `[Obsidian] ${message}`;
        this.baseLogger.error(obsidianMessage, context || 'CORE');
    }
}