import { createSEO } from "../SEO";

export const meta = () =>
  createSEO({
    title: "Who viewed you | Connectize",
    description:
      "See which companies and professionals have viewed your Connectize profile.",
    keywords: "profile views, who viewed me, Connectize",
  });

import { useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { Eye, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getProfileViews,
  markProfileViewsSeen,
} from "../../api-services/engagement";
import { timeAgo } from "../../lib/utils";
import HeadingText from "../HeadingText";
import PageLoading from "../PageLoading";

const PAGE_SIZE = 20;

/** Avatar, or initials when there is no image - never a broken image icon. */
function ViewerAvatar({ viewer }) {
  if (viewer?.avatar_url) {
    return (
      <img
        src={viewer.avatar_url}
        alt=""
        className="size-11 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-dark">
      {viewer?.initials || "?"}
    </div>
  );
}

function ViewerRow({ row }) {
  const { viewer } = row;
  return (
    <Link
      to={viewer?.profile_path || "#"}
      className={clsx(
        "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50",
        { "bg-gold/5": row.is_new }
      )}
    >
      <ViewerAvatar viewer={viewer} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-dark">{viewer?.name}</p>
          {row.is_new && (
            <span className="shrink-0 rounded-full bg-gold px-2 py-0.5 text-[.6rem] font-bold uppercase text-dark">
              New
            </span>
          )}
        </div>

        {viewer?.subtitle && (
          <p className="truncate text-sm text-gray-600">{viewer.subtitle}</p>
        )}

        <p className="mt-0.5 text-xs text-gray-500">
          viewed {row.viewed?.join(" and ") || "your profile"}
          {row.view_count > 1 && ` · ${row.view_count} times`}
          {" · "}
          {timeAgo(row.last_viewed_at)}
        </p>
      </div>
    </Link>
  );
}

/**
 * Empty state carries the one action that changes it. Most people will land
 * here with nothing to show, so "no views yet" on its own would be a dead end.
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <Eye className="size-10 text-gray-300" />
      <p className="font-semibold text-dark">No one has viewed you yet</p>
      <p className="max-w-sm text-sm text-gray-600">
        Profiles with a photo and a job title get viewed far more often. Adding
        yours is the quickest way to get found.
      </p>
      <Link
        to="/update-profile"
        className="mt-1 rounded-full bg-gold px-5 py-2 text-sm font-semibold text-dark hover:bg-opacity-70"
      >
        Complete my profile
      </Link>
    </div>
  );
}

export default function ProfileViewsList() {
  const queryClient = useQueryClient();
  const [days, setDays] = useState(30);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["profile-views", days],
    queryFn: () => getProfileViews({ limit: PAGE_SIZE, offset: 0, days }),
  });

  const [extraPages, setExtraPages] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);

  // Opening the screen is what clears the badge. Done once on mount, and the
  // summary query is invalidated so the nav count updates without a reload.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await markProfileViewsSeen();
      if (!cancelled) {
        queryClient.invalidateQueries({ queryKey: ["profile-views-summary"] });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [queryClient]);

  // Reset accumulated pages when the window changes.
  useEffect(() => {
    setExtraPages([]);
  }, [days]);

  const firstPage = data?.results || [];
  const rows = [...firstPage, ...extraPages.flat()];
  const hasMore =
    extraPages.length > 0
      ? extraPages[extraPages.length - 1].length === PAGE_SIZE
      : Boolean(data?.has_more);

  const loadMore = async () => {
    setLoadingMore(true);
    const next = await getProfileViews({
      limit: PAGE_SIZE,
      offset: rows.length,
      days,
    });
    setExtraPages((pages) => [...pages, next?.results || []]);
    setLoadingMore(false);
  };

  if (isLoading) return <PageLoading />;

  const total = data?.total ?? rows.length;

  return (
    <section className="mx-auto w-full max-w-2xl pb-10">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4">
        <HeadingText>Who viewed you</HeadingText>

        <select
          value={days}
          onChange={(event) => setDays(Number(event.target.value))}
          className="rounded-full border border-gray-200 px-3 py-1.5 text-sm"
          aria-label="Time window"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {total > 0 && (
        <p className="px-4 pb-3 pt-1 text-sm text-gray-600">
          <UserRound className="mr-1 inline size-4 align-[-2px]" />
          {total} {total === 1 ? "person" : "people"}
          {data?.unseen_count > 0 && ` · ${data.unseen_count} new`}
        </p>
      )}

      <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white">
        {rows.length === 0 ? (
          <EmptyState />
        ) : (
          rows.map((row) => <ViewerRow key={row.viewer?.id} row={row} />)
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore || isFetching}
            className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-dark hover:bg-gray-50 disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </section>
  );
}
