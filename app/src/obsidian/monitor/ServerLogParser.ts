export type LogCallback = (line: string) => void;

interface CallBackEntry {
    keyword: string | RegExp;
    once: boolean;
    callBack: LogCallback;
}

export interface IServerLogObserver {
    on(keyword: string | RegExp, callBack: (line: string) => void): void;
    waitFor(keyword: string | RegExp): Promise<string>;
}

export class ServerLogParser implements IServerLogObserver {
    #callbacks: CallBackEntry[] = [];
    #instanceName: string;
    #debug: boolean;

    constructor(instanceName: string, debug: boolean = false) {
        this.#instanceName = instanceName;
        this.#debug = debug;
    }

    // 単発でキーワードを待ち続ける
    waitFor(keyword: string | RegExp): Promise<string> {
        return new Promise((resolve) => {
            this.#callbacks.push({
                keyword,
                once: true,
                callBack: (line) => resolve(line),
            });
        });
    }

    // 永続的にコールバックを登録する
    on(keyword: string | RegExp, callBack: LogCallback): void {
        this.#callbacks.push({
            keyword,
            once: false,
            callBack,
        });
    }

    handle(data: Buffer): void {
        const text = data.toString();
        const lines = text.split(/\r?\n/).filter(Boolean);

        for (const line of lines) {
            if (this.#debug) {
                // わざわざBDSのログをファイルに書き込む必要もないため普通のconsole.log
                console.log(`[MC ${this.#instanceName}] ${line}`);
            }

            // コールバックの発火処理
            this.#callbacks = this.#callbacks.filter((entry) => {
                const matched =
                    typeof entry.keyword === 'string'
                    ? line.includes(entry.keyword)
                    : entry.keyword.test(line);
                
                if (matched) {
                    entry.callBack(line);
                    return !entry.once; // onceなら削除、永続なら残す
                }

                return true;
            });
        }
    }

    // すべてのコールバックを削除
    clear(): void {
        this.#callbacks = [];
    }
}