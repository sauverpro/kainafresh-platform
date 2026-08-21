import React, { useState } from 'react';
import { Search, Upload, SlidersHorizontal, Plus, MoreHorizontal, Check, Clock, AlertTriangle } from 'lucide-react';
import ProductPanel from './ProductPanel';
import './ProductsList.css';

// Mock Data
const MOCK_PRODUCTS = [
  { id: '10041', name: 'Organic Avocados', category: 'Fruits', price: 4.99, date: '26.07.2024', status: 'active', stock: 45 },
  { id: '10042', name: 'Fresh Carrots Bundle', category: 'Vegetables', price: 2.50, date: '26.07.2024', status: 'active', stock: 120 },
  { id: '10043', name: 'Raw Honey Jar', category: 'Pantry', price: 12.00, date: '25.07.2024', status: 'draft', stock: 0 },
  { id: '10044', name: 'Free-range Eggs (Dozen)', category: 'Dairy', price: 5.99, date: '25.07.2024', status: 'low stock', stock: 5 },
  { id: '10045', name: 'Organic Tomatoes', category: 'Vegetables', price: 3.20, date: '24.07.2024', status: 'active', stock: 80 },
  { id: '10046', name: 'Sweet Potatoes', category: 'Vegetables', price: 2.80, date: '24.07.2024', status: 'active', stock: 200 },
];

function ProductsList() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleAll = () => {
    if (selectedIds.length === MOCK_PRODUCTS.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(MOCK_PRODUCTS.map(p => p.id));
    }
  };

  // Status badge styling helper
  const renderStatus = (status) => {
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
        <div className="summary-card">
          <div className="summary-card-top bg-blue">
            <span>Total products</span>
          </div>
          <div className="summary-card-bottom">
            <div className="summary-value">124</div>
            <div className="summary-badge badge-green">↑ 12.5%<span>Than last week</span></div>
          </div>
        </div>

        {/* Card 2: Active */}
        <div className="summary-card">
          <div className="summary-card-top bg-orange">
            <span>Active products</span>
          </div>
          <div className="summary-card-bottom">
            <div className="summary-value">108</div>
            <div className="summary-badge badge-green">↑ 4.2%<span>Than last week</span></div>
          </div>
        </div>

        {/* Card 3: Low Stock */}
        <div className="summary-card">
          <div className="summary-card-top bg-yellow">
            <span>Low stock alerts</span>
          </div>
          <div className="summary-card-bottom">
            <div className="summary-value">12</div>
            <div className="summary-badge badge-red">↓ 1.5%<span>Than last week</span></div>
          </div>
        </div>

        {/* Card 4: Drafts */}
        <div className="summary-card">
          <div className="summary-card-top bg-green">
            <span>Draft / Hidden</span>
          </div>
          <div className="summary-card-bottom">
            <div className="summary-value">4</div>
            <div className="summary-badge badge-green">↑ 0.5%<span>Than last week</span></div>
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
