import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supplyApi } from '../api/supply';
import type { PaymentMethod, PaymentStatus, SupplyOrder, SupplyOrderStatus } from '../types/supply';

// ── Fulfillment status badge config ─────────────────────────────────────────
const statusBadges: Record<SupplyOrderStatus, { label: string; bg: string; color: string }> = {
  pending:       { label: 'PENDING PROCESSING',          bg: '#fef9c3', color: '#854d0e' },
  processing:    { label: 'PROCESSING IN WAREHOUSE',     bg: '#dbeafe', color: '#1e40af' },
  shipped_ready: { label: 'SHIPPED / READY FOR PICKUP',  bg: '#e0e7ff', color: '#3730a3' },
  completed:     { label: 'COMPLETED',                   bg: '#dcfce7', color: '#166534' },
  cancelled:     { label: 'CANCELLED',                   bg: '#fee2e2', color: '#991b1b' },
};

// ── Payment status badge config ──────────────────────────────────────────────
const paymentStatusBadges: Record<PaymentStatus, { label: string; bg: string; color: string; icon: string }> = {
  pending_payment: { label: 'AWAITING PAYMENT', bg: '#fef9c3', color: '#92400e', icon: '⏳' },
  paid:            { label: 'PAID',             bg: '#dcfce7', color: '#166534', icon: '✅' },
  failed:          { label: 'PAYMENT FAILED',   bg: '#fee2e2', color: '#991b1b', icon: '❌' },
  refunded:        { label: 'REFUNDED',         bg: '#f1f5f9', color: '#475569', icon: '↩️' },
};

// ── Payment method display config ────────────────────────────────────────────
const paymentMethodLabels: Record<PaymentMethod, { label: string; icon: string }> = {
  cod:           { label: 'Cash on Delivery', icon: '💵' },
  gcash:         { label: 'GCash',            icon: '📱' },
  maya:          { label: 'Maya',             icon: '💜' },
  bank_transfer: { label: 'Bank Transfer',    icon: '🏦' },
  card:          { label: 'Card',             icon: '💳' },
};

