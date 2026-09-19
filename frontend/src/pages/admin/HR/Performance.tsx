import { useEffect, useState } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Pencil,
  Trash2,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";
import { apiGet } from "../../../api/client";

export interface PerformanceReview {
  id: string;
  employee_name: string;
  review_period: string;
  review_date: string;
  reviewer: string;
  rating: "Satisfactory" | "Excellent" | "Good" | "Needs Improvement";
  promotion: "Yes" | "No";
}

export interface DisciplinaryAction {
  id: string;
  employee_name: string;
  action_date: string;
  action_type: "Verbal Warning" | "Written Warning" | "Suspension" | "Termination";
  issued_by: string;
  reason: string;
  description?: string;
  status: "Active" | "Resolved" | "Archived";
}

const DEFAULT_EMPLOYEES: Array<{ name: string; department: string }> = [
  { name: "Patrick Hakizimana", department: "Farm Operations" },
  { name: "Aline Uwase", department: "Quality Control" },
  { name: "Eric Niyonzima", department: "Logistics & Fleet" },
  { name: "Diane Ingabire", department: "HR & Admin" },
  { name: "Jean-Baptiste Musafiri", department: "Farm Operations" },
  { name: "Emmanuel Habimana", department: "Logistics & Fleet" },
];

const INITIAL_REVIEWS: PerformanceReview[] = [
  {
    id: "REV-2026-001",
    employee_name: "Patrick Hakizimana",
    review_period: "Q1 2026",
    review_date: "Mar 31, 2026",
    reviewer: "Amina Uwase",
    rating: "Satisfactory",
    promotion: "No",
  },
  {
    id: "REV-2026-002",
    employee_name: "Aline Uwase",
    review_period: "Annual 2025",
    review_date: "Dec 15, 2025",
    reviewer: "Diane Ingabire",
    rating: "Excellent",
    promotion: "Yes",
  },
  {
    id: "REV-2026-003",
    employee_name: "Eric Niyonzima",
    review_period: "Annual 2025",
    review_date: "Dec 15, 2025",
    reviewer: "Diane Ingabire",
    rating: "Good",
    promotion: "No",
  },
];

const INITIAL_DISCIPLINARY: DisciplinaryAction[] = [
  {
    id: "DISC-2026-001",
    employee_name: "Eric Niyonzima",
    action_date: "2026-09-19",
    action_type: "Verbal Warning",
    issued_by: "Diane Ingabire",
    reason: "Late delivery departure & cold-chain log delay",
    description: "Verbal warning issued regarding 30-minute delay on morning dispatch.",
    status: "Active",
  },
];

