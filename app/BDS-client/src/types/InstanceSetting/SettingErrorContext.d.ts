export type SettingError = { 
    errors: Record<string, string>;
    updateError: (name: string, errorMsg: string) => void;
    clearError: (name: string) => void;
    hasErrors: boolean;
} | null;
