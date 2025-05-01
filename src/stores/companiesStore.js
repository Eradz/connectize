import isEqual from "lodash/isEqual";
import { create } from "zustand";
import {
    getAllCompanies,
    getCompanyByIdOrEmail,
} from "../api-services/companies";

export const useCompaniesStore = create((set, get) => ({
  companies: [],
  currentCompany: null,
  fetchCompanies: async () => {
    const data = await getAllCompanies();
    if (!isEqual(data, get().companies)) {
      set({ companies: data });
    }
  },
  fetchCurrentCompany: async () => {
    const data = await getCompanyByIdOrEmail();
    if (!isEqual(data, get().currentCompany)) {
      set({ currentCompany: data });
    }
  },
}));
