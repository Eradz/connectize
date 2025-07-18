import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import useWebSocket from "./useWebSocket";
import { useMessagesStore } from "../stores/messagesStore";

/**
 * Hook to connect to the messaging websocket and update the messages store in real time.
 */
const useMessagingWebSocket = () => {
  const [searchParams] = useSearchParams();
  const room_name = searchParams.get("room_name");
  
  // Connect to messaging WebSocket endpoint
  const { messages } = useWebSocket("messages", room_name);

  const addRealtimeMessage = useMessagesStore((s) => s.addRealtimeMessage);
  const updateLastMessages = useMessagesStore((s) => s.updateLastMessages);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    // Process the latest WebSocket message
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage && lastMessage.id) {
      // Add to current messages if we're in the right room
      if (room_name && lastMessage.room_name === room_name) {
        addRealtimeMessage(lastMessage);
      }
      
      // Always update last messages for the sidebar
      updateLastMessages(lastMessage);
    }
  }, [messages, room_name, addRealtimeMessage, updateLastMessages]);
};

export default useMessagingWebSocket;