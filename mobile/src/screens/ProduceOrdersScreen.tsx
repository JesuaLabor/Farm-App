import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/Spinner';

interface ProduceTx {
  id: string;
  listingId: string;
  cropName: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  contactMessage?: string;
  createdAt: string;
}

const TABS = ['All', 'pending', 'confirmed', 'completed', 'cancelled'] as const;

export const ProduceOrdersScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<ProduceTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<typeof TABS[number]>('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.listProduceTransactions();
      setOrders(data || []);
    } catch (err: any) {
      console.warn('Failed to load produce transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    setUpdatingId(orderId);
    setFeedback(null);
    try {
      await api.updateProduceTransactionStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      setFeedback({
        ok: true,
        text: `Order status updated to ${status}.`,
      });
      setTimeout(() => setFeedback(null), 2500);
    } catch (err: any) {
      setFeedback({
        ok: false,
        text: err.response?.data?.error || 'Failed to update order status.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (selectedTab === 'All') return true;
    return o.status === selectedTab;
  });

  const getStatusBadge = (status: ProduceTx['status']) => {
    switch (status) {
      case 'pending':
        return <span className="pending-badge" style={{ background: '#fef3c7', color: '#b45309' }}>⏳ Pending</span>;
      case 'confirmed':
        return <span className="category-badge" style={{ background: '#dbeafe', color: '#1d4ed8' }}>✓ Confirmed</span>;
      case 'completed':
        return <span className="category-badge" style={{ background: '#dcfce7', color: '#15803d' }}>★ Completed</span>;
      case 'cancelled':
        return <span className="pending-badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>✕ Cancelled</span>;
    }
  };

  return (
    <div>
      {/* ── Top Bar ──────────────────────────────────────────── */}
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate('/marketplace')}>
          <span>←</span> Marketplace
        </button>
        <div className="top-bar-title">Crop Orders</div>
        <div style={{ width: 40 }} />
      </div>

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <div className="chips-wrapper">
        <div className="chips-scroll">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`chip ${selectedTab === tab ? 'active' : ''}`}
              onClick={() => setSelectedTab(tab)}
              style={{ textTransform: 'capitalize' }}
            >
              {tab === 'All' ? 'All Orders' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Feedback Banner ──────────────────────────────────── */}
      {feedback && (
        <div style={{
          margin: '10px 16px 0',
          padding: '10px 14px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          backgroundColor: feedback.ok ? '#dcfce7' : '#fee2e2',
          color: feedback.ok ? '#166534' : '#991b1b',
        }}>
          {feedback.text}
        </div>
      )}

      {/* ── Orders List ──────────────────────────────────────── */}
      <div className="scroll-content">
        {loading ? (
          <Spinner />
        ) : filteredOrders.length === 0 ? (
          <div className="empty-card">
            <div className="empty-icon">📦</div>
            <div className="empty-title">No crop orders found</div>
            <div className="empty-desc">
              {selectedTab === 'All'
                ? 'Your harvest purchases and sales orders will appear here.'
                : `No orders currently in "${selectedTab}" status.`}
            </div>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const isBuyer = user && (ord.buyerId === user.id || ord.buyerName?.toLowerCase() === `${user.firstName} ${user.lastName}`.toLowerCase());
            const isSeller = user && (ord.farmerId === user.id || ord.farmerName?.toLowerCase() === `${user.firstName} ${user.lastName}`.toLowerCase());
            const dateStr = ord.createdAt
              ? new Date(ord.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'Recent';

            return (
              <div key={ord.id} className="listing-card" style={{ padding: 16 }}>
                <div className="listing-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {getStatusBadge(ord.status)}
                    <span style={{ fontSize: 11, color: '#64748b' }}>#{ord.id.slice(-6).toUpperCase()}</span>
                  </div>
                  <span className="empty-desc" style={{ fontSize: 12 }}>{dateStr}</span>
                </div>

                <div className="quick-title" style={{ marginTop: 6, fontSize: 16 }}>{ord.cropName}</div>

                <div style={{ fontSize: 13, color: '#475569', margin: '4px 0 8px' }}>
                  {isSeller ? (
                    <span>Buyer: <strong>{ord.buyerName}</strong></span>
                  ) : (
                    <span>Farmer: <strong>{ord.farmerName}</strong></span>
                  )}
                </div>

                {ord.contactMessage && (
                  <div style={{
                    fontSize: 12,
                    color: '#64748b',
                    backgroundColor: '#f8fafc',
                    padding: '6px 10px',
                    borderRadius: 6,
                    marginBottom: 8,
                    border: '1px solid #f1f5f9',
                  }}>
                    💬 {ord.contactMessage}
                  </div>
                )}

                <div className="price-row" style={{ marginTop: 4 }}>
                  <span className="price-value" style={{ fontSize: 16 }}>₱{ord.totalPrice.toLocaleString()}</span>
                  <span className="price-unit"> ({ord.quantity} units @ ₱{ord.unitPrice})</span>
                </div>

                {/* ── Status Actions ── */}
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  {/* Buyer action: cancel if pending */}
                  {isBuyer && ord.status === 'pending' && (
                    <button
                      className="btn"
                      style={{
                        flex: 1,
                        fontSize: 12,
                        padding: 8,
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        border: '1px solid #fecdd3',
                        borderRadius: 8,
                        fontWeight: 700,
                      }}
                      disabled={updatingId === ord.id}
                      onClick={() => handleUpdateStatus(ord.id, 'cancelled')}
                    >
                      {updatingId === ord.id ? 'Cancelling...' : '✕ Cancel Request'}
                    </button>
                  )}

                  {/* Seller actions: confirm or cancel if pending */}
                  {isSeller && ord.status === 'pending' && (
                    <>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1, fontSize: 12, padding: 8 }}
                        disabled={updatingId === ord.id}
                        onClick={() => handleUpdateStatus(ord.id, 'confirmed')}
                      >
                        {updatingId === ord.id ? 'Updating...' : '✓ Confirm'}
                      </button>
                      <button
                        className="btn"
                        style={{
                          fontSize: 12,
                          padding: '8px 12px',
                          backgroundColor: '#f8fafc',
                          color: '#64748b',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                        }}
                        disabled={updatingId === ord.id}
                        onClick={() => handleUpdateStatus(ord.id, 'cancelled')}
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}

                  {/* Seller action: mark completed if confirmed */}
                  {isSeller && ord.status === 'confirmed' && (
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, fontSize: 12, padding: 8 }}
                      disabled={updatingId === ord.id}
                      onClick={() => handleUpdateStatus(ord.id, 'completed')}
                    >
                      {updatingId === ord.id ? 'Updating...' : '★ Mark Completed'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
