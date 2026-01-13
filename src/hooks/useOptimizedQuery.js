/**
 * Optimized query hooks with instant display and background prefetching
 * 
 * This module provides hooks that:
 * 1. Show data instantly from cache (no loading spinners)
 * 2. Prefetch data in the background
 * 3. Update cache silently when new data arrives
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Default cache configuration for instant loading
 */
export const INSTANT_CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
  gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  refetchOnWindowFocus: false, // Don't refetch on tab switch
  refetchOnMount: false, // Use cache on mount
  retry: 1, // Only retry once
};

/**
 * Aggressive cache configuration for rarely changing data
 */
export const STATIC_CACHE_CONFIG = {
  staleTime: 30 * 60 * 1000, // Data stays fresh for 30 minutes
  gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: 1,
};

/**
 * Hook for prefetching data in the background
 * Call this early (e.g., on hover, or when parent component mounts)
 */
export function usePrefetch(queryKey, queryFn, options = {}) {
  const queryClient = useQueryClient();

  const prefetch = () => {
    queryClient.prefetchQuery({
      queryKey,
      queryFn,
      ...INSTANT_CACHE_CONFIG,
      ...options,
    });
  };

  return { prefetch };
}

/**
 * Hook that prefetches on mount - useful for child routes or modals
 */
export function usePrefetchOnMount(queryKey, queryFn, options = {}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey,
      queryFn,
      ...INSTANT_CACHE_CONFIG,
      ...options,
    });
  }, [queryClient, queryKey.join(',')]);
}

/**
 * Optimized query hook with instant loading from cache
 * Shows cached data immediately, then updates in background
 */
export function useOptimizedQuery(queryKey, queryFn, options = {}) {
  return useQuery({
    queryKey,
    queryFn,
    ...INSTANT_CACHE_CONFIG,
    // Enable placeholder data from cache while fetching
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

/**
 * Hook for data that rarely changes (categories, types, etc.)
 */
export function useStaticQuery(queryKey, queryFn, options = {}) {
  return useQuery({
    queryKey,
    queryFn,
    ...STATIC_CACHE_CONFIG,
    ...options,
  });
}

/**
 * Hook for prefetching related data when user hovers
 * Example: Prefetch company details when hovering over company card
 */
export function useHoverPrefetch(queryKey, queryFn) {
  const queryClient = useQueryClient();

  const onMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey,
      queryFn,
      ...INSTANT_CACHE_CONFIG,
    });
  };

  return { onMouseEnter };
}

/**
 * Hook for warming up the cache with initial data
 * Call this in parent components to prefetch child data
 */
export function useWarmCache() {
  const queryClient = useQueryClient();

  const warmCache = (queryKey, data) => {
    queryClient.setQueryData(queryKey, data);
  };

  const prefetchMany = (queries) => {
    queries.forEach(({ queryKey, queryFn }) => {
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
        ...INSTANT_CACHE_CONFIG,
      });
    });
  };

  return { warmCache, prefetchMany };
}

export default useOptimizedQuery;
