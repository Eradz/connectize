import { useQuery } from "@tanstack/react-query";
import { isValidElement } from "react";
import clsx from "clsx";
import {
  Briefcase,
  Calendar,
  BookOpen,
  ShoppingBag,
  Truck,
  ArrowRight,
  TrendingUp,
  Handshake,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  dealRoomService,
  workforceJobService,
  workforceEventService,
} from "../../../api-services/oilgas";
import { knowledgeHubAPI } from "../../../api-services/knowledgeHub";
import { listingService } from "../../../api-services/marketplace";
import logistics from "../../../api-services/logistics";
import { webRoutes } from "../../../lib/webRoutes";
import LightParagraph from "../../ParagraphText";
// DealIcon replaced with Lucide Handshake for consistent icon sizing

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatCompactNumber = (num) => {
  if (!num) return "0";
  const n = parseFloat(num);
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
};

const timeAgo = (date) => {
  if (!date) return "";
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-emerald-50 text-emerald-700";
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "completed":
      return "bg-blue-50 text-blue-700";
    case "draft":
      return "bg-gray-100 text-gray-600";
    case "cancelled":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const isDateOnlyValue = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));

const parseEventDate = (value, { endOfDay = false } = {}) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay && isDateOnlyValue(value)) {
    date.setHours(23, 59, 59, 999);
  }
  return date;
};

const getEventLifecycle = (event) => {
  if (!event) return { status: "unknown", label: "Unknown" };
  if (event.is_cancelled) return { status: "cancelled", label: "Cancelled" };

  const now = new Date();
  const start = parseEventDate(event.start_date);
  const end = event.end_date
    ? parseEventDate(event.end_date, { endOfDay: true })
    : parseEventDate(event.start_date, { endOfDay: true });

  if (end && end < now) {
    return { status: "completed", label: "Past" };
  }

  if (start) {
    if (start > now) return { status: "upcoming", label: "Upcoming" };
    return { status: "ongoing", label: "Ongoing" };
  }

  const rawStatus = String(event.event_status || event.status || "").toLowerCase();
  if (rawStatus === "past") return { status: "completed", label: "Past" };
  if (rawStatus === "open") return { status: "ongoing", label: "Ongoing" };
  if (rawStatus) {
    return {
      status: rawStatus,
      label: rawStatus.replace(/_/g, " "),
    };
  }

  return { status: "unknown", label: "Unknown" };
};

const getEventStatusColor = (status) => {
  switch (status) {
    case "upcoming":
      return "bg-amber-50 text-amber-700";
    case "ongoing":
      return "bg-emerald-50 text-emerald-700";
    case "completed":
      return "bg-gray-100 text-gray-600";
    case "cancelled":
      return "bg-red-50 text-red-700";
    default:
      return getStatusColor(status);
  }
};

const getVisibleSidebarEvents = (events = []) =>
  events
    .filter((event) => {
      const { status } = getEventLifecycle(event);
      return status === "upcoming" || status === "ongoing";
    })
    .slice(0, 4);

const getResults = (response) =>
  Array.isArray(response) ? response : response?.results || [];

