import { CrudService } from './crud';

// Base path for featured ads API
export const featuredAdsService = new CrudService('api/v1/featured-ads/campaigns/');

export const featuredAdsApi = {
  async list(params) {
    return featuredAdsService.getAll(params?.page, params?.limit, params?.status);
  },
  async create(data) {
    return featuredAdsService.create(data);
  },
  async pause(id) {
    return featuredAdsService.customRequest(`${id}/pause/`, 'POST');
  },
  async resume(id) {
    return featuredAdsService.customRequest(`${id}/resume/`, 'POST');
  },
  async analytics(id) {
    return featuredAdsService.customRequest(`${id}/analytics/`, 'GET');
  },
  async summary() {
    return featuredAdsService.customRequest('summary/', 'GET');
  }
};
