import type React from "react";
import { formatLabel } from "../../utils/format/formatText";
import type { Setting } from "../../types/InstanceSetting/InstanceSetting";
import { useState } from "react";

interface TextInputProps {
    setting: Setting;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Textinput = ({ setting, value, onChange }: TextInputProps) => {
    const [error, setError] = useState<string | null>(null);

    // バリデーションラッパー関数を定義
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue: string = e.target.value;

        newValue = newValue.trim(); // 前後の空白を削除

        if (newValue.length === 0 && setting.required) {
            setError('入力必須項目です。');
            return;
        }

        const validCharacters = /^[a-zA-Z-]*$/; // 大小アルファベットのみ許可
        if (!validCharacters.test(newValue)) {
            setError('大小半角アルファベットのみ有効です。');
            return;
        }

        setError(null);
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event)
    }

    return (
        <div className="d-grid pb-2">
            <label htmlFor={setting.id}>{formatLabel(setting.label)} {setting.required && (<span className="text-warning">※必須</span>)}</label>
            <input
                type="text"
                id={setting.id}
                value={value}
                name={setting.name}
                required={setting.required}
                onChange={handleInputChange}
                onBlur={handleChange}
                className={error ? 'inputError' : ''}
            />
            {error && (<span className="setting-error-msg">※{error}</span>)}
        </div>
    )
}