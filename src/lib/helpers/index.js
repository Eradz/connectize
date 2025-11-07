import axios from "axios";
import { toast } from "sonner";
import { getSession, removeSession, setSession } from "../session";

// Constants
export const REGISTER_EMAIL_KEY = "register_email";
export const EMAIL_VERIFIED_KEY = "email_verified";

const toastExtras = ({ error, label, urlTo = "/" }) => ({
  description: error.response.data.errors[0].message,
  duration: 15000,
  action: {
    label,
    onClick: () => (window.location.href = urlTo),
  },
});

// Utility Function
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const frontendUrl = () => window.location.origin;

export function goToLogin() {
  removeSession();
  const pathname = window.location.pathname || "/";
  const authPaths = new Set([
    "/login",
    "/signup",
    "/reset-password",
    "/confirm-reset-password",
    "/verify-account",
    "/reactivate-account",
  ]);

  // Avoid redirecting back to login (or other auth pages) as the "next" target
  const nextPath = Array.from(authPaths).some((p) => pathname.startsWith(p))
    ? "/"
    : pathname;

  const url = nextPath && nextPath !== "/" ? `/login?next=${nextPath}` : "/login";
  window.location.replace(url);
}

// Configure Axios Defaults
export const baseURL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? "http://localhost:8000" : "https://about.connectize.co");

axios.defaults.withCredentials = true;

// Mutex for Refresh Token
let isRefreshing = false;
let refreshPromise = null;
let accessToken = null;
let accessTokenExpiry = null;

let retries = 0;

// Clear token cache - call this after login or when session changes
export function clearTokenCache() {
  console.log("🧹 Clearing token cache");
  accessToken = null;
  accessTokenExpiry = null;
  isRefreshing = false;
  refreshPromise = null;
}

