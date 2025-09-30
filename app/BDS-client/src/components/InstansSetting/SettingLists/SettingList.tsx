import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { fetchSettingList } from "../../../api/instanceSetting";
import Loader from "../../loader/Loader";

interface TabData {
    id: string;
    text: string;
    active: boolean;
}

interface ActiveTabProps {
    activeTab: string,
    setActiveTab: (index: string) => void;
}

const SettingLists = ({ activeTab, setActiveTab }: ActiveTabProps) => {
    const [lists, setLists] = useState<TabData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showLoader, setShowLoader] = useState(false);


        const fetchData = useCallback(async () => {
            setLoading(true);
            setError(null);

            let timerId = setTimeout(() => {
                // 1秒後にローダーの表示を許可
                setShowLoader(true);
            }, 1000);

            try {
                const list: TabData[] = await fetchSettingList()
                setLists(list);
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
        }, [])


    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <ul id="instance-setting-lists" className="list-unstyled">
            {showLoader && loading && (
                <li>
                    <Loader/>
                    <div className="text-center">リストの取得に時間がかかっています。</div>
                </li>
            )}
            {error && (
                <li className="d-grid justify-content-center">
                    <div className="text-center">リストの読み込みに失敗しました。: {error}</div>
                    <button onClick={fetchData}>再読み込み</button>
                </li>
            )}
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