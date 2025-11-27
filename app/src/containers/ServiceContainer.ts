import { UuidManager } from "../services/auth/UuidManager";
import { DatabaseConnection } from "../services/db/mysqld/DatabaseConnection";
import { TokenRepository } from "../services/db/mysqld/Repository/TokenRepository";
import { UserService } from "../services/db/mysqld/Service/UserService";
import { GmailService } from "../services/mailer/GmailService";
import { GmailSender } from "../services/mailer/mailer";
import { JwtService } from "../services/auth/JwtService";
import { ObsidianCore, IObsidianCore } from "../obsidian/core/ObsidianCore";
import { ObsidianPortManager } from "../obsidian/core/ObsidianPortManager";
import { ConfigService } from "../obsidian/installer/config/ConfigService";
import { ObsidianLogger } from "../obsidian/logger/ObsidianLogger";
import { logger } from "../services/log/logger";
import { InstanceConfRepo } from "../services/db/mongod/repositories/ConfigRepo";
import { InstanceRepo } from "../services/db/mongod/repositories/InstanceRepo";
import { ServerCreator } from "../obsidian/installer/ServerCreator";
import { BdsDownloadService } from "../obsidian/installer/downloader/BdsDownloadService";
import { BdsVersionRepo } from "../services/db/mysqld/Repository/BdsVersionRepo";
import { ObsidianIOService } from "../obsidian/utils/ObsidianOIService";
import { BdsPropertiesService } from "../obsidian/installer/config/BdsPropertiesService";
import { IServerJobWorkerBootstrapper, ServerJobWorkerBootstrapper } from "../obsidian/queue/ServerJobWorkerSetup";
import { ServerJobQueue } from "../obsidian/queue/serverJobQueue";
import { IObsidianWorkerLogger, ObsidianWorkerLogger } from "../obsidian/logger/ObsidianWorkerLogger";
import { ServerManager } from "../obsidian/process/ServerManager";
import { JobPlan } from "../obsidian/jobs/JobPlan";

export class ServiceContainer {
    private GMAIL_USER = process.env.GMAIL_USER!;
    private GMAIL_PASS = process.env.GMAIL_PASS!;

    private gmailMailer: GmailSender;
    private tokenRepo: TokenRepository;
    public obsidianCore: IObsidianCore

    public userService: UserService;
    public gmailService: GmailService;
    public uuidManager: UuidManager;
    public jwtService: JwtService;

    public WorkerBootstrap: IServerJobWorkerBootstrapper;

    constructor() {
        // 共有依存性を初期化
        const db = DatabaseConnection.getPool();

        const obsidianLogger = new ObsidianLogger(logger);
        const isDevelop: boolean = process.env.NODE_ENV === 'production' ? false : true;
        const instanceDir = isDevelop ? 'BDS-servers-test' : 'BDS-servers';
        const projectRoot = process.cwd();

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
        const serverManager = new ServerManager(isDevelop, projectRoot, obsidianLogger);
        const portManager = new ObsidianPortManager();
        const confService = new ConfigService(obsidianLogger, configRepo, instanceRepo);
        const downloader = new BdsDownloadService(obsidianLogger, versionRepo);
        const ioService = new ObsidianIOService(projectRoot, obsidianLogger);
        const propertiesWriter = new BdsPropertiesService(obsidianLogger, ioService);
        const serverCreator = new ServerCreator(portManager, serverManager, confService, downloader, ioService, propertiesWriter, obsidianLogger, instanceDir);

        // Queue関連
        const workerLogger: IObsidianWorkerLogger = new ObsidianWorkerLogger(obsidianLogger);
        const queue = new ServerJobQueue();
        this.WorkerBootstrap = new ServerJobWorkerBootstrapper(serverCreator, workerLogger, serverManager);
        const jobPlan = new JobPlan(obsidianLogger);

        // ObsidianCoreに依存性を注入して初期化
        this.obsidianCore = new ObsidianCore(queue, jobPlan);
    }
}