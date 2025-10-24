import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { io, Socket } from 'socket.io-client';
import { useAuth } from "./AuthContext";

interface SocketContextType {
    socket: Socket | null;
    isConnected: 'connected' | 'connecting' | 'disconnect';
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_SERVER_URL: string = import.meta.env.VITE_SOCKET_URL;

export const SocketProvider = ({children}: {children: ReactNode}) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState<'connected' | 'connecting' | 'disconnect'>('connecting');
    const {loading, isAuthenticated, accessToken} = useAuth(); // アクセストークンがセットされているかの状態

    useEffect(() => {
        // アクセストークンセットされていない状態の際は何もしない
        if (loading) return;
        if (!isAuthenticated) return;

        // 接続の確立
        const newSocket = io(SOCKET_SERVER_URL, {
            auth: { token: accessToken }
        });

        // イベントハンドラーの設定
        newSocket.on('connect', () => {
            setIsConnected('connected');
            console.log('Socket接続完了');
        });

        newSocket.on('disconnect', () => {
            setIsConnected('disconnect');
            console.log('Socket切断');
        });

        newSocket.on('connect_error', (error) => {
            console.error("🚨 Connection Error:", error.message);
        })

        setSocket(newSocket);

        // クリーンアップ
        return () => {
            newSocket.disconnect();
        };
    }, [loading, isAuthenticated, accessToken]);

    const value = {
        socket,
        isConnected
    };

    return (
        <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
    )
}

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) throw new Error('useSocket must be used within SocketProvider');
    return context;
}