export async function refreshToken() {
  const session = getSession();

  if (!session?.tokens?.refresh) {
    console.warn('No refresh token available');
    return undefined;
  }

  // Check if refresh token looks valid (basic validation)
  if (typeof session.tokens.refresh !== 'string' || session.tokens.refresh.length < 10) {
    console.warn('Invalid refresh token format');
    removeSession();
    return undefined;
  }

  if (isRefreshing) {
    return refreshPromise;
  }

  isRefreshing = true;

  try {
    refreshPromise = (async () => {
      console.log('Attempting token refresh...');
      const { data } = await axios.post(`${baseURL}/api/auth/refresh-token/`, {
        refresh: session.tokens.refresh,
      });

      // Validate response
      if (!data?.access || !data?.refresh) {
        throw new Error('Invalid refresh response format');
      }

      const newTokens = {
        access: data.access,
        refresh: data.refresh,
      };

      setSession({
        ...session,
        tokens: newTokens,
      });

      accessToken = newTokens.access;
      accessTokenExpiry = null; // No expiration - tokens are long-lived

      console.log('Token refresh successful');
      return "Bearer " + newTokens.access;
    })();

    const authorizationHeader = await refreshPromise;
    return { Authorization: authorizationHeader };
  } catch (error) {
    console.error('Token refresh failed:', error);
    
    // If refresh fails, clear session and redirect to login
    removeSession();
    accessToken = null;
    accessTokenExpiry = null;
    
    // Only redirect if we're not already on an auth page
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
      goToLogin();
    }
    
    return undefined;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

let hasNotifiedOffline = false;

export async function getAuthorizationHeader() {
  console.log('🔑 getAuthorizationHeader: Starting auth check...');
  
  if (accessToken && Date.now() < accessTokenExpiry) {
    console.log('✅ Using cached access token');
    return { Authorization: "Bearer " + accessToken };
  }

  // Try to use access token from session first (avoids unnecessary refresh right after login)
  try {
    console.log('📦 Checking session for tokens...');
    const session = getSession();
    console.log('🔍 Session result:', session ? 'Found session data' : 'No session data');
    
    const tokenFromSession = session?.tokens?.access;
    if (tokenFromSession && tokenFromSession !== accessToken) {
      console.log('✅ Found fresh token from session');
      // Fresh token from session, update cache
      accessToken = tokenFromSession;
      // Set a conservative TTL; backend JWT is long-lived, but we'll refresh periodically
      accessTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
      return { Authorization: "Bearer " + accessToken };
    } else if (tokenFromSession) {
      console.log('⚠️ Session token same as cached token');
    } else {
      console.log('❌ No access token in session');
    }
  } catch (e) {
    // Ignore and fallback to refresh flow
    console.warn('Session token retrieval failed:', e);
  }

  // Try refresh if we have a refresh token
  console.log('🔄 Checking for refresh token...');
  const session = getSession();
  if (session?.tokens?.refresh) {
    console.log('🔄 Attempting token refresh...');
    const refreshedToken = await refreshToken();
    if (refreshedToken?.Authorization) {
      console.log('✅ Token refresh successful');
      return refreshedToken;
    } else {
      console.log('❌ Token refresh failed');
    }
  } else {
    console.log('❌ No refresh token available');
  }

  // No valid auth header available
  console.warn('❌ No valid authorization available');
  return null;
}

// Build absolute URL with proper path normalization
const buildUrl = (baseUrl, path) => {
  const cleanBase = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
  const cleanPath = path.replace(/^\/+/, ''); // Remove leading slashes
  return `${cleanBase}/${cleanPath}`;
};

export async function makeApiRequest({
  url,
  method,
  data,
  resetForm,
  type = "",
  contentType = "application/json",
  params,
  onUploadProgress,
}) {
  // For URLs starting with /api, use them directly for Vite proxy in development
  const requestUrl =
    url.startsWith("/api") && import.meta.env.DEV
      ? url
      : buildUrl(baseURL, url);

  try {
    const authorization = await getAuthorizationHeader();

    if ((!authorization || !authorization.Authorization) && !type.startsWith("auth") && type !== "public") {
      console.error('Authentication failed for protected route:', url, 'No valid authorization token available');
      goToLogin();
      throw new Error(`Authentication required for ${url} - redirecting to login`);
    }

    // Build headers, omitting Content-Type for FormData so axios sets boundary
    const headers = { ...(authorization || {}) };
    const isFormData = (typeof FormData !== 'undefined') && data instanceof FormData;
    if (!isFormData && contentType) {
      headers["Content-Type"] = contentType;
    }

    console.log('Making API request:', { url: buildUrl(baseURL, url), method });

    const response = await axios({
      url: buildUrl(baseURL, url),
      method,
      data,
      headers,
      params,
      onUploadProgress,
      timeout: 15000, // 15 second timeout to prevent hanging requests
    });

    hasNotifiedOffline = false;

    if (response.status >= 200 && response.status <= 204) {
      resetForm?.();
      const responseMessage = response.data.message;

      if (
        response.data.success &&
        responseMessage &&
        !url.includes("notification")
      ) {
        toast.success(responseMessage);
      }
      // Only log successful responses for debugging if needed
      if (method !== 'GET') {
        console.log('API request successful:', { url, status: response.status });
      }
      return response.data;
    }
  } catch (error) {
    console.error('API request failed:', { url, error: error.message, status: error.response?.status });
    
    if (!navigator.onLine && !hasNotifiedOffline) {
      hasNotifiedOffline = true;
      toast.error("Network error. Please check your internet connection.");
      setTimeout(() => (hasNotifiedOffline = false), 30000);
      return;
    }

    if (error.status === 417) {
      toast("Account Deactivated", {
        ...toastExtras({
          error,
          label: "Reactivate Now",
          urlTo: "/reactivate-account",
        }),
      });
      return;
    }
    if (error.status === 418) {
      toast("Account Reactivated", {
        ...toastExtras({
          error,
          label: "Login",
          urlTo: "/login",
        }),
      });
      return;
    }
    const errorCode = error?.response?.data?.code;

    if (errorCode === "token_not_valid") {
      // Retry after refreshing token
      try {
        console.log('Token invalid, attempting refresh...');
        const authorization = await refreshToken();
        if (authorization) {
          // Retry the original request
          const response = await axios({
            url: buildUrl(baseURL, url),
            method,
            data,
            headers: {
              ...authorization,
              "Content-Type": contentType,
            },
            params,
          });

          if (response.status >= 200 && response.status < 300) {
            resetForm?.();
            toast.success(response.data.message);
            return response.data;
          }
        }
      } catch (retryError) {
        console.error("Token refresh failed:", retryError);
        goToLogin();
      }
    }

    const errorResponse = error?.response?.data;
    const errorMsg = extractErrorMessage(errorResponse);

    if (errorMsg && method?.toLowerCase() !== "get") {
      toast.error(errorMsg);
    }
    
    // Return null for failed requests to prevent infinite loading
    return null;
  }
}

function extractErrorMessage(errorResponse) {
  if (!errorResponse) return null;
  const apiErrorResponse = errorResponse?.errors?.[0] ?? errorResponse;

  const direct = (
    apiErrorResponse?.message ||
    apiErrorResponse?.__all__?.[0] ||
    apiErrorResponse?.username?.[0] ||
    apiErrorResponse?.email?.[0] ||
    apiErrorResponse?.password2?.[0] ||
    apiErrorResponse?.gender?.[0] ||
    apiErrorResponse?.non_field_errors?.[0] ||
    apiErrorResponse?.company_name?.[0] ||
    apiErrorResponse?.detail ||
    errorResponse?.message ||
    errorResponse?.detail ||
    null
  );
  if (direct) return direct;

  // Fallback: pick the first field error from object responses
  if (typeof apiErrorResponse === 'object') {
    const keys = Object.keys(apiErrorResponse);
    for (const k of keys) {
      const v = apiErrorResponse[k];
      if (Array.isArray(v) && v.length) return String(v[0]);
      if (typeof v === 'string') return v;
    }
  }
  return null;
}
