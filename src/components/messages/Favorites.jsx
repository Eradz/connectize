import { Avatar } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getAllCompanies } from "../../api-services/companies";
import { getAllUsers } from "../../api-services/users";
import { useAuth } from "../../context/userContext";
import LightParagraph from "../ParagraphText";
import { avatarStyle } from "../ResponsiveNav";
import RoomName from "./RoomName";
import { useMessagesStore } from "../../stores/messagesStore";

export default function Favorites() {
  const { user: currentUser } = useAuth();

  // const { data: companies, isLoading: companiesLoading } = useQuery({
  //   queryKey: ["allConnectizeCompanies"],
  //   queryFn: getAllCompanies,
  //   enabled: !!currentUser,
  // });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    enabled: !!currentUser,
  });

  const filteredUsers = users
    ?.filter((user) => user.first_name && user?.id !== currentUser?.id)
    ?.slice(0, 10);

  console.log({ filteredUsers });

  return (
    <section className="flex gap-6 py-3 overflow-x-auto scroll-smooth scrollbar-hidden">
      {usersLoading ? (
        <CardSkeletonList />
      ) : filteredUsers?.length <= 0 ? (
        <LightParagraph>No favorites yet</LightParagraph>
      ) : (
        filteredUsers?.map((user) => {
          return (
            <motion.div
              key={user?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 py-6 bg-background/70 rounded-md text-center space-y-3 min-w-[180px] flex flex-col shrink-0"
            >
              <Link
                to={`/messages/?room_name=room_${currentUser?.id}_${user?.id}`}
              >
                <Avatar
                  className={avatarStyle}
                  src={user?.avatar}
                  name={
                    `${user?.first_name} ${user?.last_name}` || "Uknown User"
                  }
                  size="lg"
                />
              </Link>

              <RoomName user={user} />
            </motion.div>
          );
        })
      )}
    </section>
  );
}

const CardSkeletonList = () => {
  return Array.from({ length: 6 }, (_, index) => (
    <div
      key={index}
      className="p-2 py-4 bg-white rounded-md text-center space-y-3 w-[100px] flex flex-col shrink-0"
    >
      {/* Avatar Skeleton */}
      <div className="size-14 mx-auto rounded-full skeleton" />

      {/* Company Name Skeleton */}
      <div className="h-3.5 w-3/4 mx-auto skeleton rounded" />
    </div>
  ));
};
