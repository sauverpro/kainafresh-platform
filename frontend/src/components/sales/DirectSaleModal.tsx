import { useState } from "react";
import { X, Save, DollarSign, User, Package, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface DirectSaleModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DirectSaleModal({
  open,
  onClose,
  onSuccess,
}: DirectSaleModalProps) {
  const [customerName, setCustomerName] = useState("Walk-in Farm Buyer");
  const [produce, setProduce] = useState("Organic Hass Avocados");
  const [qty, setQty] = useState<string>("50");
  const [unit, setUnit] = useState("kg");
  const [pricePerUnit, setPricePerUnit] = useState<string>("1200");
  const [paymentMethod, setPaymentMethod] = useState("MTN Mobile Money");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const quantityVal = parseFloat(qty) || 0;
  const priceVal = parseFloat(pricePerUnit) || 0;
  const totalAmount = quantityVal * priceVal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantityVal <= 0 || priceVal <= 0) {
      toast.error("Please enter a valid quantity and unit price.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(
        `Direct sale recorded! ${totalAmount.toLocaleString()} RWF received via ${paymentMethod}.`
      );
      onSuccess?.();
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="text-[#076935]" size={20} />
              Record Direct Farm-Gate Sale
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Register over-the-counter (OTC) cash or MoMo sales for immediate dispatch.
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
          {/* Customer / Buyer Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
              <User size={14} className="text-gray-400" /> Buyer / Client Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Walk-in Buyer or Hotel Representative"
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-[#076935] focus:outline-hidden dark:border-white/10 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Produce Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
              <Package size={14} className="text-gray-400" /> Produce Item
            </label>
            <select
              value={produce}
              onChange={(e) => setProduce(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-[#076935] focus:outline-hidden dark:border-white/10 dark:bg-gray-800 dark:text-white"
            >
              <option value="Organic Hass Avocados">Organic Hass Avocados (Grade A)</option>
              <option value="Kinigi Irish Potatoes">Kinigi Irish Potatoes (Grade A)</option>
              <option value="Red Habanero Chilli">Red Habanero Chilli (Export Grade)</option>
              <option value="Organic Tomatoes">Organic Tomatoes (Grade A)</option>
              <option value="Fresh Passion Fruit">Fresh Passion Fruit (Purple)</option>
            </select>
          </div>

          {/* Quantity & Unit Price Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="50"
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-[#076935] focus:outline-hidden dark:border-white/10 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#076935] focus:outline-hidden dark:border-white/10 dark:bg-gray-800 dark:text-white"
              >
                <option value="kg">kg (Kilogram)</option>
                <option value="crate">Crate (25kg)</option>
                <option value="box">Household Box</option>
                <option value="sacks">Sack (50kg)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit Price (RWF)
              </label>
              <input
                type="number"
                step="10"
                min="10"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                placeholder="1200"
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-[#076935] focus:outline-hidden dark:border-white/10 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
              <CreditCard size={14} className="text-gray-400" /> Payment Method Received
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-[#076935] focus:outline-hidden dark:border-white/10 dark:bg-gray-800 dark:text-white"
            >
              <option value="MTN Mobile Money">MTN Mobile Money (*182*8*1#)</option>
              <option value="Cash">Cash Handover</option>
              <option value="Airtel Money">Airtel Money</option>
              <option value="POS Card Terminal">Credit/Debit Card Terminal</option>
            </select>
          </div>

          {/* Live Calculated Total Banner */}
          <div className="rounded-xl border border-[#076935]/20 bg-[#076935]/5 p-3.5 dark:border-green-500/20 dark:bg-green-500/10 flex items-center justify-between">
            <span className="text-xs text-[#076935] dark:text-green-300 font-medium">
              Total Revenue to Collect:
            </span>
            <span className="text-lg font-black text-[#076935] dark:text-green-300">
              {totalAmount.toLocaleString()} RWF
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
              className="flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2 text-xs font-medium text-white hover:bg-[#055028] shadow-xs transition-all"
            >
              <Save size={14} />
              {submitting ? "Saving..." : "Record & Complete Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
