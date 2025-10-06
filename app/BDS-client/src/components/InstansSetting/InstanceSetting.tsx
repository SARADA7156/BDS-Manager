import { useState } from 'react';
import './instanceSetting.css';
import SettingLists from './SettingLists/SettingList';
import SettingTabs from './Tabs/SettingTabs';
import { settingTabs } from '../../config/bedrock.json';
import type { PreviewData, TabDataSchema } from '../../types/InstanceSetting/InstanceSetting';
import { initializeFormData } from '../../utils/instanceSetting/formDataInitializer';
import { useNotifications, type NotificationsContext } from '../../contexts/NotificationsContext';
import { createInstance } from '../../api/instanceSetting';

const InstanceSetting = () => {
    const [activeTab, setActiveTab] = useState('general');
    const tabs = settingTabs as TabDataSchema[];
    const [previewData, setPreviewData] = useState<PreviewData[]>(initializeFormData(tabs));

    const context: NotificationsContext = useNotifications();
    if (!context) return null;
    const { addNotification } = context;

    const handleClick = () => {
        const errorMessages: string[] = []; // エラーリスト

        // エラーチェック
        previewData.forEach(prev => {
            if (prev.required && (prev.value === '' || prev.value === null || prev.value === undefined)) {
                errorMessages.push(`${prev.key}のデータが未入力なため、インスタンスを作成できません。`);
            }
        });

        // エラーが存在したら、通知をまとめて表示し、早期リターン
        if (errorMessages.length > 0) {
            errorMessages.forEach(msg => addNotification(msg, 'error'));
            return; // 即座に処理を中断
        }

        // エラー状態ではなかったら送信用のデータを作成して、apiにデータを送信する。
        const formData = previewData.reduce((acc, cur) => {
            acc[cur.key] = cur.value;
            return acc;
        }, {} as Record<string, string>);

        addNotification('サーバーに作成リクエストを送信しています。', 'info');

        // UI/UXとサーバー負荷を軽減するため送信は遅延させる
        setTimeout(() => {
            try {
                createInstance(formData);
                addNotification('リクエストが受理されました。インスタンスを作成します。※インスタンスの作成には数分かかる場合がございます。', 'info', 6000);
            } catch (error) {
                addNotification('申し訳ございません。サーバー側の不具合でインスタンスを作成できませんでした。少し時間をおいてもう一度お試しください。', 'error');
            }
        }, 2000);
    }

    return (
        <div className="d-grid bg-dark2" id="settings-container">
            <SettingLists activeTab={activeTab} setActiveTab={setActiveTab}/>
            <SettingTabs activeTab={`${activeTab}-settings`} tabs={tabs} previewData={previewData} setPreviewData={setPreviewData} handleClick={handleClick}/>
        </div>
    )
}

export default InstanceSetting;