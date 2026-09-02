import { X, Calendar, TrendingUp, Award, Eye } from "lucide-react";
import type { SalesTransaction } from "../../pages/admin/Sales/SalesList";
import { toast } from "sonner";

export interface MonthSalesData {
  month: string;
  year: number;
  revenue: number;
  ordersCount: number;
  peakDays: { date: string; revenue: number; driver: string }[];
}

interface MonthDetailDrawerProps {
  monthData: MonthSalesData | null;
  open: boolean;
  onClose: () => void;
  transactions: SalesTransaction[];
}

export default function MonthDetailDrawer({
  monthData,
  open,
  onClose,
  transactions,
}: MonthDetailDrawerProps) {
  if (!open || !monthData) return null;

  // Filter transactions belonging to selected month (mock match or month name match)
  const monthTransactions = transactions.filter((t) => {
    // Example: "August" matches "2026-08"
    const monthNum = new Date(`${monthData.month} 1, 2026`).getMonth() + 1;
    const padMonth = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
    return t.date.includes(`2026-${padMonth}`) || monthData.month.toLowerCase() === "august";
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-xl bg-white p-6 shadow-2xl dark:bg-gray-900 dark:border-l dark:border-white/10 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-white/10">
              <div>
                <span className="rounded-md bg-[#076935]/10 px-2 py-0.5 text-xs font-bold text-[#076935] dark:bg-green-500/20 dark:text-green-300">
                  {monthData.month} {monthData.year} Sales Deep-Dive
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  Monthly Performance breakdown
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Monthly Key Metrics Banner */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                  Total Monthly Revenue
                </p>
                <p className="text-lg font-black text-[#076935] dark:text-green-300 mt-0.5">
                  {(monthData.revenue / 1000000).toFixed(2)}M RWF
                </p>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 dark:border-blue-500/20 dark:bg-blue-500/10">
                <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                  Fulfillments Closed
                </p>
                <p className="text-lg font-black text-blue-900 dark:text-blue-300 mt-0.5">
                  {monthData.ordersCount} Orders
                </p>
              </div>
            </div>

            {/* 🔥 High Sales Peak Dates Section */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-white/10">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={16} className="text-amber-500" /> Peak Revenue Dates in {monthData.month}
                </h3>
                <span className="text-[11px] text-gray-400">High Volume Days</span>
              </div>

              <div className="space-y-2">
                {monthData.peakDays.map((peak, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-amber-200/80 bg-amber-50/40 p-3 dark:border-amber-500/20 dark:bg-amber-500/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1">
                          <Calendar size={12} className="text-gray-400" /> {peak.date}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {peak.driver}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-amber-700 dark:text-amber-300">
                        {peak.revenue.toLocaleString()} RWF
                      </span>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-0.5">
                        <TrendingUp size={10} /> Peak Surge
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions Closed in this Month */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-white/10">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Sales Closed in {monthData.month}
                </h3>
                <span className="text-[11px] text-gray-400">
                  {monthTransactions.length} items logged
                </span>
              </div>

              <div className="space-y-2">
                {monthTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-white/5 dark:bg-white/5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-gray-900 dark:text-white">
                          #{tx.id}
                        </span>
                        <span className="text-xs text-[#076935] font-semibold dark:text-green-400">
                          {tx.order_id}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">
                        {tx.customer_name}
                      </p>
                      <p className="text-[11px] text-gray-400">{tx.items_summary}</p>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        {tx.amount.toLocaleString()} RWF
                      </p>
                      <button
                        onClick={() => toast.info(`Viewing receipt for ${tx.id}`)}
                        className="inline-flex items-center gap-1 rounded-md bg-gray-200/70 px-2 py-0.5 text-[10px] font-semibold text-gray-700 hover:bg-gray-300 dark:bg-white/10 dark:text-gray-300"
                      >
                        <Eye size={10} /> Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4 dark:border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Close Month Inspection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
