import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductTable from "../../../components/products/ProductTable";
import ProductForm from "../../../components/products/ProductForm";
import { useProductStore, type Product } from "../../../store/useProductStore";
import Modal from "../../../components/ui/Modal";
import "./ProductsList.css";
import "./ProductPanel.css";

function ProductsList() {
  const navigate = useNavigate();
  const clearSelected = useProductStore((s) => s.clearSelected);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    clearSelected();
    setEditing(product);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <>
      <ProductTable
        onAdd={openCreate}
        onEdit={openEdit}
        onView={(id) => {
          clearSelected();
          navigate(`/admin/products/${id}`);
        }}
      />

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? "Edit Product" : "Add New Product"}
        size="md"
      >
        <ProductForm
          initial={editing}
          onSubmit={closeForm}
          onCancel={closeForm}
        />
      </Modal>
    </>
  );
}

export default ProductsList;
