import { InstanceConfigSchema, ServerConfig } from "../../../../../obsidian/entities/instanceConfigSchema";
import { InstanceConfRepo } from "../../repositories/ConfigRepo";
import { ConfigService } from "../../../../../obsidian/installer/config/ConfigService";

jest.mock('../../repositories/ConfigRepo', () => ({
    InstanceConfRepo: jest.fn().mockImplementation(() => ({
        create: jest.fn(),
    })),
}));

jest.mock('../../../../../obsidian/entities/instanceConfigSchema', () => {
    const original = jest.requireActual('../../../../../obsidian/entities/instanceConfigSchema');
    return {
        ...original,
        InstanceConfigSchema: {
            safeParse: jest.fn(),
        }
    }
})

describe('ConfigService', () => {
    let service: ConfigService;
    let mockRepo: jest.Mocked<InstanceConfRepo>;

    const baseConfig: ServerConfig = {
        instanceName: 'test-instance',
        worldName: 'Dedicated-Server',
        gamemodeOpt: 'survival',
        difficultyOpt: 'easy',
        whiteList: 'off',
        showCoordinates: 'on',
        showdaysplayed: 'on',
        doFireTick: 'on',
        tntExplodes: 'on',
        doMobLoot: 'on',
        doTileDrops: 'on',
        doImmediateRespawn: 'off',
        pvp: 'on',
        locatorBar: 'on',
        dodaylightcycle: 'on',
        keepinventory: 'off',
        domobspawning: 'on',
        doweathercycle: 'on',
        viewDistance: '14',
        tickDistance: '4',
        playerIdleTimeout: '30',
        maxThreads: '2',
        compressionThreshold: '1',
        playersSleepingPercentage: '100',
        playerDefaultPermission: 'member',
        levelSeed: ''
    };

    beforeEach(() => {
        jest.clearAllMocks();
        service = new ConfigService();
        mockRepo = (service as any).configRepo;
    });

    test('InstanceConfigSchema.safeParseが正常に呼び出されること', async () => {
        (InstanceConfigSchema.safeParse as jest.Mock).mockReturnValue({
            success: true,
            data: baseConfig
        });

        await service.registerAndPrepareConfig(baseConfig as any, 19132);

        expect(InstanceConfigSchema.safeParse).toHaveBeenCalledTimes(1);
        expect(InstanceConfigSchema.safeParse).toHaveBeenCalled();
    })

    test('正常なconfigを渡すとMongoDBに保存すること。', async () => {

        await service.registerAndPrepareConfig(baseConfig as any, 19132);

        // DBへの保存確認
        expect(mockRepo.create).toHaveBeenCalledTimes(1);
    });

    test('safeParseが失敗した場合はundefinedを返すこと', async () => {
        // スキーマを一時的にモックしてエラーを強制
        const spy = jest.spyOn(InstanceConfigSchema, 'safeParse').mockReturnValue({
            success: false,
            error: new Error('invalid'),
        } as any);

        const result = await service.registerAndPrepareConfig({} as any, 19132);
        expect(result).toBeUndefined();
        expect(mockRepo.create).not.toHaveBeenCalled();

        spy.mockRestore();
    });
});