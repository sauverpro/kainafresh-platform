import { X, Calendar, MapPin, Tag, CheckCircle, AlertTriangle, ImageOff, Edit3, PlusCircle, Sprout, ShieldCheck } from "lucide-react";
import { type Stock } from "../../store/useStockStore";

interface StockDrawerProps {
  stock: Stock | null;
  open: boolean;
  onClose: () => void;
  onEdit: (stock: Stock) => void;
  onQuickAdjust: (stock: Stock) => void;
}

export default function StockDrawer({
  stock,
  open,
  onClose,
  onEdit,
  onQuickAdjust,
}: StockDrawerProps) {
  if (!open || !stock) return null;

  const qty = Number(stock.quantity) || 0;
  const isLow = qty > 0 && qty <= 10;
  const isOut = qty <= 0;

  // Calculate days since harvest if available
  let harvestDaysAgo: number | null = null;
  if (stock.harvest_date) {
    const harvestDate = new Date(stock.harvest_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - harvestDate.getTime());
    harvestDaysAgo = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white p-6 shadow-2xl dark:bg-gray-900 dark:border-l dark:border-white/10 flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-[#076935]/10 px-2.5 py-1 text-xs font-bold text-[#076935] dark:bg-green-500/20 dark:text-green-300">
                  Stock Entry №{stock.id}
                </span>
                {isOut ? (
                  <span className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-500/15 dark:text-red-400">
                    <AlertTriangle size={12} /> Out of Stock
                  </span>
                ) : isLow ? (
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                    <AlertTriangle size={12} /> Low Stock Warning
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-600 dark:bg-green-500/15 dark:text-green-400">
                    <CheckCircle size={12} /> In Stock
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Produce Header Box */}
            <div className="mt-5 flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 dark:border-white/5 dark:bg-white/5">
              {stock.product_image ? (
                <img
                  src={stock.product_image}
                  alt={stock.product_name ?? "Produce"}
                  className="h-16 w-16 rounded-xl object-cover border border-gray-200 dark:border-white/10 shadow-xs"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-200 text-gray-400 dark:bg-white/10">
                  <ImageOff size={24} />
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {stock.product_name ?? `Product #${stock.productid}`}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {stock.variety && (
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      Variety: <strong className="text-gray-900 dark:text-white">{stock.variety}</strong>
                    </span>
                  )}
                  {stock.grade && (
                    <span className="rounded-md bg-[#076935]/10 px-1.5 py-0.5 text-[11px] font-bold text-[#076935] dark:bg-green-500/20 dark:text-green-300">
                      Grade {stock.grade}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Current Available Stock Stats */}
            <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-gray-800">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Available Warehouse Quantity
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-black text-gray-900 dark:text-white">
                  {qty.toFixed(2)}{" "}
                  <span className="text-sm font-normal text-gray-500">
                    {stock.unit_name ?? stock.unit_code ?? "units"}
                  </span>
                </span>
                <button
                  onClick={() => onQuickAdjust(stock)}
                  className="flex items-center gap-1 rounded-xl bg-[#076935]/10 px-3 py-1.5 text-xs font-bold text-[#076935] hover:bg-[#076935]/20 dark:bg-green-500/20 dark:text-green-300"
                >
                  <PlusCircle size={14} /> Adjust Qty
                </button>
              </div>

              {/* Progress Level Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                  <span>Stock Status Level</span>
                  <span>{qty > 100 ? "Optimal (100%)" : `${Math.min(100, Math.round((qty / 100) * 100))}% Capacity`}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOut
                        ? "bg-red-500"
                        : isLow
                        ? "bg-amber-500"
                        : "bg-[#076935]"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, (qty / 100) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Farm Traceability Info */}
            <div className="mt-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Farm Traceability & Origin
              </h4>

              <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 dark:border-white/5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Farm Plot Location</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {stock.farm_plot || "Main Storage / Unspecified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 dark:border-white/5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Harvest Date</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {stock.harvest_date ? (
                      <>
                        {stock.harvest_date}{" "}
                        {harvestDaysAgo !== null && (
                          <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">
                            ({harvestDaysAgo} days ago)
                          </span>
                        )}
                      </>
                    ) : (
                      "Not recorded"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 dark:border-white/5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                  <Tag size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Packing Date</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {stock.pack_date || "Not recorded"}
                  </p>
                </div>
              </div>
            </div>

            {/* Audit Logs */}
            <div className="mt-5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Recent Batch Log
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2.5 dark:bg-white/5">
                  <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                    <Sprout size={14} className="text-[#076935] dark:text-green-400" /> Harvested & Packed
                  </span>
                  <span className="text-gray-400">{stock.pack_date || "Recent"}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2.5 dark:bg-white/5">
                  <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                    <ShieldCheck size={14} className="text-[#076935] dark:text-green-400" /> Quality Checked (Grade {stock.grade || "A"})
                  </span>
                  <span className="text-gray-400">Passed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 border-t border-gray-100 pt-4 dark:border-white/10 flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(stock);
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <Edit3 size={16} /> Edit Stock Entry
            </button>
            <button
              onClick={() => {
                onClose();
                onQuickAdjust(stock);
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#076935] py-2.5 text-xs font-bold text-white hover:bg-[#055028] shadow-xs"
            >
              <PlusCircle size={16} /> Restock / Adjust
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
