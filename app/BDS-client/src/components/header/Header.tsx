import type React from 'react';
import './headerAction.css';

interface HeaderProps {
    isOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ isOpen }) => {
    return (
        <header className={`main-header ${isOpen ? 'active' : ''} bg-dark`}>
            <div className='p-2 d-grid align-items-center header-content'>
                <div className="row align-items-center">
                    <div className="d-flex align-items-center col-11 BDS-emblem">
                        <img src="/imgs/bedrock_icon.webp" alt="BDS Manager Icon" className="bedrock"></img>
                        <h4 className="mb-0 ms-3"><b>BDS</b>Manager</h4>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;