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
    return apiClient.get('/knowledge-hub/articles/', { params });
  },

  getArticle: (id) => {
    return apiClient.get(`/knowledge-hub/articles/${id}/`);
  },

  createArticle: (data) => {
    return apiClient.post('/knowledge-hub/articles/', data);
  },

  updateArticle: (id, data) => {
    return apiClient.put(`/knowledge-hub/articles/${id}/`, data);
  },

  deleteArticle: (id) => {
    return apiClient.delete(`/knowledge-hub/articles/${id}/`);
  },

  publishArticle: (id) => {
    return apiClient.post(`/knowledge-hub/articles/${id}/publish/`);
  },

  unpublishArticle: (id) => {
    return apiClient.post(`/knowledge-hub/articles/${id}/unpublish/`);
  },

  // Categories Management
  getCategories: (params = {}) => {
    return apiClient.get('/knowledge-hub/categories/', { params });
  },

  getCategory: (id) => {
    return apiClient.get(`/knowledge-hub/categories/${id}/`);
  },

  createCategory: (data) => {
    return apiClient.post('/knowledge-hub/categories/', data);
  },

  updateCategory: (id, data) => {
    return apiClient.put(`/knowledge-hub/categories/${id}/`, data);
  },

  deleteCategory: (id) => {
    return apiClient.delete(`/knowledge-hub/categories/${id}/`);
  },

  // Tags Management
  getTags: (params = {}) => {
    return apiClient.get('/knowledge-hub/tags/', { params });
  },

  createTag: (data) => {
    return apiClient.post('/knowledge-hub/tags/', data);
  },

  updateTag: (id, data) => {
    return apiClient.put(`/knowledge-hub/tags/${id}/`, data);
  },

  deleteTag: (id) => {
    return apiClient.delete(`/knowledge-hub/tags/${id}/`);
  },

  // Forums Management
  getForums: (params = {}) => {
    return apiClient.get('/knowledge-hub/forums/', { params });
  },

  getForum: (id) => {
    return apiClient.get(`/knowledge-hub/forums/${id}/`);
  },

  createForum: (data) => {
    return apiClient.post('/knowledge-hub/forums/', data);
  },

  updateForum: (id, data) => {
    return apiClient.put(`/knowledge-hub/forums/${id}/`, data);
  },

  deleteForum: (id) => {
    return apiClient.delete(`/knowledge-hub/forums/${id}/`);
  },

  // Forum Topics Management
  getTopics: (forumId, params = {}) => {
    return apiClient.get(`/knowledge-hub/forums/${forumId}/topics/`, { params });
  },

  getTopic: (id) => {
    return apiClient.get(`/knowledge-hub/topics/${id}/`);
  },

  createTopic: (data) => {
    return apiClient.post('/knowledge-hub/topics/', data);
  },

  updateTopic: (id, data) => {
    return apiClient.put(`/knowledge-hub/topics/${id}/`, data);
  },

  deleteTopic: (id) => {
    return apiClient.delete(`/knowledge-hub/topics/${id}/`);
  },

  lockTopic: (id) => {
    return apiClient.post(`/knowledge-hub/topics/${id}/lock/`);
  },

  unlockTopic: (id) => {
    return apiClient.post(`/knowledge-hub/topics/${id}/unlock/`);
  },

  pinTopic: (id) => {
    return apiClient.post(`/knowledge-hub/topics/${id}/pin/`);
  },

  unpinTopic: (id) => {
    return apiClient.post(`/knowledge-hub/topics/${id}/unpin/`);
  },

  // Posts Management
  getPosts: (topicId, params = {}) => {
    return apiClient.get(`/knowledge-hub/topics/${topicId}/posts/`, { params });
  },

  getPost: (id) => {
    return apiClient.get(`/knowledge-hub/posts/${id}/`);
  },

  createPost: (data) => {
    return apiClient.post('/knowledge-hub/posts/', data);
  },

  updatePost: (id, data) => {
    return apiClient.put(`/knowledge-hub/posts/${id}/`, data);
  },

  deletePost: (id) => {
    return apiClient.delete(`/knowledge-hub/posts/${id}/`);
  },

  // Moderation
  moderateContent: (contentType, contentId, action, reason = '') => {
    return apiClient.post('/knowledge-hub/moderate/', {
      content_type: contentType,
      content_id: contentId,
      action: action,
      reason: reason
    });
  },

  getReportedContent: (params = {}) => {
    return apiClient.get('/knowledge-hub/reported-content/', { params });
  },

  resolveReport: (reportId, action, reason = '') => {
    return apiClient.post(`/knowledge-hub/reports/${reportId}/resolve/`, {
      action: action,
      reason: reason
    });
  },

  // Comments Management
  getComments: (articleId, params = {}) => {
    return apiClient.get(`/knowledge-hub/articles/${articleId}/comments/`, { params });
  },

  createComment: (data) => {
    return apiClient.post('/knowledge-hub/comments/', data);
  },

  updateComment: (id, data) => {
    return apiClient.put(`/knowledge-hub/comments/${id}/`, data);
  },

  deleteComment: (id) => {
    return apiClient.delete(`/knowledge-hub/comments/${id}/`);
  },

  moderateComment: (id, action) => {
    return apiClient.post(`/knowledge-hub/comments/${id}/moderate/`, { action });
  },

  // Search and Analytics
  searchContent: (query, filters = {}) => {
    return apiClient.get('/knowledge-hub/search/', {
      params: { q: query, ...filters }
    });
  },

  getAnalytics: (params = {}) => {
    return apiClient.get('/knowledge-hub/analytics/', { params });
  },

  getPopularContent: (contentType = 'articles', period = '7d') => {
    return apiClient.get('/knowledge-hub/popular/', {
      params: { content_type: contentType, period: period }
    });
  },

  // User Interactions
  likeContent: (contentType, contentId) => {
    return apiClient.post('/knowledge-hub/like/', {
      content_type: contentType,
      content_id: contentId
    });
  },

  unlikeContent: (contentType, contentId) => {
    return apiClient.delete('/knowledge-hub/like/', {
      data: { content_type: contentType, content_id: contentId }
    });
  },

  bookmarkContent: (contentType, contentId) => {
    return apiClient.post('/knowledge-hub/bookmark/', {
      content_type: contentType,
      content_id: contentId
    });
  },

  unbookmarkContent: (contentType, contentId) => {
    return apiClient.delete('/knowledge-hub/bookmark/', {
      data: { content_type: contentType, content_id: contentId }
    });
  },

  // File uploads
  uploadFile: (file, purpose = 'article') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', purpose);
    
    return apiClient.post('/knowledge-hub/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Bulk operations
  bulkUpdateArticles: (articleIds, updateData) => {
    return apiClient.post('/knowledge-hub/articles/bulk-update/', {
      article_ids: articleIds,
      update_data: updateData
    });
  },

  bulkDeleteContent: (contentType, contentIds) => {
    return apiClient.post('/knowledge-hub/bulk-delete/', {
      content_type: contentType,
      content_ids: contentIds
    });
  },

  exportContent: (contentType, filters = {}) => {
    return apiClient.get('/knowledge-hub/export/', {
      params: { content_type: contentType, ...filters },
      responseType: 'blob'
    });
  }
};

// Legacy compatibility
export const knowledgeHubService = knowledgeHubAPI;

export default knowledgeHubAPI;