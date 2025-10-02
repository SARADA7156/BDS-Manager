import type React from "react";
import { formatLabel } from "../../utils/format/formatText";
import type { Setting } from "../../types/InstanceSetting/InstanceSetting";

interface NumberInputProps {
    setting: Setting;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const NumberInput = ({ setting, value, onChange }: NumberInputProps) => {
    return (
        <div className="d-grid pb-2">
            <label htmlFor={setting.id}>{formatLabel(setting.label)}</label>
            <div className="d-flex">
                <input type="number" id={setting.id} value={value} name={setting.name} required={setting.required} onChange={onChange} />
                <p>{setting.options[0].label ? setting.options[0].label : ''}</p>
            </div>
        </div>
    )
}