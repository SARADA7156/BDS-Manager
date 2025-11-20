import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { SocketEvent } from './events/eventNames';
import { logger } from '../log/logger';
import { Payload } from '../../types/jwt/payload';

interface JwtService {
    verifyToken: (token: string) => Payload | null;
}

export function initSocket(httpServer: HttpServer, jwtService: JwtService): void {
    const io = new Server(httpServer, {
        cors: { origin: '*' },
        pingInterval: 30000,
        pingTimeout: 60000
    });
    logger.info('✅ WebScoketはクライアントからの接続受付を開始しました。');

    // 接続前認証ミドルウェア
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

            logger.info(`✅ WebSocket auth success for user: ${decoded.userName}`);
            next(); // 承認成功
        } catch(error) {
            logger.error('❌ Socket auth failed:', error);
            next(new Error('Authentication error'));
        }
    });

    // 接続イベント
    io.on(SocketEvent.CONNECTION, (socket: Socket) => {
        logger.info(`✅ [WebScoket] クライアントが接続しました。 ID: ${socket.id}`);

        socket.on(SocketEvent.DISCONNECT, () => {
            logger.info(`❌ [WebScoket] クライアントが切断しました。 ID: ${socket.id}`);
        });
    });
}