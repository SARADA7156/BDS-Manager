/*
    BDS Obsidianのすべての機能の統括部分
    Obsidianのすべての機能はこのクラスを介してでしか呼び出してはならない。
 */
import { ServerConfig } from "../entities/instanceConfigSchema";
import { CORE_STATUS } from "../errors/coreStatus";
import { isObsidianError } from "../errors/ObsidianError";
import { ReturnType } from "../types/ObsidianCore";
import { ServerJobQueue } from "../installer/ServerJobQueue";

export class ObsidianCore {
    private readonly queue: ServerJobQueue;

    constructor (
        queue: ServerJobQueue,
    ) {
        this.queue = queue;
    }

    public async createServer(serverConfig: ServerConfig): Promise<ReturnType> {
        try {
            return await this.queue.enqueue(serverConfig);
        } catch(error) {
            if (isObsidianError(error)) {
                return { result: false, code: error.code, message: `${error.message} | ${error.detail}`};
            }
            return { result: false, code: CORE_STATUS.INTERNAL_SERVER_ERROR, message: `Internal Obsidian Error: ${error}` };
        }
    }
}