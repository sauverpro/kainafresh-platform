/**
 * ============================================================================
 * KainaFresh Organic Platform — Public Header Navigation Bar
 * ============================================================================
 * 
 * Features:
 * 1. Dynamic brand logo & site title fetching from MariaDB backend settings (/api/settings).
 * 2. Dynamic header link fetching from DB (/api/navlinks/nav) with strict path deduplication against core routes.
 * 3. Lucide UI vector icons for every navigation item.
 * 4. Glassmorphic scroll listener effect (transparent top bar -> solid blurred backdrop).
 * 5. Mobile responsive hamburger toggle drawer.
 */

// Import React hooks for lifecycle management and state
import { useState, useEffect } from 'react'; 

// Import React Router components for client-side navigation
import { NavLink, useNavigate } from 'react-router-dom';

// Import Lucide vector icons for navigation items
import { Home, Sprout, Package, Mail, Shield, LogOut, LogIn, UserPlus } from 'lucide-react';

// Import Navbar component styles
import './Navbar.css';

// Import API client helpers and authentication utilities
import { isAuthenticated, removeToken, apiGet } from '../../api/client';

/**
 * Interface representing dynamic navigation link items returned from database.
 */
interface NavLinkItem {
  id?: number | string;
  link: string;
  link_name: string;
}

/**
 * Interface representing global site settings stored in MariaDB.
 */
interface SiteSettings {
  site_title?: string;
  site_logo?: string;
  [key: string]: unknown;
}

/**
 * Main Navbar Functional Component.
 */
