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
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";
import MetricCard from "../../../components/ui/MetricCard";
import { apiGet } from "../../../api/client";

export interface InsurancePolicyRecord {
  id: string;
  employee_name: string;
  type: "Life" | "Health" | "Accident" | "Property/Crop";
  provider: string;
  policy_number: string;
  start_date: string;
  expiry_date: string;
  premium_rwf: number;
  status: "Active" | "Expired" | "Pending";
  notify_days: number;
  coverage_details?: string;
}

const DEFAULT_EMPLOYEES: Array<{ name: string; department: string }> = [
  { name: "Claire Uwase", department: "Quality Control" },
  { name: "Bob Niyonzima", department: "Logistics & Fleet" },
  { name: "Alice Mukamana", department: "HR & Admin" },
  { name: "David Habimana", department: "Farm Operations" },
  { name: "Esther Ingabire", department: "Finance & Admin" },
];

const INITIAL_POLICIES: InsurancePolicyRecord[] = [
  {
    id: "INS-2026-001",
    employee_name: "Claire Uwase",
    type: "Life",
    provider: "Sanlam Insurance",
    policy_number: "POL-003-2024",
    start_date: "2024-06-01",
    expiry_date: "2026-06-15",
    premium_rwf: 20000,
    status: "Active",
    notify_days: 30,
    coverage_details: "Life insurance policy coverage for staff & primary dependents",
  },
  {
    id: "INS-2026-002",
    employee_name: "Bob Niyonzima",
    type: "Health",
    provider: "RSSB Rwanda",
    policy_number: "POL-002-2025",
    start_date: "2025-01-01",
    expiry_date: "2026-07-10",
    premium_rwf: 15000,
    status: "Active",
    notify_days: 30,
    coverage_details: "RSSB RAMA health insurance scheme",
  },
  {
    id: "INS-2026-003",
    employee_name: "Alice Mukamana",
    type: "Health",
    provider: "RSSB Rwanda",
    policy_number: "POL-001-2025",
    start_date: "2025-01-01",
    expiry_date: "2026-12-31",
    premium_rwf: 15000,
    status: "Active",
    notify_days: 30,
    coverage_details: "RSSB RAMA statutory health coverage",
  },
  {
    id: "INS-2026-004",
    employee_name: "David Habimana",
    type: "Accident",
    provider: "UAP Insurance",
    policy_number: "POL-004-2025",
    start_date: "2025-01-01",
    expiry_date: "2026-12-31",
    premium_rwf: 10000,
    status: "Active",
    notify_days: 30,
    coverage_details: "Workers workplace accident compensation policy",
  },
  {
    id: "INS-2026-005",
    employee_name: "Esther Ingabire",
    type: "Health",
    provider: "RSSB Rwanda",
    policy_number: "POL-005-2025",
    start_date: "2025-01-01",
    expiry_date: "2026-12-31",
    premium_rwf: 15000,
    status: "Active",
    notify_days: 30,
    coverage_details: "RSSB RAMA statutory health coverage",
  },
];

