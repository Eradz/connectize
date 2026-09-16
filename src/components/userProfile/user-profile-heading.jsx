import { Avatar, Button, Menu, MenuButton, MenuList, MenuItem, IconButton } from "@chakra-ui/react";
import { ChatBubbleIcon, DotsHorizontalIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { VerifiedIcon } from "../../icon";
import { formatNumber } from "../../lib/utils";
import { getProfileViewsSummary, reportView, VIEW_TARGETS } from "../../api-services/engagement";
import { StatsText } from "../../pages/feed/companyProfile";
import clsx from "clsx";
import { avatarStyle, ConJoinedImages } from "../ResponsiveNav";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/userContext";
import ConnectButton from "../ConnectButton";
import { useEffect, useState } from "react";
import BlockUserButton from "../moderation/BlockUserButton";
import ReportModal from "../moderation/ReportModal";
import { webRoutes } from "../../lib/webRoutes";
import { getUserDisplayName } from "../../lib/userDisplay";
import { BarChart3, Eye, Pencil } from "lucide-react";
import { getUserFollowers } from "../../api-services/users";
import { useQuery } from "@tanstack/react-query";

export default function UserProfileHeadings({
  first_name,
  last_name,
  verified,
  company,
  id,
  bio,
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
  const [followers, setFollowers] = useState([]);
  const displayName = getUserDisplayName({
    first_name,
    last_name,
    full_name,
    display_name,
    username,
    email,
  });

    // Fetch followers from API and update state
    const fetchFollowers = async () => {
      try {
        const response = await getUserFollowers(id);
        setFollowers(response || []);
      } catch (error) {
        console.error("Error fetching followers:", error);
      }
    };  

    useEffect(() => {
      fetchFollowers();
    }, [id]);

    // Record that this profile was viewed, so it can show up in the owner's
      // "who viewed you" list. Only the client knows a profile page was opened, so
      // without this the feature has no data at all.
      //
      // Fire-and-forget, de-duplicated server-side (repeat views by the same person
      // inside a window count once), and skipped when viewing your own profile.
      useEffect(() => {
        if (!id || !currentUser?.id) return;
        if (String(id) === String(currentUser.id)) return;
        reportView(VIEW_TARGETS.user, id, "web_profile");
      }, [id, currentUser?.id]);
    
      // Powers the "who viewed you" link below, on your own profile only.
      const { data: profileViewsSummary } = useQuery({
        queryKey: ["profile-views-summary"],
        queryFn: () => getProfileViewsSummary({ days: 30 }),
        enabled: currentUser?.id === Number(id),
        staleTime: 60_000,
      });

  
  return (
    <section className={clsx("flex md:w-full gap-4 md:justify-between", currentUser?.id === id ? "md:flex-row" : "md:flex-col")}>
      <section className="space-y-2">
        <div className="flex items-center gap-x-0.5 text-[38px]">
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
        <div className="flex flex-wrap font-sans gap-2">
          <Link to={`${webRoutes.userConnections.replace(":userId", id)}?tab=following`}>
            <p>{`Linked ${formatNumber(following_count)} `}</p>
          </Link>
          <Link to={`${webRoutes.userConnections.replace(":userId", id)}?tab=followers`}>
            <p>{`Circle ${formatNumber(cachedConnections)} `}</p>
          </Link>
          {company && (
            <div className="flex items-center gap-1.5 text-sm">
              <Avatar size="xs" name={company} className={clsx(avatarStyle)} />
              <Link to={`/company/${company}`}>{company}</Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 ">
              <ConJoinedImages
              sizeVariant={"sm"}
              size={35}
              array={
                followers.slice(0, 3).map((follower, i) => 
                ({
                  src: follower.avatar || "",
                  name: getUserDisplayName(follower),
                  href: `/co/${follower.id}`,
                })
                )
              }
            />
            <p>{`and ${Math.max(0, followers.length - 3)} more`}</p>
        </div>
        <div className="hidden md:block space-y-2">
            <p className="text-gray-600">
              {bio || email}
            </p>
            {/* Who viewed you - only on your own profile. Shown even at zero,
                        because gating it on having views makes a brand new feature
                        undiscoverable until someone happens to visit you. */}
                    {currentUser?.id === Number(id) && (
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                        <Link
                          to={webRoutes.profileViews}
                          className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-dark underline-offset-4 hover:text-gold hover:underline"
                        >
                          <Eye className="size-4 shrink-0" />
                          <span>
                            {profileViewsSummary?.unique_viewers > 0
                              ? `${profileViewsSummary.unique_viewers} ${
                                  profileViewsSummary.unique_viewers === 1 ? "person" : "people"
                                } viewed your profile`
                              : "See who viewed your profile"}
                          </span>
                          {profileViewsSummary?.unseen_count > 0 && (
                            <span className="rounded-full bg-gold px-2 py-0.5 text-[.6rem] font-bold text-dark">
                              {profileViewsSummary.unseen_count} new
                            </span>
                          )}
                        </Link>
                        <Link
                          to={webRoutes.myStats}
                          className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-dark underline-offset-4 hover:text-gold hover:underline"
                        >
                          <BarChart3 className="size-4 shrink-0" />
                          <span>See your activity</span>
                        </Link>
                      </div>
                    )}

        </div>
      </section>
      {currentUser?.id === id ? (
        <Link
          to={webRoutes.profileUpdate}
          className=" hidden md:block items-center font-bold p-1.5 !bg-gray-300 w-fit h-fit rounded-md transition-all duration-300 active:scale-95 text-sm"
        >
          {is_first_time_user ?
           "Complete your profile" 
           :
           <div className="flex gap-1 ">
              <p>Edit</p>
             <Pencil className="w-4 h-4" />
           </div>
    }
        </Link>
      ) : (
        <div className="hidden md:flex items-center gap-2">
          <ConnectButton
            id={id}
            setCachedConnections={setCachedConnections}
            first_name={displayName}
            slug={id}
            connection_status={connection_status}
          />
          {/* Room names are built as room_<viewer>_<other> everywhere else that opens a
              DM (Favorites, RoomName, the workforce profile), so reuse that shape rather
              than inventing one the messages page would not recognise. */}
          <Button
            as={Link}
            to={`${webRoutes.messages}/?room_name=room_${currentUser?.id}_${id}`}
            size="sm"
            variant="outline"
            leftIcon={<ChatBubbleIcon />}
            className="!text-sm bg-background hover:!bg-gray-100 !border-gray-300 !border-[0px]"
          >
            Message
          </Button>
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
