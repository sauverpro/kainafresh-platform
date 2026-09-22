import { useEffect, useRef, useState } from "react";
import {
  Save,
  Upload,
  X,
  Plus,
  AlertCircle,
  Package,
  Coins,
  Clock,
} from "lucide-react";
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
  retail_min_qty: "1",
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
          retail_min_qty: initial.retail_min_qty?.toString() ?? "1",
        }
      : emptyForm,
  );
  const [image, setImage] = useState<File | null>(null);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: "", symbol: "" });
  const imageInputRef = useRef<HTMLInputElement>(null);

  const openImagePicker = () => imageInputRef.current?.click();

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
    const base =
      words.length > 1
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

    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!form.unit_id || form.unit_id === 0) {
      toast.error("Please select a measurement unit");
      return;
    }

    const price = parseFloat(form.price) || 0;
    const wholesalePrice = parseFloat(form.wholesale_price) || 0;
    const wholesaleMinQty = parseInt(form.wholesale_min_qty) || 1;
    const retailMinQty = parseInt(form.retail_min_qty) || 1;
    const shelfLife = parseInt(form.shelf_life) || 0;

    if (wholesalePrice < 0) {
      toast.error("Wholesale price cannot be negative");
      return;
    }

    if (wholesaleMinQty < 1) {
      toast.error("Wholesale minimum quantity must be at least 1");
      return;
    }

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
        initial
          ? "Product updated successfully"
          : "Product created successfully",
      );
      onSubmit();
    } else {
      toast.error(
        useProductStore.getState().error ?? "Failed to save product",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-xs text-gray-700">
      {error && (
        <div
          className="flex items-center gap-2 rounded-xl bg-red-50 p-3.5 border border-red-200 text-red-700 font-medium"
          role="alert"
        >
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Card Section 1: Basic Product Information & Media */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4.5 space-y-4 shadow-2xs dark:border-white/10 dark:bg-gray-900">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-white/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#076935]/10 text-[#076935] font-bold">
            <Package size={17} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Basic Details & Media
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Provide product name, image, measurement unit, and status.
            </p>
          </div>
        </div>

        {/* Product Image */}
        <div>
          <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1.5">
            Product Image <span className="font-normal text-gray-400">(Optional)</span>
          </label>
          <div className="relative">
            {image ? (
              <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 p-4 dark:bg-emerald-950/20">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="max-h-36 rounded-xl object-cover shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-xs hover:bg-red-700 transition"
                  title="Remove image"
                >
                  <X size={15} />
                </button>
                <p className="mt-2 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  {image.name} ({(image.size / 1024).toFixed(1)} KB)
                </p>
              </div>
            ) : initial?.product_image ? (
              <div className="relative flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-gray-800">
                <img
                  src={initial.product_image}
                  alt={initial.name}
                  className="max-h-36 rounded-xl object-cover shadow-xs"
                />
                <button
                  type="button"
                  onClick={openImagePicker}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-white/10 dark:bg-gray-700 dark:text-gray-200 transition"
                >
                  <Upload size={14} /> Change Image
                </button>
              </div>
            ) : (
              <div
                onClick={openImagePicker}
                className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-6 text-center cursor-pointer transition hover:border-[#076935] hover:bg-[#F4FAF7] dark:border-white/15 dark:bg-gray-800/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs text-gray-400 group-hover:text-[#076935] dark:bg-gray-800 transition">
                  <Upload size={24} />
                </div>
                <p className="mt-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                  Click to upload product image
                </p>
                <span className="text-[11px] text-gray-400">
                  Supports PNG, JPG, WebP up to 5MB
                </span>
              </div>
            )}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                setImage(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        {/* Product Name */}
        <div>
          <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1.5">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Organic Hass Avocados (Grade A)"
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-900 outline-none focus:border-[#076935] focus:bg-white focus:ring-2 focus:ring-[#076935]/15 dark:border-white/10 dark:bg-gray-800 dark:text-white"
            required
          />
        </div>

        {/* Measurement Unit & Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-gray-800 dark:text-gray-200">
                Measurement Unit <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  resetError();
                  setShowAddUnit((v) => !v);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#076935] hover:underline dark:text-emerald-400"
              >
                <Plus size={13} /> {showAddUnit ? "Cancel" : "Add New Unit"}
              </button>
            </div>
            <select
              value={form.unit_id}
              onChange={(e) => set("unit_id", Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold text-gray-800 outline-none focus:border-[#076935] dark:border-white/10 dark:bg-gray-800 dark:text-white"
            >
              <option value={0}>Select Unit...</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>

            {/* Inline Add Unit Box */}
            {showAddUnit && (
              <div className="mt-3 rounded-xl border border-dashed border-[#076935]/30 bg-[#F4FAF7] p-3 space-y-3 dark:bg-gray-800/80">
                <h4 className="font-bold text-[#076935] text-xs dark:text-emerald-400">
                  Create Custom Unit
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      Symbol *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. kg, L, crate"
                      value={newUnit.symbol}
                      onChange={(e) =>
                        setNewUnit((v) => ({ ...v, symbol: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 p-2 text-xs outline-none focus:border-[#076935] dark:border-white/10 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      Code (Auto)
                    </label>
                    <input
                      type="text"
                      value={unitCode}
                      readOnly
                      className="w-full rounded-lg border border-gray-200 bg-gray-100 p-2 text-xs font-mono font-bold text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                    Unit Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kilogram"
                    value={newUnit.name}
                    onChange={(e) =>
                      setNewUnit((v) => ({ ...v, name: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs outline-none focus:border-[#076935] dark:border-white/10 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddUnit}
                  disabled={creating}
                  className="w-full rounded-lg bg-[#076935] py-2 text-xs font-bold text-white hover:bg-[#055028] disabled:opacity-50 transition"
                >
                  {creating ? "Saving Unit..." : "Save Custom Unit"}
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1.5">
              Product Status <span className="text-red-500">*</span>
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                set("status", e.target.value as "active" | "inactive")
              }
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold text-gray-800 outline-none focus:border-[#076935] dark:border-white/10 dark:bg-gray-800 dark:text-white"
            >
              <option value="active">Active (Available in Catalog)</option>
              <option value="inactive">Inactive (Draft / Hidden)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Card Section 2: Pricing & Wholesale Rules (MOQ) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4.5 space-y-4 shadow-2xs dark:border-white/10 dark:bg-gray-900">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-white/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 font-bold">
            <Coins size={17} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Pricing & Minimum Order Quantities (MOQ)
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Configure retail and wholesale unit prices along with minimum quantities.
            </p>
          </div>
        </div>

        {/* Retail Pricing & Retail MOQ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1.5">
              Retail Price (Frw) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 pl-3 pr-14 text-xs font-semibold text-gray-900 outline-none focus:border-[#076935] focus:bg-white dark:border-white/10 dark:bg-gray-800 dark:text-white"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                RWF
              </span>
            </div>
            <p className="mt-1 text-[10px] text-gray-400">
              Standard retail price per measurement unit.
            </p>
          </div>

          <div>
            <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1.5">
              Retail Minimum Order Qty (MOQ) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="1"
              min="1"
              value={form.retail_min_qty}
              onChange={(e) => set("retail_min_qty", e.target.value)}
              placeholder="1"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs font-semibold text-gray-900 outline-none focus:border-[#076935] focus:bg-white dark:border-white/10 dark:bg-gray-800 dark:text-white"
              required
            />
            <p className="mt-1 text-[10px] text-gray-400">
              Minimum units required for a retail order.
            </p>
          </div>
        </div>

        {/* Wholesale Pricing & Wholesale MOQ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1.5">
              Wholesale Price (Frw) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.wholesale_price}
                onChange={(e) => set("wholesale_price", e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 pl-3 pr-14 text-xs font-semibold text-gray-900 outline-none focus:border-[#076935] focus:bg-white dark:border-white/10 dark:bg-gray-800 dark:text-white"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                RWF
              </span>
            </div>
            <p className="mt-1 text-[10px] text-gray-400">
              Discounted rate for bulk wholesale buyers (0 if disabled).
            </p>
          </div>

          <div>
            <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1.5">
              Wholesale Minimum Order Qty (MOQ) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="1"
              min="1"
              value={form.wholesale_min_qty}
              onChange={(e) => set("wholesale_min_qty", e.target.value)}
              placeholder="1"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs font-semibold text-gray-900 outline-none focus:border-[#076935] focus:bg-white dark:border-white/10 dark:bg-gray-800 dark:text-white"
              required
            />
            <p className="mt-1 text-[10px] text-gray-400">
              Minimum bulk units required to qualify for wholesale rate.
            </p>
          </div>
        </div>
      </div>

      {/* Card Section 3: Shelf Life & Description */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4.5 space-y-4 shadow-2xs dark:border-white/10 dark:bg-gray-900">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-white/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 font-bold">
            <Clock size={17} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Storage & Description
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Expected fresh shelf life and product description.
            </p>
          </div>
        </div>

        <div>
          <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1.5">
            Shelf Life (Days)
          </label>
          <input
            type="number"
            min="0"
            value={form.shelf_life}
            onChange={(e) => set("shelf_life", e.target.value)}
            placeholder="e.g. 7"
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs font-semibold text-gray-900 outline-none focus:border-[#076935] focus:bg-white dark:border-white/10 dark:bg-gray-800 dark:text-white"
          />
          <p className="mt-1 text-[10px] text-gray-400">
            Number of days product maintains peak freshness after delivery.
          </p>
        </div>

        <div>
          <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1.5">
            Product Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Detailed description of produce origin, grade, taste, packaging..."
            rows={4}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-xs text-gray-900 outline-none focus:border-[#076935] focus:bg-white dark:border-white/10 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-200 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#055028] disabled:opacity-50 transition"
        >
          <Save size={16} />
          {saving
            ? "Saving Product..."
            : initial
              ? "Save Changes"
              : "Create Product"}
        </button>
      </div>
    </form>
  );
}