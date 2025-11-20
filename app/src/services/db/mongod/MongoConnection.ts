import mongoose from "mongoose";
import { logger } from "../../log/logger";

export class MongoConnection {
    private static instance: MongoConnection;

    private constructor() {}

    public static getInstance(): MongoConnection {
        if (!MongoConnection.instance) {
            MongoConnection.instance = new MongoConnection();
        }
        return MongoConnection.instance;
    }

    public async connect(url: string): Promise<void> {
        try {
            await mongoose.connect(url);
            logger.info('✅ MongoDBに正常に接続しました。');
        } catch(err) {
            const errorDetail = (err instanceof Error) ? err.message : String(err);
            logger.error(`❌ MongoDBへの接続に失敗しました。 詳細: ${errorDetail}`);
            throw err;
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await mongoose.disconnect();
            logger.info('🔌 MongoDBから正常に切断しました。');
        } catch(err) {
            const errorDetail = (err instanceof Error) ? err.message : String(err);
            logger.error(`MongoDBへの切断に失敗しました。 詳細: ${errorDetail}`);
        }
    }
}