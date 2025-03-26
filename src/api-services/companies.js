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

export const getAllCompanies = async () => {
  const companies = await makeApiRequest({
    url: `api/companies/`,
    method: "GET",
  });

  return companies;
};

export const getCompanyByIdOrEmail = async (id) => {
  const currentUser = await getCurrentUser();
  const params = id ? { id } : { profile: currentUser?.email };
  const { results: companies } = await makeApiRequest({
    url: `api/companies/`,
    method: "GET",
    params,
  });
  return companies || [];
};

export const getSingleCompany = async (companyName) => {
  const singleCompany = await makeApiRequest({
    url: `api/companies/${companyName}/`,
    method: "GET",
  });
  return singleCompany;
};

export const createCompany = async (data, resetForm) => {
  await getOrCreateCompanyCategories(data.company_category);

  await getOrCreateCompanySize(data.company_size);

  if (!data.company_category === undefined || data.company_size === undefined) {
    toast.error("Incomplete data was provided");
    return;
  }

  const company = await makeApiRequest({
    url: `api/companies/`,
    method: "POST",
    // logo: data.logo,
    // banner: data.banner,
    data: {
      company_name: data.company_name,
      organization_type: data.company_category,
      about: data.company_description,
      tag_line: data.company_tagline,
      company_size: data.company_size,
      email: data.company_email,
      office_address: data.office_address,
      country: data.country,
      state: data.city,
      city: data.city,
      slug: data.company_name.toString().replaceAll(" ", "-"),
      website: data.company_website,
      registration_number: data.company_registration_no,
      registration_date: data.company_registration_date,
      annual_revenue: data.company_annual_revenue,
    },
  });

  const document = await createCompanyDocument({
    type: data.document_type,
    document: data.company_document,
    company: company?.company_name,
  });

  if (!document || !company) {
    return;
  }
  resetForm?.();
  toast.success(company?.company_name + " was created successfully");

  return company;
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
  await getOrCreateCompanyDocumentTypes(data.type, data.type);
  const companyDocument = await makeApiRequest({
    url: `api/documents/`,
    method: "POST",
    data,
    contentType: "multipart/form-data",
  });

  return companyDocument;
};

export const getOrCreateCompanyDocumentTypes = async (type, name) => {
  const { results: documentType } = await makeApiRequest({
    url: `api/document-types/`,
    method: "GET",
  });

  if (
    documentType.find(
      (document) => document.type === type || document.name === name
    )
  )
    return documentType;

  return await makeApiRequest({
    url: `api/document-types/`,
    method: "POST",
    data: { name, type },
  });
};

export const connectWithCompany = async (id, hasConnected) => {
  if (hasConnected) {
    return await makeApiRequest({
      url: `api/companies/${id}/unfollow/`,
      method: "POST",
    });
  }
  return await makeApiRequest({
    url: `api/companies/${id}/follow/`,
    method: "POST",
  });
};

export const editCompanyInformation = async (id, data) => {
  const company = await makeApiRequest({
    url: `api/companies/${id}/`,
    method: "PATCH",
    data,
  });
  if (company.logo) window.location.reload();
};

export const uploadCompanyBanner = async (companyName, file) => {
  const company = await makeApiRequest({
    url: `api/companies/${companyName}/`,
    method: "PATCH",
    data: { banner: file },
    contentType: "multipart/form-data",
  });
  if (company.banner) window.location.reload();
};

export const uploadCompanyLogo = async (companyName, file) => {
  const company = await makeApiRequest({
    url: `api/companies/${companyName}/`,
    method: "PATCH",
    data: { logo: file },
    contentType: "multipart/form-data",
  });
  if (company.logo) window.location.reload();
};

