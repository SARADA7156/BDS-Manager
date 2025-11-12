import { UuidManager } from "../services/auth/UuidManager";
import { DatabaseConnection } from "../services/db/mysqld/DatabaseConnection";
import { TokenRepository } from "../services/db/mysqld/Repository/TokenRepository";
import { UserService } from "../services/db/mysqld/Service/UserService";
import { GmailService } from "../services/mailer/GmailService";
import { GmailSender } from "../services/mailer/mailer";
import { JwtService } from "../services/auth/JwtService";
import { ObsidianCore } from "../obsidian/core/ObsidianCore";
import { ObsidianPortManager } from "../obsidian/core/ObsidianPortManager";
import { ConfigService } from "../obsidian/installer/config/ConfigService";
import { ObsidianLogger } from "../obsidian/core/ObsidianLogger";
import { logger } from "../services/log/logger";
import { InstanceConfRepo } from "../services/db/mongod/repositories/ConfigRepo";
import { InstanceRepo } from "../services/db/mongod/repositories/InstanceRepo";
import { ServerCreator } from "../obsidian/installer/ServerCreator";
import { BdsDownloadService } from "../obsidian/installer/downloader/BdsDownloadService";
import { BdsVersionRepo } from "../services/db/mysqld/Repository/BdsVersionRepo";
import { ServerJobQueue } from "../obsidian/installer/ServerJobQueue";
import { ObsidianIOService } from "../obsidian/utils/ObsidianOIService";
import path from "path";
import { BdsPropertiesService } from "../obsidian/installer/config/BdsPropertiesService";

export class ServiceContainer {
    private GMAIL_USER = process.env.GMAIL_USER!;
    private GMAIL_PASS = process.env.GMAIL_PASS!;

    private gmailMailer: GmailSender;
    private tokenRepo: TokenRepository;
    public obsidianCore: ObsidianCore

    public userService: UserService;
    public gmailService: GmailService;
    public uuidManager: UuidManager;
    public jwtService: JwtService;

    constructor() {
        // 共有依存性を初期化
        const db = DatabaseConnection.getPool();
        const obsidianLogger = new ObsidianLogger(logger);

        // 基本サービスの組み立て
        this.userService = new UserService(db);
        this.gmailMailer = new GmailSender(this.GMAIL_USER, this.GMAIL_PASS);
        this.gmailService = new GmailService(this.gmailMailer);
        this.tokenRepo = new TokenRepository(db);
        this.uuidManager = new UuidManager(this.tokenRepo);
        this.jwtService = new JwtService();

        // Obsidianが使うDBのリポジトリ層
        const configRepo = new InstanceConfRepo();
        const instanceRepo = new InstanceRepo();
        const versionRepo = new BdsVersionRepo(db);

        // Obsidian関連の依存性を組み立て
        const portManager = new ObsidianPortManager();
        const confService = new ConfigService(obsidianLogger, configRepo, instanceRepo);
        const downloader = new BdsDownloadService(obsidianLogger, versionRepo);
        const ioService = new ObsidianIOService(process.cwd(), obsidianLogger);
        const propertiesWriter = new BdsPropertiesService(obsidianLogger, ioService);
        const serverCreator = new ServerCreator(portManager, confService, downloader, ioService, propertiesWriter, obsidianLogger);
        const buildQueue = new ServerJobQueue(serverCreator, obsidianLogger);

        // ObsidianCoreに依存性を注入して初期化
        this.obsidianCore = new ObsidianCore(buildQueue);
    }
}