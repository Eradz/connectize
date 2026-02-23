import api from './crud';

const workforce = {
  // Workforce Profiles
  getWorkforceProfiles: async (params = {}) => {
    const cleanParams = Object.fromEntries(Object.entries(params).filter(([,v]) => v !== undefined && v !== null && v !== 'all' && v !== ''));
    console.log('🔗 Making workforce profiles API call to:', '/api/v1/workforce/profiles/', 'with params:', cleanParams);
    const response = await api.getPublic('/api/v1/workforce/profiles/', { params: cleanParams });
    return response;
  },

  getWorkforceProfile: async (id) => {
    const response = await api.getPublic(`/api/v1/workforce/profiles/${id}/`);
    return response;
  },

  createWorkforceProfile: async (data) => {
    const response = await api.post('/api/v1/workforce/profiles/', data);
    return response;
  },

  updateWorkforceProfile: async (id, data) => {
    const response = await api.put(`/api/v1/workforce/profiles/${id}/`, data);
    return response;
  },

  deleteWorkforceProfile: async (id) => {
    const response = await api.delete(`/api/v1/workforce/profiles/${id}/`);
    return response;
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

  // Company Jobs
  getMyCompanyJobs: async () => {
    const response = await api.get('/api/v1/workforce/jobs/my_company_jobs/');
    return response;
  },

  // My Companies (for event creation, job posting, etc.)
  getMyCompanies: async () => {
    const response = await api.get('/api/v1/workforce/companies/my_companies/');
    return response;
  },

  // Other job methods
  getJobs: async (params = {}) => {
    const response = await api.get('/api/v1/workforce/jobs/', { params });
    return response;
  },

  getJob: async (id) => {
    const response = await api.getPublic(`/api/v1/workforce/jobs/${id}/`);
    return response;
  },

  createJob: async (data) => {
    const response = await api.post('/api/v1/workforce/jobs/', data);
    return response;
  },

  updateJob: async (id, data) => {
    const response = await api.put(`/api/v1/workforce/jobs/${id}/`, data);
    return response;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/api/v1/workforce/jobs/${id}/`);
    return response;
  },

  // Job Applications
  getJobApplications: async (params = {}) => {
    const response = await api.get('/api/v1/workforce/applications/', { params });
    return response;
  },

  getJobApplication: async (id) => {
    const response = await api.get(`/api/v1/workforce/applications/${id}/`);
    return response;
  },

  createJobApplication: async (data) => {
    const response = await api.post('/api/v1/workforce/applications/', data);
    return response;
  },

  updateJobApplication: async (id, data) => {
    const response = await api.put(`/api/v1/workforce/applications/${id}/`, data);
    return response;
  },

  deleteJobApplication: async (id) => {
    const response = await api.delete(`/api/v1/workforce/applications/${id}/`);
    return response;
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

  // Event Types
  getEventTypes: async (params = {}) => {
    const response = await api.get('/api/v1/workforce/event-types/', { params });
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

  // Professional Events
  getEvents: async (params = {}) => {
    const cleanParams = Object.fromEntries(Object.entries(params).filter(([,v]) => v !== undefined && v !== null && v !== 'all' && v !== ''));
    console.log('🔗 Making workforce events API call to:', '/api/v1/workforce/events/', 'with params:', cleanParams);
    const response = await api.getPublic('/api/v1/workforce/events/', { params: cleanParams });
    return response;
  },

  getEvent: async (id) => {
    const response = await api.getPublic(`/api/v1/workforce/events/${id}/`);
    return response;
  },

  createEvent: async (data) => {
    const response = await api.post('/api/v1/workforce/events/', data);
    return response;
  },

  updateEvent: async (id, data) => {
    const response = await api.patch(`/api/v1/workforce/events/${id}/`, data);
    return response;
  },

  deleteEvent: async (id) => {
    const response = await api.delete(`/api/v1/workforce/events/${id}/`);
    return response;
  },

  registerForEvent: async (id, data = {}) => {
    const response = await api.post(`/api/v1/workforce/events/${id}/register/`, data);
    return response;
  },

  payForEventRegistration: async (id) => {
    const response = await api.post(`/api/v1/workforce/events/${id}/pay-registration/`);
    return response;
  },

  createEventCheckoutSession: async (id) => {
    const response = await api.post(`/api/v1/workforce/events/${id}/create-checkout-session/`, {
      frontend_base_url: window.location.origin
    });
    return response;
  },

  verifyEventPayment: async (id) => {
    const response = await api.post(`/api/v1/workforce/events/${id}/verify-payment/`);
    return response;
  },

  confirmExternalPayment: async (eventId, attendeeId, paymentReference = '') => {
    const response = await api.post(`/api/v1/workforce/events/${eventId}/confirm-external-payment/`, {
      attendee_id: attendeeId,
      payment_reference: paymentReference
    });
    return response;
  },

  getMyEventRegistrations: async (query) => {
    const response = query ?  await api.get(`/api/v1/workforce/events/my_registrations/?user_id=${query.userId}`) : await api.get(`/api/v1/workforce/events/my_registrations/`);
    return response;
  },

  getEventRegistrations: async (id) => {
  const response = await api.get(`/api/v1/workforce/events/${id}/registrations/`);
  console.log('[workforceAPI] getEventRegistrations raw wrapper:', response);
  console.log('[workforceAPI] getEventRegistrations inner data keys:', response?.data && Object.keys(response.data));
  return response;
  },

  updateEventRegistration: async (eventId, registrationId, data) => {
    const response = await api.patch(`/api/v1/workforce/events/${eventId}/registrations/${registrationId}/`, data);
    return response;
  },

  getMyCreatedEvents: async () => {
    const response = await api.get('/api/v1/workforce/events/my_created/');
    return response;
  },

  bookmarkEvent: async (id) => {
    const response = await api.post(`/api/v1/workforce/events/${id}/bookmark/`);
    return response;
  },

  getMyBookmarkedEvents: async () => {
    const response = await api.get('/api/v1/workforce/events/my_bookmarks/');
    return response;
  },

  // Event Schedule Methods
  getUpcomingEvents: async (params = {}) => {
    const cleanParams = Object.fromEntries(Object.entries(params).filter(([,v]) => v !== undefined && v !== null && v !== 'all' && v !== ''));
    console.log('🔗 Making upcoming events API call to:', '/api/v1/workforce/events/upcoming/', 'with params:', cleanParams);
    const response = await api.getPublic('/api/v1/workforce/events/upcoming/', { params: cleanParams });
    return response;
  },

  getOngoingEvents: async (params = {}) => {
    const cleanParams = Object.fromEntries(Object.entries(params).filter(([,v]) => v !== undefined && v !== null && v !== 'all' && v !== ''));
    console.log('🔗 Making ongoing events API call to:', '/api/v1/workforce/events/ongoing/', 'with params:', cleanParams);
    const response = await api.getPublic('/api/v1/workforce/events/ongoing/', { params: cleanParams });
    return response;
  },

  getPastEvents: async (params = {}) => {
    const cleanParams = Object.fromEntries(Object.entries(params).filter(([,v]) => v !== undefined && v !== null && v !== 'all' && v !== ''));
    console.log('🔗 Making past events API call to:', '/api/v1/workforce/events/past/', 'with params:', cleanParams);
    const response = await api.getPublic('/api/v1/workforce/events/past/', { params: cleanParams });
    return response;
  },

  // ============ Payout & Earnings API ============
  
  // Get earnings summary for all companies user manages
  getMyCompaniesEarnings: async () => {
    const response = await api.get('/api/v1/workforce/payouts/my-companies/');
    return response;
  },

  // Get detailed earnings for a specific company
  getCompanyEarnings: async (companyId) => {
    const response = await api.get(`/api/v1/workforce/payouts/${companyId}/earnings/`);
    return response;
  },

  // Get bank details for a company
  getCompanyBankDetails: async (companyId) => {
    const response = await api.get(`/api/v1/workforce/payouts/${companyId}/bank-details/`);
    return response;
  },

  // Update bank details for a company
  updateCompanyBankDetails: async (companyId, data) => {
    const response = await api.put(`/api/v1/workforce/payouts/${companyId}/bank-details/`, data);
    return response;
  },

  // Get payout history for a company
  getCompanyPayouts: async (companyId) => {
    const response = await api.get(`/api/v1/workforce/payouts/${companyId}/payouts/`);
    return response;
  },

  // Get platform fee information
  getPlatformFees: async () => {
    const response = await api.get('/api/v1/workforce/payouts/platform-fees/');
    return response;
  },

    // Convenience methods for backward compatibility
  getProfiles: function(params) { return this.getWorkforceProfiles(params); },
  getProfile: function(id) { return this.getWorkforceProfile(id); },
  getMyProfile: function() { return this.getWorkforceProfile('me'); },
  getApplications: function(params) { return this.getJobApplications(params); },
};

export default workforce;
export const workforceAPI = workforce;
