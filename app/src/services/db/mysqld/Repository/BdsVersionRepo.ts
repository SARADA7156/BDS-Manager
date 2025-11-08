import { Pool } from "mysql2/promise";

export interface VersionRecord {
    id: number;
    version: string;
    created_at: string;
}

export class BdsVersionRepo {
    constructor (private pool: Pool) {}

    // BDSの最新バージョンを保存
    public async save(version: string): Promise<void> {
        try {
            await this.pool.query('INSERT INTO bds_versions (version) VALUES (?);', [version]);
        } catch(err) {
            throw new Error(`An error occurred while saving the latest version of BDS: ${err}`);
        }
    }

    // 最新バージョンを検索
    public async findCurrent(): Promise<VersionRecord | null> {
        try {
            const [rows] = await this.pool.query('SELECT * FROM bds_versions ORDER BY created_at DESC LIMIT 1');
            const versions = rows as VersionRecord[];
            return versions[0] ?? null;
        } catch(err) {
            throw new Error(`Could not obtain the BDS version: ${err}`);
        }
    }
}