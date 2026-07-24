import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Post Insights | Connectize",
    description: "Review engagement insights for your Connectize post.",
  });

import { Avatar, Spinner } from "@chakra-ui/react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BarChart3,
  ExternalLink,
  Heart,
  Lock,
  MessageCircle,
  RefreshCw,
  Repeat2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getPostInsightActors,
  getPostInsights,
} from "../../api-services/posts";
import LightParagraph from "../../components/ParagraphText";
import RichContentText from "../../components/RichContentText";
import TimeAgo from "../../components/TimeAgo";
import { formatNumber } from "../../lib/utils";
import { webRoutes } from "../../lib/webRoutes";

const periods = [
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
  { key: "all", label: "All" },
];

const tabs = [
  { key: "all", label: "All", icon: BarChart3 },
  { key: "likes", label: "Likes", icon: Heart },
  { key: "comments", label: "Comments", icon: MessageCircle },
  { key: "reposts", label: "Reposts", icon: Repeat2 },
];

const toneByType = {
  likes: "text-rose-600 bg-rose-50 border-rose-100",
  comments: "text-blue-600 bg-blue-50 border-blue-100",
  reposts: "text-green-600 bg-green-50 border-green-100",
  all: "text-primary-800 bg-primary-50 border-primary-200",
};

const countForTab = (totals = {}, tab) => {
  if (tab === "all") return totals.engagements || 0;
  return totals[tab] || 0;
};

const decodeHtmlEntities = (value = "") =>
  String(value).replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
    if (entity[0] === "#") {
      const isHex = entity[1]?.toLowerCase() === "x";
      const codePoint = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      if (Number.isFinite(codePoint)) {
        try {
          return String.fromCodePoint(codePoint);
        } catch {
          return match;
        }
      }
    }

    const named = {
      amp: "&",
      apos: "'",
      gt: ">",
      lt: "<",
      nbsp: " ",
      quot: '"',
    };
    return named[entity] ?? match;
  });

