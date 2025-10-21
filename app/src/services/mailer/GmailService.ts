import { logger } from "../log/logger";
import { GmailSender } from "./mailer";

export class GmailService {
    private sender: GmailSender;
    private isMode: boolean;

    constructor (sender: GmailSender) {
        this.sender = sender;
        this.isMode = process.env.NODE_ENV ? true : false;
    }

    // ログイン用のURL付きGmailを送信
    public async sendLogin(to: string, uuid: string): Promise<void> {
        const url = this.isMode
            ? `http://localhost:5173/auth/login/token?uuid=${uuid}`
            : `https://bdsmanager.saradaweb.com/auth/login/token?uuid=${uuid}`;

        await this.sender.send(
            to,
            'ログイン用メールアドレスが送信されました。',
            `下記のリンクをクリックしてログインを完了しましょう！\n\n${url}\nこのリンクは他人に共有しないでください。\n\nメールを送信した覚えがない場合は、このメールを無視してください。`
        );

        logger.info(`sent the login URL to ${to}`);
    } 
}