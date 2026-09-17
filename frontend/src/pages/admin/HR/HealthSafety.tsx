import { useState } from "react";
import {
  Activity,
  ShieldAlert,
  CheckCircle,
  Plus,
  FileText,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";
import MetricCard from "../../../components/ui/MetricCard";

export interface IncidentRecord {
  id: string;
  date: string;
  location: string;
  severity: "Minor" | "Moderate" | "Critical";
  description: string;
  staff_involved: string;
  action_taken: string;
  status: "Resolved" | "Under Investigation" | "Open";
}

const INITIAL_INCIDENTS: IncidentRecord[] = [];

export default function HealthSafety() {
  usePageTitle("health-safety", "Health & Workplace Safety");

  const [incidents, setIncidents] = useState<IncidentRecord[]>(INITIAL_INCIDENTS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    location: "Musanze Farm Plot A",
    severity: "Minor" as IncidentRecord["severity"],
    description: "",
    staff_involved: "",
    action_taken: "",
  });

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) {
      toast.error("Please describe the incident.");
      return;
    }

    const newInc: IncidentRecord = {
      id: `INC-2026-0${incidents.length + 1}`,
      date: new Date().toISOString().split("T")[0],
      location: form.location,
      severity: form.severity,
      description: form.description.trim(),
      staff_involved: form.staff_involved || "Farm Worker",
      action_taken: form.action_taken || "First aid applied",
      status: "Under Investigation",
    };

    setIncidents([newInc, ...incidents]);
    setIsAddOpen(false);
    toast.success("Health & Safety incident report logged.");
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
            Workplace safety audits, PPE compliance, farm hazard reporting, and medical incident logs.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#055028]"
        >
          <Plus size={16} /> Report Safety Incident
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Safety Compliance"
          value="100%"
          subtext="Active workplace safety standards"
          icon={<ShieldAlert size={22} className="text-[#076935]" />}
          iconBg="bg-[#076935]/10"
          badgeText="Compliant"
          badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
        />

        <MetricCard
          label="PPE Gear Compliance"
          value="100%"
          subtext="Farm & packhouse protective gear"
          icon={<CheckCircle size={22} className="text-blue-600" />}
          iconBg="bg-blue-50"
          badgeText="Certified"
          badgeColor="bg-blue-50 text-blue-700 border-blue-200"
        />

        <MetricCard
          label="Reported Incidents"
          value={`${incidents.length}`}
          subtext={incidents.length > 0 ? "Logged hazard & safety cases" : "Zero open safety incidents"}
          icon={<Activity size={22} className="text-amber-600" />}
          iconBg="bg-amber-50"
          badgeText="Incident Log"
          badgeColor="bg-amber-50 text-amber-700 border-amber-200"
        />

        <MetricCard
          label="Open Audits"
          value="0"
          subtext="Critical hazard audits"
          icon={<FileText size={22} className="text-purple-600" />}
          iconBg="bg-purple-50"
          badgeText="Audits Clear"
          badgeColor="bg-purple-50 text-purple-700 border-purple-200"
        />
      </div>

      {/* Incident Log Table */}
      <div className="overflow-hidden rounded-2xl border border-[#076935]/10 bg-white">
        <div className="p-4 border-b border-gray-100 font-bold text-gray-800 text-sm">
          Workplace Incident & Hazard Log
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#F4FAF7] border-b border-[#076935]/10 text-gray-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Incident ID</th>
              <th className="px-4 py-3">Date & Location</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Staff Involved</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Corrective Action Taken</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <CheckCircle size={28} className="text-[#076935]/40" />
                    <p className="text-sm font-semibold text-gray-700">No safety incidents recorded</p>
                    <p className="text-xs text-gray-400 font-normal">Workplace safety conditions and PPE audits are operating optimal.</p>
                  </div>
                </td>
              </tr>
            ) : (
              incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-[#F4FAF7]/50 transition">
                  <td className="px-4 py-3 font-bold font-mono text-gray-900">{inc.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{inc.location}</p>
                    <p className="text-[11px] text-gray-400">{inc.date}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                      {inc.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{inc.staff_involved}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{inc.description}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{inc.action_taken}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      {inc.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      {/* Report Incident Modal */}
      <Modal open={isAddOpen} onClose={() => setIsAddOpen(false)} size="md" title="Report Workplace Incident">
        <form onSubmit={handleReportIncident} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-gray-700">Location *</label>
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="mt-1 w-full rounded-xl border p-2.5 outline-none focus:border-[#076935]"
              placeholder="e.g. Musanze Plot B Harvest"
            />
          </div>
          <div>
            <label className="font-bold text-gray-700">Staff Involved</label>
            <input
              type="text"
              value={form.staff_involved}
              onChange={(e) => setForm({ ...form, staff_involved: e.target.value })}
              className="mt-1 w-full rounded-xl border p-2.5 outline-none focus:border-[#076935]"
              placeholder="Name of worker"
            />
          </div>
          <div>
            <label className="font-bold text-gray-700">Incident Description *</label>
            <textarea
              rows={2}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full rounded-xl border p-2.5 outline-none focus:border-[#076935]"
            />
          </div>
          <div className="flex justify-end gap-2 border-t pt-3">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="rounded-xl border px-4 py-2 font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#076935] px-4 py-2 font-bold text-white hover:bg-[#055028]"
            >
              Submit Report
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
