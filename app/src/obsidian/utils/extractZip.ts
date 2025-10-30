import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';
import { logger } from '../../services/log/logger';

export async function extractZip(): Promise<void> {
    const zipPath = path.resolve(__dirname, '../installer/tmp/bedrock-server.zip');
    const extractPath = path.resolve(__dirname, '../installer/tmp_unverified');

    try {
        logger.info(`📦 Source zip file: ${zipPath}`);
        logger.info(`📂 Destination for extraction: ${extractPath}`);

        // 展開先フォルダを作成（存在しない場合）
        fs.mkdirSync(extractPath, { recursive: true });

        await new Promise<void>((resolve, reject) => {
            const stream = fs.createReadStream(zipPath)
                .pipe(unzipper.Extract({ path: extractPath }));

            stream.on('close', () => {
                logger.info(`✅ Extraction complete.`);
                resolve();
            });

            // ストリームパイプライン全体のエラーを補足
            stream.on('error', (err) => {
                logger.error(`An unexpected error occurred during decompression: ${err}`);
                reject(err);
            });

            // 入力ストリーム(fs.createReadStream)のエラー処理
            fs.createReadStream(zipPath).on('error', (err) => {
                logger.error(`Error reading ZIP file: ${err.message}`);
                reject(err);
            });
        });

    } catch(error) {
        logger.info('❌ ZIP file extraction error:', error);
        throw error;
    }
}