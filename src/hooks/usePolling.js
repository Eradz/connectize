import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllCompanies, getSingleCompany } from "../api-services/companies";
import { getMessagesForUser } from "../api-services/messaging";
import { getNotificationsForUser } from "../api-services/notifications";
import { getPosts } from "../api-services/posts";
import { getProducts } from "../api-services/products";
import { getServices } from "../api-services/services";
import { useCompaniesStore } from "../stores/companiesStore";
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
    if (interval > 1000) poll();

    return () => {
      cancelled.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, ...deps]);
};

export const usePollPosts = (interval = 10000000) => {
  return useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
    refetchInterval: interval,
  });
};

export const usePollMessages = (interval = 2000) => {
  const [searchParams] = useSearchParams();
  const room_name = searchParams.get("room_name");
  return useQuery({
    queryKey: ["messages", room_name],
    queryFn: () => getMessagesForUser({ room_name }),
    enabled: !!room_name,
    refetchInterval: interval,
  });
};

export const usePollCompanies = (interval = 0) => {
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

export const usePollCurrentCompany = (companyName, interval = 0) => {
  return useQuery({
    queryKey: ["companies", companyName],
    queryFn: () => getSingleCompany(companyName?.replaceAll(" ", "-")),
    enabled: !!companyName,
  });
};

export const usePollAllCompanies = (interval = 0) => {
  return useQuery({
    queryKey: ["allConnectizeCompanies"],
    queryFn: getAllCompanies,
    // refetchInterval: interval,
  });
};

export const usePollUsers = (interval = 0) => {
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

export const usePollUserById = (id, interval = 0) => {
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

export const usePollNotifications = (intervalMs = 3000) => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotificationsForUser,
    refetchInterval: intervalMs,
  });
};

export const usePollProducts = (refetchInterval = 0) => {
  return useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    // refetchInterval,
  });
};

export const usePollServices = (refetchInterval = 0) => {
  return useQuery({
    queryKey: ["services"],
    queryFn: getServices,
    // refetchInterval,
  });
};
