import { createSEO } from "./SEO";

export const meta = () =>
  createSEO({
    title: "Notifications | Connectize",
    description: "Stay updated with the latest notifications, alerts, and activity on your Connectize network.",
  keywords: "notifications, alerts, activity, Connectize",
  });

import { Badge } from "@chakra-ui/react";
import clsx from "clsx";
import { motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  Bookmark,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  CircleX,
  ClipboardList,
  ClockAlert,
  FilePenLine,
  FileText,
  Flag,
  Gavel,
  Handshake,
  Heart,
  ListChecks,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Package,
  Radio,
  Reply,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Tag,
  Trash2,
  TriangleAlert,
  Trophy,
  Truck,
  UserPlus,
  Users,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteAllNotifications,
  deleteNotification,
  getNotificationsForUser,
  markAllNotificationsAsRead,
} from "../api-services/notifications";
import useNotificationWebSocket from "../hooks/useNotificationWebSocket";
import { Notification } from "../icon";
import { baseURL } from "../lib/helpers";
import { useNotificationsStore } from "../stores/notificationsStore";
import SeeMoreLink from "./SeeMoreLink";
import { NotificationsSkeleton } from "./skeletons/notification";
import TimeAgo from "./TimeAgo";
const NOTIFICATION_VISUALS = {
  like: { Icon: Heart, icon: "text-rose-600", surface: "bg-rose-50", badge: "bg-rose-500", label: "Like" },
  mention: { Icon: Users, icon: "text-violet-600", surface: "bg-violet-50", badge: "bg-violet-500", label: "Mention" },
  comment: { Icon: MessageSquare, icon: "text-blue-600", surface: "bg-blue-50", badge: "bg-blue-500", label: "Comment" },
  reply: { Icon: Reply, icon: "text-violet-600", surface: "bg-violet-50", badge: "bg-violet-500", label: "Reply" },
  follow: { Icon: UserPlus, icon: "text-emerald-600", surface: "bg-emerald-50", badge: "bg-emerald-500", label: "Follow" },
  bookmark: { Icon: Bookmark, icon: "text-amber-700", surface: "bg-amber-50", badge: "bg-amber-500", label: "Bookmark" },
  favorite: { Icon: Star, icon: "text-amber-700", surface: "bg-amber-50", badge: "bg-amber-500", label: "Favorite" },
  messaging: { Icon: MessageCircle, icon: "text-teal-600", surface: "bg-teal-50", badge: "bg-teal-500", label: "Message" },
  representation: { Icon: BriefcaseBusiness, icon: "text-slate-700", surface: "bg-slate-100", badge: "bg-slate-600", label: "Representation" },
  connection: { Icon: Users, icon: "text-sky-700", surface: "bg-sky-50", badge: "bg-sky-600", label: "Connection" },
  connection_request: { Icon: UserPlus, icon: "text-sky-700", surface: "bg-sky-50", badge: "bg-sky-600", label: "Connection" },
  connection_accepted: { Icon: CheckCircle2, icon: "text-emerald-700", surface: "bg-emerald-50", badge: "bg-emerald-600", label: "Connection" },
  promotions: { Icon: Tag, icon: "text-pink-600", surface: "bg-pink-50", badge: "bg-pink-500", label: "Promotion" },
  announcement: { Icon: Megaphone, icon: "text-orange-600", surface: "bg-orange-50", badge: "bg-orange-500", label: "Announcement" },
  quote_accepted: { Icon: CheckCircle2, icon: "text-emerald-700", surface: "bg-emerald-50", badge: "bg-emerald-600", label: "Quote accepted" },
  quote_rejected: { Icon: CircleX, icon: "text-red-600", surface: "bg-red-50", badge: "bg-red-500", label: "Quote rejected" },
  quote_received: { Icon: FilePenLine, icon: "text-amber-700", surface: "bg-amber-50", badge: "bg-amber-500", label: "New quote" },
  new_shipment_request: { Icon: Truck, icon: "text-blue-700", surface: "bg-blue-50", badge: "bg-blue-600", label: "Shipment request" },
  shipment_status: { Icon: Package, icon: "text-violet-700", surface: "bg-violet-50", badge: "bg-violet-600", label: "Shipment" },
  deal_room: { Icon: Handshake, icon: "text-sky-700", surface: "bg-sky-50", badge: "bg-sky-600", label: "Deal room" },
  deal_document: { Icon: FileText, icon: "text-teal-700", surface: "bg-teal-50", badge: "bg-teal-600", label: "Deal document" },
  deal_milestone: { Icon: Flag, icon: "text-violet-700", surface: "bg-violet-50", badge: "bg-violet-600", label: "Milestone" },
  job_application: { Icon: ClipboardList, icon: "text-orange-700", surface: "bg-orange-50", badge: "bg-orange-600", label: "Job application" },
  event_update: { Icon: CalendarCheck, icon: "text-emerald-700", surface: "bg-emerald-50", badge: "bg-emerald-600", label: "Event" },
  marketplace: { Icon: Store, icon: "text-pink-700", surface: "bg-pink-50", badge: "bg-pink-600", label: "Marketplace" },
  order_placed: { Icon: ShoppingBag, icon: "text-pink-700", surface: "bg-pink-50", badge: "bg-pink-600", label: "Order placed" },
  order_confirmed: { Icon: CheckCircle2, icon: "text-emerald-700", surface: "bg-emerald-50", badge: "bg-emerald-600", label: "Order confirmed" },
  order_shipped: { Icon: Truck, icon: "text-blue-700", surface: "bg-blue-50", badge: "bg-blue-600", label: "Order shipped" },
  order_delivered: { Icon: Package, icon: "text-emerald-700", surface: "bg-emerald-50", badge: "bg-emerald-600", label: "Order delivered" },
  order_cancelled: { Icon: CircleX, icon: "text-red-600", surface: "bg-red-50", badge: "bg-red-500", label: "Order cancelled" },
  knowledge_hub: { Icon: BookOpen, icon: "text-blue-700", surface: "bg-blue-50", badge: "bg-blue-600", label: "Knowledge" },
  bid_invitation: { Icon: Gavel, icon: "text-primary-800", surface: "bg-primary-50", badge: "bg-gold", label: "Bid invitation" },
  bid_submission: { Icon: FilePenLine, icon: "text-blue-700", surface: "bg-blue-50", badge: "bg-blue-600", label: "Bid submission" },
  bid_submitted: { Icon: FilePenLine, icon: "text-blue-700", surface: "bg-blue-50", badge: "bg-blue-600", label: "Bid submitted" },
  bid_shortlisted: { Icon: ListChecks, icon: "text-emerald-700", surface: "bg-emerald-50", badge: "bg-emerald-600", label: "Shortlisted" },
  bid_awarded: { Icon: Trophy, icon: "text-emerald-700", surface: "bg-emerald-50", badge: "bg-emerald-600", label: "Bid awarded" },
  bid_rejected: { Icon: CircleX, icon: "text-red-600", surface: "bg-red-50", badge: "bg-red-500", label: "Bid rejected" },
  bid_deadline_reminder: { Icon: ClockAlert, icon: "text-amber-700", surface: "bg-amber-50", badge: "bg-amber-500", label: "Bid deadline" },
  prequalification: { Icon: ShieldCheck, icon: "text-violet-700", surface: "bg-violet-50", badge: "bg-violet-600", label: "Prequalification" },
  performance_review_reminder: { Icon: Star, icon: "text-violet-700", surface: "bg-violet-50", badge: "bg-violet-600", label: "Performance review" },
  compliance_expiry_warning: { Icon: TriangleAlert, icon: "text-amber-700", surface: "bg-amber-50", badge: "bg-amber-500", label: "Compliance" },
  compliance_verified: { Icon: ShieldCheck, icon: "text-emerald-700", surface: "bg-emerald-50", badge: "bg-emerald-600", label: "Compliance" },
  compliance_rejected: { Icon: CircleX, icon: "text-red-600", surface: "bg-red-50", badge: "bg-red-500", label: "Compliance" },
  ping: { Icon: Radio, icon: "text-primary-800", surface: "bg-primary-50", badge: "bg-gold", label: "Ping" },
  warning: { Icon: TriangleAlert, icon: "text-amber-700", surface: "bg-amber-50", badge: "bg-amber-500", label: "Warning" },
  default: { Icon: Bell, icon: "text-primary-800", surface: "bg-primary-50", badge: "bg-gold", label: "Notification" },
};

