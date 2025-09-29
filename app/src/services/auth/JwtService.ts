import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Payload } from '../../types/jwt/payload';
import { logger } from '../log/logger';

export class JwtService {
    private secretKey: string = process.env.JWT_SECRET!;

    public signJwt(payload: Payload): string {
        return jwt.sign(payload, this.secretKey, { expiresIn: '1h' });
    }

    public verifyToken(token: string): Payload | null {
        try {
            const decoded = jwt.verify(token, this.secretKey) as Payload;
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