import { ObsidianError } from "./ObsidianError";

export class ObsidianParamError extends ObsidianError {
    constructor(code: number, message: string, detail?: string) {
        super(code, message, detail);
    }
}

export function isObsidianParamError(error: unknown) {
    return error instanceof ObsidianParamError;
}