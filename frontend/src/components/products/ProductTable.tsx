import { useEffect, useState } from "react";
import { Search, Plus, Eye, Trash2, ImageOff, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useProductStore, type Product } from "../../store/useProductStore";
import Loader from "../Loader/Loader";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";

interface ProductTableProps {
  onAdd: () => void;
  onEdit: (product: Product) => void;
  onView: (id: number | string) => void;
}

const resolveStatusLabel = (status: string): string => {
  switch (status) {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    default:
      return status;
  }
};

export default function ProductTable({
  onAdd,
  onEdit,
  onView,
}: ProductTableProps) {
  const { products, loading, fetchProducts, deleteProduct } =
    useProductStore();
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  return (
    <div className="products-dashboard">
      <div className="products-header">
        <h1>Products list</h1>
      </div>

      <div className="summary-cards-container">
        <div className="summary-card bg-blue">
          <div className="summary-card-top">
            <span>Total products</span>
          </div>
          <div className="summary-card-bottom">
            <div className="summary-value">{products.length}</div>
          </div>
        </div>
        <div className="summary-card bg-green">
          <div className="summary-card-top">
            <span>Active produce</span>
          </div>
          <div className="summary-card-bottom">
            <div className="summary-value">
              {products.filter((p) => p.status === "active").length}
            </div>
          </div>
        </div>
        <div className="summary-card bg-orange">
          <div className="summary-card-top">
            <span>Avg price</span>
          </div>
          <div className="summary-card-bottom">
            <div className="summary-value">
              {products.length
                ? `$${(
                    products.reduce((sum, p) => sum + Number(p.price), 0) /
                    products.length
                  ).toFixed(2)}`
                : "$0.00"}
            </div>
          </div>
        </div>
        <div className="summary-card bg-purple">
          <div className="summary-card-top">
            <span>Categories</span>
          </div>
          <div className="summary-card-bottom">
            <div className="summary-value">
              {new Set(
                products.map((p) => p.unit_name ?? p.unit_code ?? "—"),
              ).size}
            </div>
          </div>
        </div>
      </div>

      <div className="products-toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search products..." />
          </div>
          <span className="total-text">
            <strong>{products.length}</strong> products
          </span>
        </div>

        <div className="toolbar-right">
          <button className="btn-primary-dark" onClick={onAdd}>
            <Plus size={16} /> Add product
          </button>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading products..." />
      ) : (
        <div className="table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>PRODUCT</th>
                <th>UNIT</th>
                <th>PRICE</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="fw-bold" style={{ textAlign: "center", padding: "2rem" }}>
                    No products found. Click "Add product" to create one.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const src = imageSrc(product);
                  return (
                    <tr key={product.id}>
                      <td className="fw-bold">№{product.id}</td>
                      <td>
                        <div className="product-name-cell">
                          {src ? (
                            <img
                              src={src}
                              alt={product.name}
                              className="product-avatar"
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            <div className="product-avatar">
                              <ImageOff size={16} />
                            </div>
                          )}
                          <div>
                            <div className="fw-bold text-dark">{product.name}</div>
                            <div className="text-light">
                              Shelf life: {product.shelf_life} day(s)
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="fw-bold">
                        {product.unit_name ?? product.unit_code ?? "—"}
                      </td>
                      <td className="fw-bold">${Number(product.price).toFixed(2)}</td>
                      <td>
                        <span
                          className={`status-badge-table ${
                            product.status === "active" ? "active" : "inactive"
                          }`}
                        >
                          {resolveStatusLabel(product.status)}
                        </span>
                      </td>
                      <td className="actions-col">
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <button
                            className="btn-more"
                            title="View product"
                            onClick={() => onView(product.id)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn-more"
                            title="Edit product"
                            onClick={() => onEdit(product)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="btn-more"
                            title="Delete product"
                            onClick={() => setDeleteTarget(product)}
                            style={{ color: "var(--color-danger, #dc2626)" }}
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
      )}

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        itemName={deleteTarget?.name}
        resourceType="product"
        title="Delete product"
        loading={deleting}
      />
    </div>
  );
}
