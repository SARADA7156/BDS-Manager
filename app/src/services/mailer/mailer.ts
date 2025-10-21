import * as nodemailer from 'nodemailer';

interface MailService {
    send(to: string, subject: string, body: string): Promise<void>;
}

// Gmail専用のクラス
export class GmailSender implements MailService {
    private transporter: nodemailer.Transporter;

    constructor(user: string, pass: string) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: user,
                pass: pass,
            },
        });
    }

    public async send(to: string, subject: string, body: string, html?: string): Promise<void> {
        await this.transporter.sendMail({
            from: 'BDS-Manager',
            to: to,
            subject: subject,
            text: body,
            html: html
        });
    }
}