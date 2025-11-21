import { IServerProcessManager } from "../process/ServerProcessManager";
import { IRedisStateService } from "../services/RedisStateService";

export interface IServerStateListener {
    getState(): Promise<string | null>;
}

export class ServerStateListener implements IServerStateListener {
    private manager: IServerProcessManager;
    private stateService: IRedisStateService;
    private bindings: Array<() => void> = [];

    constructor(manager: IServerProcessManager, stateService: IRedisStateService) {
        this.manager = manager;
        this.stateService = stateService;

        const events = ['running', 'stopped', 'crashed'] as const;

        // イベント購読
        events.forEach(event => {
            const handler = () => this.handleStateChange(event);
            this.manager.on(event, handler);

            // 後で解除するために保持
            this.bindings.push(() => this.manager.off(event, handler))
        });

        this.manager.once('dispose', () => this.removeListeners());

    }

    private async handleStateChange(state: 'running' | 'stopped' | 'crashed'): Promise<void> {
        await this.stateService.setServerState(this.manager.instanceName, state);
    }

    public async getState(): Promise<string | null> {
        return await this.stateService.getServerState(this.manager.instanceName);
    }

    private removeListeners(): void {
        for (const remove of this.bindings) {
            remove();
        }
        this.bindings = [];
    }
}