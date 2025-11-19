import { IServerProcessManager } from "../process/ServerProcessManager";
import { IRedisStateService } from "../services/RedisStateService";

export interface IServerStateListener {
    getState(): Promise<string | null>;
}

export class ServerStateListener implements IServerStateListener {
    private manager: IServerProcessManager;
    private stateService: IRedisStateService;

    constructor(manager: IServerProcessManager, stateService: IRedisStateService) {
        this.manager = manager;
        this.stateService = stateService;

        const events = ['running', 'stopped', 'crashed'] as const;

        // イベント購読
        events.forEach(event => 
            this.manager.on(event, () => this.handleStateChange(event))
        );
    }

    private async handleStateChange(state: 'running' | 'stopped' | 'crashed'): Promise<void> {
        await this.stateService.setServerState(this.manager.instanceName, state);
    }

    public async getState(): Promise<string | null> {
        return await this.stateService.getServerState(this.manager.instanceName);
    }
}