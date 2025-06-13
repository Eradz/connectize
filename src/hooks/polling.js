import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { getAllCompanies } from "../api-services/companies";
import { getNotificationsForUser } from "../api-services/notifications";
import { getProducts } from "../api-services/products";
import { getServices } from "../api-services/services";
import { useCompaniesStore } from "../stores/companiesStore";
import { useMessagesStore } from "../stores/messagesStore";
import { useNotificationsStore } from "../stores/notificationsStore";
import { usePostsStore } from "../stores/postsStore";
import { useUsersStore } from "../stores/usersStore";

export const useSafePoll = (callback, interval, deps = []) => {
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;

    const poll = async () => {
      try {
        await callback();
      } catch (err) {
        console.error("Polling failed", err);
      }

      if (!cancelled.current) {
        setTimeout(poll, interval);
      }
    };

    poll();

    return () => {
      cancelled.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, ...deps]);
};

const tenMinutesInterval = 60000 * 10;
const fiveMinutesInterval = 60000 * 5;
const threeMinutesInterval = 60000 * 3;

export const usePollPosts = (interval = threeMinutesInterval) => {
  const { posts, fetchPosts, loading } = usePostsStore();

  useSafePoll(fetchPosts, interval);

  return { posts, loading };
};

export const usePollMessages = (interval = 1000, params = {}) => {
  const { messages, fetchMessages } = useMessagesStore();

  useSafePoll(() => fetchMessages(params), interval, [JSON.stringify(params)]);

  return { messages };
};

export const usePollCompanies = (interval = tenMinutesInterval) => {
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

export const usePollCurrentCompany = (interval = threeMinutesInterval) => {
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

export const usePollAllCompanies = (interval = tenMinutesInterval) => {
  return useQuery({
    queryKey: ["allConnectizeCompanies"],
    queryFn: getAllCompanies,
    refetchInterval: interval,
  });
};

export const usePollUsers = (interval = tenMinutesInterval) => {
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

export const usePollNotifications = (intervalMs = 5000) => {
  const setNotifications = useNotificationsStore((s) => s.setNotifications);

  const fetch = async () => {
    const data = await getNotificationsForUser();
    if (Array.isArray(data)) setNotifications(data);
  };

  useSafePoll(fetch, intervalMs);

  const notifications = useNotificationsStore((s) => s.notifications);
  const unreadCount = useNotificationsStore((s) => s.unreadCount());

  return { notifications, unreadCount };
};

export const usePollProducts = (refetchInterval = fiveMinutesInterval) => {
  return useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    refetchInterval,
  });
};

export const usePollServices = (refetchInterval = fiveMinutesInterval) => {
  return useQuery({
    queryKey: ["services"],
    queryFn: getServices,
    refetchInterval,
  });
};
