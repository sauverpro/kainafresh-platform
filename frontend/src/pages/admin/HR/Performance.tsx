import { useState } from "react";
import {
  TrendingUp,
  Award,
  Star,
  Plus,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";

export interface PerformanceReview {
  id: string;
  employee_name: string;
  department: string;
  review_period: "Q1 2026" | "Q2 2026" | "Q3 2026" | "Annual 2025";
  evaluator: string;
  rating_score: number; // 1 to 5
  key_kpi: string;
  status: "Completed" | "Pending Review";
}

const INITIAL_REVIEWS: PerformanceReview[] = [];

export default function Performance() {
  usePageTitle("performance-management", "Performance & Evaluations");

  const [reviews, setReviews] = useState<PerformanceReview[]>(INITIAL_REVIEWS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    employee_name: "",
    department: "Farm Operations",
    review_period: "Q3 2026" as PerformanceReview["review_period"],
    evaluator: "Operations Lead",
    rating_score: 4.5,
    key_kpi: "",
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating_score, 0) / reviews.length).toFixed(1)
    : "0.0";

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_name.trim()) {
      toast.error("Please select or enter employee name.");
      return;
    }

    const newRev: PerformanceReview = {
      id: `REV-2026-0${reviews.length + 1}`,
      employee_name: form.employee_name.trim(),
      department: form.department,
      review_period: form.review_period,
      evaluator: form.evaluator,
      rating_score: Number(form.rating_score),
      key_kpi: form.key_kpi || "Operations & Quality SLA met",
      status: "Completed",
    };

    setReviews([newRev, ...reviews]);
    setIsAddOpen(false);
    toast.success(`Performance review for ${newRev.employee_name} logged!`);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
            Performance & Staff Evaluations
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quarterly performance scorecards, farm yield targets, and Quality Control SLAs.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#055028]"
        >
          <Plus size={16} /> Log Performance Review
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#076935] text-white font-bold">
              <Star size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">Workforce Average Score</p>
              <p className="text-2xl font-extrabold text-[#076935]">{avgRating} / 5.0</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
              <Award size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-900">High Performers</p>
              <p className="text-2xl font-extrabold text-blue-900">
                {reviews.length > 0 ? "92% of Staff" : "0% of Staff"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white font-bold">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-900">Reviews Completed</p>
              <p className="text-2xl font-extrabold text-amber-900">{reviews.length} Evaluated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#076935]/10 bg-white">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#F4FAF7] border-b border-[#076935]/10 text-gray-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Review ID</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Rating Score</th>
              <th className="px-4 py-3">Key KPI Achievement</th>
              <th className="px-4 py-3">Evaluator</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Star size={28} className="text-gray-300" />
                    <p className="text-sm font-semibold text-gray-700">No current performance reviews</p>
                    <p className="text-xs text-gray-400 font-normal">Logged performance evaluations and KPI scorecards will appear here.</p>
                  </div>
                </td>
              </tr>
            ) : (
              reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-[#F4FAF7]/50 transition">
                  <td className="px-4 py-3 font-bold font-mono text-gray-900">{rev.id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{rev.employee_name}</td>
                  <td className="px-4 py-3 text-gray-600">{rev.department}</td>
                  <td className="px-4 py-3 font-medium text-[#076935]">{rev.review_period}</td>
                  <td className="px-4 py-3 font-bold text-amber-600 flex items-center gap-1">
                    <Star size={14} className="fill-amber-400 text-amber-500" /> {rev.rating_score}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[240px] truncate">{rev.key_kpi}</td>
                  <td className="px-4 py-3 text-gray-500">{rev.evaluator}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      {rev.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      {/* Add Review Modal */}
      <Modal open={isAddOpen} onClose={() => setIsAddOpen(false)} size="md" title="Log Performance Evaluation">
        <form onSubmit={handleAddReview} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-gray-700">Employee Name *</label>
            <input
              type="text"
              required
              value={form.employee_name}
              onChange={(e) => setForm({ ...form, employee_name: e.target.value })}
              className="mt-1 w-full rounded-xl border p-2.5 outline-none focus:border-[#076935]"
              placeholder="e.g. Jean-Claude Mugisha"
            />
          </div>
          <div>
            <label className="font-bold text-gray-700">Rating Score (1.0 to 5.0)</label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="5"
              value={form.rating_score}
              onChange={(e) => setForm({ ...form, rating_score: Number(e.target.value) })}
              className="mt-1 w-full rounded-xl border p-2.5 outline-none focus:border-[#076935]"
            />
          </div>
          <div>
            <label className="font-bold text-gray-700">Key KPI / Achievement</label>
            <textarea
              rows={2}
              value={form.key_kpi}
              onChange={(e) => setForm({ ...form, key_kpi: e.target.value })}
              className="mt-1 w-full rounded-xl border p-2.5 outline-none focus:border-[#076935]"
              placeholder="e.g. Achieved zero cold-chain temperature violations..."
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
              Save Review
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
