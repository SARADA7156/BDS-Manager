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
import { handler } from './services/cli/cliHandler';
import { DatabaseConnection } from "./services/db/mysqld/DatabaseConnection";
import apiRouter from './routes/apiRouter';
import { MongoConnection } from './services/db/mongod/MongoConnection';
import { ServiceContainer } from './containers/ServiceContainer';
import { Payload } from './types/jwt/payload';
import { initSocket } from './services/webSocket';
import { BullMQRedisClient } from './services/db/redis/BullmqRedisClient';
import { RedisClient } from './services/db/redis/RedisClient';

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
    await BullMQRedisClient.init({ host: host, port: port, password: pass });

    // 環境変数を読み込み
    const VERSION = process.env.VERSION!;
    const PORT = process.env.PORT!;

    const app = express();
    const services = new ServiceContainer(); // すべてのサービスをインスタンス化
    const httpServer = createServer(app);

    let serverDir: string = settings.serverDir;

    // 開発モードで起動しているかを確認しセットアップ
    if (isMode) {
        serverDir = settings.serverDirDev; // 開発モードで起動すると作業ディレクトリを変更
    }

    // ==== sessionの設定 ====
    app.use(
        session({
            secret: process.env.SESSION_SECRET || "default_secret",
            resave: false,
            saveUninitialized: true,
            cookie: {
                secure: false,
                maxAge: 60 * 60 * 1000,
            },
        })
    )

    // ==== 静的ファイル ====
    app.use(express.static(path.join(__dirname, '../public')));

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

    initSocket(httpServer, services.jwtService);

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