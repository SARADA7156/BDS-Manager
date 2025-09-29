import './instanceSetting.css';
import SettingLists from './SettingLists/SettingList';

const InstanceSetting = () => {
    return (
        <div className="d-grid bg-dark2" id="settings-container">
            <SettingLists/>
            <div id='instance-settings'></div>
        </div>
    )
}

export default InstanceSetting;