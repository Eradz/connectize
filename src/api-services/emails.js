import { toast } from "sonner";
import { makeApiRequest } from "../lib/helpers";

/**
 * List the current user's emails (primary + secondary, verified + pending).
 */
export const getMyEmails = async () => {
  try {
    const response = await makeApiRequest({
      url: "api/auth/emails/",
      method: "GET",
    });
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error("Error fetching emails:", error);
    return [];
  }
};

/**
 * Add a new (unverified) email to the account. Triggers a verification code.
 */
export const addEmail = async (email) => {
  try {
    const response = await makeApiRequest({
      url: "api/auth/emails/",
      method: "POST",
      data: { email },
    });
    return response?.results ?? null;
  } catch (error) {
    toast.error(error?.response?.data?.errors?.[0]?.message || "Failed to add email");
    throw error;
  }
};

/**
 * Verify a pending email with its 6-digit code.
 */
export const verifyEmailCode = async (emailId, code) => {
  const response = await makeApiRequest({
    url: `api/auth/emails/${emailId}/verify/`,
    method: "POST",
    data: { code },
  });
  return response?.results ?? null;
};

/**
 * Resend the verification code for a pending email.
 */
export const resendEmailCode = async (emailId) => {
  try {
    return await makeApiRequest({
      url: `api/auth/emails/${emailId}/resend/`,
      method: "POST",
    });
  } catch (error) {
    toast.error(error?.response?.data?.errors?.[0]?.message || "Failed to resend code");
    throw error;
  }
};

/**
 * Make a verified email the account's primary (login) email.
 */
export const setPrimaryEmail = async (emailId) => {
  try {
    const response = await makeApiRequest({
      url: `api/auth/emails/${emailId}/set-primary/`,
      method: "POST",
    });
    return response?.results ?? null;
  } catch (error) {
    toast.error(error?.response?.data?.errors?.[0]?.message || "Failed to set primary email");
    throw error;
  }
};

/**
 * Remove a non-primary email from the account.
 */
export const removeEmail = async (emailId) => {
  try {
    return await makeApiRequest({
      url: `api/auth/emails/${emailId}/`,
      method: "DELETE",
    });
  } catch (error) {
    toast.error(error?.response?.data?.errors?.[0]?.message || "Failed to remove email");
    throw error;
  }
};
