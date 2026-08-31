import { Trash2, TriangleAlert } from "lucide-react";
import Modal from "./Modal";

export interface ConfirmDeleteProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  itemName?: string;
  resourceType?: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
}

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  itemName,
  resourceType = "item",
  title = "Confirm deletion",
  description,
  confirmLabel = "Delete",
  loading = false,
}: ConfirmDeleteProps) {
  const isDefaultDesc = description == null;
  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      size="sm"
      showCloseIcon={!loading}
      title={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fee2e2",
              color: "#dc2626",
            }}
          >
            <TriangleAlert size={18} />
          </span>
          {title}
        </span>
      }
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, width: "100%" }}>
          <button
            type="button"
            className="btn-outline-dark"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger-solid"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" style={{ marginRight: 8 }} />
            ) : (
              <Trash2 size={16} style={{ marginRight: 8 }} />
            )}
            {confirmLabel}
          </button>
        </div>
      }
    >
      <p
        style={{
          margin: 0,
          color: "#4b5563",
          fontSize: "0.9rem",
          lineHeight: 1.5,
        }}
      >
        {isDefaultDesc
          ? <>Are you sure you want to delete this {resourceType}?</>
          : description}
        {itemName ? (
          <>
            {" "}
            <strong style={{ color: "#111827" }}>“{itemName}”</strong> will be
            permanently removed. This action cannot be undone.
          </>
        ) : (
          " This action cannot be undone."
        )}
      </p>
    </Modal>
  );
}
