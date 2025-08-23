import api from './crud';

const workforce = {
  // Workforce Profiles
  getWorkforceProfiles: async (params = {}) => {
    const cleanParams = Object.fromEntries(Object.entries(params).filter(([,v]) => v !== undefined && v !== null && v !== 'all' && v !== ''));
    console.log('🔗 Making workforce profiles API call to:', '/api/v1/workforce/profiles/', 'with params:', cleanParams);
    const response = await api.getPublic('/api/v1/workforce/profiles/', { params: cleanParams });
    return response.data;
  },

  getWorkforceProfile: async (id) => {
    const response = await api.getPublic(`/api/v1/workforce/profiles/${id}/`);
    return response.data;
  },

  createWorkforceProfile: async (data) => {
    const response = await api.post('/api/v1/workforce/profiles/', data);
    return response.data;
  },

  updateWorkforceProfile: async (id, data) => {
    const response = await api.put(`/api/v1/workforce/profiles/${id}/`, data);
    return response.data;
  },

  deleteWorkforceProfile: async (id) => {
    const response = await api.delete(`/api/v1/workforce/profiles/${id}/`);
    return response.data;
  },

  // Skills Management
  getSkills: async (params = {}) => {
    const response = await api.get('/api/v1/workforce/skills/', { params });
    return response.data;
  },

  getSkill: async (id) => {
    const response = await api.get(`/api/v1/workforce/skills/${id}/`);
    return response.data;
  },

  createSkill: async (data) => {
    const response = await api.post('/api/v1/workforce/skills/', data);
    return response.data;
  },

  updateSkill: async (id, data) => {
    const response = await api.put(`/api/v1/workforce/skills/${id}/`, data);
    return response.data;
  },

  deleteSkill: async (id) => {
    const response = await api.delete(`/api/v1/workforce/skills/${id}/`);
    return response.data;
  },

  // Skill Categories
  getSkillCategories: async (params = {}) => {
    const response = await api.get('/api/v1/workforce/skill-categories/', { params });
    return response.data;
  },

  createSkillCategory: async (data) => {
    const response = await api.post('/api/v1/workforce/skill-categories/', data);
    return response.data;
  },

  updateSkillCategory: async (id, data) => {
    const response = await api.put(`/api/v1/workforce/skill-categories/${id}/`, data);
    return response.data;
  },

  deleteSkillCategory: async (id) => {
    const response = await api.delete(`/api/v1/workforce/skill-categories/${id}/`);
    return response.data;
  },

  // Jobs Management
  getJobs: async (params = {}) => {
    const response = await api.getPublic('/api/v1/workforce/jobs/', { params });
    return response.data;
  },

  getJob: async (id) => {
    const response = await api.getPublic(`/api/v1/workforce/jobs/${id}/`);
    return response.data;
  },

  createJob: async (data) => {
    const response = await api.post('/api/v1/workforce/jobs/', data);
    return response.data;
  },

  updateJob: async (id, data) => {
    const response = await api.put(`/api/v1/workforce/jobs/${id}/`, data);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/api/v1/workforce/jobs/${id}/`);
    return response.data;
  },

  // Job Applications
  getJobApplications: async (params = {}) => {
    const response = await api.get('/api/v1/workforce/applications/', { params });
    return response.data;
  },

  getJobApplication: async (id) => {
    const response = await api.get(`/api/v1/workforce/applications/${id}/`);
    return response.data;
  },

  createJobApplication: async (data) => {
    const response = await api.post('/api/v1/workforce/applications/', data);
    return response.data;
  },

  updateJobApplication: async (id, data) => {
    const response = await api.put(`/api/v1/workforce/applications/${id}/`, data);
    return response.data;
  },

  deleteJobApplication: async (id) => {
    const response = await api.delete(`/api/v1/workforce/applications/${id}/`);
    return response.data;
  },

  // Application Status Management
  updateApplicationStatus: async (id, status, notes = '') => {
    const response = await api.patch(`/api/v1/workforce/applications/${id}/`, {
      status,
      notes
    });
    return response.data;
  },

  // Job Categories
  getJobCategories: async (params = {}) => {
    const response = await api.get('/api/v1/workforce/job-categories/', { params });
    return response.data;
  },

  createJobCategory: async (data) => {
    const response = await api.post('/api/v1/workforce/job-categories/', data);
    return response.data;
  },

  updateJobCategory: async (id, data) => {
    const response = await api.put(`/api/v1/workforce/job-categories/${id}/`, data);
    return response.data;
  },

  deleteJobCategory: async (id) => {
    const response = await api.delete(`/api/v1/workforce/job-categories/${id}/`);
    return response.data;
  },

  // Experience Levels
  getExperienceLevels: async (params = {}) => {
    const response = await api.get('/api/v1/workforce/experience-levels/', { params });
    return response.data;
  },

  // Job Types
  getJobTypes: async (params = {}) => {
    const response = await api.get('/api/v1/workforce/job-types/', { params });
    return response.data;
  },

  // Contracts and Agreements
  getContracts: async (params = {}) => {
    const response = await api.get('/api/v1/workforce/contracts/', { params });
    return response.data;
  },

  createContract: async (data) => {
    const response = await api.post('/api/v1/workforce/contracts/', data);
    return response.data;
  },

  updateContract: async (id, data) => {
    const response = await api.put(`/api/v1/workforce/contracts/${id}/`, data);
    return response.data;
  },

  // Performance Reviews
  getPerformanceReviews: async (params = {}) => {
    const response = await api.get('/api/v1/workforce/performance-reviews/', { params });
    return response.data;
  },

  createPerformanceReview: async (data) => {
    const response = await api.post('/api/v1/workforce/performance-reviews/', data);
    return response.data;
  },

  updatePerformanceReview: async (id, data) => {
    const response = await api.put(`/api/v1/workforce/performance-reviews/${id}/`, data);
    return response.data;
  },

  // Training and Certifications
  getTrainingPrograms: async (params = {}) => {
    const response = await api.get('/api/v1/workforce/training-programs/', { params });
    return response.data;
  },

  getCertifications: async (params = {}) => {
    const response = await api.get('/api/v1/workforce/certifications/', { params });
    return response.data;
  },

  createCertification: async (data) => {
    const response = await api.post('/api/v1/workforce/certifications/', data);
    return response.data;
  },

  // Bulk operations
  bulkUpdateProfiles: async (ids, data) => {
    const response = await api.post('/api/v1/workforce/profiles/bulk_update/', {
      ids,
      ...data
    });
    return response.data;
  },

  bulkDeleteProfiles: async (ids) => {
    const response = await api.post('/api/v1/workforce/profiles/bulk_delete/', {
      ids
    });
    return response.data;
  },

  bulkUpdateApplications: async (ids, data) => {
    const response = await api.post('/api/v1/workforce/applications/bulk_update/', {
      ids,
      ...data
    });
    return response.data;
  },

  // Export data
  exportProfiles: async (format = 'csv', filters = {}) => {
    const response = await api.get('/api/v1/workforce/profiles/export/', {
      params: { format, ...filters },
      responseType: 'blob'
    });
    return response.data;
  },

  exportJobs: async (format = 'csv', filters = {}) => {
    const response = await api.get('/api/v1/workforce/jobs/export/', {
      params: { format, ...filters },
      responseType: 'blob'
    });
    return response.data;
  },

  exportApplications: async (format = 'csv', filters = {}) => {
    const response = await api.get('/api/v1/workforce/applications/export/', {
      params: { format, ...filters },
      responseType: 'blob'
    });
    return response.data;
  },

  // Statistics and Analytics
  getWorkforceStats: async () => {
    const response = await api.get('/api/v1/workforce/stats/');
    return response.data;
  },

  getJobApplicationStats: async () => {
    const response = await api.get('/api/v1/workforce/application-stats/');
    return response.data;
  },

  getSkillsAnalytics: async () => {
    const response = await api.get('/api/v1/workforce/skills-analytics/');
    return response.data;
  },

  // Search and Filtering
  searchProfiles: async (query, filters = {}) => {
    const response = await api.get('/api/v1/workforce/profiles/search/', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  searchJobs: async (query, filters = {}) => {
    const response = await api.get('/api/v1/workforce/jobs/search/', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  // Aliases for backward compatibility
  getProfiles: function(params) { return this.getWorkforceProfiles(params); },
  getProfile: function(id) { return this.getWorkforceProfile(id); },
  getMyProfile: function() { return this.getWorkforceProfile('me'); },
  getMyCompanyJobs: function() { return this.getJobs({ company: 'current' }); },
  getEvent: function(id) { return this.getJob(id); }, // Assuming events are jobs
  registerForEvent: function(id, data = {}) { return this.createJobApplication({ job: id, ...data }); },
  getMyEventRegistrations: function() { return this.getJobApplications({ applicant: 'current' }); },
  getEventRegistrations: function(id) { return this.getJobApplications({ job: id }); },
};

export default workforce;
export const workforceAPI = workforce;
