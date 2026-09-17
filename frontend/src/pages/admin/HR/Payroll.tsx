import { useState } from "react";
import {
  Eye,
  Printer,
  Send,
  Banknote,
  Landmark,
  Users,
  CreditCard,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";
import MetricCard from "../../../components/ui/MetricCard";

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

const INITIAL_PAYROLL: PayrollRecord[] = [];

export default function Payroll() {
  usePageTitle("payroll-management", "Payroll & Salary Processing");

  const [records, setRecords] = useState<PayrollRecord[]>(INITIAL_PAYROLL);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

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
