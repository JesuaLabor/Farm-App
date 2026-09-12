import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import agriConnectLogo from '../assets/AgriConnect.png';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenHelp?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  mobileOpen,
  onCloseMobile,
  onOpenHelp: _onOpenHelp,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const currentHash = location.hash;

  const isItemActive = (to: string): boolean => {
    if (to === '/dashboard') return currentPath === '/dashboard';
    if (to === '/produce') return currentPath === '/produce' || currentPath === '/supply' || currentPath === '/supply/cart';
    if (to === '/produce/orders') return currentPath === '/produce/orders' || (role !== 'supplier' && currentPath === '/supply/orders');
    if (to === '/produce/manage') return currentPath === '/produce/manage';
    if (to === '/supply') return currentPath === '/supply' || currentPath === '/supply/cart';
    if (to === '/supply/manage') return currentPath === '/supply/manage';
    if (to === '/supply/orders') return currentPath === '/supply/orders';
    if (to === '/admin/approvals') return currentPath === '/admin/approvals';
    if (to === '/lgu/dashboard') return currentPath === '/lgu/dashboard';
    if (to === '/lgu/approvals') return currentPath === '/lgu/approvals';
    if (to === '/programs') return currentPath === '/programs';
    if (to === '/programs/manage') return currentPath === '/programs/manage';
    if (to === '/market-prices/manage') return currentPath === '/market-prices/manage';

    if (to === '/finances') {
      return currentPath === '/finances' && (!currentHash || currentHash === '' || currentHash === '#income' || currentHash === '#expenses');
    }
    if (to === '/finances#calendar') {
      return currentPath === '/finances' && currentHash === '#calendar';
    }
    if (to === '/finances#records') {
      return currentPath === '/finances' && currentHash === '#records';
    }

    if (to === '/market-prices') {
      return currentPath === '/market-prices' && (!currentHash || currentHash === '');
    }
    if (to === '/market-prices#trends') {
      return (currentPath === '/market-prices' && currentHash === '#trends') || currentPath === '/price-trends';
    }

    if (to === '/community') {
      return currentPath === '/community' && (!currentHash || currentHash === '');
    }
    if (to === '/community#guides') {
      return (currentPath === '/community' && currentHash === '#guides') || currentPath === '/guides';
    }
    if (to === '/profile') return currentPath === '/profile';
    if (to === '/settings') return currentPath === '/settings';

    return false;
  };

  const icons = {
    dashboard: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
    marketplace: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    orders: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    listings: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    supply: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    manageProducts: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    finances: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    calendar: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    records: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    marketPrices: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    priceTrends: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    programs: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" /><path d="M3 10h18" /><path d="M5 6l7-3 7 3" /><path d="M4 10v11" /><path d="M20 10v11" /><path d="M8 14v4" /><path d="M12 14v4" /><path d="M16 14v4" />
      </svg>
    ),
    community: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    guides: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    approvals: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    lguDashboard: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    settings: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    help: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  };

  const role = user?.role || 'farmer';

  let navGroups: {
    title: string;
    items: {
      label: string;
      to: string;
      icon: React.ReactNode;
      isAction?: boolean;
      action?: () => void;
    }[];
  }[] = [];

  if (role === 'super_admin') {
    navGroups = [
      {
        title: 'MAIN',
        items: [{ label: 'Dashboard', to: '/dashboard', icon: icons.dashboard }],
      },
      {
        title: 'PLATFORM GOVERNANCE',
        items: [
          { label: 'Staff & Approvals', to: '/admin/approvals', icon: icons.approvals },
          { label: 'LGU Monitoring', to: '/lgu/dashboard', icon: icons.lguDashboard },
          { label: 'Manage Programs', to: '/programs/manage', icon: icons.programs },
          { label: 'Manage Price Benchmarks', to: '/market-prices/manage', icon: icons.marketPrices },
        ],
      },
      {
        title: 'PLATFORM CHANNELS',
        items: [
          { label: 'Marketplace', to: '/produce', icon: icons.marketplace },
          { label: 'Community Hub', to: '/community', icon: icons.community },
        ],
      },
    ];
  } else if (role === 'lgu_staff') {
    navGroups = [
      {
        title: 'MAIN',
        items: [{ label: 'Dashboard', to: '/dashboard', icon: icons.dashboard }],
      },
      {
        title: 'LGU TOOLS',
        items: [
          { label: 'Account Approvals', to: '/lgu/approvals', icon: icons.approvals },
          { label: 'Manage Programs', to: '/programs/manage', icon: icons.programs },
          { label: 'Record Market Prices', to: '/market-prices/manage', icon: icons.marketPrices },
        ],
      },
      {
        title: 'COMMUNITY',
        items: [
          { label: 'Marketplace', to: '/produce', icon: icons.marketplace },
          { label: 'Community Forum', to: '/community', icon: icons.community },
        ],
      },
    ];
  } else if (role === 'supplier') {
    navGroups = [
      {
        title: 'MAIN',
        items: [{ label: 'Dashboard', to: '/dashboard', icon: icons.dashboard }],
      },
      {
        title: 'MY BUSINESS',
        items: [
          { label: 'Manage Products', to: '/supply/manage', icon: icons.manageProducts },
          { label: 'Customer Orders', to: '/supply/orders', icon: icons.orders },
        ],
      },
      {
        title: 'MARKET',
        items: [
          { label: 'Marketplace', to: '/produce', icon: icons.marketplace },
          { label: 'Market Prices', to: '/market-prices', icon: icons.marketPrices },
        ],
      },
      {
        title: 'COMMUNITY',
        items: [
          { label: 'Community Hub', to: '/community', icon: icons.community },
        ],
      },
    ];
  } else if (role === 'buyer') {
    navGroups = [
      {
        title: 'MAIN',
        items: [{ label: 'Dashboard', to: '/dashboard', icon: icons.dashboard }],
      },
      {
        title: 'TRADING',
        items: [
          { label: 'Marketplace', to: '/produce', icon: icons.marketplace },
          { label: 'My Orders', to: '/produce/orders', icon: icons.orders },
        ],
      },
      {
        title: 'INSIGHTS',
        items: [
          { label: 'Market Prices', to: '/market-prices', icon: icons.marketPrices },
        ],
      },
      {
        title: 'COMMUNITY',
        items: [
          { label: 'Community Hub', to: '/community', icon: icons.community },
        ],
      },
    ];
  } else {
    // Default: 'farmer'
    navGroups = [
      {
        title: 'MAIN',
        items: [{ label: 'Dashboard', to: '/dashboard', icon: icons.dashboard }],
      },
      {
        title: 'MARKETPLACE',
        items: [
          { label: 'Marketplace', to: '/produce', icon: icons.marketplace },
          { label: 'My Crop Listings', to: '/produce/manage', icon: icons.listings },
          { label: 'Orders & Sales', to: '/produce/orders', icon: icons.orders },
        ],
      },
      {
        title: 'MY FARM',
        items: [
          { label: 'Farm Manager', to: '/finances', icon: icons.finances },
          { label: 'Market Prices', to: '/market-prices', icon: icons.marketPrices },
        ],
      },
      {
        title: 'COMMUNITY',
        items: [
          { label: "Gov't Programs", to: '/programs', icon: icons.programs },
          { label: 'Community Hub', to: '/community', icon: icons.community },
        ],
      },
    ];
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(14, 74, 39, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 490,
          }}
        />
      )}

      <aside
        className="app-sidebar"
        style={{
          width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          background: '#FFFFFF',
          borderRight: '1px solid #E4E2DC',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 500,
          transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: mobileOpen ? 'translateX(0)' : undefined,
          boxShadow: mobileOpen ? '0 10px 40px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 'var(--topbar-height)',
            display: 'flex',
            alignItems: 'center',
            padding: collapsed ? '0 16px' : '0 20px',
            borderBottom: '1px solid #E4E2DC',
            justifyContent: collapsed ? 'center' : 'space-between',
            flexShrink: 0,
          }}
        >
          <Link
            to="/dashboard"
            onClick={onCloseMobile}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
            }}
          >
            <img
              src={agriConnectLogo}
              alt="AgriConnect Logo"
              style={{
                width: '42px',
                height: '42px',
                objectFit: 'contain',
                mixBlendMode: 'multiply',
                flexShrink: 0,
                display: 'block',
              }}
            />
            {!collapsed && (
              <div>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: '-0.3px',
                  }}
                >
                  <span style={{ color: '#16523a' }}>Agri</span><span style={{ color: '#599e36' }}>Connect</span>
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#1c513d',
                    marginTop: '2px',
                  }}
                >
                  Connect. Grow. Prosper.
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: collapsed ? '16px 8px' : '20px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {navGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#6F716C',
                    letterSpacing: '0.08em',
                    paddingLeft: '12px',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                  }}
                >
                  {group.title}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {group.items.map((item) => {
                  if (item.isAction) {
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          onCloseMobile();
                          if (item.action) item.action();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          padding: collapsed ? '12px' : '12px 14px',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'transparent',
                          color: '#222522',
                          cursor: 'pointer',
                          width: '100%',
                          fontSize: '16px',
                          fontWeight: 600,
                          textAlign: 'left',
                        }}
                      >
                        <span style={{ color: '#6F716C', display: 'flex' }}>{item.icon}</span>
                        {!collapsed && <span>{item.label}</span>}
                      </button>
                    );
                  }

                  const active = isItemActive(item.to);

                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        onCloseMobile();
                        navigate(item.to);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: collapsed ? '12px' : '12px 14px',
                        borderRadius: '10px',
                        border: 'none',
                        outline: 'none',
                        textDecoration: 'none',
                        fontSize: '16px',
                        fontWeight: active ? 800 : 600,
                        color: active ? '#176B3A' : '#222522',
                        background: active ? '#EAF6EE' : 'transparent',
                        borderLeft: active && !collapsed ? '4px solid #176B3A' : '4px solid transparent',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ color: active ? '#176B3A' : '#6F716C', display: 'flex' }}>
                        {item.icon}
                      </span>
                      {!collapsed && <span>{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};

