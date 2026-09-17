import { useState } from "react";
import {
  Users,
  UserCheck,
  CalendarCheck,
  Banknote,
  Plus,
  Clock,
  Briefcase,
  FileCheck,
  Award,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";

export default function HRDashboard() {
  usePageTitle("hr-dashboard", "HR Dashboard");

  const [activeTab, setActiveTab] = useState<"all" | "farm" | "office">("all");

  const kpis = [
    {
      label: "Total Workforce",
      value: "148",
      subtext: "+12 this month",
      icon: <Users size={22} className="text-[#076935]" />,
      accent: "bg-[#076935]/10",
      badge: "Active Staff",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Active Contracts",
      value: "135",
      subtext: "13 Expiring Soon",
      icon: <Briefcase size={22} className="text-blue-600" />,
      accent: "bg-blue-50",
      badge: "91% Verified",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      label: "Pending Leave Requests",
      value: "8",
      subtext: "Requires Manager Sign-off",
      icon: <CalendarCheck size={22} className="text-[#F39927]" />,
      accent: "bg-[#F39927]/10",
      badge: "Action Needed",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      label: "Monthly Gross Payroll",
      value: "28.4M",
      currency: "RWF",
      subtext: "Cycle ends in 4 days",
      icon: <Banknote size={22} className="text-emerald-700" />,
      accent: "bg-emerald-50",
      badge: "On Schedule",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ];

  const departmentStats = [
    { name: "Farm Operations & Cultivation", count: 72, percent: 48, color: "bg-[#076935]" },
    { name: "Post-Harvest & Packaging", count: 34, percent: 23, color: "bg-[#F39927]" },
    { name: "Logistics & Fleet Delivery", count: 22, percent: 15, color: "bg-blue-600" },
    { name: "Sales & B2B Accounts", count: 12, percent: 8, color: "bg-purple-600" },
    { name: "Admin, HR & Finance", count: 8, percent: 6, color: "bg-teal-600" },
  ];

  const recentActivities = [
    {
      id: 1,
      title: "New Seasonal Contract Signed",
      user: "Jean-Claude Mugisha (Harvest Crew Plot B)",
      time: "25 minutes ago",
      type: "contract",
      icon: <FileCheck size={16} className="text-[#076935]" />,
    },
    {
      id: 2,
      title: "Annual Leave Approved",
      user: "Alice Uwimana (Packaging Team Lead)",
      time: "2 hours ago",
      type: "leave",
      icon: <CalendarCheck size={16} className="text-blue-600" />,
    },
    {
      id: 3,
      title: "Organic Safety Certification Passed",
      user: "14 Farm Technicians completed EU Organic Handling",
      time: "Yesterday, 16:30",
      type: "training",
      icon: <Award size={16} className="text-amber-600" />,
    },
    {
      id: 4,
      title: "Payroll Disbursed for August Shift",
      user: "34 Seasonal Workers via MTN MoMo Bulk Pay",
      time: "Sep 12, 2026",
      type: "payroll",
      icon: <Banknote size={16} className="text-emerald-600" />,
    },
  ];

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
          <div
            key={idx}
            className="rounded-2xl border border-[#076935]/10 bg-white p-5 transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${kpi.accent}`}>
                {kpi.icon}
              </div>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${kpi.badgeColor}`}>
                {kpi.badge}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                {kpi.label}
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span
                  className="text-3xl font-extrabold text-gray-900"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {kpi.value}
                </span>
                {kpi.currency && (
                  <span className="text-xs font-semibold text-gray-500">{kpi.currency}</span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">{kpi.subtext}</p>
            </div>
          </div>
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
                  148 Staff
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
              {departmentStats.map((dept, idx) => {
                // Max y-axis baseline = 80 staff
                const heightPercent = Math.min(100, Math.max(12, (dept.count / 80) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end">
                    {/* Count Badge on top of bar */}
                    <span className="mb-2 text-xs font-black text-gray-800 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md shadow-2xs group-hover:scale-110 group-hover:bg-[#076935] group-hover:text-white transition">
                      {dept.count}
                    </span>

                    {/* Bar Column Container */}
                    <div className="w-full max-w-[48px] bg-gray-100 rounded-t-xl overflow-hidden flex items-end h-[75%] relative">
                      <div
                        className={`w-full rounded-t-xl transition-all duration-700 ease-out ${dept.color} shadow-xs group-hover:brightness-110`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* Department X-Axis Label */}
                    <div className="mt-3 text-center min-h-[32px]">
                      <p className="text-[11px] font-bold text-gray-700 group-hover:text-[#076935] transition leading-tight line-clamp-2">
                        {dept.name.split(" ")[0]}
                      </p>
                      <p className="text-[10px] text-gray-400 font-semibold">{dept.percent}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department Legend & Details Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-gray-100">
            {departmentStats.map((dept, idx) => (
              <div key={idx} className="rounded-xl border border-gray-100 bg-gray-50/60 p-2.5 flex flex-col justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${dept.color} shrink-0`} />
                  <span className="text-[11px] font-bold text-gray-800 truncate">{dept.name}</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between text-xs">
                  <span className="font-mono text-gray-500">{dept.percent}%</span>
                  <span className="font-extrabold text-gray-900">{dept.count} staff</span>
                </div>
              </div>
            ))}
          </div>

          {/* Compliance Footer Banner */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl bg-[#F4FAF7] p-3 text-xs text-[#076935] font-medium border border-[#076935]/15">
            <span className="flex items-center gap-1.5">
              <UserCheck size={16} /> 100% of seasonal workers are covered under KainaFresh Health & Safety guidelines
            </span>
            <button type="button" className="font-bold underline hover:text-[#055028] text-left sm:text-right">
              View Safety Audit
            </button>
          </div>
        </div>

        {/* Recent HR Activity Timeline (1 Col) */}
        <div className="rounded-2xl border border-[#076935]/10 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
              Recent HR Activity
            </h3>
            <span className="text-xs text-[#F39927] font-semibold">Live Feed</span>
          </div>

          <div className="space-y-4 pt-1">
            {recentActivities.map((act) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
