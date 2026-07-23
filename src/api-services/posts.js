import { toast } from "sonner";
import { makeApiRequest } from "../lib/helpers";

/**
 * Get all posts (Discover feed) - all published posts
 */
export const getPosts = async (page = 1, pageSize = 10) => {
  const cacheBust = Date.now();
  const response = await makeApiRequest({
    url: `api/posts/?page=${page}&page_size=${pageSize}&_=${cacheBust}`,
    method: "GET",
  });

  return {
    posts: response.results.filter((post) => post.status.toUpperCase() === "PUBLISHED"),
    count: response.count,
    next: response.next,
    previous: response.previous,
    hasMore: !!response.next,
    nextPage: page + 1
  };
};

/**
 * Get posts for a company profile - authored + reposted by the company (server-side filter)
 */
export const getCompanyPosts = async (companyId, page = 1, pageSize = 10) => {
  const response = await makeApiRequest({
    url: `api/posts/?company=${companyId}&page=${page}&page_size=${pageSize}`,
    method: "GET",
  });

  return {
    posts: response.results.filter((post) => post.status.toUpperCase() === "PUBLISHED"),
    count: response.count,
    next: response.next,
    previous: response.previous,
    hasMore: !!response.next,
    nextPage: page + 1
  };
};

/**
 * Get Following feed - posts authored or reposted by users/companies the user
 * follows. Fully server-side: the backend's `?feed=following` handles the
 * follow filtering, repost surfacing (reposts are first-class child posts
 * with `is_repost` + `parent_post`) and activity-bumped ordering, so no
 * client-side filtering is needed.
 * @param {number} page - Page number
 * @param {number} pageSize - Number of posts per page
 */
export const getFollowingPosts = async (page = 1, pageSize = 10) => {
  const response = await makeApiRequest({
    url: `api/posts/?feed=following&page=${page}&page_size=${pageSize}`,
    method: "GET",
  });

  return {
    posts: (response?.results || []).filter(
      (post) => post.status?.toUpperCase() === "PUBLISHED"
    ),
    count: response?.count ?? 0,
    next: response?.next ?? null,
    previous: response?.previous ?? null,
    hasMore: !!response?.next,
    nextPage: page + 1
  };
};

/**
 * Get Trending feed - engagement-ranked posts over a recent time window.
 * Fully server-side: the backend's `?feed=trending` handles the engagement
 * scoring and ordering (likes + comments + reposts), scoped to the last
 * `days` days, so no client-side sorting is needed.
 * @param {number} page - Page number
 * @param {number} pageSize - Number of posts per page
 * @param {number} days - Trending window in days (backend default: 7)
 */
export const getTrendingPosts = async (page = 1, pageSize = 10, days = 7) => {
  const response = await makeApiRequest({
    url: `api/posts/?feed=trending&days=${days}&page=${page}&page_size=${pageSize}`,
    method: "GET",
  });

  return {
    posts: (response?.results || []).filter(
      (post) => post.status?.toUpperCase() === "PUBLISHED"
    ),
    count: response?.count ?? 0,
    next: response?.next ?? null,
    previous: response?.previous ?? null,
    hasMore: !!response?.next,
    nextPage: page + 1
  };
};

export const getPostById = async (id) => {
  const post = await makeApiRequest({
    url: `api/posts/${id}/`,
    method: "GET",
  });

  return post;
};

export const getPostInsights = async (id, period = "30d") => {
  return await makeApiRequest({
    url: `api/posts/${id}/insights/?period=${encodeURIComponent(period)}`,
    method: "GET",
  });
};

export const getPostInsightActors = async (
  id,
  { type = "all", period = "30d", page = 1, pageSize = 20 } = {}
) => {
  const response = await makeApiRequest({
    url:
      `api/posts/${id}/insights/actors/?type=${encodeURIComponent(type)}` +
      `&period=${encodeURIComponent(period)}&page=${page}&page_size=${pageSize}`,
    method: "GET",
  });

  return {
    actors: response?.results || [],
    count: response?.count || 0,
    next: response?.next || null,
    previous: response?.previous || null,
    hasMore: !!response?.next,
    nextPage: page + 1,
  };
};

export const getPostUploadStatus = async (uploadId) => {
  if (!uploadId) return null;

  return await makeApiRequest({
    url: `api/posts/upload-status/`,
    method: "GET",
    params: { upload_id: uploadId },
  });
};

export const createPost = async (formData, companyId, options = {}) => {
  const post = await makeApiRequest({
    url: `api/posts/`,
    method: "POST",
    data: formData,
    contentType: "multipart/form-data",
    onUploadProgress: options.onUploadProgress,
  });

  return post;
};

