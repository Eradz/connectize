import { createSEO } from "./SEO";

export const meta = () =>
  createSEO({
    title: "Notifications | Connectize",
    description: "Stay updated with the latest notifications, alerts, and activity on your Connectize network.",
  keywords: "notifications, alerts, activity, Connectize",
  });

import {
  Avatar,
  Badge,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import { DeleteForever, RemoveCircle } from "@mui/icons-material";
import clsx from "clsx";
import { motion } from "framer-motion";
import { memo, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  deleteAllNotifications,
  deleteNotification,
  getNotificationsForUser,
  markAllNotificationsAsRead,
} from "../api-services/notifications";
import useNotificationWebSocket from "../hooks/useNotificationWebSocket";
import { Notification } from "../icon";
import { useNotificationsStore } from "../stores/notificationsStore";
import { useAuth } from "../context/userContext";
import { ButtonWithTooltipIcon } from "./ButtonWithTooltipIcon";
import CompanyName from "./company/CompanyName";
import { avatarStyle } from "./ResponsiveNav";
import SeeMoreLink from "./SeeMoreLink";
import { NotificationsSkeleton } from "./skeletons/notification";
import TimeAgo from "./TimeAgo";
// import { getNotificationsForUser } from "../hooks/usePolling";

const IndicatorBadge = ({ indicator, floating = false }) => {
  return (
    <>
      {indicator > 0 && (
        <Badge
          className={clsx(
            "size-4 !text-[.55rem] !bg-gold !rounded-full !flex !items-center justify-center",
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
  const { user } = useAuth();
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

  const diffNotifications = isPopover
    ? notifications?.slice(0, 10)
    : notifications;

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
        <section className={clsx("bg-white rounded-md p-3 space-y-2 w-full")}>
          <header className="flex justify-between items-center gap-2 border-b border-gray-100 pb-1">
            <h4 className="text-lg font-semibold flex items-center gap-1">
              <span>Notifications</span>
              <IndicatorBadge indicator={notifications?.length} />
            </h4>
            <div>
              {unreadCount > 0 && (
                <button
                  className="text-black/90 bg-gold rounded-md hover:bg-opacity-60 transition-all duration-300 !text-xs disabled:cursor-not-allowed disabled:no-underline px-5 py-1"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifications?.length > 0 && (
              <ButtonWithTooltipIcon
                IconName={DeleteForever}
                iconClassName="text-red-400 !size-4"
                tip="Clear All Notifications"
                onClick={handleDeleteAllNotifications}
              />
            )}
          </header>

          <NotificationsArray
            notifications={diffNotifications}
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
        className={clsx("space-y-2 divide-y divide-gray-100", {
          "overflow-y-auto overflow-x-hidden max-h-[32vh] scrollbar-hidden":
            isPopover,
        })}
      >
        {notifications.length <= 0 ? (
          <p className="text-sm text-gray-400 text-center my-5">
            No notifications yet...
          </p>
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

const NotificationTile = memo(({ notification, index }) => {
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

  // Extract company/sender info from notification object if it exists
  // Backend should include this data in the notification response
  const senderData = notification?.sender_data || {};
  const companyData = notification?.company_data || {};
  
  // Fallback to default values if data not provided by backend
  const companyName = companyData?.company_name || senderData?.company_name || "";
  const companySlug = companyData?.slug || senderData?.slug || "";
  const companyLogo = companyData?.logo || senderData?.logo || "/images/default-company-logo.png";
  const isVerified = companyData?.verify || senderData?.verify || false;

  return (
    <motion.div
      initial={{ x: 10, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
      className="flex items-stretch gap-2 pt-2"
    >
      <Avatar
        src={companyLogo}
        alt={companyName}
        size="sm"
        name={companyName}
        className={avatarStyle}
      />
      <div className="space-y-0 flex-1">
        <CompanyName
          slug={companySlug}
          name={companyName}
          verified={isVerified}
        />
        <Link
          to={
            notification?.link.replace("/room", "/?room_name=room")
            // .replace("/representatives", "/co/representatives")
          }
          onClick={handleMarkAsRead}
          className="text-[.825rem] !text-gray-600 leading-none block"
        >
          {notification?.message}{" "}
          {!notification?.is_read && (
            <Badge className="!text-[.55rem]">Unread</Badge>
          )}
        </Link>
        <div className="flex items-center gap-2">
          <small className="text-gray-400 text-[.69rem]">
            <TimeAgo time={notification?.timestamp} />
          </small>

          {!notification?.is_read && (
            <button
              onClick={handleMarkAsRead}
              className="text-xs disabled:cursor-not-allowed"
            >
              Mark as read
            </button>
          )}
        </div>
      </div>

      <ButtonWithTooltipIcon
        IconName={RemoveCircle}
        iconClassName="text-red-600 !size-3"
        onClick={handleDeleteNotification}
        tip="Remove notification"
      />
    </motion.div>
  );
});

export { NotificationPopOver, NotificationsArray };
