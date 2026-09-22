import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import Modal from "../../../components/ui/Modal";
import ConfirmDeleteModal from "../../../components/ui/ConfirmDeleteModal";
import { toast } from "sonner";
import { apiGet } from "../../../api/client";
import {
  type CreateDisciplinaryInput,
  type CreatePerformanceInput,
  type DisciplinaryRecord,
  type PerformanceRecord,
  usePerformanceStore,
} from "../../../store/usePerformanceStore";

interface EmployeeOption {
  id: number;
  name: string;
  department: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const asId = (value: unknown): number => {
  const id = Number(value);
  return Number.isFinite(id) ? id : 0;
};

const normalizeEmployeeResponse = (response: unknown): Array<Record<string, unknown>> => {
  if (Array.isArray(response)) return response as Array<Record<string, unknown>>;
  if (!response || typeof response !== "object") return [];

  const value = response as Record<string, unknown>;
  if (Array.isArray(value.data)) return value.data as Array<Record<string, unknown>>;
  if (Array.isArray(value.employees)) return value.employees as Array<Record<string, unknown>>;
  if (value.data && typeof value.data === "object") {
    const nested = value.data as Record<string, unknown>;
    if (Array.isArray(nested.data)) return nested.data as Array<Record<string, unknown>>;
    if (Array.isArray(nested.employees)) return nested.employees as Array<Record<string, unknown>>;
  }
  return [];
};

const formatDate = (value?: string) => (value ? value.slice(0, 10) : "—");

const promotionLabel = (value?: number | string) =>
  Number(value) === 1 ? "Yes" : "No";

const displayStatus = (status: string) =>
  status
    ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    : "—";

const normalizeStatus = (status: string) => {
  const normalized = status.trim().toLowerCase();
  if (normalized === "active") return "active";
  if (normalized === "resolved") return "resolved";
  if (normalized === "archived") return "archived";
  return normalized;
};

const employeeNameById = (employees: EmployeeOption[], id: number) =>
  employees.find((employee) => employee.id === id)?.name ?? `Staff #${id}`;

const emptyReviewForm = {
  employee_id: "",
  reviewer_id: "",
  review_period: "Q1 2026",
  review_date: today(),
  overall_rating: "Satisfactory",
  promotion: "No" as "Yes" | "No",
  target_set: "",
  target_achieved: "",
  strengths: "",
  improvement_area: "",
  recommendation: "",
  overtime: "0",
};

const emptyDiscForm = {
  employee_id: "",
  action_date: today(),
  action_type: "Verbal Warning",
  issued_by: "",
  reason: "",
  description: "",
  status: "Active",
};

function buildReviewPayload(form: typeof emptyReviewForm): CreatePerformanceInput {
  const period = form.review_period;
  const rating = form.overall_rating;
  const promotion = form.promotion === "Yes" ? 1 : 0;

  return {
    employee_id: Number(form.employee_id),
    reviewer_id: Number(form.reviewer_id),
    review_date: form.review_date,
    review_period: period,
    overall_rating: rating,
    promotion,
    overtime: Number(form.overtime) || 0,
    target_set: form.target_set.trim() || `Performance targets for ${period}`,
    target_achieved: form.target_achieved.trim() || "Reviewed and documented with the employee",
    strengths:
      form.strengths.trim() ||
      (rating === "Excellent" || rating === "Good"
        ? "Consistent, reliable performance"
        : "Meets core role expectations"),
    improvement_area:
      form.improvement_area.trim() ||
      (rating === "Needs Improvement"
        ? "Performance gaps identified during review"
        : "No major concerns noted"),
    recommendation:
      form.recommendation.trim() ||
      (form.promotion === "Yes"
        ? "Recommend promotion consideration"
        : "Continue development in current role"),
  };
}

function reviewFormFromRecord(record: PerformanceRecord) {
  return {
    employee_id: String(record.employee_id),
    reviewer_id: String(record.reviewer_id),
    review_period: record.review_period || "Q1 2026",
    review_date: formatDate(record.review_date),
    overall_rating: record.overall_rating || "Satisfactory",
    promotion: promotionLabel(record.promotion) as "Yes" | "No",
    target_set: record.target_set || "",
    target_achieved: record.target_achieved || "",
    strengths: record.strengths || "",
    improvement_area: record.improvement_area || "",
    recommendation: record.recommendation || "",
    overtime: String(record.overtime ?? 0),
  };
}

function discFormFromRecord(record: DisciplinaryRecord) {
  return {
    employee_id: String(record.employee_id),
    action_date: formatDate(record.action_date),
    action_type: record.action_type || "Verbal Warning",
    issued_by: String(record.issued_by),
    reason: record.reason || "",
    description: record.description || "",
    status: displayStatus(record.status),
  };
}

export default function Performance() {
  usePageTitle("performance-management", "Performance Management");

  const {
    reviews,
    disciplinary,
    loadingReviews,
    loadingDisciplinary,
    savingReview,
    savingDisciplinary,
    processingReviewId,
    processingDisciplinaryId,
    error,
    fetchReviews,
    fetchDisciplinary,
    createReview,
    updateReview,
    deleteReview,
    createDisciplinary,
    updateDisciplinary,
    deleteDisciplinary,
    clearError,
  } = usePerformanceStore();

  const [activeTab, setActiveTab] = useState<"reviews" | "disciplinary">("reviews");
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<PerformanceRecord | null>(null);
  const [reviewForm, setReviewForm] = useState(emptyReviewForm);

  const [isDiscModalOpen, setIsDiscModalOpen] = useState(false);
  const [editingDisciplinary, setEditingDisciplinary] = useState<DisciplinaryRecord | null>(null);
  const [discForm, setDiscForm] = useState(emptyDiscForm);

  const [deleteReviewTarget, setDeleteReviewTarget] = useState<PerformanceRecord | null>(null);
  const [deleteDiscTarget, setDeleteDiscTarget] = useState<DisciplinaryRecord | null>(null);

  useEffect(() => {
    void fetchReviews();
    void fetchDisciplinary();
  }, [fetchReviews, fetchDisciplinary]);

  useEffect(() => {
    let cancelled = false;

    const loadEmployees = async () => {
      try {
        const response = await apiGet<unknown>("/api/employees");
        if (cancelled) return;

        const mapped = normalizeEmployeeResponse(response)
          .map((employee) => {
            const id = asId(employee.id ?? employee.employee_id);
            const fullName =
              String(employee.fullname ?? employee.full_name ?? "").trim() ||
              `${String(employee.first_name ?? "").trim()} ${String(employee.last_name ?? "").trim()}`.trim() ||
              String(employee.name ?? "").trim() ||
              "Employee";

            return {
              id,
              name: fullName,
              department: String(
                employee.department_name ??
                  employee.department ??
                  employee.departmentName ??
                  "General",
              ),
            };
          })
          .filter((employee) => employee.id > 0);

        const unique = mapped.filter(
          (employee, index, list) =>
            index === list.findIndex((item) => item.id === employee.id),
        );

        setEmployees(unique);
      } catch (requestError) {
        console.error("Failed to load employees:", requestError);
        if (!cancelled) {
          setEmployees([]);
          toast.error("Unable to load employees. Please refresh and try again.");
        }
      }
    };

    void loadEmployees();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const openCreateReview = () => {
    setEditingReview(null);
    setReviewForm(emptyReviewForm);
    setIsReviewModalOpen(true);
  };

  const openEditReview = (record: PerformanceRecord) => {
    setEditingReview(record);
    setReviewForm(reviewFormFromRecord(record));
    setIsReviewModalOpen(true);
  };

  const openCreateDisciplinary = () => {
    setEditingDisciplinary(null);
    setDiscForm(emptyDiscForm);
    setIsDiscModalOpen(true);
  };

  const openEditDisciplinary = (record: DisciplinaryRecord) => {
    setEditingDisciplinary(record);
    setDiscForm(discFormFromRecord(record));
    setIsDiscModalOpen(true);
  };

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const employeeId = asId(reviewForm.employee_id);
    const reviewerId = asId(reviewForm.reviewer_id);

    if (!employeeId || !reviewerId) {
      toast.error("Please select a valid employee and reviewer.");
      return;
    }

    if (!reviewForm.review_date || !reviewForm.review_period.trim()) {
      toast.error("Review date and review period are required.");
      return;
    }

    if (!reviewForm.overall_rating.trim()) {
      toast.error("Please select an overall rating.");
      return;
    }

    const payload = buildReviewPayload(reviewForm);

    const ok = editingReview
      ? await updateReview(editingReview.id, payload)
      : await createReview(payload);

    if (ok) {
      setIsReviewModalOpen(false);
      setEditingReview(null);
      setReviewForm(emptyReviewForm);
      toast.success(
        editingReview
          ? "Performance review updated successfully."
          : "Performance review created successfully.",
      );
      void fetchReviews();
    }
  };

  const submitDisciplinary = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!asId(discForm.employee_id)) {
      toast.error("Please select a valid employee.");
      return;
    }
    if (!asId(discForm.issued_by)) {
      toast.error("Please select a valid issuer.");
      return;
    }
    if (!discForm.reason.trim()) {
      toast.error("Please provide a reason for the disciplinary action.");
      return;
    }

    const payload: CreateDisciplinaryInput = {
      employee_id: Number(discForm.employee_id),
      action_date: discForm.action_date,
      action_type: discForm.action_type,
      reason: discForm.reason.trim(),
      description: discForm.description.trim() || "No additional details provided.",
      issued_by: Number(discForm.issued_by),
      status: normalizeStatus(discForm.status),
    };

    const ok = editingDisciplinary
      ? await updateDisciplinary(editingDisciplinary.id, payload)
      : await createDisciplinary(payload);

    if (ok) {
      setIsDiscModalOpen(false);
      setEditingDisciplinary(null);
      setDiscForm(emptyDiscForm);
      toast.success(
        editingDisciplinary
          ? "Disciplinary action updated successfully."
          : "Disciplinary action recorded successfully.",
      );
      void fetchDisciplinary();
    }
  };

