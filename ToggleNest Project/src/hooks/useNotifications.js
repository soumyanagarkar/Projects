import { useEffect } from 'react';
import { useNotificationStore } from '../stores/useStore';
import { useSocket } from './useSocket';
import { useAuthStore } from '../stores/useStore';

export const useNotifications = () => {
    const socket = useSocket();
    const { token } = useAuthStore();
    const {
        notifications,
        unreadCount,
        setNotifications,
        addNotification,
        markAsRead,
        markAllAsRead
    } = useNotificationStore();

    useEffect(() => {
        if (!token) return;

        const fetchNotifications = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/notifications", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                if (Array.isArray(data)) {
                    setNotifications(data);
                }
            } catch (err) {
                console.error("Fetch error:", err);
            }
        };

        fetchNotifications();
    }, [token, setNotifications]);

    useEffect(() => {
        if (!socket) return;

        const handleNewNotif = (notification) => {
            if (typeof notification.title === 'string' && typeof notification.message === 'string') {
                addNotification(notification);
            } else {
                console.error("Blocked a malformed notification object:", notification);
            }
        };

        socket.on("new_notification", handleNewNotif);

        return () => {
            socket.off("new_notification", handleNewNotif);
        };
    }, [socket, addNotification]);

    return { notifications, unreadCount, markAsRead, markAllAsRead };
};
