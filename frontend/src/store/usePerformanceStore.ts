import { create } from "zustand";
import { apiDelete, apiGet, apiPost, apiPut } from "../api/client";

export interface PerformanceRecord {
  id: number;
  employee_id: number;
  employee_name?: string;
  reviewer_id: number;
  target_set: string;
  target_achieved: string;
  strengths: string;
  improvement_area: string;
  overall_rating: string;
  recommendation: string;
  review_date: string;
  review_period: string;
  promotion?: number | string;
  notes?: string;
  overtime?:string;
}

export interface CreatePerformanceInput {
  employee_id: number;
  reviewer_id: number;
  target_set: string;
  target_achieved: string;
  strengths: string;
  improvement_area: string;
  overall_rating: string;
  recommendation: string;
  overtime: number;
  review_date: string;
  review_period: string;
  promotion?: number;
}

export interface DisciplinaryRecord {
  id: number;
  employee_id: number;
  employee_name?: string;
  action_date: string;
  action_type: string;
  reason: string;
  description: string;
  issued_by: number;
  status: string;
}

export interface CreateDisciplinaryInput {
  employee_id: number;
  action_date: string;
  action_type: string;
  reason: string;
  description: string;
  issued_by: number;
  status: string;
}

type ApiResponse<T> = {
  data?: T;
  message?: string;
  error?: string;
  status?: boolean;
};

const errorMessage = (error: unknown, fallback: string) => {
  const apiError = error as { data?: unknown } | null;
  if (apiError?.data && typeof apiError.data === "object") {
    const payload = apiError.data as { error?: string; message?: string };
    return payload.error || payload.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

interface PerformanceState {
  reviews: PerformanceRecord[];
  disciplinary: DisciplinaryRecord[];
  loadingReviews: boolean;
  loadingDisciplinary: boolean;
  savingReview: boolean;
  savingDisciplinary: boolean;
  processingReviewId: number | null;
  processingDisciplinaryId: number | null;
  error: string | null;
  fetchReviews: () => Promise<void>;
  fetchDisciplinary: () => Promise<void>;
  createReview: (input: CreatePerformanceInput) => Promise<boolean>;
  updateReview: (id: number, input: CreatePerformanceInput) => Promise<boolean>;
  deleteReview: (id: number) => Promise<boolean>;
  createDisciplinary: (input: CreateDisciplinaryInput) => Promise<boolean>;
  updateDisciplinary: (id: number, input: CreateDisciplinaryInput) => Promise<boolean>;
  deleteDisciplinary: (id: number) => Promise<boolean>;
  clearError: () => void;
}

export const usePerformanceStore = create<PerformanceState>((set) => ({
  reviews: [],
  disciplinary: [],
  loadingReviews: false,
  loadingDisciplinary: false,
  savingReview: false,
  savingDisciplinary: false,
  processingReviewId: null,
  processingDisciplinaryId: null,
  error: null,

  fetchReviews: async () => {
    set({ loadingReviews: true, error: null });
    try {
      const response = await apiGet<ApiResponse<PerformanceRecord[]>>("/api/performance");
      set({
        reviews: Array.isArray(response.data) ? response.data : [],
        loadingReviews: false,
      });
    } catch (error) {
      set({
        error: errorMessage(error, "Unable to load performance reviews."),
        loadingReviews: false,
      });
    }
  },

  fetchDisciplinary: async () => {
    set({ loadingDisciplinary: true, error: null });
    try {
      const response = await apiGet<ApiResponse<DisciplinaryRecord[]>>("/api/disciplinary");
      set({
        disciplinary: Array.isArray(response.data) ? response.data : [],
        loadingDisciplinary: false,
      });
    } catch (error) {
      set({
        error: errorMessage(error, "Unable to load disciplinary actions."),
        loadingDisciplinary: false,
      });
    }
  },

  createReview: async (input) => {
    set({ savingReview: true, error: null });
    try {
      await apiPost<ApiResponse<PerformanceRecord>>("/api/performance/create", input);
      set({ savingReview: false });
      return true;
    } catch (error) {
      set({
        error: errorMessage(error, "Unable to create the performance review."),
        savingReview: false,
      });
      return false;
    }
  },

  updateReview: async (id, input) => {
    set({ processingReviewId: id, error: null });
    try {
      await apiPut<ApiResponse<PerformanceRecord>>(`/api/performance/update/${id}`, input);
      set({ processingReviewId: null });
      return true;
    } catch (error) {
      set({
        error: errorMessage(error, "Unable to update the performance review."),
        processingReviewId: null,
      });
      return false;
    }
  },

  deleteReview: async (id) => {
    set({ processingReviewId: id, error: null });
    try {
      await apiDelete<ApiResponse<boolean>>(`/api/performance/delete/${id}`);
      set((state) => ({
        reviews: state.reviews.filter((review) => review.id !== id),
        processingReviewId: null,
      }));
      return true;
    } catch (error) {
      set({
        error: errorMessage(error, "Unable to delete the performance review."),
        processingReviewId: null,
      });
      return false;
    }
  },

  createDisciplinary: async (input) => {
    set({ savingDisciplinary: true, error: null });
    try {
      await apiPost<ApiResponse<DisciplinaryRecord>>("/api/disciplinary/create", input);
      set({ savingDisciplinary: false });
      return true;
    } catch (error) {
      set({
        error: errorMessage(error, "Unable to record the disciplinary action."),
        savingDisciplinary: false,
      });
      return false;
    }
  },

  updateDisciplinary: async (id, input) => {
    set({ processingDisciplinaryId: id, error: null });
    try {
      await apiPut<ApiResponse<DisciplinaryRecord>>(`/api/disciplinary/update/${id}`, input);
      set({ processingDisciplinaryId: null });
      return true;
    } catch (error) {
      set({
        error: errorMessage(error, "Unable to update the disciplinary action."),
        processingDisciplinaryId: null,
      });
      return false;
    }
  },

  deleteDisciplinary: async (id) => {
    set({ processingDisciplinaryId: id, error: null });
    try {
      await apiDelete<ApiResponse<boolean>>(`/api/disciplinary/delete/${id}`);
      set((state) => ({
        disciplinary: state.disciplinary.filter((record) => record.id !== id),
        processingDisciplinaryId: null,
      }));
      return true;
    } catch (error) {
      set({
        error: errorMessage(error, "Unable to delete the disciplinary action."),
        processingDisciplinaryId: null,
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
