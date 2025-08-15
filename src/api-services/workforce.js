import api from './crud';

const WORKFORCE_BASE_URL = '/api/v1/workforce';

export const workforceAPI = {
  // Skills and Categories
  getSkillCategories: () => api.get(`${WORKFORCE_BASE_URL}/skill-categories/`),
  getSkills: (categoryId = null) => api.get(`${WORKFORCE_BASE_URL}/skills/`, { 
    params: categoryId ? { category: categoryId } : {} 
  }),
  
  // Professional Profiles
  getProfiles: (params = {}) => api.get(`${WORKFORCE_BASE_URL}/profiles/`, { params }),
  getProfile: (id) => api.get(`${WORKFORCE_BASE_URL}/profiles/${id}/`),
  createProfile: (data) => api.post(`${WORKFORCE_BASE_URL}/profiles/`, data),
  updateProfile: (id, data) => api.put(`${WORKFORCE_BASE_URL}/profiles/${id}/`, data),
  searchProfiles: (params) => api.get(`${WORKFORCE_BASE_URL}/profiles/search/`, { params }),
  
  // Companies
  getCompanies: (params = {}) => api.get(`${WORKFORCE_BASE_URL}/companies/`, { params }),
  getMyCompanies: () => api.get(`${WORKFORCE_BASE_URL}/companies/my_companies/`),
  
  // Job Postings
  getJobs: (params = {}) => api.get(`${WORKFORCE_BASE_URL}/jobs/`, { params }),
  getJob: (id) => api.get(`${WORKFORCE_BASE_URL}/jobs/${id}/`),
  createJob: (data) => api.post(`${WORKFORCE_BASE_URL}/jobs/`, data),
  updateJob: (id, data) => api.put(`${WORKFORCE_BASE_URL}/jobs/${id}/`, data),
  deleteJob: (id) => api.delete(`${WORKFORCE_BASE_URL}/jobs/${id}/`),
  applyToJob: (id, data) => api.post(`${WORKFORCE_BASE_URL}/jobs/${id}/apply/`, data),
  getMyCompanyJobs: () => api.get(`${WORKFORCE_BASE_URL}/jobs/my_company_jobs/`),
  
  // Job Applications
  getApplications: (params = {}) => api.get(`${WORKFORCE_BASE_URL}/applications/`, { params }),
  getApplication: (id) => api.get(`${WORKFORCE_BASE_URL}/applications/${id}/`),
  updateApplication: (id, data) => api.put(`${WORKFORCE_BASE_URL}/applications/${id}/`, data),
  
  // Professional Events
  getEvents: (params = {}) => api.get(`${WORKFORCE_BASE_URL}/events/`, { params }),
  getEvent: (id) => api.get(`${WORKFORCE_BASE_URL}/events/${id}/`),
  createEvent: (data) => api.post(`${WORKFORCE_BASE_URL}/events/`, data),
  registerForEvent: (id, data) => api.post(`${WORKFORCE_BASE_URL}/events/${id}/register/`, data),
  
  // Industry Councils
  getCouncils: () => api.get(`${WORKFORCE_BASE_URL}/councils/`),
  getCouncil: (id) => api.get(`${WORKFORCE_BASE_URL}/councils/${id}/`),
  joinCouncil: (id) => api.post(`${WORKFORCE_BASE_URL}/councils/${id}/join/`),
};

export default workforceAPI;
