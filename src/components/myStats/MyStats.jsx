import { createSEO } from "../SEO";

export const meta = () =>
  createSEO({
    title: "Your activity | Connectize",
    description: "Reach, audience, content and activity stats for your Connectize account.",
    keywords: "activity, stats, insights, Connectize",
  });

import { useQuery } from "@tanstack/react-query";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import { getMyStats } from "../../api-services/engagement";
import HeadingText from "../HeadingText";
import PageLoading from "../PageLoading";

const SECTION_LABELS = {
  reach: "Reach",
  audience: "Audience",
  content: "Content",
  activity: "Activity",
};

const SECTION_HELP = {
  reach: "Who saw you.",
  audience: "Who follows you.",
  content: "What you published, and how it landed.",
  activity: "What you did on Connectize.",
};

/**
 * A quiet trend line under a number - only ever rendered when the backend
 * says there is enough daily history to mean something (`series_sufficient`).
 * A one- or two-point line pretending to be a trend is worse than no chart,
 * so there is deliberately no "not enough data yet" placeholder chart here:
 * absence of the chart *is* the message.
 */
function MiniTrend({ series }) {
  return (
    <div className="mt-2 h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="statTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F1C644" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#F1C644" stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[0, "auto"]} />
          <Tooltip
            formatter={(value) => [value, "value"]}
            labelFormatter={(label) => label}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#F1C644"
            strokeWidth={2}
            fill="url(#statTrend)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatTile({ metric }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <p className="text-sm text-gray-600">{metric.label}</p>

      {metric.sufficient ? (
        <p className="mt-1 text-2xl font-bold text-dark">
          {typeof metric.value === "number" ? metric.value.toLocaleString() : metric.value}
        </p>
      ) : (
        <>
          <p className="mt-1 text-2xl font-bold text-gray-300">—</p>
          <p className="mt-1 text-xs text-gray-500">{metric.note}</p>
        </>
      )}

      {metric.help_text && metric.sufficient && (
        <p className="mt-0.5 text-xs text-gray-400">{metric.help_text}</p>
      )}

      {metric.series_sufficient && metric.series?.length > 1 && (
        <MiniTrend series={metric.series} />
      )}
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center">
      <TriangleAlert className="size-10 text-gray-300" />
      <p className="font-semibold text-dark">Couldn&rsquo;t load your activity</p>
      <p className="max-w-sm text-sm text-gray-600">
        This is a connection problem, not a lack of activity.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 rounded-full bg-gold px-5 py-2 text-sm font-semibold text-dark hover:bg-opacity-70"
      >
        Try again
      </button>
    </div>
  );
}

export default function MyStats() {
  const [days, setDays] = useState(30);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-stats", days],
    // Charts only exist on this page, so pulling the daily series here is
    // fine; the badge and other callers of getMyStats never ask for it.
    queryFn: () => getMyStats({ days, includeSeries: true }),
  });

  if (isLoading) return <PageLoading />;

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4">
        <HeadingText>Your activity</HeadingText>
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

      {isError ? (
        <div className="px-4">
          <ErrorState onRetry={refetch} />
        </div>
      ) : (
        <>
          {data?.observed_days < 3 && (
            <p className="mx-4 rounded-xl bg-gold/10 px-4 py-3 text-sm text-dark">
              We only started counting your activity {data.observed_days <= 0 ? "today" : `${data.observed_days} day${data.observed_days === 1 ? "" : "s"} ago`}.
              Most numbers below will fill in over the next couple of weeks.
            </p>
          )}

          {data?.sections?.map((section) => (
            <div key={section.section} className="px-4">
              <div className="mb-2">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                  {SECTION_LABELS[section.section] || section.section}
                </h3>
                <p className="text-xs text-gray-400">
                  {SECTION_HELP[section.section]}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {section.metrics.map((metric) => (
                  <StatTile key={metric.key} metric={metric} />
                ))}
              </div>
            </div>
          ))}

          {data?.next_milestone && (
            <p className="mx-4 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-600">
              Next step toward getting the most out of Connectize:{" "}
              <span className="font-semibold text-dark">
                {data.next_milestone.replaceAll("_", " ")}
              </span>
            </p>
          )}
        </>
      )}
    </section>
  );
}
