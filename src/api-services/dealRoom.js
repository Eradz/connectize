import api from './crud';

const DEAL_ROOM_BASE_URL = '/api/v1/deals';

export const dealRoomAPI = {
  // Deal Rooms
  getDealRooms: (params = {}) => api.get(`${DEAL_ROOM_BASE_URL}/deal-rooms/`, { params }),
  getDealRoom: (id) => api.get(`${DEAL_ROOM_BASE_URL}/deal-rooms/${id}/`),
  createDealRoom: (data) => api.post(`${DEAL_ROOM_BASE_URL}/deal-rooms/`, data),
  updateDealRoom: (id, data) => api.put(`${DEAL_ROOM_BASE_URL}/deal-rooms/${id}/`, data),
  deleteDealRoom: (id) => api.delete(`${DEAL_ROOM_BASE_URL}/deal-rooms/${id}/`),
  
  // Deal Room Actions
  joinDealRoom: (id, data) => api.post(`${DEAL_ROOM_BASE_URL}/deal-rooms/${id}/join/`, data),
  leaveDealRoom: (id) => api.post(`${DEAL_ROOM_BASE_URL}/deal-rooms/${id}/leave/`),
  addParticipant: (id, data) => api.post(`${DEAL_ROOM_BASE_URL}/deal-rooms/${id}/add_participant/`, data),
  
  // Deal Participants - Fixed to handle both filtered and unfiltered calls
  getParticipants: (params = {}) => {
    // If dealRoomId is passed as first parameter (legacy), convert to params
    if (typeof params === 'string') {
      params = { deal_room: params };
    }
    return api.get(`${DEAL_ROOM_BASE_URL}/participants/`, { params });
  },
  getAllParticipants: (params = {}) => api.get(`${DEAL_ROOM_BASE_URL}/participants/`, { params }),
  createParticipant: (data) => api.post(`${DEAL_ROOM_BASE_URL}/participants/`, data),
  updateParticipant: (id, data) => api.put(`${DEAL_ROOM_BASE_URL}/participants/${id}/`, data),
  removeParticipant: (id) => api.delete(`${DEAL_ROOM_BASE_URL}/participants/${id}/`),
  
  // Deal Documents - Fixed to handle both filtered and unfiltered calls
  getDocuments: (params = {}) => {
    // If dealRoomId is passed as first parameter (legacy), convert to params
    if (typeof params === 'string') {
      params = { deal_room: params };
    }
    return api.get(`${DEAL_ROOM_BASE_URL}/documents/`, { params });
  },
  getAllDocuments: (params = {}) => api.get(`${DEAL_ROOM_BASE_URL}/documents/`, { params }),
  createDocument: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.post(`${DEAL_ROOM_BASE_URL}/documents/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadDocument: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.post(`${DEAL_ROOM_BASE_URL}/documents/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateDocument: (id, data) => api.put(`${DEAL_ROOM_BASE_URL}/documents/${id}/`, data),
  deleteDocument: (id) => api.delete(`${DEAL_ROOM_BASE_URL}/documents/${id}/`),
  
  // Deal Activities
  getActivities: (params = {}) => {
    // If dealRoomId is passed as first parameter (legacy), convert to params
    if (typeof params === 'string') {
      params = { deal_room: params };
    }
    return api.get(`${DEAL_ROOM_BASE_URL}/activities/`, { params });
  },
  
  // Deal Milestones - Fixed to handle both filtered and unfiltered calls
  getMilestones: (params = {}) => {
    // If dealRoomId is passed as first parameter (legacy), convert to params
    if (typeof params === 'string') {
      params = { deal_room: params };
    }
    return api.get(`${DEAL_ROOM_BASE_URL}/milestones/`, { params });
  },
  getAllMilestones: (params = {}) => api.get(`${DEAL_ROOM_BASE_URL}/milestones/`, { params }),
  createMilestone: (data) => api.post(`${DEAL_ROOM_BASE_URL}/milestones/`, data),
  updateMilestone: (id, data) => api.put(`${DEAL_ROOM_BASE_URL}/milestones/${id}/`, data),
  deleteMilestone: (id) => api.delete(`${DEAL_ROOM_BASE_URL}/milestones/${id}/`),
  completeMilestone: (id) => api.post(`${DEAL_ROOM_BASE_URL}/milestones/${id}/complete/`),
  
  // Deal Valuations
  getValuations: (params = {}) => {
    // If dealRoomId is passed as first parameter (legacy), convert to params
    if (typeof params === 'string') {
      params = { deal_room: params };
    }
    return api.get(`${DEAL_ROOM_BASE_URL}/valuations/`, { params });
  },
  createValuation: (data) => api.post(`${DEAL_ROOM_BASE_URL}/valuations/`, data),
  updateValuation: (id, data) => api.put(`${DEAL_ROOM_BASE_URL}/valuations/${id}/`, data),
};

export default dealRoomAPI;
