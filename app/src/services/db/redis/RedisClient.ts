import { createClient, RedisClientType } from 'redis';

export interface IRedisClient {
    connect(): Promise<RedisClientType>;
    getClient(): RedisClientType;
    disconnect(): Promise<void>;
}

export class RedisClient implements IRedisClient {
    private client: RedisClientType;

    constructor(private url: string) {
        this.client = createClient({ url });
    }

    async connect(): Promise<RedisClientType> {
        if (!this.client.isOpen) {
            await this.client.connect();
        }
        return this.client;
    }

    getClient(): RedisClientType {
        return this.client;
    }

    async disconnect(): Promise<void> {
        if (this.client.isOpen) {
            await this.client.quit();
        }
    }
}