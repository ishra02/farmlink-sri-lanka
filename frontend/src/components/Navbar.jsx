
import { NavLink, Link, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';

function Navbar({ cartCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('farmlinkUser')) || null;
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();

  useEffect(() => {
    const updateCurrentUser = () => {
      try {
        setCurrentUser(
          JSON.parse(localStorage.getItem('farmlinkUser')) || null
        );
      } catch {
        setCurrentUser(null);
      }
    };

    window.addEventListener('farmlink-auth-change', updateCurrentUser);

    return () => {
      window.removeEventListener('farmlink-auth-change', updateCurrentUser);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem('farmlinkUser');
    setCurrentUser(null);
    closeMenu();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link className="brand" to="/" onClick={closeMenu}>
        <span className="brand-symbol">🌿</span>
        <span className="brand-name">
          FarmLink
          <small>SRI LANKA</small>
        </span>
      </Link>

      <button
        className="mobile-menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      <nav className={`navigation ${menuOpen ? 'navigation-open' : ''}`}>
        {currentUser && (
          <span className="nav-greeting">
            Hi, {currentUser.fullName}
          </span>
        )}

        <NavLink to="/" end onClick={closeMenu}>
          Home
        </NavLink>

        <NavLink to="/products" onClick={closeMenu}>
          Products
        </NavLink>

        {currentUser?.role === 'customer' && (
          <NavLink to="/my-orders" onClick={closeMenu}>
            My Orders
          </NavLink>
        )}

        {currentUser?.role === 'farmer' && (
  <NavLink to="/farmer-dashboard" onClick={closeMenu}>
    Dashboard
  </NavLink>
)}

        {currentUser?.role === 'farmer' && (
          <NavLink to="/farmer-orders" onClick={closeMenu}>
            Orders
          </NavLink>
        )}

        {currentUser?.role === 'farmer' && (
          <NavLink to="/add-product" onClick={closeMenu}>
            Add Product
          </NavLink>
        )}

        <NavLink to="/about" onClick={closeMenu}>
          About Us
        </NavLink>

        <NavLink to="/contact" onClick={closeMenu}>
          Contact
        </NavLink>
      </nav>

      <div className="nav-actions">
        <Link className="cart-button" to="/cart" onClick={closeMenu}>
          🛒 Cart ({cartCount})
        </Link>

        {currentUser ? (
          <>
            <button
              className="signup-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="signup-button" to="/login" onClick={closeMenu}>
              Login
            </Link>

            <Link className="signup-button" to="/register" onClick={closeMenu}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
