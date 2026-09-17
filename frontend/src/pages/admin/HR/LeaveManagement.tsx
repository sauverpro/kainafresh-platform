import { useState } from "react";
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  Eye,
  FileText,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";
import MetricCard from "../../../components/ui/MetricCard";

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

const INITIAL_LEAVES: LeaveRequest[] = [];

export default function LeaveManagement() {
  usePageTitle("leave-management", "Leave Management");

  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);

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
          value="0"
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

