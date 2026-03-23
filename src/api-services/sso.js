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
      type: "sso-providers",
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
 * POST Google credential to backend for verification and JWT issuance.
 */
export const googleSSOLogin = async (credential) => {
  try {
    const response = await makeApiRequest({
      url: "api/auth/sso/google/",
      method: "POST",
      data: { credential },
      type: "sso-google",
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
      type: "sso-apple",
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
      type: "sso-linkedin",
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
      type: "sso-check-domain",
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
      type: "sso-enterprise",
    });
    return handleSSOLoginResponse(response);
  } catch {
    return false;
  }
};
