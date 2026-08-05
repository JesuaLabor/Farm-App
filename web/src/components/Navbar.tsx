import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Role } from '../types/auth';

const roleLabels: Record<Role, { label: string }> = {
  farmer:   { label: 'Farmer' },
  buyer:    { label: 'Buyer' },
  supplier: { label: 'Supplier' },
  expert:   { label: 'Agri Expert' },
  lgu_staff:{ label: 'LGU Staff' },
};

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleInfo = user?.role ? roleLabels[user.role] : null;
  const initials = user ? (user.firstName[0] || 'U').toUpperCase() : '';

  return (
    <header
      id="site-header"
      className="glass-panel"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)' as any,
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <nav
        className="container"
        aria-label="Main navigation"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
          gap: 'var(--space-4)',
        }}
      >
        {/* Logo */}
        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            flexShrink: 0,
          }}
          aria-label="AgriConnect home"
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: 'linear-gradient(145deg, var(--green-500), var(--green-700))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              boxShadow: '0 2px 8px rgba(45,138,78,0.3)',
              flexShrink: 0,
            }}
          >
            🌾
          </div>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: 'var(--color-text)',
              letterSpacing: '-0.5px',
              lineHeight: 1,
            }}
          >
            Agri<span style={{ color: 'var(--color-accent)' }}>Connect</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              flex: 1,
              justifyContent: 'center',
              flexWrap: 'nowrap',
              overflow: 'hidden',
            }}
          >
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              end
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/produce"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Produce
            </NavLink>

            <NavLink
              to="/supply"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Supply Store
            </NavLink>

            <NavLink
              to="/market-prices"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Prices
            </NavLink>

            <NavLink
              to="/programs"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Programs
            </NavLink>

            <NavLink
              to="/community"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Community
            </NavLink>

            {/* Role-specific links */}
            {user.role === 'farmer' && (
              <>
                <div className="divider" aria-hidden="true" />
                <NavLink
                  to="/produce/manage"
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  My Listings
                </NavLink>
                <NavLink
                  to="/finances"
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  Finances
                </NavLink>
              </>
            )}

            {user.role === 'supplier' && (
              <>
                <div className="divider" aria-hidden="true" />
                <NavLink
                  to="/supply/manage"
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  My Products
                </NavLink>
                <NavLink
                  to="/supply/orders"
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  Orders
                </NavLink>
              </>
            )}

            {(user.role === 'lgu_staff' || user.role === 'expert') && (
              <>
                <div className="divider" aria-hidden="true" />
                <NavLink
                  to="/market-prices/manage"
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  Record Prices
                </NavLink>
                <NavLink
                  to="/programs/manage"
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  Manage Programs
                </NavLink>
                <NavLink
                  to="/lgu/dashboard"
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  LGU Dashboard
                </NavLink>
              </>
            )}
          </div>
        )}

        {/* User Controls */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              flexShrink: 0,
            }}
          >
            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                padding: '5px 10px 5px 5px',
                borderRadius: 'var(--radius-sm)',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--gray-100)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
              aria-label="View profile"
            >
              {/* Avatar */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--green-500)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1.5px solid var(--green-200)',
                }}
              >
                {user.photoUrl ? (
                  <img
                    src={`http://localhost:8080${user.photoUrl}`}
                    alt={`${user.firstName}'s avatar`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  initials
                )}
              </div>

              {/* Name + role */}
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                  }}
                >
                  {user.firstName}
                </span>
                {roleInfo && (
                  <span className="badge badge-green" style={{ marginTop: '2px' }}>
                    {roleInfo.label}
                  </span>
                )}
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              aria-label="Log out"
            >
              Log out
            </button>
          </div>
        )}

        {/* Mobile hamburger placeholder (visible on narrow screens) */}
        {user && (
          <button
            className="btn btn-ghost btn-sm"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            style={{ display: 'none' }}
          >
            ☰
          </button>
        )}
      </nav>
    </header>
  );
};
