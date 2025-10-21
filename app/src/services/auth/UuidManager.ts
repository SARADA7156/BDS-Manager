import crypto from 'crypto';
import { TokenRepository } from '../db/mysqld/Repository/TokenRepository';
import { logger } from '../log/logger';

export class UuidManager {
    constructor(private tokenRepo: TokenRepository) {}

    // UUIDトークンを生成し、DBに登録する
    public async generate(email: string, expiryMinutes = 15): Promise<string> {
        const uuid = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

        await this.tokenRepo.save(uuid, email, expiresAt);
        return uuid;
    }

    // トークンの有効性を検証する
    public async validate(uuid: string): Promise<false | string> {
        // UUID形式チェック
        if (!this.isValidFormat(uuid)) return false;

        // DBで確認
        const token = await this.tokenRepo.find(uuid);
        if (!token) {
            logger.warn('A non-existent token was validated.');
            return false // 存在しない
        } 
        if (token.status === 'expired') {
            logger.info('An expired token was validated.');
            return false // 手動で無効済
        }
        if (token.expires_at.getTime() < Date.now()) {
            await this.tokenRepo.invalidate(uuid); // 自動で無効化
            return false;
        }

        logger.info('The verified token is valid.');
        await this.tokenRepo.invalidate(uuid); // 自動で無効化
        return token.email;
    }

    // 使用済みトークンを無効化する(ログイン完了時など)
    public async invalidate(uuid: string): Promise<void> {
        await this.tokenRepo.invalidate(uuid);
    }

    private isValidFormat(uuid: string): boolean {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
    }
}