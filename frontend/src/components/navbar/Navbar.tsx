import React,{ useState } from 'react'; 
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';
// import api
import { isAuthenticated, removeToken, apiGet } from '../../api/client';
/**
 * Navbar
 * Global navigation bar for all public pages.
 * Shows/hides admin link based on auth state.
 */
function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [siteTitle, setSiteTitle] = useState<string | null>(null);
  const [navLinks, setNavLinks] = useState<Array<any>>([]);
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();

  // Scroll listener for transparent-to-solid effect
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    // Trigger immediately on mount in case the user loads half-way down the page
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch site settings and navlinks from API on mount
  React.useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const settingsResp = await apiGet<any>('/api/settings');
        
        let settingsData: any = null;
        if (settingsResp && settingsResp.data) {
          settingsData = settingsResp.data;
        } else if (Array.isArray(settingsResp) && settingsResp.length > 1) {
         
          settingsData = settingsResp[1];
        }

        if (!cancelled && settingsData) {
          const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;
          // set site title if present
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
        const navsResp = await apiGet<any>('/api/navlinks/nav');
        
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

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      {/* Logo */}
      <NavLink to="/" className="navbar-logo" onClick={closeMenu}>
        {logoSrc ? (
          <div className="brand-row" style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <img src={logoSrc} alt={siteTitle ?? 'Kaina Fresh'} className="site-logo" style={{height:53, width:53}} />
            {siteTitle ? (
              <span className="site-title">{siteTitle}</span>
            ) : (
              <span className="logo-accent">Fresh</span>
            )}
          </div>
        ) : (
          <>
          {/*  */}
          <p>{siteTitle}</p>
          </>
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
          {/* Render navlinks from API if available, otherwise fall back to static links */}
          {navLinks.length > 0 ? (
            navLinks.map((link: any) => (
              <NavLink key={link.id ?? link.link} to={link.link} onClick={closeMenu}>
                {link.link_name}
              </NavLink>
            ))
          ) : (
            <>
              <NavLink to="/" onClick={closeMenu}>Home</NavLink>
              <NavLink to="/about" onClick={closeMenu}>Our Farm</NavLink>
              <NavLink to="/wholesale" onClick={closeMenu}>Wholesale</NavLink>
              <NavLink to="/contact" onClick={closeMenu}>Contact</NavLink>
            </>
          )}
          {/* Ensure admin link is present when logged in and not provided by API */}
          {loggedIn && !navLinks.find((n: any) => n.link === '/admin') && (
            <NavLink to="/admin" onClick={closeMenu}>Admin</NavLink>
          )}
        </div>

        <div className="navbar-actions">
          {loggedIn ? (
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-outline" onClick={closeMenu}>
                Login
              </NavLink>
              <NavLink to="/signup" className="btn btn-primary" onClick={closeMenu}>
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
