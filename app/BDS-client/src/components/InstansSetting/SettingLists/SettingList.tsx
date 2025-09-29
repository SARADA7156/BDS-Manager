import { useEffect, useState } from "react";
import axios from "axios";
import { fetchSettingList } from "../../../api/instanceSetting";
import Loader from "../../loader/Loader";

interface TabData {
    id: string;
    text: string;
    active: boolean;
}

const SettingLists = () => {
    const [lists, setLists] = useState<TabData[]>([]);
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
        }
        fetchData();
        // コンポーネントがアンマウントされた際にタイマーをクリア
        return () => clearTimeout(timerId);
        
    }, []);

    return (
        <ul id="instance-setting-lists" className="list-unstyled">
            {showLoader && loading && (
                <div>
                    <Loader/>
                    <div className="text-center">リストの取得に時間がかかっています。</div>
                </div>
            )}
            {error && (
                <div className="d-grid justify-content-center">
                    <div className="text-center">リストの読み込みに失敗しました。: {error}</div>
                    <button onClick={() => window.location.reload()}>再読み込み</button>
                </div>
            )}
            {lists.map((list) => (
                <li
                    key={`list-${list.id}`}
                    id={`list-${list.id}`}
                    title={list.text} className={`${list.active ? 'active' : ''} list-btns`}
                >
                    <p>{list.text}</p>
                </li>
            ))}
        </ul>
    )
}

export default SettingLists;