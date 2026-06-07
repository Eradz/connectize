import { Link } from "react-router-dom";
import { webRoutes } from "../../lib/webRoutes";
import {
  Briefcase,
  MapPin,
  Calendar,
  Users,
  Eye,
  MessageSquare,
  Tag,
  DollarSign,
  Clock,
  Star,
  Truck,
  Shield,
  FileText,
  CheckSquare,
  Globe,
  BookOpen,
} from "lucide-react";

/* ──────────────────────── Shared Helpers ──────────────────────── */

const formatCurrency = (amount, currency = "USD") => {
  if (!amount) return null;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toLocaleString();
};

const hasListingPrice = (listing) =>
  listing?.price !== null &&
  listing?.price !== undefined &&
  listing?.price !== "" &&
  !Number.isNaN(Number(listing.price));

const formatListingPrice = (listing) => {
  if (!hasListingPrice(listing)) return "Contact for Pricing";
  const currency = listing?.currency || "USD";
  const prefix = currency === "USD" ? "$" : `${currency} `;
  return `${prefix}${parseFloat(listing.price).toLocaleString()}`;
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 1) return "Just now";
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  if (diffD < 30) return `${Math.floor(diffD / 7)}w ago`;
  return date.toLocaleDateString();
};

const StatusBadge = ({ status, className = "" }) => {
  const colors = {
    active: "bg-green-100 text-green-700",
    published: "bg-green-100 text-green-700",
    approved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    draft: "bg-gray-100 text-gray-600",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
    closed: "bg-gray-200 text-gray-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${
        colors[status] || "bg-gray-100 text-gray-600"
      } ${className}`}
    >
      {status?.replace("_", " ")}
    </span>
  );
};

/* ──────────────────────── Marketplace Listing ──────────────────────── */

export const SearchMarketplaceCard = ({ listing }) => (
  <Link
    to={webRoutes.marketplaceListing.replace(":id", listing.id)}
    className="group block bg-white rounded-xl border hover:shadow-md transition-all overflow-hidden"
  >
    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
      {listing.first_image ? (
        <img
          src={listing.first_image}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300">
          <Tag className="w-10 h-10" />
        </div>
      )}
      {listing.discount_percentage > 0 && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
          -{listing.discount_percentage}%
        </span>
      )}
      {listing.condition && listing.condition !== "new" && (
        <span className="absolute top-2 right-2 bg-white/90 text-gray-700 text-[11px] font-medium px-2 py-0.5 rounded-full capitalize">
          {listing.condition.replace("_", " ")}
        </span>
      )}
    </div>
    <div className="p-3">
      <h4 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1">
        {listing.title}
      </h4>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg font-bold text-gray-900">
          {formatListingPrice(listing)}
        </span>
        {hasListingPrice(listing) &&
          listing.compare_at_price &&
          parseFloat(listing.compare_at_price) > parseFloat(listing.price) && (
            <span className="text-sm text-gray-400 line-through">
              ${parseFloat(listing.compare_at_price).toLocaleString()}
            </span>
          )}
      </div>
      {listing.seller_company_name && (
        <div className="flex items-center gap-1.5">
          {listing.seller_company_logo ? (
            <img
              src={listing.seller_company_logo}
              className="w-4 h-4 rounded-full object-cover"
              alt=""
            />
          ) : (
            <div className="w-4 h-4 rounded-full bg-gray-200" />
          )}
          <span className="text-xs text-gray-500 truncate">
            {listing.seller_company_name}
          </span>
        </div>
      )}
    </div>
  </Link>
);

/* ──────────────────────── Job Posting ──────────────────────── */

export const SearchJobCard = ({ job }) => (
  <Link
    to={webRoutes.workforceJobDetail.replace(":id", job.id)}
    className="block bg-white rounded-xl border p-4 hover:shadow-md transition-shadow"
  >
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
        {job.company_logo ? (
          <img
            src={job.company_logo}
            className="w-10 h-10 rounded-lg object-cover"
            alt=""
          />
        ) : (
          <Briefcase className="w-5 h-5 text-amber-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
          {job.title}
        </h4>
        {job.company_name && (
          <p className="text-xs text-gray-500 mt-0.5">{job.company_name}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {job.location && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              {job.location}
            </span>
          )}
          {job.is_remote && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
              <Globe className="w-3 h-3" />
              Remote
            </span>
          )}
          {job.job_type && (
            <span className="text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full capitalize">
              {job.job_type.replace("_", " ")}
            </span>
          )}
          {job.experience_level && (
            <span className="text-[11px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full capitalize">
              {job.experience_level}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          {(job.salary_min || job.salary_max) && (
            <span className="text-xs font-semibold text-gray-700">
              <DollarSign className="w-3 h-3 inline" />
              {formatCurrency(job.salary_min)} - {formatCurrency(job.salary_max)}
            </span>
          )}
          <span className="text-[11px] text-gray-400">
            {timeAgo(job.created_at)}
          </span>
        </div>
      </div>
    </div>
  </Link>
);

/* ──────────────────────── Event ──────────────────────── */

export const SearchEventCard = ({ event }) => (
  <Link
    to={webRoutes.workforceEventDetail.replace(":id", event.id)}
    className="block bg-white rounded-xl border p-4 hover:shadow-md transition-shadow"
  >
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center justify-center w-12 h-12 bg-amber-50 rounded-lg flex-shrink-0">
        <span className="text-[11px] font-bold text-amber-700 uppercase leading-none">
          {event.start_date
            ? new Date(event.start_date).toLocaleDateString("en", {
                month: "short",
              })
            : "TBD"}
        </span>
        <span className="text-lg font-bold text-gray-900 leading-none">
          {event.start_date
            ? new Date(event.start_date).getDate()
            : "—"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
          {event.title}
        </h4>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
          {event.description}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {event.event_type && (
            <span className="text-[11px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full capitalize font-medium">
              {event.event_type.replace("_", " ")}
            </span>
          )}
          {event.is_virtual && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full font-medium">
              <Globe className="w-3 h-3" />
              Virtual
            </span>
          )}
          {event.venue_name && !event.is_virtual && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              {event.venue_name}
            </span>
          )}
          {event.organizer_company_name && (
            <span className="text-xs text-gray-400">
              by {event.organizer_company_name}
            </span>
          )}
        </div>
      </div>
    </div>
  </Link>
);

/* ──────────────────────── Article ──────────────────────── */

export const SearchArticleCard = ({ article }) => (
  <Link
    to={webRoutes.knowledgeArticleDetail.replace(":slug", article.slug)}
    className="group block bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow"
  >
    {article.featured_image && (
      <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
        <img
          src={article.featured_image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    )}
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2">
        {article.category_name && (
          <span className="text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
            {article.category_name}
          </span>
        )}
        {article.article_type && (
          <span className="text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full capitalize">
            {article.article_type.replace("_", " ")}
          </span>
        )}
      </div>
      <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
        {article.title}
      </h4>
      {article.excerpt && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
          {article.excerpt}
        </p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {article.author_avatar && (
            <img
              src={article.author_avatar}
              className="w-5 h-5 rounded-full object-cover"
              alt=""
            />
          )}
          <span className="text-xs text-gray-500">{article.author_name}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="inline-flex items-center gap-0.5">
            <Eye className="w-3 h-3" /> {article.views || 0}
          </span>
          <span className="inline-flex items-center gap-0.5">
            ♥ {article.likes || 0}
          </span>
        </div>
      </div>
    </div>
  </Link>
);

/* ──────────────────────── Deal Room ──────────────────────── */

export const SearchDealRoomCard = ({ deal }) => (
  <Link
    to={webRoutes.dealRoomDetail.replace(":id", deal.id)}
    className="block bg-white rounded-xl border p-4 hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between mb-2">
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
          {deal.title}
        </h4>
        <p className="text-xs text-gray-500 mt-0.5">
          {deal.company_name || "Personal Deal Room"}
        </p>
      </div>
      <StatusBadge status={deal.status} />
    </div>
    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
      {deal.description}
    </p>
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-3 text-gray-500">
        {deal.deal_type && (
          <span className="bg-gray-100 px-2 py-0.5 rounded-full capitalize">
            {deal.deal_type.replace("_", " ")}
          </span>
        )}
        <span className="inline-flex items-center gap-0.5">
          <Users className="w-3 h-3" /> {deal.participants_count || 0}
        </span>
      </div>
      {deal.estimated_value && (
        <span className="font-semibold text-gray-900">
          ${formatCurrency(deal.estimated_value)}
        </span>
      )}
    </div>
    {deal.is_confidential && (
      <div className="flex items-center gap-1 mt-2 text-[11px] text-orange-600">
        <Shield className="w-3 h-3" />
        Confidential
      </div>
    )}
  </Link>
);

/* ──────────────────────── Forum Topic ──────────────────────── */

export const SearchForumTopicCard = ({ topic }) => (
  <Link
    to={webRoutes.knowledgeForumTopicDetail.replace(":slug", topic.slug)}
    className="block bg-white rounded-xl border p-4 hover:shadow-md transition-shadow"
  >
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
        <MessageSquare className="w-4 h-4 text-indigo-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
            {topic.title}
          </h4>
          {topic.is_pinned && (
            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
              Pinned
            </span>
          )}
        </div>
        {topic.forum_name && (
          <p className="text-xs text-gray-500 mt-0.5">
            in {topic.forum_name}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
          {topic.content?.replace(/<[^>]*>/g, "")}
        </p>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span className="inline-flex items-center gap-0.5">
            <Eye className="w-3 h-3" /> {topic.views || 0}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <MessageSquare className="w-3 h-3" /> {topic.replies || 0}
          </span>
          <span>{topic.author_name}</span>
          <span>{timeAgo(topic.created_at)}</span>
        </div>
      </div>
    </div>
  </Link>
);

/* ──────────────────────── Logistics Provider ──────────────────────── */

export const SearchLogisticsProviderCard = ({ provider }) => (
  <Link
    to={webRoutes.logistics}
    className="block bg-white rounded-xl border p-4 hover:shadow-md transition-shadow"
  >
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
        <Truck className="w-5 h-5 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
          {provider.company_name}
        </h4>
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {provider.service_types &&
            (Array.isArray(provider.service_types)
              ? provider.service_types
              : [provider.service_types]
            )
              .slice(0, 3)
              .map((type, i) => (
                <span
                  key={i}
                  className="text-[11px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full capitalize"
                >
                  {type.replace("_", " ")}
                </span>
              ))}
          {provider.coverage_type && (
            <span className="text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full capitalize">
              {provider.coverage_type}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          {provider.fleet_size > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <Truck className="w-3 h-3" /> {provider.fleet_size} vehicles
            </span>
          )}
          {provider.safety_rating && (
            <span className="inline-flex items-center gap-0.5">
              <Star className="w-3 h-3 text-amber-400" />{" "}
              {provider.safety_rating}
            </span>
          )}
        </div>
      </div>
    </div>
  </Link>
);

/* ──────────────────────── Search Result Section wrapper ──────────────────────── */

export const SearchResultSection = ({
  title,
  icon: Icon,
  count,
  children,
  onSeeAll,
}) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
        {count > 0 && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      {onSeeAll && count > 3 && (
        <button
          onClick={onSeeAll}
          className="text-xs text-gold hover:text-amber-600 font-medium transition-colors"
        >
          See all →
        </button>
      )}
    </div>
    {children}
  </div>
);
