import { useEffect, useRef, useState } from "react";
import { baseURL } from "../lib/helpers";
import { getSession } from "../lib/session";

/**
 *
 * @param {*} url
 * @param {*} params
 * @param {{onMessage: (event:Record<any,any>) => void}} opts
 * @returns
 */
const useWebSocket = (url, params, opts) => {
  const [messages, setMessages] = useState([]);
  // const [ws, setWs] = useState(null);
  const wsRef = useRef(null);
  const session = getSession();

  useEffect(() => {
    const wsBaseUrl =
      process.env.NODE_ENV === "development"
        ? baseURL.replace("http", "ws")
        : baseURL.replace("https", "wss");

    // Construct WebSocket URL based on endpoint type
    let wsUrl;
    if (url === "chat" && !params) {
      // All chats endpoint: ws/chat/
      wsUrl = `${wsBaseUrl}/ws/chat/?token=${session?.tokens?.access}`;
    } else if (url === "chat" && params) {
      // Specific chat room endpoint: ws/chat/<room_name>/
      wsUrl = `${wsBaseUrl}/ws/chat/${params}/?token=${session?.tokens?.access}`;
    } else if (url === "group" && params) {
      // Group chat endpoint: ws/group/<room_name>/
      wsUrl = `${wsBaseUrl}/ws/group/${params}/?token=${session?.tokens?.access}`;
    } else {
      // Fallback for other endpoints (notifications, etc.)
      wsUrl = params
        ? `${wsBaseUrl}/ws/${url}/${params}/?token=${session?.tokens?.access}`
        : `${wsBaseUrl}/ws/${url}/?token=${session?.tokens?.access}`;
    }

    if (wsRef.current) {
      wsRef.current?.close();
    }

    //
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log("WebSocket Connected to:", wsUrl);
    };

    wsRef.current.onclose = () => {
      console.warn("WebSocket Connection Closed:", wsUrl);
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      opts?.onMessage?.(data);
      // setMessages((prevMessages) => [...prevMessages, data]);
    };

    // setWs(socket);

    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [params, session?.tokens?.access, url]);

  const sendMessage = (message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ message }));
    }
  };

  // Function to send a command (e.g., mark as read)
  const sendCommand = (commandObject) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(commandObject));
    }
  };

  return { messages, sendMessage, sendCommand };
};

export default useWebSocket;
