import { Pool } from "mysql2/promise";

export interface TokenRecord {
    uuid: string;
    email: string;
    status: 'pending' | 'verified' | 'expired';
    expires_at: Date;
    created_at: Date;
}

export class TokenRepository {
    constructor(private pool: Pool) {}

    // トークンをDBに保存
    public async save(uuid: string, email: string, expiresAt: Date): Promise<void> {
        await this.pool.query(
            'INSERT INTO login_tokens (uuid, email, status, expires_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE uuid = VALUES(uuid), status = VALUES(status), expires_at = VALUES(expires_at);',
            [uuid, email, 'pending', expiresAt]
        );
    }

    // トークンを検索
    public async find(uuid: string): Promise<TokenRecord | null> {
        const [rows] = await this.pool.query('SELECT * FROM login_tokens WHERE uuid = ?', [uuid]);
        const tokens = rows as TokenRecord[];
        return tokens[0] ?? null;
    }

    // トークンを無効化
    public async invalidate(uuid: string): Promise<void> {
        await this.pool.query('UPDATE login_tokens SET status = \'expired\' WHERE uuid = ?', [uuid]);
    }
}