// ─── Data Hook ──────────────────────────────────────────────────────────────
function useBusinessHubData() {
  return useQuery({
    queryKey: ["businessHubActivities"],
    queryFn: async () => {
      const [dealRooms, jobs, events, articles, listings, logisticsData] =
        await Promise.allSettled([
          dealRoomService.getAll(1, 4),
          workforceJobService.getAll(1, 4),
          workforceEventService.getUpcomingEvents({ page_size: 4 }),
          knowledgeHubAPI
            .getArticles({ page_size: 4 })
            .then((r) => r?.data ?? r),
          listingService.getListings({ page_size: 4 }),
          logistics.getShipmentRequests({ page_size: 4 }),
        ]);

      return {
        dealRooms:
          dealRooms.status === "fulfilled" ? getResults(dealRooms.value) : [],
        jobs: jobs.status === "fulfilled" ? getResults(jobs.value) : [],
        events: events.status === "fulfilled" ? getResults(events.value) : [],
        articles:
          articles.status === "fulfilled" ? getResults(articles.value) : [],
        listings:
          listings.status === "fulfilled" ? getResults(listings.value) : [],
        logistics:
          logisticsData.status === "fulfilled"
            ? getResults(logisticsData.value)
            : [],
      };
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ─── Section Components ─────────────────────────────────────────────────────

function ActivitySection({ icon: Icon, iconBg, iconColor, title, viewMoreUrl, children, isEmpty }) {
  // Hide the whole card when there's no content to show.
  if (isEmpty) return null;

  return (
    <div className="bg-white rounded-xl p-3 space-y-1">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className={clsx("w-6 h-6 rounded-md flex items-center justify-center", iconBg || "bg-gray-100")}>
            {isValidElement(Icon) ? (
              Icon
            ) : (
              <Icon className={clsx("w-3.5 h-3.5", iconColor || "text-gray-600")} />
            )}
          </div>
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            {title}
          </h3>
        </div>
      </div>

      <div className="space-y-0.5">{children}</div>

      <Link
        to={viewMoreUrl}
        className="flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-gray-800 transition-colors pt-1 pb-1"
      >
        View more <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

function ActivityItem({ to, children, className }) {
  return (
    <Link
      to={to}
      className={clsx(
        "block px-2.5 py-2 rounded-lg hover:bg-gray-50 transition-colors group",
        className
      )}
    >
      {children}
    </Link>
  );
}

// ─── Deal Rooms Section ─────────────────────────────────────────────────────
function DealRoomsSection({ deals = [] }) {
  return (
    <ActivitySection
      icon={Handshake}
      iconBg="bg-amber-50"
      iconColor="text-amber-600"
      title="Deal Rooms"
      viewMoreUrl={webRoutes.dealRooms}
      isEmpty={deals.length === 0}
    >
      {deals.slice(0, 4).map((deal) => (
        <ActivityItem
          key={deal.id}
          to={webRoutes.dealRoomDetail.replace(":id", deal.id)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 truncate group-hover:text-black">
                {deal.title}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {deal.company_name ||
                  deal.company?.name ||
                  deal.initiator_name ||
                  "Personal"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs font-semibold text-gray-700">
                {formatCompactNumber(deal.estimated_value)}
              </span>
              <span
                className={clsx(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize",
                  getStatusColor(deal.status)
                )}
              >
                {deal.status}
              </span>
            </div>
          </div>
        </ActivityItem>
      ))}
    </ActivitySection>
  );
}

// ─── Jobs Section ───────────────────────────────────────────────────────────
function JobsSection({ jobs = [] }) {
  return (
    <ActivitySection
      icon={Briefcase}
      iconBg="bg-blue-50"
      iconColor="text-blue-600"
      title="Jobs"
      viewMoreUrl={webRoutes.workforceJobs}
      isEmpty={jobs.length === 0}
    >
      {jobs.slice(0, 4).map((job) => (
        <ActivityItem
          key={job.id}
          to={webRoutes.workforceJobDetail.replace(":id", job.id)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 truncate group-hover:text-black">
                {job.title}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {job.company_name || job.company?.company_name || ""}
                {job.location ? ` · ${job.location}` : ""}
              </p>
            </div>
            <span className="text-[10px] text-gray-400 shrink-0">
              {timeAgo(job.created_at)}
            </span>
          </div>
        </ActivityItem>
      ))}
    </ActivitySection>
  );
}

// ─── Events Section ──────────────────────────────────────────────────────────
function EventsSection({ events = [] }) {
  const visibleEvents = getVisibleSidebarEvents(events);

  return (
    <ActivitySection
      icon={Calendar}
      iconBg="bg-orange-50"
      iconColor="text-orange-600"
      title="Events"
      viewMoreUrl={webRoutes.workforceEvents}
      isEmpty={visibleEvents.length === 0}
    >
      {visibleEvents.map((event) => {
        const eventLifecycle = getEventLifecycle(event);

        return (
          <ActivityItem
            key={event.id}
            to={webRoutes.workforceEventDetail.replace(":id", event.id)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate group-hover:text-black">
                  {event.title}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {event.start_date
                    ? new Date(event.start_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : ""}
                  {event.location ? ` · ${event.location}` : ""}
                </p>
              </div>
              <span
                className={clsx(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize shrink-0",
                  getEventStatusColor(eventLifecycle.status)
                )}
              >
                {eventLifecycle.label}
              </span>
            </div>
          </ActivityItem>
        );
      })}
    </ActivitySection>
  );
}

// ─── Knowledge Hub Section ──────────────────────────────────────────────────
function KnowledgeSection({ articles = [] }) {
  // Deduplicate articles by title to avoid showing repeated entries
  const uniqueArticles = articles.reduce((acc, article) => {
    if (!acc.some((a) => a.title === article.title)) acc.push(article);
    return acc;
  }, []);

  return (
    <ActivitySection
      icon={BookOpen}
      iconBg="bg-purple-50"
      iconColor="text-purple-600"
      title="Knowledge Hub"
      viewMoreUrl={webRoutes.knowledgeArticles}
      isEmpty={uniqueArticles.length === 0}
    >
      {uniqueArticles.slice(0, 4).map((article) => (
        <ActivityItem
          key={article.id || article.slug}
          to={webRoutes.knowledgeArticleDetail.replace(
            ":slug",
            article.slug || article.id
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 truncate group-hover:text-black">
                {article.title}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {article.author_name || article.author?.full_name || ""}
              </p>
            </div>
            <span className="text-[10px] text-gray-400 shrink-0">
              {timeAgo(article.created_at || article.published_at)}
            </span>
          </div>
        </ActivityItem>
      ))}
    </ActivitySection>
  );
}

// ─── Marketplace Section ────────────────────────────────────────────────────
function MarketplaceSection({ listings = [] }) {
  return (
    <ActivitySection
      icon={ShoppingBag}
      iconBg="bg-emerald-50"
      iconColor="text-emerald-600"
      title="Marketplace"
      viewMoreUrl={webRoutes.marketplace}
      isEmpty={listings.length === 0}
    >
      {listings.slice(0, 4).map((listing) => (
        <ActivityItem
          key={listing.id}
          to={webRoutes.marketplaceListing.replace(":id", listing.id)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 truncate group-hover:text-black">
                {listing.title}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {listing.seller_name || listing.company_name || ""}
              </p>
            </div>
            {listing.price && (
              <span className="text-xs font-semibold text-gray-700 shrink-0">
                ${formatCompactNumber(listing.price)}
              </span>
            )}
          </div>
        </ActivityItem>
      ))}
    </ActivitySection>
  );
}

// ─── Logistics Section ──────────────────────────────────────────────────────
function LogisticsSection({ requests = [] }) {
  return (
    <ActivitySection
      icon={Truck}
      iconBg="bg-sky-50"
      iconColor="text-sky-600"
      title="Logistics"
      viewMoreUrl={webRoutes.logisticsRequests}
      isEmpty={requests.length === 0}
    >
      {requests.slice(0, 4).map((req) => (
        <ActivityItem
          key={req.id}
          to={webRoutes.logisticsRequestDetail.replace(":id", req.id)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 truncate group-hover:text-black">
                {req.title || req.cargo_description || `Request #${req.id}`}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {req.origin && req.destination
                  ? `${req.origin} → ${req.destination}`
                  : timeAgo(req.created_at)}
              </p>
            </div>
            <span
              className={clsx(
                "text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize shrink-0",
                getStatusColor(req.status)
              )}
            >
              {req.status || "pending"}
            </span>
          </div>
        </ActivityItem>
      ))}
    </ActivitySection>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────
function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, sectionIdx) => (
        <div key={sectionIdx} className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <div className="w-4 h-4 skeleton rounded" />
            <div className="w-20 h-3 skeleton rounded" />
          </div>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="px-2.5 py-2 space-y-1.5">
              <div className="flex justify-between">
                <div className="w-3/5 h-3.5 skeleton rounded" />
                <div className="w-12 h-3 skeleton rounded" />
              </div>
              <div className="w-2/5 h-2.5 skeleton rounded" />
            </div>
          ))}
          <div className="border-b border-gray-100" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function BusinessHubActivities() {
  const { data, isLoading } = useBusinessHubData();
  const visibleEvents = getVisibleSidebarEvents(data?.events || []);

  // When not loading, hide the entire section if every card is empty.
  const hasAnyContent =
    (data?.dealRooms?.length || 0) +
      (data?.jobs?.length || 0) +
      visibleEvents.length +
      (data?.articles?.length || 0) +
      (data?.listings?.length || 0) +
      (data?.logistics?.length || 0) >
    0;

  if (!isLoading && !hasAnyContent) return null;

  return (
    <section className="w-full">
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 lg:!px-2">
        <TrendingUp className="w-4.5 h-4.5 text-gray-700" />
        <h2 className="text-sm font-bold text-gray-900">Business Hub</h2>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <ActivitySkeleton />
        ) : (
          <>
            <DealRoomsSection deals={data?.dealRooms} />
            <JobsSection jobs={data?.jobs} />
            <EventsSection events={visibleEvents} />
            <KnowledgeSection articles={data?.articles} />
            <MarketplaceSection listings={data?.listings} />
            <LogisticsSection requests={data?.logistics} />
          </>
        )}
      </div>
    </section>
  );
}
