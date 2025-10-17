import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Payload } from '../../types/jwt/payload';
import { logger } from '../log/logger';

export class JwtService {
    private accessSecret: string = process.env.JWT_ACCESS_SECRET!;
    private refreshSecret: string = process.env.JWT_REFRESH_SECRET!;

    // アクセストークンの発行
    public signAccessJwt(payload: Payload): string {
        return jwt.sign(payload, this.accessSecret, {
            algorithm: 'HS256',
            expiresIn: '15m',
            issuer: 'bds-service',
            audience: 'bds-client'
        });
    }

    // リフレッシュトークンの発行
    public signRefreshJwt(payload: Payload): string {
        return jwt.sign(payload, this.refreshSecret, {
            algorithm: 'HS256',
            expiresIn: '7d',
            issuer: 'bds-service',
            audience: 'bds-client'
        });
    }

    // トークン検証
    public verifyToken(token: string, isRefresh = false): Payload | null {
        try {
            const secret = isRefresh ? process.env.JWT_REFRESH_SECRET! : process.env.JWT_ACCESS_SECRET!;
            const decoded = jwt.verify(token, secret, {
                algorithms: ['HS256'],
                issuer: 'bds-service',
                audience: 'bds-client'
            }) as Payload;

            return decoded;
        } catch(err) {
            if (err instanceof TokenExpiredError) {
                logger.warn('Token expired');
            } else if (err instanceof JsonWebTokenError) {
                logger.error('Invalid token');
            } else {
                logger.error('Token verification error:', err);
            }
            return null;
        }
    }
}