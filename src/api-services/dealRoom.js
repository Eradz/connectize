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
  
  // Deal Participants
  getParticipants: (dealRoomId) => api.get(`${DEAL_ROOM_BASE_URL}/participants/`, { 
    params: { deal_room: dealRoomId } 
  }),
  updateParticipant: (id, data) => api.put(`${DEAL_ROOM_BASE_URL}/participants/${id}/`, data),
  removeParticipant: (id) => api.delete(`${DEAL_ROOM_BASE_URL}/participants/${id}/`),
  
  // Deal Documents
  getDocuments: (dealRoomId) => api.get(`${DEAL_ROOM_BASE_URL}/documents/`, { 
    params: { deal_room: dealRoomId } 
  }),
  uploadDocument: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.post(`${DEAL_ROOM_BASE_URL}/documents/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteDocument: (id) => api.delete(`${DEAL_ROOM_BASE_URL}/documents/${id}/`),
  
  // Deal Activities
  getActivities: (dealRoomId) => api.get(`${DEAL_ROOM_BASE_URL}/activities/`, { 
    params: { deal_room: dealRoomId } 
  }),
  
  // Deal Milestones
  getMilestones: (dealRoomId) => api.get(`${DEAL_ROOM_BASE_URL}/milestones/`, { 
    params: { deal_room: dealRoomId } 
  }),
  createMilestone: (data) => api.post(`${DEAL_ROOM_BASE_URL}/milestones/`, data),
  updateMilestone: (id, data) => api.put(`${DEAL_ROOM_BASE_URL}/milestones/${id}/`, data),
  completeMilestone: (id) => api.post(`${DEAL_ROOM_BASE_URL}/milestones/${id}/complete/`),
  
  // Deal Valuations
  getValuations: (dealRoomId) => api.get(`${DEAL_ROOM_BASE_URL}/valuations/`, { 
    params: { deal_room: dealRoomId } 
  }),
  createValuation: (data) => api.post(`${DEAL_ROOM_BASE_URL}/valuations/`, data),
  updateValuation: (id, data) => api.put(`${DEAL_ROOM_BASE_URL}/valuations/${id}/`, data),
};

export default dealRoomAPI;
