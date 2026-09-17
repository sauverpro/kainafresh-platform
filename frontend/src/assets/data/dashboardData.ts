export interface MonthlyRevenuePoint {
  month: string;
  revenue_rwf: number;
  orders: number;
}

/** Commercial B2B Revenue & Dispatch volume (in Millions RWF) - Default empty */
export const monthlySalesData: MonthlyRevenuePoint[] = [];

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
    value: "0 RWF",
    subtext: "No revenue data recorded yet",
    change: "0%",
    trend: "up",
    color: "green",
  },
  {
    id: "workforce",
    label: "Active Workforce (HR)",
    value: "0 Staff",
    subtext: "No active staff recorded yet",
    change: "0 Staff",
    trend: "up",
    color: "blue",
  },
  {
    id: "inventory",
    label: "Inventory & Stock Health",
    value: "0 Products",
    subtext: "No inventory alerts recorded",
    change: "0 Alerts",
    trend: "down",
    color: "orange",
  },
  {
    id: "orders",
    label: "Active Commercial Orders",
    value: "0 Orders",
    subtext: "No active orders recorded",
    change: "0%",
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

export const liveActivities: LiveActivity[] = [];

export interface InventoryAlert {
  id: string;
  product: string;
  sku: string;
  stock: string;
  status: "Low Stock" | "Optimal" | "Critical";
  location: string;
}

export const inventoryAlerts: InventoryAlert[] = [];

/** Legacy exports for compatibility */
export const monthlySales = monthlySalesData.map((d) => ({
  month: d.month,
  sales: Math.round(d.revenue_rwf * 10),
}));

export const monthlyTarget = {
  percent: 0,
  changeLabel: "0%",
  target: "0 RWF",
  revenue: "0 RWF",
  today: "0 RWF",
  message: "No current target performance data recorded.",
};

export const weeklyStatistics: { label: string; revenue: number; sales: number }[] = [];

export const overviewStats = [
  { id: "customers", label: "Customers", value: "0", change: "0%", trend: "up" as const },
  { id: "orders", label: "Orders", value: "0", change: "0%", trend: "down" as const },
];

