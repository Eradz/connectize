import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Company activity | Connectize",
    description: "Reach, audience, content, hiring, tenders, marketplace and reputation for your company.",
    keywords: "company analytics, activity, stats, insights, Connectize",
  });

import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import { getCompanyStats } from "../../api-services/engagement";
import { usePollCurrentCompany } from "../../hooks/usePolling";
import HeadingText from "../../components/HeadingText";
import PageLoading from "../../components/PageLoading";

const SECTION_LABELS = {
  reach: "Reach",
  audience: "Audience",
  content: "Content",
  hiring: "Hiring",
  tenders: "Tenders",
  marketplace: "Marketplace",
  reputation: "Reputation",
};

const SECTION_HELP = {
  reach: "Who saw your company page, listings, jobs and tenders.",
  audience: "Who follows your company.",
  content: "What your company published, and how it landed.",
  hiring: "Applications and hires on your job postings.",
  tenders: "As the buyer publishing tenders, and as the supplier bidding on others'.",
  marketplace: "Sales through your marketplace listings.",
  reputation: "How this company is rated across the platform.",
};

/**
 * A quiet trend line under a number - only ever rendered when the backend
 * says there is enough daily history to mean something (`series_sufficient`).
 * Mirrors components/myStats/MyStats.jsx's MiniTrend.
 */
function MiniTrend({ series }) {
  return (
    <div className="mt-2 h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="companyStatTrend" x1="0" y1="0" x2="0" y2="1">
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
            fill="url(#companyStatTrend)"
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
        <p className="mt-1 text-2xl font-bold capitalize text-dark">
          {typeof metric.value === "number" ? metric.value.toLocaleString() : metric.value}
          {metric.unit === "percent" && "%"}
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

function TopPostCard({ post }) {
  if (!post) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        Best-performing post
      </p>
      <p className="mt-1 text-sm text-dark line-clamp-3">{post.body}</p>
      <p className="mt-2 text-xs text-gray-500">
        {post.likes.toLocaleString()} likes · {post.comments.toLocaleString()} comments
      </p>
    </div>
  );
}

function TopListingCard({ listing }) {
  if (!listing) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        Most-viewed listing
      </p>
      <p className="mt-1 text-sm font-semibold text-dark">{listing.title}</p>
      <p className="mt-2 text-xs text-gray-500">
        {listing.views.toLocaleString()} views{listing.price ? ` · ${listing.price}` : ""}
      </p>
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center">
      <TriangleAlert className="size-10 text-gray-300" />
      <p className="font-semibold text-dark">Couldn&rsquo;t load company activity</p>
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

function ForbiddenState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center">
      <ShieldAlert className="size-10 text-gray-300" />
      <p className="font-semibold text-dark">You don&rsquo;t have access to this</p>
      <p className="max-w-sm text-sm text-gray-600">
        Company activity is only visible to the owner or a representative with
        analytics permission.
      </p>
    </div>
  );
}

export default function CompanyActivity() {
  const { company: companyName } = useParams();
  const [days, setDays] = useState(30);

  const { data: company, isLoading: companyLoading } = usePollCurrentCompany(companyName);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["company-stats", company?.id, days],
    queryFn: () => getCompanyStats(company.id, { days, includeSeries: true }),
    enabled: !!company?.id,
  });

  if (companyLoading || (isLoading && company?.id)) return <PageLoading />;

  const isForbidden = error?.response?.status === 403;

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4">
        <HeadingText>
          {company?.company_name ? `${company.company_name} activity` : "Company activity"}
        </HeadingText>
        {!isForbidden && (
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
        )}
      </div>

      {isForbidden ? (
        <div className="px-4">
          <ForbiddenState />
        </div>
      ) : isError ? (
        <div className="px-4">
          <ErrorState onRetry={refetch} />
        </div>
      ) : (
        <>
          {(data?.highlights?.top_post || data?.highlights?.top_listing) && (
            <div className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-2">
              <TopPostCard post={data?.highlights?.top_post} />
              <TopListingCard listing={data?.highlights?.top_listing} />
            </div>
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
        </>
      )}
    </section>
  );
}
