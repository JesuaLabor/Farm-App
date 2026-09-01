import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { api } from '../api';
import { supplyApi } from '../api/supply';
import type { SupplyOrder, PaymentMethod, PaymentStatus } from '../types/supply';

const philippineRegions = [
  'NCR - National Capital Region',
  'CAR - Cordillera Administrative Region',
  'Region I - Ilocos Region',
  'Region II - Cagayan Valley',
  'Region III - Central Luzon',
  'Region IV-A - CALABARZON',
  'MIMAROPA Region',
  'Region V - Bicol Region',
  'Region VI - Western Visayas',
  'Region VII - Central Visayas',
  'Region VIII - Eastern Visayas',
  'Region IX - Zamboanga Peninsula',
  'Region X - Northern Mindanao',
  'Region XI - Davao Region',
  'Region XII - SOCCSKSARGEN',
  'Region XIII - Caraga',
  'BARMM - Bangsamoro Autonomous Region',
];

const roleLabelMap: Record<string, string> = {
  farmer:    'Farmer Producer',
  buyer:     'Wholesale Buyer',
  supplier:  'Agri Supplier',
  expert:    'Agronomist Expert',
  lgu_staff: 'LGU Officer',
};

type PurchaseTab = 'to_ship' | 'to_receive' | 'completed' | 'cancelled' | 'refunded';

const purchaseTabs: { key: PurchaseTab; label: string; icon: string }[] = [
  { key: 'to_ship',    label: 'To Ship',         icon: '📦' },
  { key: 'to_receive', label: 'To Receive',      icon: '🚚' },
  { key: 'completed',  label: 'Completed',       icon: '✅' },
  { key: 'cancelled',  label: 'Cancelled',       icon: '❌' },
  { key: 'refunded',   label: 'Return / Refund', icon: '↩️' },
];

const paymentMethodLabels: Record<PaymentMethod, { label: string; icon: string }> = {
  cod:           { label: 'Cash on Delivery', icon: '💵' },
  gcash:         { label: 'GCash',            icon: '📱' },
  maya:          { label: 'Maya',             icon: '💜' },
  bank_transfer: { label: 'Bank Transfer',    icon: '🏦' },
  card:          { label: 'Card',             icon: '💳' },
};

const paymentStatusBadges: Record<PaymentStatus, { label: string; bg: string; color: string; icon: string }> = {
  pending_payment: { label: 'AWAITING PAYMENT', bg: '#fef9c3', color: '#92400e', icon: '⏳' },
  paid:            { label: 'PAID',             bg: '#dcfce7', color: '#166534', icon: '✅' },
  failed:          { label: 'PAYMENT FAILED',   bg: '#fee2e2', color: '#991b1b', icon: '❌' },
  refunded:        { label: 'REFUNDED',         bg: '#f1f5f9', color: '#475569', icon: '↩️' },
};

