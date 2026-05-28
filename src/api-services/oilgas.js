import { CrudService } from "./crud";
import { makeApiRequest, baseURL } from "../lib/helpers/index";
// AI Services
export class AIMatchingService extends CrudService {
  constructor() {
    super("api/v1/ai/matches/");
  }

  async getMatchProfiles() {
    return await makeApiRequest({
  url: "api/v1/ai/profiles/",
      method: "GET"
    });
  }

  async createMatchProfile(profileData) {
    return await makeApiRequest({
      url: "api/v1/ai/profiles/",
      method: "POST",
      data: profileData
    });
  }

  async getMatches() {
    return await this.getAll();
  }

  async markViewed(matchId) {
    return await makeApiRequest({
  url: `api/v1/ai/matches/${matchId}/mark_viewed/`,
      method: "POST"
    });
  }

  async rateMatch(matchId, rating) {
    return await makeApiRequest({
      url: `api/v1/ai/matches/${matchId}/rate_match/`,
      method: "POST",
      data: { rating }
    });
  }
}

export class AIOpportunityService extends CrudService {
  constructor() {
    super("api/v1/ai/opportunities/");
  }

  async getOpportunities() {
    return await this.getAll();
  }

  async expressInterest(opportunityId, interestLevel, notes = '') {
    return await makeApiRequest({
  url: `api/v1/ai/opportunities/${opportunityId}/express_interest/`,
      method: "POST",
      data: { interest_level: interestLevel, notes }
    });
  }
}

export class AIComplianceService extends CrudService {
  constructor() {
    super("api/v1/ai/compliance/");
  }

  async getComplianceAlerts() {
    return await this.getAll();
  }

  async acknowledgeAlert(alertId) {
    return await makeApiRequest({
      url: `api/v1/ai/compliance/${alertId}/acknowledge/`,
      method: "POST"
    });
  }

  async getComplianceSummary() {
    return await makeApiRequest({
      url: "api/v1/ai/compliance/summary/",
      method: "GET"
    });
  }
}

export class AIPredictiveService extends CrudService {
  constructor() {
    super("api/v1/ai/analytics/");
  }

  async requestAnalysis(analysisType, targetAsset, forecastHorizon = 30) {
    return await makeApiRequest({
      url: "api/v1/ai/analytics/request_analysis/",
      method: "POST",
      data: {
        analysis_type: analysisType,
        target_asset: targetAsset,
        forecast_horizon: forecastHorizon
      }
    });
  }

  async getAnalytics() {
    return await this.getAll();
  }
}

// Deal Management Services
export class DealRoomService extends CrudService {
  constructor() {
    super("api/v1/deals/deal-rooms/");
  }

  // getAll and getById use the authenticated CrudService methods
  // No unauthenticated fallbacks — all deal room access requires auth

  async getParticipantDealRoom(){
    try {
      const res = await makeApiRequest({
        url: `api/v1/deals/participants/`,
        method: "GET",
      });
       if (!res) {
        const err = new Error('Authentication required. Please log in to add activities.');
        err.status = 401;
        throw err;
      }
      return res;
    } catch (error) {
      // Re-throw with better error context
      console.error('Get user deal rooms API error:', error);
      throw error;
    }
  } 


  async addDealRoom(dealRoomId, dealRoomData) {
    try {
      const res = await makeApiRequest({
  url: `${this.basePath}${dealRoomId}api/v1/deals/deal-rooms/`,
        method: "POST",
        data: dealRoomData,
      });
      // If request was redirected to login or blocked, makeApiRequest returns undefined.
      if (!res) {
        const err = new Error('Authentication required. Please log in to add activities.');
        err.status = 401;
        throw err;
      }
      // Expect a participant-like object back
      if (!res.id && !res.user && !res.user_email) {
        const err = new Error('Failed to add activity. Unexpected server response.');
        err.status = 500;
        throw err;
      }
      return res;
    } catch (error) {
      // Re-throw with better error context
      console.error('Add activity API error:', error);
      throw error;
    }
  }

