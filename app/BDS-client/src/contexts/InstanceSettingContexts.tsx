import { createContext, useContext, useState, type ReactNode } from "react";
import type { SettingError } from "../types/InstanceSetting/SettingErrorContext";

export const SettingErrorContext = createContext<SettingError>(null);

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
    // エラー状態を管理するState
    const [errors, setErrors] = useState<Record<string, string>>({});

    // エラーを更新する関数
    const updateError = (name: string, errorMsg: string) => {
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: errorMsg
        }));
    };

    // エラーをクリアする関数
    const clearError = (name: string) => {
        setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            delete newErrors[name];
            return newErrors;
        });
    }

    // エラーの有無をチェックするブール値
    const hasErrors = Object.values(errors).some(error => error !== null && error !== '');

    const value = { errors, updateError, clearError, hasErrors };

    return (
        <SettingErrorContext.Provider value={value}>
            {children}
        </SettingErrorContext.Provider>
    );
};

// カスタムフックを定義
export const useSettingErrors = () => {
    const context = useContext(SettingErrorContext);
    if (!context) {
        throw new Error('useFormErrors must be used within a ErrorProvider');
    }
    return context;
}