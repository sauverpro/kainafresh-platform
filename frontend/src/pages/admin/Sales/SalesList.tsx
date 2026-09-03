import { useState } from "react";
import {
  Wallet,
  ShoppingBag,
  TrendingUp,
  Target,
  Search,
  Eye,
  Building2,
  Plus,
  ArrowUpRight,
  ArrowLeft,
  Download,
} from "lucide-react";
import DirectSaleModal from "../../../components/sales/DirectSaleModal";
import { toast } from "sonner";

export interface SalesTransaction {
  id: string;
  order_id: string;
  customer_name: string;
  segment: "wholesale" | "retail" | "vip";
  sales_rep: string;
  items_summary: string;
  payment_method: string;
  amount: number;
  date: string;
  status: "completed" | "processing" | "refunded";
}

const INITIAL_TRANSACTIONS: SalesTransaction[] = [
  {
    id: "SL-9401",
    order_id: "#KF-8942",
    customer_name: "Serena Hotel Kigali",
    segment: "wholesale",
    sales_rep: "Jean-Pierre (Manager)",
    items_summary: "250kg Hass Avocados, 500kg Kinigi Potatoes",
    payment_method: "Corporate Bank Wire",
    amount: 619500,
    date: "2026-08-31",
    status: "completed",
  },
  {
    id: "SL-9402",
    order_id: "#KF-8939",
    customer_name: "Simba Supermarket Gishushu",
    segment: "wholesale",
    sales_rep: "Alice Uwimana",
    items_summary: "100kg Spinach, 300kg Organic Tomatoes",
    payment_method: "Corporate Invoice",
    amount: 413000,
    date: "2026-08-30",
    status: "completed",
  },
  {
    id: "SL-9403",
    order_id: "#KF-8935",
    customer_name: "Jean-Paul Habimana",
    segment: "retail",
    sales_rep: "Direct Web Order",
    items_summary: "1 Household Organic Farm Box",
    payment_method: "MTN Mobile Money",
    amount: 25000,
    date: "2026-08-29",
    status: "completed",
  },
  {
    id: "SL-9404",
    order_id: "#KF-8930",
    customer_name: "Aline Murekatete",
    segment: "vip",
    sales_rep: "Direct Web Order",
    items_summary: "20kg Passion Fruit, 15kg Valencia Oranges",
    payment_method: "Airtel Money",
    amount: 54000,
    date: "2026-08-28",
    status: "completed",
  },
  {
    id: "SL-9405",
    order_id: "#KF-8924",
    customer_name: "Inyange Exporters Ltd",
    segment: "wholesale",
    sales_rep: "Jean-Pierre (Manager)",
    items_summary: "500kg Export Red Habanero Chilli",
    payment_method: "Bank Wire",
    amount: 1298000,
    date: "2026-08-25",
    status: "completed",
  },
];

