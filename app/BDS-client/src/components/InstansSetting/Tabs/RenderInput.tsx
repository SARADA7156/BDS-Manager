import type { Setting } from "../../../types/InstanceSetting/settingTab";
import { NumberInput } from "../../Inputs/NumberInput";
import RadioInput from "../../Inputs/RadioInput";
import SwitchInput from "../../Inputs/SwitchInput";
import { Textinput } from "../../Inputs/TextInput";

const RenderInput = (setting: Setting, value: string, onChange: (key: string, value: string) => void) => {
    switch(setting.type) {
        case 'text':
            return (
                <Textinput
                    key={setting.id}
                    setting={setting}
                    value={value}
                    onChange={(e) => onChange(setting.name, e.target.value)}
                />
            );
        case 'number':
            return (
                <NumberInput
                    key={setting.id}
                    setting={setting}
                    value={value}
                    onChange={(e) => onChange(setting.name, e.target.value)}
                />
            );
        case 'radio':
            return (
                <RadioInput
                    key={setting.id}
                    setting={setting}
                    value={value}
                    onChange={(e) => onChange(setting.name, e.target.value)}
                />
            );
        case 'switch':
            return (
                <SwitchInput
                    key={setting.id}
                    setting={setting}
                    value={value}
                    onChange={(e) => onChange(setting.name, e.target.checked ? 'on' : 'off')}
                />
            );
        default:
            return null;
    }
}

export default RenderInput;