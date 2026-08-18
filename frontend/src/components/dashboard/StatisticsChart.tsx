import { useState } from "react";
import { Calendar } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { weeklyStatistics } from "../../assets/data/dashboardData";

const PERIODS = ["Monthly", "Quarterly", "Annually"] as const;
type Period = (typeof PERIODS)[number];

export default function StatisticsChart() {
  const [period, setPeriod] = useState<Period>("Monthly");

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white">
            Statistics
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Target you've set for each month
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-white/5">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={[
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150",
                  period === p
                    ? "bg-white text-gray-800 shadow-sm dark:bg-gray-800 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                ].join(" ")}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <Calendar className="h-4 w-4" />
            Aug 11 to Aug 17
          </button>
        </div>
      </div>

      <div className="mt-6 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weeklyStatistics}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1d7255" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#1d7255" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6bbd98" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#6bbd98" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#f1f3f2" />
            <XAxis
              dataKey="label"
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
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#1d7255"
              strokeWidth={2}
              fill="url(#revenueFill)"
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#9ed4ba"
              strokeWidth={2}
              fill="url(#salesFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
