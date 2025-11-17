import { logger as baseLogger } from "../../services/log/logger";
import { ObsidianLogger } from "../logger/ObsidianLogger";

export class ObsidianError extends Error {
    public readonly code: number;
    public readonly detail: string;
    private logger: ObsidianLogger;

    constructor(code: number, message: string, detail?: string) {
        super(message);
        this.code = code;
        this.name = new.target.name;
        this.detail = detail ?? '';
        this.logger = new ObsidianLogger(baseLogger)

        this.logger.error(`type: ${this.name}, code: ${code}, ${message} | ${detail ?? ''}`, );
    }
}

export function isObsidianError(error: unknown): error is ObsidianError {
    return error instanceof ObsidianError;
}