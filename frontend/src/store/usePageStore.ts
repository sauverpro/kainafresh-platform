import { create } from "zustand";
import { apiGet } from "../api/client";

export interface Page {
  id: string;
  title: string;
  slug: string;
}

interface PageState {
  pages: Page[];
  loading: boolean;
  error: string | null;
  fetchPages: () => Promise<void>;
}

export const usePageStore = create<PageState>((set) => ({
  pages: [],
  loading: false,
  error: null,
  fetchPages: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiGet<{ success: boolean; data: Page[] }>("/api/pages");
      set({ pages: res.data ?? [], loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch pages";
      set({ error: message, loading: false });
    }
  },
}));
