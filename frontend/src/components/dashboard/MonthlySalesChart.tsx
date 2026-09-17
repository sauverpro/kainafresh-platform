import { MoreVertical, BarChart2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { monthlySales } from "../../assets/data/dashboardData";

export default function MonthlySalesChart() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white">
          Monthly Sales
        </h3>
        <button
          type="button"
          aria-label="More options"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 h-[300px] w-full relative">
        {monthlySales.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 px-4 border border-dashed border-gray-200 dark:border-white/10 rounded-xl bg-gray-50/50 dark:bg-white/5">
            <BarChart2 className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-xs font-bold text-gray-600 dark:text-gray-300">No monthly sales data available</p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-sm">
              Sales performance metrics will be plotted here as commercial transactions are completed.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlySales} barCategoryGap="35%">
              <CartesianGrid vertical={false} stroke="#f1f3f2" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#98a2b3", fontSize: 12 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#98a2b3", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "#1d7255", fillOpacity: 0.06 }}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="sales"
                fill="#1d7255"
                radius={[5, 5, 5, 5]}
                maxBarSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

