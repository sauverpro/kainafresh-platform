import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Trash2,
  ImageOff,
  Pencil,
  Package,
  CheckCircle,
  Tag,
  Layers,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useProductStore, type Product } from "../../store/useProductStore";
import Loader from "../Loader/Loader";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";

interface ProductTableProps {
  onAdd: () => void;
  onEdit: (product: Product) => void;
  onView: (id: number | string) => void;
}



export default function ProductTable({
  onAdd,
  onEdit,
  onView,
}: ProductTableProps) {
  const { products, loading, fetchProducts, deleteProduct } =
    useProductStore();
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const ok = await deleteProduct(deleteTarget.id);
    setDeleting(false);
    if (ok) {
      toast.success(`Product "${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
    } else {
      toast.error(
        useProductStore.getState().error ?? "Failed to delete product",
      );
    }
  };

  const imageSrc = (p: { product_image?: string | null }) =>
    p.product_image ?? null;

  // Bento Card Statistics
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "active").length;
  const avgPrice = products.length
    ? (products.reduce((sum, p) => sum + Number(p.price), 0) / products.length).toFixed(0)
    : "0";
  const uniqueUnitsCount = new Set(
    products.map((p) => p.unit_name ?? p.unit_code ?? "—"),
  ).size;

  // Filtered Products List
  const filteredProducts = products.filter((p) => {
    if (statusFilter === "active" && p.status !== "active") return false;
    if (statusFilter === "inactive" && p.status !== "inactive") return false;

    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchUnit = (p.unit_name ?? p.unit_code ?? "").toLowerCase().includes(q);
      if (!matchName && !matchUnit) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Products Catalog
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your organic farm produce catalog, prices, and unit measurements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchProducts()}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-white/5"
            title="Refresh Products"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#055028] shadow-xs transition-all"
          >
            <Plus size={16} /> Add New Product
          </button>
        </div>
      </div>

      {/* 1. Bento Summary Grid — 100% Homogeneous with StatCard.tsx */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Products */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5">
            <Package className="h-5.5 w-5.5 text-gray-700 dark:text-gray-300" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Catalog Items</p>
              <p className="mt-1.5 text-2xl font-semibold text-gray-800 dark:text-white">
                {totalProducts}
              </p>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
              Produce Items
            </span>
          </div>
        </div>

        {/* Card 2: Active Produce */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#076935]/10 text-[#076935] dark:bg-green-500/15 dark:text-green-300">
            <CheckCircle className="h-5.5 w-5.5" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Produce</p>
              <p className="mt-1.5 text-2xl font-semibold text-gray-800 dark:text-white">
                {activeProducts}
              </p>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              Live in Shop
            </span>
          </div>
        </div>

        {/* Card 3: Avg Unit Price */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
            <Tag className="h-5.5 w-5.5" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Base Price</p>
              <p className="mt-1.5 text-2xl font-semibold text-gray-800 dark:text-white">
                {avgPrice} <span className="text-xs font-normal text-gray-400">RWF</span>
              </p>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
              Catalog Avg
            </span>
          </div>
        </div>

        {/* Card 4: Unit Types */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
            <Layers className="h-5.5 w-5.5" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Unit Categories</p>
              <p className="mt-1.5 text-2xl font-semibold text-gray-800 dark:text-white">
                {uniqueUnitsCount}
              </p>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-600 dark:bg-purple-500/15 dark:text-purple-300">
              Measurement Units
            </span>
          </div>
        </div>
      </div>

      {/* 2. Filter & Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-gray-900 shadow-xs">
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
            All Products ({products.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === "active"
                ? "bg-white text-[#076935] shadow-xs dark:bg-gray-800 dark:text-green-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            Active ({activeProducts})
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === "inactive"
                ? "bg-white text-gray-700 shadow-xs dark:bg-gray-800 dark:text-gray-300"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            Inactive ({products.length - activeProducts})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name or unit..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-3.5 py-2 text-xs text-gray-900 focus:border-[#076935] focus:bg-white focus:outline-hidden dark:border-white/10 dark:bg-gray-800 dark:text-white dark:focus:border-[#076935]"
          />
        </div>
      </div>

      {/* 3. Products Data Table */}
      {loading ? (
        <Loader text="Loading catalog..." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-white/10 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider dark:bg-white/5 dark:border-white/10 dark:text-gray-400">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">ID</th>
                  <th className="px-5 py-3.5 font-semibold">Produce Name</th>
                  <th className="px-5 py-3.5 font-semibold">Measurement Unit</th>
                  <th className="px-5 py-3.5 font-semibold">Price (RWF)</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="h-8 w-8 text-gray-300" />
                        <p className="text-sm font-medium">No products found</p>
                        <p className="text-xs text-gray-400">Click "Add New Product" to create your first item.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const src = imageSrc(product);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50/80 dark:hover:bg-white/5 transition-colors">
                        <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                          №{product.id}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {src ? (
                              <img
                                src={src}
                                alt={product.name}
                                className="h-10 w-10 rounded-xl object-cover border border-gray-100 dark:border-white/10"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-400 dark:bg-white/5">
                                <ImageOff size={16} />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">
                                {product.name}
                              </p>
                              {product.shelf_life && (
                                <p className="text-[11px] text-gray-400">
                                  Shelf life: {product.shelf_life} day(s)
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-700 dark:text-gray-300">
                          {product.unit_name ?? product.unit_code ?? "—"}
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                          {Number(product.price).toLocaleString()} RWF
                        </td>
                        <td className="px-5 py-4">
                          {product.status === "active" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-300">
                              <CheckCircle size={12} /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-400">
                              <XCircle size={12} /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onView(product.id)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
                              title="View product"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => onEdit(product)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
                              title="Edit product"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(product)}
                              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-white/10"
                              title="Delete product"
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
        itemName={deleteTarget?.name}
        resourceType="product"
        title="Delete Product"
        loading={deleting}
      />
    </div>
  );
}
