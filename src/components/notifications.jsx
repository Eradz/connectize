import {
  Avatar,
  Badge,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import { TrashIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { motion } from "framer-motion";
import { memo, useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteAllNotifications,
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api-services/notifications";
import { useCompanies, useNotifications, useUsers } from "../hooks";
import { Notification } from "../icon";
import { ButtonWithTooltipIcon } from "./admin/feeds/DiscoverPosts";
import CompanyName from "./company/CompanyName";
import CustomTabs from "./custom/tabs";
import { avatarStyle } from "./ResponsiveNav";
import SeeMoreLink from "./SeeMoreLink";
import { NotificationsSkeleton } from "./skeletons/notification";
import TimeAgo from "./TimeAgo";

const generalNotificationType = [
  "like",
  "comment",
  "reply",
  "follow",
  "bookmark",
  "favorite",
  "connection",
  "representation",
  "messaging",
];

const promotionsNotificationType = ["promotions", "announcement"];

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
  const { notifications, notificationLengthNotRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger>
        <button className="relative">
          <IndicatorBadge indicator={notificationLengthNotRead} floating />
          <Notification />
        </button>
      </PopoverTrigger>

      <PopoverContent className="mx-2 xs:!w-[350px] lg:!w-[400px]">
        <PopoverArrow />
        <NotificationItem isPopover />
      </PopoverContent>
    </Popover>
  );
};

export const NotificationItem = ({ isPopover = false }) => {
  const { notifications, notificationLengthNotRead, setNotifications } =
    useNotifications();
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { data: users, isLoading: usersLoading } = useUsers();

  const tabsHeader = ["General", "Promotions"];

  const diffNotifications = isPopover
    ? notifications.slice(0, 10)
    : notifications;

  const generalNotifications = useMemo(
    () =>
      diffNotifications?.filter((notification) =>
        generalNotificationType.includes(notification.notification_type)
      ),
    [diffNotifications]
  );

  const promotionsNotifications = useMemo(
    () =>
      diffNotifications?.filter((notification) =>
        promotionsNotificationType.includes(notification.notification_type)
      ),
    [diffNotifications]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllNotificationsAsRead();
  }, []);

  const handleDeleteAllNotifications = useCallback(async () => {
    setNotifications([]);
    await deleteAllNotifications();
  }, []);

  return (
    <>
      {companiesLoading || usersLoading ? (
        <NotificationsSkeleton />
      ) : (
        <section className={clsx("bg-white rounded-md p-3 space-y-2 w-full")}>
          <header className="flex justify-between items-center gap-2 border-b border-gray-100 pb-1">
            <h4 className="text-lg font-semibold flex items-center gap-1">
              <span>Notifications</span>
              <IndicatorBadge indicator={notifications?.length} />
            </h4>
            <div>
              {notificationLengthNotRead > 0 && (
                <button
                  className="text-black/90 bg-gold rounded-md hover:bg-opacity-60 transition-all duration-300 !text-xs disabled:cursor-not-allowed disabled:no-underline px-5 py-1"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifications.length > 0 && (
              <ButtonWithTooltipIcon
                IconName={TrashIcon}
                tip="Clear All Notifications"
                onClick={handleDeleteAllNotifications}
              />
            )}
          </header>

          <CustomTabs
            tabsHeading={tabsHeader}
            tabsPanels={[
              <NotificationsArray
                key="general"
                fallback="general"
                notifications={generalNotifications}
                companies={companies}
                users={users}
                isPopover={isPopover}
              />,
              <NotificationsArray
                key="promotions"
                notifications={promotionsNotifications}
                fallback="promotion"
                companies={companies}
                users={users}
                isPopover={isPopover}
              />,
            ]}
          />

          {isPopover && notifications.length > 10 && (
            <SeeMoreLink url="/co/notifications" />
          )}
        </section>
      )}
    </>
  );
};

const NotificationsArray = memo(
  ({ notifications, fallback, companies, users, isPopover }) => {
    return (
      <section
        className={clsx("space-y-2 divide-y divide-gray-100", {
          "overflow-y-auto overflow-x-hidden max-h-[55vh] scrollbar-hidden":
            isPopover,
        })}
      >
        {notifications.length <= 0 ? (
          <p className="text-sm text-gray-400 text-center my-5">
            No {fallback} notifications yet...
          </p>
        ) : (
          notifications?.map((notification, index) => {
            const user = users?.find(
              (user) => user?.id === notification?.sender
            );
            const company = companies?.results?.find(
              (company) => company?.profile === user?.email
            );
            return (
              <NotificationTile
                key={notification?.id}
                index={index}
                company={company}
                notification={notification}
              />
            );
          })
        )}
      </section>
    );
  }
);

const NotificationTile = memo(
  ({ notification, index, company, unReadNotificationLength }) => {
    const [read, setRead] = useState(notification?.is_read ? true : false);
    const { setNotifications } = useNotifications();

    const handleMarkAsRead = useCallback(async () => {
      if (read) return;

      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === notification.id
            ? { ...notif, is_read: new Date().toUTCString() }
            : notif
        )
      );

      setRead(true);
      await markNotificationAsRead(notification?.id);
    }, [read, notification?.id, setNotifications]);

    const handleDeleteNotification = useCallback(async () => {
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notification.id)
      );

      try {
        await deleteNotification(notification.id);
      } catch (error) {
        setNotifications((prev) => [...prev, notification]);
      }
    }, [notification.id, setNotifications]);

    return (
      <motion.div
        initial={{ x: 10, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ delay: index * 0.05 }}
        viewport={{ once: true }}
        className="flex items-stretch gap-2 pt-2"
      >
        <Avatar
          src={company?.logo || "/images/default-company-logo.png"}
          alt={company?.company_name}
          size="sm"
          name={company?.company_name}
          className={avatarStyle}
        />
        <div className="space-y-0 flex-1">
          <CompanyName
            name={company?.company_name}
            verified={company?.verify}
          />
          <Link
            to={notification?.link}
            onClick={handleMarkAsRead}
            className="text-[.825rem] !text-gray-600 leading-none block"
          >
            {notification?.message}{" "}
            <Badge className="!text-[.6rem]">
              {read || unReadNotificationLength === 0 ? "" : "Unread"}
            </Badge>
          </Link>
          <div className="flex items-center gap-2">
            <small className="text-gray-400 text-[.69rem]">
              <TimeAgo time={notification?.timestamp} />
            </small>

            {!read && unReadNotificationLength > 0 && (
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
          IconName={TrashIcon}
          onClick={handleDeleteNotification}
          tip="Remove notification"
        />
      </motion.div>
    );
  }
);

export { NotificationPopOver, NotificationsArray };