  async addParticipant(dealRoomId, participantData) {
    try {
      const res = await makeApiRequest({
  url: `${this.basePath}${dealRoomId}/add_participant/`,
        method: "POST",
        data: participantData,
      });
      // If request was redirected to login or blocked, makeApiRequest returns undefined.
      // if (!res) {
      //   const err = new Error('Authentication required. Please log in to add participants.');
      //   err.status = 401;
      //   throw err;
      // }
      // // Expect a participant-like object back
      // if (!res.id && !res.user && !res.user_email) {
      //   const err = new Error('Failed to add participant. Unexpected server response.');
      //   err.status = 500;
      //   throw err;
      // }
      return res;
    } catch (error) {
      // Re-throw with better error context
      console.error('Add participant API error:', error);
      throw error;
    }
  }

  async removeParticipant(dealRoomId, participantId) {
    // Backend exposes DealParticipantViewSet at /api/v1/deals/participants/{id}/
    return makeApiRequest({
  url: `api/v1/deals/participants/${participantId}/`,
      method: "DELETE",
    });
  }

  async updateStatus(dealRoomId, status) {
    return makeApiRequest({
  url: `${this.basePath}${dealRoomId}/update_status/`,
      method: "POST",
      data: { status },
    });
  }

  async getByAccessCode(accessCode) {
    return makeApiRequest({
  url: `${this.basePath}by_access_code/`,
      method: "GET",
      params: { access_code: accessCode },
    });
  }

  async exportData(dealRoomId, format = "pdf") {
    return makeApiRequest({
  url: `${this.basePath}${dealRoomId}/export/`,
      method: "GET",
      params: { format },
    });
  }
}

export class DealDocumentService extends CrudService {
  constructor() {
    // Use trailing slash to avoid Django APPEND_SLASH redirect on POST
    super("api/v1/deals/documents/");
  }

  async uploadDocument(formData) {
    try {
      const res = await makeApiRequest({
        url: this.basePath, // already ends with '/'
        method: "POST",
        data: formData,
        contentType: "multipart/form-data",
      });
      // If request failed, makeApiRequest returns undefined; let catch handle it instead of mislabeling as 401
      if (!res) throw new Error('Upload failed. Please try again.');
      if (!res.id && !res.file && !res.title) {
        const err = new Error('Upload failed. Unexpected server response.');
        err.status = 500;
        throw err;
      }
      return res;
    } catch (error) {
      console.error('Document upload failed:', error);
      // Re-throw with more context
      if (error.status === 401) {
        throw new Error('Authentication required. Please log in to upload documents.');
      } else if (error.status === 403) {
        throw new Error(error.response?.data?.error || 'You do not have permission to upload documents to this deal room.');
      } else if (error.status === 413) {
        throw new Error('File too large. Please select a smaller file.');
      } else if (error.status === 400) {
        throw new Error(error.response?.data?.error || 'Invalid file format or missing required fields.');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Upload failed. Please try again.');
      }
    }
  }

  async delete(documentId, dealRoomId) {
    return makeApiRequest({
      url: `${this.basePath}${documentId}/`,
      method: "DELETE",
      params: dealRoomId ? { deal_room: dealRoomId } : undefined,
    });
  }

  async downloadDocument(documentId) {
    return makeApiRequest({
  url: `${this.basePath}${documentId}/download/`,
      method: "GET",
    });
  }

  async requestAccess(documentId, justification) {
    return makeApiRequest({
  url: `${this.basePath}${documentId}/request_access/`,
      method: "POST",
      data: { justification },
    });
  }

  async grantAccess(documentId, userId, accessLevel) {
    return makeApiRequest({
  url: `${this.basePath}${documentId}/grant_access/`,
      method: "POST",
      data: { user_id: userId, access_level: accessLevel },
    });
  }
}

export class DealActivityService extends CrudService {
  constructor() {
    super("api/v1/deals/activities/");
  }

  async getByDealRoom(dealRoomId) {
    return makeApiRequest({
  url: this.basePath,
      method: "GET",
      params: { deal_room: dealRoomId },
    });
  }

  async getRecentActivities(limit = 10) {
    return makeApiRequest({
      url: this.basePath,
      method: "GET",
      params: { limit },
    });
  }

