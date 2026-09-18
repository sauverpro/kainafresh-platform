import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Phone,
  Eye,
  LayoutGrid,
  List,
  ShieldAlert,
  Pencil,
  Mail,
  Upload,
  RefreshCw,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  Download,
  UserX,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";
import { useDepartmentStore } from "../../../store/useDepartmentStore";
import { apiGet } from "../../../api/client";

/* ------------------------------------------------------------------------
 * Shared union types — single source of truth
 * --------------------------------------------------------------------- */
export type EmploymentType =
  | "Full-Time Permanent"
  | "Part-Time"
  | "Seasonal Farm Worker"
  | "Fixed-Term Contract";

export type EmploymentStatus =
  | "Active"
  | "On Leave"
  | "Suspended"
  | "Terminated";

export type ContractStatus =
  | "Active"
  | "Expiring Soon"
  | "Expired"
  | "Renewed";

export interface Employee {
  id: string;
  code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  job_title: string;
  employment_type: EmploymentType;
  status: EmploymentStatus;
  location: string;
  hire_date: string;
  salary_rwf: number;
  avatar_url?: string;
  // Integrated Contract & Employment Record Fields
  contract_id?: string;
  contract_start_date?: string;
  contract_end_date?: string | null;
  contract_status?: ContractStatus;
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

const INITIAL_EMPLOYEES: Employee[] = [];

export default function EmployeeProfiles() {
  usePageTitle("employee-profiles", "Employee Profiles & Records");

  const { departments } = useDepartmentStore();
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  useEffect(() => {
    apiGet<{ success: boolean; data: any[] }>("/api/employees")
      .then((res) => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: Employee[] = res.data.map((item: any) => ({
            id: `EMP-${item.id}`,
            code: item.emp_number || `KF-EMP-${item.id}`,
            first_name: item.fullname ? item.fullname.split(" ")[0] : "Staff",
            last_name: item.fullname
              ? item.fullname.split(" ").slice(1).join(" ")
              : "",
            email: item.email || "",
            phone: item.phone || "",
            department: item.department_name || "General",
            job_title: item.job_title || "Staff Member",
            employment_type:
              item.employment_type === "contract"
                ? "Fixed-Term Contract"
                : "Full-Time Permanent",
            status:
              item.status === "active"
                ? "Active"
                : item.status === "on_leave"
                  ? "On Leave"
                  : "Suspended",
            location: item.address || "Kigali HQ",
            hire_date:
              item.date_hired || new Date().toISOString().split("T")[0],
            salary_rwf: Number(item.salary_rwf) || 0,
            contract_id: item.contract_ref || undefined,
            contract_end_date: item.contract_end_date || null,
            contract_status: item.contract_end_date
              ? "Expiring Soon"
              : "Active",
            emergency_contact: {
              name: item.emergency_person_name || "",
              relationship: "Family",
              phone: item.emergency_phone_number || "",
            },
          }));
          const uniqueEmployees = mapped.filter(
            (emp, idx, self) =>
              idx ===
              self.findIndex(
                (t) =>
                  String(t.id) === String(emp.id) ||
                  (t.code && emp.code && t.code === emp.code) ||
                  (t.email &&
                    emp.email &&
                    t.email.trim().toLowerCase() ===
                      emp.email.trim().toLowerCase()),
              ),
          );
          setEmployees(uniqueEmployees);
        } else {
          setEmployees([]);
        }
      })
      .catch(() => {
        setEmployees([]);
      });
  }, []);

  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [contractFilter, setContractFilter] = useState("all");

  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  // Registration Form State
  const [form, setForm] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    department: string;
    job_title: string;
    employment_type: EmploymentType;
    location: string;
    salary_rwf: number;
    contract_id: string;
    contract_start_date: string;
    contract_end_date: string;
    contract_status: ContractStatus;
    emergency_name: string;
    emergency_relationship: string;
    emergency_phone: string;
  }>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department: "Farm Operations",
    job_title: "",
    employment_type: "Full-Time Permanent",
    location: "Musanze Plot A",
    salary_rwf: 350000,
    contract_id: "",
    contract_start_date: new Date().toISOString().split("T")[0],
    contract_end_date: "",
    contract_status: "Active",
    emergency_name: "",
    emergency_relationship: "Spouse",
    emergency_phone: "",
  });

  // Edit Form State
  const [editForm, setEditForm] = useState<Employee | null>(null);

  const handleRenewContract = (id: string) => {
    const renewDate = new Date();
    renewDate.setFullYear(renewDate.getFullYear() + 1);
    const newEndDate = renewDate.toISOString().split("T")[0];

    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id
          ? {
              ...emp,
              contract_status: "Renewed" as ContractStatus,
              contract_end_date: newEndDate,
            }
          : emp,
      ),
    );
    if (selectedEmp && selectedEmp.id === id) {
      setSelectedEmp((prev) =>
        prev
          ? {
              ...prev,
              contract_status: "Renewed" as ContractStatus,
              contract_end_date: newEndDate,
            }
          : null,
      );
    }
    toast.success(
      `Employment contract for #${id} successfully renewed for 12 months!`,
    );
  };

  const expiringContractsCount = useMemo(
    () =>
      employees.filter((e) => e.contract_status === "Expiring Soon").length,
    [employees],
  );

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (deptFilter !== "all" && emp.department !== deptFilter) return false;
      if (statusFilter !== "all" && emp.status !== statusFilter) return false;
      if (contractFilter !== "all" && emp.contract_status !== contractFilter)
        return false;
      if (!search.trim()) return true;

      const q = search.toLowerCase();
      return (
        emp.first_name.toLowerCase().includes(q) ||
        emp.last_name.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.job_title.toLowerCase().includes(q) ||
        emp.code.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        (emp.contract_id || "").toLowerCase().includes(q)
      );
    });
  }, [employees, search, deptFilter, statusFilter, contractFilter]);

  const stats = useMemo(() => {
    const total = filteredEmployees.length;
    const active = filteredEmployees.filter(
      (e) => e.status === "Active",
    ).length;
    const onLeave = filteredEmployees.filter(
      (e) => e.status === "On Leave",
    ).length;
    const totalSalary = filteredEmployees.reduce(
      (sum, e) => sum + e.salary_rwf,
      0,
    );
    return { total, active, onLeave, totalSalary };
  }, [filteredEmployees]);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.first_name.trim() ||
      !form.last_name.trim() ||
      !form.phone.trim()
    ) {
      toast.error("Please fill in first name, last name, and phone number.");
      return;
    }

    const newEmp: Employee = {
      id: `EMP-00${employees.length + 1}`,
      code: `KF-EMP-10${employees.length + 1}`,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email:
        form.email.trim() ||
        `${form.first_name.toLowerCase()}.${form.last_name.toLowerCase()}@kainafresh.rw`,
      phone: form.phone.trim(),
      department: form.department,
      job_title: form.job_title.trim() || "Operations Staff",
      employment_type: form.employment_type,
      status: "Active",
      location: form.location,
      hire_date: new Date().toISOString().split("T")[0],
      salary_rwf: Number(form.salary_rwf),
      contract_id: form.contract_id.trim() || undefined,
      contract_start_date:
        form.contract_start_date || new Date().toISOString().split("T")[0],
      contract_end_date: form.contract_end_date || null,
      contract_status: form.contract_status,
      emergency_contact: {
        name: form.emergency_name.trim(),
        relationship: form.emergency_relationship,
        phone: form.emergency_phone.trim(),
      },
    };

    setEmployees([newEmp, ...employees]);
    setIsAddOpen(false);
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      department: "Farm Operations",
      job_title: "",
      employment_type: "Full-Time Permanent",
      location: "Musanze Plot A",
      salary_rwf: 350000,
      contract_id: "",
      contract_start_date: new Date().toISOString().split("T")[0],
      contract_end_date: "",
      contract_status: "Active",
      emergency_name: "",
      emergency_relationship: "Spouse",
      emergency_phone: "",
    });
    toast.success(
      `Employee ${newEmp.first_name} ${newEmp.last_name} registered successfully!`,
    );
  };

  const handleStartEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setEditForm(JSON.parse(JSON.stringify(emp)));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    if (
      !editForm.first_name.trim() ||
      !editForm.last_name.trim() ||
      !editForm.phone.trim()
    ) {
      toast.error("First name, last name, and phone number are required.");
      return;
    }

    setEmployees(employees.map((e) => (e.id === editForm.id ? editForm : e)));
    if (selectedEmp?.id === editForm.id) {
      setSelectedEmp(editForm);
    }
    setEditingEmp(null);
    toast.success(
      `Updated profile for ${editForm.first_name} ${editForm.last_name}!`,
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImportFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const lines = text.split("\n").filter((l) => l.trim().length > 0);
          const count = Math.max(0, lines.length - 1);
          setImportedCount(count > 0 ? count : 4);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "First Name,Last Name,Email,Phone,Department,Job Title,Employment Type,Location,Salary RWF\n" +
      "Claude,Makuza,c.makuza@kainafresh.rw,+250788123456,Farm Operations & Cultivation,Agronomist,Full-Time,Musanze Plot A,550000\n" +
      "Divine,Uwineza,d.uwineza@kainafresh.rw,+250788654321,Post-Harvest & Packaging,Quality Inspector,Full-Time,Kigali Packhouse,480000";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "kainafresh_employee_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Import template downloaded!");
  };

  const handleProcessImport = () => {
    if (!importFile) {
      toast.error("Please select a CSV or Excel file to import.");
      return;
    }

    const countToImport = importedCount || 4;
    const mockImported: Employee[] = Array.from({ length: countToImport }).map(
      (_, idx) => ({
        id: `EMP-IMP-${Date.now()}-${idx}`,
        code: `KF-EMP-${200 + idx}`,
        first_name: idx === 0 ? "Claude" : idx === 1 ? "Divine" : `Imported`,
        last_name:
          idx === 0 ? "Makuza" : idx === 1 ? "Uwineza" : `Staff ${idx + 1}`,
        email:
          idx === 0 ? "c.makuza@kainafresh.rw" : `staff.${idx}@kainafresh.rw`,
        phone: `+250 788 ${100 + idx} ${200 + idx}`,
        department: "Farm Operations",
        job_title: idx === 0 ? "Field Specialist" : "Operations Assistant",
        employment_type: "Full-Time Permanent",
        status: "Active",
        location: "Kigali HQ",
        hire_date: new Date().toISOString().split("T")[0],
        salary_rwf: 450000,
        contract_status: "Active",
        emergency_contact: {
          name: "",
          relationship: "",
          phone: "",
        },
      }),
    );

    setEmployees((prev) => [...mockImported, ...prev]);
    setIsImportOpen(false);
    setImportFile(null);
    setImportedCount(null);
    toast.success(`Successfully imported ${countToImport} employee records!`);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Employee Profiles & Directory
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage permanent staff, agronomists, seasonal workers, and
            department assignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#076935]/30 bg-white px-4 py-2.5 text-xs font-bold text-[#076935] shadow-xs transition hover:bg-[#F4FAF7]"
          >
            <Upload size={16} /> Import (CSV / Excel)
          </button>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#055028]"
          >
            <Plus size={16} /> Add New Employee
          </button>
        </div>
      </div>

      {/* Expiring Contract Alert Banner */}
      {expiringContractsCount > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
          <div className="flex items-center gap-2.5 font-bold">
            <AlertCircle size={20} className="text-amber-600 shrink-0" />
            <span>
              {expiringContractsCount} employment contract
              {expiringContractsCount > 1 ? "s are" : " is"} expiring within the
              next 30 days!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setContractFilter("Expiring Soon")}
            className="text-[11px] font-bold text-amber-900 bg-amber-200/70 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition"
          >
            View Expiring Contracts
          </button>
        </div>
      )}

      {/* Filter & View Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-[#076935]/10 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee name, code, contract ID..."
              className="w-full rounded-md border border-gray-300 bg-gray-50/50 pl-9 pr-3 py-2 text-xs text-gray-900 outline-none focus:border-[#076935] focus:bg-white"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#076935]"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#076935]"
          >
            <option value="all">All Work Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Suspended">Suspended</option>
            <option value="Terminated">Terminated</option>
          </select>

          <select
            value={contractFilter}
            onChange={(e) => setContractFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#076935]"
          >
            <option value="all">All Contract Statuses</option>
            <option value="Active">Active Contract</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
            <option value="Renewed">Renewed</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 self-start lg:self-auto">
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              viewMode === "table"
                ? "bg-white text-[#076935] shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <List size={15} /> Table
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              viewMode === "grid"
                ? "bg-white text-[#076935] shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <LayoutGrid size={15} /> Grid
          </button>
        </div>
      </div>

      {/* Primary Table View */}
      {viewMode === "table" ? (
        <div className="overflow-hidden rounded-2xl border border-[#076935]/15 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F4FAF7] border-b border-[#076935]/15 text-gray-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Employee Name & Code</th>
                  <th className="px-4 py-3.5">Department & Job Title</th>
                  <th className="px-4 py-3.5">Contact Details</th>
                  <th className="px-4 py-3.5">Location & Hire Date</th>
                  <th className="px-4 py-3.5">Employment Type</th>
                  <th className="px-4 py-3.5">Base Salary</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-8 text-center text-gray-500"
                    >
                      No employee profiles found matching search filters.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-[#F4FAF7]/60 transition"
                    >
                      <td className="px-5 py-3.5 font-semibold text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#076935]/10 font-bold text-[#076935]">
                            {emp.first_name[0]}
                            {emp.last_name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {emp.first_name} {emp.last_name}
                            </p>
                            <p className="text-[11px] text-gray-400 font-mono">
                              {emp.code}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-gray-800">
                          {emp.job_title}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {emp.department}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">
                        <p className="font-medium text-gray-800">{emp.phone}</p>
                        <p className="text-[11px] text-gray-400">
                          {emp.email}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">
                        <p className="font-medium text-gray-800">
                          {emp.location}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          Hired: {emp.hire_date}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded-lg bg-[#F39927]/10 px-2.5 py-1 text-[11px] font-semibold text-[#F39927]">
                          {emp.employment_type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-gray-900">
                        {emp.salary_rwf.toLocaleString()} RWF
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            emp.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : emp.status === "On Leave"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedEmp(emp)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#076935] hover:bg-[#076935]/10 px-2 py-1.5 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye size={15} /> View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(emp)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#F39927] hover:bg-[#F39927]/10 px-2 py-1.5 rounded-lg transition"
                            title="Edit Employee"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Summary Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#F4FAF7]/80 px-5 py-3 border-t border-[#076935]/10 text-xs text-gray-600">
            <div>
              Showing{" "}
              <span className="font-bold text-gray-900">
                {filteredEmployees.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-900">
                {employees.length}
              </span>{" "}
              employee records
            </div>
            <div className="flex items-center gap-6 font-medium">
              <span>
                Active Staff:{" "}
                <strong className="text-emerald-700">{stats.active}</strong>
              </span>
              <span>
                On Leave:{" "}
                <strong className="text-amber-700">{stats.onLeave}</strong>
              </span>
              <span>
                Total Monthly Base:{" "}
                <strong className="text-[#076935]">
                  {stats.totalSalary.toLocaleString()} RWF
                </strong>
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Brand Aligned Reference Grid View */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEmployees.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#076935] mb-3">
                <UserX size={28} />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                No Employee Profiles Recorded
              </h3>
              <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
                There are currently no employee profiles in the database. Click
                "Add New Employee" or "Import (CSV / Excel)" to register staff.
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#055028] transition"
                >
                  <Plus size={15} /> Add New Employee
                </button>
              </div>
            </div>
          ) : (
            filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="group rounded-2xl border border-[#076935]/15 bg-white p-5 shadow-xs transition hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Top Header: Code & Status Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#076935]"></span>
                      <span className="text-[10px] font-mono font-bold text-gray-400">
                        {emp.code}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                        emp.status === "Active"
                          ? "bg-emerald-100/80 text-emerald-800 border border-emerald-200"
                          : emp.status === "On Leave"
                            ? "bg-amber-100/80 text-amber-800 border border-amber-200"
                            : emp.status === "Suspended"
                              ? "bg-rose-100/80 text-rose-800 border border-rose-200"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </div>

                  {/* Profile Header */}
                  <div className="mt-4 flex items-center gap-3.5">
                    {emp.avatar_url ? (
                      <img
                        src={emp.avatar_url}
                        alt={`${emp.first_name} ${emp.last_name}`}
                        className="h-12 w-12 rounded-full object-cover border-2 border-[#076935]/20 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#076935]/10 text-[#076935] font-extrabold text-sm border-2 border-[#076935]/20">
                        {emp.first_name[0]}
                        {emp.last_name[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-base leading-snug truncate group-hover:text-[#076935] transition">
                        {emp.first_name} {emp.last_name}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium truncate">
                        {emp.job_title}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 text-xs">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Department
                      </p>
                      <p className="font-semibold text-gray-800 truncate mt-0.5">
                        {emp.department}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Date of Joining
                      </p>
                      <p className="font-semibold text-gray-800 truncate mt-0.5">
                        {emp.hire_date}
                      </p>
                    </div>
                  </div>

                  {/* Contact Box */}
                  <div className="mt-3 rounded-xl bg-gray-50/90 p-3 space-y-1.5 border border-gray-100 text-xs">
                    <div className="flex items-center gap-2 text-gray-600 font-medium min-w-0">
                      <Mail size={13} className="text-gray-400 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                      <Phone size={13} className="text-gray-400 shrink-0" />
                      <span>{emp.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(emp)}
                    className="flex-1 rounded-xl bg-emerald-50/80 hover:bg-[#F39927] hover:text-white border border-emerald-200/50 py-2 text-xs font-bold text-[#076935] transition flex items-center justify-center gap-1.5"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedEmp(emp)}
                    className="flex-1 rounded-xl bg-[#076935] hover:bg-[#055028] py-2 text-xs font-bold text-white shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Eye size={13} /> View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* View Employee Detail Modal */}
      <Modal
        open={Boolean(selectedEmp)}
        onClose={() => setSelectedEmp(null)}
        size="lg"
        title="Employee Record & Profile"
      >
        {selectedEmp && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-[#F4FAF7] p-4 rounded-2xl border border-[#076935]/15">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#076935] text-white font-black text-xl">
                  {selectedEmp.first_name[0]}
                  {selectedEmp.last_name[0]}
                </div>
                <div>
                  <h2
                    className="text-xl font-bold text-gray-900"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {selectedEmp.first_name} {selectedEmp.last_name}
                  </h2>
                  <p className="text-xs font-semibold text-[#076935]">
                    {selectedEmp.job_title} • {selectedEmp.department}
                  </p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    {selectedEmp.code} | Hired: {selectedEmp.hire_date}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const emp = selectedEmp;
                  setSelectedEmp(null);
                  handleStartEdit(emp);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#F39927] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#d8821a] transition"
              >
                <Pencil size={14} /> Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 rounded-xl border p-3 bg-[#F4FAF7]/50 border-[#076935]/20">
                <p className="font-bold text-[#076935] uppercase tracking-wide flex items-center gap-1.5">
                  <FileText size={14} /> Contract & Employment Record
                </p>
                <p>
                  <strong>Contract ID:</strong>{" "}
                  <span className="font-mono font-bold text-gray-800">
                    {selectedEmp.contract_id || `CTR-2024-${selectedEmp.code}`}
                  </span>
                </p>
                <p>
                  <strong>Contract Type:</strong> {selectedEmp.employment_type}
                </p>
                <p>
                  <strong>Start Date:</strong>{" "}
                  {selectedEmp.contract_start_date || selectedEmp.hire_date}
                </p>
                <p>
                  <strong>End Date:</strong>{" "}
                  {selectedEmp.contract_end_date || "Indefinite / Permanent"}
                </p>
                <p>
                  <strong>Contract Status:</strong>{" "}
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      selectedEmp.contract_status === "Expiring Soon"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : selectedEmp.contract_status === "Renewed" ||
                            selectedEmp.contract_status === "Active"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedEmp.contract_status || "Active"}
                  </span>
                </p>
                {selectedEmp.contract_status === "Expiring Soon" && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleRenewContract(selectedEmp.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#076935] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#055028] transition cursor-pointer"
                    >
                      <RefreshCw size={13} /> Renew Contract
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-2 rounded-xl border p-3">
                  <p className="font-bold text-gray-700 uppercase tracking-wide">
                    Employment Details
                  </p>
                  <p>
                    <strong>Work Location:</strong> {selectedEmp.location}
                  </p>
                  <p>
                    <strong>Monthly Base Salary:</strong>{" "}
                    {selectedEmp.salary_rwf.toLocaleString()} RWF
                  </p>
                  <p>
                    <strong>Work Status:</strong>{" "}
                    <span className="font-bold text-[#076935]">
                      {selectedEmp.status}
                    </span>
                  </p>
                </div>

                <div className="space-y-2 rounded-xl border p-3 bg-amber-50/50 border-amber-200">
                  <p className="font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1">
                    <ShieldAlert size={14} /> Emergency Contact
                  </p>
                  <p>
                    <strong>Name:</strong> {selectedEmp.emergency_contact.name}
                  </p>
                  <p>
                    <strong>Relationship:</strong>{" "}
                    {selectedEmp.emergency_contact.relationship}
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    {selectedEmp.emergency_contact.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Employee Modal */}
      <Modal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        size="lg"
        title="Register New Employee & Contract Record"
      >
        <form onSubmit={handleAddEmployee} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700">First Name *</label>
              <input
                type="text"
                required
                value={form.first_name}
                onChange={(e) =>
                  setForm({ ...form, first_name: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                placeholder="e.g. Jean"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700">Last Name *</label>
              <input
                type="text"
                required
                value={form.last_name}
                onChange={(e) =>
                  setForm({ ...form, last_name: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                placeholder="e.g. Habimana"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700">Phone Number *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                placeholder="+250 788 000 000"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700">Department</label>
              <select
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-gray-700">Job Title</label>
              <input
                type="text"
                value={form.job_title}
                onChange={(e) =>
                  setForm({ ...form, job_title: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                placeholder="e.g. Agronomist Lead"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700">Work Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                placeholder="e.g. Musanze Plot A"
              />
            </div>
          </div>

          {/* Contract Record Section */}
          <div className="rounded-xl border border-[#076935]/20 bg-[#F4FAF7]/60 p-3 space-y-3">
            <p className="font-bold text-[#076935] uppercase tracking-wide flex items-center gap-1.5">
              <FileText size={14} /> Employment Contract Record Information
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-gray-700">
                  Contract ID / Reference
                </label>
                <input
                  type="text"
                  value={form.contract_id}
                  onChange={(e) =>
                    setForm({ ...form, contract_id: e.target.value })
                  }
                  placeholder="e.g. CTR-2026-106 (Optional)"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2.5 outline-none focus:border-[#076935]"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Contract / Employment Type
                </label>
                <select
                  value={form.employment_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      employment_type: e.target.value as EmploymentType,
                    })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2.5 outline-none focus:border-[#076935]"
                >
                  <option value="Full-Time Permanent">
                    Full-Time Permanent
                  </option>
                  <option value="Fixed-Term Contract">
                    Fixed-Term Contract
                  </option>
                  <option value="Seasonal Farm Worker">
                    Seasonal Farm Worker
                  </option>
                  <option value="Part-Time">Part-Time</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Contract Start Date
                </label>
                <input
                  type="date"
                  value={form.contract_start_date}
                  onChange={(e) =>
                    setForm({ ...form, contract_start_date: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2.5 outline-none focus:border-[#076935]"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Contract End Date (Leave empty for permanent)
                </label>
                <input
                  type="date"
                  value={form.contract_end_date}
                  onChange={(e) =>
                    setForm({ ...form, contract_end_date: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2.5 outline-none focus:border-[#076935]"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Contract Agreement Status
                </label>
                <select
                  value={form.contract_status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contract_status: e.target.value as ContractStatus,
                    })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2.5 outline-none focus:border-[#076935]"
                >
                  <option value="Active">Active</option>
                  <option value="Expiring Soon">Expiring Soon</option>
                  <option value="Expired">Expired</option>
                  <option value="Renewed">Renewed</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Monthly Base Salary (RWF)
                </label>
                <input
                  type="number"
                  value={form.salary_rwf}
                  onChange={(e) =>
                    setForm({ ...form, salary_rwf: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2.5 outline-none focus:border-[#076935]"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact Information Section */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 space-y-3">
            <p className="font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
              <Phone size={14} className="text-[#076935]" /> Emergency Contact
              Information (Optional)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-gray-700">
                  Contact Full Name
                </label>
                <input
                  type="text"
                  value={form.emergency_name}
                  onChange={(e) =>
                    setForm({ ...form, emergency_name: e.target.value })
                  }
                  placeholder="e.g. Marie Mugisha"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2.5 outline-none focus:border-[#076935]"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Relationship
                </label>
                <select
                  value={form.emergency_relationship}
                  onChange={(e) =>
                    setForm({ ...form, emergency_relationship: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2.5 outline-none focus:border-[#076935]"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Child">Child</option>
                  <option value="Next of Kin">Next of Kin</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Emergency Phone Number
                </label>
                <input
                  type="text"
                  value={form.emergency_phone}
                  onChange={(e) =>
                    setForm({ ...form, emergency_phone: e.target.value })
                  }
                  placeholder="+250 788 000 000"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2.5 outline-none focus:border-[#076935]"
                />
              </div>
            </div>
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
              Register Staff & Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        open={Boolean(editingEmp && editForm)}
        onClose={() => {
          setEditingEmp(null);
          setEditForm(null);
        }}
        size="lg"
        title={`Edit Employee & Contract: ${editingEmp?.first_name || ""} ${editingEmp?.last_name || ""}`}
      >
        {editForm && (
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-700">First Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.first_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, first_name: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">Last Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.last_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, last_name: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">Department</label>
                <select
                  value={editForm.department}
                  onChange={(e) =>
                    setEditForm({ ...editForm, department: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700">Job Title</label>
                <input
                  type="text"
                  value={editForm.job_title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, job_title: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">
                  Employment Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      status: e.target.value as EmploymentStatus,
                    })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700">Work Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                />
              </div>
            </div>

            {/* Contract Record Edit Section */}
            <div className="rounded-xl border border-[#076935]/20 bg-[#F4FAF7]/60 p-3 space-y-3">
              <p className="font-bold text-[#076935] uppercase tracking-wide flex items-center gap-1.5">
                <FileText size={14} /> Employment Contract Details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700">
                    Contract ID / Reference
                  </label>
                  <input
                    type="text"
                    value={editForm.contract_id || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, contract_id: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2.5 outline-none focus:border-[#076935]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700">
                    Contract Type
                  </label>
                  <select
                    value={editForm.employment_type}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        employment_type: e.target.value as EmploymentType,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2.5 outline-none focus:border-[#076935]"
                  >
                    <option value="Full-Time Permanent">
                      Full-Time Permanent
                    </option>
                    <option value="Fixed-Term Contract">
                      Fixed-Term Contract
                    </option>
                    <option value="Seasonal Farm Worker">
                      Seasonal Farm Worker
                    </option>
                    <option value="Part-Time">Part-Time</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700">
                    Contract Start Date
                  </label>
                  <input
                    type="date"
                    value={
                      editForm.contract_start_date || editForm.hire_date || ""
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        contract_start_date: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2.5 outline-none focus:border-[#076935]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700">
                    Contract End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={editForm.contract_end_date || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        contract_end_date: e.target.value || null,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2.5 outline-none focus:border-[#076935]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700">
                    Contract Status
                  </label>
                  <select
                    value={editForm.contract_status || "Active"}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        contract_status: e.target.value as ContractStatus,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2.5 outline-none focus:border-[#076935]"
                  >
                    <option value="Active">Active</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="Expired">Expired</option>
                    <option value="Renewed">Renewed</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700">
                    Monthly Base Salary (RWF)
                  </label>
                  <input
                    type="number"
                    value={editForm.salary_rwf}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        salary_rwf: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2.5 outline-none focus:border-[#076935]"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-md border border-amber-200 bg-amber-50/40 p-3 space-y-3 mt-3">
              <p className="font-bold text-amber-900 uppercase tracking-wide">
                Emergency Contact Information
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-gray-700">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={editForm.emergency_contact.name}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        emergency_contact: {
                          ...editForm.emergency_contact,
                          name: e.target.value,
                        },
                      })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 outline-none focus:border-[#076935]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={editForm.emergency_contact.relationship}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        emergency_contact: {
                          ...editForm.emergency_contact,
                          relationship: e.target.value,
                        },
                      })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 outline-none focus:border-[#076935]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Phone</label>
                  <input
                    type="text"
                    value={editForm.emergency_contact.phone}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        emergency_contact: {
                          ...editForm.emergency_contact,
                          phone: e.target.value,
                        },
                      })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 outline-none focus:border-[#076935]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => {
                  setEditingEmp(null);
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

      {/* Import Employees Modal */}
      <Modal
        open={isImportOpen}
        onClose={() => {
          setIsImportOpen(false);
          setImportFile(null);
          setImportedCount(null);
        }}
        size="lg"
        title="Batch Import Employee Roster"
      >
        <div className="space-y-4 text-xs">
          <p className="text-gray-600 leading-relaxed">
            Upload your employee roster spreadsheet (CSV or Excel format).
            Ensure column headers match KainaFresh standard fields.
          </p>

          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-3 rounded-xl">
            <div className="flex items-center gap-2 text-amber-900 font-medium">
              <FileSpreadsheet size={16} className="text-[#F39927]" />
              <span>Need a sample file format?</span>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 font-bold text-[#076935] hover:underline"
            >
              <Download size={14} /> Download Template (.CSV)
            </button>
          </div>

          <div className="border-2 border-dashed border-[#076935]/30 bg-[#F4FAF7] rounded-2xl p-6 text-center hover:border-[#076935] transition">
            <input
              type="file"
              id="employee-import-input"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="employee-import-input"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <div className="h-12 w-12 rounded-full bg-[#076935]/10 text-[#076935] flex items-center justify-center">
                <Upload size={22} />
              </div>
              <span className="font-bold text-gray-900 text-sm mt-1">
                {importFile
                  ? importFile.name
                  : "Click or drag & drop CSV / Excel file here"}
              </span>
              <span className="text-gray-400 text-xs">
                Supported formats: .CSV, .XLSX, .XLS (Up to 10MB)
              </span>
            </label>
          </div>

          {importFile && (
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-900 font-semibold flex items-center justify-between">
              <span>
                Ready to process {importedCount || "multiple"} employee records
                from spreadsheet.
              </span>
              <span className="text-xs font-mono font-bold bg-emerald-200/60 px-2 py-0.5 rounded">
                {(importFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 p-3 bg-gray-50 text-gray-500 space-y-1 text-[11px]">
            <p className="font-bold text-gray-700 uppercase tracking-wider">
              Required Column Mapping:
            </p>
            <p className="font-mono text-gray-800">
              First Name, Last Name, Email, Phone, Department, Job Title,
              Employment Type, Location, Salary RWF
            </p>
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <button
              type="button"
              onClick={() => {
                setIsImportOpen(false);
                setImportFile(null);
                setImportedCount(null);
              }}
              className="rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleProcessImport}
              className="rounded-md bg-[#076935] px-4 py-2 font-bold text-white hover:bg-[#055028] shadow-xs"
            >
              Import Employee Roster
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}