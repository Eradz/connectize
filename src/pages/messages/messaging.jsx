import React, { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { markMessageAsRead } from "../../api-services/messaging";
import MessageArea from "../../components/messages/MessageArea";
import MessageControl from "../../components/messages/MessageControl";
import MessageHeader from "../../components/messages/MessageHeader";
import { useAuth } from "../../context/userContext";
import { messagesQueryKey, useUsers } from "../../hooks";
import { usePollMessages } from "../../hooks/polling";
import { useCrudCreate } from "../../hooks/useCrud";

export default function MessagingPage() {
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const room_name = searchParams.get("room_name") || "";

  const navigate = useNavigate();

  const { messages } = usePollMessages();
  const [, userId, recipientId] = room_name?.split("_");

  const checkUserId =
    Number(currentUser?.id) === Number(userId)
      ? Number(recipientId)
      : Number(userId);

  const allMessages = useMemo(() => [...messages], [messages]);

  const { data: users, isLoading: usersLoading } = useUsers();

  const markReadMutation = useCrudCreate(messagesQueryKey, markMessageAsRead);

  useEffect(() => {
    allMessages.forEach((message) => {
      const checkNotUser =
        Number(currentUser?.id) !== Number(userId)
          ? Number(recipientId)
          : Number(userId);

      console.log(checkNotUser !== currentUser?.id, " Check Users");

      if (!message?.read_at && checkNotUser !== currentUser?.id) {
        console.log(message?.read_at, message?.id);
        markReadMutation.mutate(room_name, checkNotUser);
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
    <section className="flex flex-col relative h-screen">
      <MessageHeader
        user={users?.find((user) => user?.id === checkUserId)}
        isLoading={usersLoading}
      />
      <MessageArea
        messages={allMessages.filter(
          (message) => message.room_name === room_name
        )}
        messagesLoading={usersLoading}
      />
      <MessageControl
        loading={usersLoading}
        recipientId={recipientId}
        senderId={userId}
      />
    </section>
  );
}
