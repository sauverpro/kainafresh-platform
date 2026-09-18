import { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Banknote,
  Users,
  Warehouse,
  ShoppingBag,
  ArrowUpRight,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Settings,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useDepartmentStore } from "../../../store/useDepartmentStore";
import { useProductStore } from "../../../store/useProductStore";
import { apiGet } from "../../../api/client";
import {
  monthlySalesData,
  liveActivities,
  inventoryAlerts,
} from "../../../assets/data/dashboardData";
import MetricCard from "../../../components/ui/MetricCard";

export default function AdminDashboard() {
  usePageTitle("dashboard", "Executive Command Center");
  const navigate = useNavigate();
  const { departments } = useDepartmentStore();
  const { products, fetchProducts } = useProductStore();
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [revenueTotal, setRevenueTotal] = useState<number>(0);

  useEffect(() => {
    fetchProducts();
    apiGet<{ success: boolean; data: any[] }>("/api/orders")
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          setOrdersCount(res.data.length);
          const total = res.data.reduce((sum, ord) => sum + (Number(ord.total_amount) || 0), 0);
          setRevenueTotal(total);
        }
      })
      .catch(() => {
        // Fallback gracefully
      });
  }, [fetchProducts]);

  const totalDepartmentStaff = useMemo(() => {
    return departments.reduce((sum, d) => sum + d.staff_count, 0);
  }, [departments]);

  const totalDepartmentBudget = useMemo(() => {
    return departments.reduce((sum, d) => sum + d.monthly_budget_rwf, 0);
  }, [departments]);

  const executiveKpis = [
    {
      id: "revenue",
      label: "Monthly Commercial Revenue",
      value: revenueTotal > 0 ? `${(revenueTotal / 1000000).toFixed(1)}M` : "0",
      unit: "RWF",
      subtext: revenueTotal > 0 ? "Gross B2B & Export Sales" : "No current revenue data",
      icon: <Banknote size={22} className="text-[#076935]" />,
      iconBg: "bg-[#076935]/10",
      badgeText: "Revenue",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "workforce",
      label: "Total Workforce",
      value: `${totalDepartmentStaff}`,
      subtext: departments.length > 0 ? `Across ${departments.length} Department(s)` : "No active staff recorded",
      icon: <Users size={22} className="text-blue-600" />,
      iconBg: "bg-blue-50",
      badgeText: "Active Staff",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "inventory",
      label: "Inventory & Stock Health",
      value: `${products.length}`,
      unit: "Products",
      subtext: products.length > 0 ? "Active Packhouse Produce" : "No inventory items recorded",
      icon: <Warehouse size={22} className="text-amber-600" />,
      iconBg: "bg-amber-50",
      badgeText: "Healthy",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      id: "orders",
      label: "Active Commercial Orders",
      value: `${ordersCount}`,
      unit: "Orders",
      subtext: ordersCount > 0 ? "Live Order Pipeline" : "No active orders recorded",
      icon: <ShoppingBag size={22} className="text-emerald-700" />,
      iconBg: "bg-emerald-50",
      badgeText: "On Schedule",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Welcome & Quick Executive Action Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-[#076935]/15 bg-white p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#076935]/10 px-2.5 py-0.5 text-xs font-bold text-[#076935]">
              Executive Admin Portal
            </span>
            <span className="text-xs text-gray-400 font-mono">Live Operations Hub</span>
          </div>
          <h1
            className="mt-2 text-2xl font-extrabold text-gray-900"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Welcome back, Executive Admin
          </h1>
          <p className="mt-1 text-xs text-gray-500 max-w-2xl leading-relaxed">
            Real-time command center for KainaFresh enterprise operations across Farm Cultivation, HR & Workforce, Supply Chain, and B2B Commercial Sales.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => navigate("/admin/hr/employees")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#076935] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#055028]"
          >
            <Plus size={15} /> Add Employee
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3.5 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-200"
          >
            <Warehouse size={15} /> Products
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#F39927]/10 px-3.5 py-2 text-xs font-bold text-[#F39927] transition hover:bg-[#F39927] hover:text-white"
          >
            <ShoppingBag size={15} /> Orders
          </button>

          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
            title="System Settings"
          >
            <Settings size={15} /> Settings
          </button>
        </div>
      </div>

      {/* Top 4 Core Executive KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {executiveKpis.map((kpi) => (
          <MetricCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            unit={kpi.unit}
            subtext={kpi.subtext}
            icon={kpi.icon}
            iconBg={kpi.iconBg}
            badgeText={kpi.badgeText}
            badgeColor={kpi.badgeColor}
          />
        ))}
      </div>

      {/* Main Grid: Revenue & Sales Chart + Department Headcount Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2-Cols: Monthly Revenue Chart Container */}
        <div className="lg:col-span-2 rounded-2xl border border-[#076935]/15 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
                  Commercial Sales & Revenue Trend
                </h3>
                <span className="rounded-md bg-[#076935]/10 px-2 py-0.5 text-[10px] font-bold text-[#076935]">
                  RWF
                </span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                Monthly gross commercial sales and export dispatch revenue across 2026.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="h-3 w-3 rounded-sm bg-[#076935]"></span> Sales Revenue
              </span>
            </div>
          </div>

          <div className="mt-4 h-[300px] w-full relative">
            {monthlySalesData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-10 px-4 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <BarChart3 size={32} className="text-gray-300 mb-2" />
                <p className="text-xs font-bold text-gray-600">No current revenue data available</p>
                <p className="text-[11px] text-gray-400 mt-1 max-w-sm">
                  Commercial B2B sales trends and monthly revenue analytics will automatically render here as completed orders are processed.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySalesData} barCategoryGap="30%">
                  <CartesianGrid vertical={false} stroke="#f1f3f2" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 600 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    unit="M"
                  />
                  <Tooltip
                    cursor={{ fill: "#076935", fillOpacity: 0.06 }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #076935/20",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  formatter={(value) => [`${(Number(value) || 0).toFixed(1)}M RWF`, "Revenue"]}

                  />
                  <Bar dataKey="revenue_rwf" fill="#076935" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
            <span>Total recorded revenue: <strong className="text-gray-900 font-bold">{revenueTotal.toLocaleString()} RWF</strong></span>
            <button
              type="button"
              onClick={() => navigate("/sales")}
              className="inline-flex items-center gap-1 text-[#076935] font-bold hover:underline"
            >
              View Full Sales Report <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Right 1-Col: Department Headcount & Budget Widget */}
        <div className="lg:col-span-1 rounded-2xl border border-[#076935]/15 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
                  Departmental Roster
                </h3>
                <p className="text-xs text-gray-400">Human Capital & Headcount</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/admin/hr/departments")}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#076935] hover:underline"
              >
                Manage <ChevronRight size={14} />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              {departments.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <p className="text-xs font-bold text-gray-500">No current department data available</p>
                  <p className="text-[11px] text-gray-400 mt-1">Department staff breakdowns will display here.</p>
                </div>
              ) : (
                departments.map((dept) => {
                  const percent = Math.min(100, Math.round((dept.staff_count / (dept.capacity || 1)) * 100));

                  return (
                    <div key={dept.id} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 truncate">{dept.name}</span>
                        <span className="font-mono font-semibold text-gray-500 shrink-0">
                          {dept.staff_count} staff
                        </span>
                      </div>

                      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-[#076935] rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-3 flex items-center justify-between text-xs bg-[#F4FAF7] p-3 rounded-xl border border-[#076935]/10">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Combined Payroll Budget</p>
              <p className="font-bold text-gray-900 text-sm mt-0.5">
                {(totalDepartmentBudget / 1000000).toFixed(1)}M RWF / month
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-gray-400">Total Personnel</p>
              <p className="font-bold text-[#076935] text-sm mt-0.5">{totalDepartmentStaff} Staff</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Operational Activity Feed + Inventory Stock Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Live Operational Activity Log */}
        <div className="rounded-2xl border border-[#076935]/15 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#076935]" />
              <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
                Live Operational Activity
              </h3>
            </div>
            <span className="text-xs text-gray-400">Real-time log</span>
          </div>

          <div className="mt-4 space-y-3">
            {liveActivities.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <Clock size={24} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-bold text-gray-600">No current operational activity recorded</p>
                <p className="text-[11px] text-gray-400 mt-1">Live system and operational logs will automatically display here.</p>
              </div>
            ) : (
              liveActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-[#F4FAF7] transition"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${act.badgeColor}`}
                      >
                        {act.category}
                      </span>
                      <h4 className="font-bold text-gray-900 text-xs truncate">{act.title}</h4>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{act.description}</p>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 shrink-0">{act.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Inventory Stock Alerts & Packhouse Status */}
        <div className="rounded-2xl border border-[#076935]/15 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-[#F39927]" />
                <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
                  Inventory Stock & Packhouse Status
                </h3>
              </div>
              <button
                type="button"
                onClick={() => navigate("/stock")}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#F39927] hover:underline"
              >
                Manage Stock <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {inventoryAlerts.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <CheckCircle2 size={24} className="mx-auto text-[#076935]/40 mb-2" />
                  <p className="text-xs font-bold text-gray-600">No current inventory stock alerts</p>
                  <p className="text-[11px] text-gray-400 mt-1">All warehouse produce and packhouse stock levels are optimal.</p>
                </div>
              ) : (
                inventoryAlerts.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white shadow-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-gray-400">{inv.sku}</span>
                        <h4 className="font-bold text-gray-900 text-xs">{inv.product}</h4>
                      </div>
                      <p className="text-xs text-gray-400">{inv.location}</p>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-bold text-gray-800 font-mono">{inv.stock}</span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          inv.status === "Low Stock"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : inv.status === "Critical"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-3">
            <CheckCircle2 size={15} className="text-[#076935]" />
            <span>Kigali Cold Chain Hub & Packhouse systems operating normally.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

