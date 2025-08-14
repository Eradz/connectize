import { CrudService } from "./crud";
import { makeApiRequest } from "../lib/helpers";
import { 
  aiMatchingService as enhancedAIMatchingService, 
  aiOpportunityService as enhancedAIOpportunityService, 
  aiComplianceService as enhancedAIComplianceService 
} from "./ai-mock";

// Deal Management Services
export class DealRoomService extends CrudService {
  constructor() {
    super("api/v1/deals/deal-rooms");
  }

  async addParticipant(dealRoomId, participantData) {
    return makeApiRequest({
      url: `${this.basePath}/${dealRoomId}/add_participant/`,
      method: "POST",
      data: participantData,
    });
  }

  async removeParticipant(dealRoomId, participantId) {
    return makeApiRequest({
      url: `${this.basePath}/${dealRoomId}/remove_participant/`,
      method: "POST",
      data: { participant_id: participantId },
    });
  }

  async updateStatus(dealRoomId, status) {
    return makeApiRequest({
      url: `${this.basePath}/${dealRoomId}/update_status/`,
      method: "POST",
      data: { status },
    });
  }

  async getByAccessCode(accessCode) {
    return makeApiRequest({
      url: `${this.basePath}/by_access_code/`,
      method: "GET",
      params: { access_code: accessCode },
    });
  }

  async exportData(dealRoomId, format = "pdf") {
    return makeApiRequest({
      url: `${this.basePath}/${dealRoomId}/export/`,
      method: "GET",
      params: { format },
    });
  }
}

export class DealDocumentService extends CrudService {
  constructor() {
    super("api/v1/deals/documents");
  }

  async uploadDocument(formData) {
    return makeApiRequest({
      url: this.basePath,
      method: "POST",
      data: formData,
      contentType: "multipart/form-data",
    });
  }

  async downloadDocument(documentId) {
    return makeApiRequest({
      url: `${this.basePath}/${documentId}/download/`,
      method: "GET",
    });
  }

  async requestAccess(documentId, justification) {
    return makeApiRequest({
      url: `${this.basePath}/${documentId}/request_access/`,
      method: "POST",
      data: { justification },
    });
  }

  async grantAccess(documentId, userId, accessLevel) {
    return makeApiRequest({
      url: `${this.basePath}/${documentId}/grant_access/`,
      method: "POST",
      data: { user_id: userId, access_level: accessLevel },
    });
  }
}

export class DealActivityService extends CrudService {
  constructor() {
    super("api/v1/deals/activities");
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
}

export class DealMilestoneService extends CrudService {
  constructor() {
    super("api/v1/deals/milestones");
  }

  async updateProgress(milestoneId, progressData) {
    return makeApiRequest({
      url: `${this.basePath}/${milestoneId}/update_progress/`,
      method: "POST",
      data: progressData,
    });
  }

  async markComplete(milestoneId, completionNotes) {
    return makeApiRequest({
      url: `${this.basePath}/${milestoneId}/mark_complete/`,
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
}

export class DealValuationService extends CrudService {
  constructor() {
    super("api/v1/deals/valuations");
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
      url: `${this.basePath}/${valuationId}/run_analysis/`,
      method: "POST",
      data: { analysis_type: analysisType },
    });
  }
}

// Workforce Services
export class WorkforceJobService extends CrudService {
  constructor() {
    super("api/v1/workforce/jobs");
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
      url: `${this.basePath}/${jobId}/apply/`,
      method: "POST",
      data: applicationData,
    });
  }

  async saveJob(jobId) {
    return makeApiRequest({
      url: `${this.basePath}/${jobId}/save/`,
      method: "POST",
    });
  }

  async unsaveJob(jobId) {
    return makeApiRequest({
      url: `${this.basePath}/${jobId}/unsave/`,
      method: "POST",
    });
  }

  async getRecommendedJobs(profileId) {
    return makeApiRequest({
      url: `${this.basePath}/recommended/`,
      method: "GET",
      params: { profile_id: profileId },
    });
  }
}

export class WorkforceProfileService extends CrudService {
  constructor() {
    super("api/v1/workforce/profiles");
  }

  async updateSkills(profileId, skills) {
    return makeApiRequest({
      url: `${this.basePath}/${profileId}/update_skills/`,
      method: "POST",
      data: { skills },
    });
  }

  async addExperience(profileId, experienceData) {
    return makeApiRequest({
      url: `${this.basePath}/${profileId}/add_experience/`,
      method: "POST",
      data: experienceData,
    });
  }

  async addCertification(profileId, certificationData) {
    return makeApiRequest({
      url: `${this.basePath}/${profileId}/add_certification/`,
      method: "POST",
      data: certificationData,
    });
  }

  async searchProfiles(filters) {
    return makeApiRequest({
      url: this.basePath,
      method: "GET",
      params: filters,
    });
  }

  async connectWithProfile(profileId, message) {
    return makeApiRequest({
      url: `${this.basePath}/${profileId}/connect/`,
      method: "POST",
      data: { message },
    });
  }
}

export class WorkforceEventService extends CrudService {
  constructor() {
    super("api/v1/workforce/events");
  }

  async registerForEvent(eventId) {
    return makeApiRequest({
      url: `${this.basePath}/${eventId}/register/`,
      method: "POST",
    });
  }

  async unregisterFromEvent(eventId) {
    return makeApiRequest({
      url: `${this.basePath}/${eventId}/unregister/`,
      method: "POST",
    });
  }

