import { Avatar, Badge } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { getMessagesForUser } from "../../api-services/messaging";
import { getAllUsers } from "../../api-services/users";
import { useAuth } from "../../context/userContext";
import useWebSocket from "../../hooks/useWebSocket";
import HeadingText from "../HeadingText";
import LightParagraph from "../ParagraphText";
import { avatarStyle } from "../ResponsiveNav";
import TimeAgo from "../TimeAgo";
import Username from "../Username";

export default function MessagesList() {
  const { user: currentUser } = useAuth();
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: getMessagesForUser,
    enabled: !!currentUser,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    enabled: !!currentUser,
  });

  const { messages: ws_messages } = useWebSocket(`chat`);

  const allMessages = useMemo(
    () => [...ws_messages, ...(messages || [])],
    [messages, ws_messages]
  );

  const messagesList = useMemo(() => {
    const uniqueRecipients = new Set();
    return allMessages?.filter((msg) => {
      const recipient = msg?.room_name;
      if (uniqueRecipients.has(recipient)) {
        return false;
      } else {
        uniqueRecipients.add(recipient);
        return true;
      }
    });
  }, [allMessages]);

  return (
    <section className="space-y-4  max-md:container p-3">
      <HeadingText heading="sub-heading" weight="semibold">
        Recent Chats
      </HeadingText>

      <section className="flex flex-col gap-2 divide-y divide-gray-200/70">
        {isLoading || usersLoading ? (
          <MessagesListSkeleton />
        ) : messagesList.length === 0 ? (
          <LightParagraph>
            No messages yet, click on the plus icon to start new chat
          </LightParagraph>
        ) : (
          messagesList.map((message) => {
            const currentUserId =
              currentUser?.id === message?.recipient
                ? message?.sender
                : message?.recipient;
            const user = users?.find((user) => user?.id === currentUserId);
            return (
              <MessagesListTile
                key={message?.id}
                message={message}
                user={user}
              />
            );
          })
        )}
      </section>
    </section>
  );
}

const MessagesListTile = React.memo(({ message, user }) => {
  const name = `${user?.first_name} ${user?.last_name}`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      key={message?.id}
      className="flex gap-2 pt-2 px-2"
    >
      <Link to={`/co/${user?.id}`}>
        <Avatar name={name} src={`${user?.avatar}`} className={avatarStyle} />
      </Link>

      <Link to={`/messages/${message?.room_name}`} className="flex-1">
        <Username user={user} noClick />
        <div className="line-clamp-2">
          <LightParagraph>{message?.content} </LightParagraph>
        </div>
      </Link>
      <div className="flex flex-col justify-end items-end text-[.7rem] text-gray-400 gap-2">
        {!message.read_at && <Badge className="!text-[.6rem]">Unread</Badge>}
        <TimeAgo time={message?.timestamp} />
      </div>
    </motion.section>
  );
});

const MessagesListSkeleton = () => {
  return Array.from({ length: 5 }, (_, index) => (
    <section key={index} className="flex gap-2 pt-2">
      {/* Avatar Skeleton */}
      <div className="size-10 rounded-full skeleton" />

      {/* Message Content Skeleton */}
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 rounded skeleton" />
        <div className="h-2.5 w-full rounded skeleton" />
        <div className="h-2.5 w-2/3 rounded skeleton" />
      </div>

      {/* Timestamp Skeleton */}
      <div className="h-2 w-10 rounded skeleton" />
    </section>
  ));
};
