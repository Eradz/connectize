import api from './crud';

const BIDDING_BASE_URL = '/api/v1/bidding';

export const biddingAPI = {
  // ==================== BID PROJECTS ====================
  getProjects: (params = {}) => api.get(`${BIDDING_BASE_URL}/bid-projects/`, { params }),
  getProject: (id) => api.get(`${BIDDING_BASE_URL}/bid-projects/${id}/`),
  getAccessibleCompanies: () => api.get(`${BIDDING_BASE_URL}/bid-projects/accessible-companies/`),
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
  getProjectLifecycle: (id) => api.get(`${BIDDING_BASE_URL}/bid-projects/${id}/lifecycle/`),
  syncProjectLifecycle: (id) => api.post(`${BIDDING_BASE_URL}/bid-projects/${id}/sync-lifecycle/`),
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
  getStageCriteria: (stageId, envelopeType) => {
    const params = envelopeType != null ? { envelope_type: envelopeType } : {};
    return api.get(`${BIDDING_BASE_URL}/stages/${stageId}/criteria/`, { params });
  },
  createCriterion: (stageId, data) => api.post(`${BIDDING_BASE_URL}/stages/${stageId}/criteria/`, data),
  updateCriterion: (stageId, criterionId, data) => api.patch(`${BIDDING_BASE_URL}/stages/${stageId}/criteria/${criterionId}/`, data),
  deleteCriterion: (stageId, criterionId) => api.delete(`${BIDDING_BASE_URL}/stages/${stageId}/criteria/${criterionId}/`),

  // ==================== DOCUMENTS ====================
  getDocumentTypes: (params = {}) => api.get(`${BIDDING_BASE_URL}/bid-document-types/`, { params }),
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
  createApproval: (data) => api.post(`${BIDDING_BASE_URL}/bid-approvals/`, data),
  submitApproval: (id, data) => api.patch(`${BIDDING_BASE_URL}/bid-approvals/${id}/`, data),

  // ==================== COMPLIANCE VAULT ====================
  getComplianceCategories: (params = {}) =>
    api.get(`${BIDDING_BASE_URL}/compliance-categories/`, { params }),
  createComplianceCategory: (data) =>
    api.post(`${BIDDING_BASE_URL}/compliance-categories/`, data),
  getComplianceRequirements: (params = {}) =>
    api.get(`${BIDDING_BASE_URL}/compliance-requirements/`, { params }),
  createComplianceRequirement: (data) =>
    api.post(`${BIDDING_BASE_URL}/compliance-requirements/`, data),
  getComplianceDocuments: (params = {}) =>
    api.get(`${BIDDING_BASE_URL}/compliance-documents/`, { params }),
  uploadComplianceDocument: (data) =>
    api.post(`${BIDDING_BASE_URL}/compliance-documents/`, data),
  updateComplianceDocument: (id, data) =>
    api.patch(`${BIDDING_BASE_URL}/compliance-documents/${id}/`, data),
  verifyComplianceDocument: (id) =>
    api.post(`${BIDDING_BASE_URL}/compliance-documents/${id}/verify/`),
  rejectComplianceDocument: (id, reason) =>
    api.post(`${BIDDING_BASE_URL}/compliance-documents/${id}/reject/`, { reason }),
  getComplianceStatus: (companyId, params = {}) =>
    api.get(`${BIDDING_BASE_URL}/compliance-status/${companyId}/`, { params }),

  // ==================== PREQUALIFICATION ====================
  getPrequalificationSchemes: (params = {}) =>
    api.get(`${BIDDING_BASE_URL}/prequalification-schemes/`, { params }),
  getPrequalificationScheme: (id) =>
    api.get(`${BIDDING_BASE_URL}/prequalification-schemes/${id}/`),
  createPrequalificationScheme: (data) =>
    api.post(`${BIDDING_BASE_URL}/prequalification-schemes/`, data),
  updatePrequalificationScheme: (id, data) =>
    api.patch(`${BIDDING_BASE_URL}/prequalification-schemes/${id}/`, data),
  deletePrequalificationScheme: (id) =>
    api.delete(`${BIDDING_BASE_URL}/prequalification-schemes/${id}/`),
  applyForPrequalification: (schemeId, data) =>
    api.post(`${BIDDING_BASE_URL}/prequalification-schemes/${schemeId}/apply/`, data),
  getQualifiedSuppliers: (schemeId) =>
    api.get(`${BIDDING_BASE_URL}/prequalification-schemes/${schemeId}/qualified_suppliers/`),
  getPrequalificationApplications: (params = {}) =>
    api.get(`${BIDDING_BASE_URL}/prequalification-applications/`, { params }),
  reviewPrequalification: (applicationId, data) =>
    api.post(`${BIDDING_BASE_URL}/prequalification-applications/${applicationId}/review/`, data),

  // ==================== COMPLIANCE REVIEW (Project Owner) ====================
  getComplianceReview: (projectId, params = {}) =>
    api.get(`${BIDDING_BASE_URL}/bid-projects/${projectId}/compliance-review/`, { params }),

  // ==================== MULTI-ENVELOPE ====================
  openEnvelope: (projectId, envelopeType) =>
    api.post(`${BIDDING_BASE_URL}/bid-projects/${projectId}/open-envelope/`, { envelope_type: envelopeType }),
  finalizeEnvelope: (projectId, envelopeType) =>
    api.post(`${BIDDING_BASE_URL}/bid-projects/${projectId}/finalize-envelope/`, { envelope_type: envelopeType }),
  calculateMultiEnvelopeScores: (projectId) =>
    api.post(`${BIDDING_BASE_URL}/bid-projects/${projectId}/calculate-multi-envelope-scores/`),

  // ==================== TENDER ADDENDA & VERSIONING ====================
  getAddenda: (projectId) =>
    api.get(`${BIDDING_BASE_URL}/bid-projects/${projectId}/addenda/`),
  issueAddendum: (projectId, data) =>
    api.post(`${BIDDING_BASE_URL}/bid-projects/${projectId}/addenda/`, data),
  acknowledgeAddendum: (projectId, addendumNumber, data = {}) =>
    api.post(`${BIDDING_BASE_URL}/bid-projects/${projectId}/addenda/${addendumNumber}/acknowledge/`, data),
  getProjectVersions: (projectId) =>
    api.get(`${BIDDING_BASE_URL}/bid-projects/${projectId}/versions/`),

  // ==================== LOCAL CONTENT (NCDMB) ====================
  getLocalContentCategories: (params = {}) =>
    api.get(`${BIDDING_BASE_URL}/local-content-categories/`, { params }),
  createLocalContentCategory: (data) =>
    api.post(`${BIDDING_BASE_URL}/local-content-categories/`, data),
  updateLocalContentCategory: (id, data) =>
    api.patch(`${BIDDING_BASE_URL}/local-content-categories/${id}/`, data),
  getLocalContentDeclarations: (params = {}) =>
    api.get(`${BIDDING_BASE_URL}/local-content-declarations/`, { params }),
  submitLocalContentDeclaration: (data) =>
    api.post(`${BIDDING_BASE_URL}/local-content-declarations/`, data),
  updateLocalContentDeclaration: (id, data) =>
    api.patch(`${BIDDING_BASE_URL}/local-content-declarations/${id}/`, data),
  getLocalContentScorecard: (bidId) =>
    api.get(`${BIDDING_BASE_URL}/local-content-scorecard/${bidId}/`),

  // ==================== SUPPLIER PERFORMANCE SCORECARD ====================
  getPerformanceMetrics: (params = {}) =>
    api.get(`${BIDDING_BASE_URL}/performance-metrics/`, { params }),
  createPerformanceMetric: (data) =>
    api.post(`${BIDDING_BASE_URL}/performance-metrics/`, data),
  getPerformanceReviews: (params = {}) =>
    api.get(`${BIDDING_BASE_URL}/performance-reviews/`, { params }),
  createPerformanceReview: (data) =>
    api.post(`${BIDDING_BASE_URL}/performance-reviews/`, data),
  updatePerformanceReview: (id, data) =>
    api.patch(`${BIDDING_BASE_URL}/performance-reviews/${id}/`, data),
  getSupplierPerformanceScore: (companyId) =>
    api.get(`${BIDDING_BASE_URL}/supplier-performance/${companyId}/`),
};

export default biddingAPI;
