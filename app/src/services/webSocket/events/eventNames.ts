export const SocketEvent = {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
} as const;

export type SocketEventKeys = typeof SocketEvent[keyof typeof SocketEvent];