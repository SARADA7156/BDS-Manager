import { Pool } from "mysql2/promise";

export interface User {
    id: number;
    name: string;
    email: string;
    permission: 'operator' | 'member';
}

export class UserRepository {
    private pool;

    constructor (pool: Pool) {
        this.pool = pool;
    }

    // ユーザー検索
    async findByEmail(email: string): Promise<User | null> {
        const [rows] = await this.pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const users = rows as User[];
        return users.length > 0 ? users[0] : null;
    }
}