import { useState } from "react";
import {
  Award,
  Plus,
  Users,
  Calendar,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";

export interface TrainingProgram {
  id: string;
  title: string;
  provider: string;
  category: "Organic Certification" | "Food Safety & Cold-Chain" | "Farm Machinery" | "Agronomy & Pest Control";
  enrolled_count: number;
  duration_days: number;
  start_date: string;
  status: "Active Session" | "Upcoming" | "Completed";
  cert_issued: boolean;
}

const INITIAL_PROGRAMS: TrainingProgram[] = [
  {
    id: "TRN-2026-01",
    title: "EU & EAC Organic Farming Certification Standard",
    provider: "Rwanda Agriculture & Animal Resources Board (RAB)",
    category: "Organic Certification",
    enrolled_count: 24,
    duration_days: 5,
    start_date: "2026-10-05",
    status: "Upcoming",
    cert_issued: true,
  },
  {
    id: "TRN-2026-02",
    title: "Cold-Chain Hygiene & Post-Harvest Handling",
    provider: "KainaFresh Quality Control Academy",
    category: "Food Safety & Cold-Chain",
    enrolled_count: 18,
    duration_days: 3,
    start_date: "2026-09-01",
    status: "Active Session",
    cert_issued: true,
  },
  {
    id: "TRN-2026-03",
    title: "Safe Organic Pesticide & Bio-Fertilizer Application",
    provider: "Musanze Agro-Tech Center",
    category: "Agronomy & Pest Control",
    enrolled_count: 32,
    duration_days: 2,
    start_date: "2026-08-15",
    status: "Completed",
    cert_issued: true,
  },
];

export default function TrainingDevelopment() {
  usePageTitle("training-development", "Training & Development");

  const [programs, setPrograms] = useState<TrainingProgram[]>(INITIAL_PROGRAMS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    provider: "RAB Rwanda",
    category: "Organic Certification" as TrainingProgram["category"],
    enrolled_count: 15,
    duration_days: 3,
    start_date: "2026-10-15",
  });

  const handleAddProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Please enter course title.");
      return;
    }

    const newProg: TrainingProgram = {
      id: `TRN-2026-0${programs.length + 1}`,
      title: form.title.trim(),
      provider: form.provider,
      category: form.category,
      enrolled_count: Number(form.enrolled_count),
      duration_days: Number(form.duration_days),
      start_date: form.start_date,
      status: "Upcoming",
      cert_issued: true,
    };

    setPrograms([newProg, ...programs]);
    setIsAddOpen(false);
    toast.success(`Training program "${newProg.title}" scheduled!`);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
            Training & Capacity Building
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Organic agricultural certifications, cold-chain food safety, and worker skills development.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#055028]"
        >
          <Plus size={16} /> Schedule Training Session
        </button>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((prog) => (
          <div key={prog.id} className="rounded-2xl border border-[#076935]/10 bg-white p-5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#076935] bg-[#076935]/10 px-2.5 py-1 rounded-md">
                  {prog.category}
                </span>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    prog.status === "Active Session"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : prog.status === "Completed"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {prog.status}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-sm mt-3 leading-snug">{prog.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{prog.provider}</p>

              <div className="mt-4 pt-3 border-t text-xs text-gray-600 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-[#076935]" /> <strong>{prog.enrolled_count} Staff Enrolled</strong>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Calendar size={14} /> Starts: {prog.start_date} ({prog.duration_days} Days)
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <Award size={14} /> Official Certificate Issued
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Training Modal */}
      <Modal open={isAddOpen} onClose={() => setIsAddOpen(false)} size="md" title="Schedule Training Program">
        <form onSubmit={handleAddProgram} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-gray-700">Course / Program Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 w-full rounded-xl border p-2.5 outline-none focus:border-[#076935]"
              placeholder="e.g. EU Organic Export Handling"
            />
          </div>
          <div>
            <label className="font-bold text-gray-700">Institution / Provider</label>
            <input
              type="text"
              value={form.provider}
              onChange={(e) => setForm({ ...form, provider: e.target.value })}
              className="mt-1 w-full rounded-xl border p-2.5 outline-none focus:border-[#076935]"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-gray-700">Enrolled Staff</label>
              <input
                type="number"
                value={form.enrolled_count}
                onChange={(e) => setForm({ ...form, enrolled_count: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border p-2.5 outline-none focus:border-[#076935]"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700">Duration (Days)</label>
              <input
                type="number"
                value={form.duration_days}
                onChange={(e) => setForm({ ...form, duration_days: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border p-2.5 outline-none focus:border-[#076935]"
              />
            </div>
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
              Create Course
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
