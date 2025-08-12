import { useQuery } from "@tanstack/react-query";
import { makeApiRequest } from "../lib/helpers";

async function fetchComments(postId) {
  const { results } = await makeApiRequest({
    url: `api/posts/${postId}/comments/`,
    method: "GET",
  });

  return results || [];
}
export function useGetPostComments({ postId }, queryOpts = {}) {
  return useQuery({
    queryKey: ["comments", { postId }],
    queryFn: async () => {
      const comments = await fetchComments(postId);

      return comments;
    },
    ...queryOpts,
  });
}
