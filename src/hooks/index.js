import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  getAllCompanies,
  getCompanyByIdOrEmail,
} from "../api-services/companies";
import { getMessagesForUser } from "../api-services/messaging";
import { getNotificationsForUser } from "../api-services/notifications";
import { getAllUsers, getUserById } from "../api-services/users";
import { useAuth } from "../context/userContext";
import useWebSocket from "./useWebSocket";

export const messagesQueryKey = ["messages"];

export const useNotifications = () => {
  const { messages } = useWebSocket("notifications");
  const { user: currentUser } = useAuth();

  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotificationsForUser,
    enabled: !!currentUser,
  });

  const newNotifications = useMemo(() => {
    const allNotifications = [...messages, ...(notificationsData || [])];
    // const uniqueNotifications = allNotifications.reduce((acc, notification) => {
    //   if (!acc.some((n) => n.message === notification.message)) {
    //     acc.push(notification);
    //   }
    //   return acc;
    // }, []);
    // return uniqueNotifications;

    return allNotifications;
  }, [messages, notificationsData]);

  const [notifications, setNotifications] = useState(newNotifications);

  const notificationLengthNotRead = useMemo(
    () =>
      notifications?.filter((notification) => notification?.is_read === null)
        ?.length || 0,
    [notifications]
  );

  useEffect(() => {
    setNotifications(newNotifications);
  }, [newNotifications]);

  return { notifications, notificationLengthNotRead, setNotifications };
};

export const useCompanies = () => {
  const { user: currentUser } = useAuth();
  return useQuery({
    queryKey: ["allConnectizeCompanies"],
    queryFn: getAllCompanies,
    enabled: !!currentUser,
  });
};

export const useGetSingleUser = (id) => {
  const { user: currentUser } = useAuth();

  return useQuery({
    queryKey: ["users", id],
    queryFn: () => getUserById(id),
    enabled: !!currentUser,
  });
};
export const useUsers = () => {
  const { user: currentUser } = useAuth();
  return useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    enabled: !!currentUser,
  });
};

export const useGetCurrentCompany = () => {
  const { user: currentUser } = useAuth();
  return useQuery({
    queryKey: ["companies"],
    queryFn: () => getCompanyByIdOrEmail(),
    enabled: !!currentUser,
  });
};

export const useGetMessages = () => {
  const { user: currentUser } = useAuth();
  return useQuery({
    queryKey: messagesQueryKey,
    queryFn: getMessagesForUser,
    enabled: !!currentUser,
  });
};
