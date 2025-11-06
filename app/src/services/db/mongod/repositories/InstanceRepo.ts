import { Types } from "mongoose";
import { IInstance, InstanceModel } from "../models/InstanceModel";
import { logger } from "../../../log/logger";

export class InstanceRepo {
    public async findInstance(instanceName: string): Promise<IInstance | null> {
        try {
            return InstanceModel.findOne({ name: instanceName, status: 'created' });
        } catch (err) {
            logger.error(`Error finding instance ${instanceName}:`, err);
            throw err;
        }
    }

    public async registerInstance(
        instanceName: string,
        configId: Types.ObjectId,
        port: number,
        path: string
    ): Promise<IInstance> {
        try {
            return InstanceModel.create({
                name: instanceName,
                configId: configId,
                status: 'created',
                autoBoot: false,
                port: port,
                path: path
            });
        } catch (err) {
            logger.error(`Error registering instance ${instanceName}:`, err);
            throw err;
        }
    }
}