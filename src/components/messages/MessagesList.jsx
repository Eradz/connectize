import { Avatar, Badge } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/userContext";
import { useMessagesStore } from "../../stores/messagesStore";
import HeadingText from "../HeadingText";
import LightParagraph from "../ParagraphText";
import { avatarStyle } from "../ResponsiveNav";
import TimeAgo from "../TimeAgo";
import Username from "../Username";

export default function MessagesList() {
  const fetchLastMessages = useMessagesStore((state) => state.getLastMessages);
  const lastMessages = useMessagesStore((state) => state.lastMessages);
  const messagesLoading = useMessagesStore((state) => state.messagesLoading);

  useEffect(() => {
    (async () => await fetchLastMessages())();
  }, []);

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
  const { other_user } = message;
  const name = `${other_user?.first_name} ${other_user?.last_name}`;

  const markAllAsRead = useMessagesStore((state) => state.markAllAsRead);
  const room_name = message?.room_name;

  const { user: currentUser } = useAuth();

  const isRecipient = message.recipient_id === currentUser?.id;

  const handleMarkAsRead = async () => {
    // if (!isRecipient) return;
    await markAllAsRead(room_name);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      key={message?.id}
      onClick={handleMarkAsRead}
      className="flex gap-2 p-2 hover:bg-background hover:rounded-md"
    >
      <Link to={`/co/${other_user?.id}`}>
        <Avatar
          name={name}
          src={`${other_user?.avatar}`}
          className={avatarStyle}
          size="sm"
        />
      </Link>

      <Link
        to={`/messages/?room_name=${message?.room_name}`}
        className="flex-1 text-sm"
      >
        <Username user={other_user} noClick />
        <div className="line-clamp-1 text-ellipsis">
          <LightParagraph>{message?.content}</LightParagraph>
        </div>
      </Link>
      <div className="flex flex-col justify-end items-end text-[.6rem] text-gray-400 gap-2">
        {message.unread_count > 0 && (
          <Badge className="!text-[.55rem]">
            {message.unread_count} Unread
          </Badge>
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
