import { useEffect } from "react";
import useWebSocket from "./useWebSocket";
import { useNotificationsStore } from "../stores/notificationsStore";

/**
 * Hook to connect to the notifications websocket and update the notification store in real time.
 */
const useNotificationWebSocket = () => {
  // Adjust the URL/params as needed for your backend's websocket endpoint
  // Example: url = "notifications", params = userId
  const setNotifications = useNotificationsStore((s) => s.setNotifications);
  const addNotification = useNotificationsStore((s) => s.addNotification);
  const { messages } = useWebSocket("notifications", undefined, {
    onMessage: handleNewEvent,
  });

  function handleNewEvent(event) {
    if (event?.eventName !== "notification_received") {
      return;
    }

    addNotification(event.payload);
    console.log("Event from Notification socket", event);
  }
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    // Assuming each message is a notification or an array of notifications
    const lastMessage = messages[messages.length - 1];

    // If the backend sends a full notification list, replace; if single, add if not present
    if (Array.isArray(lastMessage)) {
      setNotifications(lastMessage);
    } else if (lastMessage && lastMessage.id) {
      addNotification(lastMessage);
    }
    // You may need to adjust this logic based on your backend's message format
  }, [messages, setNotifications, addNotification]);
};

export default useNotificationWebSocket;
