import { BDSInstance } from "./instance/BDSInstance";

export class ServerManager {
    private instances: Map<string, BDSInstance> = new Map();

    // サーバーインスタンスを追加
    public addInstance(instance: BDSInstance) {
        this.instances.set(instance.name, instance);
    }
}