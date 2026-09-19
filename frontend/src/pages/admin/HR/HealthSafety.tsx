import { useEffect, useState } from "react";
import {
  Activity,
  ShieldAlert,
  CheckCircle,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";
import MetricCard from "../../../components/ui/MetricCard";
import { apiGet } from "../../../api/client";

export interface IncidentRecord {
  id: string;
  employee_involved: string;
  incident_date: string;
  incident_type: "Accident" | "Near Miss" | "Property Damage" | "Health Concern" | "Safety Hazard";
  severity: "Minor" | "Moderate" | "Severe" | "Critical";
  description: string;
  location: string;
  reported_by: string;
  action_taken: string;
  status: "Open" | "Under Investigation" | "Closed";
}

const DEFAULT_EMPLOYEES: Array<{ name: string; department: string }> = [
  { name: "Amina Uwase", department: "Quality Assurance" },
  { name: "Eric Niyonzima", department: "Logistics & Fleet" },
  { name: "Patrick Hakizimana", department: "Farm Operations" },
  { name: "Diane Ingabire", department: "HR & Admin" },
  { name: "Jean-Baptiste Musafiri", department: "Farm Operations" },
];

const INITIAL_INCIDENTS: IncidentRecord[] = [
  {
    id: "INC-2026-001",
    employee_involved: "Amina Uwase",
    incident_date: "2026-09-12",
    incident_type: "Accident",
    severity: "Moderate",
    description: "Slipped on wet floor in packhouse wash section during avocado cleaning.",
    location: "Packhouse Wash Bay #2",
    reported_by: "Diane Ingabire",
    action_taken: "First aid administered on-site. Non-slip rubber mats installed in wash bay.",
    status: "Under Investigation",
  },
  {
    id: "INC-2026-002",
    employee_involved: "Eric Niyonzima",
    incident_date: "2026-09-04",
    incident_type: "Near Miss",
    severity: "Minor",
    description: "Reefer crate latch loose during transport loading.",
    location: "Kigali Warehouse Bay A",
    reported_by: "Patrick Hakizimana",
    action_taken: "Latch mechanism lubricated and re-inspected.",
    status: "Closed",
  },
  {
    id: "INC-2026-003",
    employee_involved: "Patrick Hakizimana",
    incident_date: "2026-08-28",
    incident_type: "Safety Hazard",
    severity: "Minor",
    description: "Minor thumb scratch during manual pruning shears operation.",
    location: "Musanze Plot B",
    reported_by: "Amina Uwase",
    action_taken: "Disinfected cut, applied bandage, and issued reinforced leather gloves.",
    status: "Closed",
  },
];

export default function HealthSafety() {
  usePageTitle("health-safety", "Health & Workplace Safety");

  const [incidents, setIncidents] = useState<IncidentRecord[]>(INITIAL_INCIDENTS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState(DEFAULT_EMPLOYEES);

  const [form, setForm] = useState({
    employee_involved: "",
    incident_date: new Date().toISOString().split("T")[0],
    incident_type: "Accident" as IncidentRecord["incident_type"],
    severity: "Minor" as IncidentRecord["severity"],
    description: "",
    location: "",
    reported_by: "Diane Ingabire",
    action_taken: "",
    status: "Open" as IncidentRecord["status"],
  });

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

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_involved.trim()) {
      toast.error("Please select the employee involved.");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Please describe the incident.");
      return;
    }

    const newInc: IncidentRecord = {
      id: `INC-2026-0${incidents.length + 1}`,
      employee_involved: form.employee_involved.trim(),
      incident_date: form.incident_date,
      incident_type: form.incident_type,
      severity: form.severity,
      description: form.description.trim(),
      location: form.location.trim() || "Farm Plot",
      reported_by: form.reported_by,
      action_taken: form.action_taken.trim() || "Under review",
      status: form.status,
    };

    setIncidents([newInc, ...incidents]);
    setIsAddOpen(false);
    setForm({
      employee_involved: "",
      incident_date: new Date().toISOString().split("T")[0],
      incident_type: "Accident",
      severity: "Minor",
      description: "",
      location: "",
      reported_by: "Diane Ingabire",
      action_taken: "",
      status: "Open",
    });
    toast.success("Health & Safety incident report logged.");
  };

  const handleDeleteIncident = (id: string) => {
    setIncidents((prev) => prev.filter((i) => i.id !== id));
    toast.success("Incident record deleted.");
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
            Health & Workplace Safety
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track workplace incidents, PPE compliance, hazard reports, and corrective actions.
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

      {/* Incident Log Table matching user screenshot */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
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
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  No workplace safety incidents recorded.
                </td>
              </tr>
            ) : (
              incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-gray-50/80 transition">
                  <td className="px-4 py-3.5 font-bold text-gray-900 text-sm">{inc.employee_involved}</td>
                  <td className="px-4 py-3.5 text-gray-600 font-medium">{inc.incident_date}</td>
                  <td className="px-4 py-3.5 text-gray-700">
                    <span className="font-bold text-gray-900">{inc.incident_type}</span>
                    {inc.location && <p className="text-[11px] text-gray-500">{inc.location}</p>}
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
                        onClick={() => toast.info(`Editing incident #${inc.id}`)}
                        className="rounded-lg border border-blue-200 p-1.5 text-blue-600 hover:bg-blue-50 transition"
                        title="Edit Incident"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteIncident(inc.id)}
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

      {/* Report Incident Modal matching 1:1 user screenshot */}
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
          {/* Row 1: Employee Involved * & Incident Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Employee Involved <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.employee_involved}
                onChange={(e) => setForm({ ...form, employee_involved: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
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
              <label className="block text-sm font-bold text-gray-800 mb-1">Incident Date</label>
              <input
                type="date"
                value={form.incident_date}
                onChange={(e) => setForm({ ...form, incident_date: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
              />
            </div>
          </div>

          {/* Row 2: Incident Type & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Incident Type</label>
              <select
                value={form.incident_type}
                onChange={(e) => setForm({ ...form, incident_type: e.target.value as any })}
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
              <label className="block text-sm font-bold text-gray-800 mb-1">Severity</label>
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value as any })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
              >
                <option value="Minor">Minor</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Row 3: Description * */}
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

          {/* Row 4: Location & Reported By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
                placeholder="e.g. Packhouse Section B"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Reported By</label>
              <select
                value={form.reported_by}
                onChange={(e) => setForm({ ...form, reported_by: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
              >
                <option value="">Select...</option>
                <option value="Diane Ingabire">Diane Ingabire</option>
                <option value="Amina Uwase">Amina Uwase</option>
                <option value="Esther Uwase">Esther Uwase</option>
              </select>
            </div>
          </div>

          {/* Row 5: Action Taken */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Action Taken</label>
            <textarea
              rows={3}
              value={form.action_taken}
              onChange={(e) => setForm({ ...form, action_taken: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
              placeholder="First aid administered or corrective safety measures..."
            />
          </div>

          {/* Row 6: Status */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
              className="w-full sm:w-1/2 rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
            >
              <option value="Open">Open</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Closed">Closed</option>
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
              className="rounded-xl bg-[#DC2626] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#B91C1C] shadow-sm"
            >
              Save Incident
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