  async getUpcomingEvents() {
    return makeApiRequest({
      url: `${this.basePath}/upcoming/`,
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

// AI Services
export class AIMatchingService {
  async getMatchProfiles() {
    return makeApiRequest({
      url: "api/v1/ai/match-profiles/",
      method: "GET",
    });
  }

  async createMatchProfile(profileData) {
    return makeApiRequest({
      url: "api/v1/ai/match-profiles/",
      method: "POST",
      data: profileData,
    });
  }

  async getMatches() {
    return makeApiRequest({
      url: "api/v1/ai/matches/",
      method: "GET",
    });
  }

  async viewMatch(matchId) {
    return makeApiRequest({
      url: `api/v1/ai/matches/${matchId}/view/`,
      method: "POST",
    });
  }
}

export class AIOpportunityService {
  async getOpportunities() {
    return makeApiRequest({
      url: "api/v1/ai/opportunities/",
      method: "GET",
    });
  }

  async expressInterest(opportunityId) {
    return makeApiRequest({
      url: `api/v1/ai/opportunities/${opportunityId}/express-interest/`,
      method: "POST",
    });
  }
}

export class AIComplianceService {
  async getComplianceAlerts() {
    return makeApiRequest({
      url: "api/v1/ai/compliance-alerts/",
      method: "GET",
    });
  }

  async resolveAlert(alertId) {
    return makeApiRequest({
      url: `api/v1/ai/compliance-alerts/${alertId}/resolve/`,
      method: "POST",
    });
  }
}

// Logistics Services
export class LogisticsShipmentService extends CrudService {
  constructor() {
    super("api/v1/logistics/shipments");
  }

  async trackShipment(trackingNumber) {
    return makeApiRequest({
      url: `${this.basePath}/track/`,
      method: "GET",
      params: { tracking_number: trackingNumber },
    });
  }

  async updateStatus(shipmentId, status, location) {
    return makeApiRequest({
      url: `${this.basePath}/${shipmentId}/update_status/`,
      method: "POST",
      data: { status, location },
    });
  }
}

export class LogisticsInventoryService extends CrudService {
  constructor() {
    super("api/v1/logistics/inventory");
  }

  async checkAvailability(itemId, quantity) {
    return makeApiRequest({
      url: `${this.basePath}/${itemId}/check_availability/`,
      method: "GET",
      params: { quantity },
    });
  }

  async reserveItems(itemId, quantity, reservationData) {
    return makeApiRequest({
      url: `${this.basePath}/${itemId}/reserve/`,
      method: "POST",
      data: { quantity, ...reservationData },
    });
  }
}

// Trust & Verification Services
export class TrustVerificationService extends CrudService {
  constructor() {
    super("api/v1/trust/verifications");
  }

  async submitForVerification(verificationType, documentData) {
    return makeApiRequest({
      url: this.basePath,
      method: "POST",
      data: {
        verification_type: verificationType,
        ...documentData,
      },
      contentType: "multipart/form-data",
    });
  }

  async getVerificationStatus(verificationId) {
    return makeApiRequest({
      url: `${this.basePath}/${verificationId}/status/`,
      method: "GET",
    });
  }
}

export class TrustReputationService {
  async getRating(userId) {
    return makeApiRequest({
      url: `api/v1/trust/ratings/user/${userId}/`,
      method: "GET",
    });
  }

  async submitRating(userId, ratingData) {
    return makeApiRequest({
      url: "api/v1/trust/ratings/",
      method: "POST",
      data: {
        rated_user: userId,
        ...ratingData,
      },
    });
  }

  async getReviews(userId) {
    return makeApiRequest({
      url: `api/v1/trust/ratings/user/${userId}/reviews/`,
      method: "GET",
    });
  }
}

// Specialized Tools Services
export class SpecializedEquipmentService extends CrudService {
  constructor() {
    super("api/v1/tools/equipment");
  }

  async searchEquipment(filters) {
    return makeApiRequest({
      url: this.basePath,
      method: "GET",
      params: filters,
    });
  }

  async requestQuote(equipmentId, quoteData) {
    return makeApiRequest({
      url: `${this.basePath}/${equipmentId}/request_quote/`,
      method: "POST",
      data: quoteData,
    });
  }

  async checkAvailability(equipmentId, startDate, endDate) {
    return makeApiRequest({
      url: `${this.basePath}/${equipmentId}/check_availability/`,
      method: "GET",
      params: { start_date: startDate, end_date: endDate },
    });
  }
}

export class SpecializedHSEService extends CrudService {
  constructor() {
    super("api/v1/tools/hse");
  }

  async submitIncident(incidentData) {
    return makeApiRequest({
      url: `${this.basePath}/incidents/`,
      method: "POST",
      data: incidentData,
    });
  }

  async getComplianceStatus(facilityId) {
    return makeApiRequest({
      url: `${this.basePath}/compliance/${facilityId}/`,
      method: "GET",
    });
  }

  async scheduleInspection(inspectionData) {
    return makeApiRequest({
      url: `${this.basePath}/inspections/`,
      method: "POST",
      data: inspectionData,
    });
  }
}

// Service Instances
export const dealRoomService = new DealRoomService();
export const dealDocumentService = new DealDocumentService();
export const dealActivityService = new DealActivityService();
export const dealMilestoneService = new DealMilestoneService();
export const dealValuationService = new DealValuationService();

export const workforceJobService = new WorkforceJobService();
export const workforceProfileService = new WorkforceProfileService();
export const workforceEventService = new WorkforceEventService();

export const aiMatchingService = enhancedAIMatchingService;
export const aiOpportunityService = enhancedAIOpportunityService;
export const aiComplianceService = enhancedAIComplianceService;

export const logisticsShipmentService = new LogisticsShipmentService();
export const logisticsInventoryService = new LogisticsInventoryService();

export const trustVerificationService = new TrustVerificationService();
export const trustReputationService = new TrustReputationService();

export const specializedEquipmentService = new SpecializedEquipmentService();
export const specializedHSEService = new SpecializedHSEService();
