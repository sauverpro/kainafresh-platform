import { useState } from "react";
import { PlusCircle, MinusCircle, AlertCircle, Save, X } from "lucide-react";
import { type Stock, useStockStore } from "../../store/useStockStore";
import { toast } from "sonner";

interface StockAdjustModalProps {
  stock: Stock | null;
  open: boolean;
  onClose: () => void;
}

export default function StockAdjustModal({
  stock,
  open,
  onClose,
}: StockAdjustModalProps) {
  const updateStock = useStockStore((s) => s.updateStock);

  const [mode, setMode] = useState<"add" | "subtract">("add");
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("Fresh Harvest Received");
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  if (!open || !stock) return null;

  const currentQty = Number(stock.quantity) || 0;
  const adjustVal = parseFloat(amount) || 0;
  const newQty =
    mode === "add"
      ? currentQty + adjustVal
      : Math.max(0, currentQty - adjustVal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustVal <= 0) {
      toast.error("Please enter a valid adjustment amount.");
      return;
    }

    setSubmitting(true);
    const ok = await updateStock(stock.id, { quantity: newQty });
    setSubmitting(false);

    if (ok) {
      toast.success(
        `Stock updated (${mode === "add" ? "+" : "-"}${adjustVal} ${
          stock.unit_code ?? "units"
        }). Reason: ${reason}`
      );
      setAmount("");
      setNote("");
      onClose();
    } else {
      toast.error("Failed to adjust stock. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Stock Adjustment
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {stock.product_name} {stock.variety ? `· ${stock.variety}` : ""} (№
              {stock.id})
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Action Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl dark:bg-white/5">
            <button
              type="button"
              onClick={() => {
                setMode("add");
                setReason("Fresh Harvest Received");
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "add"
                  ? "bg-white text-[#076935] shadow-xs dark:bg-gray-800 dark:text-green-400"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
              }`}
            >
              <PlusCircle size={16} />
              Add Stock (+ Restock)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("subtract");
                setReason("Spoilage / Post-Harvest Loss");
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "subtract"
                  ? "bg-white text-red-600 shadow-xs dark:bg-gray-800 dark:text-red-400"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
              }`}
            >
              <MinusCircle size={16} />
              Log Waste / Loss (-)
            </button>
          </div>

          {/* Current Stock Banner */}
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-white/5">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Current Stock Level:
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {currentQty.toFixed(2)} {stock.unit_code ?? "units"}
            </span>
          </div>

          {/* Adjustment Quantity Input */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantity to {mode === "add" ? "Add" : "Subtract"} ({stock.unit_code ?? "units"})
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 50.0"
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-[#076935] focus:outline-hidden dark:border-white/10 dark:bg-gray-800 dark:text-white dark:focus:border-[#076935]"
            />
          </div>

          {/* Reason Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason / Source Tag
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-[#076935] focus:outline-hidden dark:border-white/10 dark:bg-gray-800 dark:text-white"
            >
              {mode === "add" ? (
                <>
                  <option value="Fresh Harvest Received">Fresh Harvest Received</option>
                  <option value="Supplier Purchase Batch">Supplier Purchase Batch</option>
                  <option value="Return / Cancelled Order">Return / Cancelled Order</option>
                  <option value="Inventory Audit Restock">Inventory Audit Restock</option>
                </>
              ) : (
                <>
                  <option value="Spoilage / Post-Harvest Loss">Spoilage / Post-Harvest Loss</option>
                  <option value="Quality Downgrade Waste">Quality Downgrade Waste</option>
                  <option value="Damaged in Storage">Damaged in Storage</option>
                  <option value="Manual Audit Correction">Manual Audit Correction</option>
                </>
              )}
            </select>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Note / Reference (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Batch #492 from Gasabo Plot A"
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-[#076935] focus:outline-hidden dark:border-white/10 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Projected New Total */}
          <div className="rounded-xl border border-[#076935]/20 bg-[#076935]/5 p-3 dark:border-green-500/20 dark:bg-green-500/10 flex items-center justify-between">
            <span className="text-xs text-[#076935] dark:text-green-300 flex items-center gap-1 font-medium">
              <AlertCircle size={14} /> New Total Stock:
            </span>
            <span className="text-sm font-bold text-[#076935] dark:text-green-300">
              {newQty.toFixed(2)} {stock.unit_code ?? "units"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium text-white transition-all shadow-xs ${
                mode === "add"
                  ? "bg-[#076935] hover:bg-[#055028]"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              <Save size={14} />
              {submitting ? "Saving..." : "Confirm Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
