import api from './crud';

const BIDDING_BASE_URL = '/api/v1/bidding';

export const biddingAPI = {
  // ==================== BID PROJECTS ====================
  getProjects: (params = {}) => api.get(`${BIDDING_BASE_URL}/bid-projects/`, { params }),
  getProject: (id) => api.get(`${BIDDING_BASE_URL}/bid-projects/${id}/`),
  createProject: (data) => api.post(`${BIDDING_BASE_URL}/bid-projects/`, data),
  updateProject: (id, data) => api.patch(`${BIDDING_BASE_URL}/bid-projects/${id}/`, data),
  deleteProject: (id) => api.delete(`${BIDDING_BASE_URL}/bid-projects/${id}/`),

  // Project Actions
  publishProject: (id) => api.post(`${BIDDING_BASE_URL}/bid-projects/${id}/publish/`),
  openSubmission: (id) => api.post(`${BIDDING_BASE_URL}/bid-projects/${id}/open-submission/`),
  closeSubmission: (id) => api.post(`${BIDDING_BASE_URL}/bid-projects/${id}/close-submission/`),
  startEvaluation: (id) => api.post(`${BIDDING_BASE_URL}/bid-projects/${id}/start-evaluation/`),
  advanceStage: (id, data = {}) => api.post(`${BIDDING_BASE_URL}/bid-projects/${id}/advance-stage/`, data),
  awardProject: (id, data) => api.post(`${BIDDING_BASE_URL}/bid-projects/${id}/award/`, data),
  cancelProject: (id, data = {}) => api.post(`${BIDDING_BASE_URL}/bid-projects/${id}/cancel/`, data),

  // Project Sub-resources
  getProjectStages: (id) => api.get(`${BIDDING_BASE_URL}/bid-projects/${id}/stages/`),
  getProjectActivity: (id, params = {}) => api.get(`${BIDDING_BASE_URL}/bid-projects/${id}/activity/`, { params }),
  getScoreboard: (id) => api.get(`${BIDDING_BASE_URL}/bid-projects/${id}/scoreboard/`),
  calculateScores: (id) => api.post(`${BIDDING_BASE_URL}/bid-projects/${id}/calculate-scores/`),
  shortlistBids: (id, data) => api.post(`${BIDDING_BASE_URL}/bid-projects/${id}/shortlist-bids/`, data),

  // Project Clarifications
  getClarifications: (id, params = {}) => api.get(`${BIDDING_BASE_URL}/bid-projects/${id}/clarifications/`, { params }),
  askClarification: (id, data) => api.post(`${BIDDING_BASE_URL}/bid-projects/${id}/clarifications/`, data),
  answerClarification: (projectId, { clarification_id, answer }) => api.post(`${BIDDING_BASE_URL}/bid-projects/${projectId}/clarifications/${clarification_id}/answer/`, { answer }),

  // Project Invitations
  getInvitations: (id, params = {}) => api.get(`${BIDDING_BASE_URL}/bid-projects/${id}/invitations/`, { params }),
  sendInvitations: (id, data) => api.post(`${BIDDING_BASE_URL}/bid-projects/${id}/invitations/`, data),

  // ==================== BIDS ====================
  getBids: (params = {}) => api.get(`${BIDDING_BASE_URL}/bids/`, { params }),
  getBid: (id) => api.get(`${BIDDING_BASE_URL}/bids/${id}/`),
  submitBid: (data) => api.post(`${BIDDING_BASE_URL}/bids/`, data),
  updateBid: (id, data) => api.patch(`${BIDDING_BASE_URL}/bids/${id}/`, data),

  // Bid Actions
  submitBidAction: (id) => api.post(`${BIDDING_BASE_URL}/bids/${id}/submit/`),
  withdrawBid: (id, data = {}) => api.post(`${BIDDING_BASE_URL}/bids/${id}/withdraw/`, data),
  amendBid: (id, data) => api.post(`${BIDDING_BASE_URL}/bids/${id}/amend/`, data),

  // Bid Evaluations
  getBidEvaluations: (id) => api.get(`${BIDDING_BASE_URL}/bids/${id}/evaluations/`),
  submitEvaluation: (id, data) => api.post(`${BIDDING_BASE_URL}/bids/${id}/evaluations/`, data),

  // ==================== WORKFLOW TEMPLATES ====================
  getTemplates: (params = {}) => api.get(`${BIDDING_BASE_URL}/bid-workflow-templates/`, { params }),
  getTemplate: (id) => api.get(`${BIDDING_BASE_URL}/bid-workflow-templates/${id}/`),
  createTemplate: (data) => api.post(`${BIDDING_BASE_URL}/bid-workflow-templates/`, data),
  updateTemplate: (id, data) => api.patch(`${BIDDING_BASE_URL}/bid-workflow-templates/${id}/`, data),
  deleteTemplate: (id) => api.delete(`${BIDDING_BASE_URL}/bid-workflow-templates/${id}/`),

  // Template Stages
  getTemplateStages: (templateId) => api.get(`${BIDDING_BASE_URL}/templates/${templateId}/stages/`),
  createStage: (templateId, data) => api.post(`${BIDDING_BASE_URL}/templates/${templateId}/stages/`, data),
  updateStage: (templateId, stageId, data) => api.patch(`${BIDDING_BASE_URL}/templates/${templateId}/stages/${stageId}/`, data),
  deleteStage: (templateId, stageId) => api.delete(`${BIDDING_BASE_URL}/templates/${templateId}/stages/${stageId}/`),

  // Stage Criteria
  getStageCriteria: (stageId) => api.get(`${BIDDING_BASE_URL}/stages/${stageId}/criteria/`),
  createCriterion: (stageId, data) => api.post(`${BIDDING_BASE_URL}/stages/${stageId}/criteria/`, data),
  updateCriterion: (stageId, criterionId, data) => api.patch(`${BIDDING_BASE_URL}/stages/${stageId}/criteria/${criterionId}/`, data),
  deleteCriterion: (stageId, criterionId) => api.delete(`${BIDDING_BASE_URL}/stages/${stageId}/criteria/${criterionId}/`),

  // ==================== DOCUMENTS ====================
  getDocuments: (params = {}) => api.get(`${BIDDING_BASE_URL}/bid-documents/`, { params }),
  uploadDocument: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    return api.post(`${BIDDING_BASE_URL}/bid-documents/`, formData);
  },
  deleteDocument: (id) => api.delete(`${BIDDING_BASE_URL}/bid-documents/${id}/`),

  // ==================== INVITATIONS ====================
  getAllInvitations: (params = {}) => api.get(`${BIDDING_BASE_URL}/bid-invitations/`, { params }),
  respondToInvitation: (id, data) => api.post(`${BIDDING_BASE_URL}/bid-invitations/${id}/respond/`, data),

  // ==================== APPROVALS ====================
  getApprovals: (params = {}) => api.get(`${BIDDING_BASE_URL}/bid-approvals/`, { params }),
  submitApproval: (id, data) => api.patch(`${BIDDING_BASE_URL}/bid-approvals/${id}/`, data),
};

export default biddingAPI;
