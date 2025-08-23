import { makeApiRequest } from "../lib/helpers/index";

// Updated CrudService with fixed options handling
export class CrudService {
  constructor(basePath, options = {}) {
    // Normalize basePath: remove leading slash, ensure trailing slash
    let p = basePath.startsWith('/') ? basePath.slice(1) : basePath;
    this.basePath = p.endsWith('/') ? p : `${p}/`;
    this.options = options;
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
      url: `${this.basePath}${id}/`,
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
    // Prefer PATCH for partial updates to avoid backend required-field errors on PUT
    return makeApiRequest({
      url: `${this.basePath}${id}/`,
      method: "PATCH",
      data,
      resetForm,
    });
  }

  async delete(id) {
    return makeApiRequest({
  url: `${this.basePath}${id}/`,
      method: "DELETE",
    });
  }

  async customRequest(path, method = 'GET', data, params) {
    return makeApiRequest({
  url: `${this.basePath}${path}`,
      method,
      data,
      params,
    });
  }
}

// Lightweight axios-like wrapper around makeApiRequest
function normalizeUrl(url) {
  // makeApiRequest expects a relative path without leading slash
  if (url.startsWith('/')) return url.slice(1);
  return url;
}

const api = {
  get: (url, config = {}) =>
    makeApiRequest({
      url: normalizeUrl(url),
      method: 'GET',
      params: config.params,
    }).then((data) => ({ data })),

  // Public GET request that doesn't require authentication
  getPublic: (url, config = {}) =>
    makeApiRequest({
      url: normalizeUrl(url),
      method: 'GET',
      params: config.params,
      type: 'public', // This bypasses auth check
    }).then((data) => ({ data })),

  post: (url, data, config = {}) =>
    makeApiRequest({
      url: normalizeUrl(url),
      method: 'POST',
      data,
      contentType: config.headers?.['Content-Type'] || 'application/json',
    }).then((data) => ({ data })),

  put: (url, data, config = {}) =>
    makeApiRequest({
      url: normalizeUrl(url),
      method: 'PUT',
      data,
      contentType: config.headers?.['Content-Type'] || 'application/json',
    }).then((data) => ({ data })),

  patch: (url, data, config = {}) =>
    makeApiRequest({
      url: normalizeUrl(url),
      method: 'PATCH',
      data,
      contentType: config.headers?.['Content-Type'] || 'application/json',
    }).then((data) => ({ data })),

  delete: (url, config = {}) =>
    makeApiRequest({
      url: normalizeUrl(url),
      method: 'DELETE',
      params: config.params,
    }).then((data) => ({ data })),
};

export default api;
