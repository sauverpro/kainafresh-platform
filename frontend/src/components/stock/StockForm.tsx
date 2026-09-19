import { useEffect, useState } from "react";
import { Save, AlertCircle, PackagePlus, Calendar, MapPin, Tag } from "lucide-react";
import { toast } from "sonner";
import { useStockStore, type Stock } from "../../store/useStockStore";
import { useProductStore } from "../../store/useProductStore";
import Loader from "../Loader/Loader";

interface StockFormProps {
  initial?: Stock | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const emptyForm = {
  productid: 0,
  variety: "",
  grade: "",
  quantity: 0,
  farm_plot: "",
  harvest_date: "",
  pack_date: "",
};

export default function StockForm({ initial, onSubmit, onCancel }: StockFormProps) {
  const { createStock, updateStock, saving, error, resetError } = useStockStore();
  const { products, loading: productsLoading, fetchProducts } = useProductStore();

  const [form, setForm] = useState(() =>
    initial
      ? {
          productid: initial.productid,
          variety: initial.variety ?? "",
          grade: initial.grade ?? "",
          quantity: Number(initial.quantity) || 0,
          farm_plot: initial.farm_plot ?? "",
          harvest_date: initial.harvest_date ?? "",
          pack_date: initial.pack_date ?? "",
        }
      : emptyForm,
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (form.productid === 0 && products.length > 0) {
      setForm((prev) => ({ ...prev, productid: Number(products[0].id) }));
    }
  }, [products, form.productid]);

  useEffect(() => () => resetError(), [resetError]);

  const set = (key: keyof typeof form, value: unknown) => {
    resetError();
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const selectedProduct = products.find(
    (p) => Number(p.id) === Number(form.productid),
  );
  const unitLabel = selectedProduct?.unit_name
    ? `${selectedProduct.unit_name} (${selectedProduct.unit_symbol ?? selectedProduct.unit_code ?? ""})`
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productid || form.quantity === undefined || form.quantity === null) return;
    const input = {
      productid: Number(form.productid),
      quantity: Number(form.quantity),
      variety: form.variety.trim() || undefined,
      grade: form.grade.trim() || undefined,
      farm_plot: form.farm_plot.trim() || undefined,
      harvest_date: form.harvest_date || undefined,
      pack_date: form.pack_date || undefined,
    };
    let ok = false;
    if (initial) {
      const patch: Partial<typeof input> = { ...input };
      if (patch.variety === undefined) delete patch.variety;
      if (patch.grade === undefined) delete patch.grade;
      if (patch.farm_plot === undefined) delete patch.farm_plot;
      ok = await updateStock(initial.id, patch);
    } else {
      ok = await createStock(input);
    }
    if (ok) {
      toast.success(
        initial ? "Stock updated successfully!" : "Stock added successfully!",
      );
      onSubmit();
    } else {
      toast.error(useStockStore.getState().error ?? "Failed to save stock entry.");
    }
  };

  return (
    <form className="space-y-5 text-sm" onSubmit={handleSubmit}>
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700" role="alert">
          <AlertCircle size={16} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card Header Banner */}
      <div className="flex items-center gap-3 p-3.5 bg-[#076935]/5 rounded-2xl border border-[#076935]/15">
        <div className="w-10 h-10 rounded-xl bg-[#076935] text-white flex items-center justify-center font-bold shrink-0">
          <PackagePlus size={20} />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm">
            {initial ? "Edit Stock Entry Record" : "Add New Produce Harvest Stock"}
          </h4>
          <p className="text-xs text-gray-500">
            Log organic farm yield, lot numbers, packhouse dates, and inventory quantity.
          </p>
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="space-y-4">
        {/* Product Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1">
            <Tag size={13} className="text-[#076935]" /> Select Organic Produce <span className="text-red-500">*</span>
          </label>
          {productsLoading && products.length === 0 ? (
            <Loader text="Loading produce list..." />
          ) : (
            <select
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-[#076935] focus:ring-2 focus:ring-[#076935]/20"
              value={form.productid}
              onChange={(e) => set("productid", Number(e.target.value))}
              required
            >
              <option value={0}>-- Choose Produce Item --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (PROD-00{p.id})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Variety & Grade */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Variety / Cultivar
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              value={form.variety}
              onChange={(e) => set("variety", e.target.value)}
              placeholder="e.g. Hass / Fuerte / Bird's Eye"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Quality Grade
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              value={form.grade}
              onChange={(e) => set("grade", e.target.value)}
              placeholder="e.g. Grade A (Export Quality)"
            />
          </div>
        </div>

        {/* Quantity & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Harvest Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-[#076935] outline-none focus:border-[#076935]"
              value={form.quantity}
              onChange={(e) => set("quantity", Number(e.target.value))}
              placeholder="e.g. 250"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Unit of Measurement
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm font-semibold text-gray-600 outline-none"
              value={unitLabel ?? "Kilograms (kg)"}
              placeholder="Select a product"
              readOnly
            />
          </div>
        </div>

        {/* Farm Plot Location */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
            <MapPin size={13} className="text-[#076935]" /> Origin Farm / Plot Zone
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
            value={form.farm_plot}
            onChange={(e) => set("farm_plot", e.target.value)}
            placeholder="e.g. Musanze Plot A · Block 3"
          />
        </div>

        {/* Harvest Date & Pack Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
              <Calendar size={13} className="text-amber-600" /> Harvest Date
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              value={form.harvest_date}
              onChange={(e) => set("harvest_date", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
              <Calendar size={13} className="text-purple-600" /> Packhouse Date
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium outline-none focus:border-[#076935]"
              value={form.pack_date}
              onChange={(e) => set("pack_date", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Form Card Action Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
        <button
          type="button"
          className="rounded-xl border border-gray-300 bg-gray-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-700 transition"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#055028] shadow-sm transition disabled:opacity-60 cursor-pointer"
        >
          {saving ? (
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {initial ? "Save Changes" : "Add Stock Entry"}
        </button>
      </div>
    </form>
  );
}
