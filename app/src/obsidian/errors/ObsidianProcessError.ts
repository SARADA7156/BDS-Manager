import { ObsidianError } from "./ObsidianError";

export class ObsidianProcessError extends ObsidianError {
    constructor(code: number, message: string, detail?: string) {
        super(code, message, detail);
    }
}

export function isObsidianProcessError(error: unknown) {
    return error instanceof ObsidianProcessError;
}