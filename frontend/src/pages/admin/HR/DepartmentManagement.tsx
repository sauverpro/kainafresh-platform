import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Building2,
  Users,
  Banknote,
  Plus,
  Search,
  Pencil,
  Trash2,
  Briefcase,
  User,
  Landmark,

  Loader2,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";
import MetricCard from "../../../components/ui/MetricCard";
import {
  useDepartmentStore,
  type Department,
} from "../../../store/useDepartmentStore";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../api/client";

type EmployeeOption = {
  id: string;
  name: string;
  email: string;
  title: string;
};

type DepartmentApiResponse = {
  id: string | number;
  code?: string;
  name?: string;
  HOD_name?: string;
  HOD_email?: string;
  HOD_emai?: string;
  staff_count?: number | string;
  capacity?: number | string;
  monthly_budget_rwf?: number | string;
  location?: string;
  status?: Department["status"];
  Dep_description?: string;
  description?: string;
};

const DEFAULT_EMPLOYEES: EmployeeOption[] = [];

const DEFAULT_DESCRIPTION =
  "Operational division under KainaFresh organizational structure.";

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapDepartment(d: DepartmentApiResponse): Department {
  return {
    id: `DEP-${d.id}`,
    code: d.code || `KF-DEP-${d.id}`,
    name: d.name || "Unnamed Department",
    lead_name: d.HOD_name || "Unassigned",
    lead_email: d.HOD_email || d.HOD_emai || "",
    staff_count: toNumber(d.staff_count, 0),
    capacity: toNumber(d.capacity, 10),
    monthly_budget_rwf: toNumber(d.monthly_budget_rwf, 0),
    location: d.location || "Kigali HQ",
    status: d.status || "Active",
    description: d.Dep_description || d.description || "",
  };
}

function getRawDepartmentId(id: string | number): string {
  return String(id).replace(/^DEP-/, "");
}

function deduplicateDepartments(departments: Department[]): Department[] {
  return departments.filter(
    (department, index, list) =>
      index ===
      list.findIndex(
        (item) =>
          String(item.id) === String(department.id) ||
          (item.name &&
            department.name &&
            item.name.trim().toLowerCase() ===
              department.name.trim().toLowerCase()),
      ),
  );
}

function deduplicateEmployees(employees: EmployeeOption[]): EmployeeOption[] {
  return employees.filter(
    (employee, index, list) =>
      index ===
      list.findIndex(
        (item) =>
          String(item.id) === String(employee.id) ||
          (item.email &&
            employee.email &&
            item.email.trim().toLowerCase() ===
              employee.email.trim().toLowerCase()),
      ),
  );
}

