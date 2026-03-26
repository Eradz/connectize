import { toast } from "sonner";
import { makeApiRequest } from "../lib/helpers";
import { capitalizeFirst } from "../lib/utils";
import { getCompanyByIdOrEmail } from "./companies";
import { getCurrentUser } from "./users";

// {
//     "title": "",
//     "sub_title": "",
//     "category": null,
//     "description": "",
//     "date_created": null,
//     "featured": false,
//     "company": null
// }

export const getServices = async (params = {}, returnFullRes = false) => {
  const { results: services, next } = await makeApiRequest({
    url: `api/services/${params.sortBy ? params.sortBy + "/" : ""}`,
    method: "GET",
    params,
  });

  if (returnFullRes) return { data: services, next };

  return services || [];
};

export const getSingleService = async (id) => {
  const service = await makeApiRequest({
    url: `api/services/${id}/`,
    method: "GET",
  });

  return service;
};

export const createService = async (data, resetForm, editId) => {
  const serviceCategory = capitalizeFirst(
    data.service_category.trim().toLowerCase()
  );

  const user = await getCurrentUser();

  const company = await getCompanyByIdOrEmail();

  const toastId = toast.info(
    editId ? "Updating service" : "Creating service..."
  );

  if (!user && (!data || !serviceCategory)) {
    toast.error("No User session or service data or service category found", {
      id: toastId,
    });
    return;
  }

  await getOrCreateServiceCategories(serviceCategory);

  const service = await makeApiRequest({
    url: `api/services/${editId ? editId + "/" : ""}`,
    method: editId ? "PUT" : "POST",
    // params: editId ? { edit: editId } : undefined,
    data: {
      title: capitalizeFirst(data.service_title),
      sub_title: data.service_subtitle,
      category: serviceCategory,
      description: data.service_description,
      company: company?.[0]?.company_name || "",
    },
    resetForm,
  });

  if (service)
    toast.success(
      editId
        ? "Service has successfully been edited."
        : `${service.title} has been created successfully!`,
      {
        id: toastId,
      }
    );

  return service;
};

export const getServiceImages = async () => {
  const { results: images } = await makeApiRequest({
    url: `api/service-images/`,
    method: "GET",
  });

  return images || [];
};

// Service categories
export const getServiceCategories = async (params, returnFullRes = false) => {
  const { results: categories, next } = await makeApiRequest({
    url: `api/service-categories/`,
    method: "GET",
    params,
  });

  if (returnFullRes) return { data: categories, next };
  return categories || [];
};

export const getOrCreateServiceCategories = async (name) => {
  const categories = await getServiceCategories();

  const hasCategory =
    categories?.filter((data) => data.name === name).length > 0;

  if (hasCategory) return categories || [];

  const newCategory = await makeApiRequest({
    url: `api/service-categories/`,
    method: "POST",
    data: { name: name },
  });

  return newCategory;
};

export const createServiceCategory = async (name) => {
  return await makeApiRequest({
    url: `api/service-categories/`,
    method: "POST",
    data: { name },
  });
};

export const bookmarkService = async (serviceId, data, hasBookmarked) => {
  if (hasBookmarked) {
    await makeApiRequest({
      url: `api/services/${serviceId}/unlike/`,
      method: "POST",
      data: { company: data.company.company_name },
    });
    return;
  }
  await makeApiRequest({
    url: `api/services/${serviceId}/like/`,
    method: "POST",
    data: { company: data.company.company_name },
  });
};

/**
 * Get bookmarked services for the current user with pagination
 * @param {Object} params - Query parameters including page, page_size
 * @param {boolean} returnFullRes - Whether to return full response with pagination
 * @returns {Promise} - Bookmarked services
 */
export const getBookmarkedServices = async (params = {}, returnFullRes = false) => {
  const { results: services, next } = await makeApiRequest({
    url: `api/services/bookmarked/`,
    method: "GET",
    params,
  });

  if (returnFullRes) return { data: services, next };

  return services || [];
};
