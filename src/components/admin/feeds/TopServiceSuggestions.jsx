import { Avatar, Badge } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
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
    <section className="max-md:container !p-0 lg:p-4 h-fit w-full xl:w-[40%] flex items-start flex-col sm:flex-col lg:flex-row xl:flex-col shrink-0 gap-4 lg:sticky lg:top-0 lg:right-0">
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
  viewMoreUrl,
}) {
  const { user: currentUser } = useAuth();

  // For "People Associated" (associated=true): fetch connections for the target user
  // For "Suggested" (associated=false): fetch smart suggestions for current user
  const userId = associated ? thisUser?.id : currentUser?.id;
  const queryKey = associated
    ? ["userConnections", userId]
    : ["userSuggestions", currentUser?.id];

  const { data: users = [], isLoading } = useQuery({
    queryKey,
    queryFn: associated
      ? () => getAssociatedUsersForUser(userId)
      : () => getSuggestedUsersForCurrentUser(),
    enabled: !!currentUser && (associated ? !!userId : true),
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
            {associated
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
              email: hashtag,
              id,
              connection_type,
              is_mutual,
              suggestion_reasons,
            } = user;

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
  associated = false,
}) {
  // Pick the most relevant badge to show
  const badge = associated
    ? (isMutual ? "Mutual" : connectionType === "following" ? "Following" : connectionType === "follower" ? "Follower" : null)
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
              colorScheme={isMutual || suggestionReasons?.[0] === 'mutual_connection' ? "green" : suggestionReasons?.[0] === 'follows_you' ? "blue" : "gray"}
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
