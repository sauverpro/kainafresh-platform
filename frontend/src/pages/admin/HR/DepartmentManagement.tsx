import { useState, useMemo, useEffect } from "react";
import {
  Building2,
  Users,
  Banknote,
  Plus,
  Search,
  Pencil,
  Briefcase,
  User,
  Landmark,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";
import MetricCard from "../../../components/ui/MetricCard";
import { useDepartmentStore, type Department } from "../../../store/useDepartmentStore";
import { apiGet } from "../../../api/client";

const DEFAULT_EMPLOYEES: Array<{ id: string; name: string; email: string; title: string }> = [];

export default function DepartmentManagement() {
  usePageTitle("department-management", "Department Management");

  const { departments, setDepartments, addDepartment, updateDepartment } = useDepartmentStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [employeesList, setEmployeesList] = useState<Array<{ id: string; name: string; email: string; title: string }>>(DEFAULT_EMPLOYEES);

  useEffect(() => {
    apiGet<{ success: boolean; data: any[] }>("/api/departments")
      .then((res) => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: Department[] = res.data.map((d: any) => ({
            id: `DEP-${d.id}`,
            code: d.code || `KF-DEP-${d.id}`,
            name: d.name,
            lead_name: d.lead_name || "Unassigned",
            lead_email: d.lead_email || "",
            staff_count: Number(d.staff_count) || 0,
            capacity: Number(d.capacity) || 10,
            monthly_budget_rwf: Number(d.monthly_budget_rwf) || 0,
            location: d.location || "Kigali HQ",
            status: d.status || "Active",
            description: d.description || "",
          }));
          const uniqueDepts = mapped.filter(
            (d, idx, self) =>
              idx ===
              self.findIndex(
                (t) =>
                  String(t.id) === String(d.id) ||
                  (t.name && d.name && t.name.trim().toLowerCase() === d.name.trim().toLowerCase()),
              ),
          );
          setDepartments(uniqueDepts);
        } else {
          setDepartments([]);
        }
      })
      .catch(() => {
        setDepartments([]);
      });

    apiGet<{ success: boolean; data: any[] }>("/api/employees")
      .then((res) => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((emp: any) => ({
            id: String(emp.id),
            name: emp.fullname || `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
            email: emp.email || "",
            title: emp.job_title || "Staff Member",
          }));
          const uniqueEmps = mapped.filter(
            (emp, idx, self) =>
              idx ===
              self.findIndex(
                (t) =>
                  String(t.id) === String(emp.id) ||
                  (t.email && emp.email && t.email.trim().toLowerCase() === emp.email.trim().toLowerCase()),
              ),
          );
          setEmployeesList(uniqueEmps);
        } else {
          setEmployeesList([]);
        }
      })
      .catch(() => {
        setEmployeesList([]);
      });
  }, [setDepartments]);

  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // Add Form State
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

  // Edit Form State
  const [editForm, setEditForm] = useState<Department | null>(null);

  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      if (statusFilter !== "all" && dept.status !== statusFilter) return false;
      if (!search.trim()) return true;

      const q = search.toLowerCase();
      return (
        dept.name.toLowerCase().includes(q) ||
        dept.code.toLowerCase().includes(q) ||
        dept.lead_name.toLowerCase().includes(q) ||
        dept.location.toLowerCase().includes(q)
      );
    });
  }, [departments, search, statusFilter]);

  const stats = useMemo(() => {
    const totalDepts = departments.length;
    const totalStaff = departments.reduce((sum, d) => sum + d.staff_count, 0);
    const totalBudget = departments.reduce((sum, d) => sum + d.monthly_budget_rwf, 0);
    return { totalDepts, totalStaff, totalBudget };
  }, [departments]);

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      toast.error("Department name is required.");
      return;
    }

    const newDept = addDepartment({
      code: addForm.code.trim() || `KF-DEP-${addForm.name.substring(0, 4).toUpperCase()}`,
      name: addForm.name.trim(),
      lead_name: addForm.lead_name.trim(),
      lead_email: addForm.lead_email.trim() || `${addForm.lead_name.toLowerCase().replace(" ", ".")}@kainafresh.rw`,
      staff_count: Number(addForm.staff_count),
      capacity: Number(addForm.capacity),
      monthly_budget_rwf: Number(addForm.monthly_budget_rwf),
      location: addForm.location.trim(),
      status: addForm.status,
      description: addForm.description.trim() || "Operational division under KainaFresh organizational structure.",
    });

    setIsAddOpen(false);
    toast.success(`Department ${newDept.name} created successfully!`);
  };

  const handleStartEdit = (dept: Department) => {
    setEditingDept(dept);
    setEditForm(JSON.parse(JSON.stringify(dept)));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    if (!editForm.name.trim()) {
      toast.error("Department name is required.");
      return;
    }

    updateDepartment(editForm);
    if (selectedDept?.id === editForm.id) {
      setSelectedDept(editForm);
    }
    setEditingDept(null);
    toast.success(`Updated department details for ${editForm.name}!`);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
            Department Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Structure organizational units, assign division heads, monitor staff capacity, and manage operational budgets.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#055028]"
        >
          <Plus size={16} /> Add New Department
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Departments"
          value={stats.totalDepts}
          unit="units"
          subtext={stats.totalDepts > 0 ? "Active operational divisions" : "No departments recorded"}
          icon={<Building2 size={22} className="text-[#076935]" />}
          iconBg="bg-[#076935]/10"
          badgeText="Operational"
          badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
        />
        <MetricCard
          label="Assigned Headcount"
          value={stats.totalStaff}
          unit="staff"
          subtext={stats.totalStaff > 0 ? `Personnel across ${stats.totalDepts} divisions` : "No staff assigned"}
          icon={<Users size={22} className="text-blue-600" />}
          iconBg="bg-blue-50"
          badgeText="Active Workforce"
          badgeColor="bg-blue-50 text-blue-700 border-blue-200"
        />
        <MetricCard
          label="Monthly Combined Budget"
          value={stats.totalBudget > 0 ? (stats.totalBudget / 1000000).toFixed(1) + "M" : "0"}
          unit="RWF"
          subtext={stats.totalBudget > 0 ? "Operational & payroll allocation" : "No budget allocated"}
          icon={<Banknote size={22} className="text-amber-600" />}
          iconBg="bg-amber-50"
          badgeText="Approved Budget"
          badgeColor="bg-amber-50 text-amber-700 border-amber-200"
        />
        <MetricCard
          label="Total Capacity Limit"
          value={`${departments.reduce((s, d) => s + d.capacity, 0)}`}
          unit="Slots"
          subtext="Department capacity ceiling"
          icon={<Landmark size={22} className="text-purple-600" />}
          iconBg="bg-purple-50"
          badgeText="Staff Capacity"
          badgeColor="bg-purple-50 text-purple-700 border-purple-200"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#076935]/10 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
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
          Showing <span className="text-gray-900 font-bold">{filteredDepartments.length}</span> of {departments.length} departments
        </div>
      </div>

      {/* Departments Grid Cards */}
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
              There are currently no operational departments in the database. Click "Add New Department" to create your first organizational division.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#055028] transition"
              >
                <Plus size={15} /> Add New Department
              </button>
            </div>
          </div>
        ) : (
          filteredDepartments.map((dept) => {
            return (
              <div
                key={dept.id}
                className="group rounded-2xl border border-[#076935]/15 bg-white overflow-hidden transition hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Header Banner with non-white background */}
                  <div className="bg-[#F4FAF7] p-4 border-b border-[#076935]/10 flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-gray-500">{dept.code}</span>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-[#076935] transition leading-snug mt-0.5">
                        {dept.name}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
                        dept.status === "Active"
                          ? "bg-emerald-100/80 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100/80 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {dept.status}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Department Lead Display: Increased font size & enlarged colored User icon */}
                    <div className="flex items-center gap-2.5 text-sm">
                      <User size={19} className="text-[#076935] shrink-0" />
                      <span className="text-gray-500 font-medium">Lead:</span>
                      <span className="text-gray-900 font-bold text-sm">{dept.lead_name}</span>
                    </div>

                    {/* Clean Inline Metrics: Circular Staff Count Badge & Monthly Budget */}
                    <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#076935]/10 text-xs font-bold text-[#076935] shrink-0">
                          {dept.staff_count}
                        </span>
                        <span className="text-xs font-medium text-gray-600">Staff</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-[#076935]">
                        <Banknote size={14} className="text-[#076935]" />
                        <span>{dept.monthly_budget_rwf.toLocaleString()} RWF</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-4 pb-4">
                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedDept(dept)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-gray-900 transition"
                    >
                      <Briefcase size={14} /> Full Details
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartEdit(dept)}
                      className="inline-flex items-center gap-1 rounded-md bg-[#F39927]/10 px-3 py-1.5 text-xs font-bold text-[#F39927] hover:bg-[#F39927] hover:text-white transition"
                    >
                      <Pencil size={13} /> Edit Dept
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View Department Details Modal */}
      <Modal
        open={Boolean(selectedDept)}
        onClose={() => setSelectedDept(null)}
        size="lg"
        title="Department Overview & Structure"
      >
        {selectedDept && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-[#F4FAF7] p-4 rounded-2xl border border-[#076935]/15">
              <div>
                <span className="text-xs font-mono font-bold text-gray-400">{selectedDept.code}</span>
                <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
                  {selectedDept.name}
                </h2>
                <p className="text-xs text-[#076935] font-medium mt-0.5">Primary Location: {selectedDept.location}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const d = selectedDept;
                  setSelectedDept(null);
                  handleStartEdit(d);
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#F39927] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#d8821a] transition"
              >
                <Pencil size={14} /> Edit Department
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200">
              {selectedDept.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 rounded-xl border p-3">
                <p className="font-bold text-gray-700 uppercase tracking-wide">Division Head</p>
                <p><strong>Lead Name:</strong> {selectedDept.lead_name}</p>
                <p><strong>Official Email:</strong> {selectedDept.lead_email}</p>
                <p><strong>Status:</strong> <span className="font-bold text-emerald-700">{selectedDept.status}</span></p>
              </div>

              <div className="space-y-2 rounded-xl border p-3 bg-emerald-50/50 border-emerald-200">
                <p className="font-bold text-emerald-900 uppercase tracking-wide">Financial & Headcount Metrics</p>
                <p><strong>Staff Count:</strong> {selectedDept.staff_count} Active Employees</p>
                <p><strong>Max Capacity:</strong> {selectedDept.capacity} Headcount Limit</p>
                <p><strong>Monthly Allocation:</strong> {selectedDept.monthly_budget_rwf.toLocaleString()} RWF</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Department Modal */}
      <Modal open={isAddOpen} onClose={() => setIsAddOpen(false)} size="lg" title="Create New Department">
        <form onSubmit={handleAddDepartment} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700">Department Name *</label>
              <input
                type="text"
                required
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                placeholder="e.g. Agronomy & Soil Research"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700">Department Code</label>
              <input
                type="text"
                value={addForm.code}
                onChange={(e) => setAddForm({ ...addForm, code: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                placeholder="e.g. KF-DEP-AGRO"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700">Department Lead Manager (Optional)</label>
              <select
                value={addForm.lead_name}
                onChange={(e) => {
                  const val = e.target.value;
                  const matched = employeesList.find((emp) => emp.name === val);
                  setAddForm({
                    ...addForm,
                    lead_name: val,
                    lead_email: matched && matched.email ? matched.email : "",
                  });
                }}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2.5 text-xs text-gray-900 outline-none focus:border-[#076935]"
              >
                <option value="">-- Select Employee as Department Lead --</option>
                {employeesList.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} — {emp.title} ({emp.email})
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

            <div>
              <label className="font-bold text-gray-700">Primary Location</label>
              <input
                type="text"
                value={addForm.location}
                onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                placeholder="e.g. Musanze Plot C"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700">Monthly Operational Budget (RWF)</label>
              <input
                type="number"
                value={addForm.monthly_budget_rwf}
                onChange={(e) => setAddForm({ ...addForm, monthly_budget_rwf: Number(e.target.value) })}
                className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700">Initial Staff Count</label>
              <input
                type="number"
                value={addForm.staff_count}
                onChange={(e) => setAddForm({ ...addForm, staff_count: Number(e.target.value) })}
                className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700">Max Headcount Capacity</label>
              <input
                type="number"
                value={addForm.capacity}
                onChange={(e) => setAddForm({ ...addForm, capacity: Number(e.target.value) })}
                className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700">Department Scope & Description</label>
            <textarea
              rows={3}
              value={addForm.description}
              onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
              placeholder="Describe core duties and operations..."
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#076935] px-4 py-2 font-bold text-white hover:bg-[#055028]"
            >
              Create Department
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Department Modal */}
      <Modal
        open={Boolean(editingDept && editForm)}
        onClose={() => {
          setEditingDept(null);
          setEditForm(null);
        }}
        size="lg"
        title={`Edit Department: ${editingDept?.name || ""}`}
      >
        {editForm && (
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-700">Department Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">Department Code</label>
                <input
                  type="text"
                  value={editForm.code}
                  onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">Department Lead Manager (Optional)</label>
                <select
                  value={editForm.lead_name}
                  onChange={(e) => {
                    const val = e.target.value;
                    const matched = employeesList.find((emp) => emp.name === val);
                    setEditForm({
                      ...editForm,
                      lead_name: val,
                      lead_email: matched && matched.email ? matched.email : editForm.lead_email,
                    });
                  }}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2.5 text-xs text-gray-900 outline-none focus:border-[#076935]"
                >
                  <option value="">-- Select Employee as Department Lead --</option>
                  {employeesList.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name} — {emp.title} ({emp.email})
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

              <div>
                <label className="font-bold text-gray-700">Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">Monthly Budget (RWF)</label>
                <input
                  type="number"
                  value={editForm.monthly_budget_rwf}
                  onChange={(e) => setEditForm({ ...editForm, monthly_budget_rwf: Number(e.target.value) })}
                  className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">Staff Count</label>
                <input
                  type="number"
                  value={editForm.staff_count}
                  onChange={(e) => setEditForm({ ...editForm, staff_count: Number(e.target.value) })}
                  className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">Max Capacity Limit</label>
                <input
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
                  className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Department["status"] })}
                className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
              >
                <option value="Active">Active</option>
                <option value="Reorganizing">Reorganizing</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-gray-700">Department Description</label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => {
                  setEditingDept(null);
                  setEditForm(null);
                }}
                className="rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-[#076935] px-4 py-2 font-bold text-white hover:bg-[#055028]"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
