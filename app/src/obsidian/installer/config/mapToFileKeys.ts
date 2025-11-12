const KEY_MAP: Record<string, string> = {
    'server-name': 'worldName',
    'gamemode': 'gamemodeOpt',
    'difficulty': 'difficultyOpt',
    'allow-cheats': 'allowCheats',
    'allow-list': 'whiteList',
    'showCoordinates': 'showCoordinates',
    'showdaysplayed': 'showdaysplayed',
    'doFireTick': 'doFireTick',
    'tntExplodes': 'tntExplodes',
    'doMobLoot': 'doMobLoot',
    'doTileDrops': 'doTileDrops',
    'doImmediateRespawn': 'doImmediateRespawn',
    'pvp': 'pvp',
    'locatorBar': 'locatorBar',
    'doDaylightCycle': 'dodaylightcycle',
    'keepInventory': 'keepinventory',
    'doMobSpawning': 'domobspawning',
    'doWeatherCycle': 'doweathercycle',
    'view-distance': 'viewDistance',
    'tick-distance': 'tickDistance',
    'max-players': 'maxplayers',
    'player-idle-timeout': 'playerIdleTimeout',
    'max-threads': 'maxThreads',
    'compression-threshold': 'compressionThreshold',
    'playersSleepingPercentage': 'playersSleepingPercentage',
    'player-default-permission': 'playerDefaultPermission',
    'level-seed': 'levelSeed',
    'server-port': 'port',
};

const REVERSE_KEY_MAP: Record<string, string> = Object.entries(KEY_MAP).reduce(
    (acc, [fileKey, programKey]) => {
        acc[programKey] = fileKey;
        return acc;
    },
    {} as Record<string, string>
);

export function mapToProgramKeys(fileData: Record<string, any>): Record<string, any> {
    const programData: Record<string, any> = {};

    for (const fileKey in fileData) {
        if (Object.prototype.hasOwnProperty.call(fileData, fileKey)) {
            const programKey = KEY_MAP[fileKey];

            // マッピングに存在するキーのみを変換
            if (programKey) {
                programData[programKey] = fileData[fileKey];
            }
        }
    }
    return programData;
}

// プログラムデータ(キャメルケースキー)をファイルやゲーム設定用のキーに変換する
export function mapToFileKeys(programData: Record<string, any>): Record<string, any> {
    const fileData: Record<string, any> = {};

    for (const programKey in programData) {
        if (Object.prototype.hasOwnProperty.call(programData, programKey)) {
            const fileKey = REVERSE_KEY_MAP[programKey];

            if (fileKey) {
                fileData[fileKey] = programData[programKey];
            }
        }
    }
    return fileData;
}