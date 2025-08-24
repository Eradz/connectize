import { LogoutOutlined } from "@ant-design/icons";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { logOutCurrentUser } from "../api-services/users";
import { useNav } from "../context/navContext";
import { useAuth } from "../context/userContext";
import { feedNavItems } from "../lib/data";
import { getSession } from "../lib/session";
import { ButtonWithTooltipIcon } from "./ButtonWithTooltipIcon";
import ReusableModal from "./custom/ResusableModal";
import LightParagraph from "./ParagraphText";

export function NavigationSection({ hasHeader, isSmallNavigation = false }) {
  const { pathname } = useLocation();
  const { toggleNav } = useNav();
  const { user: currentUser } = useAuth();
  const session = getSession();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigators = useMemo(
    () => (isSmallNavigation ? feedNavItems.slice(0, 6) : feedNavItems),
    [isSmallNavigation]
  );

  const handleLogout = async () => {
    setLoading(true);
    await logOutCurrentUser();
    setLoading(false);
  };

  return (
    <ul
      className={clsx("xs:text-sm", {
        "flex items-center justify-between h-12": hasHeader,
        "bg-background rounded p-2 mb-6 space-y-1":
          !hasHeader && !isSmallNavigation,
      })}
    >
      {navigators.map(({ to, icon, name }, index) => {
        const isActive =
          to === "/" ? pathname === "/" : pathname.startsWith(to);
        return (
          <li key={index}>
            <Link
              to={to}
              onClick={() => toggleNav(false)}
              className={clsx(
                "flex gap-2 items-center transition-all active:scale-90 duration-300 p-2 py-2.5 xs:hover:!text-mid_grey !text-sm",
                {
                  "bg-mid_grey pointer-events-none": isActive,
                  "!text-gold rounded": isActive && !hasHeader,
                  "!text-gray-500": !isActive,
                  "flex-col text-xs xs:text-[.65rem]": hasHeader,
                }
              )}
            >
              <ButtonWithTooltipIcon
                IconName={icon}
                tip={name}
                iconClassName={clsx(
                  "hover:!text-gold text-xl !size-5 lg:!size-4",
                  {
                    "!text-gold rounded": isActive,
                    "!text-gray-500": !isActive,
                    "!text-white": !isActive && isSmallNavigation,
                  }
                )}
              />
              <span className="max-md:sr-only lg:!text-sm">{name}</span>
            </Link>
          </li>
        );
      })}
      {currentUser && session && !isSmallNavigation && (
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
          <li>
            <button
              className={clsx(
                "flex gap-2 items-center transition-colors duration-300 p-2 rounded hover:!text-red-600 text-gray-600 disabled:cursor-not-allowed disabled:text-red-300",
                {
                  "flex-col": hasHeader,
                  "!text-white": isSmallNavigation,
                }
              )}
              onClick={() => setIsOpen(true)}
              disabled={loading}
            >
              <LogoutOutlined className="!text-lg" />
              <span
                className={clsx({ "text-[.65rem] max-md:sr-only": hasHeader })}
              >
                {loading ? "Logging out..." : "Logout"}
              </span>
            </button>
          </li>
        </>
      )}
    </ul>
  );
}
