import { Avatar, Badge } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect } from "react";
import {
  getAssociatedUsersForUser,
  getPeopleAssociatedForUser,
  getSuggestedUsersForCurrentUser,
} from "../../../api-services/users";
import { useAuth } from "../../../context/userContext";
import { queryClient } from "../../../lib/utils";
import LightParagraph from "../../ParagraphText";
import { avatarStyle } from "../../ResponsiveNav";
import SeeMoreLink from "../../SeeMoreLink";
import Username from "../../Username";
import { usePaginatedRepresentatives } from "../../../hooks/useRepresentatives";
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

  const queryKey = ["associatedUsers"];

  // const queryKey = [
  //   associated ? "associatedUsers" : "suggestedUsers",
  //   thisUser?.id,
  // ];

  const { data: paginatedData, isLoading: isRepsLoading } =
    usePaginatedRepresentatives(
      {
        companyId,
        // userId: userIdParam,
      },
      { enabled: associated && !!companyId }
    );

  const repsFirstPage = paginatedData?.pages?.[0]?.data;

  const { data: associatedUsers = [], isLoading } = useQuery({
    queryKey,

    // queryFn: () => getSuggestedUsersForCurrentUser(),
    enabled: !associated && !!currentUser && (!!thisUser?.id || !!currentUser.id),
    // enabled:
    queryFn: associated
      ? () => getPeopleAssociatedForUser(thisUser, companyId)
      : () => getSuggestedUsersForCurrentUser(),
    // enabled: !!currentUser && !!thisUser?.id,
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
