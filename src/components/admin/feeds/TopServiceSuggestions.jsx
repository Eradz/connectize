import { Avatar, Badge } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { getAssociatedPeopleForCompany } from "../../../api-services/companies";
import {
  getAssociatedUsersForUser,
  getSuggestedUsersForCurrentUser,
} from "../../../api-services/users";
import { useAuth } from "../../../context/userContext";
import LightParagraph from "../../ParagraphText";
import { avatarStyle } from "../../ResponsiveNav";
import SeeMoreLink from "../../SeeMoreLink";
import Username from "../../Username";
import BusinessHubActivities from "./BusinessHubActivities";

const TopServiceSuggestions = () => {
  return (
    <section className="max-md:container !p-0 lg:p-4 h-fit w-full xl:w-[40%] flex items-start flex-col sm:flex-col lg:flex-row xl:flex-col shrink-0 gap-4">
      <BusinessHubActivities />

      <Suggestions />
    </section>
  );
};

export default TopServiceSuggestions;

export function Suggestions({
  heading = "Suggested",
  hasSeeMore = false,
  className,
}) {
  return (
    <div
      className={clsx("bg-white rounded p-4 space-y-4 w-full h-fit", className)}
    >
      <h2 className="text-sm font-semibold">{heading}</h2>
      <SuggestionList hasSeeMore={hasSeeMore} />
    </div>
  );
}

export function SuggestionList({
  hasSeeMore,
  associated = false,
  thisUser,
  companyId,
  companySlug,
  viewMoreUrl,
}) {
  const { user: currentUser } = useAuth();

  // Three modes:
  // - Company "People Associated" (associated=true + companySlug/companyId):
  //   active representatives + the company's user followers
  // - User "People Associated" (associated=true): the user's personal connections
  // - "Suggested" (associated=false): smart suggestions for the current user
  const isCompany = associated && !!(companySlug || companyId);
  const userId = associated ? thisUser?.id : currentUser?.id;

  const queryKey = isCompany
    ? ["companyAssociatedPeople", companySlug ?? companyId]
    : associated
    ? ["userConnections", userId]
    : ["userSuggestions", currentUser?.id];

  const { data: users = [], isLoading } = useQuery({
    queryKey,
    queryFn: isCompany
      ? () => getAssociatedPeopleForCompany({ slug: companySlug, companyId })
      : associated
      ? () => getAssociatedUsersForUser(userId)
      : () => getSuggestedUsersForCurrentUser(),
    enabled: !!currentUser && (associated ? isCompany || !!userId : true),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return (
    <section>
      <ul className="space-y-2 divide-y divide-gray-100">
        {isLoading ? (
          Array.from({ length: 6 }, (_, index) => (
            <CircleTitleSubtitleSkeleton key={index} />
          ))
        ) : users?.length <= 0 ? (
          <LightParagraph>
            {isCompany
              ? "No people associated yet"
              : associated
              ? "No connections yet"
              : "No suggestions available"}
          </LightParagraph>
        ) : (
          users?.map((user) => {
            const {
              first_name,
              last_name,
              full_name,
              avatar,
              username,
              email,
              id,
              connection_type,
              is_mutual,
              suggestion_reasons,
              role,
            } = user;

            // email is null for privacy now; prefer the @handle
            const hashtag = username ? `@${username}` : email;

            return (
              <SuggestionListItem
                key={id}
                avatar={avatar}
                hashtag={hashtag}
                user={user}
                id={id}
                full_name={full_name || `${first_name || ''} ${last_name || ''}`.trim()}
                connectionType={connection_type}
                isMutual={is_mutual}
                suggestionReasons={suggestion_reasons}
                role={role}
                associated={associated}
              />
            );
          })
        )}
      </ul>
      {hasSeeMore && users?.length > 1 && (
        <SeeMoreLink url={viewMoreUrl} />
      )}
    </section>
  );
}

const REASON_LABELS = {
  mutual_connection: "Mutual",
  follows_you: "Follows you",
  same_location: "Near you",
};

function SuggestionListItem({
  id,
  avatar,
  full_name,
  hashtag,
  user,
  connectionType,
  isMutual,
  suggestionReasons,
  role,
  associated = false,
}) {
  // Pick the most relevant badge to show; representatives show their role
  const roleLabel = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : null;
  const badge = associated
    ? (roleLabel || (isMutual ? "Mutual" : connectionType === "following" ? "Following" : connectionType === "follower" ? "Follower" : null))
    : (suggestionReasons?.length > 0 ? REASON_LABELS[suggestionReasons[0]] : null);

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
          {badge && (
            <Badge
              colorScheme={roleLabel ? "purple" : isMutual || suggestionReasons?.[0] === 'mutual_connection' ? "green" : suggestionReasons?.[0] === 'follows_you' ? "blue" : "gray"}
              className="!text-[.6rem]"
            >
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-400 -mt-1">{hashtag}</p>
      </div>
    </li>
  );
}

export const CircleTitleSubtitleSkeleton = () => (
  <li className="flex items-center gap-3 pt-3 mb-3">
    <div className="size-8 rounded-full skeleton" />
    <div className="flex-1">
      <div className="flex items-center gap-x-0.5">
        <div className="h-2 w-24 skeleton rounded" />
        <div className="size-3 skeleton rounded-full" />
      </div>
      <div className="h-2 w-36 skeleton rounded mt-1" />
    </div>
  </li>
);
