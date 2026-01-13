import { useInfiniteQuery } from "@tanstack/react-query";

/**
 * Optimized pagination hook with smart caching
 * - Data is cached for 5 minutes by default (staleTime)
 * - Cache is kept for 10 minutes (gcTime)
 * - No refetch on window focus or mount (uses cache)
 */
export const usePageination = (
  {
    queryKey,
    queryFn,
    initialPageParam = 1,
    staleTime = 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime = 10 * 60 * 1000, // 10 minutes - keep in cache
    refetchOnWindowFocus = false,
    refetchOnMount = false,
  } = {},
  { enabled = true } = {},
) => {
  return useInfiniteQuery({
    queryKey,
    initialPageParam,
    queryFn,
    enabled,
    staleTime, // ✅ Data won't refetch for 5 minutes
    gcTime, // ✅ Keep in cache for 10 minutes
    refetchOnWindowFocus, // ✅ Don't refetch when tab becomes active
    refetchOnMount, // ✅ Use cached data on mount
    retry: 2,
    retryDelay: 1000,
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.next) return;

      const lastPageUrl = new URL(lastPage.next);

      let nextPage = lastPageUrl.searchParams.get("page");

      if (!nextPage) return;
      let nextPageAsNumber = parseInt(nextPage);

      if (!nextPageAsNumber) return;

      return nextPageAsNumber;
    },
  });
};
