import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://connectizeapi.onrender.com/api'
  : 'http://localhost:8000/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Knowledge Hub API Service
export const knowledgeHubAPI = {
  // Articles Management
  getArticles: (params = {}) => {
    return apiClient.get('/v1/knowledge/articles/', { params });
  },

  getArticle: (id) => {
    return apiClient.get(`/v1/knowledge/articles/${id}/`);
  },

  createArticle: (data) => {
    return apiClient.post('/v1/knowledge/articles/', data);
  },

  updateArticle: (id, data) => {
    return apiClient.put(`/v1/knowledge/articles/${id}/`, data);
  },

  deleteArticle: (id) => {
    return apiClient.delete(`/v1/knowledge/articles/${id}/`);
  },

  publishArticle: (id) => {
    return apiClient.post(`/v1/knowledge/articles/${id}/publish/`);
  },

  unpublishArticle: (id) => {
    return apiClient.post(`/v1/knowledge/articles/${id}/unpublish/`);
  },

  // Categories Management
  getCategories: (params = {}) => {
    return apiClient.get('/v1/knowledge/categories/', { params });
  },

  getCategory: (id) => {
    return apiClient.get(`/v1/knowledge/categories/${id}/`);
  },

  createCategory: (data) => {
    return apiClient.post('/v1/knowledge/categories/', data);
  },

  updateCategory: (id, data) => {
    return apiClient.put(`/v1/knowledge/categories/${id}/`, data);
  },

  deleteCategory: (id) => {
    return apiClient.delete(`/v1/knowledge/categories/${id}/`);
  },

  // Tags Management
  getTags: (params = {}) => {
    return apiClient.get('/v1/knowledge/tags/', { params });
  },

  createTag: (data) => {
    return apiClient.post('/v1/knowledge/tags/', data);
  },

  updateTag: (id, data) => {
    return apiClient.put(`/v1/knowledge/tags/${id}/`, data);
  },

  deleteTag: (id) => {
    return apiClient.delete(`/v1/knowledge/tags/${id}/`);
  },

  // Forums Management
  getForums: (params = {}) => {
    return apiClient.get('/v1/knowledge/forums/', { params });
  },

  getForum: (id) => {
    return apiClient.get(`/v1/knowledge/forums/${id}/`);
  },

  createForum: (data) => {
    return apiClient.post('/v1/knowledge/forums/', data);
  },

  updateForum: (id, data) => {
    return apiClient.put(`/v1/knowledge/forums/${id}/`, data);
  },

  deleteForum: (id) => {
    return apiClient.delete(`/v1/knowledge/forums/${id}/`);
  },

  // Forum Topics Management
  getTopics: (forumId, params = {}) => {
    return apiClient.get(`/v1/knowledge/forums/${forumId}/topics/`, { params });
  },

  getTopic: (id) => {
    return apiClient.get(`/v1/knowledge/topics/${id}/`);
  },

  createTopic: (data) => {
    return apiClient.post('/v1/knowledge/topics/', data);
  },

  updateTopic: (id, data) => {
    return apiClient.put(`/v1/knowledge/topics/${id}/`, data);
  },

  deleteTopic: (id) => {
    return apiClient.delete(`/v1/knowledge/topics/${id}/`);
  },

  lockTopic: (id) => {
    return apiClient.post(`/v1/knowledge/topics/${id}/lock/`);
  },

  unlockTopic: (id) => {
    return apiClient.post(`/v1/knowledge/topics/${id}/unlock/`);
  },

  pinTopic: (id) => {
    return apiClient.post(`/v1/knowledge/topics/${id}/pin/`);
  },

  unpinTopic: (id) => {
    return apiClient.post(`/v1/knowledge/topics/${id}/unpin/`);
  },

  // Posts Management
  getPosts: (topicId, params = {}) => {
    return apiClient.get(`/v1/knowledge/topics/${topicId}/posts/`, { params });
  },

  getPost: (id) => {
    return apiClient.get(`/v1/knowledge/posts/${id}/`);
  },

  createPost: (data) => {
    return apiClient.post('/v1/knowledge/posts/', data);
  },

  updatePost: (id, data) => {
    return apiClient.put(`/v1/knowledge/posts/${id}/`, data);
  },

  deletePost: (id) => {
    return apiClient.delete(`/v1/knowledge/posts/${id}/`);
  },

  // Moderation
  moderateContent: (contentType, contentId, action, reason = '') => {
    return apiClient.post('/v1/knowledge/moderate/', {
      content_type: contentType,
      content_id: contentId,
      action: action,
      reason: reason
    });
  },

  getReportedContent: (params = {}) => {
    return apiClient.get('/v1/knowledge/moderation/', { params });
  },

  resolveReport: (reportId, action, reason = '') => {
    return apiClient.post(`/v1/knowledge/reports/${reportId}/resolve/`, {
      action: action,
      reason: reason
    });
  },

  // Comments Management
  getComments: (articleId, params = {}) => {
    return apiClient.get(`/v1/knowledge/articles/${articleId}/comments/`, { params });
  },

  createComment: (data) => {
    return apiClient.post('/v1/knowledge/comments/', data);
  },

  updateComment: (id, data) => {
    return apiClient.put(`/v1/knowledge/comments/${id}/`, data);
  },

  deleteComment: (id) => {
    return apiClient.delete(`/v1/knowledge/comments/${id}/`);
  },

  moderateComment: (id, action) => {
    return apiClient.post(`/v1/knowledge/comments/${id}/moderate/`, { action });
  },

  // Search and Analytics
  searchContent: (query, filters = {}) => {
    return apiClient.get('/v1/knowledge/search/', {
      params: { q: query, ...filters }
    });
  },

  getAnalytics: (params = {}) => {
    return apiClient.get('/v1/knowledge/analytics/', { params });
  },

  getPopularContent: (contentType = 'articles', period = '7d') => {
    return apiClient.get('/v1/knowledge/popular/', {
      params: { content_type: contentType, period: period }
    });
  },

  // User Interactions
  likeContent: (contentType, contentId) => {
    return apiClient.post('/v1/knowledge/like/', {
      content_type: contentType,
      content_id: contentId
    });
  },

  unlikeContent: (contentType, contentId) => {
    return apiClient.delete('/v1/knowledge/like/', {
      data: { content_type: contentType, content_id: contentId }
    });
  },

  bookmarkContent: (contentType, contentId) => {
    return apiClient.post('/v1/knowledge/bookmark/', {
      content_type: contentType,
      content_id: contentId
    });
  },

  unbookmarkContent: (contentType, contentId) => {
    return apiClient.delete('/v1/knowledge/bookmark/', {
      data: { content_type: contentType, content_id: contentId }
    });
  },

  // File uploads
  uploadFile: (file, purpose = 'article') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', purpose);
    
    return apiClient.post('/v1/knowledge/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Bulk operations
  bulkUpdateArticles: (articleIds, updateData) => {
    return apiClient.post('/v1/knowledge/articles/bulk-update/', {
      article_ids: articleIds,
      update_data: updateData
    });
  },

  bulkDeleteContent: (contentType, contentIds) => {
    return apiClient.post('/v1/knowledge/bulk-delete/', {
      content_type: contentType,
      content_ids: contentIds
    });
  },

  exportContent: (contentType, filters = {}) => {
    return apiClient.get('/v1/knowledge/export/', {
      params: { content_type: contentType, ...filters },
      responseType: 'blob'
    });
  }
};

// Legacy compatibility
export const knowledgeHubService = knowledgeHubAPI;

export default knowledgeHubAPI;