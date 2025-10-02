import type React from "react";
import { formatLabel } from "../../utils/format/formatText";
import type { Setting } from "../../types/InstanceSetting/settingTab";
import { useState } from "react";

interface SwitchInputProps {
    setting: Setting;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SwitchInput = ({ setting, value, onChange }: SwitchInputProps) => {
    const [selected, setSelected] = useState<string>(value);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelected(event.target.checked ? 'on' : '');
        onChange(event);
    }

    return (
        <div className="form-check form-switch pb-2 user-select-none" id={setting.id}>
            <label htmlFor={setting.options[0].optId} className="form-check-label">{formatLabel(setting.label)}</label>
            <input
                type="checkbox"
                role="switch"
                className="form-check-input"
                id={setting.options[0].optId}
                checked={selected === 'on' ? true : false}
                onChange={handleChange}
            />
        </div>
    )
}

export default SwitchInput;