import { useEffect, useMemo, useState } from "react";
import { Banknote, Eye, Loader2, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiGet } from "../../../api/client";
import ConfirmDeleteModal from "../../../components/ui/ConfirmDeleteModal";
import Modal from "../../../components/ui/Modal";
import MetricCard from "../../../components/ui/MetricCard";
import { usePageTitle } from "../../../hooks/usePageTitle";
import {
  type PayrollInput,
  type PayrollRecord,
  usePayrollStore,
} from "../../../store/usePayrollStore";

type Employee = { id: number; name: string; salary: number };
const today = new Date().toISOString().slice(0, 10);
const initialForm = {
  employee_id: "",
  base_salary: 0,
  allowances: 0,
  overtime: 0,
  bonus: 0,
  tax_deductions: 0,
  pension_deductions: 0,
  other_deductions: 0,
  pay_date: today,
  payment_start_date: today,
  bank_account_number: "",
  bank_name: "",
  payment_ref: "",
  note: "",
  payment_status: "unpaid" as const,
};
const amount = (value: number | string) => Number(value) || 0;

export default function Payroll() {
  usePageTitle("payroll-management", "Payroll & Salary Processing");
  const {
    records,
    loading,
    saving,
    processingId,
    error,
    fetchPayroll,
    createPayroll,
    updatePayroll,
    deletePayroll,
    clearError,
  } = usePayrollStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState(initialForm);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selected, setSelected] = useState<PayrollRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PayrollRecord | null>(null);
  useEffect(() => {
    void fetchPayroll();
  }, [fetchPayroll]);
  useEffect(() => {
    apiGet<{ data?: Array<Record<string, unknown>> }>("/api/employees")
      .then((res) => {
        setEmployees(
          (res.data || [])
            .map((e) => ({
              id: Number(e.id),
              name: String(e.fullname || "Employee"),
              salary: Number(e.salary_rwf) || 0,
            }))
            .filter((e) => e.id),
        );
      })
      .catch(() => setEmployees([]));
  }, []);
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);
  const netPay = useMemo(
    () =>
      form.base_salary +
      form.allowances +
      form.overtime +
      form.bonus -
      form.tax_deductions -
      form.pension_deductions -
      form.other_deductions,
    [form],
  );
  const totalNet = records.reduce(
    (sum, record) => sum + amount(record.net_pay),
    0,
  );
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !form.employee_id ||
      !form.bank_name.trim() ||
      !form.bank_account_number.trim() ||
      !form.payment_ref.trim()
    )
      return toast.error(
        "Employee, bank details, and payment reference are required.",
      );
    const input: PayrollInput = {
      ...form,
      employee_id: Number(form.employee_id),
    };
    if (await createPayroll(input)) {
      toast.success("Payroll record created.");
      setIsAddOpen(false);
      setForm(initialForm);
      void fetchPayroll();
    }
  };
  const markPaid = async (record: PayrollRecord) => {
    const input: PayrollInput = {
      employee_id: Number(record.employee_id),
      base_salary: amount(record.base_salary),
      allowances: amount(record.allowances),
      overtime: amount(record.overtime),
      bonus: amount(record.bonus),
      tax_deductions: amount(record.tax_deductions),
      pension_deductions: amount(record.pension_deductions),
      other_deductions: amount(record.other_deductions),
      pay_date: record.pay_date,
      payment_start_date: record.payment_start_date,
      bank_account_number: record.bank_account_number,
      bank_name: record.bank_name,
      payment_ref: record.payment_ref,
      note: record.note || "",
      payment_status: "paid",
    };
    if (await updatePayroll(record.id, input)) {
      toast.success("Payroll marked as paid.");
      void fetchPayroll();
    }
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (await deletePayroll(deleteTarget.id)) {
      toast.success("Payroll record deleted.");
      setSelected(null);
      setDeleteTarget(null);
    }
  };
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Payroll & Salary Processing
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, review, pay, and delete payroll records.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white"
        >
          <Plus size={16} /> Add Payroll Entry
        </button>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <MetricCard
          label="Total Net Disbursement"
          value={totalNet.toLocaleString()}
          unit="RWF"
          subtext="All payroll records"
          icon={<Banknote size={22} className="text-[#076935]" />}
          iconBg="bg-[#076935]/10"
          badgeText="Net Pay"
          badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
        />
        <MetricCard
          label="Processed Employees"
          value={String(records.length)}
          subtext="Payroll entries"
          icon={<Banknote size={22} className="text-blue-600" />}
          iconBg="bg-blue-50"
          badgeText="Records"
          badgeColor="bg-blue-50 text-blue-700 border-blue-200"
        />
        <MetricCard
          label="Paid Records"
          value={String(
            records.filter((record) => record.payment_status === "paid").length,
          )}
          subtext="Completed payments"
          icon={<Send size={22} className="text-amber-600" />}
          iconBg="bg-amber-50"
          badgeText="Paid"
          badgeColor="bg-amber-50 text-amber-700 border-amber-200"
        />
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#076935]/10 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F4FAF7] text-gray-500 uppercase">
            <tr>
              <th className="p-4">Reference</th>
              <th className="p-4">Employee</th>
              <th className="p-4">Base Salary</th>
              <th className="p-4">Net Pay</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-10 text-center">
                  <Loader2 className="inline animate-spin text-[#076935]" />{" "}
                  <span className="ml-2">Loading payroll…</span>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-500">
                  No payroll records found.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="border-t">
                  <td className="p-4 font-mono font-bold">
                    {record.payment_ref}
                  </td>
                  <td className="p-4">
                    <p className="font-semibold">
                      {record.employee_name ||
                        `Employee #${record.employee_id}`}
                    </p>
                    <p className="text-gray-400">{record.bank_name}</p>
                  </td>
                  <td className="p-4">
                    {amount(record.base_salary).toLocaleString()} RWF
                  </td>
                  <td className="p-4 font-bold text-[#076935]">
                    {amount(record.net_pay).toLocaleString()} RWF
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full border px-2 py-1 font-bold ${record.payment_status === "paid" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}
                    >
                      {record.payment_status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setSelected(record)}
                      className="text-[#076935]"
                      title="View payroll"
                    >
                      <Eye size={16} />
                    </button>
                    {record.payment_status !== "paid" && (
                      <button
                        disabled={processingId === record.id}
                        onClick={() => void markPaid(record)}
                        className="inline-flex rounded-lg bg-[#076935] px-2 py-1 text-white disabled:opacity-60"
                      >
                        {processingId === record.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          "Mark paid"
                        )}
                      </button>
                    )}
                    <button
                      disabled={processingId === record.id}
                      onClick={() => setDeleteTarget(record)}
                      className="text-rose-600 disabled:opacity-60"
                      title="Delete payroll"
                    >
                      {processingId === record.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Modal
        open={isAddOpen}
        onClose={() => !saving && setIsAddOpen(false)}
        size="xl"
        title="Add Payroll Record"
      >
        <form
          onSubmit={(event) => void submit(event)}
          className="space-y-4 text-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              Employee
              <select
                required
                value={form.employee_id}
                onChange={(e) => {
                  const employee = employees.find(
                    (item) => item.id === Number(e.target.value),
                  );
                  setForm({
                    ...form,
                    employee_id: e.target.value,
                    base_salary: employee?.salary || 0,
                  });
                }}
                className="mt-1 w-full rounded-xl border p-2.5"
              >
                <option value="">Select employee…</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Payment reference (Transaction id)
              <input
                required
                value={form.payment_ref}
                onChange={(e) =>
                  setForm({ ...form, payment_ref: e.target.value })
                }
                className="mt-1 w-full rounded-xl border p-2.5"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            {(
              [
                "base_salary",
                "allowances",
                "overtime",
                "bonus",
                "tax_deductions",
                "pension_deductions",
                "other_deductions",
              ] as const
            ).map((field) => (
              <label key={field}>
                {field.replace(/_/g, " ")}
                <input
                  type="number"
                  min="0"
                  value={form[field]}
                  onChange={(e) =>
                    setForm({ ...form, [field]: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-xl border p-2.5"
                />
              </label>
            ))}
            <label>
              Net pay
              <input
                readOnly
                value={netPay.toLocaleString()}
                className="mt-1 w-full rounded-xl border bg-gray-50 p-2.5 font-bold text-[#076935]"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              Period start
              <input
                type="date"
                required
                value={form.payment_start_date}
                onChange={(e) =>
                  setForm({ ...form, payment_start_date: e.target.value })
                }
                className="mt-1 w-full rounded-xl border p-2.5"
              />
            </label>
            <label>
              Pay date
              <input
                type="date"
                required
                value={form.pay_date}
                onChange={(e) => setForm({ ...form, pay_date: e.target.value })}
                className="mt-1 w-full rounded-xl border p-2.5"
              />
            </label>
            <label>
              Bank name
              <input
                required
                value={form.bank_name}
                onChange={(e) =>
                  setForm({ ...form, bank_name: e.target.value })
                }
                className="mt-1 w-full rounded-xl border p-2.5"
              />
            </label>
            <label>
              Bank account
              <input
                required
                value={form.bank_account_number}
                onChange={(e) =>
                  setForm({ ...form, bank_account_number: e.target.value })
                }
                className="mt-1 w-full rounded-xl border p-2.5"
              />
            </label>
          </div>
          <label>
            Note
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="mt-1 w-full rounded-xl border p-2.5"
            />
          </label>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              disabled={saving}
              className="rounded-xl border px-5 py-2 font-bold"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              className="inline-flex items-center rounded-xl bg-[#076935] px-5 py-2 font-bold text-white"
            >
              {saving && <Loader2 size={16} className="mr-2 animate-spin" />}
              {saving ? "Saving…" : "Save Payroll"}
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        size="md"
        title="Payroll Details"
      >
        {selected && (
          <div className="space-y-3 text-sm">
            <p>
              <b>Employee:</b>{" "}
              {selected.employee_name || `Employee #${selected.employee_id}`}
            </p>
            <p>
              <b>Payment reference (Transactin Id):</b> {selected.payment_ref}
            </p>
            <p>
              <b>Pay period:</b> {selected.payment_start_date} —{" "}
              {selected.pay_date}
            </p>
            <p>
              <b>Bank:</b> {selected.bank_name} ({selected.bank_account_number})
            </p>
            <p>
              <b>Net pay:</b> {amount(selected.net_pay).toLocaleString()} RWF
            </p>
            <p>
              <b>Note:</b> {selected.note || "—"}
            </p>
          </div>
        )}
      </Modal>
      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        itemName={deleteTarget?.payment_ref}
        resourceType="payroll record"
        title="Delete Payroll Record"
        loading={processingId === deleteTarget?.id}
      />
    </div>
  );
}
