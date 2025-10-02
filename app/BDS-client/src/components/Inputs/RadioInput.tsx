import type React from "react";
import { formatLabel } from "../../utils/format/formatText";
import type { Setting } from "../../types/InstanceSetting/settingTab";
import { useState } from "react";

interface RadioInputProps {
    setting: Setting;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const RadioInput = ({ setting, value, onChange }: RadioInputProps) => {
    const [selected, setSelected] = useState<string>(value);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelected(event.target.value);
        onChange(event);
    }

    return (
        <div className="d-grid pb-2" id={setting.id}>
            <p>{formatLabel(setting.label)}</p>
            <div className="d-flex">
                {setting.options.map((opt) => (
                    <div key={opt.optId}>
                        <input
                            type="radio"
                            className="btn-check"
                            name={setting.name}
                            id={opt.optId}
                            autoComplete="off"
                            value={opt.value}
                            checked={selected === String(opt.value)}
                            onChange={handleChange}
                        />
                        <label htmlFor={opt.optId} className={`btn ${selected === opt.value ? 'btn-green' : 'btn-gray'}`}>
                            {opt.label}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RadioInput;