   async addActivities(dealRoomId, activityData) {
    try {
      const res = await makeApiRequest({
  url: `${this.basePath}${dealRoomId}/add_activity/`,
        method: "POST",
        data: activityData,
      });
      // If request was redirected to login or blocked, makeApiRequest returns undefined.
      if (!res) {
        const err = new Error('Authentication required. Please log in to add activities.');
        err.status = 401;
        throw err;
      }
      // Expect a participant-like object back
      if (!res.id && !res.user && !res.user_email) {
        const err = new Error('Failed to add activity. Unexpected server response.');
        err.status = 500;
        throw err;
      }
      return res;
    } catch (error) {
      // Re-throw with better error context
      console.error('Add activity API error:', error);
      throw error;
    }
  }
}

export class DealMilestoneService extends CrudService {
  constructor() {
    super("api/v1/deals/milestones/");
  }

  async updateProgress(milestoneId, progressData) {
    return makeApiRequest({
      url: `${this.basePath}${milestoneId}/update_progress/`,
      method: "POST",
      data: progressData,
    });
  }

  async markComplete(milestoneId, completionNotes) {
    return makeApiRequest({
  url: `${this.basePath}${milestoneId}/complete/`,
      method: "POST",
      data: { completion_notes: completionNotes },
    });
  }

  async getByDealRoom(dealRoomId) {
    return makeApiRequest({
      url: this.basePath,
      method: "GET",
      params: { deal_room: dealRoomId },
    });
  }

  async uploadAttachment(milestoneId, file, description = '') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('milestone', milestoneId);
    if (description) {
      formData.append('description', description);
    }
    return makeApiRequest({
      url: 'api/v1/deals/milestone-attachments/',
      method: 'POST',
      data: formData,
      contentType: 'multipart/form-data',
    });
  }

  async getAttachments(milestoneId) {
    return makeApiRequest({
      url: 'api/v1/deals/milestone-attachments/',
      method: 'GET',
      params: { milestone: milestoneId },
    });
  }

  async deleteAttachment(attachmentId) {
    return makeApiRequest({
      url: `api/v1/deals/milestone-attachments/${attachmentId}/`,
      method: 'DELETE',
    });
  }
}

export class DealValuationService extends CrudService {
  constructor() {
    super("api/v1/deals/valuations/");
  }

  async createValuation(valuationData) {
    return makeApiRequest({
      url: this.basePath,
      method: "POST",
      data: valuationData,
    });
  }

  async runAnalysis(valuationId, analysisType) {
    return makeApiRequest({
      url: `${this.basePath}${valuationId}/run_analysis/`,
      method: "POST",
      data: { analysis_type: analysisType },
    });
  }
}

// Workforce Services
export class WorkforceJobService extends CrudService {
  constructor() {
    super("api/v1/workforce/jobs/");
  }

  async searchJobs(filters) {
    return makeApiRequest({
      url: this.basePath,
      method: "GET",
      params: filters,
    });
  }

  async applyToJob(jobId, applicationData) {
    return makeApiRequest({
      url: `${this.basePath}${jobId}/apply/`,
      method: "POST",
      data: applicationData,
    });
  }

  async saveJob(jobId) {
    return makeApiRequest({
      url: `${this.basePath}${jobId}/save/`,
      method: "POST",
    });
  }

  async unsaveJob(jobId) {
    return makeApiRequest({
      url: `${this.basePath}${jobId}/unsave/`,
      method: "POST",
    });
  }

  async getSavedJobs() {
    return makeApiRequest({
      url: `${this.basePath}saved/`,
      method: "GET",
    });
  }

  async getRecommendedJobs(profileId) {
    return makeApiRequest({
      url: `${this.basePath}recommended/`,
      method: "GET",
      params: { profile_id: profileId },
    });
  }
}

export class WorkforceProfileService extends CrudService {
  constructor() {
    super("api/v1/workforce/profiles/");
  }

  async updateSkills(profileId, skills) {
    return makeApiRequest({
      url: `${this.basePath}${profileId}/update_skills/`,
      method: "POST",
      data: { skills },
    });
  }

