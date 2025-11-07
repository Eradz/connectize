import api from './crud';

const KNOWLEDGE_BASE_URL = '/api/v1/knowledge';

export const knowledgeHubAPI = {
  // Categories
  getCategories: (params = {}) => api.get(`${KNOWLEDGE_BASE_URL}/categories/`, { params }),
  getCategory: (id) => api.get(`${KNOWLEDGE_BASE_URL}/categories/${id}/`),
  createCategory: (data) => api.post(`${KNOWLEDGE_BASE_URL}/categories/`, data),
  updateCategory: (id, data) => api.put(`${KNOWLEDGE_BASE_URL}/categories/${id}/`, data),
  deleteCategory: (id) => api.delete(`${KNOWLEDGE_BASE_URL}/categories/${id}/`),

  // Tags
  getTags: (params = {}) => api.get(`${KNOWLEDGE_BASE_URL}/tags/`, { params }),
  getTag: (id) => api.get(`${KNOWLEDGE_BASE_URL}/tags/${id}/`),
  createTag: (data) => api.post(`${KNOWLEDGE_BASE_URL}/tags/`, data),
  updateTag: (id, data) => api.put(`${KNOWLEDGE_BASE_URL}/tags/${id}/`, data),
  deleteTag: (id) => api.delete(`${KNOWLEDGE_BASE_URL}/tags/${id}/`),

  // Articles
  getArticles: (params = {}) => api.get(`${KNOWLEDGE_BASE_URL}/articles/`, { params }),
  getArticle: (id) => api.get(`${KNOWLEDGE_BASE_URL}/articles/${id}/`),
  createArticle: (data) => api.post(`${KNOWLEDGE_BASE_URL}/articles/`, data),
  updateArticle: (id, data) => api.put(`${KNOWLEDGE_BASE_URL}/articles/${id}/`, data),
  deleteArticle: (id) => api.delete(`${KNOWLEDGE_BASE_URL}/articles/${id}/`),
  publishArticle: (id) => api.post(`${KNOWLEDGE_BASE_URL}/articles/${id}/publish/`),
  unpublishArticle: (id) => api.post(`${KNOWLEDGE_BASE_URL}/articles/${id}/unpublish/`),

  // Forums
  getForums: (params = {}) => api.get(`${KNOWLEDGE_BASE_URL}/forums/`, { params }),
  getForum: (id) => api.get(`${KNOWLEDGE_BASE_URL}/forums/${id}/`),
  createForum: (data) => api.post(`${KNOWLEDGE_BASE_URL}/forums/`, data),
  updateForum: (id, data) => api.put(`${KNOWLEDGE_BASE_URL}/forums/${id}/`, data),
  deleteForum: (id) => api.delete(`${KNOWLEDGE_BASE_URL}/forums/${id}/`),

  // Forum Topics
  getTopics: (params = {}) => api.get(`${KNOWLEDGE_BASE_URL}/topics/`, { params }),
  getTopic: (id) => api.get(`${KNOWLEDGE_BASE_URL}/topics/${id}/`),
  createTopic: (data) => api.post(`${KNOWLEDGE_BASE_URL}/topics/`, data),
  updateTopic: (id, data) => api.put(`${KNOWLEDGE_BASE_URL}/topics/${id}/`, data),
  deleteTopic: (id) => api.delete(`${KNOWLEDGE_BASE_URL}/topics/${id}/`),

  // Forum Posts
  getPosts: (params = {}) => api.get(`${KNOWLEDGE_BASE_URL}/posts/`, { params }),
  getPost: (id) => api.get(`${KNOWLEDGE_BASE_URL}/posts/${id}/`),
  createPost: (data) => api.post(`${KNOWLEDGE_BASE_URL}/posts/`, data),
  updatePost: (id, data) => api.put(`${KNOWLEDGE_BASE_URL}/posts/${id}/`, data),
  deletePost: (id) => api.delete(`${KNOWLEDGE_BASE_URL}/posts/${id}/`),

  // Moderation Queue
  getModerationQueue: (params = {}) => api.get(`${KNOWLEDGE_BASE_URL}/moderation/`, { params }),
  getReportedContent: (params = {}) => api.get(`${KNOWLEDGE_BASE_URL}/moderation/`, { params }),
  approveContent: (id) => api.post(`${KNOWLEDGE_BASE_URL}/moderation/${id}/approve/`),
  rejectContent: (id) => api.post(`${KNOWLEDGE_BASE_URL}/moderation/${id}/reject/`),

  // User Interactions
  getInteractions: (params = {}) => api.get(`${KNOWLEDGE_BASE_URL}/interactions/`, { params }),
  likeContent: (contentType, contentId) => api.post(`${KNOWLEDGE_BASE_URL}/interactions/`, {
    content_type: contentType,
    object_id: contentId,
    interaction_type: 'like'
  }),
  unlikeContent: (interactionId) => api.delete(`${KNOWLEDGE_BASE_URL}/interactions/${interactionId}/`),

  // Search
  search: (query, params = {}) => api.get(`${KNOWLEDGE_BASE_URL}/search/`, { 
    params: { q: query, ...params } 
  }),
};

export default knowledgeHubAPI;
