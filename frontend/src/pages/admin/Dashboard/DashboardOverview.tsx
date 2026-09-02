/**
 * ============================================================================
 * KainaFresh Organic Platform — Bento Card Composition Dashboard Overview
 * ============================================================================
 * 
 * Layout Architecture:
 * 1. 2x2 Metric Card Palette: Total Orders, Monthly Sales, Active Clients, Delivered Weight.
 * 2. Target Progress SVG Ring Chart: Circular dual-gradient progress indicator (#076935 to #F39927).
 * 3. Calendar Day Strip Widget: Interactive day picker.
 * 4. Recent Orders Table: Status pill indicators with Lucide vector icons.
 * 5. Sage Green Action CTA Card: Inventory restock reminder.
 */

// Import React library and state hooks
// Import React state hooks
import { useState } from 'react';

// Import Lucide vector icons for dashboard composition
import { 
  Search, ChevronDown, CheckCircle, Clock, ArrowRight, Shield, 
  Package, ShoppingBag, Users, DollarSign, Eye,
  ChevronLeft, ChevronRight, Leaf, Truck
} from 'lucide-react';

// Import Bento grid dashboard stylesheet
import './DashboardOverview.css';

/**
 * Mock Recent Orders Dataset representing order transactions.
 */
const RECENT_ORDERS = [
  { id: 'ORD-8439', customer: 'Kris Payer', date: '26.08.2026', total: 130.50, status: 'delivered' },
  { id: 'ORD-8440', customer: 'Alice Smith', date: '26.08.2026', total: 45.00, status: 'processing' },
  { id: 'ORD-8441', customer: 'John Doe', date: '25.08.2026', total: 89.99, status: 'shipped' },
  { id: 'ORD-8442', customer: 'Emma Watson', date: '25.08.2026', total: 210.00, status: 'delivered' },
  { id: 'ORD-8443', customer: 'Michael Brown', date: '24.08.2026', total: 35.50, status: 'delivered' },
];

/**
 * DashboardOverview Functional Component.
 */
