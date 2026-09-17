import { useState } from "react";
import {
  ShieldCheck,
  Heart,
  Plus,
  Building,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";

export interface InsurancePolicy {
  id: string;
  employee_name: string;
  provider: "RSSB RAMA" | "SANLAM Medical" | "MUA Insurance Workers Comp" | "BRITAM";
  policy_number: string;
  coverage_tier: "Comprehensive Medical" | "Workers Compensation" | "Family Medical";
  dependents_count: number;
  monthly_premium_rwf: number;
  status: "Active" | "Pending Renewal";
}

const INITIAL_POLICIES: InsurancePolicy[] = [];

export default function Insurance() {
  usePageTitle("insurance-management", "Insurance & Benefits");

  const [policies, setPolicies] = useState<InsurancePolicy[]>(INITIAL_POLICIES);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    employee_name: "",
    provider: "RSSB RAMA" as InsurancePolicy["provider"],
    policy_number: "",
    coverage_tier: "Comprehensive Medical" as InsurancePolicy["coverage_tier"],
    dependents_count: 0,
    monthly_premium_rwf: 25000,
  });

  const totalInsured = policies.length;
  const totalPremiums = policies.reduce((acc, p) => acc + p.monthly_premium_rwf, 0);

  const handleAddPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_name.trim()) {
      toast.error("Please enter employee name.");
      return;
    }

    const newPol: InsurancePolicy = {
      id: `INS-2026-0${policies.length + 1}`,
      employee_name: form.employee_name.trim(),
      provider: form.provider,
      policy_number: form.policy_number || `POL-${Math.floor(100000 + Math.random() * 900000)}`,
      coverage_tier: form.coverage_tier,
      dependents_count: Number(form.dependents_count),
      monthly_premium_rwf: Number(form.monthly_premium_rwf),
      status: "Active",
    };

    setPolicies([newPol, ...policies]);
    setIsAddOpen(false);
    toast.success(`Insurance policy registered for ${newPol.employee_name}!`);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
            Employee Insurance & Benefits
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            RAMA / RSSB health coverage, SANLAM medical schemes, and workers' compensation policies.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#055028]"
        >
          <Plus size={16} /> Enroll Policy
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#076935] text-white font-bold">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">Covered Employees</p>
              <p className="text-2xl font-extrabold text-[#076935]">{totalInsured} Staff Active</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
              <Heart size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-900">Total Monthly Premium</p>
              <p className="text-2xl font-extrabold text-blue-900">{totalPremiums.toLocaleString()} RWF</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white font-bold">
              <Building size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-900">Primary Partner</p>
              <p className="text-lg font-bold text-purple-900">RSSB RAMA Rwanda</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#076935]/10 bg-white">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#F4FAF7] border-b border-[#076935]/10 text-gray-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Policy ID</th>
              <th className="px-4 py-3">Employee Name</th>
              <th className="px-4 py-3">Insurance Provider</th>
              <th className="px-4 py-3">Policy Number</th>
              <th className="px-4 py-3">Coverage Tier</th>
              <th className="px-4 py-3">Dependents</th>
              <th className="px-4 py-3">Monthly Premium</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {policies.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <ShieldCheck size={28} className="text-gray-300" />
                    <p className="text-sm font-semibold text-gray-700">No current insurance policies recorded</p>
                    <p className="text-xs text-gray-400 font-normal">Active insurance enrollments will appear here once added.</p>
                  </div>
                </td>
              </tr>
            ) : (
              policies.map((pol) => (
                <tr key={pol.id} className="hover:bg-[#F4FAF7]/50 transition">
                  <td className="px-4 py-3 font-bold font-mono text-gray-900">{pol.id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{pol.employee_name}</td>
                  <td className="px-4 py-3 font-semibold text-[#076935]">{pol.provider}</td>
                  <td className="px-4 py-3 font-mono text-gray-600">{pol.policy_number}</td>
                  <td className="px-4 py-3 text-gray-600">{pol.coverage_tier}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{pol.dependents_count} Dependents</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{pol.monthly_premium_rwf.toLocaleString()} RWF</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      {pol.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      {/* Add Policy Modal */}
      <Modal open={isAddOpen} onClose={() => setIsAddOpen(false)} size="md" title="Enroll Employee Insurance Policy">
        <form onSubmit={handleAddPolicy} className="space-y-3 text-xs">
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
            <label className="font-bold text-gray-700">Insurance Provider</label>
            <select
              value={form.provider}
              onChange={(e) => setForm({ ...form, provider: e.target.value as InsurancePolicy["provider"] })}
              className="mt-1 w-full rounded-xl border p-2.5 outline-none focus:border-[#076935]"
            >
              <option value="RSSB RAMA">RSSB RAMA</option>
              <option value="SANLAM Medical">SANLAM Medical</option>
              <option value="MUA Insurance Workers Comp">MUA Insurance Workers Comp</option>
              <option value="BRITAM">BRITAM</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-gray-700">Dependents</label>
              <input
                type="number"
                value={form.dependents_count}
                onChange={(e) => setForm({ ...form, dependents_count: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border p-2.5 outline-none focus:border-[#076935]"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700">Premium (RWF)</label>
              <input
                type="number"
                value={form.monthly_premium_rwf}
                onChange={(e) => setForm({ ...form, monthly_premium_rwf: Number(e.target.value) })}
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
              Enroll Policy
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
