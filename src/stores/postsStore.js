import isEqual from "lodash/isEqual";
import { create } from "zustand";
import { getPosts } from "../api-services/posts";

export const usePostsStore = create((set, get) => ({
  posts: [],
  fetchPosts: async () => {
    const data = await getPosts();
    if (!isEqual(data, get().posts)) {
      set({ posts: data });
    }
  },
}));
