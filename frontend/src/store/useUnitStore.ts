import { create } from "zustand";
import { apiGet, apiPost } from "../api/client";
import type { Unit } from "./useProductStore";

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface UnitInput {
  code: string;
  name: string;
  symbol: string;
}

interface UnitState {
  units: Unit[];
  loading: boolean;
  creating: boolean;
  error: string | null;
  fetchUnits: () => Promise<void>;
  createUnit: (input: UnitInput) => Promise<Unit | null>;
  resetError: () => void;
}

export const useUnitStore = create<UnitState>((set, get) => ({
  units: [],
  loading: false,
  creating: false,
  error: null,
  fetchUnits: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiGet<ApiResponse<Unit[]>>("/api/units");
      set({ units: res.data ?? [], loading: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch units",
        loading: false,
      });
    }
  },
  createUnit: async (input) => {
    set({ creating: true, error: null });
    try {
      const res = await apiPost<ApiResponse<Unit>>("/api/units", input);
      await get().fetchUnits();
      set({ creating: false });
      return res.data ?? null;
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : "Failed to create unit",
        creating: false,
      });
      return null;
    }
  },
  resetError: () => set({ error: null }),
}));