export const editPost = async (id, body, postItem, options = {}) => {
  // When the editor passes a FormData (multipart) it already carries the body,
  // new image files and the removed_images list. Spreading it would drop all of
  // that, so send it through untouched — makeApiRequest sets the multipart
  // boundary for FormData automatically. Plain objects keep the JSON behaviour.
  const isFormData =
    typeof FormData !== "undefined" && postItem instanceof FormData;

  let data;
  if (isFormData) {
    if (body != null && !postItem.has("body")) {
      postItem.append("body", body);
    }
    data = postItem;
  } else {
    data = { ...postItem, body };
  }

  const post = await makeApiRequest({
    url: `api/posts/${id}/`,
    method: "PUT",
    data,
    onUploadProgress: options.onUploadProgress,
  });

  return post;
};

export const deletePost = async (id) => {
  const post = await makeApiRequest({
    url: `api/posts/${id}/`,
    method: "DELETE",
  });

  return post;
};

export const likePost = async (id, data, hasLikedPost) => {
  // makeApiRequest resolves with the response data on any 2xx (including the
  // idempotent "already liked/unliked" 200) and returns null on failure, so
  // surface the result to callers instead of swallowing it.
  return await makeApiRequest({
    url: `api/posts/${id}/${hasLikedPost ? "unlike" : "like"}/`,
    method: "POST",
  });
};

export const repostPost = async (
  id,
  { comment = "", companyId = null, mentions = [], companyMentions = [] } = {}
) => {
  const result = await makeApiRequest({
    url: `api/posts/${id}/repost/`,
    method: "POST",
    data: {
      comment,
      mentions, // User mentions (quote reposts only)
      company_mentions: companyMentions, // Company mentions (quote reposts only)
      ...(companyId ? { company_id: companyId } : {}),
    },
  });

  return result;
};

export const unrepostPost = async (id, companyId = null) => {
  const result = await makeApiRequest({
    url: `api/posts/${id}/unrepost/`,
    method: "POST",
    data: companyId ? { company_id: companyId } : {},
  });

  return result;
};

export const getPostReposts = async (id, page = 1) => {
  const result = await makeApiRequest({
    url: `api/posts/${id}/reposts/?page=${page}`,
    method: "GET",
  });

  return result;
};

export const commentOnPost = async (id, comment, mentions = [], companyMentions = [], commentAsCompanyId = null) => {
  const result = await makeApiRequest({
    url: `api/posts/${id}/comment/`,
    method: "POST",
    data: { 
      comment,
      company_id: commentAsCompanyId, // Pass company_id only if commenting as company (null otherwise)
      mentions, // User mentions
      company_mentions: companyMentions // Company mentions
    },
  });

  return result;
};

export const replyToComment = async (commentId, content, mentions = [], companyMentions = [], parentReplyId = null, replyAsCompanyId = null) => {
  const result = await makeApiRequest({
    url: `api/comments/${commentId}/reply/`,
    method: "POST",
    data: {
      content,
      mentions,
      company_mentions: companyMentions,
      parent_reply_id: parentReplyId,  // NEW: For nested replies
      company_id: replyAsCompanyId,
    },
  });

  return result;
};

export const updateComment = async (commentId, content) => {
  const result = await makeApiRequest({
    url: `api/comments/${commentId}/`,
    method: "PATCH",
    data: { content },
  });

  return result;
};

export const deleteComment = async (commentId) => {
  const result = await makeApiRequest({
    url: `api/comments/${commentId}/`,
    method: "DELETE",
  });

  return result;
};

export const updateReply = async (replyId, content) => {
  const result = await makeApiRequest({
    url: `api/replies/${replyId}/`,
    method: "PATCH",
    data: { content },
  });

  return result;
};

export const deleteReply = async (replyId) => {
  const result = await makeApiRequest({
    url: `api/replies/${replyId}/`,
    method: "DELETE",
  });

  return result;
};

export const likeComment = async (commentId, hasLiked = false, companyId = null) => {
  const url = hasLiked 
    ? `api/comments/${commentId}/unlike/`
    : `api/comments/${commentId}/like/`;
    
  const result = await makeApiRequest({
    url,
    method: "POST",
    data: companyId ? { company_id: companyId } : {},
  });

  return result;
};

export const likeReply = async (replyId, hasLiked = false, companyId = null) => {
  const url = hasLiked 
    ? `api/replies/${replyId}/unlike/`
    : `api/replies/${replyId}/like/`;
    
  const result = await makeApiRequest({
    url,
    method: "POST",
    data: companyId ? { company_id: companyId } : {},
  });

  return result;
};
