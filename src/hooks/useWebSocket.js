import { useEffect, useState } from "react";
import { baseURL } from "../lib/helpers";
import { getSession } from "../lib/session";

const useWebSocket = (url, params) => {
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const session = getSession();

  useEffect(() => {
    const wsBaseUrl =
      process.env.NODE_ENV === "development"
        ? baseURL.replace("http", "ws")
        : baseURL.replace("https", "wss");

    const socket = new WebSocket(
      `${wsBaseUrl}/ws/${url}/${params ? params : "?"}token=${session?.tokens?.access}`
    );

    // socket.onopen = () => {
    //   console.log("WebSocket Connected");
    // };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setMessages((prevMessages) => [...prevMessages, data]);
    };

    // socket.onerror = (error) => {
    //   console.error("WebSocket Error:", error);
    // };

    // socket.onclose = () => {
    //   console.log("WebSocket Disconnected");
    // };

    setWs(socket);

    return () => {
      socket.close();
      setWs(null);
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
