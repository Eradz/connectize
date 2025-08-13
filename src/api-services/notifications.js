import { makeApiRequest } from "../lib/helpers";

export const getNotificationsForUser = async () => {
  const { results: notifications } = await makeApiRequest({
    url: "api/notifications/",
    method: "GET",
  });

  return notifications || [];
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

// Create/send a notification
// Supports:
// - recipient_type === 'all' -> POST /api/notifications/send-notifications-to-all-users/
// - recipient_type === 'specific' with recipient_id or user_ids -> POST /api/notifications/send-notification-to-selected-users/
// - fallback -> POST /api/notifications/ (requires "user" and sets notification_type="announcement")
export const createNotification = async (formData = {}) => {
  const {
    title,
    message,
    action_url,
    action_text,
    expires_at,
    recipient_type,
    recipient_id,
    user_ids,
    type, // optional, for UI only
    priority, // optional, for UI only
  } = formData || {};

  // Map to backend fields
  const basePayload = {
    title: title || '',
    message: message || '',
    link: action_url || null,
  };

  // Send to all users
  if (recipient_type === 'all') {
    return await makeApiRequest({
      url: 'api/notifications/send-notifications-to-all-users/',
      method: 'POST',
      data: basePayload,
    });
  }

  // Send to specific users (single or multiple)
  if (recipient_type === 'specific') {
    const ids = Array.isArray(user_ids)
      ? user_ids
      : (recipient_id ? [recipient_id] : []);
    if (!ids.length) {
      throw new Error('No recipient selected. Please provide recipient_id or user_ids.');
    }
    return await makeApiRequest({
      url: 'api/notifications/send-notification-to-selected-users/',
      method: 'POST',
      data: { ...basePayload, user_ids: ids },
    });
  }

  // Fallback: create a single notification via ModelViewSet (must include user id)
  if (recipient_id) {
    const payload = {
      ...basePayload,
      user: recipient_id,
      notification_type: 'announcement',
      // Pack extra UI-only fields into extra_data for auditing
      extra_data: {
        action_text: action_text || null,
        expires_at: expires_at || null,
        ui_type: type || null,
        ui_priority: priority || null,
      },
    };
    return await makeApiRequest({
      url: 'api/notifications/',
      method: 'POST',
      data: payload,
    });
  }

  throw new Error('Unsupported recipient_type. Use "all" or "specific", or provide recipient_id.');
};