export const SupplyOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<SupplyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null); // orderId being marked

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await supplyApi.listOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load supply orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleUpdateStatus = async (id: string, status: SupplyOrderStatus) => {
    try {
      await supplyApi.updateOrderStatus(id, status);
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update order status');
    }
  };

  // Supplier marks COD order as paid upon delivery confirmation
  const handleMarkCODPaid = async (orderId: string) => {
    setMarkingPaid(orderId);
    try {
      await supplyApi.updatePaymentStatus(orderId, {
        paymentStatus: 'paid',
        paymentNote: `COD confirmed by supplier on ${new Date().toLocaleDateString('en-PH', { dateStyle: 'medium' })}`,
      });
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to confirm payment');
    } finally {
      setMarkingPaid(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Agri-Supply Orders
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
          Track input orders, fulfillment status, and payment confirmation.
        </p>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading supply orders…</div>
        ) : orders.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', borderRadius: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '48px' }}>📦</span>
            <h3 style={{ marginTop: '12px', fontSize: '18px' }}>No Orders Found</h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Agri-supply orders will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {orders.map((order) => {
              const fulfillBadge = statusBadges[order.status];
              const payBadge = paymentStatusBadges[order.paymentStatus] ?? paymentStatusBadges['pending_payment'];
              const payMethod = paymentMethodLabels[order.paymentMethod] ?? { label: order.paymentMethod, icon: '💳' };
              const isSupplier = user?.id === order.supplierId;
              const isBuyer = user?.id === order.buyerId;

              // Supplier can mark COD paid when order is shipped/ready or completed and still unpaid
              const canMarkCODPaid =
                isSupplier &&
                order.paymentMethod === 'cod' &&
                order.paymentStatus === 'pending_payment' &&
                (order.status === 'shipped_ready' || order.status === 'completed');

              return (
                <div key={order.id} className="glass-panel" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* ── Header Row ──────────────────────────── */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      {/* Fulfillment status */}
                      <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', backgroundColor: fulfillBadge.bg, color: fulfillBadge.color }}>
                        {fulfillBadge.label}
                      </span>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '8px', marginBottom: 0 }}>
                        Order #{order.id.slice(-6).toUpperCase()} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </h3>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: '#ca8a04' }}>
                        ₱{order.totalAmount.toLocaleString()}
                      </div>
                      {/* Delivery method */}
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        🚚 {order.deliveryMethod === 'delivery' ? 'Delivery' : 'Store Pickup'}
                      </div>
                    </div>
                  </div>

                  {/* ── Payment Info Row ─────────────────────── */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '10px', flexWrap: 'wrap' }}>
                    {/* Payment method pill */}
                    <span style={{ fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', color: '#334155' }}>
                      {payMethod.icon} {payMethod.label}
                    </span>

                    <span style={{ color: '#cbd5e1' }}>·</span>

                    {/* Payment status badge */}
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 9px',
                      borderRadius: '10px',
                      backgroundColor: payBadge.bg,
                      color: payBadge.color,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      {payBadge.icon} {payBadge.label}
                    </span>

                    {/* Payment note (e.g. COD confirmation timestamp) */}
                    {order.paymentNote && (
                      <>
                        <span style={{ color: '#cbd5e1' }}>·</span>
                        <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>{order.paymentNote}</span>
                      </>
                    )}
                  </div>

                  {/* ── Item List ────────────────────────────── */}
                  <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '12px', fontSize: '13px' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: idx < order.items.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                        <span>{item.quantity} × {item.productName}</span>
                        <span style={{ fontWeight: 600 }}>₱{(item.quantity * item.pricePerItem).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* ── Buyer / Supplier / Address ───────────── */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px', color: '#475569' }}>
                    <div>
                      <p style={{ margin: 0 }}><strong>Farmer (Buyer):</strong> {order.buyerName} {isBuyer && <span style={{ color: '#ca8a04' }}>(You)</span>}</p>
                      {order.deliveryAddress && (
                        <p style={{ margin: '4px 0 0 0' }}><strong>Deliver to:</strong> {order.deliveryAddress}</p>
                      )}
                    </div>
                    <div>
                      <p style={{ margin: 0 }}><strong>Supplier:</strong> {order.supplierName} {isSupplier && <span style={{ color: '#ca8a04' }}>(You)</span>}</p>
                    </div>
                  </div>

                  {/* ── Action Buttons ───────────────────────── */}
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: '4px' }}>

                    {/* Fulfillment actions (supplier) */}
                    {isSupplier && order.status === 'pending' && (
                      <button onClick={() => handleUpdateStatus(order.id, 'processing')} style={{ padding: '9px 18px', borderRadius: '9px', backgroundColor: '#ca8a04', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                        ▶ Start Processing
                      </button>
                    )}
                    {isSupplier && order.status === 'processing' && (
                      <button onClick={() => handleUpdateStatus(order.id, 'shipped_ready')} style={{ padding: '9px 18px', borderRadius: '9px', backgroundColor: '#3730a3', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                        🚚 Mark Shipped / Ready
                      </button>
                    )}
                    {(isSupplier || isBuyer) && order.status === 'shipped_ready' && (
                      <button onClick={() => handleUpdateStatus(order.id, 'completed')} style={{ padding: '9px 18px', borderRadius: '9px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                        ✓ Mark as Completed
                      </button>
                    )}

                    {/* COD Payment confirmation (supplier) */}
                    {canMarkCODPaid && (
                      <button
                        onClick={() => handleMarkCODPaid(order.id)}
                        disabled={markingPaid === order.id}
                        style={{
                          padding: '9px 18px',
                          borderRadius: '9px',
                          backgroundColor: markingPaid === order.id ? '#a3a3a3' : '#166534',
                          color: '#fff',
                          fontWeight: 700,
                          border: 'none',
                          cursor: markingPaid === order.id ? 'not-allowed' : 'pointer',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        💵 {markingPaid === order.id ? 'Confirming…' : 'Confirm COD Payment Received'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
