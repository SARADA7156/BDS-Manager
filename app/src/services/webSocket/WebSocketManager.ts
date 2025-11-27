import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { SocketEvent } from './events/eventNames';
import { logger } from '../log/logger';
import { Payload } from '../../types/jwt/payload';

interface JwtService {
    verifyToken: (token: string) => Payload | null;
}

export class WebSocketManager {
    // 外部から直接アクセスさせないために private static で io インスタンスを保持
    private static ioInstance: Server | null = null;

    public static init(httpServer: HttpServer, jwtService: JwtService): void {
        if (this.ioInstance) {
            logger.warn('⚠️ WebSocketManager は既に初期化されています。');
            return;
        }

        const io = new Server(httpServer, {
            cors: { origin: '*' },
            pingInterval: 30000,
            pingTimeout: 60000
        });
        
        this.ioInstance = io;
        logger.info('✅ [WebSocket] クライアントからの接続受付を開始しました。');

        // 認証ミドルウェアの設定
        io.use((socket, next) => {
            try {
                const token = socket.handshake.auth.token;

                if (typeof token !== 'string') {
                    return next(new Error('Invalid credentials.'));
                }

                const decoded: Payload | null = jwtService.verifyToken(token);
                if (!decoded) {
                    logger.warn('JWT verification failed');
                    return next(new Error('Invalid credentials. Connection denied.'));
                }

                (socket as any).decoded = decoded; 
                logger.info(`✅ [WebSocket] Auth success for user: ${decoded.userName}`);
                next(); 
            } catch(error) {
                logger.error('❌ [WebSocket] Socket auth failed:', error);
                next(new Error('Authentication error'));
            }
        });
        
        // 接続イベントのリスナー
        io.on(SocketEvent.CONNECTION, (socket: Socket) => {
            const userInfo = (socket as any).decoded ? `User: ${(socket as any).decoded.userName}` : 'Guest';
            logger.info(`✅ [WebSocket] クライアントが接続しました。 ID: ${socket.id} | ${userInfo}`);

            // ここに他のイベントハンドラ登録（例: 処理の委譲）
            // this.registerHandlers(socket); 

            socket.on(SocketEvent.DISCONNECT, () => {
                logger.info(`❌ [WebSocket] クライアントが切断しました。 ID: ${socket.id} | ${userInfo}`);
            });
        });
    }

    /**
     * どこからでもクライアントに通知を送るために io インスタンスを取得します。
     */
    public static getIO(): Server {
        if (!this.ioInstance) {
            throw new Error('❌ WebSocketManager は初期化されていません。init メソッドを呼び出してください。');
        }
        return this.ioInstance;
    }

    /**
     * 特定のイベントをブロードキャストするヘルパーメソッド
     */
    public static emitToAll<T>(eventName: string, data: T): void {
        if (this.ioInstance) {
            this.ioInstance.emit(eventName, data);
            logger.debug(`📤 [WebSocket] ${eventName} をブロードキャストしました。`);
        }
    }
}