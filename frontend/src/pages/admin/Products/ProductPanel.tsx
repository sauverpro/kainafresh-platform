import { X, Image as ImageIcon } from 'lucide-react';
import './ProductPanel.css';

interface ProductPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function ProductPanel({ isOpen, onClose }: ProductPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="product-panel-overlay" onClick={onClose}>
      <div className="product-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="panel-header">
          <h2>Add New Product</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body (Form) */}
        <div className="panel-body">
          <div className="panel-form">
            
            {/* Image Upload Area */}
            <div className="form-group">
              <label>Product Image</label>
              <div className="image-upload-box">
                <div className="upload-placeholder">
                  <ImageIcon size={32} color="var(--color-text-light)" />
                  <p>Click or drag image here</p>
                  <span>PNG, JPG up to 5MB</span>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="form-group">
              <label>Product Name</label>
              <input type="text" className="panel-input" placeholder="e.g. Organic Hass Avocados" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select className="panel-input">
                  <option>Fruits</option>
                  <option>Vegetables</option>
                  <option>Dairy</option>
                  <option>Pantry</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="panel-input">
                  <option>Active</option>
                  <option>Draft</option>
                </select>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="form-row">
              <div className="form-group">
                <label>Price ($)</label>
                <input type="number" step="0.01" className="panel-input" placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Base Stock Qty</label>
                <input type="number" className="panel-input" placeholder="0" />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description</label>
              <textarea className="panel-input panel-textarea" placeholder="Short product description..."></textarea>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="panel-footer">
          <button className="btn-outline-dark" onClick={onClose}>Cancel</button>
          <button className="btn-primary-dark">Save Product</button>
        </div>
      </div>
    </div>
  );
}

export default ProductPanel;