export default function Performance() {
  usePageTitle("performance-management", "Performance Management");

  const [activeTab, setActiveTab] = useState<"reviews" | "disciplinary">("reviews");
  const [reviews, setReviews] = useState<PerformanceReview[]>(INITIAL_REVIEWS);
  const [disciplinaryList, setDisciplinaryList] = useState<DisciplinaryAction[]>(INITIAL_DISCIPLINARY);
  const [employeeOptions, setEmployeeOptions] = useState(DEFAULT_EMPLOYEES);

  // Modals state
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [isAddDisciplinaryOpen, setIsAddDisciplinaryOpen] = useState(false);

  // Add Review Form
  const [reviewForm, setReviewForm] = useState({
    employee_name: "",
    review_period: "Q1 2026",
    review_date: new Date().toISOString().split("T")[0],
    reviewer: "Amina Uwase",
    rating: "Satisfactory" as PerformanceReview["rating"],
    promotion: "No" as PerformanceReview["promotion"],
  });

  // Disciplinary Form
  const [discForm, setDiscForm] = useState({
    employee_name: "",
    action_date: new Date().toISOString().split("T")[0],
    action_type: "Verbal Warning" as DisciplinaryAction["action_type"],
    issued_by: "Diane Ingabire",
    reason: "",
    description: "",
    status: "Active" as DisciplinaryAction["status"],
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

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.employee_name.trim()) {
      toast.error("Please select an employee.");
      return;
    }

    const newRev: PerformanceReview = {
      id: `REV-2026-00${reviews.length + 1}`,
      employee_name: reviewForm.employee_name.trim(),
      review_period: reviewForm.review_period,
      review_date: reviewForm.review_date,
      reviewer: reviewForm.reviewer,
      rating: reviewForm.rating,
      promotion: reviewForm.promotion,
    };

    setReviews([newRev, ...reviews]);
    setIsAddReviewOpen(false);
    toast.success(`Performance review added for ${newRev.employee_name}!`);
  };

  const handleAddDisciplinarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discForm.employee_name.trim()) {
      toast.error("Please select an employee.");
      return;
    }
    if (!discForm.reason.trim()) {
      toast.error("Please provide a reason for the disciplinary action.");
      return;
    }

    const newDisc: DisciplinaryAction = {
      id: `DISC-2026-00${disciplinaryList.length + 1}`,
      employee_name: discForm.employee_name.trim(),
      action_date: discForm.action_date,
      action_type: discForm.action_type,
      issued_by: discForm.issued_by,
      reason: discForm.reason.trim(),
      description: discForm.description.trim(),
      status: discForm.status,
    };

    setDisciplinaryList([newDisc, ...disciplinaryList]);
    setIsAddDisciplinaryOpen(false);
    setDiscForm({
      employee_name: "",
      action_date: new Date().toISOString().split("T")[0],
      action_type: "Verbal Warning",
      issued_by: "Diane Ingabire",
      reason: "",
      description: "",
      status: "Active",
    });
    toast.success(`Disciplinary action recorded for ${newDisc.employee_name}!`);
  };

  const handleDeleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    toast.success(`Performance review record removed.`);
  };

  const handleDeleteDisciplinary = (id: string) => {
    setDisciplinaryList((prev) => prev.filter((d) => d.id !== id));
    toast.success(`Disciplinary action record removed.`);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header Banner matching Image 1 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
            Performance Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Reviews, appraisals, and disciplinary records
          </p>
        </div>

        {/* Dual Action Buttons matching Image 1 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddReviewOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00B4D8] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0096C7] shadow-xs transition"
          >
            <TrendingUp size={16} /> Add Review
          </button>
          <button
            onClick={() => setIsAddDisciplinaryOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#DC2626] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#B91C1C] shadow-xs transition"
          >
            <AlertTriangle size={16} /> Disciplinary Action
          </button>
        </div>
      </div>

      {/* Tabs matching Image 1 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 border-b-2 transition ${
              activeTab === "reviews"
                ? "border-[#00B4D8] text-[#00B4D8] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Performance Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab("disciplinary")}
            className={`pb-3 border-b-2 transition ${
              activeTab === "disciplinary"
                ? "border-[#DC2626] text-[#DC2626] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Disciplinary Actions ({disciplinaryList.length})
          </button>
        </nav>
      </div>

      {/* TAB 1: Performance Reviews Table */}
      {activeTab === "reviews" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Period</th>
                <th className="px-4 py-3.5">Review Date</th>
                <th className="px-4 py-3.5">Reviewer</th>
                <th className="px-4 py-3.5">Rating</th>
                <th className="px-4 py-3.5">Promotion</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No performance reviews logged.
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-4 py-3.5 font-bold text-gray-900 text-sm">{rev.employee_name}</td>
                    <td className="px-4 py-3.5 text-gray-600 font-medium">{rev.review_period}</td>
                    <td className="px-4 py-3.5 text-gray-600">{rev.review_date}</td>
                    <td className="px-4 py-3.5 text-gray-600">{rev.reviewer}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-md px-3 py-1 text-xs font-bold text-white ${
                          rev.rating === "Satisfactory"
                            ? "bg-[#00B4D8]"
                            : rev.rating === "Excellent"
                            ? "bg-[#076935]"
                            : rev.rating === "Good"
                            ? "bg-[#2563EB]"
                            : "bg-amber-500"
                        }`}
                      >
                        {rev.rating}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-md px-3 py-1 text-xs font-bold text-white ${
                          rev.promotion === "Yes" ? "bg-[#076935]" : "bg-gray-500"
                        }`}
                      >
                        {rev.promotion}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toast.info(`Editing review #${rev.id}`)}
                          className="rounded-lg border border-blue-200 p-1.5 text-blue-600 hover:bg-blue-50 transition"
                          title="Edit Review"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Review"
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
      )}

      {/* TAB 2: Disciplinary Actions Table */}
      {activeTab === "disciplinary" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Action Date</th>
                <th className="px-4 py-3.5">Action Type</th>
                <th className="px-4 py-3.5">Issued By</th>
                <th className="px-4 py-3.5">Reason</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {disciplinaryList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No disciplinary actions logged.
                  </td>
                </tr>
              ) : (
                disciplinaryList.map((disc) => (
                  <tr key={disc.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-4 py-3.5 font-bold text-gray-900 text-sm">{disc.employee_name}</td>
                    <td className="px-4 py-3.5 text-gray-600 font-medium">{disc.action_date}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                        {disc.action_type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{disc.issued_by}</td>
                    <td className="px-4 py-3.5 text-gray-600 max-w-xs truncate">{disc.reason}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        {disc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toast.info(`Editing disciplinary action #${disc.id}`)}
                          className="rounded-lg border border-blue-200 p-1.5 text-blue-600 hover:bg-blue-50 transition"
                          title="Edit Action"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteDisciplinary(disc.id)}
                          className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Action"
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
      )}

      {/* Add Review Modal */}
      <Modal
        open={isAddReviewOpen}
        onClose={() => setIsAddReviewOpen(false)}
        size="lg"
        title={
          <div className="text-white font-bold text-lg bg-[#00B4D8] -m-5 p-4 rounded-t-xl flex items-center gap-2">
            <TrendingUp size={20} /> Add Performance Review
          </div>
        }
      >
        <form onSubmit={handleAddReviewSubmit} className="space-y-4 pt-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={reviewForm.employee_name}
                onChange={(e) => setReviewForm({ ...reviewForm, employee_name: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#00B4D8]"
              >
                <option value="">Select employee...</option>
                {employeeOptions.map((emp) => (
                  <option key={emp.name} value={emp.name}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Review Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={reviewForm.review_date}
                onChange={(e) => setReviewForm({ ...reviewForm, review_date: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#00B4D8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Period <span className="text-red-500">*</span>
              </label>
              <select
                value={reviewForm.review_period}
                onChange={(e) => setReviewForm({ ...reviewForm, review_period: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#00B4D8]"
              >
                <option value="Q1 2026">Q1 2026</option>
                <option value="Q2 2026">Q2 2026</option>
                <option value="Q3 2026">Q3 2026</option>
                <option value="Annual 2025">Annual 2025</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Reviewer</label>
              <input
                type="text"
                value={reviewForm.reviewer}
                onChange={(e) => setReviewForm({ ...reviewForm, reviewer: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#00B4D8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Rating <span className="text-red-500">*</span>
              </label>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value as any })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#00B4D8]"
              >
                <option value="Satisfactory">Satisfactory</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Needs Improvement">Needs Improvement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Promotion</label>
              <select
                value={reviewForm.promotion}
                onChange={(e) => setReviewForm({ ...reviewForm, promotion: e.target.value as any })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#00B4D8]"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setIsAddReviewOpen(false)}
              className="rounded-xl border border-gray-300 bg-gray-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#00B4D8] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0096C7] shadow-sm"
            >
              Save Review
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Disciplinary Action Modal matching Image 5 */}
      <Modal
        open={isAddDisciplinaryOpen}
        onClose={() => setIsAddDisciplinaryOpen(false)}
        size="lg"
        title={
          <div className="text-white font-bold text-lg bg-[#DC2626] -m-5 p-4 rounded-t-xl flex items-center gap-2">
            <AlertTriangle size={20} /> Record Disciplinary Action
          </div>
        }
      >
        <form onSubmit={handleAddDisciplinarySubmit} className="space-y-4 pt-4 text-sm">
          {/* Row 1: Employee * & Action Date * */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={discForm.employee_name}
                onChange={(e) => setDiscForm({ ...discForm, employee_name: e.target.value })}
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
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Action Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={discForm.action_date}
                onChange={(e) => setDiscForm({ ...discForm, action_date: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
              />
            </div>
          </div>

          {/* Row 2: Action Type * & Issued By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Action Type <span className="text-red-500">*</span>
              </label>
              <select
                value={discForm.action_type}
                onChange={(e) => setDiscForm({ ...discForm, action_type: e.target.value as any })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
              >
                <option value="Verbal Warning">Verbal Warning</option>
                <option value="Written Warning">Written Warning</option>
                <option value="Suspension">Suspension</option>
                <option value="Termination">Termination</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Issued By</label>
              <select
                value={discForm.issued_by}
                onChange={(e) => setDiscForm({ ...discForm, issued_by: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
              >
                <option value="Select...">Select...</option>
                <option value="Diane Ingabire">Diane Ingabire</option>
                <option value="Amina Uwase">Amina Uwase</option>
                <option value="Esther Uwase">Esther Uwase</option>
              </select>
            </div>
          </div>

          {/* Row 3: Reason * */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={discForm.reason}
              onChange={(e) => setDiscForm({ ...discForm, reason: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
              placeholder="State reason for disciplinary record..."
            />
          </div>

          {/* Row 4: Description */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Description</label>
            <textarea
              rows={3}
              value={discForm.description}
              onChange={(e) => setDiscForm({ ...discForm, description: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
              placeholder="Additional background context or incident details..."
            />
          </div>

          {/* Row 5: Status */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Status</label>
            <select
              value={discForm.status}
              onChange={(e) => setDiscForm({ ...discForm, status: e.target.value as any })}
              className="w-full sm:w-1/2 rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
            >
              <option value="Active">Active</option>
              <option value="Resolved">Resolved</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Footer Actions matching Image 5 */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setIsAddDisciplinaryOpen(false)}
              className="rounded-xl border border-gray-300 bg-gray-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#DC2626] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#B91C1C] shadow-sm"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
