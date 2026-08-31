import { create } from "zustand";
import { apiGet } from "../api/client";
import type { Unit } from "./useProductStore";

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

interface UnitState {
  units: Unit[];
  loading: boolean;
  error: string | null;
  fetchUnits: () => Promise<void>;
}

export const useUnitStore = create<UnitState>((set) => ({
  units: [],
  loading: false,
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
}));
