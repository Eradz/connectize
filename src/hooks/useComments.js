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

export function useGetPostComments({ postId, page = 1 }, queryOpts = {}) {
  return useQuery({
    queryKey: ["comments", { postId, page }],
    queryFn: async () => {
      const comments = await fetchComments(postId, page);
      return comments;
    },
    ...queryOpts,
  });
}

