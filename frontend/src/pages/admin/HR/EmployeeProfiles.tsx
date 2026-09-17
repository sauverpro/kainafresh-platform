import { useState, useMemo } from "react";
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
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";
import { useDepartmentStore } from "../../../store/useDepartmentStore";

export interface Employee {
  id: string;
  code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  job_title: string;
  employment_type: "Full-Time" | "Part-Time" | "Seasonal" | "Contract";
  status: "Active" | "On Leave" | "Suspended" | "Terminated";
  location: string;
  hire_date: string;
  salary_rwf: number;
  avatar_url?: string;
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "EMP-001",
    code: "KF-EMP-101",
    first_name: "Jean-Claude",
    last_name: "Mugisha",
    email: "jc.mugisha@kainafresh.rw",
    phone: "+250 788 112 233",
    department: "Farm Operations",
    job_title: "Senior Agronomist & Plot Lead",
    employment_type: "Full-Time",
    status: "Active",
    location: "Musanze Plot A",
    hire_date: "2024-03-15",
    salary_rwf: 650000,
    avatar_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    emergency_contact: {
      name: "Marie Mugisha",
      relationship: "Spouse",
      phone: "+250 788 998 877",
    },
  },
  {
    id: "EMP-002",
    code: "KF-EMP-102",
    first_name: "Alice",
    last_name: "Uwimana",
    email: "alice.uwimana@kainafresh.rw",
    phone: "+250 788 445 566",
    department: "Post-Harvest & Packaging",
    job_title: "Quality Control Supervisor",
    employment_type: "Full-Time",
    status: "Active",
    location: "Kigali Packhouse",
    hire_date: "2024-06-01",
    salary_rwf: 520000,
    avatar_url:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    emergency_contact: {
      name: "Pascal Uwimana",
      relationship: "Brother",
      phone: "+250 788 332 211",
    },
  },
  {
    id: "EMP-003",
    code: "KF-EMP-103",
    first_name: "Emmanuel",
    last_name: "Habimana",
    email: "e.habimana@kainafresh.rw",
    phone: "+250 788 778 899",
    department: "Logistics & Fleet",
    job_title: "Cold-Chain Fleet Driver",
    employment_type: "Full-Time",
    status: "On Leave",
    location: "Kigali Logistics Hub",
    hire_date: "2024-08-10",
    salary_rwf: 380000,
    avatar_url:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    emergency_contact: {
      name: "Grace Habimana",
      relationship: "Sister",
      phone: "+250 788 665 544",
    },
  },
  {
    id: "EMP-004",
    code: "KF-EMP-104",
    first_name: "Solange",
    last_name: "Murekatete",
    email: "s.murekatete@kainafresh.rw",
    phone: "+250 788 223 344",
    department: "Sales & B2B",
    job_title: "B2B Account Manager",
    employment_type: "Full-Time",
    status: "Active",
    location: "Kigali HQ",
    hire_date: "2025-01-15",
    salary_rwf: 700000,
    avatar_url:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    emergency_contact: {
      name: "Jean Murekatete",
      relationship: "Father",
      phone: "+250 788 110 099",
    },
  },
  {
    id: "EMP-005",
    code: "KF-EMP-105",
    first_name: "Patrick",
    last_name: "Nshimiyimana",
    email: "p.nshimiyimana@kainafresh.rw",
    phone: "+250 788 667 788",
    department: "Farm Operations",
    job_title: "Harvest Supervisor (Plot B)",
    employment_type: "Seasonal",
    status: "Active",
    location: "Musanze Plot B",
    hire_date: "2025-05-01",
    salary_rwf: 250000,
    avatar_url:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
    emergency_contact: {
      name: "Claudine Nshimiyimana",
      relationship: "Spouse",
      phone: "+250 788 889 900",
    },
  },
];

export default function EmployeeProfiles() {
  usePageTitle("employee-profiles", "Employee Profiles");

  const { departments } = useDepartmentStore();
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  // Registration Form State
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department: "Farm Operations & Cultivation",
    job_title: "",
    employment_type: "Full-Time" as Employee["employment_type"],
    location: "Musanze Plot A",
    salary_rwf: 350000,
    emergency_name: "",
    emergency_relationship: "Spouse",
    emergency_phone: "",
  });

  // Edit Form State
  const [editForm, setEditForm] = useState<Employee | null>(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (deptFilter !== "all" && emp.department !== deptFilter) return false;
      if (statusFilter !== "all" && emp.status !== statusFilter) return false;
      if (!search.trim()) return true;

      const q = search.toLowerCase();
      return (
        emp.first_name.toLowerCase().includes(q) ||
        emp.last_name.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.job_title.toLowerCase().includes(q) ||
        emp.code.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q)
      );
    });
  }, [employees, search, deptFilter, statusFilter]);

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
      emergency_contact: {
        name: form.emergency_name || "Family Contact",
        relationship: form.emergency_relationship,
        phone: form.emergency_phone || form.phone,
      },
    };

    setEmployees([newEmp, ...employees]);
    setIsAddOpen(false);
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
        employment_type: "Full-Time",
        status: "Active",
        location: "Kigali HQ",
        hire_date: new Date().toISOString().split("T")[0],
        salary_rwf: 450000,
        emergency_contact: {
          name: "Family Contact",
          relationship: "Parent",
          phone: "+250 788 000 000",
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
              placeholder="Search employee name, code, title..."
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
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Suspended">Suspended</option>
            <option value="Terminated">Terminated</option>
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
                        <p className="text-[11px] text-gray-400">{emp.email}</p>
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
          {filteredEmployees.map((emp) => (
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

                {/* Profile Header: Avatar Photo / Initials + Name + Title */}
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

                {/* 2-Column Metadata: Department & Hire Date */}
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

                {/* Containerized Contact Box */}
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

              {/* Dual Action Buttons */}
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
          ))}
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
              <div className="space-y-2 rounded-xl border p-3">
                <p className="font-bold text-gray-700 uppercase tracking-wide">
                  Employment Info
                </p>
                <p>
                  <strong>Type:</strong> {selectedEmp.employment_type}
                </p>
                <p>
                  <strong>Work Location:</strong> {selectedEmp.location}
                </p>
                <p>
                  <strong>Monthly Base Salary:</strong>{" "}
                  {selectedEmp.salary_rwf.toLocaleString()} RWF
                </p>
                <p>
                  <strong>Status:</strong>{" "}
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
                  <strong>Phone:</strong> {selectedEmp.emergency_contact.phone}
                </p>
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
        title="Register New Employee"
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
              Register Staff
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
        title={`Edit Employee: ${editingEmp?.first_name || ""} ${editingEmp?.last_name || ""}`}
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
                  Employment Type
                </label>
                <select
                  value={editForm.employment_type}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      employment_type: e.target
                        .value as Employee["employment_type"],
                    })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Seasonal">Seasonal</option>
                  <option value="Contract">Contract</option>
                </select>
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
                      status: e.target.value as Employee["status"],
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

              <div>
                <label className="font-bold text-gray-700">
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
                  className="mt-1 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-[#076935]"
                />
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
