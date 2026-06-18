import isEqual from "lodash/isEqual";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import {
  favoriteChat,
  getFavoriteChats,
  getMessagesForUser,
  markMessageAsRead,
  messageUser,
} from "../api-services/messaging";
import { getUserById } from "../api-services/users";
import { getSession } from "../lib/session";
import { toast } from "sonner";

function getCurrentUserId() {
  const session = getSession();
  return session?.user?.id || session?.id;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : value;
}

function dedupeMessages(messages) {
  const seen = new Set();
  return messages.filter((message) => {
    const key = message?.id ?? message?.tempId;
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * @typedef {} ChatMessage
 * @property {}
 *
 */

// Cache duration for messages (2 minutes)
const MESSAGE_CACHE_DURATION = 2 * 60 * 1000;

export const useMessagesStore = create((set, get) => ({
  /**
   * @type {Record<String, ChatMessage[]>}
   */
  messages: {},
  // messages: [],
  // chatMessages: {},
  lastMessages: [],
  
  // Cache timestamp for smart refetching
  lastMessagesFetchedAt: null,

  // an array of room_names
  favoriteChats: [],

  openedMessage: null,
  messagesLoading: false,
  lastMessagesLoading: false,

  /**
   *
   * @param {{room_name:string}} params
   */
  fetchMessages: async (params) => {
    if (!params.room_name) return;

    console.log("🔄 Fetching messages with params:", params);
    set({ messagesLoading: true });

    try {
      //
      const data = await getMessagesForUser(params);
      //
      // console.log("✅ Fetched messages:", data);

      const sortedMessages = (data || []).sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      //
      //
      // Only set messages if we don't have any, to avoid clearing WebSocket messages
      set((state) => {
        if ((state.messages[params.room_name] || []).length === 0) {
          console.log("✅ Setting initial messages, count:", data?.length || 0);
          return {
            messages: {
              ...state.messages,
              [params.room_name]: sortedMessages,
            },
          };
        } else {
          console.log(
            "⚠️ Skipping message replacement, already have messages:",
            state.messages.length
          );
          return state;
        }
      });
    } catch (err) {
      console.error("❌ Failed to fetch messages:", err);
      set({ messages: {} });
    } finally {
      set({ messagesLoading: false });
    }
  },

  /**
   * @description Fetches and sets the last chats and favorite
   * Cache time: Only refetch if data is older than 2 minutes
   * @param {boolean} forceRefresh - Force fetch even if cache is fresh
   * @returns
   */
  getLastMessages: async (forceRefresh = false) => {
    // prevent multiple fetches (especially in dev mode)
    if (get().lastMessagesLoading) {
      return;
    }
    
    // ✅ Use cached data if fresh (under 2 minutes old)
    const lastFetchTime = get().lastMessagesFetchedAt;
    const now = Date.now();
    if (!forceRefresh && lastFetchTime && (now - lastFetchTime) < MESSAGE_CACHE_DURATION) {
      console.log("✅ [Messages] Using cached data, age:", Math.round((now - lastFetchTime) / 1000), "seconds");
      return;
    }
    
    try {
      set({ lastMessagesLoading: true });
      let data = await getMessagesForUser({ last_chats: true });

      const favData = await getFavoriteChats();

      console.log({ favData, data, map: data?.map });

      const flattenedFavoriteChats = favData.map((c) => c.room_name);

      // if (favData.length) {
      //   data = data.map((chat) => {
      //     console.log({ favData });
      //     const favoritedChat = favData?.find(
      //       (fav) =>
      //         fav.other_user?.id && fav.other_user?.id === chat.other_user?.id
      //     );

      //     if (favoritedChat) {
      //       chat.isFavorite = true;
      //     }
      //     return chat;
      //   });
      // }

      // log;
      console.log("🔍 Raw lastMessages from API:", data);

      console.log("✅ Processed lastMessages:", data);
      set({ 
        lastMessages: data, 
        favoriteChats: flattenedFavoriteChats,
        lastMessagesFetchedAt: Date.now() // ✅ Track cache time
      });
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      set({ lastMessagesLoading: false });
    }
  },

  /**
   *
   * @param {string} room_name
   * @param {ChatMessage | undefined} fallbackMsg
   * @returns {ChatMessage | undefined}
   */
  getLastMsgInChatRoom: (room_name, fallbackMsg) => {
    if (!room_name) return fallbackMsg;
    const roomMsgs = get().messages[room_name] || [];
    return roomMsgs.at(-1) || fallbackMsg;
  },

  setOpenedMessage: async (message, room_name) => {
    console.log("🔍 setOpenedMessage called with:", { message, room_name });

    // If we have a specific message, set it directly
    if (message) {
      console.log("✅ Setting opened message directly:", message);
      set({ openedMessage: message });
      return;
    }

    // Handle room_name case
    if (room_name) {
      console.log("🔍 Handling room_name:", room_name);

      // First check if we already have this room in lastMessages
      const existingMessage = get().lastMessages.find(
        (m) => m.room_name === room_name
      );
      console.log("🔍 Existing message found:", existingMessage);

      if (existingMessage) {
        console.log("✅ Using existing message from lastMessages");
        set({ openedMessage: existingMessage });
        return;
      }

      // Parse room_name to get recipient info
      const roomParts = room_name.split("_");
      // console.log("🔍 Room parts:", roomParts);

      if (roomParts.length === 3 && roomParts[0] === "room") {
        const id1 = parseInt(roomParts[1]);
        const id2 = parseInt(roomParts[2]);
        const actualCurrentUserId = getCurrentUserId();
        // The recipient is whichever ID is NOT the current user
        const recipientId = (id1 === actualCurrentUserId) ? id2 : id1;
        const currentUserId = (id1 === actualCurrentUserId) ? id1 : id2;
        console.log(
          "🔍 Parsed IDs - current:",
          currentUserId,
          "recipient:",
          recipientId
        );

        try {
          console.log("🔄 Fetching user data for ID:", recipientId);
          const recipientUser = await getUserById(recipientId);
          // console.log("✅ Fetched user data:", recipientUser);

          const openedMessageData = {
            room_name: room_name,
            other_user: {
              id: recipientId,
              first_name: recipientUser.first_name,
              last_name: recipientUser.last_name,
              avatar: recipientUser.avatar,
              role: recipientUser.role,
              email: recipientUser.email,
            },
          };

          // console.log(
          //   "✅ Setting openedMessage with fetched data:",
          //   openedMessageData
          // );
          set({ openedMessage: openedMessageData });
          return;
        } catch (error) {
          console.error("❌ Failed to fetch recipient user data:", error);
          set({
            openedMessage: {
              room_name: room_name,
              other_user: {
                id: recipientId,
              },
            },
          });
          return;
        }
      }
    }
  },

  addOptimisticMessage: (room_name, message, error = false) => {
    const tempId = uuidv4();
    const optimisticMessage = {
      ...message,
      id: tempId,
      timestamp: new Date().toISOString(),
      optimistic: true,
      error,
    };

    set((state) => {
      const newMsgs = [...(state.messages[room_name] || []), optimisticMessage];
      return {
        messages: { ...state.messages, [room_name]: newMsgs },
        // messages: [...state.messages, optimisticMessage],
      };
    });

    return tempId;
  },

  replaceOptimisticMessage: (room_name, tempId, confirmedMessage) => {
    set((state) => {
      const newMsgs = (state.messages[room_name] || []).map((msg) => {
        return msg.id === tempId
          ? { ...confirmedMessage, optimistic: false }
          : msg;
      });
      return {
        messages: { ...state.messages, [room_name]: newMsgs },
      };
    });
  },

  /**
   *
   * @param {string} room_name
   * @param {*} formData
   * @param {*} message
   * @param {{onAfterOptimistic:()=>void}} opts
   */
  sendMessage: async (room_name, formData, message, opts) => {
    if (!room_name) return;

    const tempId = get().addOptimisticMessage(room_name, message);

    // if (opts.onAfterOptimistic) opts.onAfterOptimistic();

    try {
      const confirmed = await messageUser(formData);
      get().replaceOptimisticMessage(room_name, tempId, confirmed);
      get().updateLastMessages(confirmed);
    } catch (err) {
      console.error("Failed to send message", err);
      get().replaceOptimisticMessage(room_name, tempId, {
        ...message,
        error: true,
      });
    }
  },

  markAllAsRead: async (room_name) => {
    console.log("📖 Marking all as read for room:", room_name);

    set((state) => {
      const room_msgs = state.messages[room_name] || [];

      const updatedMessages = room_msgs.map((m) =>
        // there is probably not need for this check any more since all the messages are already for this room_name
        m.room_name === room_name
          ? { ...m, read_at: new Date().toUTCString() }
          : m
      );

      const updatedLastMessages = state.lastMessages.map((m) =>
        m.room_name === room_name ? { ...m, unread_count: 0 } : m
      );

      console.log("✅ Updated unread counts for room:", room_name);

      return {
        messages: {
          ...state.messages,
          [room_name]: updatedMessages,
        },
        lastMessages: updatedLastMessages,
      };
    });

    try {
      await markMessageAsRead(room_name);
      console.log("✅ Backend mark as read successful");
    } catch (err) {
      console.error("❌ Failed to mark messages as read:", err);
    }
  },

  /**
   *
   * @param {string} room_name
   * @param {(string | number)} tempId
   */
  removeMessage: (room_name, tempId) => {
    set((state) => {
      const room_msgs = state.messages[room_name] || [];
      return {
        messages: {
          ...state.messages,
          [room_name]: room_msgs.filter((m) => m.id !== tempId),
        },
      };
    });
  },

  setLastMessages: (newLastMessages) => {
    set({ lastMessages: newLastMessages });
  },

  /**
   *
   * @param {string} room_name
   * @param {Record<string, any>} newMessage
   */
  addRealtimeMessage: (room_name, newMessage) => {
    if (!room_name) return;
    console.log("📨 Adding realtime message:", newMessage);

    set((state) => {
      let room_msgs = state.messages[room_name] || [];
      console.log("🔍 Current messages count:", room_msgs.length);

      // Check if message already exists
      const messageExists = room_msgs.some((m) => m.id === newMessage.id);
      if (messageExists) {
        console.log("⚠️ Message already exists, skipping:", newMessage.id);
        return state;
      }

      // Ensure sender_info is complete
      const enhancedMessage = {
        ...newMessage,
        sender_info: newMessage.sender_info || {
          id: newMessage.sender,
          first_name: newMessage.sender_info?.first_name || "Unknown",
          last_name: newMessage.sender_info?.last_name || "User",
        },
      };

      const newMessages = dedupeMessages([...room_msgs, enhancedMessage]);
      console.log("✅ Adding message. New count:", newMessages.length);

      return {
        messages: {
          ...state.messages,
          [room_name]: newMessages,
        },
      };
    });
  },

  updateLastMessages: (newMessage) => {
    if (!newMessage?.room_name) return;
    set((state) => {
      const currentUserId = toNumber(getCurrentUserId());
      const senderId = toNumber(newMessage.sender);
      const existingIndex = state.lastMessages.findIndex(
        (m) => m.room_name === newMessage.room_name
      );

      if (existingIndex >= 0) {
        // Update existing conversation while preserving other_user info
        const updatedLastMessages = [...state.lastMessages];
        const existingMessage = updatedLastMessages[existingIndex];

        const updatedConversation = {
          ...existingMessage,
          ...newMessage,
          other_user: existingMessage.other_user || newMessage.other_user,
          content: newMessage.content,
          timestamp: newMessage.timestamp,
          // Reset unread count to 0 when user sends a message
          unread_count:
            senderId === currentUserId
              ? 0
              : (existingMessage.unread_count || 0) + 1,
        };
        return {
          lastMessages: [
            updatedConversation,
            ...updatedLastMessages.slice(0, existingIndex),
            ...updatedLastMessages.slice(existingIndex + 1),
          ],
        };
      } else {
        // For new conversations, determine the other user
        const otherUserId =
          senderId === currentUserId
            ? newMessage.recipient
            : newMessage.sender;
        const otherUserInfo =
          senderId === currentUserId
            ? newMessage.recipient_info
            : newMessage.sender_info;

        // Create new conversation entry
        const newConversation = {
          ...newMessage,
          other_user: {
            id: otherUserId,
            first_name: otherUserInfo?.first_name,
            last_name: otherUserInfo?.last_name,
            avatar: otherUserInfo?.avatar,
            role: otherUserInfo?.role,
            email: otherUserInfo?.email,
          },
          // Only set unread count if message is from someone else
          unread_count: senderId === currentUserId ? 0 : 1,
        };

        return {
          lastMessages: [newConversation, ...state.lastMessages],
        };
      }
    });
  },

  isChatFavorited: (room_name) => {
    return get().favoriteChats.includes(room_name);
  },

  setIsFavoriteForChat: async (room_name, isFavorite) => {
    set((state) => {
      const isChatAlreadyInFavorites = state.favoriteChats.includes(room_name);

      if (isChatAlreadyInFavorites && isFavorite) return state;
      if (!isChatAlreadyInFavorites && !isFavorite) return state;

      if (isFavorite)
        return {
          favoriteChats: [...state.favoriteChats, room_name],
        };
      else {
        return {
          favoriteChats: state.favoriteChats.filter((c) => c !== room_name),
        };
      }

      // return {
      //   lastMessages: state.lastMessages.map((chat) => {
      //     if (room_name === chat.room_name) return { ...chat, isFavorite };
      //     return chat;
      //   }),
      // };
    });
  },

  favoriteChat: async (room_name, isFavorite = true) => {
    // used tenary here because isFavorite can be undefined and i don't want to set it to undefined
    const chatIsFavorited = get().favoriteChats.includes(room_name);
    get().setIsFavoriteForChat(room_name, isFavorite);

    try {
      const favoritedRespose = await favoriteChat({
        room_name,
        markAsFavorite: isFavorite,
      });

      // if (!favoritedRespose.favorited)
      //   throw new Error("Could not favorite chat");
    } catch (error) {
      toast.error(
        isFavorite ? "Could not favorite chat" : "Could not unfavorite chat"
      );
      get().setIsFavoriteForChat(room_name, chatIsFavorited);
    }
  },
}));
