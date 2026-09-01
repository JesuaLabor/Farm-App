import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import type { SupplyOrder, PaymentMethod, PaymentStatus } from '../types/app';
import { Spinner } from '../components/Spinner';

type PurchaseTab = 'to_ship' | 'to_receive' | 'completed' | 'cancelled' | 'refunded';

const purchaseTabs: { key: PurchaseTab; label: string; icon: string }[] = [
  { key: 'to_ship',    label: 'To Ship',         icon: '📦' },
  { key: 'to_receive', label: 'To Receive',      icon: '🚚' },
  { key: 'completed',  label: 'Completed',       icon: '✅' },
  { key: 'cancelled',  label: 'Cancelled',       icon: '❌' },
  { key: 'refunded',   label: 'Return/Refund',   icon: '↩️' },
];

const paymentMethodLabels: Record<PaymentMethod, { label: string; icon: string }> = {
  cod:           { label: 'COD',            icon: '💵' },
  gcash:         { label: 'GCash',          icon: '📱' },
  maya:          { label: 'Maya',           icon: '💜' },
  bank_transfer: { label: 'Bank Transfer',  icon: '🏦' },
  card:          { label: 'Card',           icon: '💳' },
};

const paymentStatusBadges: Record<PaymentStatus, { label: string; bg: string; color: string }> = {
  pending_payment: { label: 'UNPAID',   bg: '#fef9c3', color: '#92400e' },
  paid:            { label: 'PAID',     bg: '#dcfce7', color: '#166534' },
  failed:          { label: 'FAILED',   bg: '#fee2e2', color: '#991b1b' },
  refunded:        { label: 'REFUNDED', bg: '#f1f5f9', color: '#475569' },
};

