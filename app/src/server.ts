import express, { ErrorRequestHandler } from 'express';
import session from 'express-session';
import { createServer } from 'http';
import livereload from 'livereload';
import connectLivereload from 'connect-livereload';
import path from 'path';
import ejs from 'ejs';
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
import pageRouter from './routes/PageRouter';
import apiRouter from './routes/apiRouter';
import { MongoConnection } from './services/db/mongod/MongoConnection';

declare global {
    namespace Express {
        interface Request {
            // manager: ServerManager;
            // fullBackup: FullBackup;
            // rsyncBackup: RsyncBackup;
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

    const mongodb = MongoConnection.getInstance();
    await mongodb.connect(process.env.MONGO_URL!);

    // 環境変数を読み込み
    const VERSION = process.env.VERSION!;
    const PORT = process.env.PORT!;
    const WEBHOOK_URL = process.env.WEBHOOK_URL!;

    const app = express();
    const httpServer = createServer(app);

    let serverDir: string = settings.serverDir;

    // 開発モードで起動しているかを確認しセットアップ
    if (isMode) {
        serverDir = settings.serverDirDev; // 開発モードで起動すると作業ディレクトリを変更
        // ==== LiveReload 設定 ====
        const liveReloadServer = livereload.createServer({
            exts: ['ejs', 'css', 'js', 'html']
        });
        liveReloadServer.watch(path.join(__dirname, 'views'));
        liveReloadServer.watch(path.join(__dirname, '../public/css'));
        liveReloadServer.watch(path.join(__dirname, '../public/js'));

        liveReloadServer.on('filechange', (filepath) => {
            liveReloadServer.refresh(filepath);
        });

        app.use(connectLivereload());
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
    // ==== EJS の設定 ====
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.set('view cache', false);
    app.engine('ejs', (filePath, options, callback) => {
        ejs.renderFile(filePath, options, { cache: false }, callback);
    });

    app.use(express.json()); // jsonボディをパースするためのミドルウェアを設定

    const serverBin: string = './bedrock_server'; // 実行ファイルのパスと名前

    // 各機能のクラスをインスタンス化
    // const fullBackup: FullBackup = new FullBackup(manager, discordNotifier, isMode); // フルバックアップの機能のインスタンス
    // const rsyncBackup: RsyncBackup = new RsyncBackup(manager, discordNotifier, isMode); // 差分バックアップ機能のインスタンス
    // const fullBackupCron: BackupCronManager = new BackupCronManager(fullBackup); // フルバックアップのcron機能のインスタンスを生成
    // const rsyncBackupCron: BackupCronManager = new BackupCronManager(rsyncBackup); // 差分バックアップのcron機能のインスタンスを生成

    // manager.firstLaunch(); // サーバー初回起動時に環境をセットアップ

    // const fbJobTime = settings.fullBackupTime; // フルバックアップのcron時間設定を格納
    // const rbJobTime = settings.rsyncBackupTime; // 差分バックアップのcron時間設定を格納
    // fullBackupCron.addJob('defaultFullBackup', `${fbJobTime.second} ${fbJobTime.minute} ${fbJobTime.hour} * * *`);
    // rsyncBackupCron.addJob('defaultRsyncBackup', `${rbJobTime.second} ${rbJobTime.minute} ${rbJobTime.hour} * * *`);

    // app.use((req, res, next) => {
    //     req.manager = manager;
    //     req.fullBackup = fullBackup;
    //     req.rsyncBackup = rsyncBackup;
    //     next();
    // });

    app.use('/', pageRouter);
    app.use('/api', apiRouter);

    app.use((req, res, next) => {
        res.render('layout', {
            stylesheets: ['pages/error'],
            page: 'error.ejs',
            errorCode: '404',
            errorMsg: '指定されたページが見つかりません。'
        });
    });

    const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
        try {
            res.render('layout', {
                stylesheets: ['pages/error'],
                page: 'error.ejs',
                errorCode: '500',
                errorMsg: 'サーバー側でエラーが発生しました。'
            });
            logger.error(err);
        } catch(error) {
            logger.error('Server rendering error.', error);
            res.status(500).send('サーバーエラーが発生しました。')
        }
    }

    app.use(errorHandler);

    // ==== CLIツールの設定 ====
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    // コマンドラインからサーバー操作のコマンドを受け付ける
    rl.on('line', async (input) => {
        handler(httpServer, rl, input.trim(), mongodb);
    });

    // 終了シグナルをキャッチするとサーバーをシャットダウン
    process.on('SIGINT', () => shutdown(httpServer, rl, mongodb));
    process.on('SIGTERM', () => shutdown(httpServer, rl, mongodb));

    try {
        logger.info('Starting Server');
        logger.info(`version ${VERSION}`);
        logger.info(`Development mode: ${isMode}`);

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