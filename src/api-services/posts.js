import { toast } from "sonner";
import { makeApiRequest } from "../lib/helpers";
import { getCompanyByIdOrEmail } from "./companies";

/**
 * Get all posts (Discover feed) - all published posts
 */
export const getPosts = async (page = 1, pageSize = 10) => {
  const response = await makeApiRequest({
    url: `api/posts/?page=${page}&page_size=${pageSize}`,
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
 * Get Following feed - posts from users/companies the user follows
 * @param {number} page - Page number
 * @param {number} pageSize - Number of posts per page  
 * @param {Array} followingIds - Array of following objects {type, id}
 */
export const getFollowingPosts = async (page = 1, pageSize = 10, followingIds = []) => {
  // Get all posts first
  const response = await makeApiRequest({
    url: `api/posts/?page=${page}&page_size=${pageSize}`,
    method: "GET",
  });

  // Filter posts to only include those from followed users/companies
  const followedUserIds = followingIds
    .filter(f => f.type === 'user')
    .map(f => f.id);
  const followedCompanyIds = followingIds
    .filter(f => f.type === 'company')
    .map(f => f.id);

  const filteredPosts = response.results
    .filter((post) => post.status.toUpperCase() === "PUBLISHED")
    .filter((post) => {
      // Check if the post is from a followed user
      const isFromFollowedUser = post.user?.id && followedUserIds.includes(post.user.id);
      // Check if the post is from a followed company  
      const isFromFollowedCompany = post.company?.id && followedCompanyIds.includes(post.company.id);
      
      return isFromFollowedUser || isFromFollowedCompany;
    });

  return {
    posts: filteredPosts,
    count: filteredPosts.length,
    next: response.next,
    previous: response.previous,
    hasMore: !!response.next,
    nextPage: page + 1
  };
};

/**
 * Get Trending posts - posts sorted by engagement (likes + comments)
 * @param {number} page - Page number
 * @param {number} pageSize - Number of posts per page
 */
export const getTrendingPosts = async (page = 1, pageSize = 10) => {
  // Try to use ordering parameter if backend supports it
  // Otherwise fetch and sort client-side
  const response = await makeApiRequest({
    url: `api/posts/?page=${page}&page_size=${pageSize}&ordering=-likes_count,-comments_count`,
    method: "GET",
  });

  let posts = response.results.filter((post) => post.status.toUpperCase() === "PUBLISHED");
  
  // Sort by engagement (likes + comments) client-side as fallback
  posts = posts.sort((a, b) => {
    const aEngagement = (a.numberOfLikes || 0) + (a.numberOfComments || 0);
    const bEngagement = (b.numberOfLikes || 0) + (b.numberOfComments || 0);
    return bEngagement - aEngagement;
  });

  return {
    posts,
    count: response.count,
    next: response.next,
    previous: response.previous,
    hasMore: !!response.next,
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

export const createPost = async (formData, companyId) => {
  // If companyId is provided and already in formData, use it directly
  // Otherwise fall back to fetching the user's first company
  if (!companyId && !formData.get?.("company")) {
    const companies = await getCompanyByIdOrEmail();
    const company = companies?.[0];

    if (!company) {
      toast.info(
        "You have no company associated with your profile, please create one"
      );
      return;
    }
    formData.append("company", company?.id);
  }

  const post = await makeApiRequest({
    url: `api/posts/`,
    method: "POST",
    data: formData,
    contentType: "multipart/form-data",
  });

  return post;
};

export const editPost = async (id, body, postItem) => {
  const post = await makeApiRequest({
    url: `api/posts/${id}/`,
    method: "PUT",
    data: {
      body,
      ...postItem,
    },
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
  if (hasLikedPost) {
    await makeApiRequest({
      url: `api/posts/${id}/unlike/`,
      method: "POST",
    });

    return;
  }
  await makeApiRequest({
    url: `api/posts/${id}/like/`,
    method: "POST",
  });
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

export const replyToComment = async (commentId, content, mentions = [], companyMentions = [], parentReplyId = null) => {
  const result = await makeApiRequest({
    url: `api/comments/${commentId}/reply/`,
    method: "POST",
    data: {
      content,
      mentions,
      company_mentions: companyMentions,
      parent_reply_id: parentReplyId  // NEW: For nested replies
    },
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
