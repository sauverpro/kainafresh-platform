import { create } from "zustand";
import { apiDelete, apiGet, apiPost, apiPut } from "../api/client";

export interface PayrollRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  base_salary: number | string;
  allowances: number | string;
  overtime: number | string;
  bonus: number | string;
  tax_deductions: number | string;
  pension_deductions: number | string;
  other_deductions: number | string;
  net_pay: number | string;
  pay_date: string;
  payment_status: "paid" | "unpaid";
  payment_start_date: string;
  bank_account_number: string;
  bank_name: string;
  payment_ref: string;
  note?: string;
}
export type PayrollInput = Omit<PayrollRecord, "id" | "employee_name" | "net_pay" | "payment_status"> & { payment_status?: "paid" | "unpaid" };
type Response<T> = { data?: T };
const errorText = (error: unknown, fallback: string) => {
  const data = (error as { data?: { error?: string; message?: string } })?.data;
  return data?.error || data?.message || (error instanceof Error ? error.message : fallback);
};
interface PayrollState {
  records: PayrollRecord[]; loading: boolean; saving: boolean; processingId: number | null; error: string | null;
  fetchPayroll: () => Promise<void>; createPayroll: (data: PayrollInput) => Promise<boolean>; updatePayroll: (id: number, data: PayrollInput) => Promise<boolean>; deletePayroll: (id: number) => Promise<boolean>; clearError: () => void;
}
export const usePayrollStore = create<PayrollState>((set) => ({
  records: [], loading: false, saving: false, processingId: null, error: null,
  fetchPayroll: async () => { set({ loading: true, error: null }); try { const response = await apiGet<Response<PayrollRecord[]>>("/api/payroll"); set({ records: Array.isArray(response.data) ? response.data : [], loading: false }); } catch (error) { set({ loading: false, error: errorText(error, "Unable to load payroll records.") }); } },
  createPayroll: async (data) => { set({ saving: true, error: null }); try { await apiPost<Response<PayrollRecord>>("/api/payroll/create", data); set({ saving: false }); return true; } catch (error) { set({ saving: false, error: errorText(error, "Unable to create payroll record.") }); return false; } },
  updatePayroll: async (id, data) => { set({ processingId: id, error: null }); try { const response = await apiPut<Response<PayrollRecord>>(`/api/payroll/update/${id}`, data); if (response.data) set((state) => ({ records: state.records.map((record) => record.id === id ? { ...record, ...response.data } : record) })); set({ processingId: null }); return true; } catch (error) { set({ processingId: null, error: errorText(error, "Unable to update payroll record.") }); return false; } },
  deletePayroll: async (id) => { set({ processingId: id, error: null }); try { await apiDelete(`/api/payroll/delete/${id}`); set((state) => ({ records: state.records.filter((record) => record.id !== id), processingId: null })); return true; } catch (error) { set({ processingId: null, error: errorText(error, "Unable to delete payroll record.") }); return false; } },
  clearError: () => set({ error: null }),
}));
