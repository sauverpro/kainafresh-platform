/**
 * ============================================================================
 * KainaFresh Organic Platform — Products Catalog Management Component
 * ============================================================================
 * 
 * Features:
 * 1. Multi-select table row checkboxes for batch actions.
 * 2. Status badge pills with Lucide icons (active, draft, low stock).
 * 3. Slide-over slide-in creation/edit side drawer (`ProductPanel`).
 * 4. Search and category filter controls.
 */

// Import React library and state hooks
import React, { useState } from 'react';

// Import Lucide vector icons for table badges and actions
import { Search, Upload, SlidersHorizontal, Plus, MoreHorizontal, Check, Clock, AlertTriangle } from 'lucide-react';

// Import slide-over product creation panel drawer component
import ProductPanel from './ProductPanel';

// Import Product Management stylesheet
import './ProductsList.css';

/**
 * Interface definition representing a single product catalog item.
 */
interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  date: string;
  status: 'active' | 'draft' | 'low stock';
  stock: number;
}

/**
 * Mock Product Catalog Dataset.
 */
const MOCK_PRODUCTS: ProductItem[] = [
  { id: '10041', name: 'Organic Avocados', category: 'Fruits', price: 4.99, date: '26.07.2024', status: 'active', stock: 45 },
  { id: '10042', name: 'Fresh Carrots Bundle', category: 'Vegetables', price: 2.50, date: '26.07.2024', status: 'active', stock: 120 },
  { id: '10043', name: 'Raw Honey Jar', category: 'Pantry', price: 12.00, date: '25.07.2024', status: 'draft', stock: 0 },
  { id: '10044', name: 'Free-range Eggs (Dozen)', category: 'Dairy', price: 5.99, date: '25.07.2024', status: 'low stock', stock: 5 },
  { id: '10045', name: 'Organic Tomatoes', category: 'Vegetables', price: 3.20, date: '24.07.2024', status: 'active', stock: 80 },
  { id: '10046', name: 'Sweet Potatoes', category: 'Vegetables', price: 2.80, date: '24.07.2024', status: 'active', stock: 200 },
];

/**
 * ProductsList Main Functional Component.
 */
function ProductsList() {
  // Selected table row IDs array state for batch actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Slide-over product creation panel open/close state
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Toggle individual row selection checkbox
  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Select/deselect all table rows
  const toggleAll = () => {
    if (selectedIds.length === MOCK_PRODUCTS.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(MOCK_PRODUCTS.map(p => p.id));
    }
  };

  /**
   * Helper function to render status badges with Lucide icons.
   */
  const renderStatus = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="status-badge-table active">active <Check size={12} /></span>;
      case 'draft':
        return <span className="status-badge-table draft">draft <Clock size={12} /></span>;
      case 'low stock':
        return <span className="status-badge-table low-stock">low stock <AlertTriangle size={12} /></span>;
      default:
        return <span className="status-badge-table">{status}</span>;
    }
  };

  return (
    <div className="products-dashboard">
      <div className="products-header">
        <h1>Products list</h1>
      </div>

      {/* --- Top Summary Cards --- */}
      <div className="summary-cards-container">
        {/* Card 1: Total */}
        <div className="summary-card bg-blue">
          <div className="summary-card-top">
            <span>Total products</span>
          </div>
          <div className="summary-card-bottom">
            <div className="summary-value">124</div>
            <div className="summary-badge">↑ 12.5%</div>
          </div>
        </div>

        {/* Card 2: Active */}
        <div className="summary-card bg-green">
          <div className="summary-card-top">
            <span>Active produce</span>
          </div>
          <div className="summary-card-bottom">
            <div className="summary-value">108</div>
            <div className="summary-badge">↑ 4.2%</div>
          </div>
        </div>

        {/* Card 3: Low Stock */}
        <div className="summary-card bg-orange">
          <div className="summary-card-top">
            <span>Low stock alerts</span>
          </div>
          <div className="summary-card-bottom">
            <div className="summary-value">12</div>
            <div className="summary-badge">↓ 1.5%</div>
          </div>
        </div>

        {/* Card 4: Purple Category */}
        <div className="summary-card bg-purple">
          <div className="summary-card-top">
            <span>Wholesale Items</span>
          </div>
          <div className="summary-card-bottom">
            <div className="summary-value">16</div>
            <div className="summary-badge">↑ 2.0%</div>
          </div>
        </div>
      </div>

      {/* --- Toolbar --- */}
      <div className="products-toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search" />
          </div>
          <span className="total-text"><strong>124</strong> products</span>
        </div>
        
        <div className="toolbar-right">
          <button className="btn-text">
            <Upload size={16} /> Export
          </button>
          <button className="btn-outline">
            <SlidersHorizontal size={16} /> Sort: default
          </button>
          <button className="btn-primary-dark" onClick={() => setIsPanelOpen(true)}>
            <Plus size={16} /> Add product
          </button>
        </div>
      </div>

      {/* --- Filter Pills --- */}
      <div className="filter-pills">
        <button className="filter-icon-btn"><SlidersHorizontal size={16} /></button>
        <span className="filter-pill">Fruits <button>×</button></span>
        <span className="filter-pill">Vegetables <button>×</button></span>
        <button className="clear-all-btn">Clear all (2)</button>
        
        <div className="pagination-text">1 of 12 &nbsp; &lt; &gt;</div>
      </div>

      {/* --- Data Table --- */}
      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === MOCK_PRODUCTS.length}
                  onChange={toggleAll}
                />
              </th>
              <th>SKU / ID</th>
              <th>PRODUCT NAME</th>
              <th>CATEGORY</th>
              <th>PRICE</th>
              <th>DATE ADDED</th>
              <th>STATUS</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PRODUCTS.map(product => (
              <tr key={product.id} className={selectedIds.includes(product.id) ? 'selected' : ''}>
                <td className="checkbox-col">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(product.id)}
                    onChange={() => toggleSelect(product.id)}
                  />
                </td>
                <td className="fw-bold">№{product.id}</td>
                <td>
                  <div className="product-name-cell">
                    <div className="product-avatar"></div>
                    <div>
                      <div className="fw-bold text-dark">{product.name}</div>
                      <div className="text-light">Stock: {product.stock}</div>
                    </div>
                  </div>
                </td>
                <td className="fw-bold">{product.category}</td>
                <td className="fw-bold">${product.price.toFixed(2)}</td>
                <td className="fw-bold">{product.date}</td>
                <td>{renderStatus(product.status)}</td>
                <td className="actions-col">
                  <button className="btn-more"><MoreHorizontal size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Slide-out Panel --- */}
      <ProductPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
    </div>
  );
}

export default ProductsList;
