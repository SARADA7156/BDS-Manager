import axios from "axios";
import fs from 'fs';
import path from 'path';
import { logger } from "../../../services/log/logger";
import { Readable } from "stream";
import unzipper, { Parse } from 'unzipper';
import { isObsidianIOError, ObsidianIOError } from "../../errors/ObsidianIoError";
import { CORE_STATUS } from "../../errors/coreStatus";
import { isObsidianNetworkError, ObsidianNetworkError } from "../../errors/ObsidianNetworkError";
import { ObsidianSecurityError } from "../../errors/ObsidianSecurityError";

interface DownloadLinks {
    result: {
        links: {
            downloadType: string;
            downloadUrl: string;
        }[]
    }
}

export async function downloadAndExtract(): Promise<void> {
    const url = 'https://net-secondary.web.minecraft-services.net/api/v1.0/download/links';
    const outputPath = path.resolve(__dirname, '../tmp');

    try {
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }
    } catch(err) {
        throw new ObsidianIOError(CORE_STATUS.FILE_ACCESS_DENIED, 'Directory create Error.', 'permision denied');
    }

    let response;
    let startTime;
    // ダウンロード
    try {
        const linkResponse = await axios.get<DownloadLinks>(url);

        const downloadUrl = linkResponse.data.result.links.find(
            (link) => link.downloadType === 'serverBedrockLinux'
        );

        if (!downloadUrl) {
            throw new ObsidianNetworkError(
                CORE_STATUS.INTERNAL_SERVER_ERROR,
                'download link not found.',
                'The required download link is missing from the ZIP file.'
            );
        }

        logger.info(`Start downloading the Bedrock server from ${downloadUrl.downloadUrl}`);
        startTime = Date.now(); // 開始時刻を格納
        response = await axios.get<Readable>(downloadUrl.downloadUrl, {
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

    // 解凍
    try {
        await new Promise<void>((resolve, reject) => {
            response.data
                .pipe(Parse())
                .on('entry', async (entry) => {
                    const filePath = path.resolve(outputPath, entry.path);
                    if (!filePath.startsWith(outputPath)) {
                        entry.autodrain();
                        reject(new ObsidianSecurityError(CORE_STATUS.SECURITY_VIOLATION, 'Unsafe path detected.', entry.path));
                        return;
                    }

                    if (entry.type === 'Directory') {
                        await fs.promises.mkdir(filePath, { recursive: true });
                        entry.autodrain();
                    } else {
                        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
                        entry.pipe(fs.createWriteStream(filePath));
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
    logger.info(`✅ The download and extraction of Bedrock Server is complete.. path: ${outputPath}`);
    logger.info(`⌛ **Time_sec: ${Math.floor((Date.now() - startTime) / 1000)}s**`);
}