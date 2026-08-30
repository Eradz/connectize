import { Avatar, useDisclosure } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { VideoCameraOutlined } from "@ant-design/icons";
import { listCalls } from "../../api-services/calls";
import { getAllUsers } from "../../api-services/users";
import { CircleTitleSubtitleSkeleton } from "../../components/admin/feeds/TopServiceSuggestions";
import { CreateNewLink } from "../../components/admin/markets/carousel";
import { ChatSellerLink } from "../../components/admin/markets/newlyListed";
import ReusableModal from "../../components/custom/ResusableModal";
import HeadingText from "../../components/HeadingText";
import MessagesList from "../../components/messages/MessagesList";
import LightParagraph from "../../components/ParagraphText";
import { UserSearchInput } from "../../components/representatives/UserSearchInput";
import { avatarStyle } from "../../components/ResponsiveNav";
import Username from "../../components/Username";
import { useAuth } from "../../context/userContext";
import { getUserDisplayName, getUserHandle } from "../../lib/userDisplay";
import { webRoutes } from "../../lib/webRoutes";

export default function MessagesPage() {
  const { user: currentUser } = useAuth();

  const { isOpen, onClose, onOpen } = useDisclosure();
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const room_name = searchParams.get("room_name");

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    enabled: !!currentUser && isOpen, // ✅ Only fetch when modal is open
    staleTime: 5 * 60 * 1000, // ✅ Cache for 5 minutes
  });

  const filteredUsers = useMemo(() => {
    return (
      users?.filter((user) => {
        const isCurrentUser = user?.id !== currentUser?.id;
        const hasDetails =
          user?.first_name ||
          user?.last_name ||
          user?.full_name ||
          user?.display_name ||
          user?.username ||
          user?.email;
        const formattedUsername = username.toLowerCase();
        const displayName = getUserDisplayName(user).toLowerCase();
        const handle = getUserHandle(user).toLowerCase();

        if (username.length > 0) {
          return (
            isCurrentUser &&
            hasDetails &&
            (displayName.includes(formattedUsername) ||
              handle.includes(formattedUsername) ||
              user?.first_name?.toLowerCase().includes(formattedUsername) ||
              user?.last_name?.toLowerCase().includes(formattedUsername) ||
              user?.email?.toLowerCase().includes(formattedUsername) ||
              user?.country?.toLowerCase().includes(formattedUsername))
          );
        }
        return isCurrentUser && hasDetails;
      }) || []
    );
  }, [users, username, currentUser?.id]);

  // Calls this user still owes an answer on. Polled so a call booked while
  // this page is open shows up, and stops showing once answered elsewhere.
  // "upcoming", not "pending". Pending is only calls awaiting *your* answer,
  // so the moment both sides accepted, the badge vanished - which is exactly
  // when a call is most worth showing. Upcoming covers everything still ahead:
  // proposed, accepted, and in progress.
  const { data: upcomingCalls = [] } = useQuery({
    queryKey: ["calls", "upcoming"],
    queryFn: () => listCalls({ scope: "upcoming" }),
    // can_join flips five minutes before the start, and nothing else would
    // notice that moment arriving while this page sits open.
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  // A call you can walk into right now is a different thing from one booked
  // for Thursday, and they should not look the same.
  const joinableNow = upcomingCalls.filter((call) => call.can_join);
  const awaitingYou = upcomingCalls.filter((call) => call.is_my_turn);
  const callBadgeCount = joinableNow.length || awaitingYou.length || upcomingCalls.length;
  const callBadgeLabel = joinableNow.length
    ? `${joinableNow.length} call${joinableNow.length > 1 ? "s" : ""} you can join now`
    : awaitingYou.length
      ? `${awaitingYou.length} awaiting your reply`
      : `${upcomingCalls.length} upcoming call${upcomingCalls.length > 1 ? "s" : ""}`;

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <HeadingText heading="sub-heading">Messages</HeadingText>
        {/* The calls page had no way in: the only entry point was the button
            inside a conversation, so a booking you had already made was
            unreachable unless you remembered which chat you made it from. */}
        <Link
          to={webRoutes.calls}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 shrink-0"
          aria-label={callBadgeCount > 0 ? `Calls, ${callBadgeLabel}` : "Calls"}
        >
          <VideoCameraOutlined />
          <span>Calls</span>
          {/* Without this the link looked identical whether or not a call was
              booked, so a confirmed call was invisible until you thought to
              open the page - and a call happening right now looked the same as
              no call at all. */}
          {callBadgeCount > 0 && (
            <span
              className={`ml-0.5 min-w-5 h-5 px-1.5 grid place-items-center rounded-full text-xs font-semibold ${
                joinableNow.length
                  ? "bg-green-600 text-white animate-pulse"
                  : "bg-gold text-black"
              }`}
              title={callBadgeLabel}
            >
              {callBadgeCount}
            </span>
          )}
        </Link>
      </div>
      <MessagesList />
      {/* <CustomTabs
        tabsHeading={["Recent Chats", "Favorites"]}
        tabsPanels={[<MessagesList />, <Favorites />]}
      /> */}

        <>
          <CreateNewLink
            text="Start new chat"
            url="null"
            onClick={() => {
              navigate(webRoutes.messages);
              onOpen();
            }}
          />
          <ReusableModal
            isOpen={room_name ? !room_name : isOpen}
            onClose={onClose}
            footerContent={<></>}
            title="Start New Chat"
          >
            <UserSearchInput username={username} setUsername={setUsername} />
            {usersLoading ? (
              Array.from({ length: 5 }, (_, index) => (
                <div key={index}>
                  <CircleTitleSubtitleSkeleton />
                </div>
              ))
            ) : filteredUsers?.length <= 0 ? (
              <div className="mt-4 mx-2">
                <LightParagraph>No user found</LightParagraph>
              </div>
            ) : (
              filteredUsers.map((user, index) => {
                const { avatar } = user;
                const displayName = getUserDisplayName(user);
                const handle = getUserHandle(user);
                return (
                  <motion.li
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5 pt-2"
                    key={index}
                  >
                    <Avatar
                      src={avatar}
                      name={displayName}
                      size="sm"
                      className={avatarStyle}
                    />
                    <div className="flex-1">
                      <Username user={user} />
                      {handle && (
                        <p className="text-sm text-gray-400 m-0">@{handle}</p>
                      )}
                    </div>

                    <ChatSellerLink text="Chat" recipientId={user?.id} />
                  </motion.li>
                );
              })
            )}
          </ReusableModal>
        </>
    </>
  );
}
