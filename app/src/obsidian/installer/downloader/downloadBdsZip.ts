import axios from "axios";
import fs from 'fs';
import path from 'path';
import { logger } from "../../../services/log/logger";
import { Readable } from "stream";

interface DownloadLinks {
    result: {
        links: {
            downloadType: string;
            downloadUrl: string;
        }[]
    }
}

export async function downloadBdsZip(): Promise<void> {
    // ダウンロードリンクを取得するURL
    const url = 'https://net-secondary.web.minecraft-services.net/api/v1.0/download/links';
    const outputPath = path.resolve(__dirname, '../tmp/bedrock-server.zip');

    try {
        const linkResponse = await axios.get<DownloadLinks>(url);

        const downloadUrl = linkResponse.data.result.links.find(
            (link) => link.downloadType === 'serverBedrockLinux'
        );

        if (!downloadUrl) {
            throw new Error('The download link does not exist.');
        }

        logger.info(`Start downloading the Bedrock server from ${downloadUrl.downloadUrl}`);
        const startTime = Date.now(); // 開始時刻を格納
        const response = await axios.get<Readable>(downloadUrl.downloadUrl, {
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
            }
        });

        // 書き込みストリームを作成
        const writer = fs.createWriteStream(outputPath);

        // pipeで転送
        response.data.pipe(writer);

        logger.info('Save the download file to the temporary directory.');
        await new Promise<void>((resolve, reject) => {
            writer.on('error', (err) => {
                console.error('Writer Error:', err);
                reject(err);
            });

            response.data.on('error', (err) => {
                console.error('Download Stream Error:', err);
                writer.close();
                reject(err);
            });

            writer.on("finish", resolve);
        });
        logger.info(`✅ The download of Bedrock Server has completed successfully. path: ${outputPath}`);
        logger.info(`⌛ **Time_sec: ${Math.floor((Date.now() - startTime) / 1000)}s**`);
    } catch (error) {
        logger.error('Server Download Error:', error)
    }
}