const NOTIFICATION_FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "social", label: "Social" },
  { key: "business", label: "Business Hub" },
  { key: "deals", label: "Deals" },
  { key: "workforce", label: "Workforce" },
  { key: "marketplace", label: "Marketplace" },
  { key: "logistics", label: "Logistics" },
];

const SOCIAL_TYPES = new Set(["like", "mention", "comment", "reply", "follow", "bookmark", "favorite", "messaging", "connection", "connection_request", "connection_accepted"]);
const DEAL_TYPES = new Set(["deal_room", "deal_document", "deal_milestone"]);
const WORKFORCE_TYPES = new Set(["job_application", "event_update"]);
const MARKETPLACE_TYPES = new Set(["marketplace", "order_placed", "order_confirmed", "order_shipped", "order_delivered", "order_cancelled"]);
const LOGISTICS_TYPES = new Set(["quote_accepted", "quote_rejected", "quote_received", "new_shipment_request", "shipment_status"]);
const BUSINESS_TYPES = new Set([
  ...DEAL_TYPES,
  ...WORKFORCE_TYPES,
  ...MARKETPLACE_TYPES,
  ...LOGISTICS_TYPES,
  "knowledge_hub",
  "bid_invitation",
  "bid_submission",
  "bid_submitted",
  "bid_shortlisted",
  "bid_awarded",
  "bid_rejected",
  "bid_deadline_reminder",
  "prequalification",
  "performance_review_reminder",
  "compliance_expiry_warning",
  "compliance_verified",
  "compliance_rejected",
]);

