import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  ImageOff,
  Tag,
  Calendar,
  Boxes,
} from "lucide-react";
import { toast } from "sonner";
import { useProductStore } from "../../store/useProductStore";
import Loader from "../Loader/Loader";
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
      <div className="products-dashboard">
        <div className="auth-error-banner">
          <span className="auth-error-icon">⚠</span> No product id provided.
        </div>
        <button className="btn-outline" onClick={() => navigate("/products")}>
          <ArrowLeft size={16} /> Back to list
        </button>
      </div>
    );
  }

  const goBack = () => navigate("/products");

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

  return (
    <>
      {loading ? (
        <Loader text="Loading product..." />
      ) : error || !selected ? (
        <div className="products-dashboard">
          <div className="auth-error-banner">
            <span className="auth-error-icon">⚠</span>{" "}
            {error ?? "Product not found."}
          </div>
          <button className="btn-outline" onClick={goBack}>
            <ArrowLeft size={16} /> Back to list
          </button>
        </div>
      ) : (
        <div className="products-dashboard">
          <div className="products-header" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button className="btn-outline" onClick={goBack}>
              <ArrowLeft size={16} />
            </button>
            <h1>{selected.name}</h1>
          </div>

          <div className="product-detail-card">
            <div className="product-detail-left">
              {selected.product_image ? (
                <img src={selected.product_image} alt={selected.name} />
              ) : (
                <div className="product-detail-image-placeholder">
                  <ImageOff size={48} />
                </div>
              )}
            </div>

            <div className="product-detail-right">
              <div className="product-detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Price</span>
                  <span className="detail-value">
                    ${Number(selected.price).toFixed(2)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Unit</span>
                  <span className="detail-value">
                    {selected.unit_name ?? selected.unit_code ?? "—"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Shelf life</span>
                  <span className="detail-value">
                    <Boxes size={14} style={{ marginRight: 6 }} />
                    {selected.shelf_life} day(s)
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span
                    className={`status-badge-table ${
                      selected.status === "active" ? "active" : "inactive"
                    }`}
                  >
                    {selected.status}
                  </span>
                </div>
              </div>

              {selected.description && (
                <div className="product-detail-desc">{selected.description}</div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
            <button
              className="btn-danger-outline"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 size={16} style={{ marginRight: 8 }} /> Delete
            </button>
            <button className="btn-primary-dark" onClick={() => setEditOpen(true)}>
              <Pencil size={16} style={{ marginRight: 8 }} /> Edit
            </button>
          </div>

          {selected.created_at && (
            <p
              className="text-light"
              style={{
                marginTop: "1rem",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Calendar size={14} /> Added{" "}
              {new Date(selected.created_at).toLocaleDateString()}
              <Tag size={14} style={{ marginLeft: 16 }} /> ID: {selected.id}
            </p>
          )}
        </div>
      )}

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Product"
        size="md"
      >
        <ProductForm
          initial={selected}
          onSubmit={() => setEditOpen(false)}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selected?.name}
        resourceType="product"
        title="Delete product"
        loading={deleting}
      />
    </>
  );
}
