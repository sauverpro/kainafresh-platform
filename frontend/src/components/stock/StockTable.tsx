import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  Trash2,
  Pencil,
  ImageOff,
  PackagePlus,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useStockStore, type Stock } from "../../store/useStockStore";
import Loader from "../Loader/Loader";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";
import { toast } from "sonner";

interface StockTableProps {
  onAdd: () => void;
  onEdit: (stock: Stock) => void;
  onView: (id: number | string) => void;
}

const LOW_STOCK_THRESHOLD = 10;

type StockStatus = "in stock" | "low stock" | "out of stock";

const stockStatus = (qty: number): StockStatus => {
  if (qty <= 0) return "out of stock";
  if (qty <= LOW_STOCK_THRESHOLD) return "low stock";
  return "in stock";
};

const formatQty = (qty: number): string => {
  const n = Number(qty);
  return Number.isInteger(n) ? String(n) : n.toFixed(3);
};

export default function StockTable({ onAdd, onEdit, onView }: StockTableProps) {
  const { stocks, loading, fetchStocks, deleteStock } = useStockStore();
  const [deleteTarget, setDeleteTarget] = useState<Stock | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const ok = await deleteStock(deleteTarget.id);
    setDeleting(false);
    if (ok) {
      toast.success("Stock record deleted successfully");
      setDeleteTarget(null);
    } else {
      toast.error(useStockStore.getState().error ?? "Failed to delete stock");
    }
  };

  const totalQty = stocks.reduce((sum, s) => sum + Number(s.quantity), 0);
  const counts = {
    low: stocks.filter((s) => stockStatus(Number(s.quantity)) === "low stock").length,
    out: stocks.filter((s) => stockStatus(Number(s.quantity)) === "out of stock").length,
  };

  const productLabel = (s: Stock) =>
    [s.product_name, s.variety].filter(Boolean).join(" · ");

  return (
    <div className="inventory-dashboard">
      <div className="inventory-header">
        <h1>Inventory Management</h1>
      </div>

      <div className="inv-summary-cards">
        <div className="inv-card">
          <div className="inv-card-top bg-purple">
            <span>Total Stock Entries</span>
          </div>
          <div className="inv-card-bottom">
            <div className="inv-value">{stocks.length}</div>
          </div>
        </div>
        <div className="inv-card">
          <div className="inv-card-top bg-green">
            <span>Total Units in Stock</span>
          </div>
          <div className="inv-card-bottom">
            <div className="inv-value">{formatQty(totalQty)}</div>
          </div>
        </div>
        <div className="inv-card">
          <div className="inv-card-top bg-orange">
            <span>Low Stock</span>
          </div>
          <div className="inv-card-bottom">
            <div className="inv-value text-orange">{counts.low}</div>
            <div className="inv-subtitle">Items below threshold</div>
          </div>
        </div>
        <div className="inv-card">
          <div className="inv-card-top bg-red">
            <span>Out of Stock</span>
          </div>
          <div className="inv-card-bottom">
            <div className="inv-value text-red">{counts.out}</div>
            <div className="inv-subtitle">Requires attention</div>
          </div>
        </div>
      </div>

      <div className="inv-toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search by product or plot..." />
          </div>
          <span className="total-text">
            <strong>{stocks.length}</strong> entries
          </span>
        </div>

        <div className="toolbar-right">
          <button className="btn-primary-dark" onClick={onAdd}>
            <PackagePlus size={16} /> Add Stock
          </button>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading stock..." />
      ) : (
        <div className="table-container">
          <table className="inv-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>PRODUCT</th>
                <th>GRADE</th>
                <th>LOCATION / PLOT</th>
                <th>QTY</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {stocks.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="fw-bold"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    No stock entries found. Click "Add Stock" to create one.
                  </td>
                </tr>
              ) : (
                stocks.map((stock) => {
                  const status = stockStatus(Number(stock.quantity));
                  const src = stock.product_image;
                  return (
                    <tr key={stock.id}>
                      <td className="fw-bold">№{stock.id}</td>
                      <td className="product-cell">
                        <div className="product-name-cell">
                          {src ? (
                            <img
                              src={src}
                              alt={stock.product_name ?? "product"}
                              className="product-avatar"
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            <div className="product-avatar">
                              <ImageOff size={16} />
                            </div>
                          )}
                          <div>
                            <div className="fw-bold text-dark">{productLabel(stock)}</div>
                            <div className="text-light">
                              {stock.unit_name ?? stock.unit_code ?? "units"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="fw-medium">{stock.grade || "—"}</td>
                      <td className="fw-medium">{stock.farm_plot || "—"}</td>
                      <td className="qty-cell">
                        <span
                          className={`qty-number ${
                            status === "out of stock"
                              ? "text-red"
                              : status === "low stock"
                              ? "text-orange"
                              : ""
                          }`}
                        >
                          {formatQty(Number(stock.quantity))}
                        </span>
                      </td>
                      <td>
                        {status === "in stock" && (
                          <span className="inv-badge in-stock">
                            In Stock <CheckCircle size={12} />
                          </span>
                        )}
                        {status === "low stock" && (
                          <span className="inv-badge low-stock">
                            Low Stock <AlertTriangle size={12} />
                          </span>
                        )}
                        {status === "out of stock" && (
                          <span className="inv-badge out-stock">
                            Out of Stock <AlertTriangle size={12} />
                          </span>
                        )}
                      </td>
                      <td className="actions-col">
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <button
                            className="btn-more"
                            title="View stock"
                            onClick={() => onView(stock.id)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn-more"
                            title="Edit stock"
                            onClick={() => onEdit(stock)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="btn-more"
                            title="Delete stock"
                            onClick={() => setDeleteTarget(stock)}
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
        itemName={deleteTarget?.product_name}
        resourceType="stock entry"
        title="Delete stock entry"
        loading={deleting}
      />
    </div>
  );
}
