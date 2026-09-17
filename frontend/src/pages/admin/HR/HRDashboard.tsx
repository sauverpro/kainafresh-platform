import { useState, useMemo } from "react";
import {
  Users,
  CalendarCheck,
  Banknote,
  Plus,
  Clock,
  Briefcase,
  UserCheck,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useDepartmentStore } from "../../../store/useDepartmentStore";
import MetricCard from "../../../components/ui/MetricCard";

export interface HRActivity {
  id: number;
  title: string;
  user: string;
  time: string;
  type: string;
  icon: React.ReactNode;
}

export default function HRDashboard() {
  usePageTitle("hr-dashboard", "HR Dashboard");

  const [activeTab, setActiveTab] = useState<"all" | "farm" | "office">("all");
  const { departments } = useDepartmentStore();

  const totalWorkforce = useMemo(() => {
    return departments.reduce((sum, d) => sum + d.staff_count, 0);
  }, [departments]);

  const totalPayrollBudget = useMemo(() => {
    return departments.reduce((sum, d) => sum + d.monthly_budget_rwf, 0);
  }, [departments]);

  const kpis = [
    {
      label: "Total Workforce",
      value: `${totalWorkforce}`,
      subtext: totalWorkforce > 0 ? "Active Workforce" : "No active staff recorded",
      icon: <Users size={22} className="text-[#076935]" />,
      accent: "bg-[#076935]/10",
      badge: "Active Staff",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Active Contracts",
      value: "0",
      subtext: "No active contracts recorded",
      icon: <Briefcase size={22} className="text-blue-600" />,
      accent: "bg-blue-50",
      badge: "0% Verified",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      label: "Pending Leave Requests",
      value: "0",
      subtext: "No pending requests",
      icon: <CalendarCheck size={22} className="text-[#F39927]" />,
      accent: "bg-[#F39927]/10",
      badge: "Healthy",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      label: "Monthly Gross Payroll",
      value: totalPayrollBudget > 0 ? `${(totalPayrollBudget / 1000000).toFixed(1)}M` : "0",
      currency: "RWF",
      subtext: totalPayrollBudget > 0 ? "Departmental Payroll Budget" : "No payroll data recorded",
      icon: <Banknote size={22} className="text-emerald-700" />,
      accent: "bg-emerald-50",
      badge: "On Schedule",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ];

  const recentActivities: HRActivity[] = [];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Human Resources Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Workforce analytics, employee records, leave approvals, payroll, and health compliance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#055028]"
          >
            <Plus size={16} />
            Quick HR Action
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <MetricCard
            key={idx}
            label={kpi.label}
            value={kpi.value}
            unit={kpi.currency}
            subtext={kpi.subtext}
            icon={kpi.icon}
            iconBg={kpi.accent}
            badgeText={kpi.badge}
            badgeColor={kpi.badgeColor}
          />
        ))}
      </div>

      {/* Middle Layout: Department Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Department Workforce Share — Visual Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-[#076935]/15 bg-white p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
                  Workforce Distribution Bar Chart
                </h3>
                <span className="rounded-md bg-[#076935]/10 px-2 py-0.5 text-[11px] font-bold text-[#076935]">
                  {totalWorkforce} Staff
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Headcount breakdown across agricultural, logistics, sales, and administrative divisions
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 self-start sm:self-auto">
              {(["all", "farm", "office"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition ${
                    activeTab === tab ? "bg-white text-[#076935] shadow-xs" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart Visual Canvas */}
          {departments.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <p className="text-xs font-bold text-gray-600">No current workforce distribution data available</p>
              <p className="text-[11px] text-gray-400 mt-1">Department staff breakdowns will automatically render here as employees are added.</p>
            </div>
          ) : (
            <>
              <div className="relative pt-6 pb-2">
                {/* Y-Axis Gridlines & Reference Marks */}
                <div className="absolute inset-x-0 top-6 bottom-12 flex flex-col justify-between pointer-events-none text-[10px] text-gray-400 font-mono">
                  <div className="border-b border-dashed border-gray-200 w-full flex justify-between items-center pr-2">
                    <span>80 staff</span>
                  </div>
                  <div className="border-b border-dashed border-gray-200 w-full flex justify-between items-center pr-2">
                    <span>60 staff</span>
                  </div>
                  <div className="border-b border-dashed border-gray-200 w-full flex justify-between items-center pr-2">
                    <span>40 staff</span>
                  </div>
                  <div className="border-b border-dashed border-gray-200 w-full flex justify-between items-center pr-2">
                    <span>20 staff</span>
                  </div>
                  <div className="border-b border-gray-200 w-full flex justify-between items-center pr-2">
                    <span>0</span>
                  </div>
                </div>

                {/* Vertical Bar Columns Grid */}
                <div className="relative h-64 pl-12 pr-4 flex items-end justify-between gap-3 sm:gap-6 z-10">
                  {departments.map((dept) => {
                    const percent = totalWorkforce > 0 ? Math.round((dept.staff_count / totalWorkforce) * 100) : 0;
                    const heightPercent = Math.min(100, Math.max(12, (dept.staff_count / 80) * 100));

                    return (
                      <div key={dept.id} className="flex-1 flex flex-col items-center group h-full justify-end">
                        {/* Count Badge on top of bar */}
                        <span className="mb-2 text-xs font-black text-gray-800 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md shadow-2xs group-hover:scale-110 group-hover:bg-[#076935] group-hover:text-white transition">
                          {dept.staff_count}
                        </span>

                        {/* Bar Column Container */}
                        <div className="w-full max-w-[48px] bg-gray-100 rounded-t-xl overflow-hidden flex items-end h-[75%] relative">
                          <div
                            className="w-full rounded-t-xl transition-all duration-700 ease-out bg-[#076935] shadow-xs group-hover:brightness-110"
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>

                        {/* Department X-Axis Label */}
                        <div className="mt-3 text-center min-h-[32px]">
                          <p className="text-[11px] font-bold text-gray-700 group-hover:text-[#076935] transition leading-tight line-clamp-2">
                            {dept.name.split(" ")[0]}
                          </p>
                          <p className="text-[10px] text-gray-400 font-semibold">{percent}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Department Legend & Details Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-gray-100">
                {departments.map((dept) => {
                  const percent = totalWorkforce > 0 ? Math.round((dept.staff_count / totalWorkforce) * 100) : 0;

                  return (
                    <div key={dept.id} className="rounded-xl border border-gray-100 bg-gray-50/60 p-2.5 flex flex-col justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#076935] shrink-0" />
                        <span className="text-[11px] font-bold text-gray-800 truncate">{dept.name}</span>
                      </div>
                      <div className="mt-2 flex items-baseline justify-between text-xs">
                        <span className="font-mono text-gray-500">{percent}%</span>
                        <span className="font-extrabold text-gray-900">{dept.staff_count} staff</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Compliance Footer Banner */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl bg-[#F4FAF7] p-3 text-xs text-[#076935] font-medium border border-[#076935]/15">
            <span className="flex items-center gap-1.5">
              <UserCheck size={16} /> 100% of workers covered under KainaFresh Health & Safety guidelines
            </span>
            <button type="button" className="font-bold underline hover:text-[#055028] text-left sm:text-right">
              View Safety Audit
            </button>
          </div>
        </div>

        {/* Recent HR Activity Timeline (1 Col) */}
        <div className="rounded-2xl border border-[#076935]/10 bg-white p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
                Recent HR Activity
              </h3>
              <span className="text-xs text-[#F39927] font-semibold">Live Feed</span>
            </div>

            <div className="space-y-4 pt-3">
              {recentActivities.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <Clock size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-xs font-bold text-gray-600">No current HR activity recorded</p>
                  <p className="text-[11px] text-gray-400 mt-1">Contract signings, leave approvals, and payroll events will appear here.</p>
                </div>
              ) : (
                recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-50 border border-gray-200">
                      {act.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 leading-snug">{act.title}</p>
                      <p className="text-xs text-gray-500 truncate">{act.user}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                        <Clock size={10} /> {act.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

