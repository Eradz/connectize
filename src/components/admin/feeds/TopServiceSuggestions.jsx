import { Avatar, Badge } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { getServices } from "../../../api-services/services";
import { getAllCompanies } from "../../../api-services/companies";
import {
  getAssociatedUsersForUser,
} from "../../../api-services/users";
import { useAuth } from "../../../context/userContext";
import { queryClient } from "../../../lib/utils";
import HeadingText from "../../HeadingText";
import LightParagraph from "../../ParagraphText";
import { avatarStyle } from "../../ResponsiveNav";
import SeeMoreLink from "../../SeeMoreLink";
import Username from "../../Username";
import CompanyName from "../../company/CompanyName";
import { PostCard, PostCardSkeleton } from "./DiscoverPostTabs";
import {
  useGetServicesFirstPage,
  usePageinatedServices,
} from "../../../hooks/useServices";
import { usePaginatedRepresentatives } from "../../../hooks/useRepresentatives";
import { MoreHorizontal } from "lucide-react";

const TopServiceSuggestions = () => {
  return (
    <section className="max-md:container !p-0 lg:p-4 h-fit w-full xl:w-[45%] flex items-start flex-col sm:flex-col lg:flex-row xl:flex-col shrink-0 gap-4 lg:sticky lg:top-2 max-h-[97vh] overflow-y-auto">      
      {/* My Companies Section */}
      <MyCompaniesSection />
      
      {/* Other Companies Section */}
      <OtherCompaniesSection />
    </section>
  );
};

export default TopServiceSuggestions;

// MY COMPANIES SECTION
export function MyCompaniesSection() {
  const { user: currentUser } = useAuth();
  
  const { data: companiesList, isLoading } = useQuery({
    queryKey: ["allConnectizeCompanies"],
    queryFn: getAllCompanies,
  });

  // Get user's companies
  const userCompanyIds = currentUser?.companies?.map(c => c.id) || [];
  const myCompanies = companiesList?.results?.filter(
    (company) => userCompanyIds.includes(company?.id)
  ) || [];

  return (
    <div className="bg-white rounded-2xl w-full border border-gray-200 overflow-hidden">
      <h2 className="text-base font-semibold px-5 py-4 text-gray-900 border-b border-gray-100">
        My Companies
      </h2>
      
      <ul className="divide-y divide-gray-100">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="px-5 py-3">
              <CircleTitleSubtitleSkeleton />
            </div>
          ))
        ) : myCompanies?.length <= 0 ? (
          <li className="px-5 py-4">
            <LightParagraph className="text-sm text-gray-500">
              No companies yet
            </LightParagraph>
          </li>
        ) : (
          myCompanies?.map((company) => (
            <MyCompanyItem key={company?.id} company={company} />
          ))
        )}
      </ul>
    </div>
  );
}

// OTHER COMPANIES SECTION
export function OtherCompaniesSection() {
  const { user: currentUser } = useAuth();
  
  const { data: companiesList, isLoading } = useQuery({
    queryKey: ["allConnectizeCompanies"],
    queryFn: getAllCompanies,
  });

  // Get companies not owned by user
  const userCompanyIds = currentUser?.companies?.map(c => c.id) || [];
  const otherCompanies = companiesList?.results?.filter(
    (company) => !userCompanyIds.includes(company?.id)
  ) || [];

  return (
    <div className="bg-white rounded-2xl w-full border border-gray-200 overflow-hidden">
      <h2 className="text-base font-semibold px-5 py-4 text-gray-900 border-b border-gray-100">
        Other Companies
      </h2>
      
      <ul className="divide-y divide-gray-100">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="px-5 py-3">
              <CircleTitleSubtitleSkeleton />
            </div>
          ))
        ) : otherCompanies?.length <= 0 ? (
          <li className="px-5 py-4">
            <LightParagraph className="text-sm text-gray-500">
              No other companies
            </LightParagraph>
          </li>
        ) : (
          otherCompanies?.slice(0, 10)?.map((company) => (
            <OtherCompanyItem key={company?.id} company={company} />
          ))
        )}
      </ul>
    </div>
  );
}

// MY COMPANY ITEM - with three dots menu
function MyCompanyItem({ company }) {
  const { company_name, logo, slug, verify } = company;

  return (
    <li className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group">
      <Link to={`/${slug}`} className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar
          src={logo || "/images/default-company-logo.png"}
          name={company_name}
          className="!w-10 !h-10 !rounded-full"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-[15px] text-gray-900 truncate">
              {company_name}
            </p>
            {verify && (
              <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            )}
          </div>
          <p className="text-gray-500 text-[13px] truncate">
            @{slug || company_name?.toLowerCase().replace(/\s+/g, '')}
          </p>
        </div>
      </Link>
      
      <button className="p-1.5 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0">
        <MoreHorizontal className="w-5 h-5 text-gray-600" />
      </button>
    </li>
  );
}

