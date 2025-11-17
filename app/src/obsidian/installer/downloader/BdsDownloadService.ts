import axios from "axios";
import fs from 'fs/promises';
import { createWriteStream } from 'fs'
import path from 'path';
import { Readable } from "stream";
import { Parse } from 'unzipper';
import { isObsidianIOError, ObsidianIOError } from "../../errors/ObsidianIoError";
import { CORE_STATUS } from "../../errors/coreStatus";
import { isObsidianNetworkError, ObsidianNetworkError } from "../../errors/ObsidianNetworkError";
import { ObsidianLogger } from "../../logger/ObsidianLogger";
import { BdsVersionRepo, VersionRecord } from "../../../services/db/mysqld/Repository/BdsVersionRepo";
import { ObsidianParamError } from "../../errors/ObsidianParamError";
import { ObsidianDatabaseError } from "../../errors/ObsidianDatabaseError";

interface DownloadLinks {
    result: {
        links: {
            downloadType: string;
            downloadUrl: string;
        }[]
    }
}

interface isLatestReturn {
    required: boolean;
    dlLink: string;
    latestVersion: string;
}

export class BdsDownloadService {
    private MEGABYTE = 1024 * 1024;
    private MAX_UNCOMPRESSED_SIZE = 500 * this.MEGABYTE; // 500MB
    // 許可された拡張子
    private ALLOWED_EXTENSIONS = [
        '', // 実行ファイル(bedrock_server)
        '.so',
        '.json',
        '.html',
        '.brarchive',
        '.png',
        '.lang',
        '.js',
        '.nbt',
        '.mcstructure',
        '.dat',
        '.wlist',
        '.txt',
        '.material',
        '.fsb',
        '.tga',
        '.properties'
    ];

    constructor(
        private logger: ObsidianLogger,
        private versionRepo: BdsVersionRepo,
    ) {}

    // キャッシュしているBDSのバージョンが最新か検証
    public async isLatest(): Promise<isLatestReturn> {
        this.logger.info('Verify that the cached BDS is up to date.');
        try {
            const url = 'https://net-secondary.web.minecraft-services.net/api/v1.0/download/links';
            const linkResponse = await axios.get<DownloadLinks>(url);

            const latestLinks = linkResponse.data.result.links.find(
                (link) => link.downloadType === 'serverBedrockLinux'
            );

            if (!latestLinks) {
                throw new ObsidianNetworkError(
                    CORE_STATUS.INTERNAL_SERVER_ERROR,
                    'download link not found.',
                    'The required download link is missing from the ZIP file.'
                );
            }

            const versionRegex: RegExp = /\d+\.\d+\.\d+/;
            const latestVersionMatch: RegExpMatchArray | null = latestLinks.downloadUrl.match(versionRegex);
            const latestVersion = latestVersionMatch ? latestVersionMatch[0] : null;

            if (!latestVersion) {
                // バージョンが見つからなかった場合は後続の処理ができないため、例外を投げる
                throw new ObsidianParamError(
                    CORE_STATUS.NOT_FOUND,
                    'No latest version available.',
                    'The latest version is not available in the download link.'
                );
            }

            const currentVersion: VersionRecord | null = await this.versionRepo.findCurrent(); // 現在のバージョンを取得

            if (!currentVersion || currentVersion.version !== latestVersion) {
                // 現在のバージョンが登録されていない or 最新のバージョンではない場合はダウンロードダウンロードが必要
                this.logger.info(`The cached version is outdated. Download required. current: ${currentVersion?.version}, latest: ${latestVersion.toString()}`);
                return { required: true, dlLink: latestLinks.downloadUrl, latestVersion: latestVersion };
            } else {
                this.logger.info(`Cached data is up to date. No download required. current: ${currentVersion.version}, latest: ${latestVersion.toString()}`);
                return { required: false, dlLink: latestLinks.downloadUrl, latestVersion: latestVersion };
            }
        } catch(err) {
            throw err;
        }
    }

