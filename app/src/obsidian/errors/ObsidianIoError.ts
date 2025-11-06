import { ObsidianError } from "./ObsidianError";

export class ObsidianIOError extends ObsidianError {
    constructor(code: number, message: string, detail?: string) {
        super(code, message, detail);
    }
}

export function isObsidianIOError(error: unknown) {
    return error instanceof ObsidianIOError;
}