function DashboardOverview() {
  // Calendar day selector active index state
  const [activeDay, setActiveDay] = useState(19);

  /**
   * Helper function to render styled status badge pills with Lucide icons.
   */
  const renderStatus = (status: string) => {
    switch (status) {
      case 'delivered':
        return <span className="dash-badge delivered">Delivered <CheckCircle size={12} /></span>;
      case 'processing':
        return <span className="dash-badge processing">Processing <Clock size={12} /></span>;
      case 'shipped':
        return <span className="dash-badge shipped">Shipped <Truck size={12} /></span>;
      default:
        return <span className="dash-badge">{status}</span>;
    }
  };

  return (
    <div className="dashboard-overview">
      {/* ── Top Header Banner ── */}
      <div className="dash-top-banner">
        <div className="dash-greeting">
          <h1>Welcome back, Admin</h1>
          <p>Here is a complete composition of your store overview today.</p>
        </div>

        <div className="dash-header-controls">
          <div className="header-search-box">
            <Search size={16} color="#9CA3AF" />
            <input type="text" placeholder="Search metrics, orders..." />
          </div>

          <button className="date-pill-btn">
            August 2026 <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* ── Bento Main Grid ── */}
      <div className="bento-grid">
        {/* ── LEFT COLUMN ── */}
        <div className="bento-left">
          
          {/* Card 1: Target Ring Progress & Metric Cards Grid */}
          <div className="bento-card hero-chart-card">
            <div className="hero-chart-header">
              <h3>Sales & Goal Performance</h3>
              <button className="date-pill-btn" style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>
                Month <ChevronDown size={12} />
              </button>
            </div>

            <div className="hero-chart-body">
              {/* 2x2 Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {/* Total Revenue */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:border-gray-200/80 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-gray-100/70 flex items-center justify-center text-gray-600 mb-3">
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">
                      Total Revenue
                    </span>
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                        RWF 840k
                      </h4>
                      <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 shrink-0">
                        ↑ 15%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active Produce */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:border-gray-200/80 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-gray-100/70 flex items-center justify-center text-gray-600 mb-3">
                    <Leaf size={18} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">
                      Active Produce
                    </span>
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                        24 Items
                      </h4>
                      <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 shrink-0">
                        Stocked
                      </span>
                    </div>
                  </div>
                </div>

                {/* Completed Orders */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:border-gray-200/80 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-gray-100/70 flex items-center justify-center text-gray-600 mb-3">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">
                      Completed Orders
                    </span>
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                        156
                      </h4>
                      <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 shrink-0">
                        ↑ 8.0%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active Customers */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:border-gray-200/80 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-gray-100/70 flex items-center justify-center text-gray-600 mb-3">
                    <Users size={18} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">
                      Active Customers
                    </span>
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                        3,782
                      </h4>
                      <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 shrink-0">
                        ↑ 11.01%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side Ring Progress Chart */}
              <div className="ring-chart-wrapper">
                <svg className="ring-chart-svg" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#F3F4F6"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="url(#ringGradient)"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset="40"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F39927" />
                      <stop offset="100%" stopColor="#E67E22" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="ring-chart-center">
                  <div className="ring-chart-number text-[#F39927]">84%</div>
                  <div className="ring-chart-label">Goal Achieved</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Weekly Harvest & Dispatch Timeline */}
          <div className="bento-card">
            <div className="timeline-card-header">
              <h3>Weekly Harvest & Fulfillment Flow</h3>
              <button className="date-pill-btn" style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>
                Week <ChevronDown size={12} />
              </button>
            </div>

            <div className="timeline-pills-row">
              <div className="timeline-pill chip-green">
                <Leaf size={14} /> Organic Avocados (120kg)
              </div>
              <div className="timeline-pill chip-amber">
                <Package size={14} /> Raw Honey Jars (45 Units)
              </div>
              <div className="timeline-pill chip-purple">
                <Truck size={14} /> Wholesale Bulk Shipment
              </div>
            </div>
          </div>

          {/* Card 3: Recent Orders Table */}
          <div className="bento-card dash-table-card">
            <div className="dash-table-header">
              <h3>Recent Orders</h3>
              <button className="btn-view-all">View All →</button>
            </div>

            <table className="dash-table">
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>CUSTOMER</th>
                  <th>DATE</th>
                  <th>TOTAL</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 700 }}>{order.id}</td>
                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">{order.customer.charAt(0)}</div>
                        <span style={{ fontWeight: 600 }}>{order.customer}</span>
                      </div>
                    </td>
                    <td style={{ color: '#6B7280' }}>{order.date}</td>
                    <td style={{ fontWeight: 700 }}>${order.total.toFixed(2)}</td>
                    <td>{renderStatus(order.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── RIGHT COLUMN (Pastel Composition Cards) ── */}
        <div className="bento-right">
          
          {/* Pastel Card 1: Wholesale Program (Soft Blue) */}
          <div className="bento-card bento-card-blue">
            <div className="program-card-top">
              <span className="program-tag">PROGRAM</span>
              <Eye size={16} />
            </div>
            <div className="program-card-title">Wholesale & Export</div>
            <div className="program-progress-bar">
              <div className="program-progress-fill" style={{ width: '75%', background: '#0284C7' }}></div>
            </div>
            <div className="program-card-footer">
              <span>Fulfillment Cycle</span>
              <span>3/4 Batches</span>
            </div>
          </div>

          {/* Pastel Card 2: Produce Quality Audit (Soft Purple) */}
          <div className="bento-card bento-card-purple">
            <div className="program-card-top">
              <span className="program-tag">AUDIT</span>
              <Shield size={16} />
            </div>
            <div className="program-card-title">Organic Quality Check</div>
            <div className="program-progress-bar">
              <div className="program-progress-fill" style={{ width: '90%', background: '#7C3AED' }}></div>
            </div>
            <div className="program-card-footer">
              <span>Inspection Passed</span>
              <span>100% Certified</span>
            </div>
          </div>

          {/* Card 3: Calendar & Dispatch Strip */}
          <div className="bento-card calendar-card">
            <div className="calendar-header">
              <h4>August 2026</h4>
              <div className="calendar-nav-btns">
                <button className="cal-btn"><ChevronLeft size={14} /></button>
                <button className="cal-btn"><ChevronRight size={14} /></button>
              </div>
            </div>

            {/* Day Selector Strip */}
            <div className="calendar-days-row">
              {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map((day, idx) => (
                <div key={day} className="day-col">
                  <div className="day-col-header">{day}</div>
                  <div 
                    className={`day-cell ${activeDay === 16 + idx ? 'active' : ''}`}
                    onClick={() => setActiveDay(16 + idx)}
                  >
                    {16 + idx}
                  </div>
                </div>
              ))}
            </div>

            {/* Schedule List */}
            <div className="calendar-schedule-list">
              <div className="schedule-item">
                <div className="schedule-item-info">
                  <div className="customer-avatar" style={{ width: 24, height: 24, fontSize: '0.7rem' }}>H</div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Harvest Dispatch</span>
                </div>
                <span className="schedule-time">11:30 AM</span>
              </div>

              <div className="schedule-item">
                <div className="schedule-item-info">
                  <div className="customer-avatar" style={{ width: 24, height: 24, fontSize: '0.7rem', background: 'var(--brand-amber-bg)', color: 'var(--brand-amber-text)' }}>E</div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Express Delivery</span>
                </div>
                <span className="schedule-time">4:00 PM</span>
              </div>
            </div>
          </div>

          {/* Sage Green Brand Action Card */}
          <div className="bento-card sage-cta-card">
            <span className="cta-tag">REMINDER</span>
            <h4>Scheduled Harvest Shipment</h4>
            <p>You can manage and inspect order fulfillment pipelines here.</p>
            
            <button className="cta-arrow-btn" title="Go to Orders">
              <ArrowRight size={18} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
