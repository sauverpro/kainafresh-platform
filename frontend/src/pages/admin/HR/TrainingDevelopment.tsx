import { useEffect, useState } from "react";
import {
  Award,
  Plus,
  Calendar,
  CheckCircle,
  Pencil,
  Trash2,
  BookOpen,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";
import MetricCard from "../../../components/ui/MetricCard";
import { apiGet } from "../../../api/client";

export interface TrainingRecord {
  id: string;
  employee_name: string;
  training_name: string;
  training_type: "Workshop" | "Online Course" | "Certification" | "Internal Training" | "Seminar";
  provider: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  cost_rwf: number;
  cert_ref?: string;
  skills_gained?: string;
  status: "Planned" | "Ongoing" | "Completed" | "Cancelled";
  notes?: string;
}

const DEFAULT_EMPLOYEES: Array<{ name: string; department: string }> = [
  { name: "Patrick Hakizimana", department: "Farm Operations" },
  { name: "Diane Ingabire", department: "HR & Admin" },
  { name: "Eric Niyonzima", department: "Logistics & Fleet" },
  { name: "Amina Uwase", department: "Quality Control" },
  { name: "Grace Uwineza", department: "Agronomy" },
];

const INITIAL_TRAININGS: TrainingRecord[] = [
  {
    id: "TRN-2026-001",
    employee_name: "Patrick Hakizimana",
    training_name: "EU Organic Export Handling Certification",
    training_type: "Workshop",
    provider: "Rwanda Organic Agriculture Movement",
    start_date: "2026-09-10",
    end_date: "2026-09-15",
    duration_days: 5,
    cost_rwf: 0,
    cert_ref: "CERT-EU-9402",
    skills_gained: "Organic packhouse handling & sanitary compliance",
    status: "Completed",
    notes: "Passed final practical exam with 98% score",
  },
  {
    id: "TRN-2026-002",
    employee_name: "Diane Ingabire",
    training_name: "Advanced HR & Labor Law Seminar",
    training_type: "Seminar",
    provider: "Rwanda Management Institute (RMI)",
    start_date: "2026-09-18",
    end_date: "2026-09-22",
    duration_days: 4,
    cost_rwf: 150000,
    cert_ref: "RMI-HR-2026",
    skills_gained: "Staff contract arbitration & RSSB tax law",
    status: "Ongoing",
    notes: "Attending daily sessions at Kigali campus",
  },
  {
    id: "TRN-2026-003",
    employee_name: "Eric Niyonzima",
    training_name: "Cold-Chain Logistics & Reefer Maintenance",
    training_type: "Workshop",
    provider: "National Agricultural Export Board (NAEB)",
    start_date: "2026-08-01",
    end_date: "2026-08-03",
    duration_days: 3,
    cost_rwf: 20000,
    cert_ref: "NAEB-CC-012",
    skills_gained: "Reefer truck digital thermostat calibration",
    status: "Completed",
    notes: "Practical certification awarded",
  },
];

export default function TrainingDevelopment() {
  usePageTitle("training-development", "Training & Capacity Building");

  const [trainings, setTrainings] = useState<TrainingRecord[]>(INITIAL_TRAININGS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState(DEFAULT_EMPLOYEES);

  const [form, setForm] = useState({
    employee_name: "",
    training_name: "",
    training_type: "Workshop" as TrainingRecord["training_type"],
    provider: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    duration_days: 1,
    cost_rwf: 0,
    cert_ref: "",
    skills_gained: "",
    status: "Planned" as TrainingRecord["status"],
    notes: "",
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

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    if (isNaN(diff) || diff < 0) return 1;
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  const totalCost = trainings.reduce((sum, t) => sum + (t.cost_rwf || 0), 0);
  const completedCount = trainings.filter((t) => t.status === "Completed").length;

  const handleAddTrainingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_name.trim()) {
      toast.error("Please select an employee.");
      return;
    }
    if (!form.training_name.trim()) {
      toast.error("Please enter training name.");
      return;
    }

    const duration = calculateDuration(form.start_date, form.end_date);

    const newRec: TrainingRecord = {
      id: `TRN-2026-00${trainings.length + 1}`,
      employee_name: form.employee_name.trim(),
      training_name: form.training_name.trim(),
      training_type: form.training_type,
      provider: form.provider.trim() || "Internal Institute",
      start_date: form.start_date,
      end_date: form.end_date,
      duration_days: duration,
      cost_rwf: Number(form.cost_rwf) || 0,
      cert_ref: form.cert_ref.trim(),
      skills_gained: form.skills_gained.trim(),
      status: form.status,
      notes: form.notes.trim(),
    };

    setTrainings([newRec, ...trainings]);
    setIsAddOpen(false);
    setForm({
      employee_name: "",
      training_name: "",
      training_type: "Workshop",
      provider: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date().toISOString().split("T")[0],
      duration_days: 1,
      cost_rwf: 0,
      cert_ref: "",
      skills_gained: "",
      status: "Planned",
      notes: "",
    });
    toast.success(`Training record for ${newRec.employee_name} created successfully!`);
  };

  const handleDeleteTraining = (id: string) => {
    setTrainings((prev) => prev.filter((t) => t.id !== id));
    toast.success("Training record removed.");
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner matching attached screenshot */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
            Training & Capacity Building
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track employee workshops, certifications, skills gained, and training expenditure.
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
          value={`${trainings.filter((t) => t.status === "Ongoing").length}`}
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

      {/* Table matching screenshot */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
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
            {trainings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                  No training records found.
                </td>
              </tr>
            ) : (
              trainings.map((trn) => (
                <tr key={trn.id} className="hover:bg-gray-50/80 transition">
                  <td className="px-4 py-3.5 font-bold text-gray-900 text-sm">{trn.employee_name}</td>
                  <td className="px-4 py-3.5 text-gray-800 font-semibold">{trn.training_name}</td>
                  <td className="px-4 py-3.5 text-gray-600">
                    <span className="font-bold text-gray-700">{trn.training_type}</span> · {trn.provider}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 font-medium">
                    {trn.duration_days} Day(s) ({trn.start_date})
                  </td>
                  <td className="px-4 py-3.5 font-bold text-[#076935]">
                    {trn.cost_rwf === 0 ? "RWF 0" : `RWF ${trn.cost_rwf.toLocaleString()}`}
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
                        onClick={() => toast.info(`Editing training record #${trn.id}`)}
                        className="rounded-lg border border-blue-200 p-1.5 text-blue-600 hover:bg-blue-50 transition"
                        title="Edit Record"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteTraining(trn.id)}
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

      {/* Add Training Record Modal matching user screenshot 1:1 */}
      <Modal open={isAddOpen} onClose={() => setIsAddOpen(false)} size="xl" title="Add Training Record">
        <form onSubmit={handleAddTrainingSubmit} className="space-y-4 text-sm">
          {/* Row 1: Employee * & Training Name * */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.employee_name}
                onChange={(e) => setForm({ ...form, employee_name: e.target.value })}
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
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Training Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter training name..."
                value={form.training_name}
                onChange={(e) => setForm({ ...form, training_name: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>
          </div>

          {/* Row 2: Training Type & Provider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Training Type</label>
              <select
                value={form.training_type}
                onChange={(e) => setForm({ ...form, training_type: e.target.value as any })}
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
              <label className="block text-sm font-bold text-gray-800 mb-1">Provider</label>
              <input
                type="text"
                placeholder="e.g. RAB / NAEB / RMI"
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>
          </div>

          {/* Row 3: Start Date, End Date, Duration (days) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Start Date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => {
                  const nextStart = e.target.value;
                  const nextDur = calculateDuration(nextStart, form.end_date);
                  setForm({ ...form, start_date: nextStart, duration_days: nextDur });
                }}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">End Date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => {
                  const nextEnd = e.target.value;
                  const nextDur = calculateDuration(form.start_date, nextEnd);
                  setForm({ ...form, end_date: nextEnd, duration_days: nextDur });
                }}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Duration (days)</label>
              <input
                type="text"
                readOnly
                value={`${calculateDuration(form.start_date, form.end_date)} Day(s)`}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm font-bold text-[#076935] outline-none"
              />
            </div>
          </div>

          {/* Row 4: Cost (RWF) & Certification Ref */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Cost (RWF)</label>
              <input
                type="number"
                min="0"
                value={form.cost_rwf}
                onChange={(e) => setForm({ ...form, cost_rwf: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Certification Ref</label>
              <input
                type="text"
                placeholder="e.g. CERT-2026-091"
                value={form.cert_ref}
                onChange={(e) => setForm({ ...form, cert_ref: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              />
            </div>
          </div>

          {/* Row 5: Skills Gained */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Skills Gained</label>
            <textarea
              rows={3}
              value={form.skills_gained}
              onChange={(e) => setForm({ ...form, skills_gained: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              placeholder="List specific skills or competencies acquired during training..."
            />
          </div>

          {/* Row 6: Status */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
              className="w-full sm:w-1/2 rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
            >
              <option value="Planned">Planned</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Row 7: Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              placeholder="Additional comments..."
            />
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
              className="rounded-xl bg-[#00B4D8] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0096C7] shadow-sm"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