  async addExperience(profileId, experienceData) {
    return makeApiRequest({
      url: `${this.basePath}${profileId}/add_experience/`,
      method: "POST",
      data: experienceData,
    });
  }

  async addCertification(profileId, certificationData) {
    return makeApiRequest({
      url: `${this.basePath}${profileId}/add_certification/`,
      method: "POST",
      data: certificationData,
    });
  }

  async searchProfiles(filters) {
    return makeApiRequest({
      url: `${this.basePath}search/`,
      method: "GET",
      params: filters,
    });
  }

  async connectWithProfile(profileId, message) {
    return makeApiRequest({
      url: `${this.basePath}${profileId}/connect/`,
      method: "POST",
      data: { message },
    });
  }
}

export class WorkforceEventService extends CrudService {
  constructor() {
    super("api/v1/workforce/events/");
  }

  async registerForEvent(eventId) {
    return makeApiRequest({
      url: `${this.basePath}${eventId}/register/`,
      method: "POST",
    });
  }

  async unregisterFromEvent(eventId) {
    return makeApiRequest({
      url: `${this.basePath}${eventId}/unregister/`,
      method: "POST",
    });
  }

  async getUpcomingEvents() {
    return makeApiRequest({
      url: `${this.basePath}upcoming/`,
      method: "GET",
    });
  }

  async getEventsByType(eventType) {
    return makeApiRequest({
      url: this.basePath,
      method: "GET",
      params: { event_type: eventType },
    });
  }
}

// Duplicate AI Services removed - using the comprehensive versions above

// Logistics Services
export class LogisticsShipmentService extends CrudService {
  constructor() {
    super("api/v1/logistics/shipments/");
  }

  async trackShipment(trackingNumber) {
    return makeApiRequest({
      url: `${this.basePath}track/`,
      method: "GET",
      params: { tracking_number: trackingNumber },
    });
  }

  async updateStatus(shipmentId, status, location) {
    return makeApiRequest({
      url: `${this.basePath}${shipmentId}/update_status/`,
      method: "POST",
      data: { status, location },
    });
  }

  async createShipment(shipmentData) {
    try {
      return await this.create(shipmentData);
    } catch (error) {
      console.warn('Logistics shipment service unavailable, using local operation');
      // Return mock success for demo
      return { id: Date.now(), ...shipmentData, status: 'created' };
    }
  }
}

export class LogisticsTrackingService extends CrudService {
  constructor() {
    super("api/v1/logistics/tracking/");
  }

  async getTrackingData() {
    try {
      return await makeApiRequest({
        url: `${this.basePath}`,
        method: "GET",
      });
    } catch (error) {
      console.warn('Logistics tracking service unavailable, using fallback');
      throw error; // Let the component handle with mock data
    }
  }

  async trackShipment(trackingNumber) {
    try {
      return await makeApiRequest({
        url: `${this.basePath}track/`,
        method: "GET",
        params: { tracking_number: trackingNumber },
      });
    } catch (error) {
      console.warn('Tracking service unavailable for tracking number:', trackingNumber);
      throw error;
    }
  }
}

export class LogisticsInventoryService extends CrudService {
  constructor() {
    super("api/v1/logistics/inventory-items/");
  }

  async checkAvailability(itemId, quantity) {
    return makeApiRequest({
      url: `${this.basePath}${itemId}/check_availability/`,
      method: "GET",
      params: { quantity },
    });
  }

  async reserveItems(itemId, quantity, reservationData) {
    return makeApiRequest({
      url: `${this.basePath}${itemId}/reserve/`,
      method: "POST",
      data: { quantity, ...reservationData },
    });
  }

  async adjustStock(itemId, adjustmentData) {
    return makeApiRequest({
      url: `${this.basePath}${itemId}/adjust_stock/`,
      method: "POST",
      data: adjustmentData,
    });
  }

  async getLowStockAlerts() {
    return makeApiRequest({
      url: `${this.basePath}low_stock_alerts/`,
      method: "GET",
    });
  }

  async getCategories() {
    return makeApiRequest({
      url: `${this.basePath}categories/`,
      method: "GET",
    });
  }

