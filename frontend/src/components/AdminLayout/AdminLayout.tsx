import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  Box,
  ShoppingCart,
  BarChart2,
  Users, 
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Search,
  User,
  Bell
} from 'lucide-react';
import { apiGet } from '../../api/client';
import './AdminLayout.css';

function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await apiGet('/api/pages');
        if (res.success) setPages(res.data);
      } catch (err) {
        console.error('Failed to fetch pages', err);
      }
    };
    fetchPages();
    
    // Auto-open corresponding dropdown based on current route
    if (location.pathname.startsWith('/admin/content')) {
      setOpenDropdown('Content CMS');
    } else if (['/admin/products', '/admin/inventory', '/admin/orders', '/admin/customers', '/admin/reports'].some(path => location.pathname.startsWith(path))) {
      setOpenDropdown('Shop Management');
    } else if (['/admin/settings', '/admin/users'].some(path => location.pathname.startsWith(path))) {
      setOpenDropdown('System');
    } else {
      setOpenDropdown(null);
    }
  }, [location.pathname]);

  // Helper to determine if a path is active
  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname === path) return true;
    return false;
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Content CMS', icon: FileText, isDropdown: true, isDynamicCMS: true },
    { 
      name: 'Shop Management', 
      icon: Package, 
      isDropdown: true,
      children: [
        { name: 'Products', path: '/admin/products' },
        { name: 'Inventory', path: '/admin/inventory' },
        { name: 'Orders', path: '/admin/orders' },
        { name: 'Customers', path: '/admin/customers' },
        { name: 'Reports', path: '/admin/reports' },
      ]
    },
    { 
      name: 'System', 
      icon: Settings, 
      isDropdown: true,
      children: [
        { name: 'Settings', path: '/admin/settings' },
        { name: 'Users', path: '/admin/users' },
      ]
    },
  ];

  return (
    <div className="admin-wrapper">
      {/* ── Mobile Overlay ── */}
      {isMobileMenuOpen && (
        <div className="admin-mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="admin-logo">
          <Link to="/">
            <h2>Kaina<span className="logo-accent">Fresh</span></h2>
            <span className="admin-badge">Admin</span>
          </Link>
          <button className="mobile-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="admin-nav">
          <ul>
            {navLinks.map((link, index) => {
              const Icon = link.icon;
              
              if (link.isDropdown) {
                // Determine if this dropdown is open
                const isOpen = openDropdown === link.name;
                
                // Determine if any child within this dropdown is active
                let isAnyChildActive = false;
                if (link.isDynamicCMS) {
                  isAnyChildActive = location.pathname.startsWith('/admin/content');
                } else if (link.children) {
                  isAnyChildActive = link.children.some(child => location.pathname.startsWith(child.path));
                }

                // Prepare children array
                let dropdownItems = [];
                if (link.isDynamicCMS) {
                  dropdownItems = pages.map(page => ({
                    id: page.id,
                    name: page.title,
                    path: `/admin/content/${page.slug}`
                  }));
                } else if (link.children) {
                  dropdownItems = link.children;
                }

                return (
                  <li key={link.name} className={`admin-nav-item dropdown-parent ${isOpen ? 'expanded' : ''} ${isAnyChildActive && !isOpen ? 'active' : ''}`}>
                    <div 
                      className="admin-nav-link" 
                      onClick={() => setOpenDropdown(isOpen ? null : link.name)}
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Icon size={20} strokeWidth={isAnyChildActive ? 2.5 : 2} />
                        <span>{link.name}</span>
                      </div>
                      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                    
                    {/* Dropdown Menu */}
                    {isOpen && (
                      <ul className="admin-dropdown-menu">
                        {dropdownItems.map(item => {
                          const isItemActive = location.pathname === item.path;
                          return (
                            <li key={item.path || item.id} className={`admin-nav-item sub-item ${isItemActive ? 'active' : ''}`}>
                              <Link to={item.path} className="admin-nav-link">
                                <span>{item.name}</span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              // Force standard links to visually lose their active state if their parent dropdown is not relevant but another dropdown is open
              const active = isActive(link.path) && !openDropdown;
              
              return (
                <li key={link.name} className={`admin-nav-item ${active ? 'active' : ''}`}>
                  <Link 
                    to={link.path} 
                    className="admin-nav-link" 
                    onClick={() => {
                      setOpenDropdown(null);
                      setIsMobileMenuOpen(false); // Close sidebar on mobile nav
                    }}
                  >
                    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                    <span>{link.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="admin-logout">
          <button className="logout-btn">
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* ── Content Wrapper ── */}
      <div className="admin-content-wrapper">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="admin-mobile-header">
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
          <h2>Kaina<span className="logo-accent">Fresh</span> Admin</h2>
        </div>

        {/* ── Desktop Topbar (Pill Header on Green) ── */}
        <header className="admin-topbar">
          <div className="topbar-search">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search across dashboard..." />
          </div>
          <div className="topbar-actions">
            <button className="icon-btn" aria-label="Notifications">
              <Bell size={20} />
              <span className="badge">3</span>
            </button>
            <div className="user-profile-pill">
              <div className="user-avatar">
                <User size={18} />
              </div>
              <span className="user-name">Admin User</span>
              <ChevronDown size={16} className="chevron" />
            </div>
          </div>
        </header>

        {/* ── Main Content (White Box) ── */}
        <main className="admin-main">
          <div className="admin-main-inner">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
