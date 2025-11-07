import { makeApiRequest, REGISTER_EMAIL_KEY } from "../lib/helpers/index";
import { setSession } from "../lib/session";

export const authenticationService = async ({
  url,
  values,
  type,
  method = "POST",
  resetForm,
}) => {
  try {
    console.log(`🔐 Authentication ${type} attempt:`, { url, values: { ...values, password: '[HIDDEN]' } });
    
    const response = await makeApiRequest({
      url: `api/auth/${url}/`,
      method,
      data: values,
      resetForm,
      type: "auth-" + type,
    });

    // Handle different response structures
    const payload = response?.results || response?.data || response;
    const success = Boolean(response?.success ?? payload?.success ?? true);
    console.log(`✅ Authentication ${type} response:`, { success, hasTokens: !!(payload?.tokens) });

    if (type === "login") {
      const tokens = payload?.tokens;
      console.log('🔑 Setting session with tokens:', { hasAccess: !!(tokens?.access), hasRefresh: !!(tokens?.refresh) });
      if (tokens?.access && tokens?.refresh) {
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
    console.error("❌ Auth submission error:", error);
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
