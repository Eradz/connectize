import { Avatar, Badge } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect } from "react";
import { getServices } from "../../../api-services/services";
import {
  getPeopleAssociatedForUser,
  getSuggestedUsersForCurrentUser,
} from "../../../api-services/users";
import { useAuth } from "../../../context/userContext";
import { queryClient } from "../../../lib/utils";
import HeadingText from "../../HeadingText";
import LightParagraph from "../../ParagraphText";
import { avatarStyle } from "../../ResponsiveNav";
import SeeMoreLink from "../../SeeMoreLink";
import Username from "../../Username";
import { PostCard, PostCardSkeleton } from "./DiscoverPostTabs";
import {
  useGetServicesFirstPage,
  usePageinatedServices,
} from "../../../hooks/useServices";

const TopServiceSuggestions = () => {
  return (
    <section className="max-md:container !p-0 lg:p-4 h-fit w-full xl:w-[45%] flex items-start flex-col sm:flex-col lg:flex-row xl:flex-col shrink-0 gap-4 lg:sticky lg:top-0 lg:right-4">
      <TopServices />

      <Suggestions />
    </section>
  );
};

export default TopServiceSuggestions;

export function TopServices() {
  const { data: services, isLoading } = useGetServicesFirstPage();
  const service = services?.[0];

  return (
    <section className="w-full">
      {isLoading ? (
        <>
          <div className="p-3 sm:p-4 lg:!px-2">
            <div className="w-1/3 h-7 rounded-md skeleton" />
          </div>
          <PostCardSkeleton />
        </>
      ) : service ? (
        <>
          <div className="px-3 sm:px-4 py-2 lg:!px-2">
            <HeadingText weight="semibold">Recent Service</HeadingText>
          </div>

          <PostCard
            whole={service}
            companyName={service?.company.company_name}
            logo={service?.company?.logo}
            summary={service?.description}
            url={"/services/" + service?.id}
            // slug={`services/${service?.company?.id}`}
            title={service?.title}
            verified={service?.featured}
          />
        </>
      ) : (
        <div className={clsx("bg-white rounded p-4 space-y-4 w-full h-fit")}>
          <h2 className="text-xl font-bold">Recent Services</h2>
          <LightParagraph>No recent services yet</LightParagraph>
        </div>
      )}
    </section>
  );
}

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

  const queryKey = [
    associated ? "associatedUsers" : "suggestedUsers",
    thisUser?.id,
  ];

  const { data: shownUsers = [], isLoading } = useQuery({
    queryKey,
    queryFn: associated
      ? () => getPeopleAssociatedForUser(thisUser, companyId)
      : () => getSuggestedUsersForCurrentUser(),
    enabled: !!currentUser && !!thisUser?.id,
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
        {isLoading ? (
          Array.from({ length: 6 }, (_, index) => (
            <CircleTitleSubtitleSkeleton key={index} />
          ))
        ) : shownUsers?.length <= 0 ? (
          <LightParagraph>
            {associated
              ? "No users associated yet. Connect more to see user associated"
              : "No suggested users yet"}
          </LightParagraph>
        ) : (
          shownUsers?.map((user) => {
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
              <li className="flex items-center gap-2.5 pt-2" key={id}>
                <Avatar
                  src={avatar}
                  name={first_name ? `${first_name} ${last_name}` : hashtag}
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
          })
        )}
      </ul>
      {hasSeeMore && shownUsers?.length > 1 && (
        <SeeMoreLink url={viewMoreUrl} />
      )}
    </section>
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
