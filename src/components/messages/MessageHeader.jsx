import { PhoneOutlined } from "@ant-design/icons";
import { Avatar, Text } from "@chakra-ui/react";
import { ChevronLeftRounded } from "@mui/icons-material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { webRoutes } from "../../lib/webRoutes";
import { avatarStyle } from "../ResponsiveNav";
import Username from "../Username";
import { ButtonWithTooltipIcon } from "../admin/feeds/DiscoverPosts";
import { CircleTitleSubtitleSkeleton } from "../admin/feeds/TopServiceSuggestions";

function MessageHeader({ user, isLoading }) {
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between bg-white p-2 pr-4 rounded-t-md gap-2">
      <ButtonWithTooltipIcon
        IconName={ChevronLeftRounded}
        iconClassName="text-lg"
        className=" lg:!hidden"
        tip="Back to Messages"
        onClick={() => navigate(webRoutes.messages)}
      />

      <div className="flex-1 flex items-center gap-2">
        {isLoading ? (
          <CircleTitleSubtitleSkeleton />
        ) : (
          <>
            <Avatar
              src={user?.avatar}
              name={user?.first_name + " " + user?.last_name}
              className={avatarStyle}
              width="40px"
              height="40px"
            />
            <div className="text-sm leading-0">
              <Username user={user} />
              <Text color="green.500" fontSize="small" fontWeight="600">
                Online
              </Text>
            </div>
          </>
        )}
      </div>

      <ButtonWithTooltipIcon IconName={PhoneOutlined} tip="Call" />
    </header>
  );
}

export default MessageHeader;
