import { PhoneOutlined } from "@ant-design/icons";
import { Avatar, Text, useStatStyles } from "@chakra-ui/react";
import { ChevronLeftRounded } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { webRoutes } from "../../lib/webRoutes";
import { useMessagesStore } from "../../stores/messagesStore";
import { avatarStyle } from "../ResponsiveNav";
import Username from "../Username";
import { ButtonWithTooltipIcon } from "../admin/feeds/DiscoverPosts";
import { CircleTitleSubtitleSkeleton } from "../admin/feeds/TopServiceSuggestions";
import { useAuth } from "../../context/userContext";

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

  if (
    openedMessage?.other_user?.first_name &&
    openedMessage?.other_user?.last_name
  ) {
    nameToDisplay = `${openedMessage?.other_user?.first_name} ${openedMessage?.other_user?.last_name}`;
  } else {
    nameToDisplay =
      openedMessage?.other_user?.first_name ||
      openedMessage?.other_user?.last_name;
  }
  useEffect(() => {
    if (!room_name) return;
    if (openedMessage && openedMessage.room_name == room_name) return;
    handleSetOpenedMessage();
  }, [openedMessage, room_name, loading]);

  const isSentToSelf = currentUser?.id === openedMessage?.other_user?.id;
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
              src={openedMessage?.other_user?.avatar}
              name={nameToDisplay}
              className={avatarStyle}
              width="40px"
              height="40px"
            />
            <div className="text-sm leading-0">
              <Username
                user={
                  nameToDisplay
                    ? isSentToSelf
                      ? {
                          ...openedMessage?.other_user,
                          last_name:
                            openedMessage.other_user?.last_name + " (You)",
                        }
                      : openedMessage?.other_user
                    : {
                        ...openedMessage?.other_user,
                        first_name: "Unknown",
                        last_name: "User" + isSentToSelf ? " (You)" : "",
                      }
                }
              />
              <Text
                color="green.500"
                fontSize="small"
                fontWeight="600"
                isTruncated
              >
                {openedMessage?.other_user?.role}
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
