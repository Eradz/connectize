import { Avatar, Badge } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React, { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useUsers } from "../../hooks";
import { usePollMessages } from "../../hooks/polling";
import { useMessagesStore } from "../../stores/messagesStore";
import HeadingText from "../HeadingText";
import LightParagraph from "../ParagraphText";
import { avatarStyle } from "../ResponsiveNav";
import TimeAgo from "../TimeAgo";
import Username from "../Username";

export default function MessagesList() {
  const { messages } = usePollMessages();

  const { data: users, isLoading: usersLoading } = useUsers();

  const allMessages = useMemo(() => [...(messages || [])], [messages]);

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
    <section className="flex flex-col gap-2 divide-y divide-gray-200/70  overflow-x-auto scroll-smooth scrollbar-hidden">
      {usersLoading ? (
        <MessagesListSkeleton />
      ) : messagesList?.length <= 0 ? (
        <div className="min-h-40 py-2 mt-2 space-y-4">
          <HeadingText>
            Connectize is more interesting when you{" "}
            <span className="text-gold border-b-4 border-gold">connect</span>
          </HeadingText>
          <LightParagraph>
            Please use the corner right plus icon to start messaging
          </LightParagraph>

          {/* <div className="">
            <FormLabel htmlFor="userId" className="block -mb-4">
              Enter a user Id to start connecting immediately
            </FormLabel>
            <CustomInput
              name="userId"
              placeholder=""
              onChange={() => {}}
              className="!w-[98%]"
            />
          </div> */}
        </div>
      ) : (
        messagesList.map((message) => {
          const currentUserId =
            String(message?.user) === String(message?.recipient)
              ? message?.sender
              : message?.recipient;
          const user = users?.find(
            (user) => String(user?.id) === String(currentUserId)
          );
          return (
            <MessagesListTile key={message?.id} message={message} user={user} />
          );
        })
      )}
    </section>
  );
}

const MessagesListTile = React.memo(({ message, user }) => {
  const name = `${user?.first_name} ${user?.last_name}`;

  const { markAllAsRead } = useMessagesStore();
  const [searchParams] = useSearchParams();

  const room_name = searchParams.get("room_name");

  const handleMarkAsRead = async () => {
    await markAllAsRead(room_name, user?.id);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      key={message?.id}
      onClick={handleMarkAsRead}
      className="flex gap-2 p-2 hover:bg-background hover:rounded-md"
    >
      <Link to={`/co/${user?.id}`}>
        <Avatar
          name={name}
          src={`${user?.avatar}`}
          className={avatarStyle}
          size="sm"
        />
      </Link>

      <Link
        to={`/messages/?room_name=${message?.room_name}`}
        className="flex-1 text-sm"
      >
        <Username user={user} noClick />
        <div className="line-clamp-1 text-ellipsis">
          <LightParagraph>{message?.content}</LightParagraph>
        </div>
      </Link>
      <div className="flex flex-col justify-end items-end text-[.6rem] text-gray-400 gap-2">
        {!message.read_at && <Badge className="!text-[.55rem]">Unread</Badge>}
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