    // BDSを公式サイトからダウンロード・解凍する
    public async downloadAndExtract(latestCheck: boolean = true, latestData?: isLatestReturn): Promise<void> {
        const outputPath = path.resolve(__dirname, '../tmp');

        // キャッシュデータが最新か検証
        const versionInfo = latestCheck
            ? await this.isLatest()
            : latestData!

        if (!versionInfo.required) {
            // requiredがfalseの場合はキャッシュを利用するためその後の処理は行わない
            this.logger.info('No update required. Skipping download.')
            return;
        }

        // キャッシュデータが最新でない場合はダウンロードして展開

        try {
            await fs.rm(outputPath, { recursive: true, force: true });

            await fs.mkdir(outputPath, { recursive: true });
        } catch(err) {
            throw new ObsidianIOError(CORE_STATUS.FILE_ACCESS_DENIED, 'Directory create Error.', 'permision denied');
        }

        let response;
        let startTime;
        // ダウンロード
        try {
            this.logger.info(`Start downloading the Bedrock server from ${versionInfo.dlLink}`);
            startTime = Date.now(); // 開始時刻を格納
            response = await axios.get<Readable>(versionInfo.dlLink, {
                responseType: 'stream',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
                }
            });

            if (response.status !== 200) {
                throw new ObsidianNetworkError(
                    CORE_STATUS.INTERNAL_SERVER_ERROR,
                    'File download Error.',
                    'Download of the ZIP file failed.'
                )
            }
        } catch(err) {
            if (isObsidianNetworkError(err)) throw err;
            throw new ObsidianNetworkError(
                CORE_STATUS.INTERNAL_SERVER_ERROR,
                'Internal server Error.',
                `An unknown download error occurred: ${(err as Error).message}`
            );
        }

        let totalUncompressed = 0;
        // 解凍
        try {
            await new Promise<void>((resolve, reject) => {
                response.data
                    .pipe(Parse())
                    .on('entry', async (entry) => {
                        totalUncompressed += entry.vars.uncompressedSize;
                        if (totalUncompressed > this.MAX_UNCOMPRESSED_SIZE) {
                            this.logger.warn(`ZIP BOMB DANGER!!! Processing will be stopped.`);
                            entry.autodrain();
                            return;
                        }

                        const safeOutputPath = path.normalize(outputPath + path.sep);
                        const filePath = path.resolve(outputPath, entry.path);
                        const normalizedFilePath = path.normalize(filePath);
                        if (!normalizedFilePath.startsWith(safeOutputPath)) {
                            this.logger.warn(`Suspicious ZIP structure detected. Skip file extraction: ${normalizedFilePath}`);
                            entry.autodrain();
                            return;
                        }

                        const ext = path.extname(entry.path).toLowerCase();
                        const base = path.basename(entry.path);
                        // 拡張子チェック
                        const isAllowed =
                            this.ALLOWED_EXTENSIONS.includes(ext) ||
                            (ext === '' && base === 'bedrock_server'); // 拡張子なしはbedrock_serverの実行ファイルのみ許可

                        if (entry.type === 'Directory') {
                            entry.autodrain();
                            await fs.mkdir(filePath, { recursive: true });
                            return;
                        } else if (!isAllowed) {
                            this.logger.warn(`Detected an invalid file extension. Skipping: ${base}`);
                            entry.autodrain();
                            return;
                        } else {
                            await fs.mkdir(path.dirname(filePath), { recursive: true });
                            await new Promise<void>((fileResolve, fileReject) => {
                                const writeStream = createWriteStream(filePath);
                                writeStream.on('error', fileReject);
                                writeStream.on('finish', fileResolve);

                                entry.pipe(writeStream);
                            });

                            if (base === 'bedrock_server') {
                                await fs.chmod(filePath, 0o755);
                            }
                        }
                    })
                    .on('close', resolve)
                    .on('error', (err) => {
                        reject(new ObsidianIOError(CORE_STATUS.FILE_BROKEN, 'File broken.', `The downloaded ZIP file is broken: ${(err as Error).message}`));
                    });
            });
        } catch(err) {
            if (isObsidianIOError(err)) throw err;
            throw new ObsidianIOError(CORE_STATUS.FILE_IO_ERROR, 'File IO Error.', `An unknown file I/O error occurred: ${(err as Error).message}`);
        }

        // 最新バージョンを自動で保存
        try {
            this.versionRepo.save(versionInfo.latestVersion);
        } catch(err) {
            throw new ObsidianDatabaseError(CORE_STATUS.INTERNAL_SERVER_ERROR, 'internal server Error.', 'The latest current version could not be saved.');
        }
        this.logger.info(`✅ The download and extraction of Bedrock Server is complete.. path: ${outputPath}`);
        this.logger.info(`⌛ **Time_sec: ${Math.floor((Date.now() - startTime) / 1000)}s**`);
    }
}