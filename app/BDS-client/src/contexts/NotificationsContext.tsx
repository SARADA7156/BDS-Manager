import { createContext, useContext, useRef, useState, type ReactNode } from "react";

export type NotificationsContext = {
    notifications: Notifications[];
    addNotification: (message: string, level: NotificationsLevel, duration?: number) => void;
    removeNotification: (id: number) => void;
} | null;

type Notifications = {
    id: number;
    message: string;
    level: NotificationsLevel;
    duration: number;
}

type NotificationsLevel = 'info' | 'warning' | 'error'
type TimeoutMap = Record<number, ReturnType<typeof setTimeout>>;

const NotificationsContext = createContext<NotificationsContext>(null);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
    // 複数の通知をまとめて管理
    const [notifications, setNotifications] = useState<Notifications[]>([]);
    const timeouts = useRef<TimeoutMap>({}); // 自動削除をまとめて管理

    // 追加
    const addNotification = (message: string, level: NotificationsLevel, duration: number = 5000) => {
        const id = Date.now()
        const newNotification = { id: id, message: message, level: level, duration: duration };
        setNotifications((prevNotifications) => [...prevNotifications, newNotification]);

        // 自動で削除
        timeouts.current[id] = setTimeout(() => {
            removeNotification(id);
        }, duration);
    };

    // 削除
    const removeNotification = (id: number) => {
        clearTimeout(timeouts.current[id]);
        delete timeouts.current[id];

        setNotifications((prevNotifications) => 
            prevNotifications.filter((notification) => notification.id !== id)
        );
    };

    return (
        <NotificationsContext.Provider value={{ notifications, addNotification, removeNotification }}>
            { children }
        </NotificationsContext.Provider>
    );
};

export const useNotifications = () => {
    return useContext(NotificationsContext);
}