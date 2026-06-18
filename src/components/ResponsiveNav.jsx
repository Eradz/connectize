import {
  Avatar,
  Divider,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import { ChevronLeft, Menu } from "@mui/icons-material";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNav } from "../context/navContext";
import { useAuth } from "../context/userContext";
import { useGetCurrentCompany } from "../hooks";
import { ChartBar, Setting, User } from "../icon";
import { CompanyUserType } from "../lib/helpers/types";
import { ConjoinedAvatarSkeleton } from "./admin/feeds/DiscoverPosts";
import FeedSearch from "./custom/FeedSearch";
import { NotificationPopOver } from "./notifications";
import { LinkWithTooltipIcon } from "./userProfile/Navbar";
import { AvatarIcon } from "@radix-ui/react-icons";
import { logOutCurrentUser } from "../api-services/users";
import ReusableModal from "./custom/ResusableModal";
import LightParagraph from "./ParagraphText";
import { LogoutOutlined } from "@ant-design/icons";
import { webRoutes } from "../lib/webRoutes";
import { getUserDisplayName } from "../lib/userDisplay";

function ResponsiveNav() {
  const { toggleNav } = useNav();

  return (
    <div className="flex justify-between items-center gap-2 sm:gap-4 w-full overflow-x- mb-4 max-md:mt-2">
      <JoinedUserCompanyImages />

      <FeedSearch className="max-xs:hidden" />

      <div className="flex items-center gap-3 sm:gap-5 pr-2">
        <NotificationPopOver />
        <LinkWithTooltipIcon
          IconName={ChartBar}
          to="/analysis"
          tip="Analysis"
        />
        <LinkWithTooltipIcon IconName={Setting} to="/settings" tip="Settings" />
        <button onClick={() => toggleNav(true)} className="md:hidden">
          <Menu />
        </button>
      </div>
    </div>
  );
}

export default ResponsiveNav;

export const avatarStyle = "!bg-gold !text-black border-2 border-white";

export const JoinedUserCompanyImages = () => {
  const { user: currentUser } = useAuth();
  const currentUserDisplayName = getUserDisplayName(currentUser);

  const { data: companies, isLoading } = useGetCurrentCompany();

  const [headingImages, setHeadingImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const handleLogout = async () => {
    setLoading(true);
    await logOutCurrentUser();
    setLoading(false);
  };

  function handleOpenPopOver() {
    const container = document.getElementById(
      "header-mobile-popover-container"
    );

    if (container) {
      container.style.setProperty("overflow", "");
      setIsPopoverOpen(true);
    }
  }
  function handleClosePopOver() {
    const container = document.getElementById(
      "header-mobile-popover-container"
    );

    if (container) {
      container.style.setProperty("overflow", "hidden");

      setIsPopoverOpen(false);
    }
  }

  useEffect(() => {
    if (currentUser?.user_type === CompanyUserType) {
      setHeadingImages([
        {
          src: companies?.[0]?.logo || "/images/default-company-logo.png",
          name: companies?.[0]?.company_name || "",
          href:
            companies?.length > 0 ? `/${companies[0].slug}` : "/company/create",
        },
      ]);
    }
  }, [currentUser?.user_type, companies]);

  return !currentUser || isLoading ? (
    <ConjoinedAvatarSkeleton length={2} />
  ) : (
    <div className="relative h-fit w-fit ">
      <div className="md:hidden">
        <Popover
          isOpen={isPopoverOpen}
          onOpen={handleOpenPopOver}
          onClose={handleClosePopOver}
        >
          <PopoverTrigger>
            <Avatar
              src={currentUser?.avatar || ""}
              name={currentUserDisplayName}
              size={"sm"}
              style={{
                transform: `translateX(-${6 * 0}px)`,
                width: `${35}px`,
                height: `${35}px`,
              }}
              className={clsx(
                "rounded-full transition-transform duration-500",
                avatarStyle,
                {
                  "group-hover:!translate-x-2 delay-200": false,
                }
              )}
            />
          </PopoverTrigger>

          <PopoverContent className="mx-2 !w-[160px]">
            <PopoverArrow />
            <div className="py-1">
              <Link
                to={`/co/${currentUser?.id}`}
                className="flex px-3 py-3 items-center transition-all active:scale-90 duration-300 hover:text-mid_grey text-gray-500 text-sm"
              >
                <User className="mr-2 text-gray-500" />{" "}
                <span className="!leading-none">My Account</span>
              </Link>

              <Link
                to={webRoutes.bookmarks}
                className="flex px-3 py-3 items-center transition-all active:scale-90 duration-300 hover:text-mid_grey text-gray-500 text-sm"
              >
                <User className="mr-2 text-gray-500" />{" "}
                <span className="!leading-none">My Bookmarks</span>
              </Link>

              <Link
                to="/co/settings"
                className="flex px-3 py-3 items-center transition-all active:scale-90 duration-300 hover:text-mid_grey text-gray-500 text-sm"
              >
                <Setting className="mr-2 text-gray-500" />{" "}
                <span className="!leading-none">Settings</span>
              </Link>
              <Divider />

              <>
                <ReusableModal
                  onClose={() => setIsOpen(false)}
                  isOpen={isOpen}
                  primaryAction={handleLogout}
                  title="Are you sure you want to log out?"
                  secondaryText="Cancel"
                  loading={loading}
                >
                  <LightParagraph>
                    You are about to end your current session.
                  </LightParagraph>
                </ReusableModal>
                <button
                  className={clsx(
                    "flex p-3 gap-2 items-center transition-colors duration-300 !text-red-600 disabled:cursor-not-allowed disabled:text-red-300"
                  )}
                  onClick={() => setIsOpen(true)}
                  disabled={loading}
                >
                  <LogoutOutlined className="text-sm" />
                  <span className={clsx("text-sm")}>
                    {loading ? "Logging out..." : "Logout"}
                  </span>
                </button>
              </>
            </div>
            {/* <NotificationItem isPopover /> */}
          </PopoverContent>
        </Popover>
      </div>
      <ChevronLeft className="absolute -left-1 -bottom-2 -rotate-45 !size-4" />

      <div className="max-md:hidden">
        <ConJoinedImages
          sizeVariant={"sm"}
          size={35}
          array={[
            {
              src: currentUser?.avatar || "",
              name: currentUserDisplayName,
              href: `/co/${currentUser?.id}`,
            },

            ...headingImages,
          ]}
        />
      </div>
    </div>
  );
};

export const ConJoinedImages = ({
  size = 40,
  array,
  animate = true,
  className,
  sizeVariant,
  renderAsLink,
}) => {
  return (
    <div className="flex group w-fit">
      {array.map(({ src, name, href }, index) => (
        <Link to={href} key={index}>
          <Avatar
            src={src}
            name={name}
            size={sizeVariant}
            style={{
              transform: `translateX(-${6 * index}px)`,
              width: `${size}px`,
              height: `${size}px`,
            }}
            className={clsx(
              "rounded-full transition-transform duration-500",
              avatarStyle,
              className,
              {
                "group-hover:!translate-x-2 delay-200": animate,
              }
            )}
          />
        </Link>
      ))}
    </div>
  );
};