// OTHER COMPANY ITEM - simpler, no menu
function OtherCompanyItem({ company }) {
  const { company_name, logo, tag_line, verify, slug } = company;

  return (
    <li className="px-5 py-3 hover:bg-gray-50 transition-colors">
      <Link to={`/${slug}`} className="flex items-center gap-3">
        <Avatar
          src={logo || "/images/default-company-logo.png"}
          name={company_name}
          className="!w-10 !h-10 !rounded-full"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-[15px] text-gray-900 truncate">
              {company_name}
            </p>
            {verify && (
              <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            )}
          </div>
          <p className="text-gray-500 text-[13px] truncate">
            {tag_line || "Set of Pennsylvania Unde Omnis Sila Natus"}
          </p>
        </div>
      </Link>
    </li>
  );
}

// KEEP ORIGINAL SUGGESTIONS COMPONENT (if needed elsewhere)
export function Suggestions({
  heading = "Suggested",
  hasSeeMore = false,
  className,
}) {
  return (
    <div
      className={clsx("bg-white rounded p-4 space-y-4 w-full h-fit", className)}
    >
      <h2 className="text-xl font-bold">{heading}</h2>
      <SuggestionList hasSeeMore={hasSeeMore} />
    </div>
  );
}

export function SuggestionList({
  hasSeeMore,
  associated = false,
  thisUser,
  companyId,
  viewMoreUrl,
}) {
  const { user: currentUser } = useAuth();

  const queryKey = ["associatedUsers"];

  const { data: paginatedData, isLoading: isRepsLoading } =
    usePaginatedRepresentatives(
      {
        companyId,
      },
      { enabled: associated && !!companyId }
    );

  const repsFirstPage = paginatedData?.pages?.[0]?.data;

  const { data: associatedUsers = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => getAssociatedUsersForUser(),
    enabled: !associated && !!currentUser && !!thisUser?.id,
    keepPreviousData: true,
  });

  useEffect(() => {
    if (thisUser?.id) {
      queryClient.invalidateQueries({ queryKey });
    }
  }, [thisUser?.id, queryClient]);

  return (
    <section>
      <ul className="space-y-2 divide-y divide-gray-100">
        {isLoading || isRepsLoading ? (
          Array.from({ length: 6 }, (_, index) => (
            <CircleTitleSubtitleSkeleton key={index} />
          ))
        ) : (associated ? repsFirstPage?.length : associatedUsers?.length) <=
          0 ? (
          <LightParagraph>
            {associated
              ? "No users associated yet. Connect more to see user associated"
              : "No suggested users yet"}
          </LightParagraph>
        ) : associated ? (
          repsFirstPage.map(({ user }) => {
            return (
              <SuggestionListItem
                key={user.id}
                avatar={user.avatar}
                hashtag={user.email}
                id={user.id}
                rep={true}
                user={user}
                full_name={user.full_name}
              />
            );
          })
        ) : (
          associatedUsers?.map((user) => {
            const {
              first_name,
              last_name,
              avatar,
              email: hashtag,
              id,
              rep,
              domain,
            } = user;

            return (
              <SuggestionListItem
                key={id}
                avatar={avatar}
                hashtag={hashtag}
                user={user}
                id={id}
                rep={rep}
                domain={domain}
                full_name={`${first_name} ${last_name}`}
              />
            );
          })
        )}
      </ul>
      {hasSeeMore && associatedUsers?.length > 1 && (
        <SeeMoreLink url={viewMoreUrl} />
      )}
    </section>
  );
}

function SuggestionListItem({
  id,
  avatar,
  full_name,
  hashtag,
  rep = false,
  domain = false,
  user,
}) {
  return (
    <li className="flex items-center gap-2.5 pt-2" key={id}>
      <Avatar
        src={avatar}
        name={full_name ? full_name : hashtag}
        size="sm"
        className={avatarStyle}
      />
      <div>
        <div className="flex items-center gap-1">
          <Username user={user} />
          {(rep || domain) && (
            <Badge className="!text-[.6rem]">
              {rep ? "Representative" : "Domain"}
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-400 -mt-1">{hashtag}</p>
      </div>
    </li>
  );
}

export const CircleTitleSubtitleSkeleton = () => (
  <li className="flex items-center gap-3">
    <div className="size-10 rounded-full skeleton" />
    <div className="flex-1">
      <div className="h-3 w-24 skeleton rounded mb-1.5" />
      <div className="h-2.5 w-32 skeleton rounded" />
    </div>
  </li>
);