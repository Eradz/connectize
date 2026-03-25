import { makeApiRequest, clearTokenCache } from "../lib/helpers";
import { setSession } from "../lib/session";
import { queryClient } from "../lib/utils";

/**
 * Fetch which SSO providers are enabled from the backend.
 * GET /api/auth/sso/providers/
 */
export const getSSOProviders = async () => {
  try {
    const response = await makeApiRequest({
      url: "api/auth/sso/providers/",
      method: "GET",
      type: "public",
    });
    return response?.results || response?.data || null;
  } catch {
    return null;
  }
};

/**
 * Handle SSO login response — store tokens in session.
 */
const handleSSOLoginResponse = (response) => {
  const payload = response?.results || response?.data || response;
  const tokens = payload?.tokens;

  if (tokens?.access && tokens?.refresh) {
    clearTokenCache();
    queryClient.clear();
    setSession(payload);
    return true;
  }
  return false;
};

/**
 * POST Google access_token to backend for verification and JWT issuance.
 */
export const googleSSOLogin = async (accessToken) => {
  try {
    const response = await makeApiRequest({
      url: "api/auth/sso/google/",
      method: "POST",
      data: { access_token: accessToken },
      type: "public",
    });
    return handleSSOLoginResponse(response);
  } catch {
    return false;
  }
};

/**
 * POST Apple credential to backend.
 */
export const appleSSOLogin = async ({ id_token, code, first_name, last_name }) => {
  try {
    const response = await makeApiRequest({
      url: "api/auth/sso/apple/",
      method: "POST",
      data: { id_token, code, first_name, last_name },
      type: "public",
    });
    return handleSSOLoginResponse(response);
  } catch {
    return false;
  }
};

/**
 * POST LinkedIn authorization code to backend.
 */
export const linkedinSSOLogin = async ({ code, redirect_uri }) => {
  try {
    const response = await makeApiRequest({
      url: "api/auth/sso/linkedin/",
      method: "POST",
      data: { code, redirect_uri },
      type: "public",
    });
    return handleSSOLoginResponse(response);
  } catch {
    return false;
  }
};

/**
 * Check if an email domain has enterprise SSO configured.
 */
export const checkSSODomain = async (email) => {
  try {
    const response = await makeApiRequest({
      url: "api/auth/sso/check-domain/",
      method: "POST",
      data: { email },
      type: "public",
    });
    return response?.results || response?.data || null;
  } catch {
    return null;
  }
};

/**
 * Exchange enterprise OIDC authorization code for JWT tokens.
 */
export const enterpriseSSOCallback = async ({ config_id, code, redirect_uri }) => {
  try {
    const response = await makeApiRequest({
      url: "api/auth/sso/enterprise/callback/",
      method: "POST",
      data: { config_id, code, redirect_uri },
      type: "public",
    });
    return {
      success: handleSSOLoginResponse(response),
      message: response?.message || response?.results?.message || null,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error?.response?.data?.errors?.[0]?.message ||
        error?.response?.data?.detail ||
        "Company SSO sign-in failed.",
    };
  }
};

export const getEnterpriseSSOConfigs = async () => {
  const response = await makeApiRequest({
    url: "api/auth/sso/enterprise/configs/",
    method: "GET",
  });

  return response?.results || response?.data || [];
};

export const createEnterpriseSSOConfig = async (data) => {
  return await makeApiRequest({
    url: "api/auth/sso/enterprise/configs/",
    method: "POST",
    data,
  });
};

export const updateEnterpriseSSOConfig = async (configId, data) => {
  return await makeApiRequest({
    url: `api/auth/sso/enterprise/configs/${configId}/`,
    method: "PATCH",
    data,
  });
};

export const deleteEnterpriseSSOConfig = async (configId) => {
  return await makeApiRequest({
    url: `api/auth/sso/enterprise/configs/${configId}/`,
    method: "DELETE",
  });
};

export const getEnterpriseDomainVerificationStatus = async (configId) => {
  const response = await makeApiRequest({
    url: `api/auth/sso/enterprise/configs/${configId}/domain-verification/`,
    method: "GET",
  });

  return response?.results || response?.data || null;
};

export const verifyEnterpriseDomains = async (configId) => {
  const response = await makeApiRequest({
    url: `api/auth/sso/enterprise/configs/${configId}/domain-verification/`,
    method: "POST",
  });

  return response?.results || response?.data || null;
};

export const regenerateEnterpriseDomainToken = async (configId) => {
  const response = await makeApiRequest({
    url: `api/auth/sso/enterprise/configs/${configId}/domain-verification/reset/`,
    method: "POST",
  });

  return response?.results || response?.data || null;
};
