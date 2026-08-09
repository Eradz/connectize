import { Avatar, Menu, MenuButton, MenuList, MenuItem, IconButton } from "@chakra-ui/react";
import { DotsHorizontalIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { VerifiedIcon } from "../../icon";
import { formatNumber } from "../../lib/utils";
import { StatsText } from "../../pages/feed/companyProfile";
import clsx from "clsx";
import { avatarStyle } from "../ResponsiveNav";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/userContext";
import ConnectButton from "../ConnectButton";
import { useState } from "react";
import BlockUserButton from "../moderation/BlockUserButton";
import ReportModal from "../moderation/ReportModal";
import { webRoutes } from "../../lib/webRoutes";
import { getUserDisplayName } from "../../lib/userDisplay";

export default function UserProfileHeadings({
  first_name,
  last_name,
  verified,
  company,
  id,
  is_first_time_user,
  followers_count,
  following_count,
  email,
  full_name,
  display_name,
  username,
  connection_status,
}) {
  const { user: currentUser } = useAuth();
  const [cachedConnections, setCachedConnections] = useState(followers_count);
  const [showReportModal, setShowReportModal] = useState(false);
  const displayName = getUserDisplayName({
    first_name,
    last_name,
    full_name,
    display_name,
    username,
    email,
  });

  return (
    <section className="flex max-md:flex-col md:items-center gap-4 md:justify-between">
      <section className="space-y-1">
        <div className="flex items-center gap-x-0.5">
          <h2
            className={clsx(
              "text-2xl xs:leading-tight text-gray-700 font-bold",
              {
                capitalize: displayName,
              }
            )}
          >
            {displayName}
          </h2>
          {verified && <VerifiedIcon />}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`${webRoutes.userConnections.replace(":userId", id)}?tab=following`}>
            <StatsText text={`${formatNumber(following_count)} /following`} />
          </Link>
          <Link to={`${webRoutes.userConnections.replace(":userId", id)}?tab=followers`}>
            <StatsText text={`${formatNumber(cachedConnections)} /connections`} />
          </Link>
          {company && (
            <div className="flex items-center gap-1.5 text-sm">
              <Avatar size="xs" name={company} className={clsx(avatarStyle)} />
              <Link to={`/${company}`}>{company}</Link>
            </div>
          )}
        </div>
      </section>

      {currentUser?.id === id ? (
        <Link
          to={webRoutes.profileUpdate}
          className="block font-bold py-1.5 px-10 !bg-gold w-fit !rounded-full transition-all duration-300 active:scale-95 text-sm"
        >
          {is_first_time_user ? "Complete your profile" : "Edit profile"}
        </Link>
      ) : (
        <div className="flex items-center gap-2">
          <ConnectButton
            id={id}
            setCachedConnections={setCachedConnections}
            first_name={displayName}
            slug={id}
            connection_status={connection_status}
          />
          <BlockUserButton
            userId={id}
            userName={displayName}
          />
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<DotsHorizontalIcon />}
              variant="ghost"
              size="sm"
              aria-label="More options"
            />
            <MenuList>
              <MenuItem 
                icon={<ExclamationTriangleIcon />}
                onClick={() => setShowReportModal(true)}
              >
                Report User
              </MenuItem>
            </MenuList>
          </Menu>
          
          <ReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            contentType="user"
            contentId={id}
            reportedUserId={id}
          />
        </div>
      )}
    </section>
  );
}
