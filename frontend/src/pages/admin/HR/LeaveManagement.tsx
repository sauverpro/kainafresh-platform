import { useEffect, useState } from "react";
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Plus,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";
import MetricCard from "../../../components/ui/MetricCard";
import { apiGet } from "../../../api/client";

export interface LeaveRequest {
  id: string;
  employee_name: string;
  department: string;
  leave_type: "Annual Leave" | "Sick Leave" | "Maternity/Paternity" | "Emergency Unpaid";
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  applied_on: string;
}

const DEFAULT_EMPLOYEES: Array<{ name: string; department: string }> = [
  { name: "Jean-Baptiste Musafiri", department: "Farm Operations" },
  { name: "Aline Uwase", department: "Quality Control" },
  { name: "Emmanuel Habimana", department: "Logistics & Fleet" },
  { name: "Claude Makuza", department: "Farm Operations" },
  { name: "Divine Uwineza", department: "Quality Assurance" },
  { name: "Fulgence Iradukunda", department: "Finance & Admin" },
];

const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: "LV-2026-001",
    employee_name: "Jean-Baptiste Musafiri",
    department: "Farm Operations",
    leave_type: "Annual Leave",
    start_date: "2026-09-22",
    end_date: "2026-09-29",
    total_days: 6,
    reason: "Annual family harvest rest & personal leave",
    status: "Pending",
    applied_on: "2026-09-18",
  },
  {
    id: "LV-2026-002",
    employee_name: "Aline Uwase",
    department: "Quality Control",
    leave_type: "Sick Leave",
    start_date: "2026-09-15",
    end_date: "2026-09-17",
    total_days: 3,
    reason: "Medical treatment & recovery (Doctor certified)",
    status: "Approved",
    applied_on: "2026-09-14",
  },
  {
    id: "LV-2026-003",
    employee_name: "Emmanuel Habimana",
    department: "Logistics & Fleet",
    leave_type: "Emergency Unpaid",
    start_date: "2026-10-01",
    end_date: "2026-10-03",
    total_days: 3,
    reason: "Urgent family event in Northern Province",
    status: "Pending",
    applied_on: "2026-09-19",
  },
];

