import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NotificationBell } from './NotificationBell';

interface BreadcrumbInfo {
  parent: string;
  parentPath?: string;
  current: string;
  icon?: string;
}

const getBreadcrumbs = (pathname: string, role?: string): BreadcrumbInfo => {
  if (pathname === '/dashboard') {
    return { parent: 'Dashboard', parentPath: '/dashboard', current: 'Overview', icon: '⊞' };
  }
  if (pathname === '/produce/manage') {
    return { parent: 'Marketplace', parentPath: '/produce', current: 'My Listings', icon: '📦' };
  }
  if (pathname === '/produce/orders') {
    return {
      parent: 'Marketplace',
      parentPath: '/produce',
      current: role === 'farmer' ? 'Crop Sales Orders' : 'My Produce Purchases',
      icon: '🧾',
    };
  }
  if (pathname.startsWith('/produce')) {
    return { parent: 'Marketplace', parentPath: '/produce', current: 'Browse Produce', icon: '🌾' };
  }
  if (pathname === '/market-prices') {
    return { parent: 'Market Prices', parentPath: '/market-prices', current: 'Northern Mindanao', icon: '📈' };
  }
  if (pathname === '/price-trends') {
    return { parent: 'Market Prices', parentPath: '/market-prices', current: 'Price Trends', icon: '📊' };
  }
  if (pathname === '/market-prices/manage') {
    return { parent: 'Market Prices', parentPath: '/market-prices', current: 'Manage Benchmarks', icon: '⚖️' };
  }
  if (pathname === '/programs/manage') {
    return { parent: 'Government Programs', parentPath: '/programs', current: 'Program Management', icon: '📋' };
  }
  if (pathname.startsWith('/programs')) {
    return { parent: 'Government Programs', parentPath: '/programs', current: 'Available Programs', icon: '🏛️' };
  }
  if (pathname === '/supply/cart') {
    return { parent: 'Agri-Supply Store', parentPath: '/supply', current: 'Shopping Cart', icon: '🛒' };
  }
  if (pathname === '/supply/manage') {
    return { parent: 'Agri-Supply Store', parentPath: '/supply', current: 'Manage Products', icon: '🏷️' };
  }
  if (pathname === '/supply/orders') {
    return {
      parent: 'Agri-Supply Store',
      parentPath: '/supply',
      current: role === 'supplier' ? 'Customer Orders' : 'My Supply Purchases',
      icon: '📦',
    };
  }
  if (pathname.startsWith('/supply')) {
    return { parent: 'Agri-Supply Store', parentPath: '/supply', current: 'Store Catalog', icon: '🏪' };
  }
  if (pathname === '/finances') {
    return { parent: 'Farm Management', parentPath: '/finances', current: 'Financial Tracker', icon: '💰' };
  }
  if (pathname === '/guides') {
    return { parent: 'Community Hub', parentPath: '/community', current: 'Learn & Field Guides', icon: '📚' };
  }
  if (pathname.startsWith('/community/posts')) {
    return { parent: 'Community Hub', parentPath: '/community', current: 'Post Discussion', icon: '💬' };
  }
  if (pathname.startsWith('/community')) {
    return { parent: 'Community Hub', parentPath: '/community', current: 'Farmer Forum', icon: '💬' };
  }
  if (pathname === '/lgu/dashboard') {
    return { parent: 'LGU Monitoring', parentPath: '/lgu/dashboard', current: 'Regional Dashboard', icon: '🏛️' };
  }
  if (pathname === '/admin/approvals') {
    return { parent: 'Platform Governance', parentPath: '/admin/approvals', current: 'Staff & Approvals', icon: '🛡️' };
  }
  if (pathname === '/lgu/approvals') {
    return { parent: 'LGU Governance', parentPath: '/lgu/approvals', current: 'Account Approvals', icon: '🛡️' };
  }
  if (pathname === '/profile') {
    return { parent: 'Account', parentPath: '/profile', current: 'Farmer Profile', icon: '👤' };
  }
  if (pathname === '/settings') {
    return { parent: 'Account', parentPath: '/settings', current: 'Settings', icon: '⚙️' };
  }

  const segment = pathname.replace(/^\//, '').split('/')[0];
  const capitalized = segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : 'Dashboard';
  return { parent: capitalized, parentPath: pathname, current: 'Overview', icon: '⊞' };
};

interface HeaderBarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileSidebar: () => void;
  onOpenHelp?: () => void;
  onOpenOnboarding?: () => void;
}

