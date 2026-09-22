import { useEffect, useState } from "react";
import {
  Activity,
  ShieldAlert,
  CheckCircle,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Eye,
  X,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";
import MetricCard from "../../../components/ui/MetricCard";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../api/client";

/* ────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────── */
export interface IncidentRecord {
  id: string;
  emp_id: string;
  employee_name: string;
  incident_date: string;
  incident_type:
    | "Accident"
    | "Near Miss"
    | "Property Damage"
    | "Health Concern"
    | "Safety Hazard";
  severity: "Minor" | "Moderate" | "Severe" | "Critical";
  description: string;
  location: string;
  reported_by: string;
  reported_by_name: string;
  action_taken: string;
  status: "Open" | "Under Investigation" | "Closed";
}

export interface BackendIncidentRecord {
  id: string | number;
  emp_id: string | number;
  employee_name?: string;
  employee_fullname?: string;
  full_name?: string;
  reported_by_name?: string;
  reported_by?: string | number;
  incident_date?: string;
  incident_type?: string;
  severity?: string;
  description?: string;
  location?: string;
  action_taken?: string;
  status?: string;
}

type EmployeeOption = { id?: string | number; name: string; department: string };

/* ────────────────────────────────────────────────────────────
 * Normalizers
 * ──────────────────────────────────────────────────────────── */
function normalizeType(raw?: string): IncidentRecord["incident_type"] {
  const v = (raw || "").toLowerCase().trim();
  if (v === "near miss" || v === "near_miss" || v === "nearmiss") return "Near Miss";
  if (v === "property damage" || v === "property_damage") return "Property Damage";
  if (v === "health concern" || v === "health_concern") return "Health Concern";
  if (v === "safety hazard" || v === "safety_hazard") return "Safety Hazard";
  return "Accident";
}

function normalizeSeverity(raw?: string): IncidentRecord["severity"] {
  const v = (raw || "").toLowerCase().trim();
  if (v === "moderate") return "Moderate";
  if (v === "severe") return "Severe";
  if (v === "critical") return "Critical";
  return "Minor";
}

function normalizeStatus(raw?: string): IncidentRecord["status"] {
  const v = (raw || "").toLowerCase().trim();
  if (v === "under investigation" || v === "under_investigation" || v === "investigating")
    return "Under Investigation";
  if (v === "closed") return "Closed";
  return "Open";
}

function formatDateOnly(value?: string | null): string {
  if (!value) return "";
  return value.split(" ")[0];
}

function mapBackendIncident(row: BackendIncidentRecord): IncidentRecord {
  const employeeName =
    row.employee_name ||
    row.employee_fullname ||
    row.full_name ||
    `Employee #${row.emp_id}`;

  return {
    id: String(row.id),
    emp_id: String(row.emp_id),
    employee_name: employeeName,
    incident_date: formatDateOnly(row.incident_date),
    incident_type: normalizeType(row.incident_type),
    severity: normalizeSeverity(row.severity),
    description: row.description || "",
    location: row.location || "",
    reported_by: String(row.reported_by ?? ""),
    reported_by_name: row.reported_by_name || "",
    action_taken: row.action_taken || "",
    status: normalizeStatus(row.status),
  };
}

/* ────────────────────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────────────────── */
export default function HealthSafety() {
  usePageTitle("health-safety", "Health & Workplace Safety");

  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [incidentsLoading, setIncidentsLoading] = useState(true);
  const [incidentsError, setIncidentsError] = useState<string | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);

  /* ── Edit state ───────────────────────────────────────────── */
  const [editingIncident, setEditingIncident] = useState<IncidentRecord | null>(null);
  const [editForm, setEditForm] = useState({
    emp_id: "",
    incident_date: "",
    incident_type: "Accident" as IncidentRecord["incident_type"],
    severity: "Minor" as IncidentRecord["severity"],
    description: "",
    location: "",
    reported_by: "",
    action_taken: "",
    status: "Open" as IncidentRecord["status"],
  });
  const [savingEdit, setSavingEdit] = useState(false);

  /* ── Delete state ─────────────────────────────────────────── */
  const [deletingIncident, setDeletingIncident] = useState<IncidentRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ── View state ───────────────────────────────────────────── */
  const [viewingIncident, setViewingIncident] = useState<IncidentRecord | null>(null);

  /* ── Add form ─────────────────────────────────────────────── */
  const [form, setForm] = useState({
    emp_id: "",
    incident_date: new Date().toISOString().split("T")[0],
    incident_type: "Accident" as IncidentRecord["incident_type"],
    severity: "Minor" as IncidentRecord["severity"],
    description: "",
    location: "",
    reported_by: "",
    action_taken: "",
    status: "Open" as IncidentRecord["status"],
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
   * Load incidents
   * ────────────────────────────────────────────────────────── */
  const loadIncidents = async () => {
    setIncidentsLoading(true);
    setIncidentsError(null);
    try {
      const res = await apiGet<{ success: boolean; data: BackendIncidentRecord[] }>(
        "/api/incidents",
      );
      const list = Array.isArray(res?.data) ? res.data : [];
      setIncidents(list.map(mapBackendIncident));
    } catch (err: unknown) {
      setIncidentsError(
        err instanceof Error ? err.message : "Failed to load incidents",
      );
    } finally {
      setIncidentsLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  /* ──────────────────────────────────────────────────────────
   * Create new incident
   * ────────────────────────────────────────────────────────── */
  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.emp_id.trim()) {
      toast.error("Please select the employee involved.");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Please describe the incident.");
      return;
    }

    const payload = {
      emp_id: form.emp_id.trim(),
      incident_date: form.incident_date,
      incident_type: form.incident_type,
      severity: form.severity,
      description: form.description.trim(),
      location: form.location.trim() || "Farm Plot",
      reported_by: form.reported_by,
      action_taken: form.action_taken.trim() || "Under review",
      status: form.status,
    };

    try {
      const response = await apiPost<{ success?: boolean; message?: string }>(
        "/api/incidents",
        payload,
      );

      if (response && response.success === false) {
        throw new Error(response.message || "Failed to report incident");
      }

      toast.success("Health & Safety incident report logged.");
      setIsAddOpen(false);
      setForm({
        emp_id: "",
        incident_date: new Date().toISOString().split("T")[0],
        incident_type: "Accident",
        severity: "Minor",
        description: "",
        location: "",
        reported_by: "",
        action_taken: "",
        status: "Open",
      });
      await loadIncidents();
    } catch (error: any) {
      console.error("Failed to report incident:", error);
      toast.error(
        error?.message || "Failed to report incident. Please try again.",
      );
    }
  };

  /* ──────────────────────────────────────────────────────────
   * Edit incident
   * ────────────────────────────────────────────────────────── */
  const openEditIncident = (inc: IncidentRecord) => {
    setEditingIncident(inc);
    setEditForm({
      emp_id: String(inc.emp_id),
      incident_date: inc.incident_date,
      incident_type: inc.incident_type,
      severity: inc.severity,
      description: inc.description,
      location: inc.location,
      reported_by: String(inc.reported_by),
      action_taken: inc.action_taken,
      status: inc.status,
    });
  };

  const closeEditModal = () => {
    if (savingEdit) return;
    setEditingIncident(null);
  };

  const handleEditIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncident) return;

    if (!editForm.emp_id.trim()) {
      toast.error("Please select the employee involved.");
      return;
    }
    if (!editForm.description.trim()) {
      toast.error("Please describe the incident.");
      return;
    }

    const payload = {
      emp_id: editForm.emp_id.trim(),
      incident_date: editForm.incident_date,
      incident_type: editForm.incident_type,
      severity: editForm.severity,
      description: editForm.description.trim(),
      location: editForm.location.trim() || "Farm Plot",
      reported_by: editForm.reported_by,
      action_taken: editForm.action_taken.trim() || "Under review",
      status: editForm.status,
    };

    setSavingEdit(true);
    try {
      const response = await apiPut<{ success?: boolean; message?: string }>(
        `/api/incidents/${editingIncident.id}`,
        payload,
      );

      if (response && response.success === false) {
        throw new Error(response.message || "Failed to update incident");
      }

      toast.success("Incident report updated successfully.");
      setEditingIncident(null);
      await loadIncidents();
    } catch (error: any) {
      console.error("Failed to update incident:", error);
      toast.error(
        error?.message || "Failed to update incident. Please try again.",
      );
    } finally {
      setSavingEdit(false);
    }
  };

  /* ──────────────────────────────────────────────────────────
   * Delete incident
   * ────────────────────────────────────────────────────────── */
  const openDeleteModal = (inc: IncidentRecord) => {
    setDeletingIncident(inc);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeletingIncident(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingIncident) return;

    setDeleting(true);
    try {
      const response = await apiDelete<{ success?: boolean; message?: string }>(
        `/api/incidents/${deletingIncident.id}`,
      );

      if (response && response.success === false) {
        throw new Error(response.message || "Failed to delete incident");
      }

      toast.success("Incident record deleted.");
      setDeletingIncident(null);
      await loadIncidents();
    } catch (error: any) {
      console.error("Failed to delete incident:", error);
      toast.error(
        error?.message || "Failed to delete incident. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

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
            Health & Workplace Safety
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track workplace incidents, PPE compliance, hazard reports, and
            corrective actions.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#DC2626] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#B91C1C] shadow-xs transition"
        >
          <Plus size={16} /> Report Incident
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Logged Incidents"
          value={`${incidents.length}`}
          subtext="Recorded safety cases"
          icon={<ShieldAlert size={22} className="text-[#DC2626]" />}
          iconBg="bg-rose-50"
          badgeText="Incident Log"
          badgeColor="bg-rose-50 text-rose-700 border-rose-200"
        />
        <MetricCard
          label="Closed & Resolved"
          value={`${incidents.filter((i) => i.status === "Closed").length}`}
          subtext="Corrective actions completed"
          icon={<CheckCircle size={22} className="text-[#076935]" />}
          iconBg="bg-emerald-50"
          badgeText="Resolved"
          badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
        />
        <MetricCard
          label="Under Investigation"
          value={`${incidents.filter((i) => i.status === "Under Investigation").length}`}
          subtext="Active safety reviews"
          icon={<Activity size={22} className="text-amber-600" />}
          iconBg="bg-amber-50"
          badgeText="Investigating"
          badgeColor="bg-amber-50 text-amber-700 border-amber-200"
        />
        <MetricCard
          label="Open Incidents"
          value={`${incidents.filter((i) => i.status === "Open").length}`}
          subtext="Pending immediate review"
          icon={<AlertTriangle size={22} className="text-purple-600" />}
          iconBg="bg-purple-50"
          badgeText="Open Cases"
          badgeColor="bg-purple-50 text-purple-700 border-purple-200"
        />
      </div>

      {/* Error banner */}
      {incidentsError && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Could not load incidents</p>
            <p>{incidentsError}</p>
          </div>
          <button
            onClick={loadIncidents}
            className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 font-bold text-rose-700 hover:bg-rose-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Incident Log Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Incident Date</th>
                <th className="px-4 py-3.5">Type & Location</th>
                <th className="px-4 py-3.5">Severity</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {incidentsLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    Loading incidents…
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    No workplace safety incidents recorded.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-4 py-3.5 font-bold text-gray-900 text-sm">
                      {inc.employee_name}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 font-medium">
                      {inc.incident_date}
                    </td>
                    <td className="px-4 py-3.5 text-gray-700">
                      <span className="font-bold text-gray-900">
                        {inc.incident_type}
                      </span>
                      {inc.location && (
                        <p className="text-[11px] text-gray-500">{inc.location}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-md px-3 py-1 text-xs font-bold text-white ${
                          inc.severity === "Moderate"
                            ? "bg-amber-500"
                            : inc.severity === "Minor"
                              ? "bg-[#00B4D8]"
                              : "bg-[#DC2626]"
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-md px-3 py-1 text-xs font-bold text-white ${
                          inc.status === "Closed"
                            ? "bg-[#076935]"
                            : inc.status === "Under Investigation"
                              ? "bg-[#D97706]"
                              : "bg-[#DC2626]"
                        }`}
                      >
                        {inc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingIncident(inc)}
                          className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 transition"
                          title="View Incident"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => openEditIncident(inc)}
                          className="rounded-lg border border-blue-200 p-1.5 text-blue-600 hover:bg-blue-50 transition"
                          title="Edit Incident"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(inc)}
                          className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Incident"
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

        {!incidentsLoading && incidents.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
            Showing {incidents.length} incident{incidents.length === 1 ? "" : "s"}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────
       * Report Incident Modal
       * ───────────────────────────────────────────── */}
      <Modal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        size="lg"
        title={
          <div className="text-white font-bold text-lg bg-[#DC2626] -m-5 p-4 rounded-t-xl flex items-center gap-2">
            <Activity size={20} /> Report Incident
          </div>
        }
      >
        <form onSubmit={handleReportIncident} className="space-y-4 pt-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Employee Involved <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.emp_id}
                onChange={(e) => setForm({ ...form, emp_id: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
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
                Incident Date
              </label>
              <input
                type="date"
                value={form.incident_date}
                onChange={(e) =>
                  setForm({ ...form, incident_date: e.target.value })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Incident Type
              </label>
              <select
                value={form.incident_type}
                onChange={(e) =>
                  setForm({ ...form, incident_type: e.target.value as any })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
              >
                <option value="Accident">Accident</option>
                <option value="Near Miss">Near Miss</option>
                <option value="Property Damage">Property Damage</option>
                <option value="Health Concern">Health Concern</option>
                <option value="Safety Hazard">Safety Hazard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Severity
              </label>
              <select
                value={form.severity}
                onChange={(e) =>
                  setForm({ ...form, severity: e.target.value as any })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
              >
                <option value="Minor">Minor</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
              placeholder="Detailed description of safety incident..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
                placeholder="e.g. Packhouse Section B"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Reported By
              </label>
              <select
                value={form.reported_by}
                onChange={(e) =>
                  setForm({ ...form, reported_by: e.target.value })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
              >
                <option value="">Select...</option>
                {employeeOptions.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Action Taken
            </label>
            <textarea
              rows={3}
              value={form.action_taken}
              onChange={(e) =>
                setForm({ ...form, action_taken: e.target.value })
              }
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
              placeholder="First aid administered or corrective safety measures..."
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
              className="w-full sm:w-1/2 rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
            >
              <option value="Open">Open</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Closed">Closed</option>
            </select>
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
              className="rounded-xl bg-[#DC2626] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#B91C1C] shadow-sm"
            >
              Save Incident
            </button>
          </div>
        </form>
      </Modal>

      {/* ─────────────────────────────────────────────
       * Edit Incident Modal
       * ───────────────────────────────────────────── */}
      <Modal
        open={Boolean(editingIncident)}
        onClose={closeEditModal}
        size="lg"
        title={
          <div className="text-white font-bold text-lg bg-[#2563EB] -m-5 p-4 rounded-t-xl flex items-center gap-2">
            <Pencil size={20} /> Edit Incident Report
            {editingIncident ? ` · #${editingIncident.id}` : ""}
          </div>
        }
      >
        {editingIncident && (
          <form
            onSubmit={handleEditIncidentSubmit}
            className="space-y-4 pt-4 text-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Employee Involved <span className="text-red-500">*</span>
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
                  Incident Date
                </label>
                <input
                  type="date"
                  value={editForm.incident_date}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      incident_date: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Incident Type
                </label>
                <select
                  value={editForm.incident_type}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      incident_type: e.target.value as any,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#2563EB]"
                >
                  <option value="Accident">Accident</option>
                  <option value="Near Miss">Near Miss</option>
                  <option value="Property Damage">Property Damage</option>
                  <option value="Health Concern">Health Concern</option>
                  <option value="Safety Hazard">Safety Hazard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Severity
                </label>
                <select
                  value={editForm.severity}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      severity: e.target.value as any,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#2563EB]"
                >
                  <option value="Minor">Minor</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Reported By
                </label>
                <select
                  value={editForm.reported_by}
                  onChange={(e) =>
                    setEditForm({ ...editForm, reported_by: e.target.value })
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
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Action Taken
              </label>
              <textarea
                rows={3}
                value={editForm.action_taken}
                onChange={(e) =>
                  setEditForm({ ...editForm, action_taken: e.target.value })
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
                  setEditForm({ ...editForm, status: e.target.value as any })
                }
                className="w-full sm:w-1/2 rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#2563EB]"
              >
                <option value="Open">Open</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Closed">Closed</option>
              </select>
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
       * Delete Incident Modal
       * ───────────────────────────────────────────── */}
      <Modal
        open={Boolean(deletingIncident)}
        onClose={closeDeleteModal}
        size="sm"
        showCloseIcon={!deleting}
        title={
          <div className="flex items-center justify-center gap-2.5 text-gray-900 font-bold text-lg">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Trash2 size={18} />
            </div>
            <span>Delete Incident Report</span>
          </div>
        }
      >
        {deletingIncident && (
          <div className="space-y-4 pt-1 text-sm">
            <p className="text-gray-600 leading-relaxed text-center">
              Are you sure you want to delete the incident report for{" "}
              <strong className="text-gray-900">
                {deletingIncident.employee_name}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1.5">
              <p>
                <strong className="text-gray-700">Incident ID:</strong>{" "}
                <span className="font-mono text-gray-800">
                  {deletingIncident.id}
                </span>
              </p>
              <p>
                <strong className="text-gray-700">Type:</strong>{" "}
                {deletingIncident.incident_type}
              </p>
              <p>
                <strong className="text-gray-700">Severity:</strong>{" "}
                {deletingIncident.severity}
              </p>
              <p>
                <strong className="text-gray-700">Date:</strong>{" "}
                {deletingIncident.incident_date}
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
                    <Trash2 size={15} /> Delete Incident
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─────────────────────────────────────────────
       * View Incident Modal
       * ───────────────────────────────────────────── */}
      <Modal
        open={Boolean(viewingIncident)}
        onClose={() => setViewingIncident(null)}
        size="md"
        title={
          <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert size={20} />
            </div>
            <span>Incident Report Details</span>
          </div>
        }
      >
        {viewingIncident && (
          <div className="space-y-4 text-sm pt-1">
            <div className="p-4 bg-gradient-to-r from-rose-50 to-amber-50/40 rounded-2xl border border-rose-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">
                  Incident ID · {viewingIncident.incident_date}
                </p>
                <h3 className="font-mono font-bold text-gray-900 text-base">
                  {viewingIncident.id}
                </h3>
                <p className="text-xs text-gray-700 mt-0.5">
                  <strong>{viewingIncident.employee_name}</strong>
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`inline-flex rounded-md px-3 py-1 text-xs font-bold text-white ${
                    viewingIncident.severity === "Moderate"
                      ? "bg-amber-500"
                      : viewingIncident.severity === "Minor"
                        ? "bg-[#00B4D8]"
                        : "bg-[#DC2626]"
                  }`}
                >
                  {viewingIncident.severity}
                </span>
                <span
                  className={`inline-flex rounded-md px-3 py-1 text-[10px] font-bold text-white ${
                    viewingIncident.status === "Closed"
                      ? "bg-[#076935]"
                      : viewingIncident.status === "Under Investigation"
                        ? "bg-[#D97706]"
                        : "bg-[#DC2626]"
                  }`}
                >
                  {viewingIncident.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Incident Type
                </span>
                <p className="font-bold text-gray-800 text-xs mt-1">
                  {viewingIncident.incident_type}
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Location
                </span>
                <p className="font-bold text-gray-800 text-xs mt-1">
                  {viewingIncident.location || "—"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-1">
              <span className="text-xs font-bold text-gray-500 block mb-1">
                Description:
              </span>
              <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                {viewingIncident.description || "—"}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-1">
              <span className="text-xs font-bold text-emerald-700 block mb-1">
                Action Taken:
              </span>
              <p className="text-xs text-gray-700 leading-relaxed bg-white p-3 rounded-xl border border-emerald-100">
                {viewingIncident.action_taken || "—"}
              </p>
            </div>

            <div className="flex items-center justify-end border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => setViewingIncident(null)}
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