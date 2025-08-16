import Headroom from "react-headroom";
import Logo from "../logo";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Tooltip } from "@chakra-ui/react";
import clsx from "clsx";
import { Link } from "react-router";
import { useAuth } from "../../context/userContext";
import { Setting } from "../../icon";
import { CompanyUserType } from "../../lib/helpers/types";
import FeedSearch from "../custom/FeedSearch";
import NavbarDropdown from "../NavbarDropdown";
import { NavigationSection } from "../NavigationSection";
import { NotificationPopOver } from "../notifications";
import { JoinedUserCompanyImages } from "../ResponsiveNav";

const Navbar = () => {
  const { user: currentUser } = useAuth();
  const weirdFlex = "flex w-full gap-4 md:!gap-6 items-center";
  const [showBottomNav, setShowBottomNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
      <Headroom>
        <nav className="w-full h-16 flex items-center bg-white z-[99999]">
          <section
            id="header-mobile-popover-container"
            className="sm:container max-xs:px-2 max-sm:px-4 w-full py-2 flex items-center justify-between !gap-2 lg:!gap-10 xl:!gap-14 shadow-sm"
            style={{ overflowX: "hidden" }}
          >
            <div className={weirdFlex}>
              <Logo size="50px" />
              <FeedSearch />
            </div>

            <div className="flex items-center gap-3 xs:gap-5 md:gap-7 shrink-0">
              {currentUser?.user_type === CompanyUserType && <NavbarDropdown />}

              <NotificationPopOver />

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
        className="md:hidden bg-mid_grey fixed bottom-0 left-0 w-full z-[99999]"
        // initial={{ y: 0 }}
        // animate={{ y: 100 }} // showBottomNav ? 0 :
      >
        <section className="container">
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