function Navbar() {
  // Mobile hamburger menu open/close toggle state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Track window scroll Y position to toggle glassmorphism shadow background
  const [isScrolled, setIsScrolled] = useState(false);

  // Dynamic site logo URL state retrieved from backend settings
  const [logoSrc, setLogoSrc] = useState<string | null>(null);

  // Dynamic site title state retrieved from backend settings
  const [siteTitle, setSiteTitle] = useState<string | null>(null);

  // Dynamic custom navigation links array from database
  const [navLinks, setNavLinks] = useState<NavLinkItem[]>([]);

  // React Router navigation imperative hook
  const navigate = useNavigate();

  // Check if current user is logged in with active JWT token
  const loggedIn = isAuthenticated();

  // Scroll event listener for transparent-to-solid glassmorphic backdrop transition
  useEffect(() => {
    const handleScroll = () => {
      // Set isScrolled to true if user scrolls down more than 50px
      setIsScrolled(window.scrollY > 50);
    };

    // Attach scroll event listener to window
    window.addEventListener('scroll', handleScroll);

    // Initial check on mount
    handleScroll();

    // Cleanup scroll listener on component unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch site branding settings and dynamic navigation links from MariaDB on mount
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      // 1. Fetch site global settings for logo and site title
      try {
        const settingsResp = await apiGet<unknown>('/api/settings');
        
        let settingsData: SiteSettings | null = null;
        if (settingsResp && typeof settingsResp === 'object' && 'data' in settingsResp) {
          settingsData = (settingsResp as { data: SiteSettings }).data;
        } else if (Array.isArray(settingsResp) && settingsResp.length > 1) {
          settingsData = settingsResp[1] as SiteSettings;
        }

        if (!cancelled && settingsData) {
          const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;
          
          // Assign site title state if populated
          if (settingsData.site_title) setSiteTitle(settingsData.site_title);

          // Resolve full logo URL path
          if (settingsData.site_logo) {
            const raw = settingsData.site_logo;
            const src = /^https?:\/\//.test(raw)
              ? raw
              : `${API_BASE}${raw.startsWith('/') ? raw : '/' + raw}`;
            setLogoSrc(src);
          }
        }
      } catch (err) {
        console.debug('Failed loading settings', err);
      }

      // 2. Fetch custom dynamic navigation links from database endpoint
      try {
        const navsResp = await apiGet<{ data?: NavLinkItem[] }>('/api/navlinks/nav');
        const navsData = navsResp?.data ?? [];
        if (!cancelled && Array.isArray(navsData)) {
          setNavLinks(navsData);
        }
      } catch (err) {
        console.debug('Failed loading navlinks', err);
      }
    }

    loadData();

    // Prevent state updates if component unmounts before promises resolve
    return () => { cancelled = true; };
  }, []);

  // Handler for user logout action
  const handleLogout = () => {
    // Clear JWT token from localStorage
    removeToken();

    // Redirect to login page
    navigate('/login');
  };

  // Helper to close mobile menu on link click
  const closeMenu = () => setIsMenuOpen(false);

  /**
   * Helper function to strictly deduplicate dynamic API links against static default routes.
   * Prevents duplicate rendering of 'Home', 'Our Farm', 'Wholesale', 'Contact', or 'Admin'.
   */
  const isDuplicateLink = (item: NavLinkItem) => {
    const linkPath = (item.link || '').toLowerCase().trim();
    const linkName = (item.link_name || '').toLowerCase().trim();
    
    return (
      linkName === 'home' || linkPath === '/' || linkPath === '/home' || linkPath === 'home' || linkPath === '' ||
      linkName === 'our farm' || linkName === 'about' || linkPath === '/about' || linkPath === '/farm' ||
      linkName === 'wholesale' || linkPath === '/wholesale' ||
      linkName === 'contact' || linkPath === '/contact' ||
      linkName === 'admin' || linkPath === '/admin'
    );
  };

  return (
    // Header navigation container with dynamic scrolled glassmorphism class
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      
      {/* Brand Logo & Title Link */}
      <NavLink to="/" className="navbar-logo" onClick={closeMenu}>
        {logoSrc ? (
          <div className="brand-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={logoSrc} alt={siteTitle ?? 'Kaina Fresh'} className="site-logo" style={{ height: 42, width: 42, objectFit: 'contain' }} />
            <span className="site-title">{siteTitle ?? 'KainaFresh'}</span>
          </div>
        ) : (
          <span>Kaina<span className="logo-accent">Fresh</span></span>
        )}
      </NavLink>

      {/* Mobile Hamburger Toggle Button */}
      <button
        className={`navbar-toggle ${isMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle navigation"
      >
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>

      {/* Navigation Links Menu */}
      <nav className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
        <div className="nav-center">
          
          {/* Core Site Built-in Navigation Links with Lucide Vector Icons */}
          <NavLink to="/" onClick={closeMenu} className="nav-icon-link">
            <Home size={16} /> <span>Home</span>
          </NavLink>

          <NavLink to="/about" onClick={closeMenu} className="nav-icon-link">
            <Sprout size={16} /> <span>Our Farm</span>
          </NavLink>

          <NavLink to="/wholesale" onClick={closeMenu} className="nav-icon-link">
            <Package size={16} /> <span>Wholesale</span>
          </NavLink>

          <NavLink to="/contact" onClick={closeMenu} className="nav-icon-link">
            <Mail size={16} /> <span>Contact</span>
          </NavLink>

          {/* Dynamic Navigation Links Fetched from MariaDB (Strictly Deduplicated) */}
          {navLinks
            .filter(link => !isDuplicateLink(link))
            .map((link: NavLinkItem) => (
              <NavLink key={link.id ?? link.link} to={link.link} onClick={closeMenu} className="nav-icon-link">
                <span>{link.link_name}</span>
              </NavLink>
            ))}

          {/* Render Admin Panel Shortcut Link if User is Authenticated */}
          {loggedIn && (
            <NavLink to="/admin" onClick={closeMenu} className="nav-icon-link">
              <Shield size={16} /> <span>Admin</span>
            </NavLink>
          )}
        </div>

        {/* User Authentication Action Buttons */}
        <div className="navbar-actions">
          {loggedIn ? (
            // Render Logout Button if Authenticated
            <button className="btn btn-logout" onClick={handleLogout}>
              <LogOut size={16} /> <span>Logout</span>
            </button>
          ) : (
            // Render Login / Sign Up buttons if Unauthenticated
            <>
              <NavLink to="/login" className="btn btn-outline" onClick={closeMenu}>
                <LogIn size={16} /> <span>Login</span>
              </NavLink>
              <NavLink to="/signup" className="btn btn-primary" onClick={closeMenu}>
                <UserPlus size={16} /> <span>Sign Up</span>
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

// Export Navbar component for application-wide layout usage
export default Navbar;
