import { useState } from 'react';
import './instanceSetting.css';
import SettingLists from './SettingLists/SettingList';
import SettingTabs from './Tabs/SettingTabs';

const InstanceSetting = () => {
    const [activeTab, setActiveTab] = useState('general');

    return (
        <div className="d-grid bg-dark2" id="settings-container">
            <SettingLists activeTab={activeTab} setActiveTab={setActiveTab}/>
            <SettingTabs activeTab={`${activeTab}-settings`}/>
        </div>
    )
}

export default InstanceSetting;