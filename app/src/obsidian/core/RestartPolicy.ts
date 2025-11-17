export interface IRestartPolicy {
    shouldRetry(): boolean;
    reset(): void;
    getRetries(): number;
}

export class RestartPolicy implements IRestartPolicy {
    readonly #maxRetries: number = 3
    readonly #cooldownMs: number = 60000;
    #retries = 0;
    #lastAttempt = 0;

    shouldRetry(): boolean {
        const now = Date.now();
        if (now - this.#lastAttempt < this.#cooldownMs) return false;
        if (this.#retries >= this.#maxRetries) return false;
        this.#lastAttempt = now;
        this.#retries++;
        return true;
    }

    reset() {
        this.#retries = 0;
    }

    getRetries(): number {
        return this.#retries;
    }
}