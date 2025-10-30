import { z } from 'zod';

// 💡 必須の設定項目をZodのスキーマとして定義します。
export const ServerConfigSchema = z.object({
    // --- 必須の設定項目 (stringとして検証) ---
    instanceName: z.string().min(1, 'インスタンス名は必須です。'),
    worldName: z.string().min(1, 'ワールド名は必須です。'),
    gamemodeOpt: z.union([z.literal('survival'), z.literal('creative'), z.literal('adventure')], {
        error: () => ({ message: 'gamemodeOptは\'survival\', \'creative\', \'adventure\'のいずれかです。' }),
    }),
    difficultyOpt: z.union([z.literal('peaceful'), z.literal('easy'), z.literal('normal'), z.literal('hard')], {
        error: () => ({ message: 'difficultyOptは\'peaceful\', \'easy\', \'normal\', \'hard\'のいずれかです。' }),
    }),
    
    // on/off (真偽値に相当する文字列)
    whiteList: z.union([z.literal('on'), z.literal('off')]),
    showCoordinates: z.union([z.literal('on'), z.literal('off')]),
    showdaysplayed: z.union([z.literal('on'), z.literal('off')]),
    doFireTick: z.union([z.literal('on'), z.literal('off')]),
    tntExplodes: z.union([z.literal('on'), z.literal('off')]),
    doMobLoot: z.union([z.literal('on'), z.literal('off')]),
    doTileDrops: z.union([z.literal('on'), z.literal('off')]),
    doImmediateRespawn: z.union([z.literal('on'), z.literal('off')]),
    pvp: z.union([z.literal('on'), z.literal('off')]),
    locatorBar: z.union([z.literal('on'), z.literal('off')]),
    dodaylightcycle: z.union([z.literal('on'), z.literal('off')]),
    keepinventory: z.union([z.literal('on'), z.literal('off')]),
    domobspawning: z.union([z.literal('on'), z.literal('off')]),
    doweathercycle: z.union([z.literal('on'), z.literal('off')]),

    // 数値 (文字列として検証)
    viewDistance: z.string().regex(/^\d+$/, 'viewDistanceは数値（文字列）である必要があります。'),
    tickDistance: z.string().regex(/^\d+$/, 'tickDistanceは数値（文字列）である必要があります。'),
    playerIdleTimeout: z.string().regex(/^\d+$/, 'playerIdleTimeoutは数値（文字列）である必要があります。'),
    maxThreads: z.string().regex(/^\d+$/, 'maxThreadsは数値（文字列）である必要があります。'),
    compressionThreshold: z.string().regex(/^\d+$/, 'compressionThresholdは数値（文字列）である必要があります。'),
    playersSleepingPercentage: z.string().regex(/^\d+$/, 'playersSleepingPercentageは数値（文字列）である必要があります。'),
    
    // その他の文字列
    playerDefaultPermission: z.string(), 
    
    // --- オプション（空文字を許容）---
    // levelSeedは空文字を許容しているため、必須の文字列として定義
    levelSeed: z.string(), 
});

// スキーマからTypeScriptの型を自動で生成
export type ServerConfig = z.infer<typeof ServerConfigSchema>;

const StringBooleanSchema = z.union([z.literal('on'), z.literal('off')]).transform(val => val === 'on');

const StringNumberSchema = z.string().regex(/^\d+$/).pipe(
  z.coerce.number<string>().int()
);

export const InstanceConfigSchema = z.object({
    // 既存の設定の変換
    instanceName: ServerConfigSchema.shape.instanceName,
    worldName: ServerConfigSchema.shape.worldName,
    gamemodeOpt: ServerConfigSchema.shape.gamemodeOpt,
    difficultyOpt: ServerConfigSchema.shape.difficultyOpt,

    // on/off → booleanに変換
    whiteList: StringBooleanSchema,
    showCoordinates: StringBooleanSchema,
    showdaysplayed: StringBooleanSchema,
    doFireTick: StringBooleanSchema,
    tntExplodes: StringBooleanSchema,
    doMobLoot: StringBooleanSchema,
    doTileDrops: StringBooleanSchema,
    doImmediateRespawn: StringBooleanSchema,
    pvp: StringBooleanSchema,
    locatorBar: StringBooleanSchema,
    dodaylightcycle: StringBooleanSchema,
    keepinventory: StringBooleanSchema,
    domobspawning: StringBooleanSchema,
    doweathercycle: StringBooleanSchema,

    // 数値文字列 → numberに変換
    viewDistance: StringNumberSchema,
    tickDistance: StringNumberSchema,
    playerIdleTimeout: StringNumberSchema,
    maxThreads: StringNumberSchema,
    compressionThreshold: StringNumberSchema,
    playersSleepingPercentage: StringNumberSchema,
    
    playerDefaultPermission: ServerConfigSchema.shape.playerDefaultPermission,
    levelSeed: ServerConfigSchema.shape.levelSeed,
});

// 最終的なデータ型
export type InstanceConfig = z.infer<typeof InstanceConfigSchema>;