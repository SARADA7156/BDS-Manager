import { Schema, model, Types } from "mongoose";

export interface IInstance {
    _id: Types.ObjectId
    name: string;
    configId: Types.ObjectId;
    status: 'created' | 'deleted';
    autoBoot: boolean;
    port: number;
    path: string;
    createdAt: Date;
    updatedAt: Date;
}

const InstanceSchema = new Schema<IInstance>({
    name: { type: String, required: true },
    configId: { type: Schema.Types.ObjectId, ref: 'Config', required: true },
    status: {
        type: String,
        enum: ['created', 'deleted'],
        required: true
    },
    autoBoot: { type: Boolean, default: false },
    port: { type: Number, required: true },
    path: { type: String, required: true }
}, {
    timestamps: true,
});

export const InstanceModel = model<IInstance>('Instance', InstanceSchema);