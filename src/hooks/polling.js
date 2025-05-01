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
    fetchPosts();
    const id = setInterval(fetchPosts, interval);
    return () => clearInterval(id);
  }, []);

  return { posts };
};

export const usePollMessages = (interval = 1000, params = {}) => {
  const { messages, fetchMessages } = useMessagesStore();

  useEffect(() => {
    const poll = async () => {
      try {
        await fetchMessages(params);
      } catch (error) {
        console.error("Error sending message", error);
      }
    };

    poll();
    let id = setInterval(poll, interval);

    return () => {
    
    clearInterval(id);
    };
  }, [interval, JSON.stringify(params)]);

  return { messages };
};

export const usePollCompanies = () => {
  const { companies, fetchCompanies } = useCompaniesStore();

  useEffect(() => {
    fetchCompanies();
  }, []);

  return { companies };
};

export const usePollCurrentCompany = () => {
  const { currentCompany, fetchCurrentCompany } = useCompaniesStore();

  useEffect(() => {
    fetchCurrentCompany();
  }, []);

  return { currentCompany };
};

export const usePollUsers = () => {
  const { users, fetchUsers } = useUsersStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users };
};

export const usePollUserById = (id) => {
  const { selectedUser, fetchUserById } = useUsersStore();

  useEffect(() => {
    if (id) fetchUserById(id);
  }, [id]);

  return { user: selectedUser };
};

export const usePollNotifications = (intervalMs = 10000) => {
  const setNotifications = useNotificationsStore(
    (state) => state.setNotifications
  );

  useEffect(() => {
    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        const data = await getNotificationsForUser();
        if (isMounted && Array.isArray(data)) {
          setNotifications(data);
        }
      } catch (err) {
        console.error("Polling notifications failed", err);
      }
    };

    fetchNotifications(); // initial load
    const interval = setInterval(fetchNotifications, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [setNotifications, intervalMs]);

  const notifications = useNotificationsStore((state) => state.notifications);
  const unreadCount = useNotificationsStore((state) => state.unreadCount());

  return { notifications, unreadCount };
};
