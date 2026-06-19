import { useEffect } from "react";
import useWebSocket from "./useWebSocket";
import { useMessagesStore } from "../stores/messagesStore";
import { useAuth } from "../context/userContext";

/**
 * Hook to connect to the all chats websocket and update the last messages in real time.
 * This handles sidebar updates when new conversations start or existing ones receive messages.
 */
const useAllChatsWebSocket = () => {
  const { user: currentUser } = useAuth();
  // Connect to all chats WebSocket endpoint: ws/chat/
  const { messages } = useWebSocket("chat");

  const updateLastMessages = useMessagesStore((s) => s.updateLastMessages);
  const setLastMessages = useMessagesStore((s) => s.setLastMessages);

  useEffect(() => {
    if (!messages || messages.length === 0 || !currentUser) return;

    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage) {
      if (Array.isArray(lastMessage)) {
        setLastMessages(lastMessage);
      } else if (lastMessage.id && lastMessage.room_name) {
        console.log("🔍 Processing WebSocket message for sidebar:", lastMessage);
        
        // Determine who the "other" user is
        const otherUserId = lastMessage.sender === currentUser.id ? lastMessage.recipient : lastMessage.sender;
        const otherUserInfo = lastMessage.sender === currentUser.id 
          ? lastMessage.recipient_info 
          : lastMessage.sender_info;
        
        const enhancedMessage = {
          ...lastMessage,
          other_user: {
            id: otherUserId,
            first_name: otherUserInfo?.first_name,
            last_name: otherUserInfo?.last_name,
            avatar: otherUserInfo?.avatar,
            role: otherUserInfo?.role,
            email: otherUserInfo?.email
          }
        };
        
        console.log("✅ Enhanced message for sidebar:", enhancedMessage);
        updateLastMessages(enhancedMessage);
      }
    }
  }, [messages, updateLastMessages, setLastMessages, currentUser]);
};

export default useAllChatsWebSocket;
