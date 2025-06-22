import isEqual from "lodash/isEqual";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import {
  getMessagesForUser,
  markMessageAsRead,
  messageUser,
} from "../api-services/messaging";

export const useMessagesStore = create((set, get) => ({
  messages: [],
  lastMessages: [],
  messagesLoading: false,
  fetchMessages: async (params) => {
    set({ messagesLoading: true });
    try {
      const data = await getMessagesForUser(params);
      if (!isEqual(data, get().messages)) {
        set({ messages: data });
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      set({ messagesLoading: false });
    }
  },

  getLastMessages: async () => {
    set({ messagesLoading: true });
    try {
      const data = await getMessagesForUser({ last_chats: true });
      if (!isEqual(data, get().lastMessages)) {
        set({ lastMessages: data });
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      set({ messagesLoading: false });
    }
  },

  addOptimisticMessage: (message, error = false) => {
    const tempId = uuidv4();
    const optimisticMessage = {
      ...message,
      id: tempId,
      timestamp: new Date().toISOString(),
      optimistic: true,
      error,
    };

    set((state) => {
      return {
        messages: [...state.messages, optimisticMessage],
      };
    });

    return tempId;
  },

  replaceOptimisticMessage: (tempId, confirmedMessage) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === tempId ? { ...confirmedMessage, optimistic: false } : msg
      ),
    }));
  },

  sendMessage: async (formData, message) => {
    const tempId = get().addOptimisticMessage(message);

    try {
      const confirmed = await messageUser(formData);
      get().replaceOptimisticMessage(tempId, confirmed);
    } catch (err) {
      console.error("Failed to send message", err);
      get().replaceOptimisticMessage(tempId, { ...message, error: true });
    }
  },

  markAllAsRead: async (room_name) => {
    set((state) => ({
      messages: state.messages
        .filter((m) => m.room_name === room_name)
        .map((m) => ({
          ...m,
          read_at: new Date().toUTCString(),
        })),
    }));
    try {
      await markMessageAsRead(room_name);
    } catch (err) {
      console.error("Failed to mark messages as read", err);
    }
  },

  removeMessage: (tempId) => {
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== tempId),
    }));
  },
}));
