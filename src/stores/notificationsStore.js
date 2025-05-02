import { create } from "zustand";

export const useNotificationsStore = create((set, get) => ({
  notifications: [],
  setNotifications: (newNotifications) =>
    set({ notifications: newNotifications }),

  markAsRead: (id) => {
    const updated = get().notifications.map((notif) =>
      notif.id === id ? { ...notif, is_read: true } : notif
    );
    set({ notifications: updated });
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
