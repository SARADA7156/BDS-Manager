import type React from "react";
import { formatLabel } from "../../utils/format/formatText";
import type { Setting } from "../../types/InstanceSetting/settingTab";

interface TextInputProps {
    setting: Setting;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Textinput = ({ setting, value, onChange }: TextInputProps) => {
    return (
        <div className="d-grid pb-2">
            <label htmlFor={setting.id}>{formatLabel(setting.label)}</label>
            <input type="text" id={setting.id} value={value} name={setting.name} required={setting.required} onChange={onChange} />
        </div>
    )
}