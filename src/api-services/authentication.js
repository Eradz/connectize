import { makeApiRequest, REGISTER_EMAIL_KEY, clearTokenCache } from "../lib/helpers";
import { setSession } from "../lib/session";

export const authenticationService = async ({
  url,
  values,
  type,
  method = "POST",
  resetForm,
}) => {
  try {
    const response = await makeApiRequest({
      url: `api/auth/${url}/`,
      method,
      data: values,
      resetForm,
      type: "auth-" + type,
    });

    // Safely handle response structure
    const results = response?.results || response;

    if (type === "login" && results) {
      setSession(results);
      // Clear token cache so the new session tokens are used immediately
      clearTokenCache();
    } else if (type === "register" && values?.email) {
      localStorage.setItem(REGISTER_EMAIL_KEY, values.email);
    }
    return true;
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