  async getSummary() {
    return makeApiRequest({
      url: `${this.basePath}summary/`,
      method: "GET",
    });
  }

  async getMovements(itemId, params = {}) {
    return makeApiRequest({
      url: `${this.basePath}${itemId}/movements/`,
      method: "GET",
      params,
    });
  }

  async getRecentMovements(limit = 10) {
    return makeApiRequest({
      url: `${this.basePath}recent_movements/`,
      method: "GET",
      params: { limit },
    });
  }

  async getInventory() {
    try {
      const res = await this.getAll();
      // If paginated, return results
      if (res && Array.isArray(res.results)) return res.results;
      return res;
    } catch (error) {
      console.warn('Inventory service unavailable');
      throw error;
    }
  }

  async updateStock(itemId, quantity) {
    try {
      return await this.customRequest(`${itemId}/adjust_stock/`, 'POST', { quantity });
    } catch (error) {
      console.warn('Stock update service unavailable');
      throw error;
    }
  }

  // Enhanced inventory management methods
  async bulkUpdate(updates) {
    return makeApiRequest({
      url: `${this.basePath}bulk_update/`,
      method: "POST",
      data: { updates },
    });
  }

  async exportInventory(format = 'csv', filters = {}) {
    return makeApiRequest({
      url: `${this.basePath}export/`,
      method: "GET",
      params: { format, ...filters },
    });
  }

  async importInventory(fileData) {
    return makeApiRequest({
      url: `${this.basePath}import/`,
      method: "POST",
      data: fileData,
      contentType: "multipart/form-data",
    });
  }

  async getStockHistory(itemId, startDate, endDate) {
    return makeApiRequest({
      url: `${this.basePath}${itemId}/stock_history/`,
      method: "GET",
      params: { start_date: startDate, end_date: endDate },
    });
  }

  async generateBarcode(itemId) {
    return makeApiRequest({
      url: `${this.basePath}${itemId}/generate_barcode/`,
      method: "POST",
    });
  }

  async getValuationReport(filters = {}) {
    return makeApiRequest({
      url: `${this.basePath}valuation_report/`,
      method: "GET",
      params: filters,
    });
  }

  async getUsageAnalytics(itemId, period = '30d') {
    return makeApiRequest({
      url: `${this.basePath}${itemId}/usage_analytics/`,
      method: "GET",
      params: { period },
    });
  }

  async setReorderRules(itemId, rules) {
    return makeApiRequest({
      url: `${this.basePath}${itemId}/reorder_rules/`,
      method: "POST",
      data: rules,
    });
  }

  async getRecommendations(type = 'reorder') {
    return makeApiRequest({
      url: `${this.basePath}recommendations/`,
      method: "GET",
      params: { type },
    });
  }

  async cycleCounting(items) {
    return makeApiRequest({
      url: `${this.basePath}cycle_counting/`,
      method: "POST",
      data: { items },
    });
  }
}

export const dealRoomService = new DealRoomService();
export const dealDocumentService = new DealDocumentService();
export const dealActivityService = new DealActivityService();
export const dealMilestoneService = new DealMilestoneService();
export const dealValuationService = new DealValuationService();

export const workforceJobService = new WorkforceJobService();
export const workforceProfileService = new WorkforceProfileService();
export const workforceEventService = new WorkforceEventService();
export const workforceService = workforceProfileService; // Alias for backward compatibility

export const aiMatchingService = new AIMatchingService();
export const aiOpportunityService = new AIOpportunityService();
export const aiComplianceService = new AIComplianceService();
export const aiPredictiveService = new AIPredictiveService();

export const logisticsShipmentService = new LogisticsShipmentService();
export const logisticsTrackingService = new LogisticsTrackingService();
export const logisticsInventoryService = new LogisticsInventoryService();

// Inventory Management Services
export class InventoryWarehouseService extends CrudService {
  constructor() {
    super("api/v1/inventory/warehouses/");
  }
}

export class InventoryCategoryService extends CrudService {
  constructor() {
    super("api/v1/inventory/categories/");
  }
}

export class InventoryItemService extends CrudService {
  constructor() {
    super("api/v1/inventory/items/");
  }

