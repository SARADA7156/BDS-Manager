import { Link, useLocation } from "react-router-dom";
import './sideNav.css';
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import Loader from "../loader/Loader";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

interface SidenavProps {
    isOpen: boolean;
    onToggle: () => void;
}

type MenuItem = {
    id: string;
    link: string;
    label: string;
    icon: string;
}

interface NavApiResponse {
    nav: MenuItem[];
}

const SideNav = ({ isOpen, onToggle }: SidenavProps) => {
    const location = useLocation();
    const [lists, setLists] = useState<MenuItem[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showLoader, setShowLoader] = useState(false);
    const {loading, isAuthenticated} = useAuth();

    useEffect(() => {
        if (loading) return;
        if (!isAuthenticated) return;

        let timerId = setTimeout(() => {
            // 1秒後にローダーの表示を許可
            setShowLoader(true);
        }, 1000);

        axiosClient.get<NavApiResponse>('/sidebar')
            .then(response => {
                setLists(response.data.nav);
            })
            .catch(err => {
                if (axios.isAxiosError(err)) {
                    setError(err.message);
                } else {
                    setError('不明なエラーが発生しました。');
                    console.error('不明なエラーが発生しました。');
                }
            })
            .finally(() => {
                // 通信が完了したらタイマーをクリア
                clearTimeout(timerId);
                setLoading(false);
            });

            // コンポーネントがアンマウントされた際にタイマーをクリア
            return () => clearTimeout(timerId);
    }, [loading, isAuthenticated]);

    return (
        <nav className={`bg-dark min-vh-100 ${isOpen ? 'active' : ''}`} id="sideNav">
            <div>
                <div className="menu-container" onClick={onToggle}>
                    <span className="iconBtn" id="menuBtn" title="メニューを閉じる">
                        <span className="material-symbols-outlined">menu</span>
                    </span>
                </div>

                {showLoader && isLoading && (
                    <div>
                        <Loader/>
                        <div className="text-center">メニューの取得に時間がかかっています。</div>
                    </div>
                )}
                {error && (
                    <div className="d-grid justify-content-center">
                        <div className="text-center">メニューの読み込みに失敗しました。: {error}</div>
                        <button onClick={() => window.location.reload()}>再読み込み</button>
                    </div>
                )}

                <ul className="service-list list-unstyled">
                    {lists.map((list) => (
                        <li key={list.id}>
                            <Link to={list.link} id={`list-${list.id}`} className={location.pathname === list.link ? 'active' : ''} title={list.label}>
                                <span className="material-symbols-outlined">{list.icon}</span>
                                <p>{list.label}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    )
}

export default SideNav;