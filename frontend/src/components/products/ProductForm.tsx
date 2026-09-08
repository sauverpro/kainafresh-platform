import { useEffect, useState } from "react";
import { Save, Upload, X, Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useProductStore, type Product } from "../../store/useProductStore";
import { useUnitStore } from "../../store/useUnitStore";

interface ProductFormProps {
  initial?: Product | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const emptyForm = {
  name: "",
  description: "",
  unit_id: 0,
  shelf_life: "0",
  price: "0",
  status: "active" as "active" | "inactive",
  wholesale_price: "0",
  wholesale_min_qty: "1",
  retail_min_qty: "1"
};

export default function ProductForm({
  initial,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const { createProduct, updateProduct, saving, error, resetError } =
    useProductStore();
  const { units, creating, fetchUnits, createUnit } = useUnitStore();

  const [form, setForm] = useState(() =>
    initial
      ? {
          name: initial.name || "",
          description: initial.description ?? "",
          unit_id: initial.unit_id || 0,
          shelf_life: initial.shelf_life?.toString() ?? "0",
          price: initial.price?.toString() ?? "0",
          status: initial.status || "active",
          wholesale_price: initial.wholesale_price?.toString() ?? "0",
          wholesale_min_qty: initial.wholesale_min_qty?.toString() ?? "1",
          retail_min_qty: initial.retail_min_qty?.toString() ?? "1"
        }
      : emptyForm,
  );
  const [image, setImage] = useState<File | null>(null);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: "", symbol: "" });

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  useEffect(() => {
    if (form.unit_id === 0 && units.length > 0) {
      setForm((prev) => ({ ...prev, unit_id: units[0].id }));
    }
  }, [units, form.unit_id]);

  useEffect(() => () => resetError(), [resetError]);

