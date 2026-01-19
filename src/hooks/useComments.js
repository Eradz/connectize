import { useQuery } from "@tanstack/react-query";
import { makeApiRequest } from "../lib/helpers";

async function fetchComments(postId, page = 1) {
  const data = await makeApiRequest({
    url: `api/posts/${postId}/comments/?page=${page}`,
    method: "GET",
  });

  return {
    results: data.results || [],
    count: data.count || 0,
    next: data.next,
    previous: data.previous,
    hasMore: !!data.next
  };
}

// export function useGetPostComments({ postId, page = 1 }, queryOpts = {}) {
//   return useQuery({
//     queryKey: ["comments", postId, page], 
//     queryFn: () => fetchComments(postId, page), 
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000, 
//     ...queryOpts,
//   });
// }

export function useGetPostComments({ postId, page = 1 }, queryOpts = {}) {
  return useQuery({
    queryKey: ["comments", postId, page],
    queryFn: async () => {
      const startTime = performance.now();
      const data = await fetchComments(postId, page);
      const endTime = performance.now();
      
      console.log(`Comment fetch for post ${postId} took ${endTime - startTime}ms`);
      return data;
    },
    // ✅ Smart caching defaults
    staleTime: 30 * 1000, // 30 seconds - comments stay fresh
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    ...queryOpts,
  });
}
