import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StockTable from "../../../components/stock/StockTable";
import StockForm from "../../../components/stock/StockForm";
import { useStockStore, type Stock } from "../../../store/useStockStore";
import Modal from "../../../components/ui/Modal";
import "./InventoryList.css";

function InventoryList() {
  const navigate = useNavigate();
  const clearSelected = useStockStore((s) => s.clearSelected);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Stock | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (stock: Stock) => {
    clearSelected();
    setEditing(stock);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <>
      <StockTable
        onAdd={openCreate}
        onEdit={openEdit}
        onView={(id) => {
          clearSelected();
          navigate(`/inventory/${id}`);
        }}
      />

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? "Edit Stock Entry" : "Add Stock Entry"}
        size="md"
      >
        <StockForm
          initial={editing}
          onSubmit={closeForm}
          onCancel={closeForm}
        />
      </Modal>
    </>
  );
}

export default InventoryList;