export default function Insurance() {
  usePageTitle("insurance-management", "Insurance Management");

  const [policies, setPolicies] = useState<InsurancePolicyRecord[]>(INITIAL_POLICIES);
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicyRecord | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState(DEFAULT_EMPLOYEES);

  // Filters state matching Image 1
  const [empFilter, setEmpFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState("all");

  // Add Insurance Modal Form matching Image 2
  const [form, setForm] = useState({
    employee_name: "",
    type: "Health" as InsurancePolicyRecord["type"],
    provider: "",
    policy_number: "",
    start_date: new Date().toISOString().split("T")[0],
    expiry_date: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
    status: "Active" as InsurancePolicyRecord["status"],
    premium_rwf: 15000,
    notify_days: 30,
    coverage_details: "",
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

  const handleAddPolicySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_name.trim()) {
      toast.error("Please select an employee.");
      return;
    }
    if (!form.provider.trim()) {
      toast.error("Please enter the insurance provider.");
      return;
    }

    const newPol: InsurancePolicyRecord = {
      id: `INS-2026-00${policies.length + 1}`,
      employee_name: form.employee_name.trim(),
      type: form.type,
      provider: form.provider.trim(),
      policy_number: form.policy_number.trim() || `POL-2026-00${policies.length + 100}`,
      start_date: form.start_date,
      expiry_date: form.expiry_date,
      premium_rwf: Number(form.premium_rwf) || 0,
      status: form.status,
      notify_days: Number(form.notify_days) || 30,
      coverage_details: form.coverage_details.trim(),
    };

    setPolicies([newPol, ...policies]);
    setIsAddOpen(false);
    setForm({
      employee_name: "",
      type: "Health",
      provider: "",
      policy_number: "",
      start_date: new Date().toISOString().split("T")[0],
      expiry_date: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
      status: "Active",
      premium_rwf: 15000,
      notify_days: 30,
      coverage_details: "",
    });
    toast.success(`Insurance record registered for ${newPol.employee_name}!`);
  };

  const handleDeletePolicy = (id: string) => {
    setPolicies((prev) => prev.filter((p) => p.id !== id));
    toast.success("Insurance policy record deleted.");
  };

  // Filtered Policies calculation
  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      if (empFilter !== "all" && p.employee_name !== empFilter) return false;
      if (typeFilter !== "all" && p.type !== typeFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (expiryFilter === "expiring_30") {
        const daysLeft = Math.ceil((new Date(p.expiry_date).getTime() - Date.now()) / (1000 * 3600 * 24));
        if (daysLeft < 0 || daysLeft > 30) return false;
      } else if (expiryFilter === "expired") {
        const daysLeft = Math.ceil((new Date(p.expiry_date).getTime() - Date.now()) / (1000 * 3600 * 24));
        if (daysLeft >= 0) return false;
      }
      return true;
    });
  }, [policies, empFilter, typeFilter, statusFilter, expiryFilter]);

  const activeCount = policies.filter((p) => p.status === "Active").length;
  const expiredCount = policies.filter((p) => {
    const daysLeft = Math.ceil((new Date(p.expiry_date).getTime() - Date.now()) / (1000 * 3600 * 24));
    return daysLeft < 0 || p.status === "Expired";
  }).length;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Page Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
            Insurance Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track employee insurance policies, premiums, provider details, and expiry alerts.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#055028] shadow-xs transition"
        >
          <Plus size={16} /> Add Insurance Record
        </button>
      </div>

      {/* KPI Bento Cards matching Image 1 */}
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
          value="0"
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

      {/* Filter Toolbar Bar matching Image 1 */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Employee</label>
          <select
            value={empFilter}
            onChange={(e) => setEmpFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-2 text-xs font-medium outline-none focus:border-[#076935]"
          >
            <option value="all">All Employees</option>
            {employeeOptions.map((emp) => (
              <option key={emp.name} value={emp.name}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[130px]">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Type</label>
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
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
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
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Expiry</label>
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

      {/* Insurance Table matching Image 1 */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
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
            {filteredPolicies.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                  No insurance policies matching criteria.
                </td>
              </tr>
            ) : (
              filteredPolicies.map((pol) => {
                const daysLeft = Math.ceil((new Date(pol.expiry_date).getTime() - Date.now()) / (1000 * 3600 * 24));
                const isExpired = daysLeft < 0;

                return (
                  <tr key={pol.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-4 py-3.5 font-bold text-gray-900 text-sm">{pol.employee_name}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${
                          pol.type === "Life"
                            ? "bg-sky-100 text-sky-800"
                            : pol.type === "Health"
                            ? "bg-cyan-100 text-cyan-800"
                            : "bg-teal-100 text-teal-800"
                        }`}
                      >
                        {pol.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-800">{pol.provider}</td>
                    <td className="px-4 py-3.5 font-mono text-gray-600">{pol.policy_number}</td>
                    <td className="px-4 py-3.5 font-bold text-[#076935]">{pol.premium_rwf.toLocaleString()}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex rounded-md bg-[#076935] px-3 py-1 text-xs font-bold text-white">
                        {pol.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium">
                      {isExpired ? (
                        <span className="text-rose-600 font-bold">Expired {Math.abs(daysLeft)}d ago</span>
                      ) : (
                        <span className="text-emerald-700 font-bold">{pol.expiry_date}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-gray-700">{pol.notify_days}</td>
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
                          onClick={() => toast.info(`Editing policy #${pol.id}`)}
                          className="rounded-lg border border-blue-200 p-1.5 text-blue-600 hover:bg-blue-50 transition"
                          title="Edit Policy"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDeletePolicy(pol.id)}
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

      {/* Add Insurance Record Modal */}
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
          {/* Row 1: Employee * & Insurance Type * */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.employee_name}
                onChange={(e) => setForm({ ...form, employee_name: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
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
                Insurance Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
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

          {/* Row 2: Provider * & Policy Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Provider <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. RSSB, Radiant Insurance, Sanlam, UAP"
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Policy Number</label>
              <input
                type="text"
                placeholder="e.g. POL-2024-00123"
                value={form.policy_number}
                onChange={(e) => setForm({ ...form, policy_number: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
              />
            </div>
          </div>

          {/* Row 3: Start Date *, Expiry Date *, Status */}
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
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Row 4: Premium Amount (RWF) & Notify Days Before Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Premium Amount (RWF)</label>
              <input
                type="number"
                min="0"
                placeholder="0.00"
                value={form.premium_rwf}
                onChange={(e) => setForm({ ...form, premium_rwf: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Notify Days Before Expiry</label>
              <input
                type="number"
                min="1"
                value={form.notify_days}
                onChange={(e) => setForm({ ...form, notify_days: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
              />
            </div>
          </div>

          {/* Row 5: Coverage Details */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Coverage Details</label>
            <textarea
              rows={3}
              placeholder="Describe what is covered under this policy..."
              value={form.coverage_details}
              onChange={(e) => setForm({ ...form, coverage_details: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935] focus:ring-1 focus:ring-[#076935]"
            />
          </div>

          {/* Footer Actions */}
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

      {/* Policy Details View Modal */}
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
            {/* Header Card */}
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
                  <h3 className="font-bold text-gray-900 text-base">{selectedPolicy.employee_name}</h3>
                  <p className="text-xs font-medium text-gray-500">
                    {selectedPolicy.provider} · <span className="font-semibold text-[#076935]">{selectedPolicy.type} Policy</span>
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 shadow-2xs">
                {selectedPolicy.policy_number}
              </span>
            </div>

            {/* Bento Grid Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Policy Type</span>
                <span className="inline-flex rounded-md bg-cyan-100/70 px-2.5 py-0.5 text-xs font-bold text-cyan-800">
                  {selectedPolicy.type}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Status</span>
                <span className="inline-flex rounded-md bg-[#076935] px-3 py-0.5 text-xs font-bold text-white">
                  {selectedPolicy.status}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Start & Expiry Date</span>
                <p className="font-semibold text-gray-800 text-xs">
                  {selectedPolicy.start_date} <span className="text-gray-400 font-normal">to</span>{" "}
                  <span className="text-emerald-700 font-bold">{selectedPolicy.expiry_date}</span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Monthly Premium</span>
                <p className="font-bold text-[#076935] text-xs">{selectedPolicy.premium_rwf.toLocaleString()} RWF</p>
              </div>
            </div>

            {/* Coverage Details Card */}
            {selectedPolicy.coverage_details && (
              <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-1">
                <span className="text-xs font-bold text-gray-500 block mb-1">Coverage Scope & Details:</span>
                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {selectedPolicy.coverage_details}
                </p>
              </div>
            )}

            {/* Footer */}
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
