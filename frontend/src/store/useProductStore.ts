import { create } from "zustand";
import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiPostFormData,
} from "../api/client";

export interface Unit {
  id: number;
  name: string;
  code: string;
  symbol: string;
}

export interface Product {
  id: number | string;
  name: string;
  description?: string;
  product_image?: string | null;
  unit_id: number;
  shelf_life: number;
  price: number;
  status: "active" | "inactive";
  unit_code?: string;
  unit_name?: string;
  unit_symbol?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductInput {
  name: string;
  description?: string;
  unit_id: number;
  shelf_life: number;
  price: number;
  status: "active" | "inactive";
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

interface ProductState {
  products: Product[];
  selected: Product | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  getProduct: (id: number | string) => Promise<void>;
  clearSelected: () => void;
  createProduct: (input: ProductInput, image?: File | null) => Promise<boolean>;
  updateProduct: (
    id: number | string,
    input: Partial<ProductInput>,
  ) => Promise<boolean>;
  deleteProduct: (id: number | string) => Promise<boolean>;
  resetError: () => void;
}

const resolveImageUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const base = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  return `${base}${path.startsWith("/") ? path : "/" + path}`;
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  selected: null,
  loading: false,
  saving: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiGet<ApiResponse<Product[]>>("/api/products");
      const items = (res.data ?? []).map((p) => ({
        ...p,
        product_image: resolveImageUrl(p.product_image),
      }));
      set({ products: items, loading: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch products",
        loading: false,
      });
    }
  },

  getProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await apiGet<ApiResponse<Product>>(`/api/products/${id}`);
      const product = res.data
        ? { ...res.data, product_image: resolveImageUrl(res.data.product_image) }
        : null;
      set({ selected: product, loading: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch product",
        loading: false,
      });
    }
  },

  clearSelected: () => set({ selected: null }),

  createProduct: async (input, image) => {
    set({ saving: true, error: null });
    try {
      if (image) {
        const formData = new FormData();
        formData.append("product_image", image);
        formData.append("name", input.name);
        if (input.description) formData.append("description", input.description);
        formData.append("unit_id", String(input.unit_id));
        formData.append("shelf_life", String(input.shelf_life));
        formData.append("price", String(input.price));
        formData.append("status", input.status);
        await apiPostFormData<ApiResponse<Product>>("/api/products", formData);
      } else {
        await apiPost<ApiResponse<Product>>("/api/products", input);
      }
      await get().fetchProducts();
      set({ saving: false });
      return true;
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Failed to create product",
        saving: false,
      });
      return false;
    }
  },

  updateProduct: async (id, input) => {
    set({ saving: true, error: null });
    try {
      await apiPut<ApiResponse<Product>>(`/api/products/${id}`, input);
      await get().fetchProducts();
      set({ saving: false });
      return true;
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Failed to update product",
        saving: false,
      });
      return false;
    }
  },

  deleteProduct: async (id) => {
    try {
      await apiDelete<ApiResponse>(`/api/products/${id}`);
      set({ products: get().products.filter((p) => p.id !== id) });
      return true;
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Failed to delete product",
      });
      return false;
    }
  },

  resetError: () => set({ error: null }),
}));
