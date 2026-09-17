import { useState } from "react";
import {
  Eye,
  Printer,
  Send,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";

export interface PayrollRecord {
  id: string;
  employee_name: string;
  employee_code: string;
  job_title: string;
  department: string;
  base_salary_rwf: number;
  allowances_rwf: number;
  paye_tax_rwf: number;
  rssb_pension_rwf: number;
  net_salary_rwf: number;
  payment_method: "MTN MoMo Bulk" | "Bank Transfer" | "Airtel Money";
  payment_status: "Paid" | "Processing" | "Draft";
  cycle_month: string;
}

const INITIAL_PAYROLL: PayrollRecord[] = [
  {
    id: "PAY-2026-08-01",
    employee_name: "Jean-Claude Mugisha",
    employee_code: "KF-EMP-101",
    job_title: "Senior Agronomist",
    department: "Farm Operations",
    base_salary_rwf: 650000,
    allowances_rwf: 50000,
    paye_tax_rwf: 95000,
    rssb_pension_rwf: 19500,
    net_salary_rwf: 585500,
    payment_method: "Bank Transfer",
    payment_status: "Paid",
    cycle_month: "August 2026",
  },
  {
    id: "PAY-2026-08-02",
    employee_name: "Alice Uwimana",
    employee_code: "KF-EMP-102",
    job_title: "Quality Control Supervisor",
    department: "Post-Harvest & Packaging",
    base_salary_rwf: 520000,
    allowances_rwf: 30000,
    paye_tax_rwf: 68000,
    rssb_pension_rwf: 15600,
    net_salary_rwf: 466400,
    payment_method: "MTN MoMo Bulk",
    payment_status: "Paid",
    cycle_month: "August 2026",
  },
  {
    id: "PAY-2026-08-03",
    employee_name: "Emmanuel Habimana",
    employee_code: "KF-EMP-103",
    job_title: "Cold-Chain Driver",
    department: "Logistics & Fleet",
    base_salary_rwf: 380000,
    allowances_rwf: 40000,
    paye_tax_rwf: 42000,
    rssb_pension_rwf: 11400,
    net_salary_rwf: 366600,
    payment_method: "MTN MoMo Bulk",
    payment_status: "Processing",
    cycle_month: "August 2026",
  },
  {
    id: "PAY-2026-08-04",
    employee_name: "Patrick Nshimiyimana",
    employee_code: "KF-EMP-105",
    job_title: "Harvest Supervisor",
    department: "Farm Operations",
    base_salary_rwf: 250000,
    allowances_rwf: 20000,
    paye_tax_rwf: 18000,
    rssb_pension_rwf: 7500,
    net_salary_rwf: 244500,
    payment_method: "MTN MoMo Bulk",
    payment_status: "Processing",
    cycle_month: "August 2026",
  },
];

export default function Payroll() {
  usePageTitle("payroll-management", "Payroll & Salary Processing");

  const [records, setRecords] = useState<PayrollRecord[]>(INITIAL_PAYROLL);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

  const totalNet = records.reduce((acc, r) => acc + r.net_salary_rwf, 0);
  const totalTax = records.reduce((acc, r) => acc + r.paye_tax_rwf + r.rssb_pension_rwf, 0);

  const handleDisbursePayroll = () => {
    setRecords((prev) => prev.map((r) => ({ ...r, payment_status: "Paid" })));
    toast.success("Bulk MoMo & Bank Payroll disbursement sent successfully!");
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
            onClick={handleDisbursePayroll}
            className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#055028]"
          >
            <Send size={15} /> Disburse August Payroll
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">Total Net Disbursement</p>
          <p className="text-2xl font-extrabold text-[#076935] mt-1">{totalNet.toLocaleString()} RWF</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">August 2026 Salary Cycle</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-900">RSSB & PAYE Tax Total</p>
          <p className="text-2xl font-extrabold text-amber-900 mt-1">{totalTax.toLocaleString()} RWF</p>
          <p className="text-[11px] text-amber-700 mt-0.5">Remitted to RRA / RSSB</p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-900">Payment Channels</p>
          <p className="text-lg font-bold text-blue-900 mt-1">75% MoMo Bulk / 25% Bank</p>
          <p className="text-[11px] text-blue-700 mt-0.5">Instant Mobile Money Payout</p>
        </div>
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
            {records.map((rec) => (
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
            ))}
          </tbody>
        </table>
      </div>

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
