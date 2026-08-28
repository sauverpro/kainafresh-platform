import StatCard from "../../components/dashboard/StatCard";
import MonthlyTargetCard from "../../components/dashboard/MonthlyTargetCard";
import MonthlySalesChart from "../../components/dashboard/MonthlySalesChart";
import StatisticsChart from "../../components/dashboard/StatisticsChart";
import { overviewStats } from "../../assets/data/dashboardData";

export default function EcommerceDashboard() {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      {/* Left column: stat cards + monthly sales */}
      <div className="flex flex-col gap-5 xl:col-span-2">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {overviewStats.map((stat) => (
            <StatCard key={stat.id} {...stat} />
          ))}
        </div>
        <MonthlySalesChart />
      </div>

      {/* Right column: monthly target */}
      <div className="xl:col-span-1">
        <MonthlyTargetCard />
      </div>

      {/* Full width: statistics */}
      <div className="xl:col-span-3">
        <StatisticsChart />
      </div>
    </div>
  );
}
