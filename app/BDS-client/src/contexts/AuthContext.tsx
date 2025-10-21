import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface AuthContextType {
    accessToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const API_URL: string = import.meta.env.VITE_LOGIN_URL;
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshAccessToken = async () => {
        try {
            const response = await fetch(`${API_URL}/refresh`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setAccessToken(data.accessToken);
            } else {
                setAccessToken(null);
            }
        } catch {
            setAccessToken(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshAccessToken();
    }, []);

    const login = (token: string) => {
        setAccessToken(token);
    }

    const logout = () => {
        setAccessToken(null);
    }

    const value = {
        accessToken,
        isAuthenticated: !!accessToken,
        loading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}