  async reserve(itemId, quantity) {
    return makeApiRequest({
      url: `${this.basePath}${itemId}/reserve/`,
      method: "POST",
      data: { quantity },
    });
  }

  async unreserve(itemId, quantity) {
    return makeApiRequest({
      url: `${this.basePath}${itemId}/unreserve/`,
      method: "POST",
      data: { quantity },
    });
  }

  async getTransactions(itemId, page = 1, pageSize = 20) {
    return makeApiRequest({
      url: `${this.basePath}${itemId}/transactions/`,
      method: "GET",
      params: { page, page_size: pageSize },
    });
  }

  async getSummary() {
    return makeApiRequest({
      url: `${this.basePath}summary/`,
      method: "GET",
    });
  }
}

export class InventoryTransactionService extends CrudService {
  constructor() {
    super("api/v1/inventory/transactions/");
  }
}

export class InventoryAlertService extends CrudService {
  constructor() {
    super("api/v1/inventory/alerts/");
  }

  async acknowledge(alertId) {
    return makeApiRequest({
      url: `${this.basePath}${alertId}/acknowledge/`,
      method: "POST",
    });
  }
}

export class InventoryReportService extends CrudService {
  constructor() {
    super("api/v1/inventory/reports/");
  }
}

// Knowledge Hub Services
export class KnowledgeCategoryService extends CrudService {
  constructor() {
    super("api/v1/knowledge/categories/");
  }
}

export class KnowledgeTagService extends CrudService {
  constructor() {
    super("api/v1/knowledge/tags/");
  }

  async getBySlug(slug) {
    return makeApiRequest({
      url: `${this.basePath}${slug}/`,
      method: "GET",
    });
  }

  async getPopular() {
    return makeApiRequest({
      url: `${this.basePath}popular/`,
      method: "GET",
    });
  }
}

export class KnowledgeArticleService extends CrudService {
  constructor() {
    super("api/v1/knowledge/articles/");
  }

  async like(slug) {
    return makeApiRequest({
      url: `${this.basePath}${slug}/like/`,
      method: "POST",
    });
  }

  async share(slug) {
    return makeApiRequest({
      url: `${this.basePath}${slug}/share/`,
      method: "POST",
    });
  }

  async getFeatured() {
    return makeApiRequest({
      url: `${this.basePath}featured/`,
      method: "GET",
    });
  }

  async getTrending() {
    return makeApiRequest({
      url: `${this.basePath}trending/`,
      method: "GET",
    });
  }
}

export class KnowledgeForumService extends CrudService {
  constructor() {
    super("api/v1/knowledge/forums/");
  }

  async getTopics(slug, params = {}) {
    return makeApiRequest({
      url: `${this.basePath}${slug}/topics/`,
      method: "GET",
      params,
    });
  }

  async togglePrivacy(slug) {
    return makeApiRequest({
      url: `${this.basePath}${slug}/toggle_privacy/`,
      method: "POST",
    });
  }

  async getMembers(slug) {
    return makeApiRequest({
      url: `${this.basePath}${slug}/members/`,
      method: "GET",
    });
  }

  async addMember(slug, user_id) {
    return makeApiRequest({
      url: `${this.basePath}${slug}/add_member/`,
      method: "POST",
      data: { user_id },
    });
  }

  async removeMember(slug, user_id) {
    return makeApiRequest({
      url: `${this.basePath}${slug}/remove_member/`,
      method: "POST",
      data: { user_id },
    });
  }

  async invite(slug, { email, message }) {
    return makeApiRequest({
      url: `${this.basePath}${slug}/invite/`,
      method: "POST",
      data: { email, message },
    });
  }

  async getInvitations(slug) {
    return makeApiRequest({
      url: `${this.basePath}${slug}/invitations/`,
      method: "GET",
    });
  }

  async acceptInvite(token) {
    return makeApiRequest({
      url: `${this.basePath}accept_invite/`,
      method: "POST",
      data: { token },
    });
  }

  async declineInvite(token) {
    return makeApiRequest({
      url: `${this.basePath}decline_invite/`,
      method: "POST",
      data: { token },
    });
  }

