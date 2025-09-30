import { useEffect, useState } from "react";
import { fetchSettingTabs } from "../../../api/instanceSetting";
import axios from "axios";

interface TabProps {
    activeTab: string;
}

const SettingTabs = ({activeTab}: TabProps) => {
        const [tabs, setTabs] = useState<any[]>([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);
        const [showLoader, setShowLoader] = useState(false);
    
    useEffect(() => {
        let timerId = setTimeout(() => {
            // 1秒後にローダーの表示を許可
            setShowLoader(true);
        }, 1000);

        const fetchData = async () => {
            try {
                const tab: any[] = await fetchSettingTabs();
                console.log(tab)
                setTabs(tab);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setError(error.message);
                } else {
                    setError('不明なエラーが発生しました。');
                    console.error('不明なエラーが発生しました。');
                }
            } finally {
                // 通信が完了したらタイマーをクリア
                clearTimeout(timerId);
                setLoading(false);
            }
        }
        fetchData();
        // コンポーネントがアンマウントされた際にタイマーをクリア
        return () => clearTimeout(timerId);
    }, []);

    return (
        <div id='instance-settings'>
            {tabs.map((tab, index) => (
                <div id={tab.id} key={index} className={`${activeTab === tab.id ? 'active' : ''} settings`}>
                    <h4 className="border-bottom">{tab.label}</h4>
                </div>
            ))}
        </div>
    )
}

export default SettingTabs;