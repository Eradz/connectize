import { Avatar, useDisclosure } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { VideoCameraOutlined } from "@ant-design/icons";
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
        >
          <VideoCameraOutlined />
          <span>Calls</span>
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
