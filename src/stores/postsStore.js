import isEqual from "lodash/isEqual";
import { create } from "zustand";
import { getPosts } from "../api-services/posts";

export const usePostsStore = create((set, get) => ({
  posts: [],
  loading: true,
  fetchPosts: async () => {
    // set({ loading: true });
    try {
      const data = await getPosts();
      if (!isEqual(data, get().posts)) {
        set({ posts: data });
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      set({ loading: false });
    }
  },
}));
