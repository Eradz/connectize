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
    const { results } = await makeApiRequest({
      url: `api/auth/${url}/`,
      method,
      data: values,
      resetForm,
      type: "auth-" + type,
    });

    if (type === "login") {
      setSession(results);
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
