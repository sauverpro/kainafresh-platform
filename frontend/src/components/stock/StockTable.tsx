import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  Trash2,
  Pencil,
  ImageOff,
  PackagePlus,
  AlertTriangle,
  CheckCircle,
  Package,
  Scale,
  XCircle,
  SlidersHorizontal,
  PlusCircle,
  Calendar,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { useStockStore, type Stock } from "../../store/useStockStore";
import Loader from "../Loader/Loader";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";
import StockAdjustModal from "./StockAdjustModal";
import StockDrawer from "./StockDrawer";
import { toast } from "sonner";

interface StockTableProps {
  onAdd: () => void;
  onEdit: (stock: Stock) => void;
  onView?: (id: number | string) => void;
}

const LOW_STOCK_THRESHOLD = 10;

type StockStatus = "in stock" | "low stock" | "out of stock";

const stockStatus = (qty: number): StockStatus => {
  if (qty <= 0) return "out of stock";
  if (qty <= LOW_STOCK_THRESHOLD) return "low stock";
  return "in stock";
};

const formatQty = (qty: number): string => {
  const n = Number(qty);
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
};

export default function StockTable({ onAdd, onEdit }: StockTableProps) {
  const { stocks, loading, fetchStocks, deleteStock } = useStockStore();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "in" | "low" | "out">("all");
  const [plotFilter, setPlotFilter] = useState<string>("all");

  // Modal & Drawer States
  const [deleteTarget, setDeleteTarget] = useState<Stock | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<Stock | null>(null);
  const [drawerTarget, setDrawerTarget] = useState<Stock | null>(null);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const ok = await deleteStock(deleteTarget.id);
    setDeleting(false);
    if (ok) {
      toast.success("Stock record deleted successfully");
      setDeleteTarget(null);
    } else {
      toast.error(useStockStore.getState().error ?? "Failed to delete stock");
    }
  };

  // Calculations for Summary Bento Cards
  const totalEntries = stocks.length;
  const totalVolume = stocks.reduce((sum, s) => sum + Number(s.quantity), 0);
  const lowStockCount = stocks.filter((s) => stockStatus(Number(s.quantity)) === "low stock").length;
  const outOfStockCount = stocks.filter((s) => stockStatus(Number(s.quantity)) === "out of stock").length;

  // Extract unique farm plots
  const uniquePlots = Array.from(
    new Set(stocks.map((s) => s.farm_plot).filter((p): p is string => Boolean(p && p.trim())))
  );

  // Filtered Stock List
  const filteredStocks = stocks.filter((s) => {
    const status = stockStatus(Number(s.quantity));
    if (statusFilter === "in" && status !== "in stock") return false;
    if (statusFilter === "low" && status !== "low stock") return false;
    if (statusFilter === "out" && status !== "out of stock") return false;

    if (plotFilter !== "all" && s.farm_plot !== plotFilter) return false;

    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      const matchName = s.product_name?.toLowerCase().includes(q);
      const matchVariety = s.variety?.toLowerCase().includes(q);
      const matchPlot = s.farm_plot?.toLowerCase().includes(q);
      const matchGrade = s.grade?.toLowerCase().includes(q);
      if (!matchName && !matchVariety && !matchPlot && !matchGrade) return false;
    }
    return true;
  });

  const productLabel = (s: Stock) =>
    [s.product_name, s.variety].filter(Boolean).join(" · ");

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Inventory Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor agricultural produce stock, farm plot origin, and harvest freshness.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchStocks()}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-white/5"
            title="Refresh Stock List"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#055028] shadow-xs transition-all"
          >
            <PackagePlus size={16} /> Add Stock Entry
          </button>
        </div>
      </div>

      {/* 1. Bento Summary Cards — 100% Homogeneous with StatCard.tsx */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Stock Entries */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5">
            <Package className="h-5.5 w-5.5 text-gray-700 dark:text-gray-300" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Stock Batches</p>
              <p className="mt-1.5 text-2xl font-semibold text-gray-800 dark:text-white">
                {totalEntries}
              </p>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
              Active Lots
            </span>
          </div>
        </div>

        {/* Card 2: Total Volume */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#076935]/10 text-[#076935] dark:bg-green-500/15 dark:text-green-300">
            <Scale className="h-5.5 w-5.5" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Volume in Stock</p>
              <p className="mt-1.5 text-2xl font-semibold text-gray-800 dark:text-white">
                {formatQty(totalVolume)}{" "}
                <span className="text-xs font-normal text-gray-400">units</span>
              </p>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              Warehouse Qty
            </span>
          </div>
        </div>

        {/* Card 3: Low Stock Warning */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
            <AlertTriangle className="h-5.5 w-5.5" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock Warning</p>
              <p className="mt-1.5 text-2xl font-semibold text-amber-600 dark:text-amber-400">
                {lowStockCount}
              </p>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
              &lt; 10 Units
            </span>
          </div>
        </div>

        {/* Card 4: Out of Stock */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400">
            <XCircle className="h-5.5 w-5.5" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Out of Stock</p>
              <p className="mt-1.5 text-2xl font-semibold text-red-600 dark:text-red-400">
                {outOfStockCount}
              </p>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-500/15 dark:text-red-300">
              Action Required
            </span>
          </div>
        </div>
      </div>

      {/* 2. Filter & Controls Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-gray-900 shadow-xs">
        {/* Horizontal Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-gray-100/80 rounded-xl dark:bg-white/5">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-white text-gray-900 shadow-xs dark:bg-gray-800 dark:text-white"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            All Stock ({stocks.length})
          </button>
          <button
            onClick={() => setStatusFilter("in")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === "in"
                ? "bg-white text-[#076935] shadow-xs dark:bg-gray-800 dark:text-green-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            In Stock
          </button>
          <button
            onClick={() => setStatusFilter("low")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === "low"
                ? "bg-white text-amber-600 shadow-xs dark:bg-gray-800 dark:text-amber-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setStatusFilter("out")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === "out"
                ? "bg-white text-red-600 shadow-xs dark:bg-gray-800 dark:text-red-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
        </div>

        {/* Search & Farm Plot Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product, plot, variety..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-3.5 py-2 text-xs text-gray-900 focus:border-[#076935] focus:bg-white focus:outline-hidden dark:border-white/10 dark:bg-gray-800 dark:text-white dark:focus:border-[#076935]"
            />
          </div>

          {uniquePlots.length > 0 && (
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal size={14} className="text-gray-400" />
              <select
                value={plotFilter}
                onChange={(e) => setPlotFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-[#076935] focus:outline-hidden dark:border-white/10 dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="all">All Farm Plots</option>
                {uniquePlots.map((plot) => (
                  <option key={plot} value={plot}>
                    {plot}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 3. Stock Data Table */}
      {loading ? (
        <Loader text="Loading inventory records..." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-white/10 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider dark:bg-white/5 dark:border-white/10 dark:text-gray-400">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">ID / Lot</th>
                  <th className="px-5 py-3.5 font-semibold">Produce & Variety</th>
                  <th className="px-5 py-3.5 font-semibold">Grade</th>
                  <th className="px-5 py-3.5 font-semibold">Farm Plot Origin</th>
                  <th className="px-5 py-3.5 font-semibold">Available Qty</th>
                  <th className="px-5 py-3.5 font-semibold">Freshness / Harvest</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredStocks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="h-8 w-8 text-gray-300" />
                        <p className="text-sm font-medium">No stock entries found</p>
                        <p className="text-xs text-gray-400">Try clearing your search or adding new stock.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((stock) => {
                    const status = stockStatus(Number(stock.quantity));
                    const qty = Number(stock.quantity);

                    return (
                      <tr
                        key={stock.id}
                        className="hover:bg-gray-50/80 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => setDrawerTarget(stock)}
                      >
                        {/* ID */}
                        <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                          №{stock.id}
                        </td>

                        {/* Product & Variety */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {stock.product_image ? (
                              <img
                                src={stock.product_image}
                                alt={stock.product_name ?? "Produce"}
                                className="h-10 w-10 rounded-xl object-cover border border-gray-100 dark:border-white/10"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-400 dark:bg-white/5">
                                <ImageOff size={16} />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">
                                {productLabel(stock)}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                {stock.unit_name ?? stock.unit_code ?? "units"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Grade */}
                        <td className="px-5 py-4">
                          {stock.grade ? (
                            <span className="rounded-md bg-[#076935]/10 px-2 py-0.5 text-xs font-bold text-[#076935] dark:bg-green-500/20 dark:text-green-300">
                              Grade {stock.grade}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Farm Plot */}
                        <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                          {stock.farm_plot ? (
                            <span className="flex items-center gap-1 font-medium">
                              <MapPin size={12} className="text-gray-400" />
                              {stock.farm_plot}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Available Qty */}
                        <td className="px-5 py-4">
                          <div>
                            <span
                              className={`text-sm font-bold ${
                                status === "out of stock"
                                  ? "text-red-600 dark:text-red-400"
                                  : status === "low stock"
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-gray-900 dark:text-white"
                              }`}
                            >
                              {formatQty(qty)} {stock.unit_code ?? "units"}
                            </span>
                            {/* Visual mini capacity bar */}
                            <div className="mt-1 h-1.5 w-20 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  status === "out of stock"
                                    ? "bg-red-500"
                                    : status === "low stock"
                                    ? "bg-amber-500"
                                    : "bg-[#076935]"
                                }`}
                                style={{ width: `${Math.min(100, Math.max(8, (qty / 100) * 100))}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Freshness / Harvest */}
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                          {stock.harvest_date ? (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} className="text-gray-400" />
                              {stock.harvest_date}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          {status === "in stock" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-300">
                              <CheckCircle size={12} /> In Stock
                            </span>
                          )}
                          {status === "low stock" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                              <AlertTriangle size={12} /> Low Stock
                            </span>
                          )}
                          {status === "out of stock" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
                              <XCircle size={12} /> Out of Stock
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td
                          className="px-5 py-4 text-right"
                          onClick={(e) => e.stopPropagation()} // Prevent triggering drawer
                        >
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setAdjustTarget(stock)}
                              className="rounded-lg p-1.5 text-[#076935] hover:bg-green-50 dark:text-green-400 dark:hover:bg-white/10"
                              title="Quick Restock / Adjust"
                            >
                              <PlusCircle size={16} />
                            </button>
                            <button
                              onClick={() => setDrawerTarget(stock)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
                              title="View Stock Drawer"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => onEdit(stock)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
                              title="Edit Stock Entry"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(stock)}
                              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-white/10"
                              title="Delete Stock Entry"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        itemName={deleteTarget?.product_name}
        resourceType="stock entry"
        title="Delete Stock Entry"
        loading={deleting}
      />

      {/* Quick Adjust Modal */}
      <StockAdjustModal
        open={Boolean(adjustTarget)}
        stock={adjustTarget}
        onClose={() => setAdjustTarget(null)}
      />

      {/* Stock Detail Slide-Over Drawer */}
      <StockDrawer
        open={Boolean(drawerTarget)}
        stock={drawerTarget}
        onClose={() => setDrawerTarget(null)}
        onEdit={(s) => onEdit(s)}
        onQuickAdjust={(s) => setAdjustTarget(s)}
      />
    </div>
  );
}