export const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [region, setRegion] = useState(user?.region || '');
  const [address, setAddress] = useState(user?.address || '');

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Purchases state
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
      const data = await supplyApi.listOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders for profile:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await api.updateProfile({ firstName, lastName, phone, region, address });
      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      await api.uploadPhoto(file);
      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile photo updated successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Photo upload failed.' });
    } finally {
      setUploading(false);
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
    <div className="page-root">
      <Navbar />

      <main className="page-main" style={{ maxWidth: '850px' }}>
        {/* ── Page Header ─────────────────────────────────────── */}
        <div className="page-header-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span className="page-header-label">Account settings</span>
            <h1 className="page-header-title">Personal profile</h1>
            <p className="page-header-sub">
              Manage your profile details, contact information, and view your purchase history.
            </p>
          </div>
        </div>

        {message && (
          <div className={`feedback-box feedback-box--${message.type}`}>
            {message.text}
          </div>
        )}

        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Avatar & Role Header Card */}
          <div className="card-elevated" style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-accent)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: 800,
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {user.photoUrl ? (
                  <img src={`http://localhost:8080${user.photoUrl}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.firstName[0]?.toUpperCase()
                )}
              </div>

              <label
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--green-700)',
                  color: '#fff',
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}
                title="Upload photo"
              >
                📷
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} disabled={uploading} />
              </label>
            </div>

            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                {user.firstName} {user.lastName}
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: '2px 0 10px 0' }}>
                {user.email}
              </p>
              <span className="badge badge-green">
                {roleLabelMap[user.role] ?? user.role}
              </span>
              {uploading && (
                <span style={{ fontSize: '13px', color: 'var(--color-accent)', marginLeft: '12px', fontWeight: 600 }}>
                  Uploading photo…
                </span>
              )}
            </div>
          </div>

          {/* ── My Purchases Section (for Farmer / Buyer) ────── */}
          {(user.role === 'farmer' || user.role === 'buyer') && (
            <div className="card-elevated">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="text-title" style={{ margin: 0 }}>
                  🛍️ My Purchases
                </h3>
                <a href="/supply/orders" style={{ fontSize: '13px', color: '#ca8a04', fontWeight: 700, textDecoration: 'none' }}>
                  View All Orders →
                </a>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', overflowX: 'auto' }}>
                {purchaseTabs.map((tab) => {
                  const count = getOrdersForTab(tab.key).length;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: isActive ? '#fef9c3' : '#f8fafc',
                        color: isActive ? '#854d0e' : '#64748b',
                        fontWeight: isActive ? 700 : 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                      {count > 0 && (
                        <span style={{
                          backgroundColor: isActive ? '#ca8a04' : '#cbd5e1',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: '10px',
                          lineHeight: 1,
                        }}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div style={{ marginTop: '16px' }}>
                {ordersLoading ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    Loading purchases…
                  </div>
                ) : currentTabOrders.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛒</div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>No orders in "{purchaseTabs.find(t => t.key === activeTab)?.label}"</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {currentTabOrders.map((order) => {
                      const payMethod = paymentMethodLabels[order.paymentMethod] ?? { label: order.paymentMethod, icon: '💳' };
                      const payBadge = paymentStatusBadges[order.paymentStatus] ?? paymentStatusBadges['pending_payment'];

                      return (
                        <div
                          key={order.id}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#fff',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                                Order #{order.id.slice(-6).toUpperCase()}
                              </span>
                              <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>
                                · Supplier: {order.supplierName}
                              </span>
                            </div>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '8px',
                              backgroundColor: payBadge.bg,
                              color: payBadge.color,
                            }}>
                              {payBadge.icon} {payBadge.label}
                            </span>
                          </div>

                          <div style={{ fontSize: '13px', color: '#475569', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '8px' }}>
                            {order.items.map((i, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{i.quantity} × {i.productName}</span>
                                <span style={{ fontWeight: 600 }}>₱{(i.quantity * i.pricePerItem).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                            <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {payMethod.icon} {payMethod.label} · 🚚 {order.deliveryMethod}
                            </span>
                            <span style={{ fontSize: '15px', fontWeight: 800, color: '#ca8a04' }}>
                              Total: ₱{order.totalAmount.toLocaleString()}
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

          {/* Details Form Card */}
          <div className="card-elevated">
            <h3 className="text-title" style={{ marginBottom: '20px' }}>
              Personal information
            </h3>

            <form onSubmit={handleUpdateProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                <div className="form-field">
                  <label className="form-label">First name</label>
                  <input
                    className="form-input"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Last name</label>
                  <input
                    className="form-input"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                <div className="form-field">
                  <label className="form-label">Phone number</label>
                  <input
                    className="form-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+63 917 123 4567"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Region / Province</label>
                  <select
                    className="form-input"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    <option value="">Select Region</option>
                    {philippineRegions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Full address</label>
                <textarea
                  className="form-input form-textarea"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, Barangay, City, Province"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn btn--primary"
                style={{ marginTop: '8px' }}
              >
                {saving ? 'Saving changes…' : 'Save profile changes'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