export default function SalesList() {
  const [transactions, setTransactions] = useState<SalesTransaction[]>(INITIAL_TRANSACTIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<"all" | "wholesale" | "retail">("all");
  const [directSaleOpen, setDirectSaleOpen] = useState(false);

  // Graph Tweaking & In-Graph Drill-down States
  const [graphYear, setGraphYear] = useState<"2026" | "2025">("2026");
  const [graphMetric, setGraphMetric] = useState<"revenue" | "volume">("revenue");
  const [activeSelectedMonth, setActiveSelectedMonth] = useState<string | null>(null);

  // Helper to generate 31 days for a given month with Orange & Light Orange peak styling
  const generateDailyDataForMonth = (monthName: string) => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      let isPeak = false;
      let revVal = Math.floor(45000 + Math.random() * 85000);
      let driver = "Standard Produce Sales";

      if (monthName.toLowerCase().includes("aug")) {
        if (i === 25) {
          revVal = 1298000;
          isPeak = true;
          driver = "Inyange Exporters Bulk Chilli (#SL-9405)";
        } else if (i === 31) {
          revVal = 619500;
          isPeak = true;
          driver = "Serena Hotel Avocados (#SL-9401)";
        } else if (i === 30) {
          revVal = 413000;
          isPeak = true;
          driver = "Simba Supermarket (#SL-9402)";
        } else if (i === 15) {
          revVal = 320000;
          isPeak = true;
          driver = "Kigali Marriott Produce";
        }
      } else {
        if (i === 14 || i === 28) {
          revVal = Math.floor(350000 + Math.random() * 200000);
          isPeak = true;
          driver = "B2B Contract Fulfillment";
        }
      }

      const heightPercent = Math.min(100, Math.max(14, Math.round((revVal / 1300000) * 100))) + "%";

      days.push({
        day: i,
        dateLabel: `${monthName.slice(0, 3)} ${i}`,
        revVal,
        formattedRev: (revVal / 1000).toFixed(0) + "k RWF",
        heightPercent,
        isPeak,
        driver,
      });
    }
    return days;
  };

  // Dynamic Monthly Data based on selected year & segment filters
  const monthlyDataset = [
    {
      month: "Jan",
      year: 2026,
      rev: "1.8M",
      revenue: 1800000,
      ordersCount: 42,
      height: "42%",
      peakDays: [
        { date: "Jan 14, 2026", revenue: 450000, driver: "Supermarket Weekly Restock" },
        { date: "Jan 28, 2026", revenue: 380000, driver: "Hotel Serena Contract" },
      ],
    },
    {
      month: "Feb",
      year: 2026,
      rev: "2.1M",
      revenue: 2100000,
      ordersCount: 51,
      height: "50%",
      peakDays: [
        { date: "Feb 10, 2026", revenue: 520000, driver: "Valentine Avocado Bulk Order" },
        { date: "Feb 22, 2026", revenue: 410000, driver: "Simba Supermarket Supply" },
      ],
    },
    {
      month: "Mar",
      year: 2026,
      rev: "2.5M",
      revenue: 2500000,
      ordersCount: 63,
      height: "60%",
      peakDays: [
        { date: "Mar 15, 2026", revenue: 680000, driver: "Export Chilli Shipment #1" },
        { date: "Mar 29, 2026", revenue: 490000, driver: "Hotels Spring Contract" },
      ],
    },
    {
      month: "Apr",
      year: 2026,
      rev: "2.2M",
      revenue: 2200000,
      ordersCount: 55,
      height: "52%",
      peakDays: [
        { date: "Apr 08, 2026", revenue: 510000, driver: "Kinigi Potato Bulk Harvest" },
      ],
    },
    {
      month: "May",
      year: 2026,
      rev: "2.9M",
      revenue: 2900000,
      ordersCount: 74,
      height: "69%",
      peakDays: [
        { date: "May 12, 2026", revenue: 750000, driver: "Export Habanero Batch" },
      ],
    },
    {
      month: "Jun",
      year: 2026,
      rev: "3.4M",
      revenue: 3400000,
      ordersCount: 88,
      height: "81%",
      peakDays: [
        { date: "Jun 18, 2026", revenue: 890000, driver: "Kigali Marriott Produce Contract" },
      ],
    },
    {
      month: "Jul",
      year: 2026,
      rev: "3.8M",
      revenue: 3800000,
      ordersCount: 96,
      height: "90%",
      peakDays: [
        { date: "Jul 20, 2026", revenue: 980000, driver: "Inyange Exporters Batch #4" },
      ],
    },
    {
      month: "August",
      year: 2026,
      rev: "4.2M",
      revenue: 4200000,
      ordersCount: 112,
      height: "100%",
      active: true,
      peakDays: [
        { date: "Aug 25, 2026", revenue: 1298000, driver: "Inyange Exporters Red Chilli (#SL-9405)" },
        { date: "Aug 31, 2026", revenue: 619500, driver: "Serena Hotel Hass Avocados (#SL-9401)" },
        { date: "Aug 30, 2026", revenue: 413000, driver: "Simba Supermarket Vegetables (#SL-9402)" },
      ],
    },
  ];

  // Bento Calculations
  const grossRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalOrdersCount = transactions.length;
  const avgOrderValue = Math.round(grossRevenue / (totalOrdersCount || 1));
  const targetGoalPercent = 84.5; // 84.5% of monthly target reached

  // Top Produce Performance Mock Data
  const topProduceList = [
    { name: "Organic Hass Avocados", revenue: 1450000, percent: 38, iconBg: "bg-emerald-500" },
    { name: "Kinigi Irish Potatoes", revenue: 980000, percent: 26, iconBg: "bg-amber-500" },
    { name: "Export Red Habanero Chilli", revenue: 840000, percent: 22, iconBg: "bg-red-500" },
    { name: "Organic Tomatoes", revenue: 540000, percent: 14, iconBg: "bg-blue-500" },
  ];

  // Filtered Transactions List
  const filteredTransactions = transactions.filter((t) => {
    if (segmentFilter === "wholesale" && t.segment !== "wholesale") return false;
    if (segmentFilter === "retail" && (t.segment !== "retail" && t.segment !== "vip")) return false;

    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      const matchId = t.id.toLowerCase().includes(q);
      const matchOrder = t.order_id.toLowerCase().includes(q);
      const matchCustomer = t.customer_name.toLowerCase().includes(q);
      const matchRep = t.sales_rep.toLowerCase().includes(q);
      if (!matchId && !matchOrder && !matchCustomer && !matchRep) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sales & Revenue Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor sales performance, revenue targets, B2B wholesale volume, and OTC farm-gate transactions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.success("Sales report exported to CSV")}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-white/5"
          >
            <Download size={14} /> Export Report
          </button>
          <button
            onClick={() => setDirectSaleOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#055028] shadow-xs transition-all"
          >
            <Plus size={16} /> Record Direct Sale
          </button>
        </div>
      </div>

      {/* 1. Bento Summary Grid — 100% Homogeneous with StatCard.tsx */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Gross Sales Revenue */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#076935]/10 text-[#076935] dark:bg-green-500/15 dark:text-green-300">
            <Wallet className="h-5.5 w-5.5" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gross Sales Revenue</p>
              <p className="mt-1.5 text-2xl font-semibold text-gray-800 dark:text-white">
                {(grossRevenue / 1000000).toFixed(2)}M <span className="text-xs font-normal text-gray-400">RWF</span>
              </p>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              <ArrowUpRight size={14} /> +18.4%
            </span>
          </div>
        </div>

        {/* Card 2: Total Volume Sold */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
            <ShoppingBag className="h-5.5 w-5.5" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Produce Orders</p>
              <p className="mt-1.5 text-2xl font-semibold text-gray-800 dark:text-white">
                {totalOrdersCount} <span className="text-xs font-normal text-gray-400">transactions</span>
              </p>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
              Completed
            </span>
          </div>
        </div>

        {/* Card 3: Avg Order Value */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
            <TrendingUp className="h-5.5 w-5.5" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Order Value (AOV)</p>
              <p className="mt-1.5 text-2xl font-semibold text-gray-800 dark:text-white">
                {(avgOrderValue / 1000).toFixed(0)}k <span className="text-xs font-normal text-gray-400">RWF</span>
              </p>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
              Avg Ticket
            </span>
          </div>
        </div>

        {/* Card 4: Monthly Revenue Target */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
            <Target className="h-5.5 w-5.5" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Revenue Quota</p>
              <p className="mt-1.5 text-2xl font-semibold text-purple-600 dark:text-purple-400">
                {targetGoalPercent}% <span className="text-xs font-normal text-gray-400">Goal</span>
              </p>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-600 dark:bg-purple-500/15 dark:text-purple-300">
              On Track
            </span>
          </div>
        </div>
      </div>

      {/* 2. Monthly & 30-Day Daily Sales Trend Chart & Segment Breakdown */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Sales Trend Visualizer (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs space-y-4">
          {/* Header & Filter Controls Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-3 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2">
                {activeSelectedMonth && (
                  <button
                    onClick={() => setActiveSelectedMonth(null)}
                    className="flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700 hover:bg-orange-100 dark:border-orange-500/20 dark:bg-orange-500/15 dark:text-orange-300"
                  >
                    <ArrowLeft size={12} /> All Months
                  </button>
                )}
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp size={18} className="text-orange-600 dark:text-orange-400" />
                  {activeSelectedMonth
                    ? `${activeSelectedMonth} 2026 Daily Sales Trend`
                    : `Monthly Sales Revenue Trend (${graphYear})`}
                </h3>
              </div>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {activeSelectedMonth
                  ? `Daily sales trajectory across 31 days in ${activeSelectedMonth}. Solid orange bars highlight peak sales dates.`
                  : "Click any month bar below to switch the graph to 30-day daily sales."}
              </p>
            </div>

            {/* Clean Horizontal Graph Controls Bar */}
            <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-1 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <select
                value={graphYear}
                onChange={(e) => setGraphYear(e.target.value as "2026" | "2025")}
                className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 shadow-2xs focus:border-orange-500 focus:outline-hidden dark:border-white/10 dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="2026">Year 2026</option>
                <option value="2025">Year 2025</option>
              </select>

              <select
                value={graphMetric}
                onChange={(e) => setGraphMetric(e.target.value as "revenue" | "volume")}
                className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 shadow-2xs focus:border-orange-500 focus:outline-hidden dark:border-white/10 dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="revenue">Gross Revenue (RWF)</option>
                <option value="volume">Orders Volume</option>
              </select>
            </div>
          </div>

          {/* Graph Visualizer Area */}
          <div className="pt-2">
            {!activeSelectedMonth ? (
              /* MONTHLY VIEW (Jan - Dec) — Orange & Light Orange Theme */
              <div className="flex h-56 items-end justify-between gap-2 pt-14 pb-2 px-2 border-b border-gray-100 dark:border-white/10">
                {monthlyDataset.map((bar, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveSelectedMonth(bar.month)}
                    className="group relative flex flex-1 flex-col items-center h-full justify-end cursor-pointer"
                  >
                    {/* Floating Hover Tooltip (Always Visible) */}
                    <div className="absolute -top-11 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg bg-gray-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg dark:bg-white dark:text-gray-900 whitespace-nowrap pointer-events-none z-30 text-center">
                      {graphMetric === "revenue" ? `${bar.rev} RWF` : `${bar.ordersCount} Orders`}
                      <div className="text-[9px] text-orange-300 dark:text-orange-600 font-semibold">Click to inspect</div>
                    </div>

                    {/* Bar — Orange & Light Orange Gradient */}
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        bar.active
                          ? "bg-orange-500 shadow-xs group-hover:bg-orange-600 dark:bg-orange-500"
                          : "bg-orange-400/30 group-hover:bg-orange-500/70 dark:bg-orange-500/20 dark:group-hover:bg-orange-500/50"
                      }`}
                      style={{ height: bar.height }}
                    />

                    {/* Month Label */}
                    <span className={`mt-2 text-[11px] font-semibold ${bar.active ? "text-orange-600 font-bold dark:text-orange-400" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900"}`}>
                      {bar.month}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              /* 31-DAY DAILY VIEW — In-Graph Drill-down */
              <div className="overflow-x-auto pb-2 pt-2">
                <div className="flex h-56 min-w-[700px] items-end justify-between gap-1 pt-14 pb-2 px-1 border-b border-gray-100 dark:border-white/10">
                  {generateDailyDataForMonth(activeSelectedMonth).map((dayData, idx) => (
                    <div
                      key={idx}
                      className="group relative flex flex-1 flex-col items-center h-full justify-end cursor-pointer"
                    >
                      {/* Floating Hover Tooltip (Always Visible) */}
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg bg-gray-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg dark:bg-white dark:text-gray-900 whitespace-nowrap pointer-events-none z-30 text-center">
                        <div>{dayData.dateLabel}: <span className="text-orange-400 dark:text-orange-600">{dayData.formattedRev}</span></div>
                        {dayData.isPeak && <div className="text-[9px] text-amber-300 dark:text-amber-600 font-bold">🔥 {dayData.driver}</div>}
                      </div>

                      {/* Peak Tag */}
                      {dayData.isPeak && (
                        <span className="mb-1 text-[10px] font-black text-orange-600 animate-pulse dark:text-orange-400">
                          🔥
                        </span>
                      )}

                      {/* Daily Bar — Orange Theme */}
                      <div
                        className={`w-full rounded-t-sm transition-all duration-200 ${
                          dayData.isPeak
                            ? "bg-orange-500 shadow-xs group-hover:bg-orange-600 dark:bg-orange-500"
                            : "bg-orange-400/35 group-hover:bg-orange-500/80 dark:bg-orange-500/25 dark:group-hover:bg-orange-500/60"
                        }`}
                        style={{ height: dayData.heightPercent }}
                      />

                      {/* Day Number Label */}
                      <span className={`mt-1.5 text-[10px] font-medium ${dayData.isPeak ? "font-bold text-orange-600 dark:text-orange-400" : "text-gray-400"}`}>
                        {dayData.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
              {!activeSelectedMonth ? (
                <>
                  <span>Total YTD Revenue: <strong className="text-gray-900 dark:text-white">22.9M RWF</strong></span>
                  <span className="text-orange-600 font-semibold dark:text-orange-400">💡 Click any month bar to view 30-day daily sales</span>
                </>
              ) : (
                <>
                  <span>Viewing <strong className="text-orange-600 dark:text-orange-400">{activeSelectedMonth} 2026</strong> daily breakdown</span>
                  <button
                    onClick={() => setActiveSelectedMonth(null)}
                    className="text-orange-600 font-bold hover:underline dark:text-orange-400"
                  >
                    ← Back to 12-Month Overview
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Customer Segment Split (1 col) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-white/10">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Revenue Segment Split
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {/* B2B Wholesale */}
              <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    <Building2 size={20} />
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    B2B Wholesale
                  </span>
                </div>
                <span className="text-2xl font-black text-amber-700 dark:text-amber-300">
                  65%
                </span>
              </div>

              {/* Retail Buyers */}
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    <ShoppingBag size={20} />
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    Retail Buyers
                  </span>
                </div>
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                  35%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Compact Best Performing Produce Varieties (Moved below, uniform brand green styling) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 dark:border-white/10">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Top Performing Produce Varieties
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">Ranked by revenue share</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {topProduceList.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-white/5 dark:bg-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-800 dark:text-gray-200 truncate">
                  {item.name}
                </span>
                <span className="font-bold text-[#076935] dark:text-green-400 ml-1">
                  {item.percent}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#076935] transition-all"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 text-right">
                {item.revenue.toLocaleString()} RWF
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Filter Controls & Sales Transactions Table */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-gray-900 shadow-xs">
        {/* Segment Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-gray-100/80 rounded-xl dark:bg-white/5">
          <button
            onClick={() => setSegmentFilter("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              segmentFilter === "all"
                ? "bg-white text-gray-900 shadow-xs dark:bg-gray-800 dark:text-white"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            All Sales ({transactions.length})
          </button>
          <button
            onClick={() => setSegmentFilter("wholesale")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              segmentFilter === "wholesale"
                ? "bg-white text-amber-600 shadow-xs dark:bg-gray-800 dark:text-amber-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            B2B Wholesale
          </button>
          <button
            onClick={() => setSegmentFilter("retail")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              segmentFilter === "retail"
                ? "bg-white text-[#076935] shadow-xs dark:bg-gray-800 dark:text-green-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            Retail Buyers
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sale #, order #, client, rep..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-3.5 py-2 text-xs text-gray-900 focus:border-[#076935] focus:bg-white focus:outline-hidden dark:border-white/10 dark:bg-gray-800 dark:text-white dark:focus:border-[#076935]"
          />
        </div>
      </div>

      {/* Sales Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-white/10 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider dark:bg-white/5 dark:border-white/10 dark:text-gray-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Sale ID</th>
                <th className="px-5 py-3.5 font-semibold">Order Ref</th>
                <th className="px-5 py-3.5 font-semibold">Customer / Client</th>
                <th className="px-5 py-3.5 font-semibold">Produce Items</th>
                <th className="px-5 py-3.5 font-semibold">Sales Rep</th>
                <th className="px-5 py-3.5 font-semibold">Payment Method</th>
                <th className="px-5 py-3.5 font-semibold">Amount (RWF)</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Wallet className="h-8 w-8 text-gray-300" />
                      <p className="text-sm font-medium">No sales transactions found</p>
                      <p className="text-xs text-gray-400">Try adjusting your search terms.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/80 dark:hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                      #{tx.id}
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#076935] dark:text-green-400">
                      {tx.order_id}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {tx.customer_name}
                      </p>
                      {tx.segment === "wholesale" ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                          B2B Wholesale
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                          Retail Buyer
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                      {tx.items_summary}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400 font-medium">
                      {tx.sales_rep}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      {tx.payment_method}
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                      {tx.amount.toLocaleString()} RWF
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => toast.info(`Viewing sales receipt for ${tx.id}`)}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
                        title="View Sales Receipt"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Farm-Gate Sale Modal */}
      <DirectSaleModal
        open={directSaleOpen}
        onClose={() => setDirectSaleOpen(false)}
        onSuccess={() => {
          setTransactions((prev) => [
            {
              id: `SL-${Math.floor(9406 + Math.random() * 100)}`,
              order_id: "#OTC-DIRECT",
              customer_name: "Walk-in Buyer",
              segment: "retail",
              sales_rep: "Sales Manager Rep",
              items_summary: "Direct Farm-Gate Produce Purchase",
              payment_method: "MTN Mobile Money",
              amount: 60000,
              date: new Date().toISOString().split("T")[0],
              status: "completed",
            },
            ...prev,
          ]);
        }}
      />
    </div>
  );
}
