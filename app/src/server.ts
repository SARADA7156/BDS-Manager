import express, { ErrorRequestHandler } from 'express';
import session from 'express-session';
import cors from 'cors';
const cookiePerser = require('cookie-parser');
import { createServer } from 'http';
import path from 'path';
import dotenv from 'dotenv';
import readline from 'readline';
import settings from './config/serverSettings.json';
import { checkEnvironmentVariables } from './config/checkEnvironment';
import { checkStartMode } from './services/process/startMode';

export const isMode: boolean = checkStartMode(); // サーバーが開発モードかどうかの変数
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;

// .envファイルを読み込む
dotenv.config({ path: path.resolve(__dirname, `../../${envFile}`) });
checkEnvironmentVariables(settings.environment); // .envファイルにすべての環境変数が設定されているかを確認

console.log('setting up server logging...');
import { shutdown } from './services/process/shutdown';
import { logger } from './services/log/logger'; // ロガー関数をインポート
import { DatabaseConnection } from "./services/db/mysqld/DatabaseConnection";
import apiRouter from './routes/apiRouter';
import { MongoConnection } from './services/db/mongod/MongoConnection';
import { ServiceContainer } from './containers/ServiceContainer';
import { Payload } from './types/jwt/payload';
import { BullMQRedisClient } from './services/db/redis/BullmqRedisClient';
import { RedisClient } from './services/db/redis/RedisClient';
import { WebSocketManager } from './services/webSocket/WebSocketManager';

declare global {
    namespace Express {
        interface Request {
            services: import('./containers/ServiceContainer').ServiceContainer;
            user?: Payload;
        }
    }
}

declare module "express-session" {
    interface SessionData {
        LoggedInUser: string;
    }
}

export async function bootstrap() {
    // ==== MySQL初期化
    await DatabaseConnection.init({
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.USER_PASSWORD,
        database: process.env.DATABASE,
        port: Number(process.env.DB_PORT!),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    });

    // MongoDB初期化
    const mongodb = MongoConnection.getInstance();
    await mongodb.connect(process.env.MONGO_URL!);

    // Redis初期化
    const host = process.env.REDIS_HOST;
    const port = Number(process.env.REDIS_PORT);
    const pass = process.env.REDIS_PASSWORD;
    await RedisClient.init(`redis://:${pass}@${host}:${port}`);
    await BullMQRedisClient.init({ host: host, port: port, password: pass, maxRetriesPerRequest: null });

    // 環境変数を読み込み
    const VERSION = process.env.VERSION!;
    const PORT = process.env.PORT!;

    const app = express();
    const services = new ServiceContainer(); // すべてのサービスをインスタンス化
    const httpServer = createServer(app);

    // ==== Expressの基本設定 ====

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json()); // jsonボディをパースするためのミドルウェアを設定
    app.use(cookiePerser());

    app.use(cors({
        origin: 'http://localhost:5173',
        credentials: true,
    }));

    app.use((req, res, next) => {
        req.services = services;
        next();
    });

    app.use('/api', apiRouter);

    WebSocketManager.init(httpServer, services.jwtService);
    services.WorkerBootstrap.start(); // キューワーカーをスタート

    // 終了シグナルをキャッチするとサーバーをシャットダウン
    process.on('SIGINT', () => shutdown(httpServer, mongodb));
    process.on('SIGTERM', () => shutdown(httpServer, mongodb));

    try {
        logger.info('Starting Server');
        logger.info(`version ${VERSION}`);
        logger.info(`Development mode: ${isMode}`);
        logger.info(`Server PID: ${process.pid}`);

        httpServer.listen(PORT, () => {
            logger.info(`Http Server use port: ${PORT}`);
            logger.info('Server started.');
        });

        httpServer.on("error", (err) => {
            logger.error(`HTTP server error: ${err instanceof Error ? err.message : String(err)}`);
            throw new Error(err instanceof Error ? err.message : String(err))
        });
    } catch(err) {
        logger.error("Server startup failed.", { error: err });
        throw new Error(`Fatal Error: ${err}`);
    }
}

bootstrap().catch((err) => {
    console.error('Failed to start server: ', err);
    process.exit(1);
});