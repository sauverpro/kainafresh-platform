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
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { useStockStore } from "../../store/useStockStore";
import Loader from "../Loader/Loader";
import Modal from "../ui/Modal";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";
import StockForm from "./StockForm";

const formatQty = (qty: number): string => {
  const n = Number(qty);
  return Number.isInteger(n) ? String(n) : n.toFixed(3);
};

const formatDate = (d?: string | null): string =>
  d ? new Date(d + (d.length === 10 ? "T00:00:00" : "")).toLocaleDateString() : "—";

export default function StockDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selected, loading, error, getStock, deleteStock } = useStockStore();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) getStock(id);
  }, [id, getStock]);

  if (!id) {
    return (
      <div className="inventory-dashboard">
        <div className="auth-error-banner">
          <span className="auth-error-icon">⚠</span> No stock id provided.
        </div>
        <button className="btn-outline-dark" onClick={() => navigate("/inventory")}>
          <ArrowLeft size={16} style={{ marginRight: 8 }} /> Back to inventory
        </button>
      </div>
    );
  }

  const goBack = () => navigate("/inventory");

  const handleConfirmDelete = async () => {
    setDeleting(true);
    const ok = await deleteStock(id);
    setDeleting(false);
    if (ok) {
      toast.success("Stock record deleted successfully");
      setDeleteOpen(false);
      goBack();
    } else {
      toast.error(useStockStore.getState().error ?? "Failed to delete stock");
    }
  };

  return (
    <>
      {loading ? (
        <Loader text="Loading stock..." />
      ) : error || !selected ? (
        <div className="inventory-dashboard">
          <div className="auth-error-banner">
            <span className="auth-error-icon">⚠</span>{" "}
            {error ?? "Stock entry not found."}
          </div>
          <button className="btn-outline-dark" onClick={goBack}>
            <ArrowLeft size={16} style={{ marginRight: 8 }} /> Back to inventory
          </button>
        </div>
      ) : (
        <div className="inventory-dashboard">
          <div className="inventory-header" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button className="btn-outline-dark" onClick={goBack}>
              <ArrowLeft size={16} />
            </button>
            <h1 style={{ marginBottom: 0 }}>
              {[selected.product_name, selected.variety].filter(Boolean).join(" · ")}
            </h1>
          </div>

          <div className="stock-detail-card">
            <div className="stock-detail-left">
              {selected.product_image ? (
                <img src={selected.product_image} alt={selected.product_name ?? "product"} />
              ) : (
                <div className="stock-detail-image-placeholder">
                  <ImageOff size={48} />
                </div>
              )}
            </div>

            <div className="stock-detail-right">
              <div className="stock-detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Quantity</span>
                  <span className="detail-value">
                    <Boxes size={14} style={{ marginRight: 6 }} />
                    {formatQty(Number(selected.quantity))}{" "}
                    <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#9ca3af", marginLeft: 4 }}>
                      {selected.unit_name ?? selected.unit_code ?? "units"}
                    </span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Grade</span>
                  <span className="detail-value">{selected.grade || "—"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Farm / Plot</span>
                  <span className="detail-value">
                    <MapPin size={14} style={{ marginRight: 6 }} />
                    {selected.farm_plot || "—"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Product Unit</span>
                  <span className="detail-value">
                    {selected.unit_name ?? selected.unit_code ?? "—"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "2rem", marginTop: "1.25rem" }}>
                <div className="detail-item">
                  <span className="detail-label">Harvest Date</span>
                  <span className="detail-value" style={{ fontWeight: 600 }}>
                    {formatDate(selected.harvest_date)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Pack Date</span>
                  <span className="detail-value" style={{ fontWeight: 600 }}>
                    {formatDate(selected.pack_date)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", maxWidth: 720, marginTop: "1rem" }}>
            <button className="btn-danger-outline" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={16} style={{ marginRight: 8 }} /> Delete
            </button>
            <button className="btn-primary-dark" onClick={() => setEditOpen(true)}>
              <Pencil size={16} style={{ marginRight: 8 }} /> Edit
            </button>
          </div>

          {selected.created_at && (
            <p className="text-light" style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: 6 }}>
              <Calendar size={14} /> Added {new Date(selected.created_at).toLocaleDateString()}
              <Tag size={14} style={{ marginLeft: 16 }} /> ID: {selected.id}
            </p>
          )}
        </div>
      )}

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Stock Entry"
        size="md"
      >
        <StockForm
          initial={selected}
          onSubmit={() => setEditOpen(false)}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selected?.product_name}
        resourceType="stock entry"
        title="Delete stock entry"
        loading={deleting}
      />
    </>
  );
}
