import { Avatar, Badge } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAllChatsWebSocket from "../../hooks/useAllChatsWebSocket";
import { useMessagesStore } from "../../stores/messagesStore";
import HeadingText from "../HeadingText";
import LightParagraph from "../ParagraphText";
import { avatarStyle } from "../ResponsiveNav";
import TimeAgo from "../TimeAgo";
import Username from "../Username";

export default function MessagesList() {
  // Use WebSocket for real-time sidebar updates
  useAllChatsWebSocket();

  const fetchLastMessages = useMessagesStore((state) => state.getLastMessages);
  const lastMessages = useMessagesStore((state) => state.lastMessages);
  const messagesLoading = useMessagesStore((state) => state.messagesLoading);

  useEffect(() => {
    // Only fetch initially if we don't have any messages
    if (lastMessages.length === 0) {
      (async () => await fetchLastMessages())();
    }
  }, [fetchLastMessages, lastMessages.length]);

  return (
    <section className="flex flex-col gap-2 divide-y divide-gray-200/70  overflow-x-auto scroll-smooth scrollbar-hidden">
      {messagesLoading ? (
        <MessagesListSkeleton />
      ) : lastMessages?.length <= 0 ? (
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
        lastMessages.map((message) => (
          <MessagesListTile key={message?.id} message={message} />
        ))
      )}
    </section>
  );
}

const MessagesListTile = React.memo(({ message }) => {
  const { other_user, unread_count } = message;
  const navigate = useNavigate();

  const firstName = other_user?.first_name || "Unknown";
  const lastName = other_user?.last_name || "User";
  const name = `${firstName} ${lastName}`;

  const markAllAsRead = useMessagesStore((state) => state.markAllAsRead);
  const setOpenedMessage = useMessagesStore((state) => state.setOpenedMessage);

  const room_name = message?.room_name;

  const handleMarkAsRead = async () => {
    console.log("🔍 Clicking on message tile:", { message, unread_count });
    setOpenedMessage(message);

    // Navigate to the chat room
    navigate(`/messages/?room_name=${room_name}`);

    if (unread_count > 0) {
      await markAllAsRead(room_name);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      key={message?.id}
      onClick={handleMarkAsRead}
      className="flex gap-2 p-2 hover:bg-background hover:rounded-md cursor-pointer"
    >
      <Link to={`/co/${other_user?.id}`} className="flex-shrink-0">
        <Avatar
          name={name}
          src={`${other_user?.avatar}`}
          className={avatarStyle}
          size="sm"
        />
      </Link>

      <Link
        to={`/messages/?room_name=${message?.room_name}`}
        className="flex-1 text-sm min-w-0"
      >
        <div className="font-medium text-gray-900">{name}</div>
        <div className="line-clamp-1 text-ellipsis text-gray-600">
          {message?.content}
        </div>
      </Link>

      <div className="flex flex-col justify-end items-end text-[.6rem] text-gray-400 gap-2 flex-shrink-0">
        {unread_count > 0 && (
          <Badge className="!text-[.55rem]">{unread_count} Unread</Badge>
        )}
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
