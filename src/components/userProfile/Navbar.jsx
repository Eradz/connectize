import Headroom from "react-headroom";
import Logo from "../logo";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

import { Tooltip, Badge } from "@chakra-ui/react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/userContext";
import { Message, Setting } from "../../icon";
import { CompanyUserType } from "../../lib/helpers/types";
import FeedSearch from "../custom/FeedSearch";
import NavbarDropdown from "../NavbarDropdown";
import { NavigationSection } from "../NavigationSection";
import { IndicatorBadge, NotificationPopOver } from "../notifications";
import { JoinedUserCompanyImages } from "../ResponsiveNav";
import { webRoutes } from "../../lib/webRoutes";
import { SearchOutlined} from "@ant-design/icons";
import { SearchIcon } from "lucide-react";
import { useMessagesStore } from "../../stores/messagesStore";

const Navbar = () => {
  const { user: currentUser } = useAuth();
  const weirdFlex = "flex w-full gap-4 md:!gap-6 items-center";
  const [showBottomNav, setShowBottomNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Get unread messages count
  const lastMessages = useMessagesStore((state) => state.lastMessages);
  const totalUnreadMessages = useMemo(() => {
    return lastMessages?.reduce((total, message) => total + (message.unread_count || 0), 0) || 0;
  }, [lastMessages]);

  const handleScroll = () => {
    if (window.scrollY > lastScrollY) {
      setShowBottomNav(false);
    } else {
      setShowBottomNav(true);
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastScrollY]);

  return (
    <>
      <Headroom style={{ zIndex: 50 }}>
        <nav 
          className="w-full min-h-16 flex items-center bg-white z-[99999] ios-safe-top"
          style={{ 
            backgroundColor: '#ffffff',
            borderBottom: '2px solid #f1c644',
          }}
        >
          <section
            id="header-mobile-popover-container"
            className="sm:container max-xs:px-2 max-sm:px-4 w-full py-2 flex items-center justify-between !gap-2 lg:!gap-10 xl:!gap-14 shadow-sm"
          >
            <div className={weirdFlex}>
              <Logo size="50px" />
              <FeedSearch />
            </div>

            <div className="flex items-center gap-3 xs:gap-5 md:gap-7 shrink-0">
              <span className="hidden md:flex">
              {currentUser?.user_type === CompanyUserType && <NavbarDropdown />}
              </span>
              <div className="flex pt-2 gap-3 xs:gap-5 md:gap-7 shrink-0">
              <Link to={webRoutes.search} className="md:hidden">
                <SearchIcon className="font-bold" width={20} height={20} />
              </Link>
                <Link to={webRoutes.messages} className="md:hidden relative">
                  {totalUnreadMessages > 0 && (
                    <IndicatorBadge indicator={totalUnreadMessages} floating={true} />
                  )}
                  <Message width={20} height={20} />
                </Link>
                <Link to={webRoutes.coNotifications}>
                  <NotificationPopOver />
                </Link>
              </div>

              {/* <LinkWithTooltipIcon
                IconName={Setting}
                className="md:hidden"
                tip="settings"
                to="/co/settings"
              /> */}
              <JoinedUserCompanyImages />
            </div>
          </section>
        </nav>
      </Headroom>

      <motion.nav
        className="md:hidden bg-mid_grey fixed bottom-0 left-0 w-full z-[99999] ios-safe-bottom"
        style={{
          borderTop: '2px solid #f1c644',
          backgroundColor: '#373737',
        }}
        // initial={{ y: 0 }}
        // animate={{ y: 100 }} // showBottomNav ? 0 :
      >
        <section className="w-full">
          <NavigationSection hasHeader isSmallNavigation />
        </section>
      </motion.nav>
    </>
  );
};

export default Navbar;

export function LinkWithTooltipIcon({
  IconName,
  text,
  to,
  tip,
  className,
  tooltipClassName,
}) {
  return (
    <Tooltip
      label={tip}
      fontSize="sm"
      placement="auto"
      className={clsx(
        "!rounded-md !bg-white !text-custom_blue border",
        tooltipClassName
      )}
    >
      <Link
        to={to}
        className={clsx(
          "inline-flex items-center font-bold text-sm gap-3 text-gray-400 hover:text-custom_blue transition-colors duration-300",
          className
        )}
      >
        <IconName className="!size-5 !text-sm active:scale-95 transition-all duration-200" />
        {text && <span>{text}</span>}
      </Link>
    </Tooltip>
  );
}
