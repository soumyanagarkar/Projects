import { create } from 'zustand';

export const useNotificationState = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: (notifications || []).filter((n) => !n.read && !n.isRead).length
    }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...(state.notifications || [])],
      unreadCount: state.unreadCount + (notification.read || notification.isRead ? 0 : 1)
    })),

  markAsRead: (notificationId) =>
    set((state) => {
      const notifications = (state.notifications || []).map((n) =>
        n._id === notificationId ? { ...n, read: true, isRead: true } : n
      );
      return {
        notifications,
        unreadCount: Math.max(
          0,
          notifications.filter((n) => !n.read && !n.isRead).length
        )
      };
    }),

  markAllAsRead: () =>
    set((state) => {
      const notifications = (state.notifications || []).map((n) => ({
        ...n,
        read: true,
        isRead: true
      }));
      return {
        notifications,
        unreadCount: 0
      };
    })
}));

