import { ObsidianError } from "./ObsidianError";

export class ObsidianNetworkError extends ObsidianError {
    constructor(code: number, message: string, detail?: string) {
        super(code, message, detail);
    }
}

export function isObsidianNetworkError(error: unknown) {
    return error instanceof ObsidianNetworkError;
}