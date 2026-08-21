import React from 'react';
import { Search, Download, Filter, MoreHorizontal, CheckCircle, Clock } from 'lucide-react';
import './DashboardOverview.css';

// Mock Data for Recent Orders
const RECENT_ORDERS = [
  { id: 'ORD-8439', customer: 'Kris Payer', date: '26.07.2024', total: 130.50, status: 'delivered' },
  { id: 'ORD-8440', customer: 'Alice Smith', date: '26.07.2024', total: 45.00, status: 'processing' },
  { id: 'ORD-8441', customer: 'John Doe', date: '25.07.2024', total: 89.99, status: 'shipped' },
  { id: 'ORD-8442', customer: 'Emma Watson', date: '25.07.2024', total: 210.00, status: 'delivered' },
  { id: 'ORD-8443', customer: 'Michael Brown', date: '24.07.2024', total: 35.50, status: 'delivered' },
];

function DashboardOverview() {

  const renderStatus = (status) => {
    switch (status) {
      case 'delivered':
        return <span className="dash-badge delivered">Delivered <CheckCircle size={12} /></span>;
      case 'processing':
        return <span className="dash-badge processing">Processing <Clock size={12} /></span>;
      case 'shipped':
        return <span className="dash-badge shipped">Shipped</span>;
      default:
        return <span className="dash-badge">{status}</span>;
    }
  };

  return (
    <div className="dashboard-overview">
      <div className="dash-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* --- Top Summary Cards --- */}
      <div className="dash-summary-cards">
        <div className="dash-card">
          <div className="dash-card-top bg-green">
            <span>Total Revenue</span>
          </div>
          <div className="dash-card-bottom">
            <div className="dash-value">RWF 840K</div>
            <div className="dash-badge-small badge-green">↑ 15%<span>vs last week</span></div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-top bg-blue">
            <span>Total Orders</span>
          </div>
          <div className="dash-card-bottom">
            <div className="dash-value">156</div>
            <div className="dash-badge-small badge-green">↑ 8%<span>vs last week</span></div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-top bg-orange">
            <span>Active Products</span>
          </div>
          <div className="dash-card-bottom">
            <div className="dash-value">24</div>
            <div className="dash-badge-small badge-neutral">- 0%<span>vs last week</span></div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-top bg-purple">
            <span>New Users</span>
          </div>
          <div className="dash-card-bottom">
            <div className="dash-value">12</div>
            <div className="dash-badge-small badge-red">↓ 2%<span>vs last week</span></div>
          </div>
        </div>
      </div>

      {/* --- Toolbar --- */}
      <div className="dash-toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search orders or customers..." />
          </div>
        </div>
        
        <div className="toolbar-right">
          <button className="btn-outline">
            <Filter size={16} /> Filter
          </button>
          <button className="btn-primary-dark">
            <Download size={16} /> Generate Report
          </button>
        </div>
      </div>

      {/* --- Recent Orders Table --- */}
      <div className="table-container">
        <div className="table-header">
          <h3>Recent Orders</h3>
          <button className="btn-text">View All</button>
        </div>
        <table className="dash-table">
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>CUSTOMER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>STATUS</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {RECENT_ORDERS.map(order => (
              <tr key={order.id}>
                <td className="fw-bold">{order.id}</td>
                <td>
                  <div className="customer-cell">
                    <div className="customer-avatar">{order.customer.charAt(0)}</div>
                    <span className="fw-medium">{order.customer}</span>
                  </div>
                </td>
                <td className="text-light">{order.date}</td>
                <td className="fw-bold">${order.total.toFixed(2)}</td>
                <td>{renderStatus(order.status)}</td>
                <td className="actions-col">
                  <button className="btn-action"><MoreHorizontal size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardOverview;