export default function DepartmentManagement() {
  usePageTitle("department-management", "Department Management");

  const {
    departments,
    setDepartments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
  } = useDepartmentStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [employeesList, setEmployeesList] =
    useState<EmployeeOption[]>(DEFAULT_EMPLOYEES);

  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [addForm, setAddForm] = useState({
    name: "",
    code: "",
    lead_name: "",
    lead_email: "",
    staff_count: 5,
    capacity: 15,
    monthly_budget_rwf: 2000000,
    location: "Kigali HQ",
    status: "Active" as Department["status"],
    description: "",
  });

  const [editForm, setEditForm] = useState<Department | null>(null);

  const loadDepartments = async () => {
    try {
      const res = await apiGet<{
        success: boolean;
        data: DepartmentApiResponse[];
      }>("/api/departments");

      if (res?.success && Array.isArray(res.data)) {
        setDepartments(deduplicateDepartments(res.data.map(mapDepartment)));
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error("Failed to load departments:", error);
      toast.error("Failed to load departments.");
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await apiGet<{ success: boolean; data: any[] }>(
        "/api/employees",
      );

      if (res?.success && Array.isArray(res.data)) {
        const mapped: EmployeeOption[] = res.data.map((emp: any) => ({
          id: String(emp.id),
          name:
            emp.fullname ||
            `${emp.first_name || ""} ${emp.last_name || ""}`.trim() ||
            "Unnamed Employee",
          email: emp.email || "",
          title: emp.job_title || "Staff Member",
        }));

        setEmployeesList(deduplicateEmployees(mapped));
      } else {
        setEmployeesList([]);
      }
    } catch (error) {
      console.error("Failed to load employees:", error);
      setEmployeesList([]);
    }
  };

  useEffect(() => {
    void Promise.all([loadDepartments(), loadEmployees()]);
  }, []);

  const resetAddForm = () => {
    setAddForm({
      name: "",
      code: "",
      lead_name: "",
      lead_email: "",
      staff_count: 5,
      capacity: 15,
      monthly_budget_rwf: 2000000,
      location: "Kigali HQ",
      status: "Active",
      description: "",
    });
  };

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return departments.filter((dept) => {
      if (statusFilter !== "all" && dept.status !== statusFilter) {
        return false;
      }

      if (!query) return true;

      return (
        dept.name.toLowerCase().includes(query) ||
        dept.code.toLowerCase().includes(query) ||
        dept.lead_name.toLowerCase().includes(query) ||
        dept.location.toLowerCase().includes(query)
      );
    });
  }, [departments, search, statusFilter]);

  const stats = useMemo(() => {
    const totalDepts = departments.length;
    const totalStaff = departments.reduce(
      (sum, department) => sum + toNumber(department.staff_count),
      0,
    );
    const totalBudget = departments.reduce(
      (sum, department) => sum + toNumber(department.monthly_budget_rwf),
      0,
    );
    const totalCapacity = departments.reduce(
      (sum, department) => sum + toNumber(department.capacity),
      0,
    );

    return { totalDepts, totalStaff, totalBudget, totalCapacity };
  }, [departments]);

  const handleAddDepartment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = addForm.name.trim();

    if (!name) {
      toast.error("Department name is required.");
      return;
    }

    const code =
      addForm.code.trim() ||
      `KF-DEP-${name
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 4)
        .toUpperCase()}`;

    const payload = {
      name,
      code,
      HOD_name: addForm.lead_name.trim(),
      HOD_email: addForm.lead_email.trim(),
      staff_count: Math.max(0, toNumber(addForm.staff_count)),
      capacity: Math.max(0, toNumber(addForm.capacity)),
      monthly_budget_rwf: Math.max(0, toNumber(addForm.monthly_budget_rwf)),
      location: addForm.location.trim() || "Kigali HQ",
      status: addForm.status,
      Dep_description: addForm.description.trim() || DEFAULT_DESCRIPTION,
    };

    setIsSaving(true);

    try {
      const response = await apiPost("/api/departments", payload);

      await loadDepartments();

      setIsAddOpen(false);
      resetAddForm();
      toast.success(`Department ${name} created successfully!`);
    } catch (error: any) {
      console.error("Failed to create department:", error);
      toast.error(
        error?.message || "Failed to create department. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = (dept: Department) => {
    setSelectedDept(null);
    setEditingDept(dept);
    setEditForm({ ...dept });
  };

  const handleSaveEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editForm) return;

    const name = editForm.name.trim();

    if (!name) {
      toast.error("Department name is required.");
      return;
    }

    const rawId = getRawDepartmentId(editForm.id);

    if (!rawId) {
      toast.error("Invalid department ID.");
      return;
    }

    const payload = {
      name,
      code: editForm.code.trim(),
      HOD_name: editForm.lead_name.trim(),
      HOD_email: editForm.lead_email.trim(),
      staff_count: Math.max(0, toNumber(editForm.staff_count)),
      capacity: Math.max(0, toNumber(editForm.capacity)),
      monthly_budget_rwf: Math.max(
        0,
        toNumber(editForm.monthly_budget_rwf),
      ),
      location: editForm.location.trim() || "Kigali HQ",
      status: editForm.status,
      Dep_description: editForm.description.trim() || DEFAULT_DESCRIPTION,
    };

    setIsSaving(true);

    try {
      const response = await apiPut(`/api/departments/${rawId}`, payload);

      await loadDepartments();

      setEditingDept(null);
      setEditForm(null);
      toast.success(`Updated department details for ${name}!`);
    } catch (error: any) {
      console.error("Failed to update department:", error);
      toast.error(
        error?.message || "Failed to update department. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDepartment = async (dept: Department) => {
    const rawId = getRawDepartmentId(dept.id);

    if (!rawId) {
      toast.error("Invalid department ID.");
      return;
    }

    setIsDeleting(true);

    try {
      // apiDelete is expected to throw for non-2xx API responses.
      await apiDelete(`/api/departments/${rawId}`);

      deleteDepartment(dept.id);

      if (selectedDept?.id === dept.id) {
        setSelectedDept(null);
      }

      if (editingDept?.id === dept.id) {
        setEditingDept(null);
        setEditForm(null);
      }

      setDeleteTarget(null);
      await loadDepartments();
      toast.success(`Department ${dept.name} deleted successfully.`);
    } catch (error: any) {
      console.error("Failed to delete department:", error);
      toast.error(
        error?.message || "Failed to delete department. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteDepartment = () => {
    if (!deleteTarget) return;
    void handleDeleteDepartment(deleteTarget);
  };

  const handleOpenAdd = () => {
    resetAddForm();
    setIsAddOpen(true);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Department Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Structure organizational units, assign division heads.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#055028]"
        >
          <Plus size={16} /> Add New Department
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Departments"
          value={stats.totalDepts}
          unit="units"
          subtext={
            stats.totalDepts > 0
              ? "Active operational divisions"
              : "No departments recorded"
          }
          icon={<Building2 size={22} className="text-[#076935]" />}
          iconBg="bg-[#076935]/10"
          badgeText="Operational"
          badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
        />

        <MetricCard
          label="Assigned Headcount"
          value={stats.totalStaff}
          unit="staff"
          subtext={
            stats.totalStaff > 0
              ? `Personnel across ${stats.totalDepts} divisions`
              : "No staff assigned"
          }
          icon={<Users size={22} className="text-blue-600" />}
          iconBg="bg-blue-50"
          badgeText="Active Workforce"
          badgeColor="bg-blue-50 text-blue-700 border-blue-200"
        />

        <MetricCard
          label="Total Capacity Limit"
          value={stats.totalCapacity}
          unit="Slots"
          subtext="Department capacity ceiling"
          icon={<Landmark size={22} className="text-purple-600" />}
          iconBg="bg-purple-50"
          badgeText="Staff Capacity"
          badgeColor="bg-purple-50 text-purple-700 border-purple-200"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#076935]/10 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px]">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search department, code, lead or location..."
              className="w-full rounded-md border border-gray-300 bg-gray-50/50 pl-9 pr-3 py-2 text-xs text-gray-900 outline-none focus:border-[#076935] focus:bg-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#076935]"
          >
            <option value="all">All Department Statuses</option>
            <option value="Active">Active</option>
            <option value="Reorganizing">Reorganizing</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="text-xs text-gray-500 font-semibold">
          Showing{" "}
          <span className="text-gray-900 font-bold">
            {filteredDepartments.length}
          </span>{" "}
          of {departments.length} departments
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDepartments.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#076935] mb-3">
              <Building2 size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              No Departments Recorded
            </h3>
            <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
              There are currently no operational departments in the database.
              Click "Add New Department" to create your first organizational
              division.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#055028] transition"
              >
                <Plus size={15} /> Add New Department
              </button>
            </div>
          </div>
        ) : (
          filteredDepartments.map((dept) => (
            <div
              key={dept.id}
              className="group rounded-2xl border border-[#076935]/15 bg-white overflow-hidden transition hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="bg-[#F4FAF7] p-4 border-b border-[#076935]/10 flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-gray-500">
                      {dept.code}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-[#076935] transition leading-snug mt-0.5">
                      {dept.name}
                    </h3>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
                      dept.status === "Active"
                        ? "bg-emerald-100/80 text-emerald-800 border border-emerald-200"
                        : dept.status === "Inactive"
                          ? "bg-gray-100 text-gray-700 border border-gray-200"
                          : "bg-amber-100/80 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {dept.status}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2.5 text-sm">
                    <User size={19} className="text-[#076935] shrink-0" />
                    <span className="text-gray-500 font-medium">Lead:</span>
                    <span className="text-gray-900 font-bold text-sm truncate">
                      {dept.lead_name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4">
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDept(dept)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-gray-900 transition"
                  >
                    <Briefcase size={14} /> Full Details
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(dept)}
                      className="inline-flex items-center gap-1 rounded-md bg-[#F39927]/10 px-3 py-1.5 text-xs font-bold text-[#F39927] hover:bg-[#F39927] hover:text-white transition"
                    >
                      <Pencil size={13} /> Edit
                    </button>

                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setDeleteTarget(dept)}
                      className="inline-flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        open={Boolean(selectedDept)}
        onClose={() => setSelectedDept(null)}
        size="lg"
        title="Department Overview & Structure"
      >
        {selectedDept && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4 bg-[#F4FAF7] p-4 rounded-2xl border border-[#076935]/15">
              <div className="min-w-0">
                <span className="text-xs font-mono font-bold text-gray-400">
                  {selectedDept.code}
                </span>
                <h2
                  className="text-xl font-bold text-gray-900"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {selectedDept.name}
                </h2>
                <p className="text-xs text-[#076935] font-medium mt-0.5">
                  Primary Location: {selectedDept.location}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleStartEdit(selectedDept)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#F39927] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#d8821a] transition"
                >
                  <Pencil size={14} /> Edit Department
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(selectedDept)}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition disabled:opacity-50"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200">
              {selectedDept.description || "No description provided."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 rounded-xl border p-3">
                <p className="font-bold text-gray-700 uppercase tracking-wide">
                  Division Head
                </p>
                <p>
                  <strong>Lead Name:</strong> {selectedDept.lead_name}
                </p>
                <p className="break-all">
                  <strong>Official Email:</strong>{" "}
                  {selectedDept.lead_email || "Not assigned"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      selectedDept.status === "Active"
                        ? "font-bold text-emerald-700"
                        : "font-bold text-amber-700"
                    }
                  >
                    {selectedDept.status}
                  </span>
                </p>
              </div>

              <div className="space-y-2 rounded-xl border p-3 bg-emerald-50/50 border-emerald-200">
                <p className="font-bold text-emerald-900 uppercase tracking-wide">
                  Financial & Headcount Metrics
                </p>
                <p>
                  <strong>Staff Count:</strong> {selectedDept.staff_count}{" "}
                  Active Employees
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        size="sm"
        title="Delete Department"
      >
        {deleteTarget && (
          <div className="space-y-5">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <Trash2 size={19} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Delete {deleteTarget.name}?
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    This will permanently remove the department and its
                    configuration from the system. This action cannot be
                    undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteDepartment}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={14} />
                {isDeleting ? "Deleting..." : "Delete Department"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={isAddOpen}
        onClose={() => {
          if (!isSaving) setIsAddOpen(false);
        }}
        size="lg"
        title="Create New Department"
      >
        <form onSubmit={handleAddDepartment} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700">
                Department Name *
              </label>
              <input
                type="text"
                required
                value={addForm.name}
                onChange={(e) =>
                  setAddForm({ ...addForm, name: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                placeholder="e.g. Agronomy & Soil Research"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700">
                Department Lead Manager (Optional)
              </label>
              <select
                value={addForm.lead_name}
                onChange={(e) => {
                  const val = e.target.value;
                  const matched = employeesList.find(
                    (emp) => emp.name === val,
                  );

                  setAddForm({
                    ...addForm,
                    lead_name: val,
                    lead_email: matched?.email || "",
                  });
                }}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2.5 text-xs text-gray-900 outline-none focus:border-[#076935]"
              >
                <option value="">
                  -- Select Employee as Department Lead --
                </option>
                {employeesList.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} — {emp.title}
                    {emp.email ? ` (${emp.email})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-gray-700">Lead Email</label>
              <input
                type="email"
                readOnly
                value={addForm.lead_email}
                className="mt-1 w-full rounded-md border border-gray-200 bg-gray-100/80 p-2.5 text-xs text-gray-700 outline-none cursor-not-allowed"
                placeholder="Auto-filled from selected employee profile"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700">Description</label>
            <textarea
              rows={3}
              value={addForm.description}
              onChange={(e) =>
                setAddForm({ ...addForm, description: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
              placeholder="Describe core duties and operations..."
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setIsAddOpen(false)}
              className="rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-[#076935] px-4 py-2 font-bold text-white hover:bg-[#055028] disabled:opacity-50"
            >
              {isSaving ? "Creating..." : "Create Department"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(editingDept && editForm)}
        onClose={() => {
          if (!isSaving) {
            setEditingDept(null);
            setEditForm(null);
          }
        }}
        size="lg"
        title={`Edit Department: ${editingDept?.name || ""}`}
      >
        {editForm && (
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-700">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">
                  Department Code
                </label>
                <input
                  type="text"
                  value={editForm.code}
                  onChange={(e) =>
                    setEditForm({ ...editForm, code: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">
                  Department Lead Manager (Optional)
                </label>
                <select
                  value={editForm.lead_name}
                  onChange={(e) => {
                    const val = e.target.value;
                    const matched = employeesList.find(
                      (emp) => emp.name === val,
                    );

                    setEditForm({
                      ...editForm,
                      lead_name: val,
                      lead_email: matched?.email || "",
                    });
                  }}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2.5 text-xs text-gray-900 outline-none focus:border-[#076935]"
                >
                  <option value="">
                    -- Select Employee as Department Lead --
                  </option>
                  {employeesList.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name} — {emp.title}
                      {emp.email ? ` (${emp.email})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700">Lead Email</label>
                <input
                  type="email"
                  readOnly
                  value={editForm.lead_email}
                  className="mt-1 w-full rounded-md border border-gray-200 bg-gray-100/80 p-2.5 text-xs text-gray-700 outline-none cursor-not-allowed"
                  placeholder="Auto-filled from selected employee profile"
                />
              </div>

            </div>

            <div>
              <label className="font-bold text-gray-700">
                Department Description
              </label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setEditingDept(null);
                  setEditForm(null);
                }}
                className="rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-[#076935] px-4 py-2 font-bold text-white hover:bg-[#055028] disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
