import { ObsidianError } from "./ObsidianError";

export class ObsidianParamError extends ObsidianError {
    constructor(code: number, message: string, detail?: string) {
        super(code, message, detail);
    }
}