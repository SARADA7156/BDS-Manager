import { CloseButton } from "../../CloseButton/CloseButton";
import { Connect } from "../Status/Connect";
import { Disconnect } from "../Status/Disconnect";

type ClickToulchipProps = {
    isClicked: boolean;
    setIsClicked: (isClicked: boolean) => void;
}

export const ClickToulchip = ({ isClicked, setIsClicked }: ClickToulchipProps) => {
    return (
        <div id='click-toulchip' className={`bg-dark shadow p-2 ${isClicked ? 'active' : ''}`}>
            <div className="d-grid border-bottom" id="click-toulchip-header">
                <p>サーバーステータスのヘルプ</p>
                <CloseButton onClick={() => setIsClicked(false)} />
            </div>

            <div id="click-toulchip-content">
                <p>WebSocket通信の状態を表すステータスです。</p>
                <div className="mt-2 border-bottom">
                    <Connect />
                    <p>サーバーと接続されている状態です。この状態ではサーバーの様々な状態をリアルタイムで受け取ることができます。</p>
                </div>

                <div className="mt-2 border-bottom">
                    <div className='text-info user-select-none d-flex' title='接続処理中です'>
                        <span className="material-symbols-outlined">wifi_2_bar</span>
                        <p className='ms-1'>接続中...</p>
                    </div>
                    <p>WebSocketを接続している時に表示されます。この状態ではWebSocketの機能を利用することはできません。</p>
                </div>

                <div className="mt-2 border-bottom">
                    <Disconnect />
                    <p>サーバーとの通信が切断されている状態です。クライアント側に何らかの問題があったか、サーバーのアプリケーションそのものが落ちている可能性があります。</p>
                </div>
            </div>
        </div>
    )
}