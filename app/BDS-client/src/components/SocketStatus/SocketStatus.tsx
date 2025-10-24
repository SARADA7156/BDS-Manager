import './SocketStatus.css';
import { useSocket } from "../../contexts/SocketContext";
import { useEffect, useState } from 'react';
import { useNotifications, type NotificationsContext } from '../../contexts/NotificationsContext';
import { Disconnect } from './Status/Disconnect';
import { Connect } from './Status/Connect';
import { ClickToulchip } from './Toulchip/ClickToulchip';

export const SocketStatus = () => {
    const {isConnected} = useSocket();
    const context: NotificationsContext = useNotifications();
    if (!context) return null;
    const { addNotification } = context;

    const [displayValue, setDisplayValue] = useState(isConnected);
    const [signalCount, setSignalCount] = useState(0);

    useEffect(() => {
        if (isConnected !== displayValue) {
            if (isConnected === 'connected' && displayValue === 'connecting') {
                // connectingからconnectedになる際のみ遅延
                const timer = setTimeout(() => {
                    setDisplayValue(isConnected);
                }, 2000);

                return () => clearTimeout(timer);
            } else {
                // connectedからdisconnectは即時反映
                setDisplayValue(isConnected);
                if (isConnected === 'disconnect') {
                    addNotification(
                        'ネットワークエラー サーバーとの接続が切れました。インターネット接続を確認するかサーバーがダウンした可能性があります。',
                        'error',
                        10000
                    )
                }
            }
        } 
    }, [isConnected, displayValue]);

    useEffect(() => {
        // displayValueがconnectingである場合だけアニメーションを動かす
        if (displayValue === 'connecting') {
            const anime = setInterval(() => {
                setSignalCount(prevCount => {
                    return prevCount < 2 ? prevCount + 1 : 0;
                });
            }, 300);

            return () => clearInterval(anime);
        }
    }, [displayValue]);

    const [isClicked, setIsClicked] = useState(false);

    return (
        <div id='websocket-status-icon' onClick={() => setIsClicked(!isClicked)}>
            <div id='socket-status'>
                {displayValue === 'connected' && <Connect />}

                {displayValue === 'connecting' && 
                    <div className='text-info user-select-none d-flex' title='サーバーと接続中です'>
                        {signalCount === 0 && <span className="material-symbols-outlined">wifi_1_bar</span>}

                        {signalCount === 1 && <span className="material-symbols-outlined">wifi_2_bar</span>}

                        {signalCount === 2 && <span className="material-symbols-outlined">wifi</span>}
                        <p className='ms-1'>接続中...</p>
                    </div>
                }

                {displayValue === 'disconnect' && <Disconnect />}
            </div>

            <div id='socket-toulchips'>
                <ClickToulchip isClicked={isClicked} setIsClicked={setIsClicked} />
            </div>
        </div>
    )
}