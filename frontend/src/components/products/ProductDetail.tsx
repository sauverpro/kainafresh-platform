import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  ImageOff,
  Calendar,
  Package,
  Clock,
  Coins,
  AlertCircle,
  Tag,
  CheckCircle,
  XCircle,
  Building2,
  ShoppingBag,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useProductStore } from "../../store/useProductStore";
import ProductDetailSkeleton from "../skeletons/ProductDetailSkeleton";
import Modal from "../ui/Modal";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";
import ProductForm from "./ProductForm";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selected, loading, error, getProduct, deleteProduct } =
    useProductStore();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) getProduct(id);
  }, [id, getProduct]);

  if (!id) {
    return (
      <div className="px-4 py-8 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-700 border border-red-200">
          <AlertCircle size={16} className="shrink-0 text-red-500" /> No product ID provided.
        </div>
        <button
          onClick={() => navigate("/admin/products")}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 transition"
        >
          <ArrowLeft size={16} /> Back to Products List
        </button>
      </div>
    );
  }

  const goBack = () => navigate("/admin/products");

  const handleConfirmDelete = async () => {
    setDeleting(true);
    const ok = await deleteProduct(id);
    setDeleting(false);
    if (ok) {
      toast.success(`Product "${selected?.name}" deleted successfully`);
      setDeleteOpen(false);
      goBack();
    } else {
      toast.error(
        useProductStore.getState().error ?? "Failed to delete product",
      );
    }
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !selected) {
    return (
      <div className="px-4 py-8 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-700 border border-red-200">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <span>{error ?? "Product not found."}</span>
        </div>
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 transition"
        >
          <ArrowLeft size={16} /> Back to Products List
        </button>
      </div>
    );
  }

  const unitLabel = selected.unit_name ?? selected.unit_code ?? "Unit";
  const retailPrice = Number(selected.price) || 0;
  const wholesalePrice = Number(selected.wholesale_price) || 0;
  const hasWholesale = wholesalePrice > 0;
  const discountPercent =
    hasWholesale && retailPrice > 0
      ? Math.round(((retailPrice - wholesalePrice) / retailPrice) * 100)
      : 0;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-xs transition hover:bg-gray-100 hover:text-gray-900 dark:border-white/10 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
            title="Back to products list"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Products Catalog</span>
              <span>/</span>
              <span className="font-semibold text-[#076935]">Product Details</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <h1
                className="text-2xl font-bold text-gray-900 dark:text-white leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {selected.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  selected.status === "active"
                    ? "bg-emerald-100/80 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {selected.status === "active" ? (
                  <>
                    <CheckCircle size={12} /> Active
                  </>
                ) : (
                  <>
                    <XCircle size={12} /> Inactive
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 shadow-xs transition hover:bg-red-600 hover:text-white dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
          >
            <Trash2 size={15} /> Delete Product
          </button>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#055028]"
          >
            <Pencil size={15} /> Edit Product
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Retail Price Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#076935] dark:bg-emerald-950/30 dark:text-emerald-400">
              <ShoppingBag size={20} />
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
              Retail Rate
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Retail Price
            </p>
            <p
              className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {retailPrice.toLocaleString()} <span className="text-xs font-bold text-gray-400">RWF</span>
            </p>
            <p className="mt-1 text-xs text-gray-400 font-normal">Per {unitLabel}</p>
          </div>
        </div>

        {/* Wholesale Price Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
              <Coins size={20} />
            </div>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
              {hasWholesale ? `${discountPercent}% Off B2B` : "N/A"}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Wholesale Price
            </p>
            <p
              className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {hasWholesale ? wholesalePrice.toLocaleString() : "—"} <span className="text-xs font-bold text-gray-400">{hasWholesale ? "RWF" : ""}</span>
            </p>
            <p className="mt-1 text-xs text-gray-400 font-normal">
              {hasWholesale ? `Save ${(retailPrice - wholesalePrice).toLocaleString()} RWF / unit` : "Wholesale rate not set"}
            </p>
          </div>
        </div>

        {/* Retail Minimum Order Qty */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
              <Package size={20} />
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">
              Min Cart Qty
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Retail MOQ
            </p>
            <p
              className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {selected.retail_min_qty || 1} <span className="text-xs font-bold text-gray-400">{unitLabel}</span>
            </p>
            <p className="mt-1 text-xs text-gray-400 font-normal">Minimum retail cart order</p>
          </div>
        </div>

        {/* Wholesale Minimum Order Qty */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400">
              <Building2 size={20} />
            </div>
            <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300">
              B2B Threshold
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Wholesale MOQ
            </p>
            <p
              className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {selected.wholesale_min_qty || 1} <span className="text-xs font-bold text-gray-400">{unitLabel}</span>
            </p>
            <p className="mt-1 text-xs text-gray-400 font-normal">Required for wholesale rate</p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Details Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Product Image & Overview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-gray-900">
            <div className="overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-white/10 flex items-center justify-center min-h-[280px]">
              {selected.product_image ? (
                <img
                  src={selected.product_image}
                  alt={selected.name}
                  className="w-full max-h-80 object-cover rounded-xl transition hover:scale-105 duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 p-8">
                  <ImageOff size={56} className="mb-2" />
                  <p className="text-xs font-bold">No Image Available</p>
                  <p className="text-[11px] text-gray-400">Upload a product image in edit mode</p>
                </div>
              )}
            </div>

            {/* Fast Facts List */}
            <div className="mt-5 space-y-3 divide-y divide-gray-100 dark:divide-white/10 text-xs">
              <div className="flex items-center justify-between pt-1">
                <span className="text-gray-500 font-medium">Product ID:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  #{selected.id}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-gray-500 font-medium">Measurement Unit:</span>
                <span className="font-bold text-[#076935] dark:text-emerald-400">
                  {unitLabel} {selected.unit_symbol ? `(${selected.unit_symbol})` : ""}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-gray-500 font-medium">Shelf Life Expectancy:</span>
                <span className="inline-flex items-center gap-1 font-bold text-gray-900 dark:text-white">
                  <Clock size={14} className="text-orange-500" />
                  {selected.shelf_life || 0} Day(s)
                </span>
              </div>

              {selected.created_at && (
                <div className="flex items-center justify-between pt-3">
                  <span className="text-gray-500 font-medium">Date Added:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-gray-700 dark:text-gray-300">
                    <Calendar size={14} className="text-blue-500" />
                    {new Date(selected.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Rules & Description */}
        <div className="lg:col-span-7 space-y-6">
          {/* Wholesale & Retail Pricing Breakdown Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-gray-900 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4 dark:border-white/10">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#076935]/10 text-[#076935] dark:bg-emerald-950/30 dark:text-emerald-400 font-bold">
                <Coins size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Pricing & Wholesale Tier Rules
                </h3>
                <p className="text-xs text-gray-500">
                  Summary of retail and bulk wholesale order parameters.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-2 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider text-[11px]">
                    Retail Customer Tier
                  </span>
                  <ShoppingBag size={15} className="text-emerald-600" />
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {retailPrice.toLocaleString()} RWF <span className="text-xs font-normal text-gray-500">/ {unitLabel}</span>
                </p>
                <div className="text-[11px] text-gray-600 dark:text-gray-300 space-y-1 border-t border-emerald-200/60 pt-2 dark:border-emerald-900/40">
                  <p><strong>Minimum Order:</strong> {selected.retail_min_qty || 1} {unitLabel}</p>
                  <p><strong>Eligibility:</strong> Individual consumer accounts</p>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-2 dark:border-amber-900/50 dark:bg-amber-950/20">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider text-[11px]">
                    Wholesale B2B Tier
                  </span>
                  <Building2 size={15} className="text-amber-600" />
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {hasWholesale ? `${wholesalePrice.toLocaleString()} RWF` : "Not Offered"}{" "}
                  {hasWholesale && <span className="text-xs font-normal text-gray-500">/ {unitLabel}</span>}
                </p>
                <div className="text-[11px] text-gray-600 dark:text-gray-300 space-y-1 border-t border-amber-200/60 pt-2 dark:border-amber-900/40">
                  <p><strong>Minimum Order (MOQ):</strong> {selected.wholesale_min_qty || 1} {unitLabel}</p>
                  <p><strong>B2B Savings:</strong> {hasWholesale ? `${discountPercent}% per unit` : "Standard pricing applies"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-gray-900 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4 dark:border-white/10">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 font-bold">
                <Info size={18} />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Produce Description & Quality Notes
              </h3>
            </div>

            {selected.description ? (
              <p className="text-xs text-gray-700 leading-relaxed dark:text-gray-300 whitespace-pre-line">
                {selected.description}
              </p>
            ) : (
              <p className="text-xs text-gray-400 italic">
                No description provided for this product yet.
              </p>
            )}

            <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3 text-[11px] text-gray-500 dark:border-white/5 dark:bg-gray-800/50 flex items-start gap-2">
              <Tag size={15} className="text-[#076935] shrink-0 mt-0.5" />
              <span>
                <strong>Freshness Guarantee:</strong> KainaFresh produce is harvested and quality verified before dispatch. Shelf life is calculated based on standard cool-chain storage conditions.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Product"
        size="lg"
      >
        <ProductForm
          initial={selected}
          onSubmit={() => setEditOpen(false)}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selected?.name}
        resourceType="product"
        title="Delete Product"
        loading={deleting}
      />
    </div>
  );
}
