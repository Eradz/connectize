import { create } from "zustand";
import {
  getNotificationsForUser,
  markNotificationAsRead,
} from "../api-services/notifications";

export const useNotificationsStore = create((set, get) => ({
  notifications: [],

  fetchNotifications: async () => {
    try {
      const notifications = await getNotificationsForUser();

      if (get().notifications.length) {
        console.log(
          "Skipped setting notifications because notification is not empty "
        );

        return;
      }

      // Ensure we always set an array, never undefined
      set({ notifications: Array.isArray(notifications) ? notifications : [] });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      // Don't update state on error, keep existing notifications
    }
  },
  setNotifications: (newNotifications) =>
    set({ notifications: Array.isArray(newNotifications) ? newNotifications : [] }),

  addNotification: (notification) =>
    set((state) => {
      // Only add if not already present
      const currentNotifications = state.notifications || [];
      if (currentNotifications.some((n) => n.id === notification.id)) {
        return {};
      }
      return { notifications: [notification, ...currentNotifications] };
    }),

  markAsRead: async (id) => {
    const currentNotifications = get().notifications || [];
    const updated = currentNotifications.map((notif) =>
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
    const currentNotifications = get().notifications || [];
    const updated = currentNotifications.map((notif) => ({
      ...notif,
      is_read: true,
    }));
    set({ notifications: updated });
  },

  deleteNotification: (id) => {
    set((state) => ({
      notifications: (state.notifications || []).filter((notif) => notif.id !== id),
    }));
  },

  deleteAll: () => set({ notifications: [] }),

  unreadCount: () =>
    get().notifications.filter((notif) => !notif.is_read).length,
}));
