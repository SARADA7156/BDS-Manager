import type React from "react";
import { formatLabel } from "../../utils/format/formatText";
import type { Setting } from "../../types/InstanceSetting/InstanceSetting";
import { useState } from "react";

interface NumberInputProps {
    setting: Setting;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const NumberInput = ({ setting, value, onChange }: NumberInputProps) => {
    const [error, setError] = useState<string | null>(null);

    // バリデーションラッパー関数を定義
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue: string = e.target.value;

        newValue = newValue.trim(); // 前後の空白を削除

        if (newValue.length === 0 && setting.required) {
            setError('入力必須項目です。');
            return;
        }

        const validCharacters = /^[0-9]*$/; // 半角数字のみ有効
        if (!validCharacters.test(newValue)) {
            setError('半角数字のみ有効です。');
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
            <div className="d-flex">
                <input
                    type="number"
                    id={setting.id}
                    value={value} name={setting.name}
                    required={setting.required}
                    onChange={handleInputChange}
                    onBlur={handleChange}
                    className={error ? 'inputError' : ''}
                />
                <p>{setting.options[0].label ? setting.options[0].label : ''}</p>
                {error && (<p className="setting-error-msg">※{error}</p>)}
            </div>
        </div>
    )
}