import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { markMessageAsRead } from "../../api-services/messaging";
import MessageArea from "../../components/messages/MessageArea";
import MessageControl from "../../components/messages/MessageControl";
import MessageHeader from "../../components/messages/MessageHeader";
import { useAuth } from "../../context/userContext";
import { messagesQueryKey, useGetMessages, useUsers } from "../../hooks";
import { useCrudCreate } from "../../hooks/useCrud";

export default function MessagingPage() {
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const room_name = searchParams.get("room_name") || "";

  const navigate = useNavigate();

  const { data: messages = [], isLoading } = useGetMessages();

  const [, userId, recipientId] = room_name?.split("_");

  const checkUserId =
    Number(currentUser?.id) === Number(userId)
      ? Number(recipientId)
      : Number(userId);

  // useQuery({
  //   queryKey: ["mark-messages-as-read", room_name],
  //   queryFn: () => markMessageAsRead(room_name),
  //   enabled: !!room_name && !!currentUser && !!messages,
  // });

  // const { messages: ws_messages, sendCommand } = useWebSocket(
  //   `chat/${room_name}`
  // );

  const allMessages = useMemo(() => [...messages], [messages]);

  const { data: users, isLoading: usersLoading } = useUsers();

  const markReadMutation = useCrudCreate(messagesQueryKey, markMessageAsRead);

  useEffect(() => {
    allMessages.forEach((message) => {
      const checkNotUser =
        Number(currentUser?.id) !== Number(userId)
          ? Number(recipientId)
          : Number(userId);
      if (!message?.read_at && checkNotUser !== currentUser?.id) {
        console.log(message?.read_at, message?.id);
        markReadMutation.mutate(room_name, checkNotUser);
        // sendCommand({
        //   command: "mark_as_read",
        //   message_id: message?.id,
        //   user_id: checkNotUser,
        // });
      }
    });
  }, [
    allMessages,
    currentUser,
    currentUser?.id,
    navigate,
    recipientId,
    userId,
  ]);

  return (
    <section className="h-full flex flex-col">
      <MessageHeader
        user={users?.find((user) => user?.id === checkUserId)}
        isLoading={usersLoading}
      />
      <MessageArea
        messages={allMessages.filter(
          (message) => message.room_name === room_name
        )}
        messagesLoading={isLoading}
      />
      <MessageControl
        loading={isLoading}
        recipientId={recipientId}
        senderId={userId}
      />
    </section>
  );
}
