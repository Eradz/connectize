import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getMessagesForUser,
  markMessageAsRead,
} from "../../api-services/messaging";
import MessageArea from "../../components/messages/MessageArea";
import MessageControl from "../../components/messages/MessageControl";
import { useAuth } from "../../context/userContext";
import useWebSocket from "../../hooks/useWebSocket";

export default function MessagingPage() {
  const { user: currentUser } = useAuth();
  const { room_name } = useParams();

  const navigate = useNavigate();
  const [, userId, recipientId] = room_name.split("_");

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", room_name],
    queryFn: () => getMessagesForUser({ room_name }),
    enabled: !!room_name && !!currentUser,
  });

  useQuery({
    queryKey: ["mark-messages-as-read", room_name],
    queryFn: () =>
      markMessageAsRead(
        room_name,
        currentUser?.id !== userId ? Number(recipientId) : Number(userId)
      ),
    enabled: !!room_name && !!currentUser && !!messages,
  });

  const { messages: ws_messages, sendCommand } = useWebSocket(
    `chat/${room_name}`
  );

  const allMessages = useMemo(
    () => [...messages, ...ws_messages],
    [messages, ws_messages]
  );

  useEffect(() => {
    document.title = "Room messaging in connectize";

    allMessages.forEach((message) => {
      if (!message?.read_at) {
        sendCommand({
          command: "mark_as_read",
          message_id: message?.id,
          user_id:
            currentUser?.id !== userId ? Number(recipientId) : Number(userId),
        });
      }
    });

    if (
      (String(userId) !== String(currentUser?.id) &&
        String(recipientId) !== String(currentUser?.id)) ||
      !currentUser
    ) {
      navigate("/messages");
    }
  }, [
    allMessages,
    currentUser,
    currentUser?.id,
    navigate,
    recipientId,
    sendCommand,
    userId,
  ]);

  return (
    <section className="h-[79vh] lg:h-[85vh] flex flex-col  max-md:container p-3">
      <MessageArea messages={allMessages} messagesLoading={isLoading} />
      <MessageControl
        loading={isLoading}
        recipientId={recipientId}
        senderId={userId}
      />
    </section>
  );
}
