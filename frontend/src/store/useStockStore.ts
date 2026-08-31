import { create } from "zustand";
import { apiGet, apiPost, apiPut, apiDelete } from "../api/client";

export interface Stock {
  id: number | string;
  productid: number;
  variety?: string | null;
  grade?: string | null;
  quantity: number;
  farm_plot?: string | null;
  harvest_date?: string | null;
  pack_date?: string | null;
  product_name?: string;
  product_image?: string | null;
  unit_id?: number;
  unit_code?: string;
  unit_name?: string;
  unit_symbol?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StockInput {
  productid: number;
  variety?: string;
  grade?: string;
  quantity: number;
  farm_plot?: string;
  harvest_date?: string;
  pack_date?: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

interface StockState {
  stocks: Stock[];
  selected: Stock | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  fetchStocks: () => Promise<void>;
  getStock: (id: number | string) => Promise<void>;
  clearSelected: () => void;
  createStock: (input: StockInput) => Promise<boolean>;
  updateStock: (id: number | string, input: Partial<StockInput>) => Promise<boolean>;
  deleteStock: (id: number | string) => Promise<boolean>;
  resetError: () => void;
}

const resolveImageUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const base = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  return `${base}${path.startsWith("/") ? path : "/" + path}`;
};

const mapStock = (s: Stock): Stock => ({
  ...s,
  product_image: resolveImageUrl(s.product_image),
});

export const useStockStore = create<StockState>((set, get) => ({
  stocks: [],
  selected: null,
  loading: false,
  saving: false,
  error: null,

  fetchStocks: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiGet<ApiResponse<Stock[]>>("/api/stocks");
      set({ stocks: (res.data ?? []).map(mapStock), loading: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch stocks",
        loading: false,
      });
    }
  },

  getStock: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await apiGet<ApiResponse<Stock>>(`/api/stocks/${id}`);
      set({ selected: res.data ? mapStock(res.data) : null, loading: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch stock",
        loading: false,
      });
    }
  },

  clearSelected: () => set({ selected: null }),

  createStock: async (input) => {
    set({ saving: true, error: null });
    try {
      await apiPost<ApiResponse<Stock>>("/api/stocks", input);
      await get().fetchStocks();
      set({ saving: false });
      return true;
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Failed to create stock",
        saving: false,
      });
      return false;
    }
  },

  updateStock: async (id, input) => {
    set({ saving: true, error: null });
    try {
      await apiPut<ApiResponse<Stock>>(`/api/stocks/${id}`, input);
      await get().fetchStocks();
      set({ saving: false });
      return true;
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Failed to update stock",
        saving: false,
      });
      return false;
    }
  },

  deleteStock: async (id) => {
    try {
      await apiDelete<ApiResponse>(`/api/stocks/${id}`);
      set({ stocks: get().stocks.filter((s) => s.id !== id) });
      return true;
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Failed to delete stock",
      });
      return false;
    }
  },

  resetError: () => set({ error: null }),
}));
