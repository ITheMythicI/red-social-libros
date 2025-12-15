import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../api/notifications';
import { toast } from 'react-toastify';
import './NotificationBell.css';

// Función para disparar evento de refresco desde cualquier lugar
export const refreshNotifications = () => {
    window.dispatchEvent(new Event('refreshNotifications'));
};

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const loadUnreadCount = async () => {
        try {
            const data = await getUnreadCount();
            setUnreadCount(data.count);
        } catch (err) {
            console.error('Error loading unread count:', err);
        }
    };

    useEffect(() => {
        loadUnreadCount();
        
        // 5 segundos refresco de notificaciones
        const POLLING_INTERVAL = 5000;
        const interval = setInterval(loadUnreadCount, POLLING_INTERVAL);
        
        // Escuchar evento personalizado para refrescar inmediatamente
        const handleRefreshEvent = () => {
            loadUnreadCount();
        };
        window.addEventListener('refreshNotifications', handleRefreshEvent);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('refreshNotifications', handleRefreshEvent);
        };
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await getNotifications();
            setNotifications(data);
        } catch (err) {
            toast.error('Error al cargar notificaciones');
        } finally {
            setLoading(false);
        }
    };

    const handleBellClick = () => {
        if (!showDropdown) {
            loadNotifications();
        }
        setShowDropdown(!showDropdown);
    };

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.leida) {
                await markAsRead(notification._id);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(notifications.map(n => 
                    n._id === notification._id ? { ...n, leida: true } : n
                ));
            }
            
            if (notification.post) {
                navigate(`/home`);
            } else if (notification.tipo === 'seguidor') {
                navigate(`/usuario/${notification.emisor._id}`);
            }
            
            setShowDropdown(false);
        } catch (err) {
            toast.error('Error al marcar notificación');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setUnreadCount(0);
            setNotifications(notifications.map(n => ({ ...n, leida: true })));
            toast.success('Todas leídas');
        } catch (err) {
            toast.error('Error al marcar todas');
        }
    };

    const getNotificationIcon = (tipo) => {
        switch(tipo) {
            case 'like': return '👍';
            case 'comentario': return '💬';
            case 'seguidor': return '👤';
            case 'mencion': return '@';
            default: return '🔔';
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        
        if (seconds < 60) return 'Ahora';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return `${Math.floor(seconds / 86400)}d`;
    };

    return (
        <div className="notification-bell-container">
            <button className="notification-bell-btn" onClick={handleBellClick}>
                🔔
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {showDropdown && (
                <>
                    <div className="notification-backdrop" onClick={() => setShowDropdown(false)} />
                    <div className="notification-dropdown">
                        <div className="notification-header">
                            <h3>Notificaciones</h3>
                            {unreadCount > 0 && (
                                <button className="mark-all-btn" onClick={handleMarkAllRead}>
                                    Marcar todas
                                </button>
                            )}
                        </div>

                        <div className="notification-list">
                            {loading ? (
                                <p className="notification-empty">Cargando...</p>
                            ) : notifications.length === 0 ? (
                                <p className="notification-empty">No hay notificaciones</p>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`notification-item ${!notification.leida ? 'unread' : ''}`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="notification-icon">
                                            {getNotificationIcon(notification.tipo)}
                                        </div>
                                        <div className="notification-content">
                                            <div className="notification-avatar">
                                                {notification.emisor?.avatarUrl ? (
                                                    <img src={notification.emisor.avatarUrl} alt="" />
                                                ) : (
                                                    <span>{notification.emisor?.nombre?.slice(0, 2).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="notification-text">
                                                <p>{notification.mensaje}</p>
                                                <span className="notification-time">{getTimeAgo(notification.createdAt)}</span>
                                            </div>
                                        </div>
                                        {!notification.leida && <div className="notification-dot" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;

