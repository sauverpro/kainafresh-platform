import { useEffect, useState } from "react";
import { Save } from "lucide-react";
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
    if (ok) onSubmit();
  };

  return (
    <form className="panel-form" onSubmit={handleSubmit}>
      {error && (
        <div className="auth-error-banner" role="alert">
          <span className="auth-error-icon">⚠</span> {error}
        </div>
      )}

      <div className="form-group">
        <label>Product</label>
        {productsLoading && products.length === 0 ? (
          <Loader text="" />
        ) : (
          <select
            className="panel-input"
            value={form.productid}
            onChange={(e) => set("productid", Number(e.target.value))}
            required
          >
            <option value={0}>Select product...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Variety</label>
          <input
            type="text"
            className="panel-input"
            value={form.variety}
            onChange={(e) => set("variety", e.target.value)}
            placeholder="e.g. Hass"
          />
        </div>
        <div className="form-group">
          <label>Grade</label>
          <input
            type="text"
            className="panel-input"
            value={form.grade}
            onChange={(e) => set("grade", e.target.value)}
            placeholder="e.g. A"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Quantity</label>
          <input
            type="number"
            step="0.001"
            min="0"
            className="panel-input"
            value={form.quantity}
            onChange={(e) => set("quantity", Number(e.target.value))}
            placeholder="0"
            required
          />
        </div>
        <div className="form-group">
          <label>Farm / Plot</label>
          <input
            type="text"
            className="panel-input"
            value={form.farm_plot}
            onChange={(e) => set("farm_plot", e.target.value)}
            placeholder="e.g. Zone A - Plot 3"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Harvest Date</label>
          <input
            type="date"
            className="panel-input"
            value={form.harvest_date}
            onChange={(e) => set("harvest_date", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Pack Date</label>
          <input
            type="date"
            className="panel-input"
            value={form.pack_date}
            onChange={(e) => set("pack_date", e.target.value)}
          />
        </div>
      </div>

      <div className="panel-footer">
        <button type="button" className="btn-outline-dark" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary-dark" disabled={saving}>
          {saving ? (
            <span className="spinner" style={{ marginRight: 8 }} />
          ) : (
            <Save size={16} style={{ marginRight: 8 }} />
          )}
          {initial ? "Save Changes" : "Add Stock"}
        </button>
      </div>
    </form>
  );
}
