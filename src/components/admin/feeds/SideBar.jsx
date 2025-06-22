import { Avatar } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useMediaQuery } from "react-responsive";
import { Link } from "react-router-dom";
import { getAllCompanies } from "../../../api-services/companies";
import { useNav } from "../../../context/navContext";
import { useAuth } from "../../../context/userContext";
import { capitalizeFirst } from "../../../lib/utils";
import CloseOverlay from "../../CloseOverlay";
import LightParagraph from "../../ParagraphText";
import { avatarStyle } from "../../ResponsiveNav";
import CompanyName from "../../company/CompanyName";
import FeedSearch from "../../custom/FeedSearch";
import Logo from "../../logo";
import { CircleTitleSubtitleSkeleton } from "../feeds/TopServiceSuggestions";

const Sidebar = () => {
  const { navOpen, toggleNav } = useNav();

  const isTablet = useMediaQuery({ minWidth: 768 });

  if (isTablet) toggleNav(false);

  return (
    <>
      <CloseOverlay />
      <div
        className={clsx(
          "max-md:absolute max-md:top-0 max-md:left-0 max-md:h-screen bg-white rounded p-4 shrink-0 max-w-[350px] md:w-[240px] lg:w-[270px] 2xl:w-[280px] min-h-screen max-md:transition-all duration-500 ease-out md:sticky md:top-0 md:right-4 md:h-screen md:overflow-y-auto scrollbar-hidden",
          {
            "max-md:overflow-y-auto max-md:min-w-[300px] max-md:w-[60%] z-[20000]":
              navOpen,
            "max-md:overflow-hidden max-md:-left-full max-md:opacity-0 max-md:-z-[20000]":
              !navOpen,
          }
        )}
      >
        <Logo className="md:mx-auto mb-4" height="70px" width="70px" />

        <FeedSearch className="xs:hidden mb-4" />

        {/* <NavigationSection /> */}

        <CompaniesList />
      </div>
    </>
  );
};

export default Sidebar;

export function CompaniesList({ queryFn = getAllCompanies }) {
  const { user: currentUser } = useAuth();
  const { data: companiesList, isLoading } = useQuery({
    queryKey: ["allConnectizeCompanies"],
    queryFn: queryFn,
  });

  const companies = companiesList?.results?.filter(
    (company) => company?.id !== currentUser?.companies?.[0]
  );

  return (
    <div className="space-y-3 mb-4 bg-white rounded-md p-4 w-full">
      <h3 className="font-semibold text-xl">Companies</h3>

      <ul className="space-y-2 divide-y divide-gray-100/80 xs:text-sm p-0">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <CircleTitleSubtitleSkeleton key={index} />
          ))
        ) : companies?.length <= 0 ? (
          <LightParagraph>No company yet...</LightParagraph>
        ) : (
          companies?.map((company) => (
            <CompanyListItem key={company?.id} company={company} />
          ))
        )}
      </ul>
    </div>
  );
}

function CompanyListItem({ company }) {
  const { company_name, logo, tag_line, verify, slug } = company;

  return (
    <li className="flex items-center gap-2 pt-2">
      <Link to={`/${slug}`}>
        <Avatar
          src={logo}
          name={company_name}
          size="sm"
          className={avatarStyle}
        />
      </Link>
      <div>
        <CompanyName slug={slug} name={company_name} verified={verify} size="md" />
        <small className="text-gray-400 text-xs line-clamp-1">
          {capitalizeFirst(tag_line) || "Tag line goes here"}
        </small>
      </div>
    </li>
  );
}
