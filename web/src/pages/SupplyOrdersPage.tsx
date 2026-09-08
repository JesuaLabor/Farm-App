import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supplyApi } from '../api/supply';
import { getImageUrl } from '../api';
import type { PaymentMethod, PaymentStatus, SupplyOrder, SupplyOrderStatus } from '../types/supply';

const getSupplyFallback = (name: string = ''): string => {
  const n = name.toLowerCase();
  if (n.includes('urea') || n.includes('fertilizer') || n.includes('14-14-14') || n.includes('complete') || n.includes('potash')) {
    return 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('seed') || n.includes('binhi') || n.includes('hybrid')) {
    return 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('spray') || n.includes('insecticide') || n.includes('fungicide') || n.includes('herbicide') || n.includes('pest')) {
    return 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('tool') || n.includes('shovel') || n.includes('hoe') || n.includes('rake') || n.includes('bato') || n.includes('tulo')) {
    return 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80';
  }
  return 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80';
};

// ── Fulfillment status badge config ─────────────────────────────────────────
const statusBadges: Record<SupplyOrderStatus, { label: string; bg: string; color: string; icon: string }> = {
  pending:       { label: 'Order Placed · Pending Confirmation', bg: '#fef9c3', color: '#854d0e', icon: '📝' },
  processing:    { label: 'Processing in Warehouse',           bg: '#dbeafe', color: '#1e40af', icon: '📦' },
  shipped_ready: { label: 'Shipped / Ready for Pickup',        bg: '#e0e7ff', color: '#3730a3', icon: '🚚' },
  completed:     { label: 'Order Completed & Delivered',       bg: '#dcfce7', color: '#166534', icon: '✓' },
  cancelled:     { label: 'Order Cancelled',                   bg: '#fee2e2', color: '#991b1b', icon: '✕' },
};

// ── Payment status badge config ──────────────────────────────────────────────
const paymentStatusBadges: Record<PaymentStatus, { label: string; bg: string; color: string; icon: string }> = {
  pending_payment: { label: 'Awaiting Payment', bg: '#fef9c3', color: '#92400e', icon: '⏳' },
  paid:            { label: 'Paid',             bg: '#dcfce7', color: '#166534', icon: '✅' },
  failed:          { label: 'Payment Failed',   bg: '#fee2e2', color: '#991b1b', icon: '❌' },
  refunded:        { label: 'Refunded',         bg: '#f1f5f9', color: '#475569', icon: '↩️' },
};

// ── Payment method display config ────────────────────────────────────────────
const paymentMethodLabels: Record<PaymentMethod, { label: string; icon: string }> = {
  cod:           { label: 'Cash on Delivery (COD)', icon: '💵' },
  gcash:         { label: 'GCash',                  icon: '📱' },
  maya:          { label: 'Maya',                   icon: '💜' },
  bank_transfer: { label: 'Bank Transfer',          icon: '🏦' },
  card:          { label: 'Credit / Debit Card',    icon: '💳' },
};

const STEP_ORDER: SupplyOrderStatus[] = ['pending', 'processing', 'shipped_ready', 'completed'];

