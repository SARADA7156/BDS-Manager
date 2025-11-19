import { IRedisClient } from "../../services/db/redis/RedisClient";
import { IObsidianProcessLogger } from "../logger/ObsidianProcessLogger";

export interface IRedisStateService {
    setServerState(instanceName: string, state: string): Promise<void>;
    getServerState(instanceName: string): Promise<string | null>;
}

export class RedisStateService implements IRedisStateService {
    constructor(private redis: IRedisClient, private logger: IObsidianProcessLogger) {};

    async setServerState(instanceName: string, state: string): Promise<void> {
        try {
            const client = this.redis.getClient();
            await client.set(`server:${instanceName}:state`, state);
        } catch(err) {
            const errorDetail = (err instanceof Error) ? err.message : String(err);
            this.logger.error(`Failed to update server status. detail: ${errorDetail}`);
        }
    }

    async getServerState(instanceName: string): Promise<string | null> {
        try {
            const client = this.redis.getClient();
            return client.get(`server:${instanceName}:state`);
        } catch(err) {
            const errorDetail = (err instanceof Error) ? err.message : String(err);
            this.logger.error(`Failed to retrieve server status. detail: ${errorDetail}`);
            return null;
        }
    }
}