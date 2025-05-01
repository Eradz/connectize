import isEqual from "lodash/isEqual";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { getMessagesForUser, messageUser } from "../api-services/messaging";

export const useMessagesStore = create((set, get) => ({
  messages: [],
  fetchMessages: async (params) => {
    try {
      const data = await getMessagesForUser(params);
      if (!isEqual(data, get().messages)) {
        set({ messages: data });
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
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

    console.log(optimisticMessage);

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

  markAllAsRead: async (room_name, user_id) => {
    set((state) => ({
      messages: state.messages.map((m) => ({
        ...m,
        read_at: new Date().toUTCString(),
      })),
    }));
    try {
      return await markMessageAsRead(room_name, user_id);
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
