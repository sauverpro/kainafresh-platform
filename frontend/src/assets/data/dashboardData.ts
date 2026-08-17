export interface MonthlySalesPoint {
  month: string;
  sales: number;
}

/** Bar chart: units sold per month */
export const monthlySales: MonthlySalesPoint[] = [
  { month: "Jan", sales: 168 },
  { month: "Feb", sales: 385 },
  { month: "Mar", sales: 201 },
  { month: "Apr", sales: 298 },
  { month: "May", sales: 187 },
  { month: "Jun", sales: 195 },
  { month: "Jul", sales: 291 },
  { month: "Aug", sales: 110 },
  { month: "Sep", sales: 215 },
  { month: "Oct", sales: 380 },
  { month: "Nov", sales: 312 },
  { month: "Dec", sales: 105 },
];

export interface StatisticsPoint {
  label: string;
  revenue: number;
  sales: number;
}

/** Area chart: revenue vs. sales trend across the week */
export const weeklyStatistics: StatisticsPoint[] = [
  { label: "Aug 11", revenue: 182, sales: 42 },
  { label: "Aug 12", revenue: 190, sales: 38 },
  { label: "Aug 13", revenue: 170, sales: 55 },
  { label: "Aug 14", revenue: 178, sales: 60 },
  { label: "Aug 15", revenue: 168, sales: 58 },
  { label: "Aug 16", revenue: 195, sales: 90 },
  { label: "Aug 17", revenue: 225, sales: 108 },
  { label: "Aug 18", revenue: 218, sales: 125 },
  { label: "Aug 19", revenue: 235, sales: 140 },
  { label: "Aug 20", revenue: 245, sales: 155 },
];

export const monthlyTarget = {
  percent: 75.55,
  changeLabel: "+10%",
  target: "$20K",
  revenue: "$20K",
  today: "$3287",
  message:
    "You earn $3287 today, it's higher than last month. Keep up your good work!",
};

export const overviewStats = [
  { id: "customers", label: "Customers", value: "3,782", change: "11.01%", trend: "up" as const },
  { id: "orders", label: "Orders", value: "5,359", change: "9.05%", trend: "down" as const },
];
