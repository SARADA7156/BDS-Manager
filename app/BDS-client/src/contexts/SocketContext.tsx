import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { setupSocketListeners } from "../services/socketEvents";

interface SocketContextType {
  socket: Socket | null;
  isConnected: "connected" | "connecting" | "disconnect";
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_SERVER_URL: string = import.meta.env.VITE_SOCKET_URL;

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);

  const [isConnected, setIsConnected] =
    useState<"connected" | "connecting" | "disconnect">("connecting");

  const { loading, isAuthenticated, accessToken } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) return;

    // すでに接続済みなら何もしない（再生成を防止）
    if (socketRef.current) return;

    const socket = io(SOCKET_SERVER_URL, {
      auth: { token: accessToken },
    });
    socketRef.current = socket;

    setupSocketListeners(socket);

    socket.on("connect", () => {
      setIsConnected("connected");
      console.log("Socket接続完了");
    });

    socket.on("disconnect", () => {
      setIsConnected("disconnect");
      console.log("Socket切断");
    });

    socket.on("connect_error", (error) => {
      console.error("🚨 Connection Error:", error.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [loading, isAuthenticated]); // accessToken は依存に入れないのが安全

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within SocketProvider");
  return context;
};
