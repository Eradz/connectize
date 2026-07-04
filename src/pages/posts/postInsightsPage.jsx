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
import TimeAgo from "../../components/TimeAgo";
import { formatNumber } from "../../lib/utils";

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
  all: "text-gray-900 bg-gray-50 border-gray-100",
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
    <div className="flex min-h-[92px] items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${toneByType[tone]}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none text-gray-950">
          {formatNumber(value || 0)}
        </p>
        <p className="mt-2 whitespace-nowrap text-sm font-semibold text-gray-500">
          {label}
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
    <div className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3 transition hover:border-gray-300">
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
          >
            <Icon className="h-3.5 w-3.5" />
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
  const postPreview = useMemo(
    () => stripInsightText(insights?.post?.body_preview || ""),
    [insights?.post?.body_preview]
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
    <section className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-800 hover:border-gray-300"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-gray-950">Post insights</h1>
          <p className="line-clamp-2 text-sm leading-5 text-gray-500">
            {postPreview || "No text content"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            refetchInsights();
            refetchActors();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-800 hover:border-gray-300"
          aria-label="Refresh insights"
        >
          <RefreshCw
            className={`h-4 w-4 ${insightsFetching ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {periods.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setPeriod(item.key)}
            className={`h-9 min-w-16 rounded-lg border px-4 text-sm font-bold ${
              period === item.key
                ? "border-[#F1C644] bg-[#F1C644] text-gray-950"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600">
        <Users className="h-4 w-4" />
        {formatNumber(totals.unique_actors || 0)} engaged accounts
      </div>

      <div className="sticky top-0 z-10 mt-5 flex gap-2 overflow-x-auto border-b border-gray-200 bg-gray-50/95 py-2 backdrop-blur">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-bold ${
                selected
                  ? "border-[#F1C644] bg-[#FFFAB7] text-gray-950"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label} {formatNumber(countForTab(totals, tab.key))}
            </button>
          );
        })}
      </div>

      <div className="mt-3 space-y-2">
        {actorsLoading ? (
          <div className="flex justify-center py-10">
            <Spinner color="#F1C644" />
          </div>
        ) : actors.length ? (
          actors.map((actor) => <ActorRow key={actor.id} item={actor} />)
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-12 text-center">
            <BarChart3 className="mx-auto h-8 w-8 text-gray-400" />
            <h2 className="mt-3 text-base font-bold text-gray-950">No activity yet</h2>
            <p className="mt-1 text-sm text-gray-500">
              New likes, comments, and reposts will appear here.
            </p>
          </div>
        )}
      </div>

      {hasNextPage ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-800 hover:border-gray-300 disabled:opacity-60"
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default PostInsightsPage;
