import { DatabaseConnection } from "../services/db/mysqld/DatabaseConnection";
import { UserService } from "../services/db/mysqld/Service/UserService";
import { GmailSender, IcloudSender } from "../services/mailer/mailer";

export class ServiceContainer {
    private GMAIL_USER = process.env.GMAIL_USER!;
    private GMAIL_PASS = process.env.GMAIL_PASS!;

    private ICLOUD_USER = process.env.ICLOUD_USER!;
    private ICLOUD_PASS = process.env.ICLOUD_PASS!;

    userService: UserService;
    gmailMailer: GmailSender;
    iCloudMailer: IcloudSender;

    constructor() {
        const db = DatabaseConnection.getPool();
        this.userService = new UserService(db);

        this.gmailMailer = new GmailSender(this.GMAIL_USER, this.GMAIL_PASS);
        this.iCloudMailer = new IcloudSender(this.ICLOUD_USER, this.ICLOUD_PASS);
    }
}