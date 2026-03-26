import axios from "axios";
import { toast } from "sonner";
import { getSession, removeSession, setSession } from "../session";
import { queryClient } from "../utils";

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
  // Clear all cached API data so stale user data doesn't persist across logins
  queryClient.clear();
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
  const search = window.location.search || "";
  const fullPath = Array.from(authPaths).some((p) => pathname.startsWith(p))
    ? "/"
    : pathname + search;

  const url =
    fullPath && fullPath !== "/" ? `/login?next=${encodeURIComponent(fullPath)}` : "/login";
  window.location.replace(url);
}

// Configure Axios Defaults (single host)
export const baseURL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "http://localhost:8000"
    : "https://about.connectize.co")
).replace(/\/$/, "");

axios.defaults.withCredentials = true;

// Mutex for Refresh Token
let isRefreshing = false;
let refreshPromise = null;
let accessToken = null;
let accessTokenExpiry = null;
// Session version counter — incremented on login so stale refresh promises
// that resolve after a new login don't accidentally wipe the fresh session.
let sessionVersion = 0;

let retries = 0;

// Clear token cache - call this after login or when session changes
export function clearTokenCache() {
  accessToken = null;
  accessTokenExpiry = null;
  isRefreshing = false;
  refreshPromise = null;
  sessionVersion++;
}

export async function refreshToken() {
  const session = getSession();

  if (!session?.tokens?.refresh) {
    // Normal case for unauthenticated users - don't warn
    return undefined;
  }

  // Check if refresh token looks valid (basic validation)
  if (
    typeof session.tokens.refresh !== "string" ||
    session.tokens.refresh.length < 10
  ) {
    console.warn("Invalid refresh token format");
    removeSession();
    return undefined;
  }

  if (isRefreshing) {
    return refreshPromise;
  }

  isRefreshing = true;
  // Capture the session version so we can detect if a new login happened
  // while this refresh request was in-flight.
  const versionAtStart = sessionVersion;

  try {
    refreshPromise = (async () => {
      const { data } = await axios.post(`${baseURL}/api/auth/refresh-token/`, {
        refresh: session.tokens.refresh,
      });

      // Validate response
      if (!data?.access || !data?.refresh) {
        throw new Error("Invalid refresh response format");
      }

      const newTokens = {
        access: data.access,
        refresh: data.refresh,
      };

      // Only update session if no new login occurred while we were refreshing
      if (versionAtStart === sessionVersion) {
        setSession({
          ...session,
          tokens: newTokens,
        });

        accessToken = newTokens.access;
        accessTokenExpiry = null; // No expiration - tokens are long-lived
      }

      return "Bearer " + newTokens.access;
    })();

    const authorizationHeader = await refreshPromise;
    return { Authorization: authorizationHeader };
  } catch (error) {
    // A new login happened while this refresh was in-flight — the 401 is
    // expected (old token was invalidated) so silently ignore it.
    if (versionAtStart !== sessionVersion) {
      return undefined;
    }

    console.error("Token refresh failed:", error);

    // If refresh fails, clear session and redirect to login
    removeSession();
    accessToken = null;
    accessTokenExpiry = null;

    // Only redirect if we're not already on an auth page
    const currentPath = window.location.pathname;
    if (!currentPath.includes("/login") && !currentPath.includes("/signup")) {
      goToLogin();
    }

    return undefined;
  } finally {
    // Only reset mutex if this is still the current refresh cycle
    if (versionAtStart === sessionVersion) {
      isRefreshing = false;
      refreshPromise = null;
    }
  }
}

let hasNotifiedOffline = false;

