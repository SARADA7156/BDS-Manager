import axios from "axios";
import { logger } from "../log/logger";
import { EmbedContent } from "../../types/webhook/EmbedContent";

export class DiscordNotificationManager {
    private webhookUrl: string;

    constructor(url: string) {
        this.webhookUrl = url;
    }

    // 実際にテキストを送信する部分
    private async sendMessage(content: EmbedContent): Promise<void> {
        try {
            const response = await axios.post(
                this.webhookUrl,
                { embeds: [content] }
            );
            logger.debug('Data submitted: ', response.data);
        } catch(error) {
            logger.error(`Text sending to Discord failed: ${error}`);
        }
    }

    // 通常の通知送信
    public async sendNotice(title: string, description: string): Promise<void> {
        const content: EmbedContent = {
            title: title,
            description: description,
            color: 0x2ecc71
        }

        return this.sendMessage(content);
    }

    public async sendError(title: string, description: string): Promise<void> {
        const content: EmbedContent = {
            title: title,
            description: description,
            color: 0xff0000
        }

        return this.sendMessage(content);
    }

}