// BDSの静的ファイルの変更を担当するサービス
import { IObsidianIOService } from "../../utils/ObsidianOIService";
import { ObsidianLogger } from "../../core/ObsidianLogger";
import { isObsidianIOError } from "../../errors/ObsidianIoError";
import { mapToFileKeys } from "./mapToFileKeys";

export interface IBdsPropertiesService {
    // BDSの静的ファイルの設定変更
    setProperty: (serverConfig: Record<string, any>, path: string) => Promise<void>;
}

export class BdsPropertiesService implements IBdsPropertiesService {
    constructor(
        private logger: ObsidianLogger,
        private io: IObsidianIOService,
    ) {};

    public async setProperty(serverConfig: Record<string, any>, path: string): Promise<void> {
        const parceConfigs = mapToFileKeys(serverConfig);
        const data = await this.#readProperties(path);
        const lines = data.split(/\r?\n/);

        const updateLines = lines.map(line => {
            if (!line.includes('=')) return line;

            const [k, v] = line.split('=');
            const key = k.trim();

            if (parceConfigs[key] !== undefined) {
                // const regex = new RegExp(`^(\\s*${key}\\s*=).*`);
                return `${key}=${parceConfigs[key]}`;
            }
            return line;
        });

        await this.#writeProperties(path, updateLines.join('\n'));
    }

    async #readProperties(path: string): Promise<string> {
        try {
            this.logger.info(`Loading the configuration file. path: ${path}`);
            return await this.io.readFile(path);
        } catch(err) {
            this.#handleError(err, 'Read');
            throw err;
        }
    }

    async #writeProperties(path: string, data: string | Buffer): Promise<void> {
        try {
            this.logger.info(`Write the configuration file. path: ${path}`);
            await this.io.writeFile(path, data);
        } catch(err) {
            this.#handleError(err, 'Write');
            throw err;
        }
    }

    #handleError(err: unknown, process: 'Write' | 'Read'): void {
        if (isObsidianIOError(err)) {
            this.logger.error(`The configuration change process failed due to an I/O error. process: ${process}`);
            return;
        }
        this.logger.error(`An unexpected error occurred, and the configuration file update failed. process: ${process}`);
    }
}