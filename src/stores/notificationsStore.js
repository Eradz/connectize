import { create } from "zustand";
import { markNotificationAsRead } from "../api-services/notifications";

export const useNotificationsStore = create((set, get) => ({
  notifications: [],
  setNotifications: (newNotifications) =>
    set({ notifications: newNotifications }),

  addNotification: (notification) =>
    set((state) => {
      // Only add if not already present
      if (state.notifications.some((n) => n.id === notification.id)) {
        return {};
      }
      return { notifications: [notification, ...state.notifications] };
    }),

  markAsRead: async (id) => {
    const updated = get().notifications.map((notif) =>
      notif.id === id ? { ...notif, is_read: true } : notif
    );
    set({ notifications: updated });

    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  },

  markAllAsRead: () => {
    const updated = get().notifications.map((notif) => ({
      ...notif,
      is_read: true,
    }));
    set({ notifications: updated });
  },

  deleteNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notif) => notif.id !== id),
    }));
  },

  deleteAll: () => set({ notifications: [] }),

  unreadCount: () =>
    get().notifications.filter((notif) => !notif.is_read).length,
}));
