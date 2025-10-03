import type { PreviewData, TabDataSchema } from "../../../types/InstanceSetting/InstanceSetting";
import RenderInput from "./RenderInput";
import { formatLabel } from "../../../utils/format/formatText";

interface TabProps {
    activeTab: string;
    tabs: TabDataSchema[];
    previewData: PreviewData[];
    setPreviewData: React.Dispatch<React.SetStateAction<PreviewData[]>>
}

const SettingTabs = ({activeTab, tabs, previewData, setPreviewData}: TabProps) => {

    const handleChange = (key: string, value: string, label: string, required: boolean) => {
        setPreviewData(prev => {
            const exists = prev.find(item => item.key === key);
            if (exists) {
                return prev.map(item => 
                    item.key === key ? { ...item, value, label, required } : item
                );
            }
            return [...prev, { key, value, label, required }];
        });
    }

    return (
        <div>
            <div id='instance-settings'>
                {tabs.map((tab) => (
                    <div id={tab.id} key={tab.id} className={`${activeTab === tab.id ? 'active' : ''} settings custom-scrollbar`}>
                        <h4 className="border-bottom setting-tab-header">{tab.label}</h4>
                        <ul>
                            {tab.settings.map((setting) =>
                                <li key={`list-${setting.id}`}>
                                    {RenderInput(setting, previewData.find(prev => prev.key === setting.name)?.value ?? '', handleChange)}
                                </li>
                                
                            )}
                        </ul>
                    </div>
                ))}
                <div id="preview" className={`${activeTab === 'preview-settings' ? 'active' : ''} settings custom-scrollbar`}>
                    <h4 className="border-bottom setting-tab-header">設定プレビュー</h4>
                    <table className="table table-bordered text-white bg-dark2">
                        <thead>
                            <tr>
                                <th>設定</th>
                                <th>項目</th>
                            </tr>
                        </thead>
                        <tbody>
                        {previewData.map((prev) => 
                            <tr id={`preview-${prev.key}`} key={`preview-${prev.key}`}>
                                <td>{prev.value}</td>
                                <td>{formatLabel(prev.label)}</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default SettingTabs;