  const confirmDeleteReview = async () => {
    if (!deleteReviewTarget) return;
    if (await deleteReview(deleteReviewTarget.id)) {
      toast.success("Performance review deleted successfully.");
      setDeleteReviewTarget(null);
    }
  };

  const confirmDeleteDisciplinary = async () => {
    if (!deleteDiscTarget) return;
    if (await deleteDisciplinary(deleteDiscTarget.id)) {
      toast.success("Disciplinary action deleted successfully.");
      setDeleteDiscTarget(null);
    }
  };

  const reviewBusy = (id: number) => processingReviewId === id;
  const discBusy = (id: number) => processingDisciplinaryId === id;

  const ratingClass = useMemo(
    () => (rating: string) => {
      if (rating === "Satisfactory") return "bg-[#00B4D8]";
      if (rating === "Excellent") return "bg-[#076935]";
      if (rating === "Good") return "bg-[#2563EB]";
      return "bg-amber-500";
    },
    [],
  );

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Performance Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Reviews, appraisals, and disciplinary records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openCreateReview}
            disabled={savingReview}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00B4D8] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0096C7] shadow-xs transition disabled:opacity-60"
          >
            {savingReview ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
            Add Review
          </button>
          <button
            type="button"
            onClick={openCreateDisciplinary}
            disabled={savingDisciplinary}
            className="inline-flex items-center gap-2 rounded-xl bg-[#DC2626] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#B91C1C] shadow-xs transition disabled:opacity-60"
          >
            {savingDisciplinary ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <AlertTriangle size={16} />
            )}
            Disciplinary Action
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6 text-sm font-semibold">
          <button
            type="button"
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
            type="button"
            onClick={() => setActiveTab("disciplinary")}
            className={`pb-3 border-b-2 transition ${
              activeTab === "disciplinary"
                ? "border-[#DC2626] text-[#DC2626] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Disciplinary Actions ({disciplinary.length})
          </button>
        </nav>
      </div>

      {activeTab === "reviews" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
          {loadingReviews ? (
            <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-gray-500">
              <Loader2 size={20} className="animate-spin text-[#00B4D8]" />
              Loading performance reviews…
            </div>
          ) : (
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
                  reviews.map((rev) => {
                    const promotion = promotionLabel(rev.promotion);
                    return (
                      <tr key={rev.id} className="hover:bg-gray-50/80 transition">
                        <td className="px-4 py-3.5 font-bold text-gray-900 text-sm">
                          {rev.employee_name ||
                            employeeNameById(employees, rev.employee_id)}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 font-medium">{rev.review_period}</td>
                        <td className="px-4 py-3.5 text-gray-600">{formatDate(rev.review_date)}</td>
                        <td className="px-4 py-3.5 text-gray-600">
                          {employeeNameById(employees, rev.reviewer_id)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex rounded-md px-3 py-1 text-xs font-bold text-white ${ratingClass(rev.overall_rating)}`}
                          >
                            {rev.overall_rating}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex rounded-md px-3 py-1 text-xs font-bold text-white ${
                              promotion === "Yes" ? "bg-[#076935]" : "bg-gray-500"
                            }`}
                          >
                            {promotion}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditReview(rev)}
                              disabled={reviewBusy(rev.id)}
                              className="rounded-lg border border-blue-200 p-1.5 text-blue-600 hover:bg-blue-50 transition disabled:opacity-50"
                              title="Edit Review"
                            >
                              {reviewBusy(rev.id) ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <Pencil size={15} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteReviewTarget(rev)}
                              disabled={reviewBusy(rev.id)}
                              className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                              title="Delete Review"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "disciplinary" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
          {loadingDisciplinary ? (
            <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-gray-500">
              <Loader2 size={20} className="animate-spin text-[#DC2626]" />
              Loading disciplinary actions…
            </div>
          ) : (
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
                {disciplinary.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      No disciplinary actions logged.
                    </td>
                  </tr>
                ) : (
                  disciplinary.map((disc) => (
                    <tr key={disc.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-4 py-3.5 font-bold text-gray-900 text-sm">
                        {disc.employee_name || employeeNameById(employees, disc.employee_id)}
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 font-medium">
                        {formatDate(disc.action_date)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                          {disc.action_type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">
                        {employeeNameById(employees, disc.issued_by)}
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 max-w-xs truncate">{disc.reason}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          {displayStatus(disc.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditDisciplinary(disc)}
                            disabled={discBusy(disc.id)}
                            className="rounded-lg border border-blue-200 p-1.5 text-blue-600 hover:bg-blue-50 transition disabled:opacity-50"
                            title="Edit Action"
                          >
                            {discBusy(disc.id) ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Pencil size={15} />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteDiscTarget(disc)}
                            disabled={discBusy(disc.id)}
                            className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
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
          )}
        </div>
      )}

      <Modal
        open={isReviewModalOpen}
        onClose={() => {
          if (savingReview || (editingReview && processingReviewId === editingReview.id)) return;
          setIsReviewModalOpen(false);
          setEditingReview(null);
        }}
        size="lg"
        title={
          <div className="text-white font-bold text-lg bg-[#00B4D8] -m-5 p-4 rounded-t-xl flex items-center gap-2">
            <TrendingUp size={20} />{" "}
            {editingReview ? "Edit Performance Review" : "Add Performance Review"}
          </div>
        }
      >
        <form onSubmit={submitReview} className="space-y-4 pt-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={reviewForm.employee_id}
                onChange={(e) => setReviewForm({ ...reviewForm, employee_id: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#00B4D8]"
              >
                <option value="">Select employee...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
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
                <option value="Q4 2026">Q4 2026</option>
                <option value="Annual 2025">Annual 2025</option>
                <option value="Annual 2026">Annual 2026</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Reviewer <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={reviewForm.reviewer_id}
                onChange={(e) => setReviewForm({ ...reviewForm, reviewer_id: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#00B4D8]"
              >
                <option value="">Select reviewer...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Rating <span className="text-red-500">*</span>
              </label>
              <select
                value={reviewForm.overall_rating}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, overall_rating: e.target.value })
                }
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
                onChange={(e) =>
                  setReviewForm({
                    ...reviewForm,
                    promotion: e.target.value as "Yes" | "No",
                  })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#00B4D8]"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Targets set</label>
              <textarea
                rows={2}
                value={reviewForm.target_set}
                onChange={(e) => setReviewForm({ ...reviewForm, target_set: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#00B4D8]"
                placeholder="Goals for this review period (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Targets achieved</label>
              <textarea
                rows={2}
                value={reviewForm.target_achieved}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, target_achieved: e.target.value })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#00B4D8]"
                placeholder="Outcomes vs targets (optional)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Strengths</label>
              <textarea
                rows={3}
                value={reviewForm.strengths}
                onChange={(e) => setReviewForm({ ...reviewForm, strengths: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#00B4D8]"
                placeholder="Key strengths demonstrated during the review"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Improvement Area</label>
              <textarea
                rows={3}
                value={reviewForm.improvement_area}
                onChange={(e) => setReviewForm({ ...reviewForm, improvement_area: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#00B4D8]"
                placeholder="Areas requiring improvement"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Recommendation</label>
              <textarea
                rows={3}
                value={reviewForm.recommendation}
                onChange={(e) => setReviewForm({ ...reviewForm, recommendation: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#00B4D8]"
                placeholder="Recommended next steps"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Overtime Hours</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={reviewForm.overtime}
                onChange={(e) => setReviewForm({ ...reviewForm, overtime: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#00B4D8]"
              />
            </div>
          </div>

                    <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsReviewModalOpen(false);
                setEditingReview(null);
              }}
              disabled={savingReview || Boolean(editingReview && processingReviewId === editingReview.id)}
              className="rounded-xl border border-gray-300 bg-gray-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-700 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingReview || Boolean(editingReview && processingReviewId === editingReview.id)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00B4D8] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0096C7] shadow-sm disabled:opacity-60"
            >
              {(savingReview || Boolean(editingReview && processingReviewId === editingReview.id)) && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {editingReview ? "Update Review" : "Save Review"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={isDiscModalOpen}
        onClose={() => {
          if (
            savingDisciplinary ||
            (editingDisciplinary && processingDisciplinaryId === editingDisciplinary.id)
          )
            return;
          setIsDiscModalOpen(false);
          setEditingDisciplinary(null);
        }}
        size="lg"
        title={
          <div className="text-white font-bold text-lg bg-[#DC2626] -m-5 p-4 rounded-t-xl flex items-center gap-2">
            <AlertTriangle size={20} />{" "}
            {editingDisciplinary ? "Edit Disciplinary Action" : "Record Disciplinary Action"}
          </div>
        }
      >
        <form onSubmit={submitDisciplinary} className="space-y-4 pt-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={discForm.employee_id}
                onChange={(e) => setDiscForm({ ...discForm, employee_id: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
              >
                <option value="">Select...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Action Type <span className="text-red-500">*</span>
              </label>
              <select
                value={discForm.action_type}
                onChange={(e) => setDiscForm({ ...discForm, action_type: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
              >
                <option value="Verbal Warning">Verbal Warning</option>
                <option value="Written Warning">Written Warning</option>
                <option value="Suspension">Suspension</option>
                <option value="Termination">Termination</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Issued By <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={discForm.issued_by}
                onChange={(e) => setDiscForm({ ...discForm, issued_by: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
              >
                <option value="">Select...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Status</label>
            <select
              value={discForm.status}
              onChange={(e) => setDiscForm({ ...discForm, status: e.target.value })}
              className="w-full sm:w-1/2 rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#DC2626]"
            >
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsDiscModalOpen(false);
                setEditingDisciplinary(null);
              }}
              disabled={
                savingDisciplinary ||
                Boolean(editingDisciplinary && processingDisciplinaryId === editingDisciplinary.id)
              }
              className="rounded-xl border border-gray-300 bg-gray-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-700 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                savingDisciplinary ||
                Boolean(editingDisciplinary && processingDisciplinaryId === editingDisciplinary.id)
              }
              className="inline-flex items-center gap-2 rounded-xl bg-[#DC2626] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#B91C1C] shadow-sm disabled:opacity-60"
            >
              {(savingDisciplinary ||
                Boolean(editingDisciplinary && processingDisciplinaryId === editingDisciplinary.id)) && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {editingDisciplinary ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        open={Boolean(deleteReviewTarget)}
        onClose={() => setDeleteReviewTarget(null)}
        onConfirm={confirmDeleteReview}
        itemName={
          deleteReviewTarget
            ? deleteReviewTarget.employee_name ||
              employeeNameById(employees, deleteReviewTarget.employee_id)
            : undefined
        }
        resourceType="performance review"
        title="Delete Performance Review"
        loading={deleteReviewTarget ? processingReviewId === deleteReviewTarget.id : false}
      />

      <ConfirmDeleteModal
        open={Boolean(deleteDiscTarget)}
        onClose={() => setDeleteDiscTarget(null)}
        onConfirm={confirmDeleteDisciplinary}
        itemName={
          deleteDiscTarget
            ? deleteDiscTarget.employee_name ||
              employeeNameById(employees, deleteDiscTarget.employee_id)
            : undefined
        }
        resourceType="disciplinary action"
        title="Delete Disciplinary Action"
        loading={deleteDiscTarget ? processingDisciplinaryId === deleteDiscTarget.id : false}
      />
    </div>
  );
}
