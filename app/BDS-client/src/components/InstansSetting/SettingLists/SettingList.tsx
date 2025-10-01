import { settingLists } from '../../../config/bedrock.json';

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

    return (
        <ul id="instance-setting-lists" className="list-unstyled">
            {lists.map((list, index) => (
                <li
                    key={index}
                    id={`list-${list.id}`}
                    title={list.text}
                    className={`${activeTab === list.id ? 'active' : ''} list-btns`}
                    onClick={() => setActiveTab(list.id)}
                >
                    <p>{list.text}</p>
                </li>
            ))}
        </ul>
    )
}

export default SettingLists;