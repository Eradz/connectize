import { makeApiRequest } from "../lib/helpers";

export class CrudService {
  constructor(basePath) {
    this.basePath = basePath;
  }

  async getAll(page, limit, status) {
    return makeApiRequest({
      url: this.basePath,
      method: "GET",
      params: { page, limit, status },
    });
  }

  async getById(id) {
    return makeApiRequest({
      url: `${this.basePath}/${id}`,
      method: "GET",
    });
  }

  async create(data, resetForm) {
    return makeApiRequest({
      url: this.basePath,
      method: "POST",
      data,
      resetForm,
    });
  }

  async update(id, data, resetForm) {
    if (this.options.includeTenantAndUser) {
      const [org, user] = await Promise.all([
        getCurrentOrganization(),
        getCurrentUser(),
      ]);
      data.tenantId = org.data.id;
      data.createdBy = user.data.email;
    }

    return makeApiRequest({
      url: `${this.basePath}/${id}`,
      method: "PUT",
      data,
      resetForm,
    });
  }

  async delete(id) {
    return makeApiRequest({
      url: `${this.basePath}/${id}`,
      method: "DELETE",
    });
  }
}
