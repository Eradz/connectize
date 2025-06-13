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

  return await makeApiRequest({
    url: `api/users/${currentUser.id}/`,
    contentType: "multipart/form-data",
    method: "PUT",
    data: {
      ...currentUser,
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
      city: values.state,
      region: values.state,
      phone_number: values.phone_number,
      address: values.company_address,
      website_url: values.website_url,
      social_media_url: values.social_media_url,
      avatar: values.image instanceof File ? values.image : undefined,
    },
  });
};

export const getSuggestedUsersForCurrentUser = async () => {
  const currentUser = await getCurrentUser();

  const allUsers = await getAllUsers();

  const allUsersInLocation = allUsers.filter(
    (user) =>
      currentUser.id !== user.id &&
      user.first_name &&
      (user.city === currentUser.city ||
        user.region === currentUser.region ||
        user.country === currentUser.country ||
        user)
  );

  return allUsersInLocation;
};

export const getPeopleAssociatedForUser = async (thisUser) => {
  if (!thisUser) return [];

  const nonProfessionalEmailDomains = new Set([
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "aol.com",
    "outlook.com",
    "icloud.com",
    "mail.com",
    "zoho.com",
    "admin.com",
    "superadmin.com",
  ]);

  const [allUsers, representatives] = await Promise.all([
    getAllUsers(),
    getAllRepresentatives({ company_id: thisUser?.companies?.[0] }),
  ]);

  // Fetch representatives' associated users
  const representativesAssociated = await Promise.all(
    representatives.map(async (rep) => {
      if (rep.user === thisUser.id) {
        const companyUser = await getCompanyByIdOrEmail(rep.company);
        return companyUser?.[0]?.user || null;
      }
      return getUserById(rep.user);
    })
  );

  // Filter valid users & ensure uniqueness
  const thisUserDomain = thisUser.email.split("@")[1].toLowerCase();
  const allUsersAssociated = allUsers.filter(
    ({ id, email, first_name, last_name }) => {
      if (!first_name && !last_name) return false;
      if (id === thisUser.id) return false;

      const userDomain = email.split("@")[1].toLowerCase();
      return (
        userDomain === thisUserDomain &&
        !nonProfessionalEmailDomains.has(userDomain)
      );
    }
  );

  const uniqueUsers = new Set(
    [
      ...representativesAssociated.map((ra) => ({ ...ra, rep: true })),
      ...allUsersAssociated.map((du) => ({ ...du, domain: true })),
    ].filter(Boolean)
  );

  return Array.from(uniqueUsers);
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
