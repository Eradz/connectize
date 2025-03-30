import { Avatar } from "@chakra-ui/react";
import { ChevronLeft, Menu } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCompanyByIdOrEmail } from "../api-services/companies";
import { useNav } from "../context/navContext";
import { useAuth } from "../context/userContext";
import { ChartBar, Setting } from "../icon";
import { CompanyUserType } from "../lib/helpers/types";
import { ConjoinedAvatarSkeleton } from "./admin/feeds/DiscoverPosts";
import FeedSearch from "./custom/FeedSearch";
import { NotificationPopOver } from "./notifications";
import { LinkWithTooltipIcon } from "./userProfile/Navbar";
import { useGetCurrentCompany } from "../hooks";

function ResponsiveNav() {
  const { toggleNav } = useNav();

  return (
    <div className="flex justify-between items-center gap-2 sm:gap-4 w-full mb-4 max-md:mt-2">
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

  const { data: companies, isLoading } = useGetCurrentCompany()

  const [headingImages, setHeadingImages] = useState([]);

  useEffect(() => {
    if (currentUser?.user_type === CompanyUserType) {
      setHeadingImages([
        {
          src: companies?.[0]?.logo || "/images/default-company-logo.png",
          name: companies?.[0]?.company_name || "",
          href:
            companies?.length > 0
              ? `/${companies[0].company_name}`
              : "/create-company",
        },
      ]);
    }
  }, [currentUser?.user_type, companies]);

  return isLoading ? (
    <ConjoinedAvatarSkeleton length={2} />
  ) : (
    <div className="relative h-fit w-fit">
      <ChevronLeft className="absolute -left-1 -bottom-2 -rotate-45 !size-4" />
      <ConJoinedImages
        sizeVariant={"sm"}
        size={35}
        array={[
          {
            src: currentUser?.avatar || "",
            name: `${currentUser?.first_name || ""} ${
              currentUser?.last_name || "" || currentUser?.email
            }`,
            href: `/co/${currentUser?.id}`,
          },

          ...headingImages,
        ]}
      />
    </div>
  );
};

export const ConJoinedImages = ({
  size = 40,
  array,
  animate = true,
  className,
  sizeVariant,
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
