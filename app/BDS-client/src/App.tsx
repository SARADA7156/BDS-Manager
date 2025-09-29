import { Routes, Route, useLocation } from 'react-router-dom'
import HomePage from './pages/homePage/HomePage';
import Footer from './components/Footer';
import Header from './components/header/Header';
import SideNav from './components/SideNav/SideNav';
import Dashboard from './pages/dashboard/Dashboard';
import { useEffect, useState } from 'react';


function App() {
    const location = useLocation();
    const noHeaderPaths = ['/', '/login', '/error']; // ヘッダーを表示しないパス
    const noSideNavPaths = ['/', '/login', '/error']; // サイドナビゲーションを表示しないパス

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
            {showHeader && <Header isOpen={isOpen}/>}
            <div>
                {showSideNav && <SideNav isOpen={isOpen} onToggle={toggleMenu} />}
                <main className='p-0 d-grid'>
                    <Routes>
                        <Route path='/' element={<HomePage />}></Route>
                        <Route path='/dashboard' element={<Dashboard />}></Route>
                    </Routes>
                </main>
                {showFooter && <Footer />}
            </div>
        </>
    )
}

export default App
