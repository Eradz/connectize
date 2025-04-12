import { Avatar, useDisclosure } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAllUsers } from "../../api-services/users";
import { CircleTitleSubtitleSkeleton } from "../../components/admin/feeds/TopServiceSuggestions";
import { CreateNewLink } from "../../components/admin/markets/carousel";
import { ChatSellerLink } from "../../components/admin/markets/newlyListed";
import ReusableModal from "../../components/custom/ResusableModal";
import CustomTabs from "../../components/custom/tabs";
import HeadingText from "../../components/HeadingText";
import Favorites from "../../components/messages/Favorites";
import MessagesList from "../../components/messages/MessagesList";
import LightParagraph from "../../components/ParagraphText";
import { UserSearchInput } from "../../components/representatives/UserSearchInput";
import { avatarStyle } from "../../components/ResponsiveNav";
import Username from "../../components/Username";
import { useAuth } from "../../context/userContext";
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
    enabled: !!currentUser,
  });

  const filteredUsers = useMemo(() => {
    return (
      users?.filter((user) => {
        const isCurrentUser = user?.id !== currentUser?.id;
        const hasDetails = user?.first_name || user?.last_name;
        const formattedUsername = username.toLowerCase();
        if (username.length > 0) {
          return (
            isCurrentUser &&
            hasDetails &&
            (user?.first_name?.toLowerCase().includes(formattedUsername) ||
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
      <HeadingText heading="sub-heading">Messages</HeadingText>
      <CustomTabs
        tabsHeading={["Recent Chats", "Favorites"]}
        tabsPanels={[<MessagesList />, <Favorites />]}
      />

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
            const { first_name, last_name, avatar, email: hashtag } = user;
            return (
              <motion.li
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 pt-2"
                key={index}
              >
                <Avatar
                  src={avatar}
                  name={`${first_name} ${last_name}`}
                  size="sm"
                  className={avatarStyle}
                />
                <div className="flex-1">
                  <Username user={user} />
                  <p className="text-sm text-gray-400 m-0">{hashtag}</p>
                </div>

                <ChatSellerLink text="Chat" recipientId={user?.id} />
              </motion.li>
            );
          })
        )}
      </ReusableModal>
    </>
  );
}
