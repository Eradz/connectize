import isEqual from "lodash/isEqual";
import { create } from "zustand";
import { getAllUsers, getUserById } from "../api-services/users";

export const useUsersStore = create((set, get) => ({
  users: [],
  selectedUser: null,
  fetchUsers: async () => {
    const data = await getAllUsers();
    if (!isEqual(data, get().users)) {
      set({ users: data });
    }
  },
  fetchUserById: async (id) => {
    const data = await getUserById(id);
    if (!isEqual(data, get().selectedUser)) {
      set({ selectedUser: data });
    }
  },
}));
