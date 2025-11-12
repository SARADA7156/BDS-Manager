import { z } from 'zod';

// --- 共通スキーマ ---
const StringBoolean = z.union([z.literal('on'), z.literal('off')]);
const StringNumber = z.string().regex(/^\d+$/, '数値（文字列）である必要があります。');

// --- 定義用ヘルパー ---
const makeEnum = <T extends readonly string[]>(values: T) =>
    z.union(values.map(v => z.literal(v)) as [z.ZodLiteral<T[number]>, ...z.ZodLiteral<T[number]>[]]);

// --- 必須設定 ---
export const ServerConfigSchema = z.object({
    instanceName: z.string().min(1, 'インスタンス名は必須です。'),
    worldName: z.string().min(1, 'ワールド名は必須です。'),

    gamemodeOpt: makeEnum(['survival', 'creative', 'adventure']),
    difficultyOpt: makeEnum(['peaceful', 'easy', 'normal', 'hard']),

    // 真偽値相当
    allowCheats: StringBoolean,
    whiteList: StringBoolean,
    showCoordinates: StringBoolean,
    showdaysplayed: StringBoolean,
    doFireTick: StringBoolean,
    tntExplodes: StringBoolean,
    doMobLoot: StringBoolean,
    doTileDrops: StringBoolean,
    doImmediateRespawn: StringBoolean,
    pvp: StringBoolean,
    locatorBar: StringBoolean,
    dodaylightcycle: StringBoolean,
    keepinventory: StringBoolean,
    domobspawning: StringBoolean,
    doweathercycle: StringBoolean,

    // 数値文字列
    viewDistance: StringNumber,
    tickDistance: StringNumber,
    maxplayers: StringNumber,
    playerIdleTimeout: StringNumber,
    maxThreads: StringNumber,
    compressionThreshold: StringNumber,
    playersSleepingPercentage: StringNumber,

    // その他
    playerDefaultPermission: z.string(),
    levelSeed: z.string(),
});

export type ServerConfig = z.infer<typeof ServerConfigSchema>;

export const InstanceConfigSchema = ServerConfigSchema.transform(cfg => ({
    ...cfg,
    allowCheats: cfg.whiteList === 'on',
    whiteList: cfg.whiteList === 'on',
    showCoordinates: cfg.showCoordinates === 'on',
    showdaysplayed: cfg.showdaysplayed === 'on',
    doFireTick: cfg.doFireTick === 'on',
    tntExplodes: cfg.tntExplodes === 'on',
    doMobLoot: cfg.doMobLoot === 'on',
    doTileDrops: cfg.doTileDrops === 'on',
    doImmediateRespawn: cfg.doImmediateRespawn === 'on',
    pvp: cfg.pvp === 'on',
    locatorBar: cfg.locatorBar === 'on',
    dodaylightcycle: cfg.dodaylightcycle === 'on',
    keepinventory: cfg.keepinventory === 'on',
    domobspawning: cfg.domobspawning === 'on',
    doweathercycle: cfg.doweathercycle === 'on',
    viewDistance: parseInt(cfg.viewDistance, 10),
    tickDistance: parseInt(cfg.tickDistance, 10),
    maxplayers: parseInt(cfg.maxplayers, 10),
    playerIdleTimeout: parseInt(cfg.playerIdleTimeout, 10),
    maxThreads: parseInt(cfg.maxThreads, 10),
    compressionThreshold: parseInt(cfg.compressionThreshold, 10),
    playersSleepingPercentage: parseInt(cfg.playersSleepingPercentage, 10),
}));

export type InstanceConfig = z.infer<typeof InstanceConfigSchema>;