export const ProfileScreen: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [region, setRegion] = useState(user?.region || '');
  const [address, setAddress] = useState(user?.address || '');

  const [saving, setSaving] = useState(false);
  const [msgType, setMsgType] = useState<'success' | 'error' | null>(null);
  const [msgText, setMsgText] = useState('');

  // Purchases
  const [orders, setOrders] = useState<SupplyOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<PurchaseTab>('to_ship');

  useEffect(() => {
    if (user && (user.role === 'farmer' || user.role === 'buyer')) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await api.listSupplyOrders();
      setOrders(data);
    } catch {
      console.error('Failed to load orders for mobile profile');
    } finally {
      setOrdersLoading(false);
    }
  };

  if (!user) return null;

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();

  const roleLabelMap: Record<string, string> = {
    farmer:    'Farmer',
    buyer:     'Buyer',
    supplier:  'Supplier',
    expert:    'Expert',
    lgu_staff: 'LGU Staff',
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsgType(null);
    setMsgText('');
    try {
      await api.updateProfile({ firstName, lastName, phone, region, address });
      await refreshProfile();
      setMsgType('success');
      setMsgText('Profile updated successfully.');
    } catch (err: any) {
      setMsgType('error');
      setMsgText(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // Filter orders by tab
  const getOrdersForTab = (tab: PurchaseTab) => {
    return orders.filter((o) => {
      if (tab === 'refunded') return o.paymentStatus === 'refunded';
      if (tab === 'to_ship') return o.status === 'pending' || o.status === 'processing';
      if (tab === 'to_receive') return o.status === 'shipped_ready';
      if (tab === 'completed') return o.status === 'completed' && o.paymentStatus !== 'refunded';
      if (tab === 'cancelled') return o.status === 'cancelled' && o.paymentStatus !== 'refunded';
      return false;
    });
  };

  const currentTabOrders = getOrdersForTab(activeTab);

  return (
    <div>
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <span>←</span> Dashboard
        </button>
        <div className="top-bar-title">My Profile</div>
        <div style={{ width: 70 }} />
      </div>

      {/* ── Avatar Section ──────────────────────────────────── */}
      <div className="avatar-section">
        <div className="avatar-squircle">{initials}</div>
        <div className="display-name">{user.firstName} {user.lastName}</div>
        <div className="display-email">{user.email}</div>
        <div className="role-tag">
          <div className="role-tag-dot" />
          <span className="role-tag-text">{roleLabelMap[user.role] ?? user.role}</span>
        </div>
      </div>

      {/* ── My Purchases Section (Shopee/Lazada style for Mobile) ── */}
      {(user.role === 'farmer' || user.role === 'buyer') && (
        <div className="form-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="form-card-title" style={{ margin: 0 }}>🛍️ My Purchases</div>
            <button
              onClick={() => navigate('/supply')}
              style={{ border: 'none', background: 'none', color: '#ca8a04', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
            >
              Shop Supply →
            </button>
          </div>

          {/* Quick-action tiles (Shopee style icon bar) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 4,
            padding: '10px 0',
            borderBottom: '1px solid #f1f5f9',
            marginBottom: 12,
          }}>
            {purchaseTabs.map((tab) => {
              const count = getOrdersForTab(tab.key).length;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '4px 0',
                  }}
                >
                  <div style={{
                    fontSize: 22,
                    marginBottom: 4,
                    filter: isActive ? 'drop-shadow(0 2px 4px rgba(202,138,4,0.3))' : 'none',
                    transform: isActive ? 'scale(1.15)' : 'none',
                    transition: 'all 0.15s ease',
                  }}>
                    {tab.icon}
                  </div>
                  <span style={{
                    fontSize: 10,
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? '#ca8a04' : '#64748b',
                    textAlign: 'center',
                    lineHeight: 1.1,
                  }}>
                    {tab.label}
                  </span>
                  {count > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: -2,
                      right: 4,
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      fontSize: 9,
                      fontWeight: 800,
                      borderRadius: 10,
                      minWidth: 15,
                      height: 15,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 3px',
                      border: '1.5px solid #fff',
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Tab Order List */}
          <div>
            {ordersLoading ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#94a3b8', fontSize: 12 }}>
                <Spinner size={18} />
              </div>
            ) : currentTabOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: 12 }}>
                No orders in "{purchaseTabs.find(t => t.key === activeTab)?.label}"
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {currentTabOrders.map((order) => {
                  const payMethod = paymentMethodLabels[order.paymentMethod] ?? { label: order.paymentMethod, icon: '💳' };
                  const payBadge = paymentStatusBadges[order.paymentStatus] ?? paymentStatusBadges['pending_payment'];

                  return (
                    <div
                      key={order.id}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        fontSize: 12,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontWeight: 800, color: '#0f172a' }}>
                          Order #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <span style={{
                          fontSize: 9,
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: 6,
                          backgroundColor: payBadge.bg,
                          color: payBadge.color,
                        }}>
                          {payBadge.label}
                        </span>
                      </div>

                      <div style={{ color: '#64748b', marginBottom: 6 }}>
                        Supplier: {order.supplierName}
                      </div>

                      <div style={{ backgroundColor: '#fff', padding: '6px 8px', borderRadius: 6, marginBottom: 8 }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                            <span>{item.quantity}× {item.productName}</span>
                            <span style={{ fontWeight: 600 }}>₱{(item.quantity * item.pricePerItem).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontSize: 11 }}>
                          {payMethod.icon} {payMethod.label} · 🚚 {order.deliveryMethod}
                        </span>
                        <span style={{ fontWeight: 800, color: '#ca8a04', fontSize: 14 }}>
                          ₱{order.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Form Card ───────────────────────────────────────── */}
      <form className="form-card" onSubmit={handleSave}>
        <div className="form-card-title">Personal information</div>

        <div className="field-row">
          <div className="field">
            <label className="label" htmlFor="prof-first">First name</label>
            <input
              id="prof-first"
              className="input"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="prof-last">Last name</label>
            <input
              id="prof-last"
              className="input"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="prof-phone">Phone number</label>
          <input
            id="prof-phone"
            className="input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+63 917 123 4567"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="prof-region">Region / Province</label>
          <input
            id="prof-region"
            className="input"
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Region III - Central Luzon"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="prof-address">Address</label>
          <textarea
            id="prof-address"
            className="input input-textarea"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, Barangay, City, Province"
            rows={3}
          />
        </div>

        {msgType === 'success' && <div className="success-box">{msgText}</div>}
        {msgType === 'error' && <div className="error-box">{msgText}</div>}

        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? <Spinner size={20} /> : 'Save changes'}
        </button>
      </form>
    </div>
  );
};
