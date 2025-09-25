import { Link, useLocation } from "react-router-dom";
import './sideNav.css';

const SideNav = () => {
    const location = useLocation();

    const menuItems = [
        { key: 'dashboard', link: '/dashboard', label: 'ダッシュボード', icon: 'dashboard' },
        { key: 'Services', link: '/Services', label: 'サーバー', icon: 'globe' },
        { key: 'createInstance', link: '/createInstance', label: 'サーバー追加', icon: 'add' },
        { key: 'backup', link: '/backup', label: 'バックアップ', icon: 'backup' },
        { key: 'jobs', link: '/jobs', label: 'ジョブ', icon: 'timer' },
        { key: 'info', link: '/info', label: 'サーバー状態', icon: 'host' },
        { key: 'analytics', link: '/analytics', label: 'アナリティクス', icon: 'finance_mode' }
    ]

    return (
        <nav className="bg-dark active min-vh-100" id="sideNav">
            <div>
                <div className="menu-container">
                    <span className="iconBtn" id="menuBtn" title="メニューを閉じる">
                        <span className="material-symbols-outlined">menu</span>
                    </span>
                </div>

                <ul className="service-list list-unstyled">
                    {menuItems.map((item) => (
                        <Link to={item.link} id={`list-${item.key}`} key={item.key} className={location.pathname === item.link ? 'active' : ''}>
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <p>{item.label}</p>
                        </Link>
                    ))}
                </ul>
            </div>
        </nav>
    )
}

export default SideNav;