import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Loader2,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { apiGet } from "../../../api/client";
import Modal from "../../../components/ui/Modal";
import MetricCard from "../../../components/ui/MetricCard";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { type LeaveRequest, useLeaveStore } from "../../../store/useLeaveStore";

interface EmployeeOption {
  id: number;
  name: string;
  department: string;
}
const emptyForm = {
  employee_id: "",
  leave_type: "annual",
  start_date: "",
  end_date: "",
  leave_reason: "",
};
const titleCase = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatDate = (value?: string) => (value ? value.slice(0, 10) : "—");

export default function LeaveManagement() {
  usePageTitle("leave-management", "Leave Management");
  const {
    leaves,
    loading,
    creating,
    processingId,
    error,
    fetchLeaves,
    createLeave,
    acceptLeave,
    rejectLeave,
    deleteLeave,
    clearError,
  } = useLeaveStore();
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    void fetchLeaves();
  }, [fetchLeaves]);
  useEffect(() => {
    apiGet<{ data?: Array<Record<string, unknown>> }>("/api/employees")
      .then((response) =>
        setEmployees(
          (response.data ?? [])
            .map((employee) => ({
              id: Number(employee.id),
              name: String(
                employee.fullname ||
                  `${employee.first_name || ""} ${employee.last_name || ""}`.trim() ||
                  "Employee",
              ),
              department: String(employee.department_name || "General"),
            }))
            .filter((employee) => Number.isFinite(employee.id)),
        ),
      )
      .catch(() => setEmployees([]));
  }, []);
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);
  useEffect(() => {
    if (selectedLeave)
      setSelectedLeave(
        leaves.find((leave) => leave.id === selectedLeave.id) ?? null,
      );
  }, [leaves, selectedLeave?.id]);

  const counts = useMemo(
    () => ({
      pending: leaves.filter((leave) => leave.status === "pending").length,
      approved: leaves.filter((leave) => leave.status === "approved").length,
      active: leaves.filter(
        (leave) =>
          leave.status === "approved" &&
          new Date(leave.start_date) <= new Date() &&
          new Date(leave.end_date) >= new Date(),
      ).length,
    }),
    [leaves],
  );
  const duration = useMemo(() => {
    if (!form.start_date || !form.end_date) return 1;
    const difference =
      new Date(form.end_date).getTime() - new Date(form.start_date).getTime();
    return difference < 0 ? 1 : Math.floor(difference / 86_400_000) + 1;
  }, [form.start_date, form.end_date]);
  const busy = (id: number) => processingId === id;
  const statusClass = (status: LeaveRequest["status"]) =>
    status === "approved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "pending"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-rose-50 text-rose-700 border-rose-200";

  const submitCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.employee_id || !form.leave_reason.trim())
      return toast.error(
        "Select an employee and enter a reason for the request.",
      );
    if (form.end_date < form.start_date)
      return toast.error("The end date cannot be earlier than the start date.");
    const created = await createLeave({
      ...form,
      employee_id: Number(form.employee_id),
      leave_reason: form.leave_reason.trim(),
      leave_duration: duration,
    });
    if (created) {
      setIsAddOpen(false);
      setForm(emptyForm);
      toast.success("Leave request created successfully.");
      void fetchLeaves();
    }
  };
  const approve = async (leave: LeaveRequest) => {
    if (await acceptLeave(leave.id)) toast.success("Leave request approved.");
  };
  const submitReject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedLeave || !rejectReason.trim())
      return toast.error("A rejection reason is required.");
    if (await rejectLeave(selectedLeave.id, rejectReason.trim())) {
      toast.success("Leave request rejected.");
      setRejectReason("");
      setIsRejectOpen(false);
    }
  };
  const remove = async (leave: LeaveRequest) => {
    if (
      !window.confirm(
        `Delete leave request #${leave.id}? This cannot be undone.`,
      )
    )
      return;
    if (await deleteLeave(leave.id)) {
      toast.success("Leave request deleted.");
      setSelectedLeave(null);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Leave Management & Approvals
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, review, approve, reject, and remove staff leave requests.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          disabled={creating}
          className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60"
        >
          <Plus size={16} /> Create Leave Request
        </button>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Pending Approvals"
          value={String(counts.pending)}
          subtext="Awaiting review"
          icon={<Clock size={22} className="text-amber-600" />}
          iconBg="bg-amber-50"
          badgeText="Pending"
          badgeColor="bg-amber-50 text-amber-700 border-amber-200"
        />
        <MetricCard
          label="Approved Leaves"
          value={String(counts.approved)}
          subtext="Processed leave requests"
          icon={<CheckCircle size={22} className="text-[#076935]" />}
          iconBg="bg-[#076935]/10"
          badgeText="Approved"
          badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
        />
        <MetricCard
          label="Staff Currently On Leave"
          value={String(counts.active)}
          subtext="Approved requests active today"
          icon={<CalendarCheck size={22} className="text-blue-600" />}
          iconBg="bg-blue-50"
          badgeText="Active"
          badgeColor="bg-blue-50 text-blue-700 border-blue-200"
        />
        <MetricCard
          label="Total Leave Applications"
          value={String(leaves.length)}
          subtext="All submitted requests"
          icon={<FileText size={22} className="text-purple-600" />}
          iconBg="bg-purple-50"
          badgeText="Total"
          badgeColor="bg-purple-50 text-purple-700 border-purple-200"
        />
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#076935]/10 bg-white">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#F4FAF7] border-b border-[#076935]/10 text-gray-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Leave Type</th>
              <th className="px-4 py-3">Dates & Duration</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <Loader2
                    className="inline animate-spin text-[#076935]"
                    size={24}
                  />
                  <p className="mt-2 text-gray-500">Loading leave requests…</p>
                </td>
              </tr>
            ) : leaves.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  No leave requests found.
                </td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-[#F4FAF7]/50">
                  <td className="px-4 py-3 font-bold font-mono">#{leave.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">
                      {leave.employee_name || `Employee #${leave.employee_id}`}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#076935]">
                    {titleCase(leave.leave_type)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <p>
                      {formatDate(leave.start_date)} to{" "}
                      {formatDate(leave.end_date)}
                    </p>
                    <p className="text-[11px] font-bold text-gray-500">
                      {leave.leave_duration} day(s)
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                    {leave.leave_reason}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusClass(leave.status)}`}
                    >
                      {titleCase(leave.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <button
                      onClick={() => setSelectedLeave(leave)}
                      disabled={busy(leave.id)}
                      className="p-1 text-[#076935] hover:bg-[#076935]/10 rounded-lg"
                      title="View request"
                    >
                      <Eye size={15} />
                    </button>
                    {leave.status === "pending" && (
                      <>
                        <button
                          onClick={() => void approve(leave)}
                          disabled={busy(leave.id)}
                          className="rounded-lg bg-[#076935] px-2.5 py-1 text-[11px] font-bold text-white disabled:opacity-60"
                        >
                          {busy(leave.id) ? (
                            <Loader2 className="animate-spin" size={13} />
                          ) : (
                            "Approve"
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLeave(leave);
                            setIsRejectOpen(true);
                          }}
                          disabled={busy(leave.id)}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-600 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => void remove(leave)}
                      disabled={busy(leave.id)}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-60"
                      title="Delete request"
                    >
                      {busy(leave.id) ? (
                        <Loader2 className="animate-spin" size={15} />
                      ) : (
                        <Trash2 size={15} />
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
        onClose={() => !creating && setIsAddOpen(false)}
        size="lg"
        title={<div className="font-bold text-lg">New Leave Request</div>}
      >
        <form
          onSubmit={(event) => void submitCreate(event)}
          className="space-y-4 pt-3 text-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="font-bold text-gray-800">
              Employee
              <select
                required
                value={form.employee_id}
                onChange={(event) =>
                  setForm({ ...form, employee_id: event.target.value })
                }
                disabled={creating}
                className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 font-medium"
              >
                <option value="">Select employee…</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.department})
                  </option>
                ))}
              </select>
            </label>
            <label className="font-bold text-gray-800">
              Leave Type
              <select
                value={form.leave_type}
                onChange={(event) =>
                  setForm({ ...form, leave_type: event.target.value })
                }
                disabled={creating}
                className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 font-medium"
              >
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="maternity">Maternity/Paternity</option>
                <option value="emergency_unpaid">Emergency Unpaid</option>
              </select>
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="font-bold text-gray-800">
              Start Date
              <input
                type="date"
                required
                value={form.start_date}
                onChange={(event) =>
                  setForm({ ...form, start_date: event.target.value })
                }
                disabled={creating}
                className="mt-1 w-full rounded-xl border border-gray-300 p-2.5"
              />
            </label>
            <label className="font-bold text-gray-800">
              End Date
              <input
                type="date"
                required
                min={form.start_date || undefined}
                value={form.end_date}
                onChange={(event) =>
                  setForm({ ...form, end_date: event.target.value })
                }
                disabled={creating}
                className="mt-1 w-full rounded-xl border border-gray-300 p-2.5"
              />
            </label>
          </div>
          <label className="block font-bold text-gray-800">
            Reason
            <textarea
              required
              rows={3}
              value={form.leave_reason}
              onChange={(event) =>
                setForm({ ...form, leave_reason: event.target.value })
              }
              disabled={creating}
              className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 font-medium"
              placeholder="Reason for time off…"
            />
          </label>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              disabled={creating}
              className="rounded-xl border border-gray-300 px-5 py-2.5 font-bold disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center rounded-xl bg-[#FFC107] px-6 py-2.5 font-bold text-gray-900 disabled:opacity-60"
            >
              {creating && <Loader2 className="mr-2 animate-spin" size={16} />}
              {creating ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        open={isRejectOpen}
        onClose={() => !processingId && setIsRejectOpen(false)}
        size="sm"
        title={
          <div className="flex gap-2 font-bold text-lg">
            <XCircle className="text-rose-600" /> Reject Leave Request
          </div>
        }
      >
        <form
          onSubmit={(event) => void submitReject(event)}
          className="space-y-4 pt-3"
        >
          <p className="text-sm text-gray-600">
            Provide a reason for rejecting this request.
          </p>
          <textarea
            required
            rows={4}
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            disabled={processingId !== null}
            className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
            placeholder="Rejection reason…"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsRejectOpen(false)}
              disabled={processingId !== null}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processingId !== null}
              className="inline-flex items-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {processingId !== null && (
                <Loader2 className="mr-2 animate-spin" size={16} />
              )}
              Reject
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        open={Boolean(selectedLeave) && !isRejectOpen}
        onClose={() => !processingId && setSelectedLeave(null)}
        size="md"
        title={
          <div className="font-bold text-lg">Leave Application Details</div>
        }
      >
        {selectedLeave && (
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border bg-gray-50 p-4">
              <p className="font-bold text-gray-900">
                {selectedLeave.employee_name ||
                  `Employee #${selectedLeave.employee_id}`}
              </p>
              <p className="mt-1 text-[#076935] font-semibold">
                {titleCase(selectedLeave.leave_type)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold text-gray-400">PERIOD</p>
                <p>
                  {formatDate(selectedLeave.start_date)} to{" "}
                  {formatDate(selectedLeave.end_date)}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400">STATUS</p>
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-bold ${statusClass(selectedLeave.status)}`}
                >
                  {titleCase(selectedLeave.status)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400">REASON</p>
              <p className="mt-1 rounded-xl bg-gray-50 p-3">
                {selectedLeave.leave_reason}
              </p>
            </div>
            {selectedLeave.reject_reason && (
              <div>
                <p className="text-xs font-bold text-rose-500">
                  REJECTION REASON
                </p>
                <p className="mt-1 rounded-xl bg-rose-50 p-3 text-rose-700">
                  {selectedLeave.reject_reason}
                </p>
              </div>
            )}
            <div className="flex justify-between border-t pt-4">
              <div className="flex gap-2">
                {selectedLeave.status === "pending" && (
                  <>
                    <button
                      onClick={() => void approve(selectedLeave)}
                      disabled={busy(selectedLeave.id)}
                      className="rounded-xl bg-[#076935] px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setIsRejectOpen(true)}
                      disabled={busy(selectedLeave.id)}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => void remove(selectedLeave)}
                disabled={busy(selectedLeave.id)}
                className="rounded-xl border border-rose-200 px-4 py-2 text-xs font-bold text-rose-600 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
