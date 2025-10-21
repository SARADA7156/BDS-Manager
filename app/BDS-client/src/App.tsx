import { Routes, Route, useLocation } from 'react-router-dom'
import HomePage from './pages/homePage/HomePage';
import Footer from './components/Footer';
import Header from './components/header/Header';
import SideNav from './components/SideNav/SideNav';
import Dashboard from './pages/dashboard/Dashboard';
import { useEffect, useState } from 'react';
import Create from './pages/createInstance/createInstance';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { NotificationsContainer } from './components/Notice/NotificationsContainer';
import { VerifyToken } from './pages/verifyToken/VerifyToken';
import Login from './pages/login/Login';


function App() {
    const location = useLocation();
    const noHeaderPaths = ['/', '/login', '/error', '/auth/login/token']; // ヘッダーを表示しないパス
    const noSideNavPaths = ['/', '/login', '/error', '/auth/login/token']; // サイドナビゲーションを表示しないパス

    const showHeader = !noHeaderPaths.includes(location.pathname);
    const showSideNav = !noSideNavPaths.includes(location.pathname);
    const showFooter = location.pathname === '/';

    const [isOpen, setIsOpen] = useState(() => {
        const saved = localStorage.getItem('sideNavOpen');
        return saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem('sideNavOpen', String(isOpen));
    }, [isOpen]);

    const toggleMenu = () => setIsOpen((prev) => !prev);

    return (
        <>
            <NotificationsProvider>
                {showHeader && <Header isOpen={isOpen}/>}
                <div>
                    {showSideNav && <SideNav isOpen={isOpen} onToggle={toggleMenu} />}
                    <main className='p-0 d-grid'>
                        <div className={showSideNav ? `main-container row justify-content-center ${isOpen ? 'nav-active' : 'nav-no-active'}` : ''}>
                            <Routes>
                                <Route path='/' element={<HomePage />}></Route>
                                <Route path='/login' element={<Login />}></Route>
                                <Route path='/auth/login/token' element={<VerifyToken />}></Route>
                                <Route path='/dashboard' element={<Dashboard />}></Route>
                                <Route path='/createInstance' element={<Create />}></Route>
                            </Routes>
                        </div>
                    </main>
                    {showFooter && <Footer />}
                    <NotificationsContainer/>
                </div>
            </NotificationsProvider>
        </>
    )
}

export default App
