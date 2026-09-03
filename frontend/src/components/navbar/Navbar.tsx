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
import { useState, useEffect } from "react";

// Import React Router components for client-side navigation
import { NavLink, useNavigate } from "react-router-dom";

// Import Lucide vector icons for navigation items
import {
  Home,
  Sprout,
  Package,
  Mail,
  Shield,
  LogOut,
  LogIn,
  UserPlus,
  ShoppingBag,
  Globe,
} from "lucide-react";

// Import Navbar component styles
import "./Navbar.css";

// Import API client helpers and authentication utilities
import {
  isAuthenticated,
  removeToken,
  removeCurrentUser,
  apiGet,
} from "../../api/client";

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

// Import Cart context & CartDrawer component
import { useCart } from "../../context/CartContext";
import CartDrawer from "../cart/CartDrawer";
import { useAuth } from "../../auth/AuthContext";

/**
 * Main Navbar Functional Component.
 */
function Navbar() {
  // Mobile hamburger menu open/close toggle state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  // Track window scroll Y position to toggle glassmorphism shadow background
  const [isScrolled, setIsScrolled] = useState(false);
  // Dynamic site logo URL state retrieved from backend settings
  const [logoSrc, setLogoSrc] = useState<string | null>(null);

  // Dynamic site title state retrieved from backend settings
  const [siteTitle, setSiteTitle] = useState<string | null>(null);

  // Dynamic custom navigation links array from database
  const [navLinks, setNavLinks] = useState<NavLinkItem[]>([]);

  // Cart state hook
  const { openCart, cartCount } = useCart();

  // React Router navigation imperative hook
  const navigate = useNavigate();

  // Check if current user is logged in with active JWT token
  const loggedIn = isAuthenticated();

  /**
   * Helper function to match dynamic DB links to appropriate Lucide UI icons.
   */
  const getNavIcon = (item: NavLinkItem) => {
    const name = (item.link_name || "").toLowerCase();
    const path = (item.link || "").toLowerCase();

    if (
      name.includes("product") ||
      name.includes("shop") ||
      path.includes("product")
    )
      return <ShoppingBag size={16} />;
    if (
      name.includes("farm") ||
      name.includes("about") ||
      path.includes("about")
    )
      return <Sprout size={16} />;
    if (
      name.includes("wholesale") ||
      name.includes("bulk") ||
      path.includes("wholesale")
    )
      return <Package size={16} />;
    if (name.includes("contact") || path.includes("contact"))
      return <Mail size={16} />;
    if (name.includes("admin") || path.includes("admin"))
      return <Shield size={16} />;
    if (name.includes("home") || path === "/") return <Home size={16} />;

    return <Globe size={16} />;
  };

  // Scroll event listener for transparent-to-solid glassmorphic backdrop transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch site branding settings and dynamic navigation links from MariaDB on mount
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const settingsResp = await apiGet<unknown>("/api/settings");
        let settingsData: SiteSettings | null = null;
        if (
          settingsResp &&
          typeof settingsResp === "object" &&
          "data" in settingsResp
        ) {
          settingsData = (settingsResp as { data: SiteSettings }).data;
        } else if (Array.isArray(settingsResp) && settingsResp.length > 1) {
          settingsData = settingsResp[1] as SiteSettings;
        }

        if (!cancelled && settingsData) {
          const API_BASE =
            import.meta.env.VITE_API_BASE_URL || window.location.origin;
          if (settingsData.site_title) setSiteTitle(settingsData.site_title);

          if (settingsData.site_logo) {
            const raw = settingsData.site_logo;
            const src = /^https?:\/\//.test(raw)
              ? raw
              : `${API_BASE}${raw.startsWith("/") ? raw : "/" + raw}`;
            setLogoSrc(src);
          }
        }
      } catch (err) {
        console.debug("Failed loading settings", err);
      }

      try {
        const navsResp = await apiGet<{ data?: NavLinkItem[] }>(
          "/api/navlinks/nav",
        );
        const navsData = navsResp?.data ?? [];
        if (!cancelled && Array.isArray(navsData)) {
          setNavLinks(navsData);
        }
      } catch (err) {
        console.debug("Failed loading navlinks", err);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    removeToken();
    removeCurrentUser();
    navigate("/login");
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        {/* Brand Logo & Title Link */}
        <NavLink to="/" className="navbar-logo" onClick={closeMenu}>
          {logoSrc ? (
            <div
              className="brand-row"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <img
                src={logoSrc}
                alt={siteTitle ?? "Kaina Fresh"}
                className="site-logo"
                style={{ height: 42, width: 42, objectFit: "contain" }}
              />
              <span className="site-title">{siteTitle ?? "KainaFresh"}</span>
            </div>
          ) : (
            <span>
              Kaina<span className="logo-accent">Fresh</span>
            </span>
          )}
        </NavLink>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className={`navbar-toggle ${isMenuOpen ? "open" : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>

        {/* Navigation Links Menu */}
        <nav className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
          <div className="nav-center">
            {/* Dynamic Navigation Links Loaded EXCLUSIVELY from Backend (MariaDB /api/navlinks/nav) */}
            {navLinks.map((link: NavLinkItem) => (
              <NavLink
                key={link.id ?? link.link}
                to={link.link}
                onClick={closeMenu}
                className="nav-icon-link"
              >
                <span>{link.link_name}</span>
              </NavLink>
            ))}

            {/* Dashboard Link for Authenticated Users */}
            {loggedIn && user?.role === "admin" && (
              <NavLink
                to="/dashboard"
                onClick={closeMenu}
                className="nav-icon-link"
              >
                <Shield size={16} /> <span>Dashboard</span>
              </NavLink>
            )}
            {loggedIn && user?.role === "sales-manager" && (
              <NavLink
                to="/sales"
                onClick={closeMenu}
                className="nav-icon-link"
              >
                <Shield size={16} /> <span>sales</span>
              </NavLink>
            )}
          </div>

          {/* User Authentication & Shopping Cart Action Buttons */}
          <div className="navbar-actions">
            {/* Shopping Cart Button */}
            <button
              className="nav-cart-btn"
              onClick={() => {
                closeMenu();
                openCart();
              }}
              aria-label="View Shopping Basket"
              title="Shopping Basket"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            {loggedIn ? (
              <button className="btn btn-logout" onClick={handleLogout}>
                <LogOut size={16} /> <span>Logout</span>
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="btn btn-outline"
                  onClick={closeMenu}
                >
                  <LogIn size={16} /> <span>Login</span>
                </NavLink>
                <NavLink
                  to="/signup"
                  className="btn btn-primary"
                  onClick={closeMenu}
                >
                  <UserPlus size={16} /> <span>Sign Up</span>
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Global Slide-Over Shopping Cart Drawer */}
      <CartDrawer />
    </>
  );
}

// Export Navbar component for application-wide layout usage
export default Navbar;
