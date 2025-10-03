import { useState, useEffect } from 'react';
import './instanceSetting.css';
import SettingLists from './SettingLists/SettingList';
import SettingTabs from './Tabs/SettingTabs';
import { settingTabs } from '../../config/bedrock.json';
import type { PreviewData, TabDataSchema } from '../../types/InstanceSetting/InstanceSetting';
import { initializeFormData } from '../../utils/instanceSetting/formDataInitializer';

const InstanceSetting = () => {
    const [activeTab, setActiveTab] = useState('general');
    const tabs = settingTabs as TabDataSchema[];
    const [previewData, setPreviewData] = useState<PreviewData[]>(initializeFormData(tabs));

    useEffect(() => {
        console.log(previewData);
    }, [previewData]);

    return (
        <div className="d-grid bg-dark2" id="settings-container">
            <SettingLists activeTab={activeTab} setActiveTab={setActiveTab}/>
            <SettingTabs activeTab={`${activeTab}-settings`} tabs={tabs} previewData={previewData} setPreviewData={setPreviewData}/>
        </div>
    )
}

export default InstanceSetting;