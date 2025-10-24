import { SocketStatus } from '../SocketStatus/SocketStatus';
import './headerAction.css';
import './header-main.css';

interface HeaderProps {
    isOpen: boolean;
}

const Header = ({ isOpen }: HeaderProps) => {
    return (
        <header className={`main-header ${isOpen ? 'active' : ''} bg-dark`}>
            <div className='p-2 d-grid align-items-center header-content'>
                <div className="d-flex align-items-center BDS-emblem">
                    <img src="/imgs/bedrock_icon.webp" alt="BDS Manager Icon" className="bedrock"></img>
                    <h4 className="mb-0 ms-3"><b>BDS</b>Manager</h4>
                </div>

                <SocketStatus />
            </div>
        </header>
    );
}

export default Header;