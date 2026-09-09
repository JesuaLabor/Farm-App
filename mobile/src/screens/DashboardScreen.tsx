import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import type { Role } from '../types/auth';
import { Spinner } from '../components/Spinner';
import { NotificationBell } from '../components/NotificationBell';

export const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [prices, setPrices] = useState<{ id?: string; commodity: string; price: number; unit: string; region: string }[]>([]);
  const [posts, setPosts] = useState<{ id: string; category: string; title: string; authorName: string; upvotes: number }[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pData, cData] = await Promise.all([
          api.listPrices().catch(() => []),
          api.listCommunityPosts('all').catch(() => []),
        ]);
        setPrices((pData as typeof prices).slice(0, 3));
        setPosts((cData as typeof posts).slice(0, 2));
      } catch { /* silent */ } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  if (!user) return null;

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();

  const roleLabelMap: Record<Role, string> = {
    farmer: 'Farmer Producer',
    buyer: 'Wholesale Buyer',
    supplier: 'Agri Supplier',
    expert: 'Agronomist Expert',
    lgu_staff: 'LGU Agriculture Officer',
    super_admin: 'Super Admin',
  };

  return (
    <div>
      {/* ── Hero Header ─────────────────────────────────────── */}
      <div className="dash-hero">
        <div className="dash-brand-row">
          <div className="dash-brand">
            <div className="dash-logo-badge">🌾</div>
            <span className="dash-app-name">AgriConnect</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <NotificationBell />
            <button className="dash-avatar-btn" onClick={() => navigate('/profile')}>
              {initials}
            </button>
          </div>
        </div>

        <div className="role-chip">
          <div className="role-dot" />
          <span className="role-chip-text">{roleLabelMap[user.role] ?? user.role}</span>
        </div>
        <div className="greeting-title">Welcome back, {user.firstName} 👋</div>
        <div className="greeting-sub">
          {user.region ? `Regional Hub: ${user.region}` : 'Philippine Agricultural Ecosystem'}
        </div>
        <div className="tip-pill">
          <span>☀️</span>
          <span>Good harvest weather reported in Central Luzon</span>
        </div>
      </div>

      {/* ── Quick Actions ───────────────────────────────────── */}
      <div className="section">
        <div className="section-title" style={{ marginBottom: 12 }}>Quick Actions</div>
        <div className="quick-grid">
          <button className="quick-card" onClick={() => navigate('/marketplace')}>
            <div className="quick-icon-wrap" style={{ background: '#d4ead9' }}>🏪</div>
            <div className="quick-title">Marketplace</div>
            <div className="quick-sub">Crops & Produce</div>
          </button>
          <button className="quick-card" onClick={() => navigate('/community')}>
            <div className="quick-icon-wrap" style={{ background: '#f3e8ff' }}>💬</div>
            <div className="quick-title">Forum</div>
            <div className="quick-sub">Ask Experts</div>
          </button>
          <button className="quick-card" onClick={() => navigate('/supply')}>
            <div className="quick-icon-wrap" style={{ background: '#f2ede3' }}>🚜</div>
            <div className="quick-title">Supplies</div>
            <div className="quick-sub">Seeds & Tools</div>
          </button>
          <button className="quick-card" onClick={() => navigate('/financial')}>
            <div className="quick-icon-wrap" style={{ background: '#dbeafe' }}>📒</div>
            <div className="quick-title">Finances</div>
            <div className="quick-sub">Income & Expense</div>
          </button>
        </div>
      </div>

      {/* ── Market Prices ───────────────────────────────────── */}
      <div className="section">
        <div className="section-header">
          <div className="section-title">Regional Market Rates</div>
          <button className="see-all" onClick={() => navigate('/marketplace')}>View All ›</button>
        </div>

        {loadingData ? (
          <Spinner />
        ) : prices.length === 0 ? (
          <div className="preview-card">
            <div className="preview-title">Palay (Dry) · ₱22.50 / kg</div>
            <div className="preview-sub">Central Luzon benchmark rate</div>
          </div>
        ) : (
          prices.map((p, i) => (
            <div key={p.id ?? i} className="preview-card">
              <div className="preview-price-meta">
                <div className="preview-title">{p.commodity}</div>
                <div className="price-tag">₱{p.price} / {p.unit}</div>
              </div>
              <div className="preview-sub">📍 {p.region}</div>
            </div>
          ))
        )}
      </div>

      {/* ── Community Highlights ────────────────────────────── */}
      {posts.length > 0 && (
        <div className="section">
          <div className="section-header">
            <div className="section-title">Community Discussions</div>
            <button className="see-all" onClick={() => navigate('/community')}>View Forum ›</button>
          </div>
          {posts.map((post) => (
            <div
              key={post.id}
              className="post-preview-card"
              onClick={() => navigate('/community')}
            >
              <div className="post-preview-cat">{post.category?.replace('_', ' ')}</div>
              <div className="post-preview-title">{post.title}</div>
              <div className="post-preview-author">by {post.authorName} · {post.upvotes} Upvotes</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Logout ──────────────────────────────────────────── */}
      <button className="logout-btn" onClick={logout}>Sign out of AgriConnect</button>
    </div>
  );
};
