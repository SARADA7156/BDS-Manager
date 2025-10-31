import { UuidManager } from "../services/auth/UuidManager";
import { DatabaseConnection } from "../services/db/mysqld/DatabaseConnection";
import { TokenRepository } from "../services/db/mysqld/Repository/TokenRepository";
import { UserService } from "../services/db/mysqld/Service/UserService";
import { GmailService } from "../services/mailer/GmailService";
import { GmailSender } from "../services/mailer/mailer";
import { JwtService } from "../services/auth/JwtService";
import { ObsidianCore } from "../obsidian/core/ObsidianCore";

export class ServiceContainer {
    private GMAIL_USER = process.env.GMAIL_USER!;
    private GMAIL_PASS = process.env.GMAIL_PASS!;

    private gmailMailer: GmailSender;
    private tokenRepo: TokenRepository;

    public userService: UserService;
    public gmailService: GmailService;
    public uuidManager: UuidManager;
    public jwtService: JwtService;
    public obsidian: ObsidianCore;

    constructor() {
        const db = DatabaseConnection.getPool();
        this.userService = new UserService(db);

        this.gmailMailer = new GmailSender(this.GMAIL_USER, this.GMAIL_PASS);
        this.gmailService = new GmailService(this.gmailMailer);
        this.tokenRepo = new TokenRepository(db);
        this.uuidManager = new UuidManager(this.tokenRepo);
        this.jwtService = new JwtService();
        this.obsidian = new ObsidianCore();
    }
}