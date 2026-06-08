import useWebSocket from "./useWebSocket";
import { useMessagesStore } from "../stores/messagesStore";
import { useAuth } from "../context/userContext";

/**
 * Hook to connect to a specific chat room websocket and update the messages store in real time.
 * This handles real-time message delivery within a specific conversation.
 */
// const useMessagingWebSocket = ({ room_name }) => {
const useMessagingWebSocket = ({ enabled = true } = {}) => {
  const { user: currentUser } = useAuth();
  // const [searchParams] = useSearchParams();
  // const room_name = searchParams.get("room_name")

  const addRealtimeMessage = useMessagesStore((s) => s.addRealtimeMessage);
  const updateLastMessages = useMessagesStore((s) => s.updateLastMessages);
  const openedMessage = useMessagesStore((s) => s.openedMessage);
  const setOpenedMessage = useMessagesStore((s) => s.setOpenedMessage);

  // Connect to specific chat WebSocket endpoint: ws/chat/<room_name>/
  // useWebSocket("chat", room_name, {
  //   onMessage: handleNewMessage,
  // });
  useWebSocket("unified", undefined, {
    onMessage: handleNewMessage,
    enabled: enabled && Boolean(currentUser?.id),
  });

  function handleNewMessage(event) {
    if (
      event.eventName !== "message_received" ||
      event.eventType !== "chat_message"
    ) return;

    const message = event.payload ? { ...event.payload } : null;
    const room_name = event.roomId || message?.room_name;
    if (!room_name || !message) return;
    message.room_name = room_name;

    updateLastMessages({ ...message, room_name });

    if (message.sender == currentUser?.id) return;

    //
    if (message && message.id) {
      // Add to current messages since we're in the right room
      addRealtimeMessage(room_name, message);

      // If we don't have openedMessage or it's incomplete, update it with sender info
      if (!openedMessage || !openedMessage.other_user?.first_name) {
        const otherUserId =
          message.sender == currentUser.id
            ? message.recipient
            : message.sender;
        const otherUserInfo =
          message.sender == currentUser.id
            ? message.recipient_info
            : message.sender_info;

        if (otherUserInfo && otherUserId) {
          setOpenedMessage({
            room_name: room_name,
            other_user: {
              id: otherUserId,
              first_name: otherUserInfo.first_name,
              last_name: otherUserInfo.last_name,
              avatar: otherUserInfo.avatar,
              role: otherUserInfo.role,
            },
          });
        }
      }
    }
  }

  // useEffect(() => {
  //   if (!messages || messages.length === 0 || !room_name || !currentUser)
  //     return;

  //   // Process the latest WebSocket message
  //   const lastMessage = messages[messages.length - 1];

  //   if (lastMessage && lastMessage.id && lastMessage.room_name === room_name) {
  //     // Add to current messages since we're in the right room
  //     addRealtimeMessage(room_name, lastMessage);

  //     // If we don't have openedMessage or it's incomplete, update it with sender info
  //     if (!openedMessage || !openedMessage.other_user?.first_name) {
  //       const otherUserId =
  //         lastMessage.sender === currentUser.id
  //           ? lastMessage.recipient
  //           : lastMessage.sender;
  //       const otherUserInfo =
  //         lastMessage.sender === currentUser.id
  //           ? lastMessage.recipient_info
  //           : lastMessage.sender_info;

  //       if (otherUserInfo && otherUserId) {
  //         setOpenedMessage({
  //           room_name: room_name,
  //           other_user: {
  //             id: otherUserId,
  //             first_name: otherUserInfo.first_name,
  //             last_name: otherUserInfo.last_name,
  //             avatar: otherUserInfo.avatar,
  //             role: otherUserInfo.role,
  //           },
  //         });
  //       }
  //     }
  //   }
  // }, [
  //   messages,
  //   room_name,
  //   addRealtimeMessage,
  //   currentUser,
  //   openedMessage,
  //   setOpenedMessage,
  // ]);
};

export default useMessagingWebSocket;
