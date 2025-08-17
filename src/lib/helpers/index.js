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
  const pathname = window.location.pathname;
  window.location.replace("/login?next=" + pathname);
}

// Configure Axios Defaults
export const baseURL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? "http://127.0.0.1:8000" : "https://about.connectize.co");

axios.defaults.withCredentials = true;

// Mutex for Refresh Token
let isRefreshing = false;
let refreshPromise = null;
let accessToken = null;
let accessTokenExpiry = null;

let retries = 0;

export async function refreshToken() {
  const session = getSession();

  if (!session?.tokens?.refresh) {
    return undefined;
  }

  if (isRefreshing) {
    return refreshPromise;
  }

  isRefreshing = true;

  try {
    refreshPromise = (async () => {
      const { data } = await axios.post(`${baseURL}/api/auth/refresh-token/`, {
        refresh: session.tokens.refresh,
      });

      const newTokens = {
        access: data.access,
        refresh: data.refresh,
      };

      setSession({
        ...session,
        tokens: newTokens,
      });

      accessToken = newTokens.access;
      accessTokenExpiry = Date.now() + 15 * 60 * 1000;

      return "Bearer " + newTokens.access;
    })();

    const authorizationHeader = await refreshPromise;
    return { Authorization: authorizationHeader };
  } catch (error) {
    retries++;

    if (retries === 1) {
      removeSession();
      goToLogin();
      return;
    }

    throw error;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

let hasNotifiedOffline = false;

export async function getAuthorizationHeader() {
  if (accessToken && Date.now() < accessTokenExpiry) {
    return { Authorization: "Bearer " + accessToken };
  }

  const refreshedToken = await refreshToken();

  if (refreshedToken?.Authorization) return refreshedToken;

  // No valid auth header
  return null;
}

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
  try {
  const authorization = await getAuthorizationHeader();

  if ((!authorization || !authorization.Authorization) && !type.startsWith("auth")) {
      goToLogin();
      return;
    }

    // Build headers, omitting Content-Type for FormData so axios sets boundary
    const headers = { ...(authorization || {}) };
    const isFormData = (typeof FormData !== 'undefined') && data instanceof FormData;
    if (!isFormData && contentType) {
      headers["Content-Type"] = contentType;
    }

    const response = await axios({
      url: `${baseURL}/${url}`,
      method,
      data,
      headers,
      params,
      onUploadProgress,
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
            url: `${baseURL}/${url}`,
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
      }
    }

    const errorResponse = error?.response?.data;

    const errorMsg = extractErrorMessage(errorResponse);

    if (errorMsg && method?.toLowerCase() !== "get") {
      toast.error(errorMsg);
      // console.error("API request failed:", error);
    }
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
