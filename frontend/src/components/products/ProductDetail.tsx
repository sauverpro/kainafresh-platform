import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  ImageOff,
  Calendar,
  Clock,
  Coins,
  AlertCircle,
  CheckCircle,
  XCircle,
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
          <ArrowLeft size={16} /> Back to Products
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
          <ArrowLeft size={16} /> Back to Products
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
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6 max-w-6xl mx-auto">
      {/* Top Header Nav & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-xs transition hover:bg-gray-100 dark:border-white/10 dark:bg-gray-800 dark:text-gray-300"
            title="Back to products catalog"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="hover:underline cursor-pointer" onClick={goBack}>
              Products Catalog
            </span>
            <span>/</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {selected.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 shadow-xs transition hover:bg-red-600 hover:text-white dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
          >
            <Trash2 size={14} /> Delete
          </button>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#076935] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#055028]"
          >
            <Pencil size={14} /> Edit Product
          </button>
        </div>
      </div>

      {/* Main Single Product Card Showcase */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-gray-900">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Product Image Box */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full aspect-square max-w-md rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-white/10 flex items-center justify-center p-4 overflow-hidden shadow-xs">
              {selected.product_image ? (
                <img
                  src={selected.product_image}
                  alt={selected.name}
                  className="w-full h-full object-cover rounded-xl transition duration-300 hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <ImageOff size={48} className="mb-2" />
                  <p className="text-xs font-semibold">No Image Provided</p>
                </div>
              )}

              {/* Status Badge Tag */}
              <span
                className={`absolute top-4 left-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold shadow-xs ${
                  selected.status === "active"
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                {selected.status === "active" ? (
                  <>
                    <CheckCircle size={12} /> Active in Store
                  </>
                ) : (
                  <>
                    <XCircle size={12} /> Inactive Draft
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Right: Product Showcase Details & Pricing */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#076935] uppercase tracking-wider dark:bg-emerald-950/40 dark:text-emerald-400">
                  {unitLabel}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  ID: #{selected.id}
                </span>
              </div>
              <h1
                className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {selected.name}
              </h1>
            </div>

            {/* Price Box */}
            <div className="rounded-2xl bg-[#F4FAF7] p-4.5 border border-[#076935]/15 dark:bg-gray-800/80 dark:border-white/10 space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  Retail Price:
                </span>
                <span
                  className="text-3xl font-extrabold text-[#076935] dark:text-emerald-400"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {retailPrice.toLocaleString()}{" "}
                  <span className="text-sm font-bold text-gray-500">
                    RWF / {unitLabel}
                  </span>
                </span>
              </div>

              {hasWholesale && (
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#076935]/10 dark:border-white/10 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                    <Coins size={15} className="text-amber-600" />
                    <span>Wholesale Rate:</span>
                    <span className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
                      {wholesalePrice.toLocaleString()} RWF
                    </span>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    {discountPercent}% B2B Discount (MOQ: {selected.wholesale_min_qty || 1} {unitLabel})
                  </span>
                </div>
              )}
            </div>

            {/* Key Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-y border-gray-100 py-4 dark:border-white/10 text-xs">
              <div>
                <span className="text-gray-400 block mb-0.5 font-medium">
                  Measurement Unit
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {unitLabel} {selected.unit_symbol ? `(${selected.unit_symbol})` : ""}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block mb-0.5 font-medium">
                  Shelf Life Expectancy
                </span>
                <span className="font-bold text-gray-900 dark:text-white inline-flex items-center gap-1">
                  <Clock size={13} className="text-orange-500" />
                  {selected.shelf_life || 0} Days
                </span>
              </div>

              <div>
                <span className="text-gray-400 block mb-0.5 font-medium">
                  Retail Min Order
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selected.retail_min_qty || 1} {unitLabel}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block mb-0.5 font-medium">
                  Wholesale Min Order
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selected.wholesale_min_qty || 1} {unitLabel}
                </span>
              </div>

              {selected.created_at && (
                <div>
                  <span className="text-gray-400 block mb-0.5 font-medium">
                    Date Created
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white inline-flex items-center gap-1">
                    <Calendar size={13} className="text-blue-500" />
                    {new Date(selected.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Product Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Product Description
              </h3>
              {selected.description ? (
                <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {selected.description}
                </p>
              ) : (
                <p className="text-xs text-gray-400 italic">
                  No detailed description added yet.
                </p>
              )}
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
