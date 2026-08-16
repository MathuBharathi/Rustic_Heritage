import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, profile, isAdmin, openAuthModal, signOut } = useAuth();
  const { itemCount, openCartDrawer } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    navigate('/');
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <nav>
      <Link to="/" className="logo">
        <div className="logo-icon">🏺</div>
        <div className="logo-text">
          <span>Rustic Heritage</span>
          <span>Kitchenware</span>
        </div>
      </Link>

      <ul className="nav-links">
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/products" className={({ isActive }) => (isActive ? 'active' : '')}>
            Products
          </NavLink>
        </li>
        <li>
          <NavLink to="/reviews" className={({ isActive }) => (isActive ? 'active' : '')}>
            Customer Stories
          </NavLink>
        </li>
        <li>
          <NavLink to="/getintouch" className={({ isActive }) => (isActive ? 'active' : '')}>
            Get In Touch
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : '')}>
            Contact Us
          </NavLink>
        </li>
      </ul>

      <div className="rh-nav-actions">
        {user ? (
          <div className="rh-nav-user-wrap" style={{ position: 'relative' }}>
            <button
              className="rh-nav-user-pill"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              type="button"
            >
              <div className="rh-nav-avatar">{initials}</div>
              <span>{displayName.split(' ')[0]}</span>
              <span style={{ fontSize: '10px' }}>▼</span>
            </button>

            {dropdownOpen && (
              <div
                className="rh-nav-dropdown show"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #E8D5B7', fontSize: '12px', color: '#5C3D1E' }}>
                  <strong>{displayName}</strong>
                  <div style={{ fontSize: '11px', color: '#8B5E3C', wordBreak: 'break-all' }}>{user.email}</div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  style={{ display: 'block', padding: '10px 14px', color: '#3B2A1A', textDecoration: 'none', fontSize: '13px' }}
                >
                  👤 My Profile &amp; Orders
                </Link>
                <button
                  onClick={handleSignOut}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', color: '#8b1a1a', cursor: 'pointer', fontSize: '13px', borderTop: '1px solid #E8D5B7' }}
                  type="button"
                >
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="rh-nav-signin-btn" onClick={() => openAuthModal('login')} type="button">
            Sign In
          </button>
        )}

        <Link to="/products" className="rh-nav-order-btn">
          Order Now
        </Link>

        <button className="rh-nav-cart-btn" onClick={openCartDrawer} aria-label="Cart" type="button">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {itemCount > 0 && <span className="nav-cart-badge visible">{itemCount}</span>}
        </button>
      </div>
    </nav>
  );
}
