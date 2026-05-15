import { makeApiRequest, REGISTER_EMAIL_KEY, clearTokenCache } from "../lib/helpers";
import { removeSession, setSession } from "../lib/session";
import { queryClient } from "../lib/utils";

export const authenticationService = async ({
  url,
  values,
  type,
  method = "POST",
  resetForm,
}) => {
  try {
    if (type === "login") {
      // Immediately invalidate any in-flight refresh requests and clear
      // stale session data BEFORE the login API call.  This prevents the
      // UserProvider's background refreshToken() from racing with the new
      // login and accidentally wiping the fresh tokens.
      clearTokenCache();
      removeSession();
    }

    const response = await makeApiRequest({
      url: `api/auth/${url}/`,
      method,
      data: values,
      resetForm,
      type: "auth-" + type,
    });

   // Handle different response structures
    const payload = response?.results || response?.data || response;
    const success = Boolean(response?.success ?? payload?.success ?? false);
    if (type === "login") {
      const tokens = payload?.tokens;
      if (tokens?.access && tokens?.refresh) {
        // Clear any stale cached tokens before setting new session
        clearTokenCache();
        // Clear all cached API data from previous user session
        queryClient.clear();
        setSession(payload);
      } else {
        console.warn("Login succeeded response but no tokens present; skipping session set");
        return false;
      }
    } else if (type === "register" && values?.email) {
      localStorage.setItem(REGISTER_EMAIL_KEY, values.email);
    }
    return success;
  } catch (error) {
    console.error("Auth submission error:", error);
    return false;
  }
};

export const loginUser = async ({ email, password, resetForm }) =>
  await authenticationService({
    values: {
      username: email,
      email,
      password,
    },
    url: "login",
    resetForm,
    type: "login",
  });

export const deactivateAccount = async ({ email, password }) => {
  return await authenticationService({
    values: { email, password },
    url: "deactivate-account",
  });
};

export const deleteAccount = async ({ confirmation_text }) => {
  return await authenticationService({
    values: { confirmation_text },
    url: "delete-account",
  });
};
