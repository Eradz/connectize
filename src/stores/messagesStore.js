import isEqual from "lodash/isEqual";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import {
  getMessagesForUser,
  markMessageAsRead,
  messageUser,
} from "../api-services/messaging";
import { getUserById } from "../api-services/users";

function getCurrentUserId() {
  try {
    const session = JSON.parse(localStorage.getItem('session'));
    return session?.user?.id;
  } catch (e) {
    console.warn("Failed to parse session from localStorage:", e);
    return undefined;
  }
}

export const useMessagesStore = create((set, get) => ({
  messages: [],
  lastMessages: [],
  openedMessage: null,
  messagesLoading: false,

  fetchMessages: async (params) => {
    console.log("🔄 Fetching messages with params:", params);
    set({ messagesLoading: true });
    
    try {
      const data = await getMessagesForUser(params);
      console.log("✅ Fetched messages:", data);
      
      // Only set messages if we don't have any, to avoid clearing WebSocket messages
      set((state) => {
        if (state.messages.length === 0) {
          console.log("✅ Setting initial messages, count:", data?.length || 0);
          return { messages: data || [] };
        } else {
          console.log("⚠️ Skipping message replacement, already have messages:", state.messages.length);
          return state;
        }
      });
    } catch (err) {
      console.error("❌ Failed to fetch messages:", err);
      set({ messages: [] });
    } finally {
      set({ messagesLoading: false });
    }
  },

  getLastMessages: async () => {
    set({ messagesLoading: true });
    try {
      const data = await getMessagesForUser({ last_chats: true });
      console.log("🔍 Raw lastMessages from API:", data);
      
      // Process the data to ensure complete other_user info
      const processedData = await Promise.all(
        (data || []).map(async (message) => {
          if (!message.other_user || !message.other_user.first_name) {
            console.log("🔧 Processing incomplete other_user for message:", message.id);
            
            // Try to get user info from the message structure
            const currentUserId = getCurrentUserId();
            const otherUserId = message.sender === currentUserId ? message.recipient : message.sender;
            
            try {
              const userInfo = await getUserById(otherUserId);
              return {
                ...message,
                other_user: {
                  id: otherUserId,
                  first_name: userInfo.first_name,
                  last_name: userInfo.last_name,
                  avatar: userInfo.avatar,
                  role: userInfo.role,
                  email: userInfo.email
                }
              };
            } catch (error) {
              console.error("Failed to fetch user info for:", otherUserId);
              return {
                ...message,
                other_user: {
                  id: otherUserId,
                  first_name: "Unknown",
                  last_name: "User"
                }
              };
            }
          }
          return message;
        })
      );
      
      console.log("✅ Processed lastMessages:", processedData);
      set({ lastMessages: processedData });
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      set({ messagesLoading: false });
    }
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
      const existingMessage = get().lastMessages.find((m) => m.room_name === room_name);
      console.log("🔍 Existing message found:", existingMessage);
      
      if (existingMessage) {
        console.log("✅ Using existing message from lastMessages");
        set({ openedMessage: existingMessage });
        return;
      }

      // Parse room_name to get recipient info
      const roomParts = room_name.split('_');
      console.log("🔍 Room parts:", roomParts);
      
      if (roomParts.length === 3 && roomParts[0] === 'room') {
        const currentUserId = parseInt(roomParts[1]);
        const recipientId = parseInt(roomParts[2]);
        console.log("🔍 Parsed IDs - current:", currentUserId, "recipient:", recipientId);
        
        try {
          console.log("🔄 Fetching user data for ID:", recipientId);
          const recipientUser = await getUserById(recipientId);
          console.log("✅ Fetched user data:", recipientUser);
          
          const openedMessageData = {
            room_name: room_name,
            other_user: {
              id: recipientId,
              first_name: recipientUser.first_name,
              last_name: recipientUser.last_name,
              avatar: recipientUser.avatar,
              role: recipientUser.role,
              email: recipientUser.email
            },
          };
          
          console.log("✅ Setting openedMessage with fetched data:", openedMessageData);
          set({ openedMessage: openedMessageData });
          return;
        } catch (error) {
          console.error("❌ Failed to fetch recipient user data:", error);
          set({ 
            openedMessage: {
              room_name: room_name,
              other_user: { 
                id: recipientId,
                first_name: "Unknown",
                last_name: "User"
              },
            }
          });
          return;
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
    console.log("📖 Marking all as read for room:", room_name);
    
    set((state) => {
      const updatedMessages = state.messages.map((m) => 
        m.room_name === room_name 
          ? { ...m, read_at: new Date().toUTCString() }
          : m
      );
      
      const updatedLastMessages = state.lastMessages.map((m) =>
        m.room_name === room_name
          ? { ...m, unread_count: 0 }
          : m
      );
      
      console.log("✅ Updated unread counts for room:", room_name);
      
      return {
        messages: updatedMessages,
        lastMessages: updatedLastMessages
      };
    });
    
    try {
      await markMessageAsRead(room_name);
      console.log("✅ Backend mark as read successful");
    } catch (err) {
      console.error("❌ Failed to mark messages as read:", err);
    }
  },

  removeMessage: (tempId) => {
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== tempId),
    }));
  },

  setLastMessages: (newLastMessages) => {
    set({ lastMessages: newLastMessages });
  },

  addRealtimeMessage: (newMessage) => {
    console.log("📨 Adding realtime message:", newMessage);
    
    set((state) => {
      console.log("🔍 Current messages count:", state.messages.length);
      
      // Check if message already exists
      const messageExists = state.messages.some(m => m.id === newMessage.id);
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
          last_name: newMessage.sender_info?.last_name || "User"
        }
      };

      const newMessages = [...state.messages, enhancedMessage];
      console.log("✅ Adding message. New count:", newMessages.length);
      
      return {
        messages: newMessages
      };
    });
  },

  updateLastMessages: (newMessage) => {
    set((state) => {
      const currentUserId = JSON.parse(localStorage.getItem('session'))?.user?.id;
      const existingIndex = state.lastMessages.findIndex(
        m => m.room_name === newMessage.room_name
      );

      if (existingIndex >= 0) {
        // Update existing conversation while preserving other_user info
        const updatedLastMessages = [...state.lastMessages];
        const existingMessage = updatedLastMessages[existingIndex];
        
        updatedLastMessages[existingIndex] = {
          ...existingMessage,
          content: newMessage.content,
          timestamp: newMessage.timestamp,
          // Reset unread count to 0 when user sends a message
          unread_count: newMessage.sender === currentUserId 
            ? 0
            : (existingMessage.unread_count || 0) + 1
        };
        return { lastMessages: updatedLastMessages };
      } else {
        // For new conversations, determine the other user
        const otherUserId = newMessage.sender === currentUserId ? newMessage.recipient : newMessage.sender;
        const otherUserInfo = newMessage.sender === currentUserId 
          ? newMessage.recipient_info 
          : newMessage.sender_info;
        
        // Create new conversation entry
        const newConversation = {
          ...newMessage,
          other_user: {
            id: otherUserId,
            first_name: otherUserInfo?.first_name || "Unknown",
            last_name: otherUserInfo?.last_name || "User",
            avatar: otherUserInfo?.avatar,
            role: otherUserInfo?.role,
            email: otherUserInfo?.email
          },
          // Only set unread count if message is from someone else
          unread_count: newMessage.sender === currentUserId ? 0 : 1
        };
        
        return {
          lastMessages: [newConversation, ...state.lastMessages]
        };
      }
    });
  },
}));
