import { ObsidianError } from "./ObsidianError";

export class ObsidianSecurityError extends ObsidianError {
    constructor(code: number, message: string, detail?: string) {
        super(code, message, detail);
    }
}