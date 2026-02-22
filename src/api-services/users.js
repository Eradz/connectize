import { toast } from "sonner";
import { goToLogin, makeApiRequest } from "../lib/helpers";
import { getSession } from "../lib/session";
import { capitalizeFirst } from "../lib/utils";
import { authenticationService } from "./authentication";
import { getCompanyByIdOrEmail } from "./companies";
import { getAllRepresentatives } from "./representatives";

export const getAllUsers = async () => {
  const { results } = await makeApiRequest({
    url: `api/users/`,
    method: "GET",
  });

  return results?.filter((user) => user?.first_name && user?.last_name);
};

export const getUserById = async (id) => {
  const results = await makeApiRequest({
    url: `api/users/${id}`,
    method: "GET",
  });

  return results;
};

export const getCurrentUser = async () => {
  const user = await makeApiRequest({
    url: `api/current-user/`,
    method: "GET",
  });

  return user || null;
};

/**
 *
 * @param {ProfileOverviewFields} values

 */
export const updateCurrentUserInfo = async (values) => {
  const currentUser = await getCurrentUser();

  if (!values || !values.gender) {
    toast.info("Incomplete profile information");
    return;
  }

  await getOrCreateGender(values.gender);

  const hasFile = values.image instanceof File;

  // Only send writable fields — spreading currentUser sends read-only fields
  // (followers, followings, companies, etc.) that cause Django validation errors
  const profileData = {
    first_name: capitalizeFirst(values.first_name),
    last_name: capitalizeFirst(values.last_name),
    gender: values.gender,
    date_of_birth: values.age,
    bio: values.bio,
    role: values.role,
    is_first_time_user:
      values.first_name &&
      values.last_name &&
      values.gender &&
      values.age &&
      values.role &&
      values.nationality &&
      values.state
        ? false
        : true,
    country: values.nationality,
    city: values.city || values.state,
    region: values.state,
    phone_number: values.phone_number,
    address: values.company_address,
  };

  // Use FormData when uploading a file, otherwise send JSON
  if (hasFile) {
    const formData = new FormData();
    Object.entries(profileData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    formData.append("avatar", values.image);

    return await makeApiRequest({
      url: `api/users/${currentUser.id}/`,
      contentType: "multipart/form-data",
      method: "PATCH",
      data: formData,
    });
  }

  return await makeApiRequest({
    url: `api/users/${currentUser.id}/`,
    method: "PATCH",
    data: profileData,
  });
};

export const getAssociatedUsersForUser = async (userId) => {
  // Use the backend connections endpoint for real associated users
  if (!userId) return [];
  try {
    const results = await makeApiRequest({
      url: `api/users/${userId}/connections/?limit=10`,
      method: "GET",
    });
    return Array.isArray(results) ? results : [];
  } catch {
    return [];
  }
};

export const getSuggestedUsersForCurrentUser = async () => {
  // Use the backend suggestions endpoint for smart recommendations
  try {
    const results = await makeApiRequest({
      url: `api/users/suggestions/?limit=10`,
      method: "GET",
    });
    return Array.isArray(results) ? results : [];
  } catch {
    return [];
  }
};

export const getPeopleAssociatedForUser = async (thisUser, companyId) => {
  if (!thisUser) return [];

  try {
    // Fetch actual connections for this user from the backend
    const results = await makeApiRequest({
      url: `api/users/${thisUser.id}/connections/?limit=10`,
      method: "GET",
    });
    return Array.isArray(results) ? results : [];
  } catch {
    return [];
  }
};

// get and create user

export const getOrCreateGender = async (gender) => {
  const { results } = await makeApiRequest({
    url: "api/genders/",
    method: "GET",
  });

  if (results?.filter((data) => data.type === gender).length > 0 || !gender)
    return results;

  return await makeApiRequest({
    url: "api/genders/",
    method: "POST",
    data: { type: gender },
  });
};

export const logOutCurrentUser = async () => {
  const session = getSession();

  if (!session) {
    return goToLogin();
  }

  const refresh = session.tokens.refresh;

  const success = await authenticationService({
    url: "logout",
    method: "POST",
    values: { refresh },
  });
  if (success) goToLogin();
};

export const connectWithUser = async (id, hasConnected) => {
  if (hasConnected) {
    return await makeApiRequest({
      url: `api/users/${id}/unfollow/`,
      method: "POST",
    });
  }
  return await makeApiRequest({
    url: `api/users/${id}/follow/`,
    method: "POST",
  });
};

export const uploadDisplayPicture = async (file) => {
  const currentUser = await getCurrentUser();
  const company = await makeApiRequest({
    url: `api/users/${currentUser.id}/`,
    method: "PATCH",
    data: { avatar: file },
    contentType: "multipart/form-data",
  });
  if (company.avatar) window.location.reload();
};
