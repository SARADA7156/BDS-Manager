import './notificationsContainer.css';
import { useNotifications } from "../../contexts/NotificationsContext";

export const NotificationsContainer = () => {
    const context = useNotifications();

    if (!context) return null;

    const { notifications, removeNotification } = context;

    return (
        <div className="position-fixed end-0 bottom-0 notifications-container">
            {notifications.map((n) => (
                <div key={n.id} className={`level-${n.level} d-grid m-2 bg-dark`}>
                    <div className='notifications d-grid p-2'>
                        <div className='d-grid'>
                            <div className="notice-content d-flex">
                                <span className="material-symbols-outlined">{n.level}</span>
                                <p className='ms-1'>
                                    {n.level === 'info' && <span>通知: </span>}
                                    {n.level === 'warning' && <span>警告: </span>}
                                    {n.level === 'error' && <span>エラー: </span>}
                                </p>
                            </div>
                            <p className='notice-message'>{n.message}</p>
                        </div>
                        <div>
                            <span className="close-btn material-symbols-outlined iconBtn" onClick={() => removeNotification(n.id)}>close</span>
                        </div>
                    </div>
                    <div className='progress' role='progressbar'>
                        <div className={`progress-bar time-${n.duration}ms`}></div>
                    </div>
                </div>
            ))}
        </div>
    )
}