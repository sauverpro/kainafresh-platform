import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { isAuthenticated, removeToken } from '../../api/client';
import './Navbar.css';

/**
 * Navbar
 * Global navigation bar for all public pages.
 * Shows/hides admin link based on auth state.
 */
function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      {/* Logo */}
      <NavLink to="/" className="navbar-logo" onClick={closeMenu}>
        Kaina<span className="logo-accent">Fresh</span>
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
          <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
          <NavLink to="/about" onClick={closeMenu}>Our Farm</NavLink>
          <NavLink to="/wholesale" onClick={closeMenu}>Wholesale & Exports</NavLink>
          <NavLink to="/contact" onClick={closeMenu}>Contact</NavLink>
          {loggedIn && (
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