const sampleAutocompleteSuggestions = [
  { term: 'tomato', title: 'Tomato market price today', path: '/market-prices', icon: '📈' },
  { term: 'tomato', title: 'Tomato buyers in Cagayan de Oro', path: '/produce', icon: '👤' },
  { term: 'tomato', title: 'Sell fresh tomatoes', path: '/produce/manage?action=new', icon: '🍅' },
  { term: 'corn', title: 'Corn market price today', path: '/market-prices', icon: '📈' },
  { term: 'corn', title: 'Corn buyers in Bukidnon', path: '/produce', icon: '🌽' },
  { term: 'rice', title: 'Rice market price monitoring', path: '/market-prices', icon: '📈' },
  { term: 'rice', title: 'Rice Farmer Cash Assistance', path: '/programs', icon: '🏛' },
];

const roleLabels: Record<string, string> = {
  farmer: 'Farmer',
  buyer: 'Buyer',
  supplier: 'Supplier',
  expert: 'Expert',
  lgu_staff: 'LGU Staff',
  super_admin: 'Super Admin',
};

export const HeaderBar: React.FC<HeaderBarProps> = ({
  collapsed: _collapsed,
  onToggleSidebar,
  onOpenMobileSidebar,
  onOpenHelp: _onOpenHelp,
  onOpenOnboarding: _onOpenOnboarding,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const breadcrumb = getBreadcrumbs(location.pathname, user?.role);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const calculateCartCount = () => {
    let count = 0;
    try {
      const rawSupply = localStorage.getItem('agriconnect_cart');
      if (rawSupply) {
        const items = JSON.parse(rawSupply);
        if (Array.isArray(items)) {
          count += items.length;
        }
      }
      const rawProduce = localStorage.getItem('agriconnect_produce_cart');
      if (rawProduce) {
        const items = JSON.parse(rawProduce);
        if (Array.isArray(items)) {
          count += items.length;
        }
      }
    } catch {}
    setCartCount(count);
  };

  useEffect(() => {
    calculateCartCount();
    const handleSync = () => calculateCartCount();
    window.addEventListener('cart-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('cart-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowProfileDropdown(false);
      }
    };
    if (showProfileDropdown) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showProfileDropdown]);

  const filteredSuggestions = searchQuery.trim()
    ? sampleAutocompleteSuggestions.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.term.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectSuggestion = (path: string) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(path);
  };

  const handleLogout = () => {
    setShowProfileDropdown(false);
    logout();
    navigate('/login');
  };

  const handleProfileNavigation = (path: string) => {
    setShowProfileDropdown(false);
    navigate(path);
  };

  const userInitial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'J';
  const userFullName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const userEmail = user?.email || '';
  const userRoleLabel = user?.role ? roleLabels[user.role] || user.role : '';

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        background: '#FFFFFF',
        borderBottom: '1px solid #E4E2DC',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 400,
        gap: '20px',
      }}
    >
      {/* Left: Sidebar Toggle Buttons & Contextual Breadcrumb */}
      <div style={{ flex: '1', display: 'flex', alignItems: 'center', minWidth: 0, gap: '10px' }}>
        {/* Desktop Toggle Button */}
        <button
          onClick={onToggleSidebar}
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            border: '1px solid #E4E2DC',
            background: '#FFFFFF',
            color: '#374151',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
          className="desktop-toggle-btn"
          aria-label="Toggle Navigation Menu"
          title="Toggle Navigation Menu"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F4F3EE';
            e.currentTarget.style.borderColor = '#D8D6CE';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFFFFF';
            e.currentTarget.style.borderColor = '#E4E2DC';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 3v18" />
          </svg>
        </button>

        {/* Mobile Menu Button */}
        <button
          onClick={onOpenMobileSidebar}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            height: '40px',
            padding: '0 14px',
            borderRadius: '10px',
            border: '1px solid #E4E2DC',
            background: '#EAF6EE',
            color: '#176B3A',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '15px',
            flexShrink: 0,
          }}
          className="mobile-menu-btn"
          aria-label="Open Navigation Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span>Menu</span>
        </button>

        {/* Vertical Divider */}
        <div
          className="header-breadcrumb-divider"
          style={{
            width: '1px',
            height: '20px',
            background: '#E4E2DC',
            margin: '0 10px',
            flexShrink: 0,
          }}
        />

        {/* Contextual Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="header-breadcrumb"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            fontSize: '14px',
            lineHeight: 1,
            minHeight: 'auto',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '15px', display: 'inline-flex', alignItems: 'center', opacity: 0.85, lineHeight: 1 }}>
            {breadcrumb.icon || '⊞'}
          </span>

          <Link
            to={breadcrumb.parentPath || '/dashboard'}
            style={{
              color: '#555852',
              fontWeight: 500,
              textDecoration: 'none',
              padding: '2px 4px',
              borderRadius: '4px',
              transition: 'color 0.15s ease',
              display: 'inline-flex',
              alignItems: 'center',
              lineHeight: 1,
              minHeight: 'auto',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#176B3A')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#555852')}
          >
            {breadcrumb.parent}
          </Link>

          <span
            style={{
              color: '#A0A39D',
              fontWeight: 600,
              fontSize: '13px',
              userSelect: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              lineHeight: 1,
            }}
            aria-hidden="true"
          >
            ›
          </span>

          <span
            style={{
              color: '#1A1C1A',
              fontWeight: 700,
              padding: '2px 4px',
              display: 'inline-flex',
              alignItems: 'center',
              lineHeight: 1,
            }}
            aria-current="page"
          >
            {breadcrumb.current}
          </span>
        </nav>
      </div>

      {/* Center: Centered Accessible Search Field */}
      <div
        ref={searchRef}
        style={{
          flex: '0 1 440px',
          maxWidth: '440px',
          width: '100%',
          position: 'relative',
        }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6B7280"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search crops, prices, programs..."
            aria-label="Search AgriConnect"
            style={{
              width: '100%',
              height: '40px',
              paddingLeft: '40px',
              paddingRight: '16px',
              borderRadius: '10px',
              border: '1px solid #D8D6CE',
              background: '#F8F7F3',
              fontSize: '14px',
              color: '#1A1C1A',
              fontWeight: 500,
              outline: 'none',
              transition: 'background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
            }}
            onFocusCapture={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = '#176B3A';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(23, 107, 58, 0.12)';
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.background = '#F8F7F3';
              e.currentTarget.style.borderColor = '#D8D6CE';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Autocomplete Dropdown */}
        {showSuggestions && searchQuery.trim().length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: '#FFFFFF',
              borderRadius: '14px',
              border: '1.5px solid #E4E2DC',
              boxShadow: '0 14px 36px rgba(23, 107, 58, 0.14)',
              overflow: 'hidden',
              zIndex: 600,
            }}
          >
            <div style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 800, color: '#525450', background: '#F8F7F3', borderBottom: '1px solid #E4E2DC' }}>
              SEARCH SUGGESTIONS FOR "{searchQuery}"
            </div>
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectSuggestion(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#1A1C1A',
                    borderBottom: '1px solid #F8F7F3',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#EAF6EE')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                >
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.title}</span>
                  <span style={{ fontSize: '13px', color: '#176B3A', fontWeight: 700 }}>Open →</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '16px', fontSize: '14px', color: '#525450', textAlign: 'center' }}>
                No direct matches. Press Enter to search marketplace.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Notifications & User Profile */}
      <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
        {/* Shopping Cart Button (Purchasing roles only: Farmer, Buyer, Admin) */}
        {(user?.role === 'farmer' || user?.role === 'buyer' || user?.role === 'super_admin') && (
          <button
            onClick={() => navigate('/supply/cart')}
            title={`Shopping Cart (${cartCount} items)`}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: cartCount > 0 ? '#FBF6EE' : '#F0EFEA',
              border: `1.5px solid ${cartCount > 0 ? '#D97706' : '#E4E2DC'}`,
              cursor: 'pointer',
              fontSize: '18px',
              color: '#1A1C1A',
              transition: 'all 0.18s ease',
              padding: 0,
            }}
            aria-label={`Shopping cart with ${cartCount} items`}
          >
            🛒
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#D97706',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  borderRadius: '10px',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 5px rgba(217, 119, 6, 0.4)',
                  border: '1.5px solid #FFFFFF',
                  lineHeight: 1,
                }}
              >
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        )}

        {/* Notification Bell */}
        <NotificationBell />

        {/* User Profile Dropdown */}
        <div
          ref={profileDropdownRef}
          style={{ position: 'relative' }}
        >
          {/* Avatar Trigger Button */}
          <button
            onClick={() => setShowProfileDropdown((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: showProfileDropdown ? '2px solid #176B3A' : '2px solid transparent',
              background: 'transparent',
              transition: 'border-color 0.15s ease',
              minHeight: 'auto',
            }}
            aria-label="Open profile menu"
            aria-expanded={showProfileDropdown}
            aria-haspopup="true"
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: showProfileDropdown ? '#0E4A27' : '#176B3A',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '16px',
                transition: 'background 0.18s ease, box-shadow 0.18s ease',
                boxShadow: showProfileDropdown ? '0 0 0 3px rgba(23, 107, 58, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              {userInitial}
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileDropdown && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: '280px',
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '2px solid #E4E2DC',
                boxShadow: '0 16px 48px rgba(14, 74, 39, 0.16), 0 4px 12px rgba(0, 0, 0, 0.06)',
                overflow: 'hidden',
                zIndex: 700,
                animation: 'profileDropdownIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              role="menu"
              aria-label="Profile menu"
            >
              {/* User Info Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '18px 20px',
                  borderBottom: '1.5px solid #E4E2DC',
                  background: '#FAFAF7',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: '#176B3A',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '18px',
                    flexShrink: 0,
                  }}
                >
                  {userInitial}
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 800,
                      color: '#0E4A27',
                      lineHeight: 1.3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {userFullName}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#525450',
                      lineHeight: 1.3,
                      marginTop: '2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {userEmail}
                  </div>
                  {userRoleLabel && (
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#176B3A',
                        background: '#EAF6EE',
                        padding: '2px 10px',
                        borderRadius: '9999px',
                        border: '1px solid rgba(23, 107, 58, 0.2)',
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {userRoleLabel}
                    </span>
                  )}
                </div>
              </div>

              {/* Menu Items */}
              <div style={{ padding: '6px 0' }}>
                {/* Account */}
                <button
                  onClick={() => handleProfileNavigation('/profile')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    width: '100%',
                    padding: '14px 20px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#1A1C1A',
                    transition: 'background 0.15s ease, color 0.15s ease',
                    textAlign: 'left',
                    minHeight: 'auto',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#EAF6EE';
                    e.currentTarget.style.color = '#0E4A27';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#1A1C1A';
                  }}
                  role="menuitem"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M20 21a8 8 0 1 0-16 0" />
                  </svg>
                  <span>Account</span>
                </button>

                {/* Settings */}
                <button
                  onClick={() => handleProfileNavigation('/settings')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    width: '100%',
                    padding: '14px 20px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#1A1C1A',
                    transition: 'background 0.15s ease, color 0.15s ease',
                    textAlign: 'left',
                    minHeight: 'auto',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#EAF6EE';
                    e.currentTarget.style.color = '#0E4A27';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#1A1C1A';
                  }}
                  role="menuitem"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <span>Settings</span>
                </button>
              </div>

              {/* Divider + Log Out */}
              <div
                style={{
                  borderTop: '1.5px solid #E4E2DC',
                  padding: '6px 0',
                }}
              >
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    width: '100%',
                    padding: '14px 20px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#BA3C3C',
                    transition: 'background 0.15s ease',
                    textAlign: 'left',
                    minHeight: 'auto',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FDF2F2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  role="menuitem"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
