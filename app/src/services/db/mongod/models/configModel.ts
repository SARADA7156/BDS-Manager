import { Schema, model, Types } from "mongoose";
import { InstanceConfig } from "../../../../obsidian/entities/instanceConfigSchema";

export interface IConfig extends InstanceConfig {
    _id: Types.ObjectId;
    hash: string;
};

const ConfigSchema = new Schema<IConfig>({
    instanceName: { type: String, required: true },
    worldName: { type: String, required: true },
    gamemodeOpt: {
        type: String,
        required: true,
        enum: ['survival', 'creative', 'adventure']
    },
    difficultyOpt: {
        type: String,
        required: true,
        enum: ['peaceful', 'easy', 'normal', 'hard']
    },
    allowCheats: { type: Boolean, required: true },
    whiteList: { type: Boolean, required: true },
    showCoordinates: { type: Boolean, required: true },
    showdaysplayed: { type: Boolean, required: true },
    doFireTick: { type: Boolean, required: true },
    tntExplodes: { type: Boolean, required: true },
    doMobLoot: { type: Boolean, required: true },
    doTileDrops: { type: Boolean, required: true },
    doImmediateRespawn: { type: Boolean, required: true },
    pvp: { type: Boolean, required: true },
    locatorBar: { type: Boolean, required: true },
    dodaylightcycle: { type: Boolean, required: true },
    keepinventory: { type: Boolean, required: true },
    domobspawning: { type: Boolean, required: true },
    doweathercycle: { type: Boolean, required: true },
    viewDistance: { type: Number, required: true },
    tickDistance: { type: Number, required: true },
    maxplayers: { type: Number, required: true },
    playerIdleTimeout: { type: Number, required: true },
    maxThreads: { type: Number, required: true },
    compressionThreshold: { type: Number, required: true },
    playersSleepingPercentage: { type: Number, required: true },
    playerDefaultPermission: {
        type: String,
        required: true,
        enum: ['visitor', 'member', 'operator']
    },
    levelSeed: { type: String },
    hash: { type: String, required: true, index: true, unique: true }
}, {
    timestamps: true,
});

export const ConfigModel = model<IConfig>('Config', ConfigSchema);