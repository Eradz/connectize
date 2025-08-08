import { Avatar } from "@chakra-ui/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { ErrorOutline } from "@mui/icons-material";
import { CheckboxIcon, CheckIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useMemo, useRef, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePollMessages } from "../../hooks/usePolling";
import useMessagingWebSocket from "../../hooks/useMessagingWebSocket";
import { useMessagesStore } from "../../stores/messagesStore";
import { baseURL } from "../../lib/helpers";
import {
  converthourTo12hrFormat,
  getMonthFromNumber,
  timeAgo,
} from "../../lib/utils";
import { webRoutes } from "../../lib/webRoutes";
import { ButtonWithTooltipIcon } from "../admin/feeds/DiscoverPosts";
import LightParagraph from "../ParagraphText";
import { avatarStyle } from "../ResponsiveNav";
import TimeAgo from "../TimeAgo";
import { VoiceNotePlayer } from "./MessageControl";
import { LoadImageAttachment } from "./AttachmentLoader";

//

const defaultEmptyMessages = [];
export default function MessageArea() {
  const [searchParams] = useSearchParams();
  const room_name = searchParams.get("room_name") || "";

  useMessagingWebSocket({});
  // useMessagingWebSocket({ room_name });

  // Reduce polling frequency since WebSocket handles real-time updates
  // const { data: messageList = [], isLoading } = usePollMessages(30000);
  const isLoading = useMessagesStore((state) => state.messagesLoading);

  // Get messages from store (updated by WebSocket)
  const storeMessages = useMessagesStore(
    (state) => state.messages[room_name] || defaultEmptyMessages
  );
  const messages = storeMessages;
  const fetchMessages = useMessagesStore((state) => state.fetchMessages);

  // Use store messages if available, otherwise fall back to polling data
  // const messages = useMemo(
  //   () => (storeMessages.length > 0 ? storeMessages : messageList),
  //   [storeMessages, messageList]
  // );

  // Only fetch initial messages if store is empty
  useEffect(() => {
    if (room_name && storeMessages.length === 0) {
      console.log("🔄 Fetching initial messages for room:", room_name);
      fetchMessages({ room_name });
    }
  }, [room_name, storeMessages.length]);

  const [readMoreLimit, setReadMoreLimit] = useState(300);

  const scrollSavedList = useRef({});

  const groupMessagesByDate = (messages) => {
    return messages?.reduce((acc, message) => {
      const msgDate = new Date(message.timestamp);

      const dateToStr = `${getMonthFromNumber(
        msgDate.getMonth()
      )} ${msgDate.getDate()}, ${msgDate.getFullYear()}`;
      // const dateKey = new Date(message.timestamp).toISOString().split("T")[0]; // e.g., '2025-05-20'
      if (!acc[dateToStr]) {
        acc[dateToStr] = [];
      }
      acc[dateToStr].push(message);
      return acc;
    }, {});
  };

  const chatContainerRef = useRef(null);

  const scrollToLastScrolled = () => {
    if (!room_name) return;
    // const chatContainer = document.querySelector(".chat-container");

    if (!chatContainerRef.current) return;

    let senderLastScrollPosition = scrollSavedList.current[room_name];

    if (
      senderLastScrollPosition == undefined ||
      typeof senderLastScrollPosition !== "number"
    ) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    } else {
      // console.log("has scolled to position for ", room_name);
      chatContainerRef.current.scrollTop = senderLastScrollPosition;
    }
  };

  const groupedMessages = groupMessagesByDate(messages);

  // this useEffect is a hack that stops the whole page from scrolling when the chat panel is opened. There were other ways to do it but they required too many modificatio to the design of the website. This pattern is actually safe and solid too.
  useEffect(() => {
    document.body.classList.add("messages-opened");
    document.body.scrollTop = 0;

    return () => {
      document.body?.classList.remove("messages-opened");
    };
  }, []);

  useEffect(() => {
    if (isLoading || !messages?.length || !chatContainerRef.current) return;

    //when a component forcefully sets the scroll positon of this element it might sometimes set the dataset.forced to true. The reason for this is to prevent this side effect from stoping that scroll.
    // This was implemented like this because the message control component scrolls the chat container to the bottom when ever a message is sent but this side effects hijacks that and scrolls the chat conatainer back to its current position. (This happens so fast that you don't even notice the previous scroll attempt)
    if (chatContainerRef.current.dataset?.forced === "true") {
      chatContainerRef.current.dataset.forced = "";
      return;
    }

    function scrollEventHandler(e) {
      scrollSavedList.current[room_name] = e.target.scrollTop;
    }
    chatContainerRef.current?.addEventListener("scroll", scrollEventHandler);

    scrollToLastScrolled();
    return () => {
      chatContainerRef.current?.removeEventListener(
        "scroll",
        scrollEventHandler
      );
    };
  }, [room_name, isLoading, messages.length]);

  return (
    <section
      ref={chatContainerRef}
      className="chat-container flex-1 overflow-y-auto scrollbar-hidden flex flex-col gap-y-2 pb-16 md:pb-4 relative scroll-smooth"
    >
      {isLoading ? (
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
        Object.keys(groupedMessages)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
          .map((date) => {
            // const msgDate = new Date(date);
            const dateTimeAgo = timeAgo(date, "day");

            return (
              <section key={date} id={date}>
                <div className="text-center my-2 flex justify-center sticky top-0">
                  <button
                    className="bg-background rounded-md p-1 px-2 text-gray-500 text-xs translate-y-3.5"
                    onClick={() => {
                      const dateEl = document.getElementById(date);

                      if (dateEl && chatContainerRef.current) {
                        chatContainerRef.current.scrollTop = dateEl.offsetTop;
                        // dateEl.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    {dateTimeAgo == "Today" || dateTimeAgo == "Yesterday"
                      ? dateTimeAgo
                      : date}
                    {/* {timeAgo(date, "day")} */}
                  </button>
                </div>
                {groupedMessages[date]
                  .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                  .map((message, index) => {
                    const { sender_info, is_current_user } = message;

                    const msgDate = new Date(message.timestamp);

                    const hourFmt = converthourTo12hrFormat(msgDate.getHours());

                    return (
                      <motion.div
                        key={message?.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        // className={clsx(
                        //   "w-full p-1 pt-4 flex gap-2.5 max-sm:px-4 max-xs:px-2"
                        // )}
                        className={clsx(
                          "w-full max-w-[400px] p-1 pt-4 flex gap-2.5 max-sm:px-4 max-xs:px-2  "
                        )}
                      >
                        <Link to={`/co/${sender_info?.id}`} className="h-fit">
                          <Avatar
                            name={`${sender_info?.first_name} ${sender_info?.last_name}`}
                            src={sender_info?.avatar}
                            size="sm"
                            className={avatarStyle}
                          />
                        </Link>
                        <div
                          className={clsx(
                            "!shrink-0 !w-fit !max-w-[80%] xs:text-sm bg-white rounded-md p-3 pt-1 flex flex-col"
                          )}
                        >
                          <h1 className="mb-1 font-semibold capitalize text-gray-400 text-[.7rem]">
                            {is_current_user
                              ? "You"
                              : `${sender_info?.first_name || ""} ${
                                  sender_info?.last_name || ""
                                }`}
                          </h1>
                          <p className="text-gray-700 hover:text-gray-900 transition-all duration-300">
                            {message?.content.substring(0, readMoreLimit)}
                            {message?.content.length > readMoreLimit && (
                              <>
                                ...{" "}
                                <span
                                  className="text-xs text-gold inline-block cursor-pointer hover:text-black transition-colors duration-300"
                                  onClick={() =>
                                    setReadMoreLimit((prev) => prev + 400)
                                  }
                                >
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
                                return (
                                  <LoadImageAttachment
                                    key={index}
                                    blur={image.preview}
                                    width={image.width}
                                    height={image.height}
                                    url={image.url}
                                  />
                                );
                              })}
                            </div>
                          )}
                          <div className="text-gray-400 text-[.7rem] flex gap-1 items-center shrink-0">
                            <small className="shrink-0">
                              {/* <TimeAgo time={message.timestamp} />,{" "} */}
                              {/* {message.timestamp}{" "} */}

                              {`${hourFmt.hour}:${msgDate.getMinutes()} ${
                                hourFmt.meridiem
                              }`}
                            </small>
                            {message?.optimistic ? (
                              <CheckboxIcon className="size-3.5  text-gray-300" />
                            ) : message?.error ? (
                              <ButtonWithTooltipIcon
                                IconName={ErrorOutline}
                                tip="This message did not send"
                                iconClassName="!size-3 text-red-600"
                              />
                            ) : (
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
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </section>
            );
          })
      )}
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
