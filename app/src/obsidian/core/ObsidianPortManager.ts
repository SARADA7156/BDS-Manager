import { Ports } from "../types/ObsidianCore";
import { bedrockPorts } from '../../config/serverSettings.json';
import { logger } from "../../services/log/logger";
import { ObsidianParamError } from "../errors/ObsidianParamError";
import { CORE_STATUS } from "../errors/coreStatus";

export class ObsidianPortManager {
    // BDSが利用できるポート番号
    private ports: Ports[] = bedrockPorts.map((port) => ({
        port,
        used: false
    }));

    public reserveAvailablePort(): number | null {
        const availablePort = this.ports.find(port => port.used === false);

        if (!availablePort) {
            // portがundefinedだと利用できるポートがないと判断してnullを返す。
            return null;
        }

        // ポートを使用済みに変更(予約)
        availablePort.used = true;

        // 予約したポートを返す
        return availablePort.port;
    }

    public releasePort(port: number): void {
        const usedPort = this.ports.find(p => p.port === port);

        if (!usedPort || !usedPort.used) {
            // 不正な操作(登録されていないポート番号や既に未使用済みのポート)に対して例外を投げる
            throw new ObsidianParamError(CORE_STATUS.BAT_REQUEST, 'bat request', 'The port is already unused or does not exist.');
        }

        // 未使用状態に変更
        usedPort.used = false;
    }
}