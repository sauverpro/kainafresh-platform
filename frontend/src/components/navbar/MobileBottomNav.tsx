/**
 * ============================================================================
 * KainaFresh Organic Platform — Mobile Bottom App Dock Navigation
 * ============================================================================
 *
 * Provides a native mobile app bottom navigation bar for touch devices (< 768px).
 * Displays quick tabs for Home, Shop, Order Tracking, Basket (with badge count),
 * and Account/Dashboard with smooth active state indicators.
 */

import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Sprout, Truck, ShoppingBag, User, Layers } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { isAuthenticated } from '../../api/client';
import './MobileBottomNav.css';

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openCart, cartCount } = useCart();
  const loggedIn = isAuthenticated();

  // Hide bottom dock on checkout & admin routes to prevent UI overlap
  const hiddenRoutes = ['/checkout', '/admin', '/cms', '/sales', '/stock', '/inventory', '/settings'];
  const isHidden = hiddenRoutes.some(route => location.pathname.startsWith(route));

  if (isHidden) {
    return null;
  }

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation Dock">
      <div className="mobile-bottom-nav-inner">
        {/* Tab 1: Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `mobile-nav-tab ${isActive ? 'active' : ''}`
          }
          end
        >
          <div className="tab-icon-wrapper">
            <Home size={20} />
          </div>
          <span className="tab-label">Home</span>
        </NavLink>

        {/* Tab 2: Products / Shop */}
        <NavLink
          to="/products"
          className={({ isActive }) =>
            `mobile-nav-tab ${isActive ? 'active' : ''}`
          }
        >
          <div className="tab-icon-wrapper">
            <Sprout size={20} />
          </div>
          <span className="tab-label">Shop</span>
        </NavLink>

        {/* Tab 3: Track Order */}
        <NavLink
          to="/track-order"
          className={({ isActive }) =>
            `mobile-nav-tab ${isActive ? 'active' : ''}`
          }
        >
          <div className="tab-icon-wrapper">
            <Truck size={20} />
          </div>
          <span className="tab-label">Track</span>
        </NavLink>

        {/* Tab 4: Basket (Triggers CartDrawer) */}
        <button
          type="button"
          onClick={openCart}
          className="mobile-nav-tab cart-tab"
          aria-label={`Open Basket, ${cartCount} items`}
        >
          <div className="tab-icon-wrapper">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="cart-badge-pill animate-pulse">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>
          <span className="tab-label">Basket</span>
        </button>

        {/* Tab 5: Account / Dashboard */}
        <button
          type="button"
          onClick={() => {
            if (!loggedIn) {
              navigate('/login');
            } else if (location.pathname.startsWith('/customer') || location.pathname.startsWith('/dashboard')) {
              // Already on dashboard
            } else {
              navigate('/customer/dashboard');
            }
          }}
          className={`mobile-nav-tab ${
            location.pathname.startsWith('/customer') || location.pathname.startsWith('/dashboard') || location.pathname === '/login' ? 'active' : ''
          }`}
          aria-label={loggedIn ? 'Dashboard' : 'Sign In'}
        >
          <div className="tab-icon-wrapper">
            {loggedIn ? <Layers size={20} /> : <User size={20} />}
          </div>
          <span className="tab-label">{loggedIn ? 'Dashboard' : 'Account'}</span>
        </button>
      </div>
    </nav>
  );
}
