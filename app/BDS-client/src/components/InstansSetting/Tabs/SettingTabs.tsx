import { initializeFormData } from "../../../utils/instanceSetting/formDataInitializer";
import type { TabDataSchema } from "../../../types/InstanceSetting/settingTab";
import { settingTabs } from '../../../config/bedrock.json';
import { useState } from "react";
import { Textinput } from "../../Inputs/TextInput";

interface TabProps {
    activeTab: string;
}

const SettingTabs = ({activeTab}: TabProps) => {
    const tabs = settingTabs as TabDataSchema[];
    const [formData, setFormData] = useState<Record<string, string>>(initializeFormData(tabs));

    const handleChange = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    }

    return (
        <div id='instance-settings'>
            {tabs.map((tab) => (
                <div id={tab.id} key={tab.id} className={`${activeTab === tab.id ? 'active' : ''} settings p-2`}>
                    <h4 className="border-bottom">{tab.label}</h4>
                    <ul>
                        {tab.settings.map((setting) => {
                            switch(setting.type) {
                                case 'text':
                                    return (
                                        <Textinput
                                        id={setting.id}
                                        key={setting.id}
                                        label={setting.label}
                                        name={setting.name}
                                        value={formData[setting.name]}
                                        onChange={(e) => handleChange(setting.name, e.target.value)}
                                        />
                                    );
                                default:
                                    return null;
                            }
                        })}
                    </ul>
                </div>
            ))}
        </div>
    )
}

export default SettingTabs;