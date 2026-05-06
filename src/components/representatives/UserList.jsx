import { Avatar } from "@chakra-ui/react";
import { CircleTitleSubtitleSkeleton } from "../admin/feeds/TopServiceSuggestions";
import HeadingText from "../HeadingText";
import LightParagraph from "../ParagraphText";
import { motion } from "framer-motion";
import clsx from "clsx";
import { avatarStyle } from "../ResponsiveNav";
import Username from "../Username";
import RepRoleInput from "../form/RepRoleInput";

export const UserList = ({ isLoading, filteredUsers, setCachedReps }) => (
  <section className="">
    <HeadingText weight="semibold">Users</HeadingText>
    <section className="divide-y divide-gray-200/70">
      {isLoading ? (
        Array.from({ length: 5 }, (_, index) => (
          <CircleTitleSubtitleSkeleton key={index} />
        ))
      ) : filteredUsers?.length < 1 ? (
        <div className="py-4">
          <LightParagraph>No users found...</LightParagraph>
        </div>
      ) : (
        filteredUsers?.slice(0, 10).map((user) => (
          <motion.section
            key={user?.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex sm:items-center sm:justify-between max-sm:flex-col gap-4 mb-4 pt-4"
          >
            <div className="flex gap-2 items-center">
              <Avatar
                src={user?.avatar || ""}
                name={user?.first_name + " " + user?.last_name}
                size="md"
                className={clsx(avatarStyle)}
              />
              <div className="flex flex-col">
                <Username user={user} />
                <small className="text-gray-400 !-my-1 line-clamp-2">
                  {user?.role}
                </small>
              </div>
            </div>
            <RepRoleInput user={user} />
          </motion.section>
        ))
      )}
    </section>
  </section>
);
