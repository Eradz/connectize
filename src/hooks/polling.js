import { useEffect } from "react";
import { getNotificationsForUser } from "../api-services/notifications";
import { useCompaniesStore } from "../stores/companiesStore";
import { useMessagesStore } from "../stores/messagesStore";
import { useNotificationsStore } from "../stores/notificationsStore";
import { usePostsStore } from "../stores/postsStore";
import { useUsersStore } from "../stores/usersStore";

export const usePollPosts = (interval = 3000) => {
  const { posts, fetchPosts } = usePostsStore();

  useEffect(() => {
    let isCancelled = false;

    const poll = async () => {
      try {
        await fetchPosts();
      } catch (err) {
        console.error("Polling posts failed", err);
      }

      if (!isCancelled) {
        setTimeout(poll, interval);
      }
    };

    poll();
    return () => {
      isCancelled = true;
    };
  }, [interval]);

  return { posts };
};

export const usePollMessages = (interval = 1000, params = {}) => {
  const { messages, fetchMessages } = useMessagesStore();

  useEffect(() => {
    let isCancelled = false;

    const poll = async () => {
      try {
        await fetchMessages(params);
      } catch (error) {
        console.error("Polling messages failed", error);
      }

      if (!isCancelled) {
        setTimeout(poll, interval); // wait before retrying
      }
    };

    poll(); // initial fetch

    return () => {
      isCancelled = true;
    };
  }, [interval, JSON.stringify(params)]);

  return { messages };
};

export const usePollCompanies = (interval = 5000) => {
  const { companies, fetchCompanies } = useCompaniesStore();

  useEffect(() => {
    let isCancelled = false;

    const poll = async () => {
      try {
        await fetchCompanies();
      } catch (err) {
        console.error("Polling companies failed", err);
      }

      if (!isCancelled) {
        setTimeout(poll, interval);
      }
    };

    poll();

    return () => {
      isCancelled = true;
    };
  }, [interval]);

  return { companies };
};

export const usePollCurrentCompany = (interval = 5000) => {
  const { currentCompany, fetchCurrentCompany } = useCompaniesStore();

  useEffect(() => {
    let isCancelled = false;

    const poll = async () => {
      try {
        await fetchCurrentCompany();
      } catch (err) {
        console.error("Polling current company failed", err);
      }

      if (!isCancelled) {
        setTimeout(poll, interval);
      }
    };

    poll();

    return () => {
      isCancelled = true;
    };
  }, [interval]);

  return { currentCompany };
};

export const usePollUsers = (interval = 5000) => {
  const { users, fetchUsers } = useUsersStore();

  useEffect(() => {
    let isCancelled = false;

    const poll = async () => {
      try {
        await fetchUsers();
      } catch (err) {
        console.error("Polling users failed", err);
      }

      if (!isCancelled) {
        setTimeout(poll, interval);
      }
    };

    poll();

    return () => {
      isCancelled = true;
    };
  }, [interval]);

  return { users };
};

export const usePollUserById = (id, interval = 5000) => {
  const { selectedUser, fetchUserById } = useUsersStore();

  useEffect(() => {
    if (!id) return;

    let isCancelled = false;

    const poll = async () => {
      try {
        await fetchUserById(id);
      } catch (err) {
        console.error(`Polling user ${id} failed`, err);
      }

      if (!isCancelled) {
        setTimeout(poll, interval);
      }
    };

    poll();

    return () => {
      isCancelled = true;
    };
  }, [id, interval]);

  return { user: selectedUser };
};

export const usePollNotifications = (intervalMs = 10000) => {
  const setNotifications = useNotificationsStore((s) => s.setNotifications);

  useEffect(() => {
    let isCancelled = false;

    const poll = async () => {
      try {
        const data = await getNotificationsForUser();
        if (!isCancelled && Array.isArray(data)) {
          setNotifications(data);
        }
      } catch (err) {
        console.error("Polling notifications failed", err);
      }

      if (!isCancelled) {
        setTimeout(poll, intervalMs);
      }
    };

    poll();

    return () => {
      isCancelled = true;
    };
  }, [setNotifications, intervalMs]);

  const notifications = useNotificationsStore((s) => s.notifications);
  const unreadCount = useNotificationsStore((s) => s.unreadCount());

  return { notifications, unreadCount };
};
