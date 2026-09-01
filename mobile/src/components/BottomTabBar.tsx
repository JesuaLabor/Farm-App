import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { key: '/dashboard', label: 'Home',      icon: '🏠' },
  { key: '/marketplace', label: 'Market',    icon: '🌾' },
  { key: '/community',   label: 'Community', icon: '💬' },
  { key: '/supply',      label: 'Supplies',  icon: '🚜' },
  { key: '/profile',     label: 'Profile',   icon: '👤' },
] as const;

export const BottomTabBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-tab-bar">
      {tabs.map((t) => {
        // Financial tracker is a sub-route off dashboard; keep 'Home' active
        const isActive =
          location.pathname === t.key ||
          (t.key === '/dashboard' && location.pathname === '/financial');

        return (
          <button
            key={t.key}
            className={`tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => navigate(t.key)}
          >
            {isActive && <div className="tab-active-bar" />}
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
