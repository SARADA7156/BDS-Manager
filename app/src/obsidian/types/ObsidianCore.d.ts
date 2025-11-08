export type Ports = {
    port: number;
    used: boolean;
}

export type ReturnType = {
    result: boolean;
    code: number;
    message: string;
}

export type Resolver = (value: ReturnType | PromiseLike<ReturnType>) => void;
export type Rejecter = (reason?: any) => void;