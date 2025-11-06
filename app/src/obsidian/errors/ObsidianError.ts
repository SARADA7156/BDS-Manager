import { logger } from "../../services/log/logger";

export class ObsidianError extends Error {
    public readonly code: number;
    public readonly detail: string;

    constructor(code: number, message: string, detail?: string) {
        super(message);
        this.code = code;
        this.name = new.target.name;
        this.detail = detail ?? '';

        logger.error(`[Obsidian: ${this.name}] code: ${code}, ${message} | ${detail ?? ''}`, );
    }
}

export function isObsidianError(error: unknown): error is ObsidianError {
    return error instanceof ObsidianError;
}