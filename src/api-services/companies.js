import { toast } from "sonner";
import { makeApiRequest } from "../lib/helpers";
import { getCurrentUser } from "./users";

// {
//     "company_name": "",
//     "organization_type": null,
//     "about": "",
//     "tag_line": "",
//     "company_size": null,
//     "logo": null,
//     "banner": null,
//     "email": "",
//     "office_address": "",
//     "country": "",
//     "state": "",
//     "city": "",
//     "website": "",
//     "verify": false
// }

export const getAllCompanies = async (params, returnFullRes = false) => {
  const { results: companies, next } = await makeApiRequest({
    url: `api/companies/`,
    method: "GET",
    params,
  });

  if (returnFullRes) return { data: companies, next };

  return companies || [];
};

export const getCompanyByIdOrEmail = async (id, ext) => {
  let params;

  if (id) {
    params = { id };
  } else {
    const currentUser = await getCurrentUser();
    params = { profile: currentUser?.email };
  }

  // if (ext) {
  //   params.profile = undefined;
  //   params.hasExt = "yeah";
  // }
  const { results: companies } = await makeApiRequest({
    url: `api/companies/`,
    method: "GET",
    params,
  });

  // console.log("from getCompanyByIdOrEmail", {
  //   id,
  //   params,
  //   currentUser,
  //   companies,
  // });
  return companies || [];
};

export const getSingleCompany = async (companyName) => {
  const singleCompany = await makeApiRequest({
    url: `api/companies/${companyName}/`,
    method: "GET",
  });
  return singleCompany;
};

const normalizeWebsite = (website) => {
  const trimmedWebsite = String(website || "").trim();

  if (!trimmedWebsite) return "";

  return /^https?:\/\//i.test(trimmedWebsite)
    ? trimmedWebsite
    : `https://${trimmedWebsite}`;
};

export const createCompany = async (data, resetForm) => {
  // await getOrCreateCompanyCategories(data.company_category);

  // await getOrCreateCompanySize(data.company_size);

  if (data.company_category === undefined || data.company_size === undefined) {
    toast.error("Incomplete data was provided");
    return;
  }

  // console.log("form data", data);
  const registration_date = data.company_registration_date || null;
  const website = normalizeWebsite(data.company_website);
  const company = await makeApiRequest({
    url: `api/companies/`,
    method: "POST",
    data: {
      company_name: data.company_name,
      organization_type: data.company_category,
      about: data.company_description,
      tag_line: data.company_tagline,
      company_size: data.company_size,
      email: data.company_email,
      office_address: data.company_address,
      country: data.country,
      state: data.city,
      city: data.city,
      website,
      registration_number: data.company_registration_no,
      registration_date,
      annual_revenue: data.company_annual_revenue,
    },
  });

  if (!company) {
    return;
  }

  // Upload document if provided, but don't block company creation
  if (data.document_type && data.company_document) {
    try {
      await createCompanyDocument({
        type: data.document_type,
        document: data.company_document,
        company: company?.company_name,
      });
    } catch (e) {
      console.error("Document upload failed:", e);
      toast.error(
        "Company created, but the document upload failed. Please try uploading it again from the company profile."
      );
    }
  }

  resetForm?.();
  toast.success(company?.company_name + " was created successfully");

  return company;
};

export const getCompanyCategories = async () => {
  const res = await makeApiRequest({
    url: `api/company-categories/`,
    method: "GET",
    params: { page_size: 100 },
  });

  const list = Array.isArray(res) ? res : res?.results || [];
  return list
    .map((category) => category?.name)
    .filter((name) => typeof name === "string" && name.trim().length > 0);
};

export const getCompanySizes = async () => {
  const res = await makeApiRequest({
    url: `api/company-sizes/`,
    method: "GET",
    params: { page_size: 100 },
  });

  const list = Array.isArray(res) ? res : res?.results || [];
  return list
    .map((item) => item?.size)
    .filter((size) => typeof size === "string" && size.trim().length > 0);
};

