import type React from "react";
import { formatLabel } from "../../utils/format/formatText";

interface TextInputProps {
    id: string;
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Textinput = ({ id, label, name, value, onChange }: TextInputProps) => {
    return (
        <div className="d-grid">
            <label htmlFor={id}>{formatLabel(label)}</label>
            <input type="text" id={id} value={value} name={name} onChange={onChange} />
        </div>
    )
}