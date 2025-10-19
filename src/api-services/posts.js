import { toast } from "sonner";
import { makeApiRequest } from "../lib/helpers";
import { getCompanyByIdOrEmail } from "./companies";

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

export const getPostById = async (id) => {
  const post = await makeApiRequest({
    url: `api/posts/${id}/`,
    method: "GET",
  });

  return post;
};

export const createPost = async (formData) => {
  const companies = await getCompanyByIdOrEmail();
  const company = companies?.[0];

  formData.append("company", company?.id);

  if (!company) {
    toast.info(
      "You have no company associated with your profile, please create one"
    );
    return;
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

export const replyToComment = async (commentId, content, mentions = [], companyMentions = []) => {
  const result = await makeApiRequest({
    url: `api/comments/${commentId}/reply/`,
    method: "POST",
    data: {
      content,
      mentions,
      company_mentions: companyMentions
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
