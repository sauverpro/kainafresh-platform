import { useEffect, useState } from "react";
import {
  Eye,
  Printer,
  Send,
  Banknote,
  Landmark,
  Users,
  CreditCard,
  Plus,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";
import MetricCard from "../../../components/ui/MetricCard";
import { apiGet } from "../../../api/client";

export interface PayrollRecord {
  id: string;
  employee_name: string;
  employee_code: string;
  job_title: string;
  department: string;
  base_salary_rwf: number;
  allowances_rwf: number;
  bonuses_rwf?: number;
  overtime_rwf?: number;
  paye_tax_rwf: number;
  rssb_pension_rwf: number;
  other_deductions_rwf?: number;
  net_salary_rwf: number;
  bank_name?: string;
  bank_account?: string;
  payment_method: "MTN MoMo Bulk" | "Bank Transfer" | "Airtel Money";
  payment_status: "Paid" | "Processing" | "Pending" | "Draft";
  payment_date?: string;
  payslip_ref?: string;
  notes?: string;
  cycle_month: string;
}

const DEFAULT_EMPLOYEES: Array<{ name: string; code: string; department: string; job_title: string; salary_rwf: number }> = [
  { name: "Jean-Baptiste Musafiri", code: "EMP-001", department: "Farm Operations", job_title: "Farm Manager", salary_rwf: 450000 },
  { name: "Aline Uwase", code: "EMP-002", department: "Quality Assurance", job_title: "Quality Control Officer", salary_rwf: 380000 },
  { name: "Emmanuel Habimana", code: "EMP-003", department: "Logistics & Fleet", job_title: "Cold-Chain Logistics Supervisor", salary_rwf: 320000 },
  { name: "Claude Makuza", code: "EMP-004", department: "Farm Operations", job_title: "Agronomist", salary_rwf: 550000 },
  { name: "Divine Uwineza", code: "EMP-005", department: "Quality Assurance", job_title: "Quality Inspector", salary_rwf: 480000 },
  { name: "Fulgence Iradukunda", code: "EMP-006", department: "Finance & Admin", job_title: "Finance Manager", salary_rwf: 600000 },
];

const INITIAL_PAYROLL: PayrollRecord[] = [
  {
    id: "PAY-2026-0901",
    employee_name: "Jean-Baptiste Musafiri",
    employee_code: "EMP-001",
    job_title: "Farm Manager",
    department: "Farm Operations",
    base_salary_rwf: 450000,
    allowances_rwf: 50000,
    bonuses_rwf: 20000,
    overtime_rwf: 0,
    paye_tax_rwf: 65000,
    rssb_pension_rwf: 13500,
    other_deductions_rwf: 0,
    net_salary_rwf: 441500,
    bank_name: "Bank of Kigali",
    bank_account: "00049-082914-01",
    payment_method: "Bank Transfer",
    payment_status: "Paid",
    payment_date: "2026-09-01",
    payslip_ref: "PAY-2026-0901",
    notes: "September monthly salary payout",
    cycle_month: "September 2026",
  },
  {
    id: "PAY-2026-0902",
    employee_name: "Aline Uwase",
    employee_code: "EMP-002",
    job_title: "Quality Control Officer",
    department: "Quality Assurance",
    base_salary_rwf: 380000,
    allowances_rwf: 30000,
    bonuses_rwf: 15000,
    overtime_rwf: 10000,
    paye_tax_rwf: 52000,
    rssb_pension_rwf: 11400,
    other_deductions_rwf: 0,
    net_salary_rwf: 381600,
    bank_name: "Equity Bank",
    bank_account: "40092-102934-02",
    payment_method: "MTN MoMo Bulk",
    payment_status: "Paid",
    payment_date: "2026-09-01",
    payslip_ref: "PAY-2026-0902",
    notes: "Regular salary + weekend QA overtime",
    cycle_month: "September 2026",
  },
  {
    id: "PAY-2026-0903",
    employee_name: "Emmanuel Habimana",
    employee_code: "EMP-003",
    job_title: "Cold-Chain Logistics Supervisor",
    department: "Logistics & Fleet",
    base_salary_rwf: 320000,
    allowances_rwf: 25000,
    bonuses_rwf: 0,
    overtime_rwf: 15000,
    paye_tax_rwf: 41000,
    rssb_pension_rwf: 9600,
    other_deductions_rwf: 0,
    net_salary_rwf: 309400,
    bank_name: "I&M Bank",
    bank_account: "20019-391824-03",
    payment_method: "MTN MoMo Bulk",
    payment_status: "Processing",
    payment_date: "2026-09-02",
    payslip_ref: "PAY-2026-0903",
    notes: "Cold-chain night shift allowance included",
    cycle_month: "September 2026",
  },
];

export default function Payroll() {
  usePageTitle("payroll-management", "Payroll & Salary Processing");

  const [records, setRecords] = useState<PayrollRecord[]>(INITIAL_PAYROLL);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState(DEFAULT_EMPLOYEES);

  const [form, setForm] = useState({
    employee_name: "",
    employee_code: "",
    job_title: "Field Supervisor",
    department: "Farm Operations",
    pay_period_start: "2026-09-01",
    base_salary_rwf: 0,
    allowances_rwf: 0,
    bonuses_rwf: 0,
    overtime_rwf: 0,
    tax_deduction_rwf: 0,
    pension_deduction_rwf: 0,
    other_deductions_rwf: 0,
    bank_name: "",
    bank_account: "",
    payment_method: "MTN MoMo Bulk" as PayrollRecord["payment_method"],
    payment_status: "Pending" as PayrollRecord["payment_status"],
    payment_date: "",
    payslip_ref: "",
    notes: "",
  });

  useEffect(() => {
    apiGet<{ success: boolean; data: any[] }>("/api/employees")
      .then((res) => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const fetched = res.data.map((emp) => ({
            name: emp.fullname || `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "Employee",
            code: emp.emp_number || `EMP-00${emp.id}`,
            department: emp.department_name || "Farm Operations",
            job_title: emp.job_title || "Staff Member",
            salary_rwf: Number(emp.salary_rwf) || 300000,
          }));
          const combined = [...fetched, ...DEFAULT_EMPLOYEES];
          const unique = combined.filter(
            (e, idx, self) => idx === self.findIndex((t) => t.name.trim().toLowerCase() === e.name.trim().toLowerCase())
          );
          setEmployeeOptions(unique);
        }
      })
      .catch(() => {});
  }, []);

  const totalNet = records.reduce((acc, r) => acc + r.net_salary_rwf, 0);
  const totalTax = records.reduce((acc, r) => acc + r.paye_tax_rwf + r.rssb_pension_rwf, 0);

  const handleDisbursePayroll = () => {
    if (records.length === 0) {
      toast.info("No payroll records present to disburse.");
      return;
    }
    setRecords((prev) => prev.map((r) => ({ ...r, payment_status: "Paid" })));
    toast.success("Bulk MoMo & Bank Payroll disbursement sent successfully!");
  };

  const handleAddPayroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_name.trim()) {
      toast.error("Please select an employee.");
      return;
    }

    const base = Number(form.base_salary_rwf) || 0;
    const allow = Number(form.allowances_rwf) || 0;
    const bonus = Number(form.bonuses_rwf) || 0;
    const overtime = Number(form.overtime_rwf) || 0;
    const tax = Number(form.tax_deduction_rwf) || 0;
    const pension = Number(form.pension_deduction_rwf) || 0;
    const other = Number(form.other_deductions_rwf) || 0;

    const net = base + allow + bonus + overtime - tax - pension - other;

    const newRecord: PayrollRecord = {
      id: form.payslip_ref.trim() || `PAY-2026-${String(records.length + 904).padStart(4, "0")}`,
      employee_name: form.employee_name.trim(),
      employee_code: form.employee_code.trim() || `EMP-00${records.length + 1}`,
      job_title: form.job_title,
      department: form.department,
      base_salary_rwf: base,
      allowances_rwf: allow,
      bonuses_rwf: bonus,
      overtime_rwf: overtime,
      paye_tax_rwf: tax,
      rssb_pension_rwf: pension,
      other_deductions_rwf: other,
      net_salary_rwf: net,
      bank_name: form.bank_name || "Bank of Kigali",
      bank_account: form.bank_account || "00000-000000-00",
      payment_method: form.payment_method,
      payment_status: form.payment_status,
      payment_date: form.payment_date || new Date().toISOString().split("T")[0],
      payslip_ref: form.payslip_ref || `PAY-2026-${String(records.length + 904).padStart(4, "0")}`,
      notes: form.notes,
      cycle_month: "September 2026",
    };

    setRecords([newRecord, ...records]);
    setIsAddOpen(false);
    setForm({
      employee_name: "",
      employee_code: "",
      job_title: "Field Supervisor",
      department: "Farm Operations",
      pay_period_start: "2026-09-01",
      base_salary_rwf: 0,
      allowances_rwf: 0,
      bonuses_rwf: 0,
      overtime_rwf: 0,
      tax_deduction_rwf: 0,
      pension_deduction_rwf: 0,
      other_deductions_rwf: 0,
      bank_name: "",
      bank_account: "",
      payment_method: "MTN MoMo Bulk",
      payment_status: "Pending",
      payment_date: "",
      payslip_ref: "",
      notes: "",
    });
    toast.success(`Payroll record saved for ${newRecord.employee_name}!`);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
            Payroll & Salary Processing
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monthly gross salaries, RSSB statutory pension & PAYE tax deductions, pay slips.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#055028]"
          >
            <Plus size={15} /> Add Payroll Entry
          </button>
          <button
            type="button"
            onClick={handleDisbursePayroll}
            className="inline-flex items-center gap-2 rounded-xl border border-[#076935] bg-emerald-50 px-4 py-2.5 text-xs font-bold text-[#076935] shadow-xs transition hover:bg-emerald-100"
          >
            <Send size={15} /> Disburse Current Payroll
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Net Disbursement"
          value={totalNet > 0 ? totalNet.toLocaleString() : "0"}
          unit="RWF"
          subtext={totalNet > 0 ? "Current Net Salary Cycle" : "No current net payroll data"}
          icon={<Banknote size={22} className="text-[#076935]" />}
          iconBg="bg-[#076935]/10"
          badgeText="Salary Cycle"
          badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
        />

        <MetricCard
          label="RSSB & PAYE Tax Total"
          value={totalTax > 0 ? totalTax.toLocaleString() : "0"}
          unit="RWF"
          subtext={totalTax > 0 ? "Remitted to RRA / RSSB" : "No tax deductions recorded"}
          icon={<Landmark size={22} className="text-amber-600" />}
          iconBg="bg-amber-50"
          badgeText="Statutory Tax"
          badgeColor="bg-amber-50 text-amber-700 border-amber-200"
        />

        <MetricCard
          label="Processed Employees"
          value={`${records.length}`}
          subtext={records.length > 0 ? "Active salary profiles" : "No active payroll records"}
          icon={<Users size={22} className="text-blue-600" />}
          iconBg="bg-blue-50"
          badgeText="Staff Payroll"
          badgeColor="bg-blue-50 text-blue-700 border-blue-200"
        />

        <MetricCard
          label="Payment Channels"
          value={records.length > 0 ? "MoMo / Bank" : "Inactive"}
          subtext="Mobile Money & Direct Bank Deposit"
          icon={<CreditCard size={22} className="text-purple-600" />}
          iconBg="bg-purple-50"
          badgeText="Channels"
          badgeColor="bg-purple-50 text-purple-700 border-purple-200"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#076935]/10 bg-white">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#F4FAF7] border-b border-[#076935]/10 text-gray-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Pay Ref</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Base Salary</th>
              <th className="px-4 py-3">Deductions (PAYE/RSSB)</th>
              <th className="px-4 py-3">Net Salary</th>
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <p className="text-sm font-semibold text-gray-700">No current payroll records</p>
                    <p className="text-xs text-gray-400">Payroll disbursements and slips will be listed here once generated.</p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((rec) => (
                <tr key={rec.id} className="hover:bg-[#F4FAF7]/50 transition">
                  <td className="px-4 py-3 font-bold font-mono text-gray-900">{rec.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{rec.employee_name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{rec.employee_code}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{rec.department}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{rec.base_salary_rwf.toLocaleString()} RWF</td>
                  <td className="px-4 py-3 text-rose-600 font-medium">
                    -{(rec.paye_tax_rwf + rec.rssb_pension_rwf).toLocaleString()} RWF
                  </td>
                  <td className="px-4 py-3 font-bold text-[#076935]">{rec.net_salary_rwf.toLocaleString()} RWF</td>
                  <td className="px-4 py-3 text-gray-600">{rec.payment_method}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        rec.payment_status === "Paid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {rec.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedPayslip(rec)}
                      className="p-1.5 text-[#076935] hover:bg-[#076935]/10 rounded-lg transition"
                      title="View Payslip"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Payroll Modal */}
      <Modal open={isAddOpen} onClose={() => setIsAddOpen(false)} size="xl" title={<div className="text-white font-bold text-lg bg-[#076935] -m-5 p-4 rounded-t-xl">Add Payroll Record</div>}>
        <form onSubmit={handleAddPayroll} className="space-y-4 pt-4 text-sm">
          {/* Row 1: Employee & Pay Period Start */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Employee *</label>
              <select
                required
                value={form.employee_name}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const matched = employeeOptions.find((emp) => emp.name === selectedName);
                  setForm({
                    ...form,
                    employee_name: selectedName,
                    employee_code: matched ? matched.code : form.employee_code,
                    department: matched ? matched.department : form.department,
                    job_title: matched ? matched.job_title : form.job_title,
                    base_salary_rwf: matched ? matched.salary_rwf : form.base_salary_rwf,
                  });
                }}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              >
                <option value="">Select employee...</option>
                {employeeOptions.map((emp) => (
                  <option key={emp.name} value={emp.name}>
                    {emp.name} ({emp.code} · {emp.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Pay Period Start *</label>
              <input
                type="date"
                required
                value={form.pay_period_start}
                onChange={(e) => setForm({ ...form, pay_period_start: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>
          </div>

          {/* Row 2: Basic Salary, Allowances, Bonuses, Overtime Pay */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Basic Salary (RWF)</label>
              <input
                type="number"
                min="0"
                value={form.base_salary_rwf}
                onChange={(e) => setForm({ ...form, base_salary_rwf: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Allowances (RWF)</label>
              <input
                type="number"
                min="0"
                value={form.allowances_rwf}
                onChange={(e) => setForm({ ...form, allowances_rwf: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Bonuses (RWF)</label>
              <input
                type="number"
                min="0"
                value={form.bonuses_rwf}
                onChange={(e) => setForm({ ...form, bonuses_rwf: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Overtime Pay (RWF)</label>
              <input
                type="number"
                min="0"
                value={form.overtime_rwf}
                onChange={(e) => setForm({ ...form, overtime_rwf: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>
          </div>

          {/* Row 3: Tax Deduction, Pension Deduction, Other Deductions, Net Pay */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Tax Deduction (RWF)</label>
              <input
                type="number"
                min="0"
                value={form.tax_deduction_rwf}
                onChange={(e) => setForm({ ...form, tax_deduction_rwf: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Pension Deduction (RWF)</label>
              <input
                type="number"
                min="0"
                value={form.pension_deduction_rwf}
                onChange={(e) => setForm({ ...form, pension_deduction_rwf: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Other Deductions (RWF)</label>
              <input
                type="number"
                min="0"
                value={form.other_deductions_rwf}
                onChange={(e) => setForm({ ...form, other_deductions_rwf: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Net Pay (RWF)</label>
              <input
                type="text"
                readOnly
                value={(
                  form.base_salary_rwf +
                  form.allowances_rwf +
                  form.bonuses_rwf +
                  form.overtime_rwf -
                  form.tax_deduction_rwf -
                  form.pension_deduction_rwf -
                  form.other_deductions_rwf
                ).toLocaleString()}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm font-bold text-[#076935] outline-none"
              />
            </div>
          </div>

          {/* Row 4: Bank Name & Bank Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Bank Name</label>
              <input
                type="text"
                placeholder="e.g. Bank of Kigali / Equity Bank"
                value={form.bank_name}
                onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Bank Account</label>
              <input
                type="text"
                placeholder="e.g. 00049-082914-01"
                value={form.bank_account}
                onChange={(e) => setForm({ ...form, bank_account: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>
          </div>

          {/* Row 5: Payment Status, Payment Date, Payslip Ref */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Payment Status</label>
              <select
                value={form.payment_status}
                onChange={(e) => setForm({ ...form, payment_status: e.target.value as any })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Processing">Processing</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Payment Date</label>
              <input
                type="date"
                value={form.payment_date}
                onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Payslip Ref</label>
              <input
                type="text"
                placeholder="e.g. PAY-2026-0904"
                value={form.payslip_ref}
                onChange={(e) => setForm({ ...form, payslip_ref: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>
          </div>

          {/* Row 6: Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Notes</label>
            <textarea
              rows={3}
              placeholder="Additional payroll comments or notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="rounded-xl border border-gray-300 bg-gray-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#076935] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#055028] shadow-sm"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Payslip Modal */}
      <Modal open={Boolean(selectedPayslip)} onClose={() => setSelectedPayslip(null)} size="md" title="Official KainaFresh Pay Slip">
        {selectedPayslip && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between bg-[#F4FAF7] p-3 rounded-xl border border-[#076935]/15">
              <div>
                <p className="font-bold text-[#076935] text-sm">KainaFresh Produce Ltd</p>
                <p className="text-gray-500">Kigali, Rwanda • TIN: 102-491-002</p>
              </div>
              <span className="font-mono text-xs font-bold text-gray-700">{selectedPayslip.cycle_month}</span>
            </div>

            <div className="border-t border-b py-2 space-y-1">
              <p><strong>Employee:</strong> {selectedPayslip.employee_name} ({selectedPayslip.employee_code})</p>
              <p><strong>Title:</strong> {selectedPayslip.job_title}</p>
              <p><strong>Department:</strong> {selectedPayslip.department}</p>
            </div>

            <div className="space-y-1.5 bg-gray-50 p-3 rounded-xl">
              <div className="flex justify-between">
                <span>Base Salary:</span>
                <span className="font-bold">{selectedPayslip.base_salary_rwf.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between">
                <span>Allowances / Bonuses:</span>
                <span className="font-bold text-emerald-600">+{selectedPayslip.allowances_rwf.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>PAYE Income Tax:</span>
                <span>-{selectedPayslip.paye_tax_rwf.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>RSSB Pension (3%):</span>
                <span>-{selectedPayslip.rssb_pension_rwf.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-sm font-extrabold text-[#076935]">
                <span>Net Payable:</span>
                <span>{selectedPayslip.net_salary_rwf.toLocaleString()} RWF</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                <Printer size={14} /> Print Payslip
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

