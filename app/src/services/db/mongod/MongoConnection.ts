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
            logger.info('✅ Connection to the MongoDB successfully.');
        } catch(err) {
            logger.error('❌ MongoDB connection error:', err);
            throw err;
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await mongoose.disconnect();
            logger.info('🔌 MongoDB disconnected...');
        } catch(err) {
            logger.error('❌ Error disconnecting MongoDB:', err);
        }
    }
}