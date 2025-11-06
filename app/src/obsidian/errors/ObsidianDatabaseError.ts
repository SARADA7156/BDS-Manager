import { ObsidianError } from "./ObsidianError";

export class ObsidianDatabaseError extends ObsidianError {
    constructor(code: number, message: string, detail?: string) {
        super(code, message, detail);
    }
}