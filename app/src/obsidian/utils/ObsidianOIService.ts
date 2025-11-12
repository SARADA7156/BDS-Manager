import fs, { readdir } from "fs/promises";
import { dirname, join, relative, resolve, sep } from "path";
import { pipeline } from "stream/promises";
import pLimit from "p-limit";
import { CORE_STATUS } from "../errors/coreStatus";
import { ObsidianIOError } from "../errors/ObsidianIoError";
import { createReadStream, createWriteStream } from "fs";
import { ObsidianLogger } from "../core/ObsidianLogger";

export interface IObsidianIOService {
    // ファイルを移動(リネーム)
    move: (src: string, dest: string) => Promise<void>;

    // 単一ファイルをコピー(小容量向け)
    copy: (src: string, dest: string) => Promise<void>;

    // ストリームを使用しファイルをコピー(大容量向け)
    copyStream: (src: string, dest: string) => Promise<void>;

    // ディレクトリを再帰的にコピー
    copyDir: (src: string, dest: string) => Promise<void>;

    // 単一のファイル・または空のディレクトリを削除
    delete: (src: string) => Promise<void>;

    // ディレクトリとその中身を再帰的に削除
    deleteAll: (dir: string) => Promise<void>;

    // ファイルの読み取り
    readFile: (path: string, encoding?: BufferEncoding) => Promise<string>;

    // ファイルの書き込み
    writeFile: (path: string, data: string | Buffer, encoding?: BufferEncoding) => Promise<void>;
}

export class ObsidianIOService implements IObsidianIOService {
    private readonly projectRoot: string;
    private logger: ObsidianLogger;

    constructor(projectRoot: string, logger: ObsidianLogger) {
        this.projectRoot = projectRoot;
        this.logger = logger;
    }

    public async move(src: string, dest: string): Promise<void> {
        const validSrc = this.#validatePath(src, 'Source');
        const validDest = this.#validatePath(dest, 'Destination');

        try {
            this.logger.info(`Move the file: ${validSrc}`);
            await this.#ensureParentDir(validDest);

            await fs.rename(validSrc, validDest);
        } catch(err) {
            const errorDetail = (err instanceof Error) ? err.message : String(err);
            this.handleError(CORE_STATUS.FILE_IO_ERROR, `An error occurred while moving the file: ${errorDetail}`);
        }
    }

    public async copy(src: string, dest: string): Promise<void> {
        const validSrc = this.#validatePath(src, 'Source');
        const validDest = this.#validatePath(dest, 'Destination');

        try {
            await fs.cp(validSrc, validDest, { recursive: true, force: true });
        } catch(err) {
            const errorDetail = (err instanceof Error) ? err.message : String(err);
            this.handleError(CORE_STATUS.FILE_IO_ERROR, `An error occurred while copying the file: ${errorDetail}`);
        }
    }

    public async copyStream(src: string, dest: string): Promise<void> {
        const validSrc = this.#validatePath(src, 'Source');
        const validDest = this.#validatePath(dest, 'Destination');

        try {
            await this.#ensureParentDir(validDest);

            await pipeline(
                createReadStream(validSrc),
                createWriteStream(validDest)
            );
        } catch(err) {
            const errorDetail = (err instanceof Error) ? err.message : String(err);
            this.handleError(CORE_STATUS.FILE_IO_ERROR, `An error occurred while copying the file via stream: ${errorDetail}`);
        }
    }

    public async copyDir(src: string, dest: string): Promise<void> {
        const validSrc = this.#validatePath(src, 'Source');
        const validDest = this.#validatePath(dest, 'Destination');

        try {
            // コピー先のディレクトリを再帰的に作成
            await fs.mkdir(validDest, { recursive: true });

            const entries = await readdir(validSrc, { withFileTypes: true });

            const limit = pLimit(2);

            // 並列処理でコピーを実行
            for (const entry of entries) {
                await limit(async () => {
                    const srcPath = join(src, entry.name);
                    const destPath = join(dest, entry.name);

                    if (entry.isDirectory()) {
                        await this.copyDir(srcPath, destPath);
                    } else {
                        await this.copyStream(srcPath, destPath);
                    }
                });
            }
            await limit.clearQueue?.(); // p-limit v5以降などで安全終了
        } catch(err) {
            const errorDetail = (err instanceof Error) ? err.message : String(err);
            this.handleError(CORE_STATUS.FILE_IO_ERROR, `An error occurred while copying the directory: ${errorDetail}`);
        }
    }

    public async delete(src: string): Promise<void> {
        const validSrc = this.#validatePath(src, 'Source');

        try {
            this.logger.info(`Delete the file: ${validSrc}`);
            await fs.rm(validSrc, { recursive: true, force: true });
        } catch(err) {
            const errorDetail = (err instanceof Error) ? err.message : String(err);
            this.handleError(CORE_STATUS.FILE_IO_ERROR, `An error occurred while deleting the file: ${errorDetail}`);
        }
    }

    public async deleteAll(src: string): Promise<void> {
        const validSrc = this.#validatePath(src, 'Source');

        try {
            this.logger.info(`Delete the directory: ${validSrc}`);
            // recursiveオプションをtureにして再帰的に削除
            await fs.rm(validSrc, { recursive: true, force: true });
        } catch(err) {
            const errorDetail = (err instanceof Error) ? err.message : String(err);
            this.handleError(CORE_STATUS.FILE_IO_ERROR, `An error occurred while deleting the file: ${errorDetail}`);
        }
    }

    public async readFile(path: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
        const validPath = this.#validatePath(path, 'File');

        try {
            const data = await fs.readFile(validPath, { encoding });
            return data;
        } catch (err) {
            const errorDetail = (err instanceof Error) ? err.message : String(err);
            this.handleError(CORE_STATUS.FILE_IO_ERROR, `An error occurred while reading the file: ${errorDetail}`);
        }
    }

    public async writeFile(path: string, data: string | Buffer, encoding: BufferEncoding = 'utf-8'): Promise<void> {
        const validPath = this.#validatePath(path, 'File');

        try {
            await this.#ensureParentDir(validPath);
            await fs.writeFile(validPath, data, { encoding });
        } catch (err) {
            const errorDetail = (err instanceof Error) ? err.message : String(err);
            this.handleError(CORE_STATUS.FILE_IO_ERROR, `An error occurred while writing the file: ${errorDetail}`);
        }
    }

    async #ensureParentDir(targetPath: string): Promise<void> {
        const parentDir = dirname(targetPath);

        try {
            await fs.mkdir(parentDir, {recursive: true });
        } catch (err) {
            const errorDetail = (err instanceof Error) ? err.message : String(err);
            this.handleError(CORE_STATUS.FILE_IO_ERROR, `An error occurred while creating the parent directory: ${errorDetail}`);
        }
    }

    #validatePath(targetPath: string, name: string): string {
        if (typeof targetPath !== 'string' || targetPath.trim().length === 0) {
            this.handleError(CORE_STATUS.FILE_ACCESS_DENIED, `${name} is invalid path`)
        }

        const absPath = resolve(targetPath);
        const relPath = relative(this.projectRoot, absPath);

        // ルートより上の階層を指定している場合は拒否
        if (relPath.startsWith('..') || relPath.includes(`..${sep}`)) {
            this.handleError(CORE_STATUS.FILE_ACCESS_DENIED, 'You cannot specify the parent directory.')
        }

        return absPath;
    }

    private handleError(code: number, detail: string): never {
        throw new ObsidianIOError(code, 'file I/O Error', detail);
    }
}