import { settingLists } from '../../../config/bedrock.json';
import { useSettingErrors } from '../../../contexts/InstanceSettingContexts';
import { useNotifications, type NotificationsContext } from '../../../contexts/NotificationsContext';

interface ListData {
    id: string;
    text: string;
}

interface ActiveTabProps {
    activeTab: string,
    setActiveTab: (index: string) => void;
}

const SettingLists = ({ activeTab, setActiveTab }: ActiveTabProps) => {
    const lists: ListData[] = settingLists;

    const { hasErrors } = useSettingErrors();

    const context: NotificationsContext = useNotifications();
    if (!context) return null;
    const { addNotification } = context;

    // エラーがない時だけタブを切り替える
    const handleClick = (id: string) => {
        if (!hasErrors) {
            setActiveTab(id);
        } else {
            addNotification(
                '正しいデータが入力されていないため、タブ切り替えがブロックされました。正しいデータを入力してください。',
                'warning',
                6000
            )
        }
    }

    return (
        <ul id="instance-setting-lists" className="list-unstyled">
            {lists.map((list, index) => (
                <li
                    key={index}
                    id={`list-${list.id}`}
                    title={list.text}
                    className={`${activeTab === list.id ? 'active' : ''} list-btns`}
                    onClick={() => handleClick(list.id)}
                >
                    <p>{list.text}</p>
                </li>
            ))}
        </ul>
    )
}

export default SettingLists;