  const set = (key: keyof typeof form, value: unknown) => {
    resetError();
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const deriveUnitCode = (nameValue: string): string => {
    const words = nameValue.trim().split(/\s+/).filter(Boolean);
    const base = words.length > 1
      ? words.map((w) => w[0]).join("")
      : words[0]?.slice(0, 3) ?? "";
    let code = base.toUpperCase();
    const existing = new Set(units.map((u) => u.code.toUpperCase()));
    let i = 1;
    while (existing.has(code)) {
      code = `${base.toUpperCase()}${i}`;
      i++;
    }
    return code;
  };

  const unitCode = deriveUnitCode(newUnit.name);

  const handleAddUnit = async () => {
    const name = newUnit.name.trim();
    const symbol = newUnit.symbol.trim();
    if (!name || !symbol) {
      toast.error("Please enter both unit name and symbol");
      return;
    }
    const created = await createUnit({ code: unitCode, name, symbol });
    if (created) {
      toast.success(`Unit "${created.name}" added successfully`);
      setForm((prev) => ({ ...prev, unit_id: created.id }));
      setNewUnit({ name: "", symbol: "" });
      setShowAddUnit(false);
    } else {
      toast.error(
        useUnitStore.getState().error ?? "Failed to add unit",
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!form.unit_id || form.unit_id === 0) {
      toast.error("Please select a unit");
      return;
    }

    // Parse numeric values with proper fallbacks
    const price = parseFloat(form.price) || 0;
    const wholesalePrice = parseFloat(form.wholesale_price) || 0;
    const wholesaleMinQty = parseInt(form.wholesale_min_qty) || 1;
    const retailMinQty = parseInt(form.retail_min_qty) || 1;
    const shelfLife = parseInt(form.shelf_life) || 0;

    // Validate that wholesale price is not negative
    if (wholesalePrice < 0) {
      toast.error("Wholesale price cannot be negative");
      return;
    }

    // Validate that wholesale min qty is not less than 1
    if (wholesaleMinQty < 1) {
      toast.error("Wholesale minimum quantity must be at least 1");
      return;
    }

    // Validate that retail min qty is not less than 1
    if (retailMinQty < 1) {
      toast.error("Retail minimum quantity must be at least 1");
      return;
    }

    const input = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      unit_id: form.unit_id,
      shelf_life: shelfLife,
      price: price,
      status: form.status,
      wholesale_price: wholesalePrice,
      wholesale_min_qty: wholesaleMinQty,
      retail_min_qty: retailMinQty,
    };
    let ok = false;
    if (initial) {
      const patch: Partial<typeof input> = { ...input };
      if (patch.description === undefined) delete patch.description;
      ok = await updateProduct(initial.id, patch, image ?? null);
    } else {
      ok = await createProduct(input, image ?? null);
    }
    
    if (ok) {
      toast.success(
        initial ? "Product updated successfully" : "Product created successfully",
      );
      onSubmit();
    } else {
      toast.error(useProductStore.getState().error ?? "Failed to save product");
    }
  };

  return (
    <form className="panel-form" onSubmit={handleSubmit}>
      {error && (
        <div className="auth-error-banner" role="alert">
          <AlertCircle size={16} className="inline-block mr-1 text-red-500" /> {error}
        </div>
      )}

      {/* Image picker for create and edit */}
      <div className="form-group">
        <label>Product Image</label>
        <div className="image-upload-box">
          {image ? (
            <div style={{ position: "relative", textAlign: "center" }}>
              <img
                src={URL.createObjectURL(image)}
                alt="New preview"
                style={{ maxHeight: 140, objectFit: "cover", borderRadius: 8 }}
              />
              <button
                type="button"
                className="btn-icon btn-danger"
                onClick={() => setImage(null)}
                style={{ position: "absolute", top: 8, right: 8 }}
                title="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          ) : initial?.product_image ? (
            <div style={{ position: "relative", textAlign: "center" }}>
              <img
                src={initial.product_image}
                alt={initial.name}
                style={{ maxHeight: 140, objectFit: "cover", borderRadius: 8 }}
              />
              <label
                className="btn-outline"
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(4px)",
                  padding: "4px 10px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                <Upload size={14} style={{ marginRight: 4 }} /> Change Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          ) : (
            <label className="upload-placeholder" style={{ cursor: "pointer" }}>
              <Upload size={28} color="var(--color-text-light)" />
              <p>Click to upload product image</p>
              <span>PNG, JPG up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              />
            </label>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>Product Name</label>
        <input
          type="text"
          className="panel-input"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Organic Hass Avocados"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Unit</label>
          <select
            className="panel-input"
            value={form.unit_id}
            onChange={(e) => set("unit_id", Number(e.target.value))}
          >
            <option value={0}>Select unit...</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.symbol})
              </option>
            ))}
          </select>
          <button
            type="button"
            className="unit-add-toggle"
            onClick={() => {
              resetError();
              setShowAddUnit((v) => !v);
            }}
          >
            <Plus size={14} /> {showAddUnit ? "Cancel" : "Add new unit"}
          </button>

          {showAddUnit && (
            <div className="unit-add-box">
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <input
                    type="text"
                    className="panel-input"
                    placeholder="Symbol, e.g. kg"
                    value={newUnit.symbol}
                    onChange={(e) =>
                      setNewUnit((v) => ({ ...v, symbol: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="unit-add-codelabel">
                    Code <em>(auto)</em>
                  </label>
                  <input
                    type="text"
                    className="panel-input unit-add-code"
                    value={unitCode}
                    readOnly
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input
                  type="text"
                  className="panel-input"
                  placeholder="Unit name, e.g. Kilogram"
                  value={newUnit.name}
                  onChange={(e) =>
                    setNewUnit((v) => ({ ...v, name: e.target.value }))
                  }
                />
              </div>
              {error && (
                <div className="unit-add-error">{error}</div>
              )}
              <button
                type="button"
                className="btn-primary-dark unit-add-save"
                onClick={handleAddUnit}
                disabled={creating}
              >
                {creating && <span className="spinner" style={{ marginRight: 8 }} />}
                Save unit
              </button>
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Status</label>
          <select
            className="panel-input"
            value={form.status}
            onChange={(e) => set("status", e.target.value as "active" | "inactive")}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Retail Price (Frw) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="panel-input"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div className="form-group">
          <label>Wholesale Price (Frw) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="panel-input"
            value={form.wholesale_price}
            onChange={(e) => set("wholesale_price", e.target.value)}
            placeholder="0.00"
            required
          />
          <span className="text-xs text-gray-500">Set to 0 if not applicable</span>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Wholesale Minimum Qty (MOQ) *</label>
          <input
            type="number"
            step="1"
            min="1"
            className="panel-input"
            value={form.wholesale_min_qty}
            onChange={(e) => set("wholesale_min_qty", e.target.value)}
            placeholder="1"
            required
          />
          <span className="text-xs text-gray-500">Minimum quantity for wholesale orders</span>
        </div>
        <div className="form-group">
          <label>Retail Minimum Qty (MOQ) *</label>
          <input
            type="number"
            step="1"
            min="1"
            className="panel-input"
            value={form.retail_min_qty}
            onChange={(e) => set("retail_min_qty", e.target.value)}
            placeholder="1"
            required
          />
          <span className="text-xs text-gray-500">Minimum quantity for retail orders</span>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Shelf Life (days)</label>
          <input
            type="number"
            min="0"
            className="panel-input"
            value={form.shelf_life}
            onChange={(e) => set("shelf_life", e.target.value)}
            placeholder="0"
          />
          <span className="text-xs text-gray-500">Number of days product stays fresh</span>
        </div>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          className="panel-input panel-textarea"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Short product description..."
          rows={4}
        />
      </div>

      <div className="panel-footer" style={{ padding: "1rem 0 0" }}>
        <button type="button" className="btn-outline-dark" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary-dark" disabled={saving}>
          {saving ? (
            <span className="spinner" style={{ marginRight: 8 }} />
          ) : (
            <Save size={16} style={{ marginRight: 8 }} />
          )}
          {initial ? "Save Changes" : "Save Product"}
        </button>
      </div>
    </form>
  );
}