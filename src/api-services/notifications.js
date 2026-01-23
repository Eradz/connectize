import { makeApiRequest } from "../lib/helpers";

export const getNotificationsForUser = async () => {
  try {
    const response = await makeApiRequest({
      url: "api/notifications/",
      method: "GET",
    });

    // Handle different response formats
    const notifications = response?.results || response?.data || response;
    return Array.isArray(notifications) ? notifications : [];
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId) => {
  const notifications = await makeApiRequest({
    url: `api/notifications/${notificationId}/mark-as-read/`,
    method: "POST",
  });

  return notifications;
};
export const markAllNotificationsAsRead = async () => {
  const notifications = await makeApiRequest({
    url: "api/notifications/mark-all-as-read/",
    method: "POST",
  });

  // window.location.reload();

  return notifications;
};

export const deleteNotification = async (notificationId) => {
  const notifications = await makeApiRequest({
    url: `api/notifications/${notificationId}/delete/`,
    method: "POST",
  });

  return notifications;
};
export const deleteAllNotifications = async () => {
  const notifications = await makeApiRequest({
    url: "api/notifications/delete-all/",
    method: "POST",
  });

  // window.location.reload();

  return notifications;
};
