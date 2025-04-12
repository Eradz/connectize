import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getMessagesForUser,
  markMessageAsRead,
} from "../../api-services/messaging";
import MessageArea from "../../components/messages/MessageArea";
import MessageControl from "../../components/messages/MessageControl";
import MessageHeader from "../../components/messages/MessageHeader";
import { useAuth } from "../../context/userContext";
import { useGetSingleUser } from "../../hooks";
import useWebSocket from "../../hooks/useWebSocket";

const messagesQueryKey = ["messages"];

export default function MessagingPage() {
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const room_name = searchParams.get("room_name") || "";

  const navigate = useNavigate();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: messagesQueryKey,
    queryFn: () => getMessagesForUser({ room_name }),
    enabled: !!room_name && !!currentUser,
  });

  const [, userId, recipientId] = room_name?.split("_");

  const checkUserId =
    Number(currentUser?.id) === Number(userId)
      ? Number(recipientId)
      : Number(userId);

  useQuery({
    queryKey: ["mark-messages-as-read", room_name],
    queryFn: () => markMessageAsRead(room_name),
    enabled: !!room_name && !!currentUser && !!messages,
  });

  const { messages: ws_messages, sendCommand } = useWebSocket(
    `chat/${room_name}`
  );

  const allMessages = useMemo(
    () => [...messages, ...ws_messages],
    [messages, ws_messages]
  );

  const { data: user, isLoading: userIsLoading } =
    useGetSingleUser(checkUserId);

  useEffect(() => {
    allMessages.forEach((message) => {
      if (!message?.read_at) {
        sendCommand({
          command: "mark_as_read",
          message_id: message?.id,
          user_id:
            Number(currentUser?.id) !== Number(userId)
              ? Number(recipientId)
              : Number(userId),
        });
      }
    });
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
    <section className="h-full flex flex-col">
      <MessageHeader user={user} isLoading={userIsLoading} />
      <MessageArea messages={allMessages} messagesLoading={isLoading} />
      <MessageControl
        loading={isLoading}
        recipientId={recipientId}
        senderId={userId}
      />
    </section>
  );
}
