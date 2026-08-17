import { MoreVertical, ArrowUp, ArrowDown } from "lucide-react";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { monthlyTarget } from "../../data/dashboardData";

export default function MonthlyTargetCard() {
  const data = [{ name: "target", value: monthlyTarget.percent, fill: "#1d7255" }];

  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white">
            Monthly Target
          </h3>
          <p className="mt-1 text-sm text-gray-400">Target you've set for each month</p>
        </div>
        <button
          type="button"
          aria-label="More options"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* Gauge */}
      <div className="relative mx-auto mt-2 h-[220px] w-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="85%"
            outerRadius="100%"
            barSize={14}
            data={data}
            startAngle={220}
            endAngle={-40}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={20} background={{ fill: "#eef2f0" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-800 dark:text-white">
            {monthlyTarget.percent}%
          </span>
          <span className="mt-2 flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
            {monthlyTarget.changeLabel}
          </span>
        </div>
      </div>

      <p className="mx-auto mt-2 max-w-[280px] text-center text-sm text-gray-500 dark:text-gray-400">
        {monthlyTarget.message}
      </p>

      {/* Footer stats */}
      <div className="mt-6 grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100 pt-4 dark:divide-white/10 dark:border-white/10">
        <div className="text-center">
          <p className="text-xs text-gray-400">Target</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-sm font-semibold text-gray-800 dark:text-white">
            {monthlyTarget.target}
            <ArrowDown className="h-3.5 w-3.5 text-red-500" />
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Revenue</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-sm font-semibold text-gray-800 dark:text-white">
            {monthlyTarget.revenue}
            <ArrowUp className="h-3.5 w-3.5 text-brand-500" />
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Today</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-sm font-semibold text-gray-800 dark:text-white">
            {monthlyTarget.today}
            <ArrowUp className="h-3.5 w-3.5 text-brand-500" />
          </p>
        </div>
      </div>
    </div>
  );
}
