import { create } from "zustand";
import { apiDelete, apiGet, apiPost } from "../api/client";

export type LeaveStatus = "pending" | "approved" | "rejected";

export interface LeaveRequest {
  id: number;
  employee_id: number;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  leave_reason: string;
  leave_duration: number;
  status: LeaveStatus;
  reject_reason: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateLeaveInput {
  employee_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  leave_reason: string;
  leave_duration: number;
}

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

interface LeaveState {
  leaves: LeaveRequest[];
  loading: boolean;
  creating: boolean;
  processingId: number | null;
  error: string | null;
  fetchLeaves: () => Promise<void>;
  createLeave: (input: CreateLeaveInput) => Promise<LeaveRequest | null>;
  acceptLeave: (id: number) => Promise<boolean>;
  rejectLeave: (id: number, rejectReason: string) => Promise<boolean>;
  deleteLeave: (id: number) => Promise<boolean>;
  clearError: () => void;
}

const errorMessage = (error: unknown, fallback: string) => {
  const apiError = error as { data?: unknown } | null;
  if (apiError?.data && typeof apiError.data === "object") {
    const payload = apiError.data as { error?: string; message?: string };
    return payload.error || payload.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

const replaceLeave = (leaves: LeaveRequest[], updated: LeaveRequest) =>
  leaves.map((leave) => (leave.id === updated.id ? { ...leave, ...updated } : leave));

export const useLeaveStore = create<LeaveState>((set) => ({
  leaves: [],
  loading: false,
  creating: false,
  processingId: null,
  error: null,

  fetchLeaves: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiGet<ApiResponse<LeaveRequest[]>>("/api/leaves");
      set({ leaves: Array.isArray(response.data) ? response.data : [], loading: false });
    } catch (error) {
      set({ error: errorMessage(error, "Unable to load leave requests."), loading: false });
    }
  },

  createLeave: async (input) => {
    set({ creating: true, error: null });
    try {
      const response = await apiPost<ApiResponse<LeaveRequest>>("/api/leaves/create", input);
      const created = response.data ?? null;
      set((state) => ({
        leaves: created ? [created, ...state.leaves] : state.leaves,
        creating: false,
      }));
      return created;
    } catch (error) {
      set({ error: errorMessage(error, "Unable to create the leave request."), creating: false });
      return null;
    }
  },

  acceptLeave: async (id) => {
    set({ processingId: id, error: null });
    try {
      const response = await apiPost<ApiResponse<LeaveRequest>>(`/api/leaves/accept/${id}`, {});
      if (response.data) set((state) => ({ leaves: replaceLeave(state.leaves, response.data!) }));
      set({ processingId: null });
      return true;
    } catch (error) {
      set({ error: errorMessage(error, "Unable to approve the leave request."), processingId: null });
      return false;
    }
  },

  rejectLeave: async (id, rejectReason) => {
    set({ processingId: id, error: null });
    try {
      const response = await apiPost<ApiResponse<LeaveRequest>>(`/api/leaves/reject/${id}`, { reject_reason: rejectReason });
      if (response.data) set((state) => ({ leaves: replaceLeave(state.leaves, response.data!) }));
      set({ processingId: null });
      return true;
    } catch (error) {
      set({ error: errorMessage(error, "Unable to reject the leave request."), processingId: null });
      return false;
    }
  },

  deleteLeave: async (id) => {
    set({ processingId: id, error: null });
    try {
      await apiDelete<ApiResponse<boolean>>(`/api/leaves/delete/${id}`);
      set((state) => ({ leaves: state.leaves.filter((leave) => leave.id !== id), processingId: null }));
      return true;
    } catch (error) {
      set({ error: errorMessage(error, "Unable to delete the leave request."), processingId: null });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