export const SupplyOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  const [orders, setOrders] = useState<SupplyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: string, status: SupplyOrderStatus) => {
    setUpdatingStatusId(id);
    try {
      await supplyApi.updateOrderStatus(id, status);
      toastSuccess('Status Updated', `Order status progressed to ${status.replace('_', ' ')}.`);
      await fetchOrders();
    } catch (err: any) {
      toastError('Update Failed', err.response?.data?.error || 'Failed to update order status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleMarkCODPaid = async (orderId: string) => {
    setMarkingPaid(orderId);
    try {
      await supplyApi.updatePaymentStatus(orderId, {
        paymentStatus: 'paid',
        paymentNote: `COD confirmed on ${new Date().toLocaleDateString('en-PH', { dateStyle: 'medium' })}`,
      });
      toastSuccess('Payment Confirmed', 'Cash on Delivery payment has been verified as paid.');
      await fetchOrders();
    } catch (err: any) {
      toastError('Payment Update Failed', err.response?.data?.error || 'Failed to confirm payment');
    } finally {
      setMarkingPaid(null);
    }
  };

  // Filter orders based on active tab
  const filteredOrders = orders.filter((order) => {
    if (filterTab === 'active') {
      return order.status === 'pending' || order.status === 'processing' || order.status === 'shipped_ready';
    }
    if (filterTab === 'completed') {
      return order.status === 'completed';
    }
    if (filterTab === 'cancelled') {
      return order.status === 'cancelled';
    }
    return true;
  });

  const activeCount = orders.filter((o) => o.status === 'pending' || o.status === 'processing' || o.status === 'shipped_ready').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;

  const isSupplier = user?.role === 'supplier';
  const isFarmer = user?.role === 'farmer';

  return (
    <div className="app-container" style={{ paddingBottom: '60px' }}>
      {/* ─── Order Category Navigation Switcher ─── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '22px', flexWrap: 'wrap' }}>
        {!isSupplier && (
          <button
            type="button"
            onClick={() => navigate('/produce/orders')}
            style={{
              padding: '10px 22px',
              borderRadius: '24px',
              border: '2px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#64748b',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#176B3A';
              e.currentTarget.style.color = '#0E4A27';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <span>{isFarmer ? '🌾 Crop Sales Orders' : '🌱 My Produce Purchases'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => navigate('/supply/orders')}
          style={{
            padding: '10px 22px',
            borderRadius: '24px',
            border: '2px solid #ca8a04',
            backgroundColor: '#FBF6EE',
            color: '#854d0e',
            fontWeight: 800,
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(202, 138, 4, 0.15)',
          }}
        >
          <span>{isSupplier ? '📦 Customer Supply Orders' : '🏪 My Supply Purchases'}</span>
          <span style={{
            backgroundColor: '#ca8a04',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '10px',
          }}>
            {orders.length}
          </span>
        </button>
      </div>

      {/* ─── Page Header ─── */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <span style={{ fontSize: '32px' }}>{isSupplier ? '📦' : '🏪'}</span>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0E4A27', margin: 0 }}>
              {isSupplier ? 'Customer Supply Orders' : 'My Supply Purchases'}
            </h1>
          </div>
          <p style={{ fontSize: '16px', color: '#525450', margin: 0 }}>
            {isSupplier
              ? 'Fulfill incoming fertilizer, seed, and input orders from farmers and buyers, manage packing, and dispatch couriers.'
              : 'Track fertilizers, seeds, tools, and farm equipment ordered from certified suppliers across Northern Mindanao.'}
          </p>
        </div>

        <button
          onClick={() => navigate('/supply')}
          className="btn btn-primary"
          style={{ padding: '10px 20px', fontSize: '15px', fontWeight: 700 }}
        >
          {isSupplier ? 'View Supply Catalog' : '+ Browse Supply Store'}
        </button>
      </div>

      {/* ─── Status Filter Tabs ─── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterTab('all')}
          style={{
            padding: '8px 18px',
            borderRadius: '20px',
            border: `1.5px solid ${filterTab === 'all' ? '#176B3A' : '#e2e8f0'}`,
            backgroundColor: filterTab === 'all' ? '#176B3A' : '#ffffff',
            color: filterTab === 'all' ? '#ffffff' : '#475569',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          All Orders ({orders.length})
        </button>

        <button
          onClick={() => setFilterTab('active')}
          style={{
            padding: '8px 18px',
            borderRadius: '20px',
            border: `1.5px solid ${filterTab === 'active' ? '#ca8a04' : '#e2e8f0'}`,
            backgroundColor: filterTab === 'active' ? '#ca8a04' : '#ffffff',
            color: filterTab === 'active' ? '#ffffff' : '#475569',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Active / In Transit ({activeCount})
        </button>

        <button
          onClick={() => setFilterTab('completed')}
          style={{
            padding: '8px 18px',
            borderRadius: '20px',
            border: `1.5px solid ${filterTab === 'completed' ? '#16a34a' : '#e2e8f0'}`,
            backgroundColor: filterTab === 'completed' ? '#16a34a' : '#ffffff',
            color: filterTab === 'completed' ? '#ffffff' : '#475569',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Completed ({completedCount})
        </button>

        <button
          onClick={() => setFilterTab('cancelled')}
          style={{
            padding: '8px 18px',
            borderRadius: '20px',
            border: `1.5px solid ${filterTab === 'cancelled' ? '#dc2626' : '#e2e8f0'}`,
            backgroundColor: filterTab === 'cancelled' ? '#dc2626' : '#ffffff',
            color: filterTab === 'cancelled' ? '#ffffff' : '#475569',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Cancelled
        </button>
      </div>

      {/* ─── Orders List ─── */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '36px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
          <p style={{ marginTop: '12px', fontSize: '16px', fontWeight: 600 }}>Loading your supply orders…</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '20px' }}>
          <span style={{ fontSize: '56px' }}>📦</span>
          <h3 style={{ marginTop: '16px', fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
            No {filterTab !== 'all' ? filterTab : ''} supply orders found
          </h3>
          <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '460px', margin: '8px auto 24px' }}>
            When you purchase certified fertilizers, seeds, tools, or farm equipment from certified suppliers, you can track their shipping and delivery live right here.
          </p>
          <button
            onClick={() => navigate('/supply')}
            className="btn btn-primary btn-large"
            style={{ padding: '12px 28px', fontSize: '16px', fontWeight: 800 }}
          >
            Browse Supply Store →
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '22px' }}>
          {filteredOrders.map((order) => {
            const fulfillBadge = statusBadges[order.status] || statusBadges.pending;
            const payBadge = paymentStatusBadges[order.paymentStatus] ?? paymentStatusBadges['pending_payment'];
            const payMethod = paymentMethodLabels[order.paymentMethod] ?? { label: order.paymentMethod, icon: '💳' };
            const isSupplier = user?.id === order.supplierId;
            const isBuyer = user?.id === order.buyerId;

            const currentStepIdx = STEP_ORDER.indexOf(order.status);
            const isCancelled = order.status === 'cancelled';

            const canMarkCODPaid =
              isSupplier &&
              order.paymentMethod === 'cod' &&
              order.paymentStatus === 'pending_payment' &&
              (order.status === 'shipped_ready' || order.status === 'completed');

            const orderDateStr = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('en-PH', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recently';

            return (
              <div
                key={order.id}
                className="card"
                style={{
                  padding: '24px',
                  borderRadius: '18px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  border: '1.5px solid #e2e8f0',
                }}
              >
                {/* Header Row: ID, Date, Amount */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                        Order #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        padding: '4px 12px',
                        borderRadius: '12px',
                        backgroundColor: fulfillBadge.bg,
                        color: fulfillBadge.color,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}>
                        <span>{fulfillBadge.icon}</span>
                        <span>{fulfillBadge.label}</span>
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                      Placed on {orderDateStr} · Supplier: <strong>{order.supplierName}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#ca8a04' }}>
                      ₱{order.totalAmount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                      🚚 {order.deliveryMethod === 'delivery' ? 'Home / Farm Delivery' : 'Store Pickup'}
                    </div>
                  </div>
                </div>

                {/* Live Tracking Progress Bar (Shopee style timeline) */}
                {!isCancelled && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ marginBottom: '14px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Live Fulfillment Timeline
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                      {[
                        { step: 'pending', title: '1. Order Placed' },
                        { step: 'processing', title: '2. Warehouse Packing' },
                        { step: 'shipped_ready', title: '3. Out for Delivery' },
                        { step: 'completed', title: '4. Delivered & Done' },
                      ].map((s, idx) => {
                        const stepIndex = STEP_ORDER.indexOf(s.step as SupplyOrderStatus);
                        const isDone = currentStepIdx >= stepIndex;
                        const isCurrent = currentStepIdx === stepIndex;
                        const isNextStep = isSupplier && !isCancelled && order.status !== 'completed' && stepIndex === currentStepIdx + 1;

                        const tooltipText = isNextStep
                          ? `Click to advance order to: ${s.title}`
                          : isCurrent
                          ? `Current Status: ${s.title}`
                          : isDone
                          ? `Completed: ${s.title}`
                          : `Locked: Complete previous steps first`;

                        return (
                          <div
                            key={s.step}
                            onClick={() => {
                              if (isNextStep && updatingStatusId !== order.id) {
                                handleUpdateStatus(order.id, s.step as SupplyOrderStatus);
                              }
                            }}
                            title={tooltipText}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              flex: 1,
                              position: 'relative',
                              zIndex: 2,
                              cursor: isNextStep ? 'pointer' : 'default',
                            }}
                          >
                            <div
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                backgroundColor: isDone
                                  ? (isCurrent ? '#ca8a04' : '#16a34a')
                                  : isNextStep
                                  ? '#fef3c7'
                                  : '#e2e8f0',
                                color: isDone
                                  ? '#ffffff'
                                  : isNextStep
                                  ? '#ca8a04'
                                  : '#94a3b8',
                                border: isNextStep ? '2px dashed #ca8a04' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '14px',
                                boxShadow: isCurrent
                                  ? '0 0 0 4px rgba(202, 138, 4, 0.25)'
                                  : isNextStep
                                  ? '0 0 0 3px rgba(202, 138, 4, 0.15)'
                                  : 'none',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              {isDone ? (s.step === 'completed' ? '✓' : idx + 1) : idx + 1}
                            </div>
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: isCurrent ? 800 : isNextStep ? 700 : 600,
                                color: isCurrent ? '#854d0e' : isDone ? '#166534' : isNextStep ? '#b45309' : '#94a3b8',
                                marginTop: '6px',
                                textAlign: 'center',
                              }}
                            >
                              {s.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Items Breakdown */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <div style={{ padding: '10px 16px', backgroundColor: '#f8fafc', fontSize: '12px', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                    ORDERED ITEMS ({order.items.length})
                  </div>
                  <div style={{ padding: '8px 16px' }}>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 0',
                          borderBottom: idx < order.items.length - 1 ? '1px solid #f1f5f9' : 'none',
                          fontSize: '14px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '10px',
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            }}
                          >
                            <img
                              src={getImageUrl(item.productImage, getSupplyFallback(item.productName))}
                              alt={item.productName}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                if (target.parentElement) {
                                  target.parentElement.innerHTML = '<span style="font-size: 20px;">📦</span>';
                                }
                              }}
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.productName}</div>
                            <div style={{ color: '#64748b', fontSize: '12.5px', marginTop: '2px' }}>
                              ₱{item.pricePerItem.toLocaleString()} × {item.quantity}
                            </div>
                          </div>
                        </div>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>
                          ₱{(item.quantity * item.pricePerItem).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery & Payment Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '13px' }}>
                  <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>DELIVERY DETAILS</div>
                    <div style={{ color: '#0f172a', fontWeight: 600 }}>
                      Method: {order.deliveryMethod === 'delivery' ? 'Home / Farm Delivery' : 'Store Pickup'}
                    </div>
                    {order.deliveryAddress && (
                      <div style={{ color: '#475569', marginTop: '4px' }}>
                        Address: <strong>{order.deliveryAddress}</strong>
                      </div>
                    )}
                    <div style={{ color: '#475569', marginTop: '2px' }}>
                      Farmer (Buyer): <strong>{order.buyerName}</strong> {isBuyer && <span style={{ color: '#ca8a04' }}>(You)</span>}
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>PAYMENT DETAILS</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{payMethod.icon}</span>
                      <strong style={{ color: '#0f172a' }}>{payMethod.label}</strong>
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
                    {order.paymentNote && (
                      <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginTop: '4px' }}>
                        {order.paymentNote}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons for Buyer (Farmer) and Supplier */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap', paddingTop: '4px' }}>
                  {/* Farmer / Buyer can mark as received when shipped */}
                  {isBuyer && order.status === 'shipped_ready' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'completed')}
                      disabled={updatingStatusId === order.id}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        fontWeight: 800,
                        border: 'none',
                        cursor: updatingStatusId === order.id ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                      }}
                    >
                      {updatingStatusId === order.id ? 'Updating…' : '✓ Confirm Received & Complete Order'}
                    </button>
                  )}

                  {/* Supplier fulfillment workflow actions */}
                  {isSupplier && order.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'processing')}
                      disabled={updatingStatusId === order.id}
                      style={{
                        padding: '9px 18px',
                        borderRadius: '9px',
                        backgroundColor: '#ca8a04',
                        color: '#fff',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      ▶ Start Processing
                    </button>
                  )}

                  {isSupplier && order.status === 'processing' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'shipped_ready')}
                      disabled={updatingStatusId === order.id}
                      style={{
                        padding: '9px 18px',
                        borderRadius: '9px',
                        backgroundColor: '#3730a3',
                        color: '#fff',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      🚚 Mark Shipped / Ready
                    </button>
                  )}

                  {isSupplier && order.status === 'shipped_ready' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'completed')}
                      disabled={updatingStatusId === order.id}
                      style={{
                        padding: '9px 18px',
                        borderRadius: '9px',
                        backgroundColor: '#16a34a',
                        color: '#fff',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      ✓ Mark as Completed
                    </button>
                  )}

                  {/* Supplier COD Confirmation */}
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

                  {/* Cancel Order (Buyer or Supplier can cancel pending/processing orders) */}
                  {(order.status === 'pending' || (isSupplier && order.status === 'processing')) && (
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to cancel this supply order? Reserved supplies will be restored to inventory.')) {
                          await handleUpdateStatus(order.id, 'cancelled');
                        }
                      }}
                      disabled={updatingStatusId === order.id}
                      style={{
                        padding: '9px 16px',
                        borderRadius: '9px',
                        border: '1.5px solid #fecaca',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      ✕ Cancel Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
