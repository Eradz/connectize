import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import MessageArea from "../../components/messages/MessageArea";
import MessageControl from "../../components/messages/MessageControl";
import MessageHeader from "../../components/messages/MessageHeader";
import { useAuth } from "../../context/userContext";
import { useUsers } from "../../hooks";
import { usePollMessages } from "../../hooks/polling";

export default function MessagingPage() {
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const room_name = searchParams.get("room_name") || "";

  const { messages } = usePollMessages();
  const [, userId, recipientId] = room_name?.split("_");

  const checkUserId =
    Number(currentUser?.id) === Number(userId)
      ? Number(recipientId)
      : Number(userId);

  const allMessages = useMemo(() => [...messages], [messages]);

  const { data: users, isLoading: usersLoading } = useUsers();

  return (
    <section className="flex flex-col relative h-[97vh] xs:px-2 sm:container md:!p-0 bg-red-700">
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
