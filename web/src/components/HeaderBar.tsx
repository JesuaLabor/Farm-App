import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NotificationBell } from './NotificationBell';

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

export const HeaderBar: React.FC<HeaderBarProps> = ({
  collapsed: _collapsed,
  onToggleSidebar,
  onOpenMobileSidebar,
  onOpenHelp,
  onOpenOnboarding,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        background: '#FFFFFF',
        borderBottom: '2px solid #E4E2DC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 400,
        gap: '16px',
      }}
    >
      {/* Left: Sidebar Toggle Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Desktop Toggle Button */}
        <button
          onClick={onToggleSidebar}
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            border: '2px solid #E4E2DC',
            background: '#FFFFFF',
            color: '#222522',
            cursor: 'pointer',
          }}
          className="desktop-toggle-btn"
          aria-label="Toggle Navigation Menu"
          title="Toggle Navigation Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Mobile Menu Button */}
        <button
          onClick={onOpenMobileSidebar}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '12px',
            border: '2px solid #E4E2DC',
            background: '#EAF6EE',
            color: '#176B3A',
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '16px',
          }}
          className="mobile-menu-btn"
          aria-label="Open Navigation Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span>Menu</span>
        </button>
      </div>

      {/* Center: Large Accessible Search Field */}
      <div
        ref={searchRef}
        style={{
          flex: '1 1 500px',
          maxWidth: '560px',
          position: 'relative',
        }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#525450"
            strokeWidth="2.5"
            style={{ position: 'absolute', left: '18px', pointerEvents: 'none' }}
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
            placeholder="Type crop name to search (e.g. Tomato, Corn)..."
            aria-label="Type crop name to search"
            style={{
              width: '100%',
              height: '52px',
              paddingLeft: '54px',
              paddingRight: '16px',
              borderRadius: '14px',
              border: '2.5px solid #E4E2DC',
              background: '#F8F7F3',
              fontSize: '17px',
              color: '#1A1C1A',
              fontWeight: 600,
              outline: 'none',
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
              borderRadius: '16px',
              border: '2px solid #E4E2DC',
              boxShadow: '0 14px 36px rgba(23, 107, 58, 0.14)',
              overflow: 'hidden',
              zIndex: 600,
            }}
          >
            <div style={{ padding: '12px 18px', fontSize: '13px', fontWeight: 800, color: '#525450', background: '#F8F7F3', borderBottom: '1.5px solid #E4E2DC' }}>
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
                    gap: '14px',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    fontSize: '17px',
                    fontWeight: 700,
                    color: '#1A1C1A',
                    borderBottom: '1px solid #F8F7F3',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#EAF6EE')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                >
                  <span style={{ fontSize: '22px' }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.title}</span>
                  <span style={{ fontSize: '15px', color: '#176B3A', fontWeight: 800 }}>Open →</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '18px', fontSize: '16px', color: '#525450', textAlign: 'center' }}>
                No direct matches. Press Enter to search marketplace.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Phone Support Hotline, Need Help, Notifications */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Direct Call Support Button */}
        <button
          onClick={onOpenHelp}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '12px',
            border: '2px solid #176B3A',
            background: '#EAF6EE',
            color: '#176B3A',
            fontWeight: 800,
            fontSize: '15px',
            cursor: 'pointer',
          }}
          title="Call Support Hotline"
        >
          <span style={{ fontSize: '18px' }}>📞</span>
          <span className="help-btn-text">Call Support (0917-123-4567)</span>
        </button>

        {/* Role-Specific Quick Action */}
        {user?.role === 'farmer' && onOpenOnboarding && (
          <button
            onClick={onOpenOnboarding}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              borderRadius: '12px',
              border: '2px solid #E4E2DC',
              background: '#FFFFFF',
              color: '#0E4A27',
              fontWeight: 800,
              fontSize: '15px',
              cursor: 'pointer',
            }}
            title="Setup Farm"
          >
            <span>✨</span>
            <span className="onboarding-btn-text">Farm Setup</span>
          </button>
        )}
        {user?.role === 'super_admin' && (
          <button
            onClick={() => navigate('/admin/approvals')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              borderRadius: '12px',
              border: '2px solid #0E4A27',
              background: '#EAF6EE',
              color: '#0E4A27',
              fontWeight: 800,
              fontSize: '15px',
              cursor: 'pointer',
            }}
            title="Account Approvals"
          >
            <span>🛡️</span>
            <span className="onboarding-btn-text">Staff Approvals</span>
          </button>
        )}
        {user?.role === 'lgu_staff' && (
          <button
            onClick={() => navigate('/lgu/dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              borderRadius: '12px',
              border: '2px solid #0E4A27',
              background: '#EAF6EE',
              color: '#0E4A27',
              fontWeight: 800,
              fontSize: '15px',
              cursor: 'pointer',
            }}
            title="LGU Regional Hub"
          >
            <span>🏛️</span>
            <span className="onboarding-btn-text">LGU Hub</span>
          </button>
        )}
        {user?.role === 'supplier' && (
          <button
            onClick={() => navigate('/supply/manage')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              borderRadius: '12px',
              border: '2px solid #0E4A27',
              background: '#EAF6EE',
              color: '#0E4A27',
              fontWeight: 800,
              fontSize: '15px',
              cursor: 'pointer',
            }}
            title="Inventory Management"
          >
            <span>🚜</span>
            <span className="onboarding-btn-text">My Products</span>
          </button>
        )}

        {/* Notification Bell */}
        <NotificationBell />

        {/* User Profile Trigger */}
        <div
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '12px',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#176B3A',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '20px',
            }}
          >
            {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'J'}
          </div>
        </div>
      </div>
    </header>
  );
};
