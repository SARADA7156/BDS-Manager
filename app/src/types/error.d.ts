declare global {
    interface Error {
        data?: { [key: string]: any };
    }
}

export {}