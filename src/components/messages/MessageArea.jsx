import { Avatar } from "@chakra-ui/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { ErrorOutline } from "@mui/icons-material";
import { CheckboxIcon, CheckIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useMemo, useRef, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePollMessages } from "../../hooks/usePolling";
import { useAuth } from "../../context/userContext";
import { toast } from "sonner";
import { forwardMessage, updateMessage } from "../../api-services/messaging";
import { useMessagesStore } from "../../stores/messagesStore";
import { baseURL } from "../../lib/helpers";
import { getUserDisplayName } from "../../lib/userDisplay";
import {
  converthourTo12hrFormat,
  getMonthFromNumber,
  timeAgo,
} from "../../lib/utils";
import { webRoutes } from "../../lib/webRoutes";
import { ButtonWithTooltipIcon } from "../ButtonWithTooltipIcon";
import LightParagraph from "../ParagraphText";
import { avatarStyle } from "../ResponsiveNav";
import TimeAgo from "../TimeAgo";
import { VoiceNotePlayer } from "./MessageControl";
import { LoadImageAttachment } from "./AttachmentLoader";

/**
 * Converts URLs in text to clickable links
 */
function linkifyText(text) {
  if (!text) return text;
  const splitRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(splitRegex);
  return parts.map((part, i) => {
    // Use a fresh regex (no /g) to avoid lastIndex issues
    if (/^https?:\/\/[^\s]+/.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="!text-blue-600 hover:!text-blue-800 underline break-all font-semibold"
          style={{ color: '#2563eb' }}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

function mergeUserDisplayFallback(user, fallbackUser) {
  if (!fallbackUser) return user;
  return {
    ...fallbackUser,
    ...user,
    first_name: user?.first_name || fallbackUser?.first_name,
    last_name: user?.last_name || fallbackUser?.last_name,
    full_name: user?.full_name || fallbackUser?.full_name,
    display_name: user?.display_name || fallbackUser?.display_name,
    username: user?.username || fallbackUser?.username,
    email: user?.email || fallbackUser?.email,
    avatar: user?.avatar || fallbackUser?.avatar,
  };
}

//

const defaultEmptyMessages = [];
export default function MessageArea() {
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const room_name = searchParams.get("room_name") || "";

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

  // ── Reply-to ──────────────────────────────────────────────────────────
  const setReplyingTo = useMessagesStore((state) => state.setReplyingTo);
  const applyEditedMessage = useMessagesStore((state) => state.applyEditedMessage);
  // Which message to flash after jumping to it. Cleared on a timer so the
  // highlight is a hint, not a permanent selection.
  const [highlightedId, setHighlightedId] = useState(null);
  const highlightTimer = useRef(null);

  useEffect(() => () => clearTimeout(highlightTimer.current), []);

  // Mirrors MESSAGE_EDIT_WINDOW in chat/views.py. Duplicated deliberately:
  // the server is the authority, but offering an Edit button that always
  // fails is worse than not offering it. If the two ever drift the server
  // still wins - the client just shows an action that errors, rather than
  // silently permitting something.
  const EDIT_WINDOW_MS = 15 * 60 * 1000;

  // Forwarding. Targets are your existing conversations (lastMessages), which
  // is the common case and avoids a contact picker; the backend caps one
  // forward at 10 recipients regardless.
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [forwardTargets, setForwardTargets] = useState([]);
  const [forwardSending, setForwardSending] = useState(false);
  const lastMessages = useMessagesStore((state) => state.lastMessages);

  const toggleForwardTarget = (userId) =>
    setForwardTargets((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );

  const submitForward = async () => {
    if (!forwardingMessage || forwardTargets.length === 0) return;
    setForwardSending(true);
    try {
      const result = await forwardMessage(forwardingMessage.id, forwardTargets);
      const failed = Object.entries(result?.errors || {});
      setForwardingMessage(null);
      setForwardTargets([]);
      if (failed.length) {
        // Named rather than swallowed: reaching three of four and reporting
        // success is worse than saying which one missed.
        toast.warning(
          `Sent to ${result.forwarded?.length ?? 0}. Could not send to ${failed.length}.`
        );
      } else {
        toast.success(`Forwarded to ${result.forwarded?.length ?? 0}.`);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.detail || "Could not forward the message"
      );
    } finally {
      setForwardSending(false);
    }
  };

  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const canEditMessage = (message) =>
    message?.is_current_user &&
    message?.id != null &&
    !message?.optimistic &&
    !message?.error &&
    Date.now() - new Date(message.timestamp).getTime() < EDIT_WINDOW_MS;

  const beginEdit = (message) => {
    setEditingId(message.id);
    setEditDraft(message.content || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft("");
  };

  const saveEdit = async (message) => {
    const next = editDraft.trim();
    if (!next) {
      toast.info("A message cannot be emptied. Delete it instead.");
      return;
    }
    if (next === message.content) {
      cancelEdit();
      return;
    }
    setEditSaving(true);
    try {
      const updated = await updateMessage(message.id, { content: next });
      applyEditedMessage(updated);
      cancelEdit();
    } catch (error) {
      // The 15-minute window and the sender-only rule are enforced server
      // side, so surface what it said rather than guessing.
      toast.error(
        error?.response?.data?.detail ||
          error?.response?.data?.content ||
          "Could not edit the message"
      );
    } finally {
      setEditSaving(false);
    }
  };

  // Drag-to-reply is enabled only on touch-primary devices.
  //
  // framer-motion's drag captures pointer events on the element it is applied
  // to, which means a mouse drag across a bubble never starts a text
  // selection - so enabling it everywhere broke selecting and copying a
  // message, which matters far more than a shortcut. On a desktop the hover
  // Reply button already makes the action discoverable, so drag buys nothing
  // there and costs copy/paste. On a touchscreen there is no hover, selection
  // is a long-press rather than a drag, and swipe is the expected gesture.
  const [isTouchDevice] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches
  );

  // Bubbles carried no DOM id, so there was nothing to scroll to. Keyed by
  // String(id) because ids arrive as both numbers (server) and strings
  // (optimistic temp ids).
  const messageRefs = useRef({});

  const jumpToMessage = (messageId) => {
    if (messageId == null) return;
    const node = messageRefs.current[String(messageId)];
    if (!node) {
      // The quoted message is real but not in the rendered window. Better to
      // say nothing happened than to scroll somewhere arbitrary.
      return;
    }
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedId(String(messageId));
    clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightedId(null), 1800);
  };

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
      {/* Forward picker. Existing conversations rather than the whole address
          book: it is the common case, and the backend caps a forward at 10
          recipients anyway. */}
      {forwardingMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setForwardingMessage(null)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold text-dark">Forward to</h3>
              <button
                type="button"
                onClick={() => setForwardingMessage(null)}
                className="text-gray-400 hover:text-dark"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <p className="mb-3 line-clamp-2 rounded bg-gray-50 p-2 text-xs text-gray-600">
              {forwardingMessage.content || "Attachment"}
            </p>
            <div className="max-h-64 overflow-y-auto">
              {(lastMessages || []).length === 0 && (
                <p className="py-4 text-center text-sm text-gray-500">
                  No other conversations to forward to yet.
                </p>
              )}
              {(lastMessages || []).map((chat) => {
                const other = chat?.other_user;
                if (!other?.id || other.id === currentUser?.id) return null;
                const selected = forwardTargets.includes(other.id);
                return (
                  <label
                    key={other.id}
                    className="flex cursor-pointer items-center gap-2 border-b border-gray-100 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleForwardTarget(other.id)}
                      className="accent-gold"
                    />
                    <span className="truncate text-dark">
                      {getUserDisplayName(other)}
                    </span>
                  </label>
                );
              })}
            </div>
            <button
              type="button"
              disabled={forwardTargets.length === 0 || forwardSending}
              onClick={submitForward}
              className="mt-3 w-full rounded-full bg-gold py-2 text-sm font-semibold text-dark disabled:opacity-50"
            >
              {forwardSending
                ? "Forwarding..."
                : forwardTargets.length
                  ? `Forward to ${forwardTargets.length}`
                  : "Select someone"}
            </button>
          </div>
        </div>
      )}

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
                    const senderUser = is_current_user
                      ? mergeUserDisplayFallback(sender_info, currentUser)
                      : sender_info;
                    const senderName = getUserDisplayName(senderUser);

                    // Optimistic and errored messages have no server id for
                    // a reply to point at. This store mints pending ids with
                    // uuidv4(), so the flag is the reliable test, not an id
                    // prefix.
                    const canReply =
                      message?.id != null &&
                      !message?.error &&
                      !message?.optimistic;

                    const msgDate = new Date(message.timestamp);

                    const hourFmt = converthourTo12hrFormat(
                      msgDate.getHours(),
                      msgDate.getMinutes()
                    );

                    return (
                      <motion.div
                        key={message?.id || index}
                        ref={(node) => {
                          if (message?.id == null) return;
                          if (node) messageRefs.current[String(message.id)] = node;
                          else delete messageRefs.current[String(message.id)];
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        // Swipe/drag to reply, matching the mobile gesture.
                        // framer-motion already wraps every bubble, so this is
                        // its drag support rather than a new dependency, and it
                        // covers touch and mouse from the same handler.
                        // Vertical drag is left alone so the thread still
                        // scrolls normally on a touchscreen.
                        {...(canReply && isTouchDevice
                          ? {
                              drag: "x",
                              dragDirectionLock: true,
                              dragConstraints: { left: 0, right: 0 },
                              dragElastic: 0.25,
                              onDragEnd: (_event, info) => {
                                // Either direction, so it works the same on
                                // your own messages and theirs.
                                if (Math.abs(info.offset.x) > 60) {
                                  setReplyingTo(message);
                                }
                              },
                            }
                          : {})}
                        className={clsx(
                          "group w-full max-w-[400px] p-1 pt-4 flex gap-2.5 max-sm:px-4 max-xs:px-2",
                          is_current_user && "ml-auto flex-row-reverse",
                          canReply &&
                            isTouchDevice &&
                            "cursor-grab active:cursor-grabbing"
                        )}
                      >
                        <Link to={`/co/${sender_info?.id}`} className="h-fit">
                          <Avatar
                            name={senderName}
                            src={sender_info?.avatar}
                            size="sm"
                            className={avatarStyle}
                          />
                        </Link>

                        {/* Reply affordance. Hidden until hover to keep the
                            thread clean, but focusable so it is reachable
                            without a pointer. Suppressed for optimistic and
                            failed sends, which have no server id yet for a
                            reply to point at. Guarded on `optimistic` rather
                            than an id prefix: this store uses uuidv4() for
                            pending ids (addOptimisticMessage), so a prefix
                            check would miss them and send a UUID where the
                            backend expects an integer message id. */}
                        {canEditMessage(message) && editingId !== message.id && (
                          <button
                            type="button"
                            onClick={() => beginEdit(message)}
                            title="Edit"
                            aria-label="Edit this message"
                            className="self-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-gray-400 hover:text-gold shrink-0"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </button>
                        )}

                        {canReply && (
                          <button
                            type="button"
                            onClick={() => {
                              setForwardTargets([]);
                              setForwardingMessage(message);
                            }}
                            title="Forward"
                            aria-label="Forward this message"
                            className="self-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-gray-400 hover:text-gold shrink-0"
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="15 17 20 12 15 7" />
                              <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
                            </svg>
                          </button>
                        )}

                        {canReply && (
                            <button
                              type="button"
                              onClick={() => setReplyingTo(message)}
                              title="Reply"
                              aria-label="Reply to this message"
                              className="self-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-gray-400 hover:text-gold shrink-0"
                            >
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="9 17 4 12 9 7" />
                                <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                              </svg>
                            </button>
                          )}
                        <div
                          className={clsx(
                            "!shrink-0 !w-fit !max-w-[80%] xs:text-sm rounded-md p-3 pt-1 flex flex-col transition-shadow select-text",
                            // Your own messages carry the brand accent and
                            // the other person's are neutral - the convention
                            // in every mainstream messenger, and what the
                            // mobile app already did. Web had it inverted, so
                            // the same conversation looked like two different
                            // products side by side.
                            is_current_user
                              ? "bg-pale_yellow text-dark"
                              : "bg-white",
                            // Flashed after a jump so it is obvious which
                            // message was meant - scrolling alone leaves the
                            // user hunting.
                            highlightedId === String(message?.id) &&
                              "ring-2 ring-gold"
                          )}
                        >
                          <h1 className="mb-1 font-semibold capitalize text-gray-400 text-[.7rem]">
                            {is_current_user ? "You" : senderName}
                          </h1>

                          {/* Marks content that came from another
                              conversation. Without it a forward looks like
                              something the sender wrote. Deliberately unnamed
                              source - see Message.is_forwarded. */}
                          {message?.is_forwarded && (
                            <span
                              className={clsx(
                                "mb-1 flex items-center gap-1 text-[.65rem] italic",
                                is_current_user ? "text-dark/60" : "text-gray-500"
                              )}
                            >
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="15 17 20 12 15 7" />
                                <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
                              </svg>
                              Forwarded
                            </span>
                          )}

                          {/* The message this one replies to. Click to jump. */}
                          {message?.reply_to_preview && (
                            <button
                              type="button"
                              onClick={() =>
                                jumpToMessage(message.reply_to_preview.id)
                              }
                              className={clsx(
                                "mb-1.5 w-full text-left border-l-[3px] rounded px-2 py-1 transition-colors",
                                // A gold rule on a gold bubble is invisible,
                                // so the accent flips with the surface.
                                is_current_user
                                  ? "border-dark/40 bg-dark/[.08] hover:bg-dark/[.13]"
                                  : "border-gold bg-black/[.04] hover:bg-black/[.07]"
                              )}
                            >
                              <span
                                className={clsx(
                                  "block text-[.65rem] font-bold truncate",
                                  is_current_user
                                    ? "text-dark/80"
                                    : "text-[#7a6320]"
                                )}
                              >
                                {message.reply_to_preview.sender_id ===
                                currentUser?.id
                                  ? "You"
                                  : message.reply_to_preview.sender_name ||
                                    "Unknown"}
                              </span>
                              <span
                                className={clsx(
                                  "block text-[.7rem] line-clamp-2",
                                  is_current_user
                                    ? "text-dark/75"
                                    : "text-gray-600",
                                  message.reply_to_preview.is_deleted &&
                                    "italic opacity-75"
                                )}
                              >
                                {message.reply_to_preview.is_deleted
                                  ? "Message deleted"
                                  : message.reply_to_preview.content ||
                                    (message.reply_to_preview.has_attachment
                                      ? "Attachment"
                                      : "")}
                              </span>
                            </button>
                          )}

                          {/* Quoted message was hard-deleted: reply_to survives
                              with a null preview (SET_NULL server-side). */}
                          {!message?.reply_to_preview && message?.reply_to && (
                            <div className="mb-1.5 border-l-[3px] border-gray-300 bg-black/[.04] rounded px-2 py-1">
                              <span className="block text-[.7rem] italic text-gray-500">
                                Message unavailable
                              </span>
                            </div>
                          )}
                          {editingId === message.id ? (
                            <div className="flex flex-col gap-1.5">
                              <textarea
                                autoFocus
                                rows={2}
                                value={editDraft}
                                onChange={(e) => setEditDraft(e.target.value)}
                                onKeyDown={(e) => {
                                  // Enter saves, Shift+Enter newlines, Escape
                                  // abandons - matching the composer.
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    saveEdit(message);
                                  } else if (e.key === "Escape") {
                                    cancelEdit();
                                  }
                                }}
                                className="w-full min-w-[200px] resize-y rounded border border-dark/20 bg-white/70 p-1.5 text-sm text-dark outline-none focus:border-dark/40"
                              />
                              <div className="flex items-center gap-2 text-[.7rem]">
                                <button
                                  type="button"
                                  disabled={editSaving}
                                  onClick={() => saveEdit(message)}
                                  className="font-semibold text-dark disabled:opacity-50"
                                >
                                  {editSaving ? "Saving..." : "Save"}
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="text-dark/60 hover:text-dark"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                          <p
                            className={clsx(
                              "transition-all duration-300 whitespace-pre-wrap break-words",
                              is_current_user
                                ? "text-dark"
                                : "text-gray-700 hover:text-gray-900"
                            )}
                          >
                            {linkifyText(message?.content.substring(0, readMoreLimit))}
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
                          )}

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

                              {`${hourFmt.hour}:${hourFmt.minute} ${hourFmt.meridiem}`}
                            </small>
                            {/* Without this a rewritten message is
                                indistinguishable from the original, which is
                                the whole reason the backend records it. */}
                            {message?.is_edited && (
                              <small
                                className="shrink-0 italic"
                                title={
                                  message.edited_at
                                    ? `Edited ${new Date(message.edited_at).toLocaleString()}`
                                    : "Edited"
                                }
                              >
                                edited
                              </small>
                            )}
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
