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
      <Modal
        open={Boolean(selectedLeave)}
        onClose={() => setSelectedLeave(null)}
        size="md"
        title={
          <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg">
            <div className="p-2 rounded-xl bg-[#076935]/10 text-[#076935]">
              <CalendarCheck size={20} />
            </div>
            <span>Leave Application Details</span>
          </div>
        }
      >
        {selectedLeave && (
          <div className="space-y-5 text-sm pt-1">
            {/* Employee Profile Header Card */}
            <div className="p-4 bg-gradient-to-r from-[#F4FAF7] to-emerald-50/40 rounded-2xl border border-[#076935]/20 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-[#076935] text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {selectedLeave.employee_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{selectedLeave.employee_name}</h3>
                  <p className="text-xs font-medium text-gray-500">{selectedLeave.department}</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 shadow-2xs">
                {selectedLeave.id}
              </span>
            </div>

            {/* Key Information Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Leave Type</span>
                <span className="inline-flex rounded-md bg-emerald-100/70 px-2.5 py-0.5 text-xs font-bold text-[#076935]">
                  {selectedLeave.leave_type}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Approval Status</span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold ${
                    selectedLeave.status === "Approved"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : selectedLeave.status === "Pending"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      selectedLeave.status === "Approved"
                        ? "bg-emerald-500"
                        : selectedLeave.status === "Pending"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                  />
                  {selectedLeave.status}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Leave Period</span>
                <p className="font-semibold text-gray-800 text-xs">
                  {selectedLeave.start_date} <span className="text-gray-400 font-normal">to</span> {selectedLeave.end_date}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Duration</span>
                <p className="font-bold text-[#076935] text-xs">{selectedLeave.total_days} Working Days</p>
              </div>
            </div>

            {/* Application Date & Reason */}
            <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2">
              <div className="flex items-center justify-between text-xs border-b border-gray-100 pb-2">
                <span className="font-bold text-gray-500">Applied On</span>
                <span className="font-medium text-gray-800">{selectedLeave.applied_on}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 block mb-1">Reason for Leave:</span>
                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                  "{selectedLeave.reason}"
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="flex gap-2">
                {selectedLeave.status === "Pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedLeave.id)}
                      className="rounded-xl bg-[#076935] px-4 py-2 text-xs font-bold text-white hover:bg-[#055028] shadow-xs transition"
                    >
                      Approve Request
                    </button>
                    <button
                      onClick={() => handleReject(selectedLeave.id)}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
                    >
                      Reject Request
                    </button>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeave(null)}
                className="rounded-xl border border-gray-300 bg-white px-5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


