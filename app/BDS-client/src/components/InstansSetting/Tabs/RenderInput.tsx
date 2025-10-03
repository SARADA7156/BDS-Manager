import type { Setting } from "../../../types/InstanceSetting/InstanceSetting";
import { NumberInput } from "../../Inputs/NumberInput";
import RadioInput from "../../Inputs/RadioInput";
import SwitchInput from "../../Inputs/SwitchInput";
import { Textinput } from "../../Inputs/TextInput";

const RenderInput = (setting: Setting, value: string, onChange: (key: string, value: string, label: string, required: boolean) => void) => {
    switch(setting.type) {
        case 'text':
            return (
                <Textinput
                    key={setting.id}
                    setting={setting}
                    value={value}
                    onChange={(e) => onChange(setting.name, e.target.value, setting.label, setting.required)}
                />
            );
        case 'number':
            return (
                <NumberInput
                    key={setting.id}
                    setting={setting}
                    value={value}
                    onChange={(e) => onChange(setting.name, e.target.value, setting.label, setting.required)}
                />
            );
        case 'radio':
            return (
                <RadioInput
                    key={setting.id}
                    setting={setting}
                    value={value}
                    onChange={(e) => onChange(setting.name, e.target.value, setting.label, setting.required)}
                />
            );
        case 'switch':
            return (
                <SwitchInput
                    key={setting.id}
                    setting={setting}
                    value={value}
                    onChange={(e) => onChange(setting.name, e.target.checked ? 'on' : 'off', setting.label, setting.required)}
                />
            );
        default:
            return null;
    }
}

export default RenderInput;