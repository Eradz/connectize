import { CrudService } from "./crud";
import { makeApiRequest } from "../lib/helpers/index";

export class InventoryWarehouseService extends CrudService {
  constructor() {
    super("api/v1/inventory/warehouses/");
  }
}

export class InventoryCategoryService extends CrudService {
  constructor() {
    super("api/v1/inventory/categories/");
  }
}

export class InventoryItemService extends CrudService {
  constructor() {
    super("api/v1/inventory/items/");
  }

  async reserve(itemId, quantity) {
    return makeApiRequest({
      url: `${this.basePath}${itemId}/reserve/`,
      method: "POST",
      data: { quantity },
    });
  }

  async unreserve(itemId, quantity) {
    return makeApiRequest({
      url: `${this.basePath}${itemId}/unreserve/`,
      method: "POST",
      data: { quantity },
    });
  }

  async transactions(itemId, page = 1, page_size = 20) {
    return makeApiRequest({
      url: `${this.basePath}${itemId}/transactions/`,
      method: "GET",
      params: { page, page_size },
    });
  }

  async summary(filters = {}) {
    return makeApiRequest({
      url: `${this.basePath}summary/`,
      method: "GET",
      params: filters,
    });
  }
}

export class InventoryTransactionService extends CrudService {
  constructor() {
    super("api/v1/inventory/transactions/");
  }
}

export class InventoryAlertService extends CrudService {
  constructor() {
    super("api/v1/inventory/alerts/");
  }

  async acknowledge(alertId) {
    return makeApiRequest({
      url: `${this.basePath}${alertId}/acknowledge/`,
      method: "POST",
    });
  }
}

export class InventoryReportService extends CrudService {
  constructor() {
    super("api/v1/inventory/reports/");
  }
}

export const inventoryWarehouseService = new InventoryWarehouseService();
export const inventoryCategoryService = new InventoryCategoryService();
export const inventoryItemService = new InventoryItemService();
export const inventoryTransactionService = new InventoryTransactionService();
export const inventoryAlertService = new InventoryAlertService();
export const inventoryReportService = new InventoryReportService();