export const getOrCreateCompanyCategories = async (name) => {
  const { results: categories } = await makeApiRequest({
    url: `api/company-categories/`,
    method: "GET",
  });

  const hasCategory =
    categories?.filter((data) => data.name === name).length > 0;

  if (hasCategory) return categories || [];

  return await makeApiRequest({
    url: `api/company-categories/`,
    method: "POST",
    data: { name },
  });
};
export const getOrCreateCompanySize = async (size) => {
  const { results } = await makeApiRequest({
    url: `api/company-sizes/`,
    method: "GET",
  });

  if (results.filter((data) => data.size === size).length > 0) return results;

  return await makeApiRequest({
    url: `api/company-sizes/`,
    method: "POST",
    data: { size },
  });
};

/**
 * {
 *  "type": null,
 *  "document": null,
 *   "company": null
 * }
 */

export const createCompanyDocument = async (data) => {
  const type = String(data?.type || "").trim();

  if (!type) {
    throw new Error("Document type is required");
  }

  if (!data?.document) {
    throw new Error("Document file is required");
  }

  if (!data?.company) {
    throw new Error("Company is required");
  }

  const documentType = await getOrCreateCompanyDocumentTypes(type, type);
  const documentTypeName = documentType?.name || type;

  const formData = new FormData();
  formData.append("type", documentTypeName);
  formData.append("company", data.company);
  formData.append("document", data.document);

  const companyDocument = await makeApiRequest({
    url: `api/documents/`,
    method: "POST",
    data: formData,
    contentType: "multipart/form-data",
  });

  if (!companyDocument) {
    throw new Error("Document upload failed");
  }

  return companyDocument;
};

export const getOrCreateCompanyDocumentTypes = async (type, name) => {
  const safeName = String(name || type || "").trim();

  if (!safeName) {
    throw new Error("Document type is required");
  }

  const response = await makeApiRequest({
    url: `api/document-types/`,
    method: "GET",
  });
  const documentTypes = Array.isArray(response) ? response : response?.results || [];

  const existing = documentTypes.find((document) => {
    const existingName = String(document?.name || "").trim().toLowerCase();
    const existingType = String(document?.type || "").trim().toLowerCase();
    const target = safeName.toLowerCase();
    return existingName === target || existingType === target;
  });

  if (existing) return existing;

  return await makeApiRequest({
    url: `api/document-types/`,
    method: "POST",
    data: { name: safeName, type: safeName },
  });
};

export const connectWithCompany = async (slug, hasConnected) => {
  if (hasConnected) {
    return await makeApiRequest({
      url: `api/companies/${slug}/unfollow/`,
      method: "POST",
    });
  }
  return await makeApiRequest({
    url: `api/companies/${slug}/follow/`,
    method: "POST",
  });
};

export const editCompanyInformation = async (data) => {
  const currentUserCompany = await getCompanyByIdOrEmail();
  const company = await makeApiRequest({
    url: `api/companies/${currentUserCompany[0].company_name}/`,
    method: "PATCH",
    data,
  });

  if (company.id)
    window.location.href = `/${currentUserCompany[0].company_name}`;
};

export const uploadCompanyBanner = async (file) => {
  const currentUserCompany = await getCompanyByIdOrEmail();

  const company = await makeApiRequest({
    url: `api/companies/${currentUserCompany[0].company_name}/`,
    method: "PATCH",
    data: { banner: file },
    contentType: "multipart/form-data",
  });
  if (company.banner) window.location.reload();
};

export const uploadCompanyLogo = async (file) => {
  const currentUserCompany = await getCompanyByIdOrEmail();

  const company = await makeApiRequest({
    url: `api/companies/${currentUserCompany[0].company_name}/`,
    method: "PATCH",
    data: { logo: file },
    contentType: "multipart/form-data",
  });
  if (company.logo) window.location.reload();
};
