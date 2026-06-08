/**
 * GlobalPrefetch - Prefetches key data in the background when user logs in
 * 
 * This component runs once when the app loads with an authenticated user
 * and prefetches commonly accessed data so it's ready instantly when needed.
 */

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/userContext";
import { getMessagesForUser, getFavoriteChats } from "../api-services/messaging";
import { getAllCompanies } from "../api-services/companies";
import { getAllRepresentatives } from "../api-services/representatives";
import { getPosts } from "../api-services/posts";
import useMessagingWebSocket from "../hooks/useMessagingWebSocket";
import { useMessagesStore } from "../stores/messagesStore";

/**
 * Prefetch configuration
 * - Delay prevents blocking initial render
 * - staleTime keeps data fresh for 5 minutes
 */
const PREFETCH_DELAY = 500; // 500ms after login - faster for posts
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function GlobalPrefetch() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const hasPrefetched = useRef(false);
  useMessagingWebSocket({ enabled: Boolean(user) && !loading });
  
  // Get store actions for messages (uses Zustand)
  const fetchLastMessages = useMessagesStore((state) => state.getLastMessages);
  const lastMessages = useMessagesStore((state) => state.lastMessages);

  useEffect(() => {
    // Only prefetch once when user is authenticated
    if (loading || !user || hasPrefetched.current) return;
    
    hasPrefetched.current = true;

    // Delay prefetch to not block initial render
    const timeoutId = setTimeout(() => {
      console.log("🚀 [GlobalPrefetch] Starting background data prefetch...");

      // 1. Prefetch posts FIRST (most important - the feed)
      queryClient.prefetchInfiniteQuery({
        queryKey: ["posts"],
        initialPageParam: 1,
        queryFn: ({ pageParam }) => getPosts(pageParam, 10),
        getNextPageParam: (lastPage) => 
          lastPage.hasMore ? lastPage.nextPage : undefined,
        staleTime: 30 * 1000, // 30 seconds
      }).then(() => {
        console.log("✅ [GlobalPrefetch] Posts prefetched");
      }).catch((err) => {
        console.error("❌ [GlobalPrefetch] Posts prefetch failed:", err);
      });

      // 2. Prefetch messages (uses Zustand store)
      if (lastMessages.length === 0) {
        fetchLastMessages().then(() => {
          console.log("✅ [GlobalPrefetch] Messages prefetched");
        });
      }

      // 3. Prefetch companies (first page) - lower priority
      queryClient.prefetchInfiniteQuery({
        queryKey: ["companies", "all", { sortBy: "company_name" }],
        initialPageParam: 1,
        queryFn: async ({ pageParam }) => {
          const res = await getAllCompanies({
            page_size: 12,
            page: pageParam,
            ordering: "company_name",
          }, true);
          return res;
        },
        staleTime: STALE_TIME,
        pages: 1, // Only prefetch first page
      }).then(() => {
        console.log("✅ [GlobalPrefetch] Companies prefetched");
      });

      // 4. Prefetch representatives (first page) - lower priority
      queryClient.prefetchInfiniteQuery({
        queryKey: ["representatives", "all", { company: undefined, user: undefined }],
        initialPageParam: 1,
        queryFn: async ({ pageParam }) => {
          const res = await getAllRepresentatives({
            page_size: 12,
            page: pageParam,
          }, true);
          return res;
        },
        staleTime: STALE_TIME,
        pages: 1,
      }).then(() => {
        console.log("✅ [GlobalPrefetch] Representatives prefetched");
      });

      console.log("🏁 [GlobalPrefetch] All prefetch requests initiated");
    }, PREFETCH_DELAY);

    return () => clearTimeout(timeoutId);
  }, [user, loading, queryClient, fetchLastMessages, lastMessages.length]);

  // This component doesn't render anything
  return null;
}

export default GlobalPrefetch;
