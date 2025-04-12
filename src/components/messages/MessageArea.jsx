import { Avatar } from "@chakra-ui/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { ArrowDownIcon, CheckIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/userContext";
import { useUsers } from "../../hooks";
import { baseURL } from "../../lib/helpers";
import { timeAgo } from "../../lib/utils";
import { webRoutes } from "../../lib/webRoutes";
import LightParagraph from "../ParagraphText";
import { avatarStyle } from "../ResponsiveNav";
import TimeAgo from "../TimeAgo";
import { ButtonWithTooltipIcon } from "../admin/feeds/DiscoverPosts";
import { VoiceNotePlayer } from "./MessageControl";

export default function MessageArea({ messages, messagesLoading }) {
  const { user: currentUser } = useAuth();

  const { data: users, isLoading: usersLoading } = useUsers();

  const [readMoreLimit, setReadMoreLimit] = useState(200);

  const groupMessagesByDate = (messages) => {
    return messages?.reduce((acc, message) => {
      const formattedDate = new Date(message.timestamp);

      const date = formattedDate.toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(message);

      return acc;
    }, {});
  };

  const groupedMessages = groupMessagesByDate(messages);

  const scrollToBottom = () => {
    const chatContainer = document.querySelector(".chat-container");

    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <section className="chat-container flex-1 overflow-y-auto scrollbar-hidden flex flex-col gap-y-2 pb-4 relative scroll-smooth">
      {messagesLoading || usersLoading ? (
        <SkeletonChatMessages />
      ) : messages?.length <= 0 ? (
        <div className="h-full flex items-center justify-center flex-col gap-2">
          <DotLottieReact
            src="/lottie/notification.lottie"
            loop
            autoplay
            className="size-40 shrink-0  pointer-events-none"
          />
          <LightParagraph>No messages yet</LightParagraph>
          <Link
            to={webRoutes.messages}
            className="!text-sm bg-gold px-4 py-1 rounded-full hover:bg-opacity-60 lg:hidden"
          >
            Back to messages
          </Link>
        </div>
      ) : (
        Object?.keys(groupedMessages)
          .sort((a, b) => a.localeCompare(b))
          .map((date) => (
            <section key={date} id={date}>
              <div className="text-center my-2 sticky top-0 flex justify-center border-b">
                <button
                  className="bg-background rounded-md p-1 px-2 text-gray-500 text-xs translate-y-3.5"
                  onClick={() => {
                    const dateEl = document.getElementById(date);
                    if (dateEl) {
                      dateEl.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  {timeAgo(date, "day")}
                </button>
              </div>
              {groupedMessages[date]
                .sort((a, b) => {
                  const formattedDate = (date) =>
                    date.replace("+00:00", "Z").replace(" ", "T");
                  return formattedDate(a.timestamp).localeCompare(
                    formattedDate(b.timestamp)
                  );
                })
                .map((message, index) => {
                  const currentUserId =
                    currentUser?.id === message?.recipient
                      ? message?.recipient
                      : message?.sender;

                  const recipient = users?.find(
                    (user) => user?.id !== currentUserId
                  );

                  const isCurrentUser = currentUser?.id === message?.user;

                  const user = isCurrentUser ? currentUser : recipient;

                  const messageContent = String(message?.content);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={clsx("w-full p-1 pt-4 flex gap-2.5")}
                    >
                      <Link to={`/co/${user?.id}`} className="h-fit">
                        <Avatar
                          name={`${user?.first_name} ${user?.last_name}`}
                          src={user?.avatar}
                          size="sm"
                          className={avatarStyle}
                        />
                      </Link>
                      <div
                        className={clsx(
                          "!shrink-0 !w-fit !max-w-[80%] xs:text-sm bg-white rounded-md p-3 flex flex-col"
                        )}
                      >
                        <h1 className="mb-1 font-semibold capitalize">{`${
                          user?.first_name || ""
                        } ${user?.last_name || ""}`}</h1>
                        <p className="text-gray-600 hover:text-gray-800 transition-all duration-300 min-h-10">
                          {messageContent.substring(0, readMoreLimit)}
                          {messageContent.length > readMoreLimit && (
                            <>
                              ...{" "}
                              <span className="text-xs text-gold inline-block cursor-pointer hover:text-black transition-colors duration-300" onClick={()=>setReadMoreLimit(prev => prev+400)}>
                                read more
                              </span>
                            </>
                          )}
                        </p>

                        {message.audio_file && (
                          <VoiceNotePlayer audioURL={message.audio_file} />
                        )}

                        {message.images.length > 0 && (
                          <div
                            className={clsx("grid gap-2 mt-1", {
                              "!grid-cols-1": message.images.length === 1,
                              "!grid-cols-2": message.images.length === 2,
                              "!grid-cols-3": message.images.length >= 3,
                            })}
                          >
                            {message.images?.map((image, index) => {
                              const src = image
                                .toString()
                                .trim()
                                .startsWith("http")
                                ? image
                                : baseURL + image;

                              return (
                                <img
                                  key={index}
                                  src={src}
                                  alt="Messaging"
                                  className="rounded-md size-full"
                                />
                              );
                            })}
                          </div>
                        )}
                        <div className="text-gray-400 text-[.7rem] flex gap-1 items-center shrink-0">
                          <small className="shrink-0">
                            <TimeAgo time={message.timestamp} />
                          </small>
                          <div className="flex items-center">
                            <div
                              className={clsx("flex items-center", {
                                "text-gold": message.read_at,
                              })}
                            >
                              <CheckIcon />
                            </div>
                            <div
                              className={clsx(
                                "flex items-center -translate-x-2",
                                {
                                  "text-gold": message.read_at,
                                }
                              )}
                            >
                              <CheckIcon />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </section>
          ))
      )}
      {
        <ButtonWithTooltipIcon
          IconName={ArrowDownIcon}
          tip="scroll down"
          onClick={scrollToBottom}
          className="fixed top-20 right-5 hover:bg-gray-200 rounded-full p-1.5"
        />
      }
    </section>
  );
}

const SkeletonChatMessages = () => {
  return Array.from({ length: 5 }, (_, index) => {
    const isEven = index % 2;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        key={index}
        className={clsx("w-full p-3 flex gap-2.5", {
          "self-end flex-row-reverse": isEven,
          "items-end": !isEven,
        })}
      >
        {/* Avatar Skeleton */}
        <div className="size-10 skeleton rounded-full" />

        {/* Message Skeleton */}
        <div
          className={clsx(
            "!shrink-0 !w-fit !max-w-[75%] xs:text-sm bg-white rounded-md p-3 flex flex-col",
            {
              "items-end": isEven,
            }
          )}
        >
          {/* Placeholder for message text */}
          <div className="w-36 h-2 skeleton rounded-md mb-2" />

          {/* Placeholder for time and sender */}
          <div className="flex gap-1 items-center shrink-0">
            <div className="w-12 h-2 skeleton rounded-md" />
            <small className="text-gray-300">&bull;</small>
            <div className="w-16 h-2 skeleton rounded-md" />
          </div>
        </div>
      </motion.div>
    );
  });
};