export default function LeaveManagement() {
  usePageTitle("leave-management", "Leave Management");

  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState<Array<{ name: string; department: string }>>(DEFAULT_EMPLOYEES);

  const [form, setForm] = useState({
    employee_name: "",
    department: "Farm Operations",
    leave_type: "Annual Leave" as LeaveRequest["leave_type"],
    start_date: "",
    end_date: "",
    total_days: 1,
    reason: "",
    status: "Pending" as LeaveRequest["status"],
  });

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    if (isNaN(diff) || diff < 0) return 1;
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  useEffect(() => {
    apiGet<{ success: boolean; data: any[] }>("/api/employees")
      .then((res) => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const fetched = res.data.map((emp) => ({
            name: emp.fullname || `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "Employee",
            department: emp.department_name || "Farm Operations",
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

  const pendingCount = leaves.filter((l) => l.status === "Pending").length;
  const approvedCount = leaves.filter((l) => l.status === "Approved").length;

  const handleApprove = (id: string) => {
    setLeaves((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "Approved" } : l))
    );
    setSelectedLeave(null);
    toast.success(`Leave request #${id} approved successfully!`);
  };

  const handleReject = (id: string) => {
    setLeaves((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "Rejected" } : l))
    );
    setSelectedLeave(null);
    toast.error(`Leave request #${id} rejected.`);
  };

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_name.trim()) {
      toast.error("Please select an employee.");
      return;
    }
    if (!form.start_date || !form.end_date) {
      toast.error("Start Date and End Date are mandatory.");
      return;
    }

    const computedDays = calculateDays(form.start_date, form.end_date);

    const newReq: LeaveRequest = {
      id: `LV-2026-00${leaves.length + 1}`,
      employee_name: form.employee_name.trim(),
      department: form.department,
      leave_type: form.leave_type,
      start_date: form.start_date,
      end_date: form.end_date,
      total_days: computedDays,
      reason: form.reason.trim() || "Standard Leave Request",
      status: form.status,
      applied_on: new Date().toISOString().split("T")[0],
    };

    setLeaves([newReq, ...leaves]);
    setIsAddOpen(false);
    setForm({
      employee_name: "",
      department: "Farm Operations",
      leave_type: "Annual Leave",
      start_date: "",
      end_date: "",
      total_days: 1,
      reason: "",
      status: "Pending",
    });
    toast.success(`Leave request #${newReq.id} created successfully for ${newReq.employee_name}!`);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
            Leave Management & Approvals
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review annual leaves, medical time-off, emergency requests, and balance tracking.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#055028]"
        >
          <Plus size={16} /> Create Leave Request
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Pending Approvals"
          value={`${pendingCount}`}
          subtext={pendingCount > 0 ? "Awaiting HR & team lead review" : "No pending leave requests"}
          icon={<Clock size={22} className="text-amber-600" />}
          iconBg="bg-amber-50"
          badgeText="Pending Review"
          badgeColor="bg-amber-50 text-amber-700 border-amber-200"
        />

        <MetricCard
          label="Approved Leaves"
          value={`${approvedCount}`}
          subtext={approvedCount > 0 ? "Processed annual & sick leaves" : "No approved leave records"}
          icon={<CheckCircle size={22} className="text-[#076935]" />}
          iconBg="bg-[#076935]/10"
          badgeText="Approved"
          badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
        />

        <MetricCard
          label="Staff Currently On Leave"
          value={`${approvedCount}`}
          subtext="Active staff away today"
          icon={<CalendarCheck size={22} className="text-blue-600" />}
          iconBg="bg-blue-50"
          badgeText="Active Absence"
          badgeColor="bg-blue-50 text-blue-700 border-blue-200"
        />

        <MetricCard
          label="Total Leave Applications"
          value={`${leaves.length}`}
          subtext={leaves.length > 0 ? "Total time-off applications" : "No leave requests submitted"}
          icon={<FileText size={22} className="text-purple-600" />}
          iconBg="bg-purple-50"
          badgeText="Total Submitted"
          badgeColor="bg-purple-50 text-purple-700 border-purple-200"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#076935]/10 bg-white">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#F4FAF7] border-b border-[#076935]/10 text-gray-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Request ID</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Leave Type</th>
              <th className="px-4 py-3">Dates & Duration</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leaves.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <CalendarCheck size={28} className="text-gray-300" />
                    <p className="text-sm font-semibold text-gray-700">No current leave requests</p>
                    <p className="text-xs text-gray-400">Employee leave applications will appear here when submitted.</p>
                  </div>
                </td>
              </tr>
            ) : (
              leaves.map((req) => (
                <tr key={req.id} className="hover:bg-[#F4FAF7]/50 transition">
                  <td className="px-4 py-3 font-bold font-mono text-gray-900">{req.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{req.employee_name}</p>
                    <p className="text-[11px] text-gray-400">{req.department}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#076935]">{req.leave_type}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <p>{req.start_date} to {req.end_date}</p>
                    <p className="text-[11px] font-bold text-gray-500">{req.total_days} Working Days</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{req.reason}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        req.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : req.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <button
                      onClick={() => setSelectedLeave(req)}
                      className="p-1 text-[#076935] hover:bg-[#076935]/10 rounded-lg inline-flex items-center"
                      title="View Request Details"
                    >
                      <Eye size={15} />
                    </button>
                    {req.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="rounded-lg bg-[#076935] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#055028]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="rounded-lg bg-rose-50 text-rose-600 border border-rose-200 px-2.5 py-1 text-[11px] font-bold hover:bg-rose-100"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Leave Modal */}
      <Modal open={isAddOpen} onClose={() => setIsAddOpen(false)} size="lg" title={<div className="text-gray-900 font-bold text-lg bg-[#FFC107] -m-5 p-4 rounded-t-xl flex items-center gap-2"><CalendarCheck size={20} /> New Leave Request</div>}>
        <form onSubmit={handleCreateLeave} className="space-y-4 pt-4 text-sm">
          {/* Row 1: Employee & Leave Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Employee <span className="text-red-500">*</span></label>
              <select
                required
                value={form.employee_name}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const matched = employeeOptions.find((emp) => emp.name === selectedName);
                  setForm({
                    ...form,
                    employee_name: selectedName,
                    department: matched ? matched.department : form.department,
                  });
                }}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              >
                <option value="">Select...</option>
                {employeeOptions.map((emp) => (
                  <option key={emp.name} value={emp.name}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Leave Type <span className="text-red-500">*</span></label>
              <select
                value={form.leave_type}
                onChange={(e) => setForm({ ...form, leave_type: e.target.value as LeaveRequest["leave_type"] })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              >
                <option value="Annual Leave">Annual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Maternity/Paternity">Maternity/Paternity</option>
                <option value="Emergency Unpaid">Emergency Unpaid</option>
              </select>
            </div>
          </div>

          {/* Row 2: Start Date, End Date, Days Requested (Auto-calculated) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Start Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                required
                value={form.start_date}
                onChange={(e) => {
                  const nextStart = e.target.value;
                  const nextDays = calculateDays(nextStart, form.end_date);
                  setForm({ ...form, start_date: nextStart, total_days: nextDays });
                }}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">End Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                required
                value={form.end_date}
                onChange={(e) => {
                  const nextEnd = e.target.value;
                  const nextDays = calculateDays(form.start_date, nextEnd);
                  setForm({ ...form, end_date: nextEnd, total_days: nextDays });
                }}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Days Requested <span className="text-red-500">*</span></label>
              <input
                type="text"
                readOnly
                value={`${calculateDays(form.start_date, form.end_date)} Day(s)`}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm font-bold text-[#076935] outline-none"
              />
            </div>
          </div>

          {/* Row 3: Reason */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Reason</label>
            <textarea
              rows={3}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              placeholder="Reason for time-off request..."
            />
          </div>

          {/* Row 4: Status */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
              className="w-full sm:w-1/2 rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
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
              className="rounded-xl bg-[#FFC107] px-6 py-2.5 text-sm font-bold text-gray-900 hover:bg-[#e0a800] shadow-sm"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Leave Detail Modal */}
      <Modal open={Boolean(selectedLeave)} onClose={() => setSelectedLeave(null)} size="md" title="Leave Application Details">
        {selectedLeave && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#F4FAF7] rounded-xl border border-[#076935]/15">
              <p className="font-bold text-[#076935] text-sm">{selectedLeave.employee_name}</p>
              <p className="text-gray-500">{selectedLeave.department}</p>
            </div>
            <div className="space-y-1">
              <p><strong>Request ID:</strong> {selectedLeave.id}</p>
              <p><strong>Type:</strong> {selectedLeave.leave_type}</p>
              <p><strong>Period:</strong> {selectedLeave.start_date} to {selectedLeave.end_date} ({selectedLeave.total_days} Days)</p>
              <p><strong>Applied On:</strong> {selectedLeave.applied_on}</p>
              <p><strong>Reason:</strong> {selectedLeave.reason}</p>
              <p><strong>Status:</strong> {selectedLeave.status}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


