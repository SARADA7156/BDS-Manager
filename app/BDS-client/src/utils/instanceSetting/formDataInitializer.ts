import type { SettingOptions, TabDataSchema } from "../../types/InstanceSetting/settingTab";

export const initializeFormData = (config: TabDataSchema[]): Record<string, string> => {
    const initialData: Record<string, string> = {};

    config.forEach(tab => {
        tab.settings.forEach(setting => {
            // 各項目にnameがあるか確認
            if (setting.name) {
                let defaultValue: string = '';

                // タイプごとに初期値を見つける
                switch (setting.type) {
                    case 'text':
                    case "number":
                        // typeがtextまたはnumberの際は、最初のoptionのvalueを初期値とする
                        if (setting.options && setting.options.length > 0 && setting.options[0].value !== undefined) {
                            defaultValue = setting.options[0].value;
                        }
                        break;
                    case "radio":
                        // typeがradioまたはswitchの際は、checkedの値がtrueのoptionsのvalueを初期値とする
                        const checkedOption: SettingOptions | undefined = setting.options.find(opt => opt.checked === true);
                        if (checkedOption && checkedOption.value !== undefined) {
                            defaultValue = checkedOption.value;
                        }
                        break;
                    case "switch":
                        // checkedの真偽値によってon/offを切り替える
                        const isChecked: SettingOptions | undefined = setting.options.find(opt => opt.checked);
                        if (isChecked && isChecked.checked && isChecked.value) {
                            defaultValue = isChecked.value;
                        } else {
                            defaultValue = 'off';
                        }
                        break;
                    default:
                        break;
                }

                initialData[setting.name] = defaultValue;
            }
        });
    });
    return initialData;
}