export async function getAuthorizationHeader() {
  // Use cached token (no expiration check - tokens are long-lived)
  if (accessToken) {
    return { Authorization: "Bearer " + accessToken };
  }

  // Try to use access token from session first (avoids unnecessary refresh right after login)
  try {
    const session = getSession();

    const tokenFromSession = session?.tokens?.access;
    if (tokenFromSession) {
      // Fresh token from session, update cache
      accessToken = tokenFromSession;
      // No expiration - tokens are managed by the backend
      accessTokenExpiry = null;
      return { Authorization: "Bearer " + accessToken };
    }
    
    // Try refresh if we have a refresh token
    if (session?.tokens?.refresh) {
      const refreshedToken = await refreshToken();
      if (refreshedToken?.Authorization) {
        return refreshedToken;
      }
    }
  } catch (e) {
    // Ignore and fallback
  }

  // No valid auth header available - this is normal for unauthenticated users
  return null;
}

// Build absolute URL with proper path normalization
const buildUrl = (baseUrl, path) => {
  const cleanBase = baseUrl.replace(/\/+$/, ""); // Remove trailing slashes
  const cleanPath = path.replace(/^\/+/, ""); // Remove leading slashes
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
  responseType, // Support for blob, arraybuffer, etc.
}) {
  // For URLs starting with /api, use them directly for Vite proxy in development
  const requestUrl =
    url.startsWith("/api") && import.meta.env.DEV
      ? url
      : buildUrl(baseURL, url);

  try {
    const authorization = await getAuthorizationHeader();

    if (
      (!authorization || !authorization.Authorization) &&
      !type.startsWith("auth") &&
      type !== "public"
    ) {
      console.error(
        "Authentication failed for protected route:",
        url,
        "No valid authorization token available"
      );
      goToLogin();
      throw new Error(
        `Authentication required for ${url} - redirecting to login`
      );
    }

    // Build headers, omitting Content-Type for FormData so axios sets boundary
    const headers = { ...(authorization || {}) };
    const isFormData =
      typeof FormData !== "undefined" && data instanceof FormData;
    if (!isFormData && contentType) {
      headers["Content-Type"] = contentType;
    }

    const axiosConfig = {
      url: requestUrl,
      method,
      data,
      headers,
      params,
      onUploadProgress,
      // Longer timeout for file uploads (FormData), shorter for regular requests
      timeout: isFormData ? 120000 : 15000,
    };
    
    // Add responseType if specified (for blob downloads, etc.)
    if (responseType) {
      axiosConfig.responseType = responseType;
    }

    const response = await axios(axiosConfig);

    hasNotifiedOffline = false;

    if (response.status >= 200 && response.status <= 204) {
      resetForm?.();
      
      // For blob responses, return the entire response object
      if (responseType === 'blob') {
        return response;
      }
      
      const responseMessage = response.data.message;

      if (
        response.data.success &&
        responseMessage &&
        !url.includes("notification") &&
        !url.includes("sso/providers")
      ) {
        toast.success(responseMessage);
      }
      return response.data;
    }
  } catch (error) {
    if (!navigator.onLine && !hasNotifiedOffline) {
      hasNotifiedOffline = true;

      //
      toast.error("Network error. Please check your internet connection.");

      // this set timeout helps to allow network error to still show up once in a while. Instead of showing once and never again.
      setTimeout(() => (hasNotifiedOffline = false), 30000);
      console.error("Network error:", error);
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
        const authorization = await refreshToken();
        if (authorization) {
          // Retry the original request
          const response = await axios({
            url: requestUrl,
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

    // For blob requests, throw the error so caller can handle it
    if (responseType === 'blob') {
      throw error;
    }

    // Return null for failed requests to prevent infinite loading
    return null;
  }
}

function extractErrorMessage(errorResponse) {
  if (!errorResponse) return null;
  const apiErrorResponse = errorResponse?.errors?.[0] ?? errorResponse;

  const direct =
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
    null;
  if (direct) return direct;

  // Fallback: pick the first field error from object responses
  if (typeof apiErrorResponse === "object") {
    const keys = Object.keys(apiErrorResponse);
    for (const k of keys) {
      const v = apiErrorResponse[k];
      if (Array.isArray(v) && v.length) return String(v[0]);
      if (typeof v === "string") return v;
    }
  }
  return null;
}
