export interface MonthlyRevenuePoint {
  month: string;
  revenue_rwf: number;
  orders: number;
}

/** Commercial B2B Revenue & Dispatch volume (in Millions RWF) */
export const monthlySalesData: MonthlyRevenuePoint[] = [
  { month: "Jan", revenue_rwf: 18.5, orders: 42 },
  { month: "Feb", revenue_rwf: 21.2, orders: 58 },
  { month: "Mar", revenue_rwf: 19.8, orders: 50 },
  { month: "Apr", revenue_rwf: 24.5, orders: 65 },
  { month: "May", revenue_rwf: 22.1, orders: 60 },
  { month: "Jun", revenue_rwf: 26.8, orders: 74 },
  { month: "Jul", revenue_rwf: 25.4, orders: 70 },
  { month: "Aug", revenue_rwf: 27.9, orders: 81 },
  { month: "Sep", revenue_rwf: 28.4, orders: 86 },
];

export interface ExecutiveKpi {
  id: string;
  label: string;
  value: string;
  subtext: string;
  change: string;
  trend: "up" | "down";
  color: "green" | "blue" | "orange" | "emerald";
}

export const executiveKpis: ExecutiveKpi[] = [
  {
    id: "revenue",
    label: "Monthly Commercial Revenue",
    value: "28.4M RWF",
    subtext: "Gross B2B & Export Sales",
    change: "+14.2%",
    trend: "up",
    color: "green",
  },
  {
    id: "workforce",
    label: "Active Workforce (HR)",
    value: "148 Staff",
    subtext: "Across 5 Operational Divisions",
    change: "+6 Staff",
    trend: "up",
    color: "blue",
  },
  {
    id: "inventory",
    label: "Inventory & Stock Health",
    value: "42 Products",
    subtext: "3 Items Below Reorder Point",
    change: "3 Alerts",
    trend: "down",
    color: "orange",
  },
  {
    id: "orders",
    label: "Active Commercial Orders",
    value: "86 Orders",
    subtext: "12 Awaiting Packhouse Dispatch",
    change: "+18.5%",
    trend: "up",
    color: "emerald",
  },
];

export interface LiveActivity {
  id: string;
  title: string;
  category: "HR" | "Inventory" | "Sales" | "CMS";
  timestamp: string;
  description: string;
  badgeColor: string;
}

export const liveActivities: LiveActivity[] = [
  {
    id: "act-1",
    title: "New Agronomist Onboarded",
    category: "HR",
    timestamp: "25 mins ago",
    description: "Jean-Claude Mugisha assigned to Musanze Plot A.",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "act-2",
    title: "B2B Export Order Received",
    category: "Sales",
    timestamp: "1 hour ago",
    description: "Kigali Marriott Hotel placed 450kg organic avocados order.",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    id: "act-3",
    title: "Stock Reorder Warning",
    category: "Inventory",
    timestamp: "3 hours ago",
    description: "Hass Avocados stock reached threshold (180kg remaining).",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    id: "act-4",
    title: "CMS Homepage Banner Updated",
    category: "CMS",
    timestamp: "5 hours ago",
    description: "Wholesale harvest promotion published by Content Admin.",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
  },
];

export interface InventoryAlert {
  id: string;
  product: string;
  sku: string;
  stock: string;
  status: "Low Stock" | "Optimal" | "Critical";
  location: string;
}

export const inventoryAlerts: InventoryAlert[] = [
  {
    id: "inv-1",
    product: "Organic Hass Avocados (Grade A)",
    sku: "KF-PRD-AVO",
    stock: "180 kg",
    status: "Low Stock",
    location: "Musanze Cold Store A",
  },
  {
    id: "inv-2",
    product: "Fresh Harvest French Beans",
    sku: "KF-PRD-BEA",
    stock: "420 kg",
    status: "Optimal",
    location: "Kigali Packhouse Hub",
  },
  {
    id: "inv-3",
    product: "Birdseye Red Chillies (Export)",
    sku: "KF-PRD-CHI",
    stock: "45 kg",
    status: "Critical",
    location: "Kigali Packhouse Hub",
  },
];

/** Legacy exports for compatibility */
export const monthlySales = monthlySalesData.map((d) => ({
  month: d.month,
  sales: Math.round(d.revenue_rwf * 10),
}));

export const monthlyTarget = {
  percent: 78.5,
  changeLabel: "+14.2%",
  target: "28.4M RWF",
  revenue: "28.4M RWF",
  today: "1.2M RWF",
  message: "Commercial B2B performance is tracking +14.2% higher than target.",
};

export const weeklyStatistics = [
  { label: "Aug 11", revenue: 18.2, sales: 42 },
  { label: "Aug 12", revenue: 19.0, sales: 38 },
  { label: "Aug 13", revenue: 17.0, sales: 55 },
  { label: "Aug 14", revenue: 17.8, sales: 60 },
  { label: "Aug 15", revenue: 16.8, sales: 58 },
  { label: "Aug 16", revenue: 19.5, sales: 90 },
  { label: "Aug 17", revenue: 22.5, sales: 108 },
];

export const overviewStats = [
  { id: "customers", label: "Customers", value: "3,782", change: "11.01%", trend: "up" as const },
  { id: "orders", label: "Orders", value: "5,359", change: "9.05%", trend: "down" as const },
];
