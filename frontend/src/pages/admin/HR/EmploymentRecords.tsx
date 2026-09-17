import { useState } from "react";
import {
  AlertCircle,
  RefreshCw,
  Search,
  Eye,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";

export interface ContractRecord {
  id: string;
  employee_name: string;
  employee_code: string;
  contract_type: "Full-Time Permanent" | "Part-Time" | "Seasonal Farm Worker" | "Fixed-Term Contract";
  job_title: string;
  department: string;
  start_date: string;
  end_date: string | null;
  status: "Active" | "Expiring Soon" | "Expired" | "Renewed";
  salary_rwf: number;
}

const INITIAL_RECORDS: ContractRecord[] = [
  {
    id: "CTR-2026-01",
    employee_name: "Jean-Claude Mugisha",
    employee_code: "KF-EMP-101",
    contract_type: "Full-Time Permanent",
    job_title: "Senior Agronomist",
    department: "Farm Operations",
    start_date: "2024-03-15",
    end_date: null,
    status: "Active",
    salary_rwf: 650000,
  },
  {
    id: "CTR-2026-02",
    employee_name: "Patrick Nshimiyimana",
    employee_code: "KF-EMP-105",
    contract_type: "Seasonal Farm Worker",
    job_title: "Harvest Supervisor (Plot B)",
    department: "Farm Operations",
    start_date: "2025-05-01",
    end_date: "2026-09-30",
    status: "Expiring Soon",
    salary_rwf: 250000,
  },
  {
    id: "CTR-2026-03",
    employee_name: "Aline Murekatete",
    employee_code: "KF-EMP-108",
    contract_type: "Fixed-Term Contract",
    job_title: "Food Safety Auditor",
    department: "Post-Harvest & Packaging",
    start_date: "2025-10-01",
    end_date: "2026-10-01",
    status: "Expiring Soon",
    salary_rwf: 480000,
  },
  {
    id: "CTR-2026-04",
    employee_name: "Alice Uwimana",
    employee_code: "KF-EMP-102",
    contract_type: "Full-Time Permanent",
    job_title: "Quality Control Supervisor",
    department: "Post-Harvest & Packaging",
    start_date: "2024-06-01",
    end_date: null,
    status: "Active",
    salary_rwf: 520000,
  },
];

export default function EmploymentRecords() {
  usePageTitle("employment-records", "Employment Records");

  const [records, setRecords] = useState<ContractRecord[]>(INITIAL_RECORDS);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<ContractRecord | null>(null);

  const expiringCount = records.filter((r) => r.status === "Expiring Soon").length;

  const handleRenewContract = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Renewed", end_date: "2027-09-30" } : r))
    );
    setSelectedRecord(null);
    toast.success(`Contract #${id} successfully renewed for 12 months!`);
  };

  const filtered = records.filter(
    (r) =>
      r.employee_name.toLowerCase().includes(search.toLowerCase()) ||
      r.job_title.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
            Employment Records & Contracts
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track full-time staff, seasonal farm contracts, fixed terms, and renewal alerts.
          </p>
        </div>
      </div>

      {/* Expiring Alert Banner */}
      {expiringCount > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
          <div className="flex items-center gap-2.5 font-bold">
            <AlertCircle size={20} className="text-amber-600 shrink-0" />
            <span>{expiringCount} employment contracts are expiring within the next 30 days!</span>
          </div>
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-lg">
            Action Required
          </span>
        </div>
      )}

      {/* Table Card */}
      <div className="overflow-hidden rounded-2xl border border-[#076935]/10 bg-white">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative min-w-[260px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee, contract ID..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-3 py-2 text-xs outline-none focus:border-[#076935]"
            />
          </div>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#F4FAF7] border-b border-[#076935]/10 text-gray-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Contract ID</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Contract Type</th>
              <th className="px-4 py-3">Job Title & Dept</th>
              <th className="px-4 py-3">Start Date</th>
              <th className="px-4 py-3">End Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((rec) => (
              <tr key={rec.id} className="hover:bg-[#F4FAF7]/50 transition">
                <td className="px-4 py-3 font-bold text-gray-900 font-mono">{rec.id}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{rec.employee_name}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{rec.employee_code}</p>
                </td>
                <td className="px-4 py-3 font-semibold text-[#076935]">{rec.contract_type}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-800">{rec.job_title}</p>
                  <p className="text-[11px] text-gray-500">{rec.department}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{rec.start_date}</td>
                <td className="px-4 py-3 text-gray-600">{rec.end_date || "Indefinite"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      rec.status === "Active" || rec.status === "Renewed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {rec.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-1">
                  <button
                    onClick={() => setSelectedRecord(rec)}
                    className="p-1 text-[#076935] hover:bg-[#076935]/10 rounded-lg inline-flex items-center"
                    title="View Contract Details"
                  >
                    <Eye size={15} />
                  </button>
                  {rec.status === "Expiring Soon" && (
                    <button
                      onClick={() => handleRenewContract(rec.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#076935] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#055028]"
                    >
                      <RefreshCw size={12} /> Renew
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Contract Detail Modal */}
      <Modal open={Boolean(selectedRecord)} onClose={() => setSelectedRecord(null)} size="md" title="Contract Details">
        {selectedRecord && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#F4FAF7] rounded-xl border border-[#076935]/15">
              <p className="font-bold text-[#076935] text-sm">{selectedRecord.employee_name}</p>
              <p className="text-gray-500">{selectedRecord.job_title} • {selectedRecord.department}</p>
            </div>
            <div className="space-y-1">
              <p><strong>Contract ID:</strong> {selectedRecord.id}</p>
              <p><strong>Type:</strong> {selectedRecord.contract_type}</p>
              <p><strong>Start Date:</strong> {selectedRecord.start_date}</p>
              <p><strong>End Date:</strong> {selectedRecord.end_date || "Indefinite"}</p>
              <p><strong>Monthly Compensation:</strong> {selectedRecord.salary_rwf.toLocaleString()} RWF</p>
              <p><strong>Status:</strong> {selectedRecord.status}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

