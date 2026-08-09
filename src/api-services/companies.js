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

export const normalizeWebsite = (website) => {
  const trimmedWebsite = String(website || "").trim();

  if (!trimmedWebsite) return "";

  return /^https?:\/\//i.test(trimmedWebsite)
    ? trimmedWebsite
    : `https://${trimmedWebsite}`;
};

const getCompanyNameForUpload = (company, fallbackName) => {
  return String(
    company?.company_name ||
      company?.name ||
      company?.data?.company_name ||
      company?.data?.name ||
      fallbackName ||
      ""
  ).trim();
};

const slugifyCompanyName = (name) => {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const getCreatedCompanyRecord = (company) => {
  if (company?.data && typeof company.data === "object") return company.data;
  if (company?.company && typeof company.company === "object") return company.company;
  return company && typeof company === "object" ? company : {};
};

const normalizeCreatedCompany = (company, fallbackName) => {
  const companyRecord = getCreatedCompanyRecord(company);
  const companyName = getCompanyNameForUpload(companyRecord, fallbackName);
  const slug = String(companyRecord?.slug || "").trim() || slugifyCompanyName(companyName);

  return {
    ...companyRecord,
    company_name: companyRecord?.company_name || companyName,
    slug,
    route_slug: slug || companyName,
  };
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
      city: "",
      website,
      registration_number: data.company_registration_no,
      registration_date,
      annual_revenue: data.company_annual_revenue,
    },
  });

  if (!company) {
    return;
  }

  const createdCompany = normalizeCreatedCompany(
    company,
    data.company_name
  );
  const companyNameForUpload = createdCompany.company_name;

  const documentsToUpload = Array.isArray(data.company_documents)
    ? data.company_documents
    : data.document_type && data.company_document
      ? [{ type: data.document_type, document: data.company_document }]
      : [];

  if (documentsToUpload.length > 0) {
    try {
      await Promise.all(
        documentsToUpload.map((documentItem) =>
          createCompanyDocument({
            type: documentItem.type,
            document: documentItem.document,
            company: companyNameForUpload,
          })
        )
      );
    } catch (e) {
      console.error("Document upload failed:", e);
      toast.error(
        "Company created, but one or more documents failed to upload. Please try uploading them again from the company profile."
      );
    }
  }

  if (data.verification_document) {
    try {
      await uploadCompanyVerificationDocument(
        companyNameForUpload,
        data.verification_document
      );
    } catch (e) {
      console.error("Verification document upload failed:", e);
      toast.error(
        "Company created, but the verification document failed to upload. Please try again from your company settings."
      );
    }
  }

  resetForm?.();
  toast.success(`${companyNameForUpload || data.company_name || "Company"} was created successfully`);

  return createdCompany;
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

export const getCompanyDocumentTypes = async () => {
  const res = await makeApiRequest({
    url: `api/document-types/`,
    method: "GET",
    params: { page_size: 100 },
  });

  const list = Array.isArray(res) ? res : res?.results || [];
  return list
    .map((documentType) => documentType?.name || documentType?.type)
    .filter((name) => typeof name === "string" && name.trim().length > 0);
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
  const company = String(data?.company || "").trim();

  if (!type) {
    throw new Error("Document type is required");
  }

  if (!data?.document) {
    throw new Error("Document file is required");
  }

  if (!company) {
    throw new Error("Company is required");
  }

  const documentType = await getOrCreateCompanyDocumentTypes(type, type);
  const documentTypeName = documentType?.name || type;

  const formData = new FormData();
  formData.append("type", documentTypeName);
  formData.append("company", company);
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

export const uploadCompanyVerificationDocument = async (companyName, file) => {
  const company = String(companyName || "").trim();

  if (!company) {
    throw new Error("Company is required");
  }

  if (!file) {
    throw new Error("Verification document file is required");
  }

  const formData = new FormData();
  formData.append("verification_document", file);

  return makeApiRequest({
    url: `api/companies/${encodeURIComponent(company)}/`,
    method: "PATCH",
    data: formData,
    contentType: "multipart/form-data",
  });
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

/**
 * People associated with a COMPANY: active representatives first (labeled with
 * their role), then user followers of the company, deduped by user id.
 * Companies are followed via FollowingRelationships.company_following, so the
 * owner's personal user<->user connections are NOT what should be shown here.
 */
export const getAssociatedPeopleForCompany = async ({ slug, companyId }) => {
  if (!slug && !companyId) return [];

  const [reps, followers] = await Promise.all([
    // Active representatives (requires auth; defaults to active-only for non-owners)
    makeApiRequest({
      url: `api/representatives/`,
      method: "GET",
      params: { company: companyId ?? slug, status: true },
    })
      .then((res) => (Array.isArray(res) ? res : res?.results) || [])
      .catch(() => []),
    // User followers of the company (FollowerRelationshipSerializer, paginated)
    makeApiRequest({
      url: `api/companies/${slug ?? companyId}/followers/`,
      method: "GET",
    })
      .then((res) => (Array.isArray(res) ? res : res?.results) || [])
      .catch(() => []),
  ]);

  const people = [];
  const seen = new Set();

  for (const rep of reps) {
    const repUser = rep?.user;
    const id = repUser?.id;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    people.push({
      id,
      first_name: repUser.first_name,
      last_name: repUser.last_name,
      full_name: repUser.full_name,
      display_name: repUser.display_name,
      username: repUser.username,
      avatar: repUser.avatar,
      verified: repUser.verified,
      role: rep.role || rep.category?.type || "Representative",
    });
  }

  for (const follower of followers) {
    const id = follower?.user_id;
    // Only user followers count as "people"; skip company followers and dupes
    if (!id || seen.has(id)) continue;
    seen.add(id);
    people.push({
      id,
      first_name: follower.first_name,
      last_name: follower.last_name,
      full_name: follower.full_name,
      display_name: follower.display_name,
      username: follower.username,
      avatar: follower.avatar,
      connection_type: "follower",
    });
  }

  return people.slice(0, 10);
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
