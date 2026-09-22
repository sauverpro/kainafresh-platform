import { useEffect, useState } from "react";
import {
  Award,
  Plus,
  Calendar,
  CheckCircle,
  Pencil,
  Trash2,
  BookOpen,
  Eye,
  X,
  AlertTriangle,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";
import MetricCard from "../../../components/ui/MetricCard";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../api/client";

/* ────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────── */
export interface TrainingRecord {
  id: string;
  emp_id: string;
  employee_name: string;
  training_name: string;
  training_type:
    | "Workshop"
    | "Online Course"
    | "Certification"
    | "Internal Training"
    | "Seminar";
  provider: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  cost: number;
  certification_ref?: string;
  skills_gained?: string;
  status: "Planned" | "Ongoing" | "Completed" | "Cancelled";
  notes?: string;
}

interface BackendTraining {
  id: string | number;
  emp_id?: string | number;
  employee_id?: string | number;
  employee_name?: string;
  employee_fullname?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  training_name?: string;
  name?: string;
  training_type?: string;
  type?: string;
  provider?: string;
  start_date?: string;
  end_date?: string;
  duration_days?: number | string;
  cost?: number | string;
  certification_ref?: string;
  certification?: string;
  skills_gained?: string;
  skills?: string;
  status?: string;
  notes?: string;
}

type EmployeeOption = { id?: string | number; name: string; department: string };

/* ────────────────────────────────────────────────────────────
 * Normalizers
 * ──────────────────────────────────────────────────────────── */
function normalizeTrainingType(
  raw?: string,
): TrainingRecord["training_type"] {
  const v = (raw || "").toLowerCase().trim();
  if (v === "online course" || v === "online_course" || v === "online")
    return "Online Course";
  if (v === "certification") return "Certification";
  if (v === "internal training" || v === "internal_training" || v === "internal")
    return "Internal Training";
  if (v === "seminar") return "Seminar";
  return "Workshop";
}

function normalizeStatus(raw?: string): TrainingRecord["status"] {
  const v = (raw || "").toLowerCase().trim();
  if (v === "ongoing") return "Ongoing";
  if (v === "completed") return "Completed";
  if (v === "cancelled" || v === "canceled") return "Cancelled";
  return "Planned";
}

function formatDateOnly(value?: string | null): string {
  if (!value) return "";
  return value.split(" ")[0];
}

function calculateDurationBetween(start: string, end: string): number {
  if (!start || !end) return 1;
  const s = new Date(start);
  const e = new Date(end);
  const diff = e.getTime() - s.getTime();
  if (isNaN(diff) || diff < 0) return 1;
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
}

function mapBackendTraining(row: BackendTraining): TrainingRecord {
  const employeeName =
    row.employee_name ||
    row.employee_fullname ||
    row.full_name ||
    [row.first_name, row.last_name].filter(Boolean).join(" ").trim() ||
    `Employee #${row.emp_id ?? row.employee_id ?? ""}`;

  const startDate = formatDateOnly(row.start_date);
  const endDate = formatDateOnly(row.end_date);

  return {
    id: String(row.id),
    emp_id: String(row.emp_id ?? row.employee_id ?? ""),
    employee_name: employeeName,
    training_name: row.training_name || row.name || "—",
    training_type: normalizeTrainingType(row.training_type ?? row.type),
    provider: row.provider || "—",
    start_date: startDate,
    end_date: endDate,
    duration_days:
      Number(row.duration_days) ||
      calculateDurationBetween(startDate, endDate) ||
      1,
    cost: Number(row.cost ?? 0) || 0,
    certification_ref: row.certification_ref || row.certification || undefined,
    skills_gained: row.skills_gained || row.skills || undefined,
    status: normalizeStatus(row.status),
    notes: row.notes || undefined,
  };
}

/* ────────────────────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────────────────── */
export default function TrainingDevelopment() {
  usePageTitle("training-development", "Training & Capacity Building");

  const [trainings, setTrainings] = useState<TrainingRecord[]>([]);
  const [trainingsLoading, setTrainingsLoading] = useState(true);
  const [trainingsError, setTrainingsError] = useState<string | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);

  /* ── Edit state ───────────────────────────────────────────── */
  const [editingTraining, setEditingTraining] = useState<TrainingRecord | null>(
    null,
  );
  const [editForm, setEditForm] = useState({
    emp_id: "",
    training_name: "",
    training_type: "Workshop" as TrainingRecord["training_type"],
    provider: "",
    start_date: "",
    end_date: "",
    duration_days: 1,
    cost: 0,
    certification_ref: "",
    skills_gained: "",
    status: "Planned" as TrainingRecord["status"],
    notes: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  /* ── Delete state ─────────────────────────────────────────── */
  const [deletingTraining, setDeletingTraining] =
    useState<TrainingRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ── View state ───────────────────────────────────────────── */
  const [viewingTraining, setViewingTraining] =
    useState<TrainingRecord | null>(null);

  /* ── Add form ─────────────────────────────────────────────── */
  const [form, setForm] = useState({
    emp_id: "",
    training_name: "",
    training_type: "Workshop" as TrainingRecord["training_type"],
    provider: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    duration_days: 1,
    cost: 0,
    certification_ref: "",
    skills_gained: "",
    status: "Planned" as TrainingRecord["status"],
    notes: "",
  });

  /* ──────────────────────────────────────────────────────────
   * Load employees
   * ────────────────────────────────────────────────────────── */
  useEffect(() => {
    apiGet<{ success: boolean; data: any[] }>("/api/employees")
      .then((res) => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const fetched = res.data.map((emp) => ({
            name:
              emp.fullname ||
              `${emp.first_name || ""} ${emp.last_name || ""}`.trim() ||
              "Employee",
            department: emp.department_name || "Farm Operations",
            id: emp.id,
          }));
          setEmployeeOptions(fetched);
        }
      })
      .catch(() => {});
  }, []);

  /* ──────────────────────────────────────────────────────────
   * Load trainings
   * ────────────────────────────────────────────────────────── */
  const loadTrainings = async () => {
    setTrainingsLoading(true);
    setTrainingsError(null);
    try {
      const res = await apiGet<{
        success: boolean;
        data: BackendTraining[];
      }>("/api/trainings");
      const list = Array.isArray(res?.data) ? res.data : [];
      setTrainings(list.map(mapBackendTraining));
    } catch (err: unknown) {
      setTrainingsError(
        err instanceof Error ? err.message : "Failed to load training records",
      );
    } finally {
      setTrainingsLoading(false);
    }
  };

  useEffect(() => {
    loadTrainings();
  }, []);

  /* ──────────────────────────────────────────────────────────
   * Create
   * ────────────────────────────────────────────────────────── */
  const handleAddTrainingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.emp_id.trim()) {
      toast.error("Please select an employee.");
      return;
    }
    if (!form.training_name.trim()) {
      toast.error("Please enter training name.");
      return;
    }

    const duration = calculateDurationBetween(form.start_date, form.end_date);

    const payload = {
      emp_id: form.emp_id,
      training_name: form.training_name.trim(),
      training_type: form.training_type,
      provider: form.provider.trim() || "Internal Institute",
      start_date: form.start_date,
      end_date: form.end_date,
      duration_days: duration,
      cost: Number(form.cost) || 0,
      certification_ref: form.certification_ref.trim(),
      skills_gained: form.skills_gained.trim(),
      status: form.status,
      notes: form.notes.trim(),
    };

    try {
      const response = await apiPost<{
        success?: boolean;
        message?: string;
      }>("/api/trainings", payload);

      if (response && response.success === false) {
        throw new Error(response.message || "Failed to log training");
      }

      toast.success("Training record created successfully!");
      setIsAddOpen(false);
      setForm({
        emp_id: "",
        training_name: "",
        training_type: "Workshop",
        provider: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
        duration_days: 1,
        cost: 0,
        certification_ref: "",
        skills_gained: "",
        status: "Planned",
        notes: "",
      });
      await loadTrainings();
    } catch (error: any) {
      console.error("Failed to log training:", error);
      toast.error(error?.message || "Failed. Please try again.");
    }
  };

  /* ──────────────────────────────────────────────────────────
   * Edit
   * ────────────────────────────────────────────────────────── */
  const openEditTraining = (trn: TrainingRecord) => {
    setEditingTraining(trn);
    setEditForm({
      emp_id: trn.emp_id,
      training_name: trn.training_name,
      training_type: trn.training_type,
      provider: trn.provider,
      start_date: trn.start_date,
      end_date: trn.end_date,
      duration_days: trn.duration_days,
      cost: trn.cost,
      certification_ref: trn.certification_ref || "",
      skills_gained: trn.skills_gained || "",
      status: trn.status,
      notes: trn.notes || "",
    });
  };

  const closeEditModal = () => {
    if (savingEdit) return;
    setEditingTraining(null);
  };

  const handleEditTrainingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTraining) return;

    if (!editForm.emp_id.trim()) {
      toast.error("Please select an employee.");
      return;
    }
    if (!editForm.training_name.trim()) {
      toast.error("Please enter training name.");
      return;
    }

    const duration = calculateDurationBetween(
      editForm.start_date,
      editForm.end_date,
    );

    const payload = {
      emp_id: editForm.emp_id,
      training_name: editForm.training_name.trim(),
      training_type: editForm.training_type,
      provider: editForm.provider.trim() || "Internal Institute",
      start_date: editForm.start_date,
      end_date: editForm.end_date,
      duration_days: duration,
      cost: Number(editForm.cost) || 0,
      certification_ref: editForm.certification_ref.trim(),
      skills_gained: editForm.skills_gained.trim(),
      status: editForm.status,
      notes: editForm.notes.trim(),
    };

    setSavingEdit(true);
    try {
      const response = await apiPut<{
        success?: boolean;
        message?: string;
      }>(`/api/trainings/${editingTraining.id}`, payload);

      if (response && response.success === false) {
        throw new Error(response.message || "Failed to update training");
      }

      toast.success("Training record updated successfully!");
      setEditingTraining(null);
      await loadTrainings();
    } catch (error: any) {
      console.error("Failed to update training:", error);
      toast.error(error?.message || "Failed to update. Please try again.");
    } finally {
      setSavingEdit(false);
    }
  };

  /* ──────────────────────────────────────────────────────────
   * Delete
   * ────────────────────────────────────────────────────────── */
  const openDeleteModal = (trn: TrainingRecord) => {
    setDeletingTraining(trn);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeletingTraining(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTraining) return;

    setDeleting(true);
    try {
      const response = await apiDelete<{
        success?: boolean;
        message?: string;
      }>(`/api/trainings/${deletingTraining.id}`);

      if (response && response.success === false) {
        throw new Error(response.message || "Failed to delete training");
      }

      toast.success("Training record removed.");
      setDeletingTraining(null);
      await loadTrainings();
    } catch (error: any) {
      console.error("Failed to delete training:", error);
      toast.error(error?.message || "Failed to delete. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  /* ──────────────────────────────────────────────────────────
   * Derived
   * ────────────────────────────────────────────────────────── */
  const totalCost = trainings.reduce((sum, t) => sum + (t.cost || 0), 0);
  const completedCount = trainings.filter(
    (t) => t.status === "Completed",
  ).length;
  const ongoingCount = trainings.filter((t) => t.status === "Ongoing").length;

  /* ──────────────────────────────────────────────────────────
   * Render
   * ────────────────────────────────────────────────────────── */
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Training & Capacity Building
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track employee workshops, certifications, skills gained, and
            training expenditure.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#00B4D8] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0096C7] shadow-xs transition"
        >
          <Plus size={16} /> Add Training Record
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Investment"
          value={`RWF ${totalCost.toLocaleString()}`}
          subtext="Skill enhancement budget"
          icon={<Award size={22} className="text-[#076935]" />}
          iconBg="bg-[#076935]/10"
          badgeText="Training Cost"
          badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
        />
        <MetricCard
          label="Completed Programs"
          value={`${completedCount}`}
          subtext="Certified employees"
          icon={<CheckCircle size={22} className="text-blue-600" />}
          iconBg="bg-blue-50"
          badgeText="Completed"
          badgeColor="bg-blue-50 text-blue-700 border-blue-200"
        />
        <MetricCard
          label="Active & Ongoing"
          value={`${ongoingCount}`}
          subtext="Current workshops in progress"
          icon={<BookOpen size={22} className="text-amber-600" />}
          iconBg="bg-amber-50"
          badgeText="Ongoing"
          badgeColor="bg-amber-50 text-amber-700 border-amber-200"
        />
        <MetricCard
          label="Total Records"
          value={`${trainings.length}`}
          subtext="Logged training modules"
          icon={<Calendar size={22} className="text-purple-600" />}
          iconBg="bg-purple-50"
          badgeText="Records"
          badgeColor="bg-purple-50 text-purple-700 border-purple-200"
        />
      </div>

      {/* Error banner */}
      {trainingsError && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Could not load training records</p>
            <p>{trainingsError}</p>
          </div>
          <button
            onClick={loadTrainings}
            className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 font-bold text-rose-700 hover:bg-rose-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Training Name</th>
                <th className="px-4 py-3.5">Type & Provider</th>
                <th className="px-4 py-3.5">Duration</th>
                <th className="px-4 py-3.5">Cost</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trainingsLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    Loading training records…
                  </td>
                </tr>
              ) : trainings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No training records found.
                  </td>
                </tr>
              ) : (
                trainings.map((trn) => (
                  <tr key={trn.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-4 py-3.5 font-bold text-gray-900 text-sm">
                      {trn.employee_name}
                    </td>
                    <td className="px-4 py-3.5 text-gray-800 font-semibold">
                      {trn.training_name}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">
                      <span className="font-bold text-gray-700">
                        {trn.training_type}
                      </span>{" "}
                      · {trn.provider}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 font-medium">
                      {trn.duration_days} Day(s) ({trn.start_date})
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#076935]">
                      {trn.cost === 0
                        ? "RWF 0"
                        : `RWF ${trn.cost.toLocaleString()}`}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold text-white ${
                          trn.status === "Completed"
                            ? "bg-[#076935]"
                            : trn.status === "Ongoing"
                              ? "bg-[#00B4D8]"
                              : trn.status === "Planned"
                                ? "bg-amber-500"
                                : "bg-rose-500"
                        }`}
                      >
                        {trn.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingTraining(trn)}
                          className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 transition"
                          title="View Record"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => openEditTraining(trn)}
                          className="rounded-lg border border-blue-200 p-1.5 text-blue-600 hover:bg-blue-50 transition"
                          title="Edit Record"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(trn)}
                          className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Record"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!trainingsLoading && trainings.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
            Showing {trainings.length} training record
            {trainings.length === 1 ? "" : "s"}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────
       * Add Modal
       * ───────────────────────────────────────────── */}
      <Modal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        size="xl"
        title="Add Training Record"
      >
        <form onSubmit={handleAddTrainingSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.emp_id}
                onChange={(e) => setForm({ ...form, emp_id: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              >
                <option value="">Select...</option>
                {employeeOptions.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Training Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter training name..."
                value={form.training_name}
                onChange={(e) =>
                  setForm({ ...form, training_name: e.target.value })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Training Type
              </label>
              <select
                value={form.training_type}
                onChange={(e) =>
                  setForm({ ...form, training_type: e.target.value as any })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              >
                <option value="Workshop">Workshop</option>
                <option value="Online Course">Online Course</option>
                <option value="Certification">Certification</option>
                <option value="Internal Training">Internal Training</option>
                <option value="Seminar">Seminar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Provider
              </label>
              <input
                type="text"
                placeholder="e.g. RAB / NAEB / RMI"
                value={form.provider}
                onChange={(e) =>
                  setForm({ ...form, provider: e.target.value })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => {
                  const nextStart = e.target.value;
                  const nextDur = calculateDurationBetween(
                    nextStart,
                    form.end_date,
                  );
                  setForm({
                    ...form,
                    start_date: nextStart,
                    duration_days: nextDur,
                  });
                }}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => {
                  const nextEnd = e.target.value;
                  const nextDur = calculateDurationBetween(
                    form.start_date,
                    nextEnd,
                  );
                  setForm({
                    ...form,
                    end_date: nextEnd,
                    duration_days: nextDur,
                  });
                }}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Duration (days)
              </label>
              <input
                type="text"
                readOnly
                value={`${calculateDurationBetween(form.start_date, form.end_date)} Day(s)`}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm font-bold text-[#076935] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Cost (RWF)
              </label>
              <input
                type="number"
                min="0"
                value={form.cost}
                onChange={(e) =>
                  setForm({ ...form, cost: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Certification Ref
              </label>
              <input
                type="text"
                placeholder="e.g. CERT-2026-091"
                value={form.certification_ref}
                onChange={(e) =>
                  setForm({ ...form, certification_ref: e.target.value })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Skills Gained
            </label>
            <textarea
              rows={3}
              value={form.skills_gained}
              onChange={(e) =>
                setForm({ ...form, skills_gained: e.target.value })
              }
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              placeholder="List specific skills or competencies acquired during training..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as any })
              }
              className="w-full sm:w-1/2 rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
            >
              <option value="Planned">Planned</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              placeholder="Additional comments..."
            />
          </div>

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
              className="rounded-xl bg-[#00B4D8] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0096C7] shadow-sm"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>

      {/* ─────────────────────────────────────────────
       * Edit Modal
       * ───────────────────────────────────────────── */}
      <Modal
        open={Boolean(editingTraining)}
        onClose={closeEditModal}
        size="xl"
        title={`Edit Training Record${editingTraining ? ` · #${editingTraining.id}` : ""}`}
      >
        {editingTraining && (
          <form
            onSubmit={handleEditTrainingSubmit}
            className="space-y-4 text-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Employee <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={editForm.emp_id}
                  onChange={(e) =>
                    setEditForm({ ...editForm, emp_id: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#2563EB]"
                >
                  <option value="">Select...</option>
                  {employeeOptions.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Training Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.training_name}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      training_name: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Training Type
                </label>
                <select
                  value={editForm.training_type}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      training_type: e.target.value as any,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#2563EB]"
                >
                  <option value="Workshop">Workshop</option>
                  <option value="Online Course">Online Course</option>
                  <option value="Certification">Certification</option>
                  <option value="Internal Training">Internal Training</option>
                  <option value="Seminar">Seminar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Provider
                </label>
                <input
                  type="text"
                  value={editForm.provider}
                  onChange={(e) =>
                    setEditForm({ ...editForm, provider: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={editForm.start_date}
                  onChange={(e) => {
                    const nextStart = e.target.value;
                    const nextDur = calculateDurationBetween(
                      nextStart,
                      editForm.end_date,
                    );
                    setEditForm({
                      ...editForm,
                      start_date: nextStart,
                      duration_days: nextDur,
                    });
                  }}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={editForm.end_date}
                  onChange={(e) => {
                    const nextEnd = e.target.value;
                    const nextDur = calculateDurationBetween(
                      editForm.start_date,
                      nextEnd,
                    );
                    setEditForm({
                      ...editForm,
                      end_date: nextEnd,
                      duration_days: nextDur,
                    });
                  }}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Duration (days)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${calculateDurationBetween(
                    editForm.start_date,
                    editForm.end_date,
                  )} Day(s)`}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm font-bold text-[#2563EB] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Cost (RWF)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editForm.cost}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      cost: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Certification Ref
                </label>
                <input
                  type="text"
                  value={editForm.certification_ref}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      certification_ref: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Skills Gained
              </label>
              <textarea
                rows={3}
                value={editForm.skills_gained}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    skills_gained: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Status
              </label>
              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    status: e.target.value as any,
                  })
                }
                className="w-full sm:w-1/2 rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#2563EB]"
              >
                <option value="Planned">Planned</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Notes
              </label>
              <textarea
                rows={3}
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm({ ...editForm, notes: e.target.value })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={closeEditModal}
                disabled={savingEdit}
                className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 shadow-sm transition disabled:opacity-60"
              >
                {savingEdit ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>Save Changes</>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ─────────────────────────────────────────────
       * Delete Modal
       * ───────────────────────────────────────────── */}
      <Modal
        open={Boolean(deletingTraining)}
        onClose={closeDeleteModal}
        size="sm"
        showCloseIcon={!deleting}
        title={
          <div className="flex items-center justify-center gap-2.5 text-gray-900 font-bold text-lg">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Trash2 size={18} />
            </div>
            <span>Delete Training Record</span>
          </div>
        }
      >
        {deletingTraining && (
          <div className="space-y-4 pt-1 text-sm">
            <p className="text-gray-600 leading-relaxed text-center">
              Are you sure you want to delete the training record for{" "}
              <strong className="text-gray-900">
                {deletingTraining.employee_name}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1.5">
              <p>
                <strong className="text-gray-700">Training:</strong>{" "}
                {deletingTraining.training_name}
              </p>
              <p>
                <strong className="text-gray-700">Type:</strong>{" "}
                {deletingTraining.training_type}
              </p>
              <p>
                <strong className="text-gray-700">Status:</strong>{" "}
                {deletingTraining.status}
              </p>
              <p>
                <strong className="text-gray-700">Duration:</strong>{" "}
                {deletingTraining.duration_days} Day(s)
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
              >
                <X size={15} /> Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700 shadow-xs transition disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 size={15} /> Delete Record
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─────────────────────────────────────────────
       * View Modal
       * ───────────────────────────────────────────── */}
      <Modal
        open={Boolean(viewingTraining)}
        onClose={() => setViewingTraining(null)}
        size="md"
        title={
          <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg">
            <div className="p-2 rounded-xl bg-[#00B4D8]/10 text-[#00B4D8]">
              <Award size={20} />
            </div>
            <span>Training Record Details</span>
          </div>
        }
      >
        {viewingTraining && (
          <div className="space-y-4 text-sm pt-1">
            <div className="p-4 bg-gradient-to-r from-cyan-50 to-emerald-50/40 rounded-2xl border border-cyan-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">
                  Record ID · {viewingTraining.id}
                </p>
                <h3 className="font-bold text-gray-900 text-base mt-0.5">
                  {viewingTraining.training_name}
                </h3>
                <p className="text-xs text-gray-700 mt-0.5">
                  <strong>{viewingTraining.employee_name}</strong>
                </p>
              </div>
              <span
                className={`inline-flex rounded-md px-3 py-1 text-[10px] font-bold text-white ${
                  viewingTraining.status === "Completed"
                    ? "bg-[#076935]"
                    : viewingTraining.status === "Ongoing"
                      ? "bg-[#00B4D8]"
                      : viewingTraining.status === "Planned"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                }`}
              >
                {viewingTraining.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Training Type
                </span>
                <p className="font-bold text-gray-800 text-xs mt-1">
                  {viewingTraining.training_type}
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Provider
                </span>
                <p className="font-bold text-gray-800 text-xs mt-1">
                  {viewingTraining.provider}
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Duration
                </span>
                <p className="font-bold text-gray-800 text-xs mt-1">
                  {viewingTraining.duration_days} Day(s) ·{" "}
                  {viewingTraining.start_date} → {viewingTraining.end_date}
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Cost
                </span>
                <p className="font-bold text-[#076935] text-xs mt-1">
                  RWF {viewingTraining.cost.toLocaleString()}
                </p>
              </div>
              {viewingTraining.certification_ref && (
                <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 sm:col-span-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Certification Ref
                  </span>
                  <p className="font-mono font-bold text-gray-800 text-xs mt-1">
                    {viewingTraining.certification_ref}
                  </p>
                </div>
              )}
            </div>

            {viewingTraining.skills_gained && (
              <div className="p-4 rounded-2xl border border-cyan-200 bg-cyan-50/40 space-y-1">
                <span className="text-xs font-bold text-cyan-700 block mb-1">
                  Skills Gained:
                </span>
                <p className="text-xs text-gray-700 leading-relaxed bg-white p-3 rounded-xl border border-cyan-100">
                  {viewingTraining.skills_gained}
                </p>
              </div>
            )}

            {viewingTraining.notes && (
              <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-1">
                <span className="text-xs font-bold text-gray-500 block mb-1">
                  Notes:
                </span>
                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {viewingTraining.notes}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => setViewingTraining(null)}
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