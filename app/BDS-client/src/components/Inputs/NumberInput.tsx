import type React from "react";
import { formatLabel } from "../../utils/format/formatText";
import type { Setting } from "../../types/InstanceSetting/InstanceSetting";
import { isRequired, isValid } from "../../utils/validation";
import { useSettingErrors } from "../../contexts/InstanceSettingContexts";

interface NumberInputProps {
    setting: Setting;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const NumberInput = ({ setting, value, onChange }: NumberInputProps) => {
    const {errors, updateError, clearError } = useSettingErrors();

    // バリデーションラッパー関数を定義
    const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue: string = e.target.value;

        newValue = newValue.trim();

        if (isRequired(newValue) && setting.required) {
            updateError(setting.name, '入力必須項目です。');
            return;
        }

        // string型の数字を数値データへ変換
        const numValue = Number(newValue);

        const max = setting.options[0].max; // スキーマの入力上限
        const min = setting.options[0].min; // スキーマの入力下限
        // 入力上限・下限よりも多いまたは少ない場合はエラーを出す。
        if (max && numValue > Number(max)) {
            updateError(setting.name, `最大値は${max}です。${max}以下の値を入力してください。`);
            return;
        } else if (min && numValue < Number(min)) {
            updateError(setting.name, `最小値は${min}です。${min}以上の値を入力してください。`);
            return;
        }

        const validCharacters = /^[0-9]*$/; // 半角数字のみ有効
        if (!isValid(newValue, validCharacters)) {
            updateError(setting.name, '半角数字のみ有効です。');
            return;
        }

        clearError(setting.name);
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
                    onBlur={handleBlur}
                    className={errors[setting.name] ? 'inputError' : ''}
                    max={setting.options[0].max}
                    min={setting.options[0].min}
                />
                <p>{setting.options[0].label ? setting.options[0].label : ''}</p>
                {errors[setting.name] && (<p className="setting-error-msg">※{errors[setting.name]}</p>)}
            </div>
        </div>
    )
}