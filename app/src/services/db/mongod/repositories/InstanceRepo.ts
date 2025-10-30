import { Types } from "mongoose";
import { IInstance, InstanceModel } from "../models/InstanceModel";

export class InstanceRepo {
    public async findInstance(instanceName: string): Promise<IInstance | null> {
        return InstanceModel.findOne({ name: instanceName, status: 'created' });
    }

    public async registerInstance(
        instanceName: string,
        configId: Types.ObjectId,
        port: number,
        path: string
    ): Promise<IInstance> {
        return InstanceModel.create({
            name: instanceName,
            configId: configId,
            status: 'created',
            autoBoot: false,
            port: port,
            path: path
        });
    }
}