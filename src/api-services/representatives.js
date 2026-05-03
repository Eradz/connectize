import { makeApiRequest } from "../lib/helpers";
import { toast } from "sonner";

export const getAllRepresentatives = async (
  params,
  // { company_id = null, status = null },
  returnFullRes = false
) => {
  // const params = company_id ? { company_id } : status ? { status } : null;

  const { results, next } = await makeApiRequest({
    url: `api/representatives/`,
    method: "GET",
    params,
  });

  if (returnFullRes) return { data: results, next };

  return results;
};

export const assignRepresentative = async (rep) => {
  if (!rep.user || !rep.role) {
    toast.info("Incomplete representative data");
    return;
  }

  const category = await getOrCreateRepresentativeCategory({
    type: rep.role.toLowerCase(),
  });

  const results = await makeApiRequest({
    url: `api/representatives/`,
    method: "POST",
    data: {
      user: rep.user.id,
      company: rep.company.id,
      category,
      permissions: Array.isArray(rep.permissions) ? rep.permissions : [],
      slug: `${rep.user.first_name}_${rep.role.replaceAll(" ", "_")}_${
        rep.company.id
      }_${rep.user.id}`,
    },
  });

  if (results?.category) {
    toast.success(
      `${rep.user.first_name} ${rep.user.last_name} has been sent an invitation to represent your company as ${rep.role} representative`
    );
  }

  return results;
};

export const getOrCreateRepresentativeCategory = async ({ type, id }) => {
  const { results } = await makeApiRequest({
    url: "api/representative-categories/",
    method: "GET",
  });
  if (!type && !id) return results;

  if (id) return results.find((data) => data?.id === id);

  let existingCategory = results.find(
    (data) => data.type.toLowerCase() === type
  );

  if (!existingCategory) {
    existingCategory = await makeApiRequest({
      url: "api/representative-categories/",
      method: "POST",
      data: { type },
    });
  }

  return existingCategory.id;
};

export const changeRepStatus = async (id, repData) => {
  const results = await makeApiRequest({
    url: `api/representatives/${id}/`,
    method: "PUT",
    data: {
      user: repData.user,
      company: repData.company,
      category: repData.category,
      status: repData.status,
    },
  });

  if (results?.category) {
    toast.success(
      `Representative status has been changed to ${repData.status}`
    );
  }

  return results;
};

export const cancelOrDeclineRepRequest = async (id) => {
  const results = await makeApiRequest({
    url: `api/representatives/${id}/`,
    method: "DELETE",
  });
  return results;
};

export const acceptRepRequest = async (id, data) => {
  const result = await makeApiRequest({
    url: `api/representatives/${id}/accept-invitation/`,
    method: "POST",
    data,
  });

  return result;
};

export const resendRepInvitation = async (id) => {
  const result = await makeApiRequest({
    url: `api/representatives/${id}/resend-invitation/`,
    method: "POST",
  });

  if (result?.success) {
    toast.success("Invitation resent successfully");
  }

  return result;
};

export const getPendingSSORepresentatives = async (companyId) => {
  const response = await makeApiRequest({
    url: "api/representatives/pending-sso/",
    method: "GET",
    params: companyId ? { company_id: companyId } : undefined,
  });

  return response?.results || response?.data || response || [];
};

export const getMyActionableCompanies = async (permission = 'company_post') => {
  const result = await makeApiRequest({
    url: 'api/representatives/my-actionable-companies/',
    method: 'GET',
    params: { permission },
  });
  return Array.isArray(result) ? result : [];
};

export const approveSSORepresentative = async (id) => {
  const result = await makeApiRequest({
    url: `api/representatives/${id}/approve-sso/`,
    method: "POST",
  });

  toast.success("SSO employee approved successfully");
  return result;
};

export const rejectSSORepresentative = async (id) => {
  const result = await makeApiRequest({
    url: `api/representatives/${id}/reject-sso/`,
    method: "POST",
  });

  toast.success("SSO employee rejected successfully");
  return result;
};

export const getAvailableRepresentativePermissions = async () => {
  const result = await makeApiRequest({
    url: "api/representatives/available-permissions/",
    method: "GET",
  });
  return Array.isArray(result) ? result : [];
};

export const updateRepresentativePermissions = async (id, permissions) => {
  const result = await makeApiRequest({
    url: `api/representatives/${id}/update-permissions/`,
    method: "PATCH",
    data: { permissions },
  });

  toast.success("Permissions updated");
  return result;
};
