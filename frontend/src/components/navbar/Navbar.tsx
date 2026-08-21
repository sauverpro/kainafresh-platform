import React, { useState, useEffect } from 'react'; 
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Sprout, Package, Mail, Shield, LogOut, LogIn, UserPlus } from 'lucide-react';
import './Navbar.css';
import { isAuthenticated, removeToken, apiGet } from '../../api/client';

interface NavLinkItem {
  id?: number | string;
  link: string;
  link_name: string;
}

interface SiteSettings {
  site_title?: string;
  site_logo?: string;
  [key: string]: unknown;
}

/**
 * Navbar
 * Global navigation bar for all public pages.
 */
function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [siteTitle, setSiteTitle] = useState<string | null>(null);
  const [navLinks, setNavLinks] = useState<NavLinkItem[]>([]);
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();

  // Scroll listener for transparent-to-solid effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch site settings and navlinks from API on mount
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
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
          if (settingsData.site_title) setSiteTitle(settingsData.site_title);
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
    return () => { cancelled = true; };
  }, []);

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const closeMenu = () => setIsMenuOpen(false);

  // Helper to deduplicate dynamic API links against static defaults
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
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      {/* Logo */}
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

      {/* Hamburger toggle */}
      <button
        className={`navbar-toggle ${isMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle navigation"
      >
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>

      {/* Nav links */}
      <nav className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
        <div className="nav-center">
          {/* Core Default Nav Links with Lucide Vector Icons */}
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

          {/* Dynamic Nav Links from API (Strictly Deduplicated) */}
          {navLinks
            .filter(link => !isDuplicateLink(link))
            .map((link: NavLinkItem) => (
              <NavLink key={link.id ?? link.link} to={link.link} onClick={closeMenu} className="nav-icon-link">
                <span>{link.link_name}</span>
              </NavLink>
            ))}

          {/* Admin Link if Authenticated */}
          {loggedIn && (
            <NavLink to="/admin" onClick={closeMenu} className="nav-icon-link">
              <Shield size={16} /> <span>Admin</span>
            </NavLink>
          )}
        </div>

        {/* Action Buttons */}
        <div className="navbar-actions">
          {loggedIn ? (
            <button className="btn btn-logout" onClick={handleLogout}>
              <LogOut size={16} /> <span>Logout</span>
            </button>
          ) : (
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

export default Navbar;
