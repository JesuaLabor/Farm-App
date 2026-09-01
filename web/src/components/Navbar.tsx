import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Role } from '../types/auth';
import { NotificationBell } from './NotificationBell';

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
            {/* Notification Bell */}
            <NotificationBell />

            {/* Cart Icon — shown for farmer and buyer roles only */}
            {(user.role === 'farmer' || user.role === 'buyer') && (
              <CartIcon />
            )}

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

// ---------------------------------------------------------------------------
// CartIcon — reads item count from localStorage and stays in sync via a custom
// 'cart-updated' browser event fired whenever the cart is modified.
// ---------------------------------------------------------------------------

function getCartCount(): number {
  try {
    const raw = localStorage.getItem('agriconnect_cart');
    if (!raw) return 0;
    const items: { quantity: number }[] = JSON.parse(raw);
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  } catch {
    return 0;
  }
}

const CartIcon: React.FC = () => {
  const [count, setCount] = React.useState<number>(getCartCount);
  const [pulse, setPulse] = React.useState(false);

  React.useEffect(() => {
    // Sync on localStorage changes from other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'agriconnect_cart') {
        setCount(getCartCount());
        triggerPulse();
      }
    };

    // Sync on same-tab cart updates via custom event
    const onCartUpdated = () => {
      setCount(getCartCount());
      triggerPulse();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('cart-updated', onCartUpdated);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('cart-updated', onCartUpdated);
    };
  }, []);

  const triggerPulse = () => {
    setPulse(true);
    setTimeout(() => setPulse(false), 400);
  };

  return (
    <>
      {/* Inline keyframe styles for the pulse animation */}
      <style>{`
        @keyframes cart-pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
        .cart-badge-pulse {
          animation: cart-pop 0.4s cubic-bezier(.36,.07,.19,.97);
        }
      `}</style>

      <Link
        to="/supply/cart"
        id="navbar-cart-btn"
        aria-label={`Shopping cart, ${count} item${count !== 1 ? 's' : ''}`}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: count > 0 ? 'var(--color-accent-subtle, #fef9c3)' : 'var(--gray-100)',
          border: count > 0 ? '1.5px solid var(--color-accent)' : '1.5px solid var(--color-border)',
          color: count > 0 ? 'var(--color-accent)' : 'var(--color-text-muted)',
          textDecoration: 'none',
          transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
          boxShadow: count > 0 ? '0 2px 8px rgba(202,138,4,0.18)' : 'none',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(202,138,4,0.28)';
          (e.currentTarget as HTMLElement).style.background = '#fef9c3';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = count > 0 ? '0 2px 8px rgba(202,138,4,0.18)' : 'none';
          (e.currentTarget as HTMLElement).style.background = count > 0 ? 'var(--color-accent-subtle, #fef9c3)' : 'var(--gray-100)';
        }}
      >
        {/* Cart SVG icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>

        {/* Item count badge */}
        {count > 0 && (
          <span
            className={pulse ? 'cart-badge-pulse' : ''}
            aria-live="polite"
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
              borderRadius: '9px',
              backgroundColor: 'var(--color-accent)',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              border: '2px solid #fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
              letterSpacing: '-0.3px',
            }}
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </Link>
    </>
  );
};
