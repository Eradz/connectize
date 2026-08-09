import { toast } from "sonner";
import { makeApiRequest } from "../lib/helpers";

/**
 * Invite a not-yet-registered company to join Connectize, sent from an
 * existing company's profile.
 */
export const inviteCompany = async (companySlug, { email, company_name, message }) => {
  try {
    const response = await makeApiRequest({
      url: `api/companies/${companySlug}/invite/`,
      method: "POST",
      data: { email, company_name, message },
    });
    toast.success(`Invitation sent to ${email}`);
    return response;
  } catch (error) {
    toast.error(error?.response?.data?.detail || "Failed to send invitation");
    throw error;
  }
};

/**
 * List the invites a company's owner has sent, with status.
 */
export const getCompanyInvites = async (companySlug) => {
  try {
    return await makeApiRequest({
      url: `api/companies/${companySlug}/invites/`,
      method: "GET",
    });
  } catch (error) {
    console.error("Error fetching company invites:", error);
    return [];
  }
};
