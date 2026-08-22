/**
 * ============================================================================
 * KainaFresh Organic Platform — Warehouse Inventory Management Component
 * ============================================================================
 * 
 * Features:
 * 1. Summary Cards: Total Items, Low Stock Alerts, Out of Stock, Total Inventory Value.
 * 2. SKU Warehouse Stock Location Tracking (Zones & Shelves).
 * 3. Reorder level warning indicators with status badge pills.
 * 4. Multi-select SKU table row selection.
 */

// Import React library and state hooks
import React, { useState } from 'react';

// Import Lucide vector icons for inventory badges and toolbar actions
import { Search, Upload, SlidersHorizontal, Plus, MoreHorizontal, AlertTriangle, CheckCircle, PackageSearch } from 'lucide-react';

// Import Inventory stylesheet
import './InventoryList.css';

/**
 * Interface definition representing a single warehouse inventory item.
 */
interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  location: string;
  qty: number;
  reorder: number;
  status: 'in stock' | 'out of stock' | 'low stock';
}

/**
 * Mock Inventory Dataset.
 */
const MOCK_INVENTORY: InventoryItem[] = [
  { sku: 'ORG-AVO-001', name: 'Organic Avocados', category: 'Fruits', location: 'Zone A - Shelf 12', qty: 45, reorder: 50, status: 'low stock' },
  { sku: 'FR-CAR-002', name: 'Fresh Carrots Bundle', category: 'Vegetables', location: 'Zone B - Shelf 04', qty: 120, reorder: 40, status: 'in stock' },
  { sku: 'RAW-HON-003', name: 'Raw Honey Jar', category: 'Pantry', location: 'Zone C - Shelf 01', qty: 0, reorder: 20, status: 'out of stock' },
  { sku: 'EGG-DOZ-004', name: 'Free-range Eggs (Dozen)', category: 'Dairy', location: 'Cooler 1', qty: 5, reorder: 15, status: 'low stock' },
  { sku: 'ORG-TOM-005', name: 'Organic Tomatoes', category: 'Vegetables', location: 'Zone A - Shelf 08', qty: 80, reorder: 30, status: 'in stock' },
];

/**
 * InventoryList Functional Component.
 */
function InventoryList() {
  // Selected SKU IDs array state
  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);

  // Toggle individual SKU row selection
  const toggleSelect = (sku: string) => {
    if (selectedSkus.includes(sku)) {
      setSelectedSkus(selectedSkus.filter(item => item !== sku));
    } else {
      setSelectedSkus([...selectedSkus, sku]);
    }
  };

  // Toggle all row check boxes
  const toggleAll = () => {
    if (selectedSkus.length === MOCK_INVENTORY.length) {
      setSelectedSkus([]);
    } else {
      setSelectedSkus(MOCK_INVENTORY.map(p => p.sku));
    }
  };

  /**
   * Helper function to render inventory status badge pills.
   */
  const renderStatus = (status: string) => {
    switch (status) {
      case 'in stock':
        return <span className="inv-badge in-stock">In Stock <CheckCircle size={12} /></span>;
      case 'out of stock':
        return <span className="inv-badge out-stock">Out of Stock <AlertTriangle size={12} /></span>;
      case 'low stock':
        return <span className="inv-badge low-stock">Low Stock <AlertTriangle size={12} /></span>;
      default:
        return <span className="inv-badge">{status}</span>;
    }
  };

  return (
    <div className="inventory-dashboard">
      <div className="inventory-header">
        <h1>Inventory Management</h1>
      </div>

      {/* --- Top Summary Cards --- */}
      <div className="inv-summary-cards">
        <div className="inv-card">
          <div className="inv-card-top bg-purple">
            <span>Total Items in Stock</span>
          </div>
          <div className="inv-card-bottom">
            <div className="inv-value">8,402</div>
          </div>
        </div>

        <div className="inv-card">
          <div className="inv-card-top bg-orange">
            <span>Low Stock Alerts</span>
          </div>
          <div className="inv-card-bottom">
            <div className="inv-value text-orange">24</div>
            <div className="inv-subtitle">Items below reorder point</div>
          </div>
        </div>

        <div className="inv-card">
          <div className="inv-card-top bg-red">
            <span>Out of Stock</span>
          </div>
          <div className="inv-card-bottom">
            <div className="inv-value text-red">5</div>
            <div className="inv-subtitle">Requires immediate action</div>
          </div>
        </div>

        <div className="inv-card">
          <div className="inv-card-top bg-green">
            <span>Total Inventory Value</span>
          </div>
          <div className="inv-card-bottom">
            <div className="inv-value">$14,250</div>
          </div>
        </div>
      </div>

      {/* --- Toolbar --- */}
      <div className="inv-toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search by SKU or Name" />
          </div>
        </div>
        
        <div className="toolbar-right">
          <button className="btn-outline">
            <Upload size={16} /> Export CSV
          </button>
          <button className="btn-primary-dark">
            <PackageSearch size={16} /> Adjust Stock
          </button>
        </div>
      </div>

      {/* --- Data Table --- */}
      <div className="table-container">
        <table className="inv-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input 
                  type="checkbox" 
                  checked={selectedSkus.length === MOCK_INVENTORY.length && MOCK_INVENTORY.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th>SKU</th>
              <th>PRODUCT NAME</th>
              <th>LOCATION</th>
              <th>QTY AVAILABLE</th>
              <th>REORDER LEVEL</th>
              <th>STATUS</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {MOCK_INVENTORY.map(item => (
              <tr key={item.sku} className={selectedSkus.includes(item.sku) ? 'selected' : ''}>
                <td className="checkbox-col">
                  <input 
                    type="checkbox" 
                    checked={selectedSkus.includes(item.sku)}
                    onChange={() => toggleSelect(item.sku)}
                  />
                </td>
                <td className="sku-cell">{item.sku}</td>
                <td className="product-cell">
                  <div className="fw-bold">{item.name}</div>
                  <div className="text-light">{item.category}</div>
                </td>
                <td className="fw-medium">{item.location}</td>
                <td className="qty-cell">
                  <span className={`qty-number ${item.qty === 0 ? 'text-red' : item.qty <= item.reorder ? 'text-orange' : ''}`}>
                    {item.qty}
                  </span>
                </td>
                <td className="text-light">{item.reorder}</td>
                <td>{renderStatus(item.status)}</td>
                <td className="actions-col">
                  <button className="btn-action">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryList;
