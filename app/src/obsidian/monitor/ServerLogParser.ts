export type LogCallback = (line: string) => void;

export class ServerLogParser {
    private callbacks: { [key: string]: LogCallback } = {};
    private instanceName: string;

    constructor(instanceName: string) {
        this.instanceName = instanceName;
    }

    registerCallback(keyword: string): Promise<string> {
        return new Promise((resolve) => {
            this.callbacks[keyword] = (line: string) => resolve(line);
        });
    }

    handle(data: Buffer) {
        const line = data.toString();
        console.log(`[MC ${this.instanceName}] ${line}`);

        // キーワードごとにコールバックを呼ぶ
        for (const keyword in this.callbacks) {
            if (line.includes(keyword)) {
                this.callbacks[keyword](line);
            }
        }
    }
}