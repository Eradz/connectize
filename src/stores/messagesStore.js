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
  openedMessage: null,
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

  setOpenedMessage: async (message, room_name) => {
    // If we have a specific message, set it directly
    if (message) {
      set({ openedMessage: message });
      return;
    }

    // Handle room_name case
    if (room_name) {
      // First check if we already have this room in lastMessages
      const existingMessage = get().lastMessages.find((m) => m.room_name === room_name);
      if (existingMessage) {
        set({ openedMessage: existingMessage });
        return;
      }

      // If no existing message found, parse room_name to get recipient info
      // room_name format: "room_currentUserId_recipientId"
      const roomParts = room_name.split('_');
      if (roomParts.length === 3 && roomParts[0] === 'room') {
        const currentUserId = parseInt(roomParts[1]);
        const recipientId = parseInt(roomParts[2]);
        
        // Create a minimal openedMessage for new chats
        set({ 
          openedMessage: {
            room_name: room_name,
            other_user: { id: recipientId },
          }
        });
        return;
      }

      if (get().lastMessages.length === 0) {
        set({ messagesLoading: true });
        await get().getLastMessages();
        set({ messagesLoading: false });

        const foundMessage = get().lastMessages.find((m) => m.room_name === room_name);
        if (foundMessage) {
          set({ openedMessage: foundMessage });
        }
      }
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
