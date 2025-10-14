/**
 * Content Moderation API Services
 * App Store Compliance - Report, Flag, and Block functionality
 */
import { toast } from "sonner";
import { makeApiRequest } from "../lib/helpers";

/**
 * Report objectionable content (post, comment, profile, etc.)
 * @param {Object} params - Report parameters
 * @param {string} params.content_type - Type: 'post', 'comment', 'profile', 'message'
 * @param {string} params.content_id - ID of the content being reported
 * @param {number} params.reported_user_id - ID of user who created the content (optional)
 * @param {string} params.report_type - Type: 'spam', 'harassment', 'hate_speech', 'violence', 'nudity', 'fake_profile', 'inappropriate', 'other'
 * @param {string} params.description - Detailed description of the issue
 */
export const reportContent = async ({
  content_type,
  content_id,
  reported_user_id,
  report_type,
  description,
}) => {
  try {
    const response = await makeApiRequest({
      url: "api/content-reports/report_content/",
      method: "POST",
      data: {
        content_type,
        content_id,
        reported_user_id,
        report_type,
        description,
      },
    });

    toast.success("Content reported successfully. We'll review it within 24 hours.");
    return response;
  } catch (error) {
    toast.error("Failed to report content. Please try again.");
    throw error;
  }
};

/**
 * Get all reports made by the current user
 */
export const getMyReports = async () => {
  try {
    const response = await makeApiRequest({
      url: "api/content-reports/my_reports/",
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
};

/**
 * Block a user
 * @param {number} user_id - ID of user to block
 * @param {string} reason - Optional reason for blocking
 */
export const blockUser = async (user_id, reason = "") => {
  try {
    const response = await makeApiRequest({
      url: "api/blocked-users/block_user/",
      method: "POST",
      data: { user_id, reason },
    });

    toast.success(`User blocked successfully`);
    return response;
  } catch (error) {
    toast.error("Failed to block user. Please try again.");
    throw error;
  }
};

/**
 * Unblock a user
 * @param {number} user_id - ID of user to unblock
 */
export const unblockUser = async (user_id) => {
  try {
    const response = await makeApiRequest({
      url: "api/blocked-users/unblock_user/",
      method: "POST",
      data: { user_id },
    });

    toast.success(`User unblocked successfully`);
    return response;
  } catch (error) {
    toast.error("Failed to unblock user. Please try again.");
    throw error;
  }
};

/**
 * Get list of blocked users
 */
export const getBlockedUsers = async () => {
  try {
    const response = await makeApiRequest({
      url: "api/blocked-users/my_blocked_users/",
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Error fetching blocked users:", error);
    return [];
  }
};

/**
 * Check if a specific user is blocked
 * @param {number} user_id - ID of user to check
 */
export const isUserBlocked = async (user_id) => {
  try {
    const response = await makeApiRequest({
      url: `api/blocked-users/is_blocked/?user_id=${user_id}`,
      method: "GET",
    });
    return response.is_blocked || false;
  } catch (error) {
    console.error("Error checking block status:", error);
    return false;
  }
};

/**
 * Block a company
 * @param {number} company_id - ID of company to block
 * @param {string} reason - Optional reason for blocking
 */
export const blockCompany = async (company_id, reason = "") => {
  try {
    const response = await makeApiRequest({
      url: "api/blocked-companies/block_company/",
      method: "POST",
      data: { company_id, reason },
    });

    toast.success(`Company blocked successfully`);
    return response;
  } catch (error) {
    toast.error("Failed to block company. Please try again.");
    throw error;
  }
};

/**
 * Unblock a company
 * @param {number} company_id - ID of company to unblock
 */
export const unblockCompany = async (company_id) => {
  try {
    const response = await makeApiRequest({
      url: "api/blocked-companies/unblock_company/",
      method: "POST",
      data: { company_id },
    });

    toast.success(`Company unblocked successfully`);
    return response;
  } catch (error) {
    toast.error("Failed to unblock company. Please try again.");
    throw error;
  }
};

/**
 * Get list of blocked companies
 */
export const getBlockedCompanies = async () => {
  try {
    const response = await makeApiRequest({
      url: "api/blocked-companies/my_blocked_companies/",
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Error fetching blocked companies:", error);
    return [];
  }
};

/**
 * Check if a specific company is blocked
 * @param {number} company_id - ID of company to check
 */
export const isCompanyBlocked = async (company_id) => {
  try {
    const response = await makeApiRequest({
      url: `api/blocked-companies/is_blocked/?company_id=${company_id}`,
      method: "GET",
    });
    return response.is_blocked || false;
  } catch (error) {
    console.error("Error checking company block status:", error);
    return false;
  }
};

/**
 * Accept Terms of Service
 * @param {string} terms_version - Version of terms being accepted (default: "1.0")
 */
export const acceptTerms = async (terms_version = "1.0") => {
  try {
    const response = await makeApiRequest({
      url: "api/terms/accept_terms/",
      method: "POST",
      data: { terms_version },
    });
    return response;
  } catch (error) {
    console.error("Error accepting terms:", error);
    throw error;
  }
};

/**
 * Check if user has accepted the latest terms
 */
export const checkTermsAcceptance = async () => {
  try {
    const response = await makeApiRequest({
      url: "api/terms/check_acceptance/",
      method: "GET",
    });
    return response.has_accepted || false;
  } catch (error) {
    console.error("Error checking terms acceptance:", error);
    return false;
  }
};
