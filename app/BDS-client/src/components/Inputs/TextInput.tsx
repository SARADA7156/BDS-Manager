import type React from "react";
import { formatLabel } from "../../utils/format/formatText";
import type { Setting } from "../../types/InstanceSetting/InstanceSetting";
import { isRequired, isValid } from "../../utils/validation";
import { toRegExp } from "../../utils/toRegExp";
import { useSettingErrors } from "../../contexts/InstanceSettingContexts";

interface TextInputProps {
    setting: Setting;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Textinput = ({ setting, value, onChange }: TextInputProps) => {
    const {errors, updateError, clearError } = useSettingErrors();

    // バリデーションラッパー関数を定義
    const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue: string = e.target.value;

        newValue = newValue.trim(); // 前後の空白を削除

        if (isRequired(newValue) && setting.required) {
            updateError(setting.name, '入力必須項目です。');
            return;
        }

        const validatonRule = setting.options[0].validatonRules;

        if (validatonRule && !isValid(newValue, toRegExp(validatonRule)) && setting.required) {
            console.log(validatonRule)
            updateError(setting.name, '無効な値が入力されました。');
            return;
        }

        clearError(setting.name);
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event);
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
                onBlur={handleBlur}
                className={errors[setting.name] ? 'inputError' : ''}
            />
            {errors[setting.name] && (<span className="setting-error-msg">※{errors[setting.name]}</span>)}
        </div>
    )
}