  async requestJoin(slug) {
    return makeApiRequest({
      url: `${this.basePath}${slug}/request_join/`,
      method: "POST",
    });
  }

  async getJoinRequests(slug) {
    return makeApiRequest({
      url: `${this.basePath}${slug}/join_requests/`,
      method: "GET",
    });
  }

  async approveRequest(slug, request_id) {
    return makeApiRequest({
      url: `${this.basePath}${slug}/approve_request/`,
      method: "POST",
      data: { request_id },
    });
  }

  async rejectRequest(slug, request_id) {
    return makeApiRequest({
      url: `${this.basePath}${slug}/reject_request/`,
      method: "POST",
      data: { request_id },
    });
  }

  async leave(slug) {
    return makeApiRequest({
      url: `${this.basePath}${slug}/leave/`,
      method: "POST",
    });
  }
}

export class KnowledgeForumTopicService extends CrudService {
  constructor() {
    super("api/v1/knowledge/topics/");
  }

  async getPosts(slug, params = {}) {
    return makeApiRequest({
      url: `${this.basePath}${slug}/posts/`,
      method: "GET",
      params,
    });
  }

  async lock(slug) {
    return makeApiRequest({
      url: `${this.basePath}${slug}/lock/`,
      method: "POST",
    });
  }

  async unlock(slug) {
    return makeApiRequest({
      url: `${this.basePath}${slug}/unlock/`,
      method: "POST",
    });
  }

  async pin(slug) {
    return makeApiRequest({
      url: `${this.basePath}${slug}/pin/`,
      method: "POST",
    });
  }

  async unpin(slug) {
    return makeApiRequest({
      url: `${this.basePath}${slug}/unpin/`,
      method: "POST",
    });
  }

  async like(slug) {
    return makeApiRequest({
      url: `${this.basePath}${slug}/like/`,
      method: "POST",
    });
  }
}

export class KnowledgeForumPostService extends CrudService {
  constructor() {
    super("api/v1/knowledge/posts/");
  }

  async like(postId) {
    return makeApiRequest({
      url: `${this.basePath}${postId}/like/`,
      method: "POST",
    });
  }

  async getReplies(postId) {
    return makeApiRequest({
      url: `${this.basePath}${postId}/replies/`,
      method: "GET",
    });
  }
}

export class KnowledgeModerationService extends CrudService {
  constructor() {
    super("api/v1/knowledge/moderation/");
  }

  async approve(itemId, notes = '') {
    return makeApiRequest({
      url: `${this.basePath}${itemId}/approve/`,
      method: "POST",
      data: { notes },
    });
  }

  async reject(itemId, notes = '') {
    return makeApiRequest({
      url: `${this.basePath}${itemId}/reject/`,
      method: "POST",
      data: { notes },
    });
  }
}

export class KnowledgeInteractionService extends CrudService {
  constructor() {
    super("api/v1/knowledge/interactions/");
  }
}

export class KnowledgeSearchService extends CrudService {
  constructor() {
    super("api/v1/knowledge/search/");
  }

  async search(params) {
    try {
      const response = await this.api.get('', { params });
      return response.data;
    } catch (error) {
      console.error('Error performing search:', error);
      throw error;
    }
  }
}

// Export service instances
export const inventoryWarehouseService = new InventoryWarehouseService();
export const inventoryCategoryService = new InventoryCategoryService();
export const inventoryItemService = new InventoryItemService();
export const inventoryTransactionService = new InventoryTransactionService();
export const inventoryAlertService = new InventoryAlertService();
export const inventoryReportService = new InventoryReportService();

export const knowledgeCategoryService = new KnowledgeCategoryService();
export const knowledgeTagService = new KnowledgeTagService();
export const knowledgeArticleService = new KnowledgeArticleService();
export const knowledgeForumService = new KnowledgeForumService();
export const knowledgeForumTopicService = new KnowledgeForumTopicService();
export const knowledgeForumPostService = new KnowledgeForumPostService();
export const knowledgeModerationService = new KnowledgeModerationService();
export const knowledgeInteractionService = new KnowledgeInteractionService();
export const knowledgeSearchService = new KnowledgeSearchService();
