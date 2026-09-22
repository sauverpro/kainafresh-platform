import { useEffect, useState, useMemo } from "react";
import {
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Filter,
  Check,
  AlertTriangle,
  Clock,
  Heart,
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
export interface InsurancePolicyRecord {
  id: string;
  employee_name: string;
  employee_id: number;
  insurance_type: "Life" | "Health" | "Accident" | "Property/Crop";
  insurance_provider: string;
  policy_number: string;
  start_date: string;
  expiration_date: string;
  premium_amount: number;
  status: "Active" | "Expired" | "Pending";
  notify_days: number;
  coverage_details?: string;
}

interface EmployeeOption {
  name: string;
  department: string;
  id: string | number;
}

interface BackendInsurance {
  id: number | string;
  employee_id: number | string;
  employee_name?: string;
  employee_fullname?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  insurance_type?: string;
  type?: string;
  insurance_provider?: string;
  provider?: string;
  policy_number?: string;
  policy_no?: string;
  start_date?: string;
  expiration_date?: string;
  expiry_date?: string;
  end_date?: string;
  premium_amount?: number | string;
  premium?: number | string;
  status?: string;
  notify_days?: number | string;
  coverage_details?: string;
  coverage?: string;
}

/* ────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────── */
function normalizeInsuranceType(
  raw?: string,
): InsurancePolicyRecord["insurance_type"] {
  const v = (raw || "").toLowerCase().trim();
  if (v === "life") return "Life";
  if (v === "accident") return "Accident";
  if (v === "property" || v === "crop" || v === "property/crop")
    return "Property/Crop";
  return "Health";
}

function normalizeStatus(raw?: string): InsurancePolicyRecord["status"] {
  const v = (raw || "").toLowerCase().trim();
  if (v === "expired") return "Expired";
  if (v === "pending") return "Pending";
  return "Active";
}

function formatDateOnly(value?: string | null): string {
  if (!value) return "";
  return value.split(" ")[0];
}

function mapBackendInsurance(row: BackendInsurance): InsurancePolicyRecord {
  const employeeName =
    row.employee_name ||
    row.employee_fullname ||
    row.full_name ||
    [row.first_name, row.last_name].filter(Boolean).join(" ").trim() ||
    `Employee #${row.employee_id}`;

  return {
    id: String(row.id),
    employee_id: Number(row.employee_id),
    employee_name: employeeName,
    insurance_type: normalizeInsuranceType(row.insurance_type ?? row.type),
    insurance_provider: row.insurance_provider || row.provider || "—",
    policy_number: row.policy_number || row.policy_no || "—",
    start_date: formatDateOnly(row.start_date),
    expiration_date: formatDateOnly(
      row.expiration_date || row.expiry_date || row.end_date,
    ),
    premium_amount: Number(row.premium_amount ?? row.premium ?? 0) || 0,
    status: normalizeStatus(row.status),
    notify_days: Number(row.notify_days ?? 30) || 30,
    coverage_details: row.coverage_details || row.coverage || undefined,
  };
}

/* ────────────────────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────────────────── */
export default function Insurance() {
  usePageTitle("insurance-management", "Insurance Management");

  const [policies, setPolicies] = useState<InsurancePolicyRecord[]>([]);
  const [policiesLoading, setPoliciesLoading] = useState(true);
  const [policiesError, setPoliciesError] = useState<string | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicyRecord | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);

  /* ── Edit modal state ─────────────────────────────────────── */
  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicyRecord | null>(null);
  const [editForm, setEditForm] = useState({
    employee_id: "",
    insurance_type: "Health" as InsurancePolicyRecord["insurance_type"],
    insurance_provider: "",
    policy_number: "",
    start_date: "",
    expiration_date: "",
    status: "Active" as InsurancePolicyRecord["status"],
    premium_amount: 0,
    notify_days: 30,
    coverage_details: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  /* ── Delete modal state ───────────────────────────────────── */
  const [deletingPolicy, setDeletingPolicy] = useState<InsurancePolicyRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ── Filters ──────────────────────────────────────────────── */
  const [empFilter, setEmpFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState("all");

  /* ── Add form ─────────────────────────────────────────────── */
  const [form, setForm] = useState({
    employee_id: "",
    employee_name: "",
    insurance_type: "Health" as InsurancePolicyRecord["insurance_type"],
    insurance_provider: "",
    policy_number: "",
    start_date: new Date().toISOString().split("T")[0],
    expiration_date: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
    status: "Active" as InsurancePolicyRecord["status"],
    premium_amount: 15000,
    notify_days: 30,
    coverage_details: "",
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

          const unique = fetched.filter(
            (e, idx, self) =>
              idx ===
              self.findIndex(
                (t) =>
                  t.name.trim().toLowerCase() === e.name.trim().toLowerCase(),
              ),
          );
          setEmployeeOptions(unique);
        }
      })
      .catch(() => {});
  }, []);

  /* ──────────────────────────────────────────────────────────
   * Load insurance policies
   * ────────────────────────────────────────────────────────── */
  const loadPolicies = async () => {
    setPoliciesLoading(true);
    setPoliciesError(null);
    try {
      const res = await apiGet<{ success: boolean; data: BackendInsurance[] }>(
        "/api/insurance",
      );
      const list = Array.isArray(res?.data) ? res.data : [];
      setPolicies(list.map(mapBackendInsurance));
    } catch (err: unknown) {
      setPoliciesError(
        err instanceof Error ? err.message : "Failed to load insurance policies",
      );
    } finally {
      setPoliciesLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  /* ──────────────────────────────────────────────────────────
   * Create new policy
   * ────────────────────────────────────────────────────────── */
  const handleAddPolicySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_id) {
      toast.error("Please select an employee.");
      return;
    }
    if (!form.insurance_provider.trim()) {
      toast.error("Please enter the insurance provider.");
      return;
    }

    const selectedEmployee = employeeOptions.find(
      (emp) => String(emp.id) === String(form.employee_id),
    );

    const payload = {
      employee_id: Number(form.employee_id),
      employee_name: selectedEmployee?.name || form.employee_name || "",
      insurance_type: form.insurance_type,
      insurance_provider: form.insurance_provider.trim(),
      policy_number:
        form.policy_number.trim() || `POL-${Date.now().toString().slice(-6)}`,
      start_date: form.start_date,
      expiration_date: form.expiration_date,
      premium_amount: Number(form.premium_amount) || 0,
      status: form.status,
      notify_days: Number(form.notify_days) || 30,
      coverage_details: form.coverage_details.trim(),
    };

    try {
      const response = await apiPost<{ success?: boolean; message?: string }>(
        "/api/insurance/create",
        payload,
      );

      if (response && response.success === false) {
        throw new Error(response.message || "Failed to create insurance record");
      }

      toast.success("Insurance created successfully!");
      setIsAddOpen(false);
      setForm({
        employee_id: "",
        employee_name: "",
        insurance_type: "Health",
        insurance_provider: "",
        policy_number: "",
        start_date: new Date().toISOString().split("T")[0],
        expiration_date: new Date(Date.now() + 365 * 86400000)
          .toISOString()
          .split("T")[0],
        status: "Active",
        premium_amount: 15000,
        notify_days: 30,
        coverage_details: "",
      });

      await loadPolicies();
    } catch (error: any) {
      console.error("Failed to create Insurance:", error);
      toast.error(
        error?.message || "Failed to create insurance. Please try again.",
      );
    }
  };

  /* ──────────────────────────────────────────────────────────
   * Edit policy
   * ────────────────────────────────────────────────────────── */
  const openEditPolicy = (policy: InsurancePolicyRecord) => {
    setEditingPolicy(policy);
    setEditForm({
      employee_id: String(policy.employee_id),
      insurance_type: policy.insurance_type,
      insurance_provider: policy.insurance_provider,
      policy_number: policy.policy_number,
      start_date: policy.start_date || "",
      expiration_date: policy.expiration_date || "",
      status: policy.status,
      premium_amount: policy.premium_amount,
      notify_days: policy.notify_days,
      coverage_details: policy.coverage_details || "",
    });
  };

  const closeEditModal = () => {
    if (savingEdit) return;
    setEditingPolicy(null);
  };

  const handleEditPolicySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;

    if (!editForm.employee_id) {
      toast.error("Please select an employee.");
      return;
    }
    if (!editForm.insurance_provider.trim()) {
      toast.error("Please enter the insurance provider.");
      return;
    }

    const selectedEmployee = employeeOptions.find(
      (emp) => String(emp.id) === String(editForm.employee_id),
    );

    const payload = {
      employee_id: Number(editForm.employee_id),
      employee_name:
        selectedEmployee?.name || editingPolicy.employee_name || "",
      insurance_type: editForm.insurance_type,
      insurance_provider: editForm.insurance_provider.trim(),
      policy_number: editForm.policy_number.trim(),
      start_date: editForm.start_date,
      expiration_date: editForm.expiration_date,
      premium_amount: Number(editForm.premium_amount) || 0,
      status: editForm.status,
      notify_days: Number(editForm.notify_days) || 30,
      coverage_details: editForm.coverage_details.trim(),
    };

    setSavingEdit(true);
    try {
      const response = await apiPut<{ success?: boolean; message?: string }>(
        `/api/insurance/update/${editingPolicy.id}`,
        payload,
      );

      if (response && response.success === false) {
        throw new Error(response.message || "Failed to update insurance record");
      }

      toast.success("Insurance policy updated successfully!");
      setEditingPolicy(null);
      await loadPolicies();
    } catch (error: any) {
      console.error("Failed to update Insurance:", error);
      toast.error(
        error?.message || "Failed to update insurance. Please try again.",
      );
    } finally {
      setSavingEdit(false);
    }
  };

  /* ──────────────────────────────────────────────────────────
   * Delete policy — confirmation modal + DELETE /api/insurance/delete/{id}
   * ────────────────────────────────────────────────────────── */
  const openDeleteModal = (policy: InsurancePolicyRecord) => {
    setDeletingPolicy(policy);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeletingPolicy(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPolicy) return;

    setDeleting(true);
    try {
      const response = await apiDelete<{ success?: boolean; message?: string }>(
        `/api/insurance/delete/${deletingPolicy.id}`,
      );

      if (response && response.success === false) {
        throw new Error(response.message || "Failed to delete insurance policy");
      }

      toast.success(
        `Insurance policy for ${deletingPolicy.employee_name} deleted.`,
      );
      setDeletingPolicy(null);
      await loadPolicies();
    } catch (error: any) {
      console.error("Failed to delete Insurance:", error);
      toast.error(
        error?.message || "Failed to delete insurance. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  /* ──────────────────────────────────────────────────────────
   * Filtering
   * ────────────────────────────────────────────────────────── */
  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      if (empFilter !== "all" && String(p.employee_id) !== String(empFilter))
        return false;
      if (typeFilter !== "all" && p.insurance_type !== typeFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (expiryFilter === "expiring_30") {
        const daysLeft = Math.ceil(
          (new Date(p.expiration_date).getTime() - Date.now()) /
            (1000 * 3600 * 24),
        );
        if (daysLeft < 0 || daysLeft > 30) return false;
      } else if (expiryFilter === "expired") {
        const daysLeft = Math.ceil(
          (new Date(p.expiration_date).getTime() - Date.now()) /
            (1000 * 3600 * 24),
        );
        if (daysLeft >= 0) return false;
      }
      return true;
    });
  }, [policies, empFilter, typeFilter, statusFilter, expiryFilter]);

  /* ──────────────────────────────────────────────────────────
   * Stats
   * ────────────────────────────────────────────────────────── */
  const activeCount = policies.filter((p) => p.status === "Active").length;
  const expiredCount = policies.filter((p) => {
    const daysLeft = Math.ceil(
      (new Date(p.expiration_date).getTime() - Date.now()) / (1000 * 3600 * 24),
    );
    return daysLeft < 0 || p.status === "Expired";
  }).length;
  const expiringSoonCount = policies.filter((p) => {
    const daysLeft = Math.ceil(
      (new Date(p.expiration_date).getTime() - Date.now()) / (1000 * 3600 * 24),
    );
    return daysLeft >= 0 && daysLeft <= 30;
  }).length;

  /* ──────────────────────────────────────────────────────────
   * Render
   * ────────────────────────────────────────────────────────── */
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Insurance Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track employee insurance policies, premiums, provider details, and
            expiry alerts.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#055028] shadow-xs transition"
        >
          <Plus size={16} /> Add Insurance Record
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Policies"
          value={`${policies.length}`}
          subtext="Enrolled insurance policies"
          icon={<ShieldCheck size={22} className="text-[#076935]" />}
          iconBg="bg-[#076935]/10"
          badgeText="Total Policies"
          badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
        />
        <MetricCard
          label="Active Policies"
          value={`${activeCount}`}
          subtext="Valid coverage plans"
          icon={<Heart size={22} className="text-blue-600" />}
          iconBg="bg-blue-50"
          badgeText="Active"
          badgeColor="bg-blue-50 text-blue-700 border-blue-200"
        />
        <MetricCard
          label="Expiring in 30 Days"
          value={`${expiringSoonCount}`}
          subtext="Awaiting renewal"
          icon={<Clock size={22} className="text-amber-600" />}
          iconBg="bg-amber-50"
          badgeText="Expiry Warning"
          badgeColor="bg-amber-50 text-amber-700 border-amber-200"
        />
        <MetricCard
          label="Expired Policies"
          value={`${expiredCount}`}
          subtext="Overdue for renewal"
          icon={<AlertTriangle size={22} className="text-rose-600" />}
          iconBg="bg-rose-50"
          badgeText="Expired"
          badgeColor="bg-rose-50 text-rose-700 border-rose-200"
        />
      </div>

      {/* Error banner */}
      {policiesError && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Could not load insurance policies</p>
            <p>{policiesError}</p>
          </div>
          <button
            onClick={loadPolicies}
            className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 font-bold text-rose-700 hover:bg-rose-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Employee
          </label>
          <select
            value={empFilter}
            onChange={(e) => setEmpFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-2 text-xs font-medium outline-none focus:border-[#076935]"
          >
            <option value="all">All Employees</option>
            {employeeOptions.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[130px]">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-2 text-xs font-medium outline-none focus:border-[#076935]"
          >
            <option value="all">All Types</option>
            <option value="Life">Life</option>
            <option value="Health">Health</option>
            <option value="Accident">Accident</option>
            <option value="Property/Crop">Property/Crop</option>
          </select>
        </div>

        <div className="flex-1 min-w-[130px]">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-2 text-xs font-medium outline-none focus:border-[#076935]"
          >
            <option value="all">All</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="flex-1 min-w-[140px]">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Expiry
          </label>
          <select
            value={expiryFilter}
            onChange={(e) => setExpiryFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-2 text-xs font-medium outline-none focus:border-[#076935]"
          >
            <option value="all">All</option>
            <option value="expiring_30">Expiring in 30 Days</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div className="flex items-end gap-2 pt-4">
          <button
            onClick={() => toast.info("Filter applied")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition"
          >
            <Filter size={14} /> Filter
          </button>
          <button
            onClick={() => {
              setEmpFilter("all");
              setTypeFilter("all");
              setStatusFilter("all");
              setExpiryFilter("all");
            }}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Provider</th>
                <th className="px-4 py-3.5">Policy No.</th>
                <th className="px-4 py-3.5">Premium (RWF)</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Expiry</th>
                <th className="px-4 py-3.5 text-center">Notify (days)</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {policiesLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    Loading insurance policies…
                  </td>
                </tr>
              ) : filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    No insurance policies matching criteria.
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((pol) => {
                  const daysLeft = pol.expiration_date
                    ? Math.ceil(
                        (new Date(pol.expiration_date).getTime() - Date.now()) /
                          (1000 * 3600 * 24),
                      )
                    : 0;
                  const isExpired = daysLeft < 0;

                  return (
                    <tr key={pol.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-4 py-3.5 font-bold text-gray-900 text-sm">
                        {pol.employee_name}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${
                            pol.insurance_type === "Life"
                              ? "bg-sky-100 text-sky-800"
                              : pol.insurance_type === "Health"
                                ? "bg-cyan-100 text-cyan-800"
                                : "bg-teal-100 text-teal-800"
                          }`}
                        >
                          {pol.insurance_type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-gray-800">
                        {pol.insurance_provider}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-gray-600">
                        {pol.policy_number}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-[#076935]">
                        {pol.premium_amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-md px-3 py-1 text-xs font-bold text-white ${
                            pol.status === "Active"
                              ? "bg-[#076935]"
                              : pol.status === "Pending"
                                ? "bg-amber-500"
                                : "bg-rose-600"
                          }`}
                        >
                          {pol.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium">
                        {isExpired ? (
                          <span className="text-rose-600 font-bold">
                            Expired {Math.abs(daysLeft)}d ago
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold">
                            {pol.expiration_date}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-gray-700">
                        {pol.notify_days}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPolicy(pol)}
                            className="rounded-lg border border-blue-200 p-1.5 text-blue-600 hover:bg-blue-50 transition"
                            title="View Policy Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openEditPolicy(pol)}
                            className="rounded-lg border border-blue-200 p-1.5 text-blue-600 hover:bg-blue-50 transition"
                            title="Edit Policy"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(pol)}
                            className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Policy"
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
        </div>

        {!policiesLoading && filteredPolicies.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
            Showing {filteredPolicies.length} of {policies.length} policies
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────
       * Add Insurance Modal
       * ───────────────────────────────────────────── */}
      <Modal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        size="lg"
        title={
          <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg">
            <div className="p-2 rounded-xl bg-[#076935]/10 text-[#076935]">
              <ShieldCheck size={20} />
            </div>
            <span>Add Insurance Record</span>
          </div>
        }
      >
        <form onSubmit={handleAddPolicySubmit} className="space-y-4 pt-2 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.employee_id}
                onChange={(e) =>
                  setForm({ ...form, employee_id: e.target.value })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
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
                Insurance Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.insurance_type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    insurance_type: e.target.value as any,
                  })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
              >
                <option value="">Select type...</option>
                <option value="Health">Health</option>
                <option value="Life">Life</option>
                <option value="Accident">Accident</option>
                <option value="Property/Crop">Property/Crop</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Provider <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. RSSB, Radiant Insurance, Sanlam, UAP"
                value={form.insurance_provider}
                onChange={(e) =>
                  setForm({ ...form, insurance_provider: e.target.value })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Policy Number
              </label>
              <input
                type="text"
                placeholder="e.g. POL-2024-00123"
                value={form.policy_number}
                onChange={(e) =>
                  setForm({ ...form, policy_number: e.target.value })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.expiration_date}
                onChange={(e) =>
                  setForm({ ...form, expiration_date: e.target.value })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
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
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Premium Amount (RWF)
              </label>
              <input
                type="number"
                min="0"
                placeholder="0.00"
                value={form.premium_amount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    premium_amount: Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Notify Days Before Expiry
              </label>
              <input
                type="number"
                min="1"
                value={form.notify_days}
                onChange={(e) =>
                  setForm({ ...form, notify_days: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Coverage Details
            </label>
            <textarea
              rows={3}
              placeholder="Describe what is covered under this policy..."
              value={form.coverage_details}
              onChange={(e) =>
                setForm({ ...form, coverage_details: e.target.value })
              }
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#055028] shadow-xs transition"
            >
              <Check size={16} /> Save Record
            </button>
          </div>
        </form>
      </Modal>

      {/* ─────────────────────────────────────────────
       * Edit Insurance Modal
       * ───────────────────────────────────────────── */}
      <Modal
        open={Boolean(editingPolicy)}
        onClose={closeEditModal}
        size="lg"
        title={
          <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Pencil size={20} />
            </div>
            <span>
              Edit Insurance Record
              {editingPolicy ? ` · #${editingPolicy.id}` : ""}
            </span>
          </div>
        }
      >
        {editingPolicy && (
          <form
            onSubmit={handleEditPolicySubmit}
            className="space-y-4 pt-2 text-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Employee <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={editForm.employee_id}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      employee_id: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
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
                  Insurance Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={editForm.insurance_type}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      insurance_type: e.target.value as any,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
                >
                  <option value="Health">Health</option>
                  <option value="Life">Life</option>
                  <option value="Accident">Accident</option>
                  <option value="Property/Crop">Property/Crop</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Provider <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.insurance_provider}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      insurance_provider: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Policy Number
                </label>
                <input
                  type="text"
                  value={editForm.policy_number}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      policy_number: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={editForm.start_date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, start_date: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={editForm.expiration_date}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      expiration_date: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
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
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
                >
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Premium Amount (RWF)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editForm.premium_amount}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      premium_amount: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Notify Days Before Expiry
                </label>
                <input
                  type="number"
                  min="1"
                  value={editForm.notify_days}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      notify_days: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Coverage Details
              </label>
              <textarea
                rows={3}
                value={editForm.coverage_details}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    coverage_details: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
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
                className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#055028] shadow-xs transition disabled:opacity-60"
              >
                {savingEdit ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check size={16} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ─────────────────────────────────────────────
       * Delete Insurance Modal
       * ───────────────────────────────────────────── */}
      <Modal
        open={Boolean(deletingPolicy)}
        onClose={closeDeleteModal}
        size="sm"
        showCloseIcon={!deleting}
        title={
          <div className="flex items-center justify-center gap-2.5 text-gray-900 font-bold text-lg">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Trash2 size={18} />
            </div>
            <span>Delete Insurance Policy</span>
          </div>
        }
      >
        {deletingPolicy && (
          <div className="space-y-4 pt-1 text-sm">
            <p className="text-gray-600 leading-relaxed text-center">
              Are you sure you want to delete the insurance policy for{" "}
              <strong className="text-gray-900">
                {deletingPolicy.employee_name}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1.5">
              <p>
                <strong className="text-gray-700">Policy No:</strong>{" "}
                <span className="font-mono text-gray-800">
                  {deletingPolicy.policy_number}
                </span>
              </p>
              <p>
                <strong className="text-gray-700">Provider:</strong>{" "}
                {deletingPolicy.insurance_provider}
              </p>
              <p>
                <strong className="text-gray-700">Type:</strong>{" "}
                {deletingPolicy.insurance_type}
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
                    <Trash2 size={15} /> Delete Policy
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─────────────────────────────────────────────
       * Policy Details Modal
       * ───────────────────────────────────────────── */}
      <Modal
        open={Boolean(selectedPolicy)}
        onClose={() => setSelectedPolicy(null)}
        size="md"
        title={
          <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg">
            <div className="p-2 rounded-xl bg-[#076935]/10 text-[#076935]">
              <ShieldCheck size={20} />
            </div>
            <span>Insurance Policy Details</span>
          </div>
        }
      >
        {selectedPolicy && (
          <div className="space-y-5 text-sm pt-1">
            <div className="p-4 bg-gradient-to-r from-[#F4FAF7] to-emerald-50/40 rounded-2xl border border-[#076935]/20 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-[#076935] text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {selectedPolicy.employee_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {selectedPolicy.employee_name}
                  </h3>
                  <p className="text-xs font-medium text-gray-500">
                    {selectedPolicy.insurance_provider} ·{" "}
                    <span className="font-semibold text-[#076935]">
                      {selectedPolicy.insurance_type} Policy
                    </span>
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 shadow-2xs">
                {selectedPolicy.policy_number}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Policy Type
                </span>
                <span className="inline-flex rounded-md bg-cyan-100/70 px-2.5 py-0.5 text-xs font-bold text-cyan-800">
                  {selectedPolicy.insurance_type}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Status
                </span>
                <span className="inline-flex rounded-md bg-[#076935] px-3 py-0.5 text-xs font-bold text-white">
                  {selectedPolicy.status}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Start & Expiry Date
                </span>
                <p className="font-semibold text-gray-800 text-xs">
                  {selectedPolicy.start_date}{" "}
                  <span className="text-gray-400 font-normal">to</span>{" "}
                  <span className="text-emerald-700 font-bold">
                    {selectedPolicy.expiration_date}
                  </span>
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Monthly Premium
                </span>
                <p className="font-bold text-[#076935] text-xs">
                  {selectedPolicy.premium_amount.toLocaleString()} RWF
                </p>
              </div>
            </div>

            {selectedPolicy.coverage_details && (
              <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-1">
                <span className="text-xs font-bold text-gray-500 block mb-1">
                  Coverage Scope & Details:
                </span>
                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {selectedPolicy.coverage_details}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => setSelectedPolicy(null)}
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