const stripInsightText = (value = "") => {
  const withoutTags = String(value)
    .replace(
      /<span\b(?=[^>]*\bclass=["'][^"']*\bmention-node\b[^"']*["'])([^>]*)>([\s\S]*?)<\/span>/gi,
      (_match, attrs, fallbackText) => {
        const label = attrs.match(/\bdata-mention-label=["']([^"']+)["']/i)?.[1];
        return label || fallbackText;
      }
    )
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<\/(?:p|div|li|h[1-6]|blockquote)\s*>/gi, " ")
    .replace(/<[^>]*>/g, "");

  return decodeHtmlEntities(withoutTags).replace(/\s+/g, " ").trim();
};

function MetricCard({ icon: Icon, label, value, tone = "all" }) {
  return (
    <div className="flex items-center gap-3 bg-white p-4 sm:p-5">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${toneByType[tone]}`}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold leading-none text-gray-950">
          {formatNumber(value || 0)}
        </p>
      </div>
    </div>
  );
}

function actorHref(actor) {
  if (actor?.type === "user" && actor?.id) return `/co/${actor.id}`;
  if (actor?.type === "company" && actor?.handle) return `/${actor.handle}`;
  return null;
}

function ActorRow({ item }) {
  const href = actorHref(item.actor);
  const preview = stripInsightText(item.preview);
  const tone =
    item.type === "like"
      ? toneByType.likes
      : item.type === "comment"
      ? toneByType.comments
      : toneByType.reposts;
  const Icon =
    item.type === "like" ? Heart : item.type === "comment" ? MessageCircle : Repeat2;

  const content = (
    <div className="group flex gap-3 p-4 transition-colors hover:bg-gray-50 sm:px-5">
      <Avatar
        size="md"
        name={item.actor?.name || "Deleted account"}
        src={item.actor?.avatar || undefined}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-gray-950">
              {item.actor?.name || "Deleted account"}
            </p>
            <p className="truncate text-xs text-gray-500">
              {item.actor?.handle ? `@${item.actor.handle}` : item.actor?.type} ·{" "}
              {item.verb} · <TimeAgo time={item.created_at} />
            </p>
          </div>
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${tone}`}
            aria-label={`${item.type} activity`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
        {preview ? (
          <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-700">
            {preview}
          </p>
        ) : null}
      </div>
    </div>
  );

  return href ? <Link to={href}>{content}</Link> : content;
}

function PostInsightsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [period, setPeriod] = useState("30d");
  const [activeTab, setActiveTab] = useState("all");

  const {
    data: insights,
    isLoading: insightsLoading,
    isFetching: insightsFetching,
    refetch: refetchInsights,
  } = useQuery({
    queryKey: ["post-insights", id, period],
    queryFn: () => getPostInsights(id, period),
    enabled: !!id,
    retry: 1,
  });

  const {
    data: actorPages,
    isLoading: actorsLoading,
    isFetching: actorsFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: refetchActors,
  } = useInfiniteQuery({
    queryKey: ["post-insight-actors", id, period, activeTab],
    queryFn: ({ pageParam = 1 }) =>
      getPostInsightActors(id, {
        type: activeTab,
        period,
        page: pageParam,
        pageSize: 20,
      }),
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? lastPage.nextPage : undefined,
    initialPageParam: 1,
    enabled: !!id,
    retry: 1,
  });

  const actors = useMemo(
    () => actorPages?.pages?.flatMap((page) => page.actors) || [],
    [actorPages]
  );
  const totals = insights?.totals || {};
  const isRefreshing = insightsFetching || actorsFetching;
  const postPreview = useMemo(
    () => stripInsightText(insights?.post?.body_preview || ""),
    [insights?.post?.body_preview]
  );
  const postMentionUsers = useMemo(
    () =>
      [insights?.post?.user, insights?.post?.parent_post?.user].filter(Boolean),
    [insights?.post?.parent_post?.user, insights?.post?.user]
  );
  const postMentionCompanies = useMemo(
    () =>
      [insights?.post?.company, insights?.post?.parent_post?.company].filter(
        Boolean
      ),
    [insights?.post?.company, insights?.post?.parent_post?.company]
  );

  if (insightsLoading) {
    return (
      <section className="flex min-h-[50vh] items-center justify-center">
        <Spinner color="#F1C644" size="lg" />
      </section>
    );
  }

  if (!insights) {
    return (
      <section className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 bg-white">
          <Lock className="h-5 w-5 text-gray-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-950">Insights unavailable</h1>
        <LightParagraph>
          Only the creator or an approved company analyst can view this post.
        </LightParagraph>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:border-gray-300"
        >
          Go back
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl py-5">
      <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-soft sm:p-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-primary-800">
            Analytics
          </p>
          <h1 className="text-xl font-bold text-gray-950 sm:text-2xl">Post insights</h1>
          {postPreview ? (
            <div className="line-clamp-2 text-sm leading-5 text-gray-500">
              <RichContentText
                content={insights?.post?.body_preview || ""}
                className="!text-gray-500 [&>div]:!space-y-0 [&_p]:!mb-0"
                mentionUsers={postMentionUsers}
                mentionCompanies={postMentionCompanies}
              />
            </div>
          ) : (
            <p className="line-clamp-2 text-sm leading-5 text-gray-500">
              No text content
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to={webRoutes.singlePost.replace(":id", id)}
            className="hidden h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/40 sm:flex"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            View post
          </Link>
          <button
            type="button"
            onClick={() => {
              refetchInsights();
              refetchActors();
            }}
            disabled={isRefreshing}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:cursor-wait disabled:opacity-60"
            aria-label={isRefreshing ? "Refreshing insights" : "Refresh insights"}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-950">Performance overview</h2>
          <p className="text-sm text-gray-500">Engagement during the selected period</p>
        </div>
        <div
          className="flex w-fit items-center gap-1 rounded-lg bg-gray-100 p-1"
          role="group"
          aria-label="Insights period"
        >
          {periods.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setPeriod(item.key)}
              aria-pressed={period === item.key}
              className={`h-8 min-w-14 rounded-md px-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 ${
                period === item.key
                  ? "bg-primary-500 text-gray-950 shadow-sm"
                  : "text-gray-500 hover:bg-white hover:text-gray-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 lg:grid-cols-4">
        <MetricCard
          icon={BarChart3}
          label="Engagements"
          value={totals.engagements}
          tone="all"
        />
        <MetricCard icon={Heart} label="Likes" value={totals.likes} tone="likes" />
        <MetricCard
          icon={MessageCircle}
          label="Comments"
          value={totals.comments}
          tone="comments"
        />
        <MetricCard
          icon={Repeat2}
          label="Reposts"
          value={totals.reposts}
          tone="reposts"
        />
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
        <Users className="h-4 w-4 text-gray-600" aria-hidden="true" />
        <span className="font-semibold text-gray-800">
          {formatNumber(totals.unique_actors || 0)} engaged accounts
        </span>
        <span className="hidden sm:inline">in this period</span>
      </div>

      <div className="mt-7 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-4 sm:px-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-950">Engagement activity</h2>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                {formatNumber(countForTab(totals, activeTab))}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">See who interacted with this post</p>
          </div>
          <Link
            to={webRoutes.singlePost.replace(":id", id)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/40 sm:hidden"
            aria-label="View post"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div
          className="flex gap-1 overflow-x-auto border-b border-gray-200 bg-gray-50 p-2 sm:px-4"
          role="tablist"
          aria-label="Engagement type"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.key)}
                className={`flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 ${
                  selected
                    ? "bg-white text-gray-950 shadow-sm ring-1 ring-inset ring-gray-200"
                    : "text-gray-500 hover:bg-white/70 hover:text-gray-800"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {tab.label}
                <span className={selected ? "text-primary-800" : "text-gray-400"}>
                  {formatNumber(countForTab(totals, tab.key))}
                </span>
              </button>
            );
          })}
        </div>

        <div className="divide-y divide-gray-100">
          {actorsLoading ? (
            <div className="space-y-1 p-3" aria-label="Loading engagement activity">
              {[0, 1, 2].map((item) => (
                <div key={item} className="flex animate-pulse items-center gap-3 px-1 py-3">
                  <div className="h-12 w-12 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-40 rounded bg-gray-200" />
                    <div className="h-3 w-64 max-w-full rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : actors.length ? (
            actors.map((actor) => <ActorRow key={actor.id} item={actor} />)
          ) : (
            <div className="px-4 py-12 text-center">
              <BarChart3 className="mx-auto h-8 w-8 text-gray-400" aria-hidden="true" />
              <h3 className="mt-3 text-base font-bold text-gray-950">No activity yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                New likes, comments, and reposts will appear here.
              </p>
            </div>
          )}
        </div>

        {hasNextPage ? (
          <div className="flex justify-center border-t border-gray-100 p-4">
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:cursor-wait disabled:opacity-60"
            >
              {isFetchingNextPage ? "Loading..." : "Load more activity"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default PostInsightsPage;