const isNotificationRead = (value) => {
  if (value === null || value === undefined || value === false) return false;
  if (typeof value === "string") {
    return value.trim() !== "" && value.toLowerCase() !== "false";
  }
  return true;
};

const resolveMediaUrl = (value) => {
  if (!value) return "";
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  return `${String(baseURL).replace(/\/$/, "")}/${String(value).replace(/^\//, "")}`;
};

const filterNotifications = (notifications, filter) => {
  if (filter === "all") return notifications;
  if (filter === "unread") return notifications.filter((item) => !isNotificationRead(item?.is_read));
  if (filter === "social") return notifications.filter((item) => SOCIAL_TYPES.has(item?.notification_type));
  if (filter === "business") return notifications.filter((item) => BUSINESS_TYPES.has(item?.notification_type));
  if (filter === "deals") return notifications.filter((item) => DEAL_TYPES.has(item?.notification_type));
  if (filter === "workforce") return notifications.filter((item) => WORKFORCE_TYPES.has(item?.notification_type));
  if (filter === "marketplace") return notifications.filter((item) => MARKETPLACE_TYPES.has(item?.notification_type));
  if (filter === "logistics") return notifications.filter((item) => LOGISTICS_TYPES.has(item?.notification_type));
  return notifications;
};

export const IndicatorBadge = ({ indicator, floating = false }) => {
  return (
    <>
      {indicator > 0 && (
        <Badge
          className={clsx(
            "!flex !size-5 !items-center !justify-center !rounded-full !bg-gold !text-[.6rem] !font-bold !text-dark",
            {
              "absolute -top-1.5 -right-1": floating,
            }
          )}
        >
          <span>{Number(indicator) > 10 ? "10+" : indicator}</span>
        </Badge>
      )}
    </>
  );
};

const NotificationPopOver = () => {
  // Get unread count from the store
  const unreadCount = useNotificationsStore((s) =>
    typeof s.unreadCount === "function" ? s.unreadCount() : 0
  );
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);

  // Fetch notifications on mount so the badge shows immediately after reload
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div>
      <div>
        <button className="relative">
          <IndicatorBadge indicator={unreadCount} floating />
          <Notification />
        </button>
      </div>

      {/* <div className="mx-2 xs:!w-[350px] lg:!w-[400px]">
        <PopoverArrow />
        <NotificationItem isPopover />
      </div> */}
    </div>
  );
};

