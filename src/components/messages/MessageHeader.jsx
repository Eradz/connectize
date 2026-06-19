import { PhoneOutlined } from "@ant-design/icons";
import { Avatar, Text, useStatStyles } from "@chakra-ui/react";
import { ChevronLeftRounded } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { webRoutes } from "../../lib/webRoutes";
import { useMessagesStore } from "../../stores/messagesStore";
import { avatarStyle } from "../ResponsiveNav";
import Username from "../Username";
import { ButtonWithTooltipIcon } from "../ButtonWithTooltipIcon";
import { CircleTitleSubtitleSkeleton } from "../admin/feeds/TopServiceSuggestions";
import { useAuth } from "../../context/userContext";
import { getUserDisplayName } from "../../lib/userDisplay";

function MessageHeader() {
  const { user: currentUser } = useAuth();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const room_name = searchParams.get("room_name");
  const openedMessage = useMessagesStore((state) => state.openedMessage);
  const loading = useMessagesStore((state) => state.loading);
  const setOpenedMessage = useMessagesStore((state) => state.setOpenedMessage);

  const [isLoadingOpenedMessage, setIsLoadingOpenedMessage] = useState(false);

  // console.log({ openedMessage });
  const otherUser = openedMessage?.other_user || null;

  async function handleSetOpenedMessage() {
    try {
      setIsLoadingOpenedMessage(true);
      await setOpenedMessage(null, room_name);
    } catch (error) {
    } finally {
      setIsLoadingOpenedMessage(false);
    }
  }

  let nameToDisplay;

  if (otherUser?.first_name && otherUser?.last_name) {
    nameToDisplay = `${otherUser.first_name} ${otherUser.last_name}`;
  } else {
    nameToDisplay = getUserDisplayName(otherUser);
  }

  useEffect(() => {
    if (!room_name) return;
    if (openedMessage && openedMessage.room_name == room_name) return;
    handleSetOpenedMessage();
  }, [openedMessage, room_name, loading]);

  const isSentToSelf = Boolean(
    currentUser?.id &&
      otherUser?.id &&
      String(currentUser.id) === String(otherUser.id)
  );
  const userToDisplay = otherUser
    ? {
        ...otherUser,
        ...(isSentToSelf
          ? { last_name: `${otherUser.last_name || ""} (You)`.trim() }
          : {}),
      }
    : {
        first_name: "Unknown",
        last_name: `User${isSentToSelf ? " (You)" : ""}`,
      };

  return (
    <header className="flex items-center justify-between bg-white p-2 pr-4 rounded-t-md gap-2 sticky">
      <ButtonWithTooltipIcon
        IconName={ChevronLeftRounded}
        iconClassName="text-lg"
        className=" lg:!hidden"
        tip="Back to Messages"
        onClick={() => navigate(webRoutes.messages)}
      />

      <div className="flex-1 flex items-center gap-2">
        {loading || isLoadingOpenedMessage ? (
          <CircleTitleSubtitleSkeleton />
        ) : (
          <>
            <Avatar
              src={otherUser?.avatar}
              name={nameToDisplay}
              className={avatarStyle}
              width="40px"
              height="40px"
            />
            <div className="text-sm leading-0">
              <Username user={userToDisplay} noClick={!otherUser?.id} />
              <Text
                color="green.500"
                fontSize="small"
                fontWeight="600"
                isTruncated
              >
                {otherUser?.role}
              </Text>
            </div>
          </>
        )}
      </div>

      {/* <ButtonWithTooltipIcon IconName={PhoneOutlined} tip="Call" /> */}
    </header>
  );
}

export default MessageHeader;