export const NotificationItem = ({ isPopover = false }) => {
  const [activeFilter, setActiveFilter] = useState("all");
  useNotificationWebSocket();

  const notifications = useNotificationsStore((s) => s.notifications);
  const unreadCount = useNotificationsStore((s) =>
    typeof s.unreadCount === "function" ? s.unreadCount() : 0
  );

  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);
  const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead);
  const deleteAll = useNotificationsStore((s) => s.deleteAll);
  
  // Only fetch notifications data, removed expensive useCompanies and useUsers hooks
  const isLoading = !notifications; // Simple loading check based on notifications state

  const visibleNotifications = useMemo(() => {
    const source = Array.isArray(notifications) ? notifications : [];
    if (isPopover) return source.slice(0, 10);
    return filterNotifications(source, activeFilter);
  }, [activeFilter, isPopover, notifications]);

  const handleMarkAllAsRead = useCallback(async () => {
    markAllAsRead();
    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error("Failed to mark all notifications:", err);
    }
  }, []);

  const handleDeleteAllNotifications = useCallback(async () => {
    deleteAll();
    try {
      await deleteAllNotifications();
    } catch (err) {
      console.error("Failed to delete all notifications:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <>
      {isLoading ? (
        <NotificationsSkeleton />
      ) : (
        <section
          className={clsx(
            "w-full overflow-hidden bg-white",
            isPopover ? "rounded-xl border border-gray-200 shadow-medium" : "rounded-xl border border-gray-200"
          )}
        >
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-4 sm:px-5">
            <div className="flex items-center gap-2">
              <h1 className={clsx("font-bold text-dark", isPopover ? "text-lg" : "text-xl sm:text-2xl")}>Notifications</h1>
              <IndicatorBadge indicator={unreadCount} />
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  className="rounded-lg bg-gold px-3 py-2 text-xs font-semibold text-dark transition-colors hover:bg-custom_yellow disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </button>
              )}

              {notifications?.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteAllNotifications}
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
                  title="Clear all notifications"
                  aria-label="Clear all notifications"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          </header>

          {!isPopover && unreadCount > 0 && (
            <div className="flex items-center gap-2 border-b border-primary-100 bg-primary-50 px-4 py-3 text-sm text-dark sm:px-5">
              <Bell className="size-4 text-gold" />
              <span>You have <strong>{unreadCount}</strong> unread notification{unreadCount === 1 ? "" : "s"}</span>
            </div>
          )}

          {!isPopover && (
            <div className="scrollbar-hidden flex gap-2 overflow-x-auto border-b border-gray-200 px-4 py-3 sm:px-5">
              {NOTIFICATION_FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={clsx(
                    "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40",
                    activeFilter === filter.key
                      ? "bg-gold text-dark"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-dark"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}

          <NotificationsArray
            notifications={visibleNotifications}
            fallback=""
            isPopover={isPopover}
          />

          {isPopover && notifications?.length > 10 && (
            <SeeMoreLink url="/co/notifications" />
          )}
        </section>
      )}
    </>
  );
};

const NotificationsArray = memo(
  ({ notifications, fallback, isPopover }) => {
    return (
      <section
        className={clsx("divide-y divide-gray-100", {
          "max-h-[32vh] overflow-y-auto overflow-x-hidden scrollbar-hidden":
            isPopover,
        })}
      >
        {notifications.length <= 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <span className="mb-3 inline-flex size-14 items-center justify-center rounded-full bg-primary-50 text-gold">
              <Bell className="size-6" />
            </span>
            <h2 className="text-base font-semibold text-dark">No notifications</h2>
            <p className="mt-1 max-w-sm text-sm text-gray-500">You’re all caught up. New activity will appear here.</p>
          </div>
        ) : (
          notifications?.map((notification, index) => {
            return (
              <NotificationTile
                key={notification?.id}
                index={index}
                notification={notification}
              />
            );
          })
        )}
      </section>
    );
  }
);

const normalizeNotificationLink = (notification) => {
  const rawLink = notification?.link || "";
  const extra = notification?.extra_data || notification?.extra || {};
  const type = notification?.notification_type;
  const projectId = extra.project_id || extra.bid_project_id || extra.project;
  const bidId = extra.bid_id || extra.submission_id || extra.bid;
  const isBiddingNotification =
    typeof type === "string" && (
      type.startsWith("bid_") ||
      type === "prequalification" ||
      type === "performance_review_reminder"
    );

  if (projectId && bidId && ["bid_submission", "bid_submitted", "bid_awarded", "bid_rejected", "bid_shortlisted"].includes(type)) {
    return `/bidding/projects/${projectId}/bids/${bidId}`;
  }

  if (projectId && isBiddingNotification) {
    return `/bidding/projects/${projectId}`;
  }

  if (rawLink) {
    let pathOnly = rawLink;
    if (/^https?:\/\//i.test(rawLink)) {
      try {
        const url = new URL(rawLink);
        pathOnly = url.pathname + url.search;
      } catch {
        pathOnly = rawLink;
      }
    }

    const withoutLegacyPlatform = pathOnly.replace(/^\/?platform(?=\/|$)/, "");
    const normalizedPath = (withoutLegacyPlatform || "/").replace("/room", "/?room_name=room");
    const normalized = normalizedPath.startsWith("/") || normalizedPath.startsWith("#")
      ? normalizedPath
      : `/${normalizedPath}`;
    const legacyBiddingMatch = normalized.match(/^\/?bidding\/([a-f0-9-]{36}|\d+)\/?$/i);
    if (legacyBiddingMatch) {
      return `/bidding/projects/${legacyBiddingMatch[1]}`;
    }
    return normalized;
  }

  return "#";
};

const NotificationTile = memo(({ notification, index }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const { markAsRead, deleteNotification: deleteThis } =
    useNotificationsStore();

  const handleMarkAsRead = async () => {
    await markAsRead(notification?.id);
  };

  const handleDeleteNotification = async () => {
    deleteThis(notification?.id);
    try {
      await deleteNotification(notification?.id);
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const senderData = notification?.sender_data || {};
  const companyData = notification?.company_data || {};
  const senderName = [senderData?.first_name, senderData?.last_name]
    .filter(Boolean)
    .join(" ") || senderData?.email || "";
  const companyName = companyData?.company_name || senderData?.company_name || "";
  const avatarUrl = resolveMediaUrl(
    companyData?.logo || senderData?.avatar || senderData?.logo
  );
  const visual = NOTIFICATION_VISUALS[notification?.notification_type] || NOTIFICATION_VISUALS.default;
  const TypeIcon = visual.Icon;
  const isRead = isNotificationRead(notification?.is_read);
  const message = notification?.message || notification?.title || `${senderName || "Someone"} sent you a notification`;
  const badgeIconColor = visual.badge === "bg-gold" ? "text-dark" : "text-white";

  useEffect(() => {
    setImageFailed(false);
  }, [avatarUrl]);

  return (
    <motion.div
      initial={{ y: 4, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay: Math.min(index, 8) * 0.025 }}
      viewport={{ once: true }}
      className={clsx(
        "group relative flex items-start gap-3 px-4 py-4 transition-colors sm:px-5",
        isRead ? "bg-white hover:bg-gray-50" : "bg-primary-50/70 hover:bg-primary-50"
      )}
    >
      <div className="relative shrink-0">
        {avatarUrl && !imageFailed ? (
          <img
            src={avatarUrl}
            alt={senderName || companyName || visual.label}
            onError={() => setImageFailed(true)}
            className="size-12 rounded-full border border-gray-200 bg-gray-100 object-cover"
          />
        ) : (
          <span className={clsx("inline-flex size-12 items-center justify-center rounded-full", visual.surface, visual.icon)}>
            <TypeIcon className="size-5" />
          </span>
        )}

        <span
          className={clsx(
            "absolute -bottom-0.5 -right-0.5 inline-flex size-5 items-center justify-center rounded-full border-2 border-white",
            visual.badge,
            badgeIconColor
          )}
          aria-hidden="true"
        >
          <TypeIcon className="size-2.5" strokeWidth={2.5} />
        </span>
      </div>

      <div className="min-w-0 flex-1 pr-9">
        <Link
          to={normalizeNotificationLink(notification)}
          onClick={handleMarkAsRead}
          className={clsx(
            "block text-sm leading-5 text-gray-700 transition-colors hover:text-dark",
            !isRead && "font-semibold text-dark"
          )}
        >
          {message}
        </Link>

        {companyName && (
          <p className="mt-0.5 truncate text-xs text-gray-500">{companyName}</p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className="text-gray-400">
            <TimeAgo time={notification?.timestamp} />
          </span>
          <span className={clsx("font-medium", visual.icon)}>{visual.label}</span>

          {!isRead && (
            <button
              type="button"
              onClick={handleMarkAsRead}
              className="font-medium text-gray-600 underline-offset-2 hover:text-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
            >
              Mark as read
            </button>
          )}

          {!isRead && <span className="size-2 rounded-full bg-gold" aria-label="Unread" />}
        </div>
      </div>

      <button
        type="button"
        onClick={handleDeleteNotification}
        className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-lg text-gray-400 opacity-100 transition-all hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 md:opacity-0 md:group-hover:opacity-100"
        title="Remove notification"
        aria-label="Remove notification"
      >
        <Trash2 className="size-4" />
      </button>
    </motion.div>
  );
});

export { NotificationPopOver, NotificationsArray };
