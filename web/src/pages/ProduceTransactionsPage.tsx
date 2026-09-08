import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { produceApi } from '../api/produce';

export interface OrderItem {
  id: string;
  isBackend?: boolean;
  buyerName: string;
  buyerLocation: string;
  farmerName?: string;
  product: string;
  quantityNum: number;
  quantity: string;
  unitPrice: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  date: string;
  contactMessage?: string;
}

export interface ParsedContactInfo {
  fulfillment: string;
  phone: string;
  payment: string;
  notes: string;
}

export function parseContactMessage(msg?: string): ParsedContactInfo {
  if (!msg) {
    return { fulfillment: 'Farm Delivery / Pickup', phone: '', payment: 'Cash on Delivery (COD)', notes: '' };
  }

  const parts = msg.split('•').map((p) => p.trim());
  let fulfillment = '';
  let phone = '';
  let payment = '';
  let notes = '';

  for (const part of parts) {
    if (part.toLowerCase().startsWith('fulfillment:')) {
      fulfillment = part.replace(/fulfillment:\s*/i, '').trim();
    } else if (part.toLowerCase().startsWith('phone:')) {
      phone = part.replace(/phone:\s*/i, '').trim();
    } else if (part.toLowerCase().startsWith('payment:')) {
      payment = part.replace(/payment:\s*/i, '').trim();
    } else if (part.toLowerCase().startsWith('notes:')) {
      notes = part.replace(/notes:\s*/i, '').trim();
    }
  }

  if (!fulfillment && !phone && !payment) {
    fulfillment = msg;
  }

  return {
    fulfillment: fulfillment || 'Farm-Gate Pickup',
    phone: phone || '',
    payment: payment || 'Cash on Delivery (COD)',
    notes: notes || '',
  };
}

export function getCropIcon(cropName: string = ''): string {
  const c = cropName.toLowerCase();
  if (c.includes('corn') || c.includes('mais')) return '🌽';
  if (c.includes('rice') || c.includes('palay') || c.includes('bugas') || c.includes('dinorado')) return '🌾';
  if (c.includes('tomato') || c.includes('kamatis')) return '🍅';
  if (c.includes('mango') || c.includes('mangga')) return '🥭';
  if (c.includes('banana') || c.includes('saging')) return '🍌';
  if (c.includes('potato') || c.includes('patatas') || c.includes('cassava') || c.includes('kamote')) return '🥔';
  if (c.includes('onion') || c.includes('sibuyas')) return '🧅';
  if (c.includes('garlic') || c.includes('ahos') || c.includes('bawang')) return '🧄';
  if (c.includes('cabbage') || c.includes('lettuce') || c.includes('pechay')) return '🥬';
  if (c.includes('eggplant') || c.includes('talong')) return '🍆';
  if (c.includes('chili') || c.includes('sili')) return '🌶️';
  return '🌱';
}

export function formatOrderId(id: string): string {
  if (id.length > 8) {
    return `#ORD-${id.slice(-6).toUpperCase()}`;
  }
  return `#ORD-${id}`;
}

export const ProduceTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const isFarmer = user?.role === 'farmer';
  const isBuyer = user?.role === 'buyer';

  const [selectedTab, setSelectedTab] = useState<'All Orders' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'>('All Orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const tabs: ('All Orders' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled')[] = [
    'All Orders',
    'Pending',
    'Confirmed',
    'Completed',
    'Cancelled',
  ];

  useEffect(() => {
    loadTransactions();
  }, [user?.id]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await produceApi.listTransactions();
      if (res && res.length > 0) {
        const mapped: OrderItem[] = res.map((t) => {
          const capStatus = (t.status.charAt(0).toUpperCase() + t.status.slice(1).toLowerCase()) as any;
          const d = new Date(t.createdAt);
          const timeStr = !isNaN(d.getTime())
            ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'Just now';
          return {
            id: t.id,
            isBackend: true,
            buyerName: t.buyerName || 'Buyer',
            buyerLocation: t.contactMessage || 'Northern Mindanao',
            farmerName: t.farmerName,
            product: t.cropName || 'Farm Produce',
            quantityNum: t.quantity,
            quantity: `${t.quantity} kg`,
            unitPrice: t.unitPrice || (t.totalPrice / (t.quantity || 1)),
            total: t.totalPrice,
            status: capStatus,
            date: timeStr,
            contactMessage: t.contactMessage,
          };
        });
        setOrders(mapped);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to load transactions', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    setIsUpdatingStatus(true);
    try {
      const target = orders.find((o) => o.id === orderId);
      if (target?.isBackend) {
        await produceApi.updateTransactionStatus(orderId, newStatus);
      }
      const capStatus = (newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase()) as any;
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: capStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: capStatus } : null));
      }
      toastSuccess('Order Status Updated', `Order #${orderId.slice(-6).toUpperCase()} marked as ${capStatus}.`);
    } catch (err) {
      console.error('Failed to update status', err);
      toastError('Update Failed', 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toastInfo('Copied to Clipboard', `Order ID #${id.slice(-6).toUpperCase()} copied.`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // KPI calculations
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const confirmedCount = orders.filter((o) => o.status === 'Confirmed').length;
  const completedCount = orders.filter((o) => o.status === 'Completed').length;
  const cancelledCount = orders.filter((o) => o.status === 'Cancelled').length;

  const totalRevenue = orders
    .filter((o) => o.status === 'Confirmed' || o.status === 'Completed')
    .reduce((sum, o) => sum + o.total, 0);

  // Filtering
  const filteredOrders = orders.filter((ord) => {
    const matchesTab = selectedTab === 'All Orders' || ord.status.toLowerCase() === selectedTab.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      ord.product.toLowerCase().includes(query) ||
      ord.buyerName.toLowerCase().includes(query) ||
      ord.id.toLowerCase().includes(query) ||
      (ord.contactMessage && ord.contactMessage.toLowerCase().includes(query));
    return matchesTab && matchesSearch;
  });

  const getStatusBadgeStyle = (status: OrderItem['status']) => {
    switch (status) {
      case 'Pending':
        return {
          bg: '#FEF9C3',
          border: '#FDE047',
          color: '#854D0E',
          dot: '#CA8A04',
          label: '⏳ Pending Confirmation',
        };
      case 'Confirmed':
        return {
          bg: '#EFF6FF',
          border: '#BFDBFE',
          color: '#1E40AF',
          dot: '#3B82F6',
          label: '🚚 Confirmed / In Delivery',
        };
      case 'Completed':
        return {
          bg: '#F0FDF4',
          border: '#BBF7D0',
          color: '#166534',
          dot: '#22C55E',
          label: '✓ Completed & Paid',
        };
      case 'Cancelled':
        return {
          bg: '#FEF2F2',
          border: '#FECACA',
          color: '#991B1B',
          dot: '#EF4444',
          label: '✕ Cancelled',
        };
    }
  };

  const getStatusBorderColor = (status: OrderItem['status']) => {
    switch (status) {
      case 'Pending':
        return '#EAB308';
      case 'Confirmed':
        return '#3B82F6';
      case 'Completed':
        return '#16A34A';
      case 'Cancelled':
        return '#EF4444';
    }
  };

  return (
    <div className="app-container" style={{ paddingBottom: '60px' }}>
      {/* ─── Order Category Navigation Switcher ─── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '22px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => navigate('/produce/orders')}
          style={{
            padding: '10px 22px',
            borderRadius: '24px',
            border: '2px solid #176B3A',
            backgroundColor: '#EAF6EE',
            color: '#0E4A27',
            fontWeight: 800,
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(23, 107, 58, 0.12)',
          }}
        >
          <span>{isFarmer ? '🌾 Crop Sales Orders' : '🌱 My Produce Purchases'}</span>
          <span style={{
            backgroundColor: '#176B3A',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '10px',
          }}>
            {orders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/supply/orders')}
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
            e.currentTarget.style.borderColor = '#ca8a04';
            e.currentTarget.style.color = '#854d0e';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          <span>🏪 My Supply Purchases</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>→</span>
        </button>
      </div>

      {/* ─── Page Header ─── */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <span style={{ fontSize: '32px' }}>{isFarmer ? '🌾' : '🛒'}</span>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0E4A27', margin: 0 }}>
              {isFarmer ? 'Crop Sales & Buyer Orders' : 'My Produce Purchases'}
            </h1>
          </div>
          <p style={{ fontSize: '16px', color: '#525450', margin: 0 }}>
            {isFarmer
              ? 'Review incoming purchase requests from buyers for your harvests, confirm fulfillment, and track payments.'
              : 'Track fresh farm harvests you ordered from local farmers across Northern Mindanao.'}
          </p>
        </div>

        {loading && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', backgroundColor: '#E0F2FE', color: '#0369A1', fontWeight: 700, fontSize: '14px' }}>
            <span style={{ animation: 'spin 1s linear infinite' }}>🔄</span> Syncing latest orders...
          </span>
        )}
      </div>

      {/* ─── Top KPI Metric Summary Cards ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            📋
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Orders</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>{totalOrdersCount}</div>
          </div>
        </div>

        <div
          style={{
            background: pendingCount > 0 ? '#FEFCE8' : '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: `1.5px solid ${pendingCount > 0 ? '#FDE047' : '#E2E8F0'}`,
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#FEF9C3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            ⏳
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: pendingCount > 0 ? '#A16207' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pending Action
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: pendingCount > 0 ? '#A16207' : '#0F172A' }}>
              {pendingCount}
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            🚚
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Deliveries</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#1E40AF' }}>{confirmedCount}</div>
          </div>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            💰
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fulfilled Volume</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27' }}>₱{totalRevenue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* ─── Search & Status Filters Bar ─── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
          backgroundColor: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: '18px',
          border: '1.5px solid #E2E8F0',
        }}
      >
        {/* Filter Tabs with Counter Badges */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: '4px' }}>
          {tabs.map((tab) => {
            const isSelected = selectedTab === tab;
            let count = totalOrdersCount;
            if (tab === 'Pending') count = pendingCount;
            if (tab === 'Confirmed') count = confirmedCount;
            if (tab === 'Completed') count = completedCount;
            if (tab === 'Cancelled') count = cancelledCount;

            return (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  border: isSelected ? '1.5px solid #0E4A27' : '1.5px solid transparent',
                  background: isSelected ? '#0E4A27' : '#F1F5F9',
                  color: isSelected ? '#FFFFFF' : '#334155',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{tab}</span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(255,255,255,0.25)' : '#CBD5E1',
                    color: isSelected ? '#FFFFFF' : '#1E293B',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input Box */}
        <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 280px', maxWidth: '400px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '16px' }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search crop, buyer, phone, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              borderRadius: '12px',
              border: '1.5px solid #CBD5E1',
              backgroundColor: '#F8FAFC',
              fontSize: '14px',
              fontWeight: 600,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ─── Orders List ─── */}
      {filteredOrders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {filteredOrders.map((ord) => {
            const badge = getStatusBadgeStyle(ord.status);
            const parsed = parseContactMessage(ord.contactMessage);
            const cropIcon = getCropIcon(ord.product);
            const shortId = formatOrderId(ord.id);
            const leftBorder = getStatusBorderColor(ord.status);

            return (
              <div
                key={ord.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1.5px solid #E2E8F0',
                  borderLeft: `6px solid ${leftBorder}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  padding: '24px',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                {/* Order Card Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid #F1F5F9',
                    marginBottom: '18px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div
                      onClick={(e) => handleCopyId(ord.id, e)}
                      title={`Click to copy full ID: ${ord.id}`}
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#F1F5F9',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 800,
                        color: '#0E4A27',
                        fontFamily: 'monospace',
                        letterSpacing: '0.5px',
                      }}
                    >
                      <span>{shortId}</span>
                      <span style={{ fontSize: '12px', opacity: 0.7 }}>
                        {copiedId === ord.id ? '✓ Copied!' : '📋'}
                      </span>
                    </div>

                    <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>
                      🕒 {ord.date}
                    </span>
                  </div>

                  {/* Rich Status Badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      backgroundColor: badge.bg,
                      border: `1px solid ${badge.border}`,
                      color: badge.color,
                      fontSize: '14px',
                      fontWeight: 700,
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: badge.dot,
                        display: 'inline-block',
                      }}
                    />
                    <span>{badge.label}</span>
                  </div>
                </div>

                {/* ─── Live Fulfillment Timeline (Shopee Style) ─── */}
                {ord.status !== 'Cancelled' && (
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      padding: '16px 20px',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      marginBottom: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Live Crop Order Timeline
                      </span>
                      <span style={{ fontSize: '12px', color: '#0E4A27', fontWeight: 700 }}>
                        {ord.status === 'Pending' && '⏳ Waiting for Farmer Confirmation'}
                        {ord.status === 'Confirmed' && '🚚 Harvest Confirmed · Ready for Pickup / Delivery'}
                        {ord.status === 'Completed' && '✓ Successfully Delivered & Completed'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                      {[
                        { stepNum: 1, title: '1. Order Placed' },
                        { stepNum: 2, title: '2. Harvest Confirmed' },
                        { stepNum: 3, title: '3. In Transit / Ready' },
                        { stepNum: 4, title: '4. Delivered & Paid' },
                      ].map((s) => {
                        const stepDone = ord.status === 'Completed'
                          ? true
                          : ord.status === 'Confirmed'
                          ? s.stepNum <= 3
                          : s.stepNum === 1;

                        const isCurrent = ord.status === 'Completed'
                          ? s.stepNum === 4
                          : ord.status === 'Confirmed'
                          ? s.stepNum === 3
                          : s.stepNum === 1;

                        return (
                          <div
                            key={s.stepNum}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              flex: 1,
                              position: 'relative',
                              zIndex: 2,
                            }}
                          >
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: stepDone ? (isCurrent ? '#16A34A' : '#0E4A27') : '#E2E8F0',
                                color: stepDone ? '#FFFFFF' : '#94A3B8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '13px',
                                boxShadow: isCurrent ? '0 0 0 4px rgba(22, 163, 74, 0.25)' : 'none',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              {stepDone ? (s.stepNum === 4 ? '✓' : s.stepNum) : s.stepNum}
                            </div>
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: isCurrent ? 800 : 600,
                                color: isCurrent ? '#0E4A27' : stepDone ? '#166534' : '#94A3B8',
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

                {/* Order Card Main Content Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(260px, 1.2fr) minmax(280px, 1.8fr)',
                    gap: '24px',
                    alignItems: 'start',
                  }}
                >
                  {/* Left Column: Crop & Quantity */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '16px',
                        backgroundColor: '#EAF6EE',
                        border: '1.5px solid #C8E6D2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '30px',
                        flexShrink: 0,
                      }}
                    >
                      {cropIcon}
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                        Produce Item
                      </div>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '2px 0 6px 0' }}>
                        {ord.product}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, backgroundColor: '#ECFDF5', color: '#065F46', padding: '3px 10px', borderRadius: '8px' }}>
                          📦 Quantity: {ord.quantity}
                        </span>
                        {ord.unitPrice > 0 && (
                          <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                            • ₱{ord.unitPrice.toLocaleString()}/kg
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Buyer & Structured Logistics Information */}
                  <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                    {/* Buyer Identity */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0E4A27', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>
                        {ord.buyerName.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                        {ord.buyerName}
                      </div>
                    </div>

                    {/* Logistics Chips */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13.5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                        <span>📍</span>
                        <span style={{ fontWeight: 600 }}>{parsed.fulfillment}</span>
                      </div>

                      {parsed.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>📞</span>
                          <a
                            href={`tel:${parsed.phone.replace(/[^0-9+]/g, '')}`}
                            style={{ color: '#0369A1', fontWeight: 700, textDecoration: 'none' }}
                          >
                            {parsed.phone}
                          </a>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                        <span>💳</span>
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>{parsed.payment}</span>
                      </div>

                      {parsed.notes && (
                        <div style={{ marginTop: '4px', padding: '6px 10px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', fontStyle: 'italic', color: '#64748B', fontSize: '13px' }}>
                          "{parsed.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Card Footer */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid #F1F5F9',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Total Order Value</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#0E4A27' }}>
                      ₱{ord.total.toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {ord.status === 'Pending' && (
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => handleUpdateStatus(ord.id, 'confirmed')}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '10px',
                          backgroundColor: '#16A34A',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '15px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 4px rgba(22,163,74,0.2)',
                        }}
                      >
                        <span>✓</span>
                        <span>Confirm Order</span>
                      </button>
                    )}

                    {ord.status === 'Confirmed' && (
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => handleUpdateStatus(ord.id, 'completed')}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '10px',
                          backgroundColor: '#2563EB',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '15px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
                        }}
                      >
                        <span>✓</span>
                        <span>{isBuyer ? 'Confirm Received & Paid' : 'Mark as Completed'}</span>
                      </button>
                    )}

                    {/* Direct Cancel Order button for Pending Orders */}
                    {ord.status === 'Pending' && (
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to cancel this crop order? Reserved harvest will be returned to the marketplace.')) {
                            await handleUpdateStatus(ord.id, 'cancelled');
                          }
                        }}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '10px',
                          border: '1.5px solid #FECACA',
                          backgroundColor: '#FEF2F2',
                          color: '#DC2626',
                          fontWeight: 700,
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>✕</span>
                        <span>Cancel Order</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedOrder(ord)}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        fontWeight: 700,
                        fontSize: '15px',
                        cursor: 'pointer',
                      }}
                    >
                      View Order Details →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div
          style={{
            padding: '60px 24px',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '2px dashed #CBD5E1',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🌾📦</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            No orders found in "{selectedTab}"
          </h2>
          <p style={{ fontSize: '16px', color: '#64748B', maxWidth: '480px', margin: '0 auto 20px auto' }}>
            {searchQuery
              ? `No match found for "${searchQuery}". Try clearing your search query.`
              : isFarmer
              ? 'No incoming crop orders yet. When buyers request to purchase your harvest on AgriConnect, their order slips and delivery requests will appear here.'
              : 'You have not ordered any fresh crops yet. Connect directly with local farmers across Northern Mindanao.'}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                backgroundColor: '#0E4A27',
                color: '#FFFFFF',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Clear Search Query
            </button>
          ) : (
            <button
              onClick={() => navigate(isFarmer ? '/produce/manage' : '/produce')}
              className="btn btn-primary btn-large"
              style={{ padding: '12px 24px', fontSize: '15px', fontWeight: 800 }}
            >
              {isFarmer ? 'View My Crop Listings →' : 'Browse Produce Marketplace →'}
            </button>
          )}
        </div>
      )}

      {/* ─── High-Fidelity Order Details Modal ─── */}
      {selectedOrder && (() => {
        const parsedModal = parseContactMessage(selectedOrder.contactMessage);
        const modalBadge = getStatusBadgeStyle(selectedOrder.status);
        const modalCropIcon = getCropIcon(selectedOrder.product);

        return (
          <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '640px', padding: '32px', borderRadius: '24px' }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27', margin: 0 }}>
                      Order Summary
                    </h2>
                    <span style={{ fontSize: '13px', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', backgroundColor: '#F1F5F9', color: '#334155', fontFamily: 'monospace' }}>
                      {formatOrderId(selectedOrder.id)}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748B' }}>
                    Placed on {selectedOrder.date}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    background: '#F1F5F9',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#64748B',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Lifecycle Progress Stepper */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '16px 20px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                  {/* Step 1: Placed */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#16A34A', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800 }}>
                      ✓
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', marginTop: '6px' }}>Placed</span>
                  </div>

                  {/* Connecting Line 1 */}
                  <div style={{ flex: 1, height: '3px', backgroundColor: selectedOrder.status !== 'Pending' && selectedOrder.status !== 'Cancelled' ? '#16A34A' : '#CBD5E1', margin: '0 8px 18px 8px' }} />

                  {/* Step 2: Confirmed */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: selectedOrder.status === 'Confirmed' || selectedOrder.status === 'Completed' ? '#2563EB' : '#E2E8F0',
                        color: selectedOrder.status === 'Confirmed' || selectedOrder.status === 'Completed' ? '#FFF' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 800,
                      }}
                    >
                      {selectedOrder.status === 'Completed' ? '✓' : '2'}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: selectedOrder.status === 'Confirmed' || selectedOrder.status === 'Completed' ? '#1E40AF' : '#64748B', marginTop: '6px' }}>
                      Confirmed
                    </span>
                  </div>

                  {/* Connecting Line 2 */}
                  <div style={{ flex: 1, height: '3px', backgroundColor: selectedOrder.status === 'Completed' ? '#16A34A' : '#CBD5E1', margin: '0 8px 18px 8px' }} />

                  {/* Step 3: Completed */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: selectedOrder.status === 'Completed' ? '#16A34A' : '#E2E8F0',
                        color: selectedOrder.status === 'Completed' ? '#FFF' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 800,
                      }}
                    >
                      {selectedOrder.status === 'Completed' ? '✓' : '3'}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: selectedOrder.status === 'Completed' ? '#166534' : '#64748B', marginTop: '6px' }}>
                      Fulfilled
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items & Calculation */}
              <div style={{ border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '18px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '28px' }}>{modalCropIcon}</span>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{selectedOrder.product}</div>
                      <div style={{ fontSize: '13px', color: '#64748B' }}>Quantity: <strong>{selectedOrder.quantity}</strong></div>
                    </div>
                  </div>

                  <span style={{ padding: '4px 12px', borderRadius: '14px', backgroundColor: modalBadge.bg, color: modalBadge.color, fontWeight: 700, fontSize: '13px' }}>
                    {modalBadge.label}
                  </span>
                </div>

                <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '15px', color: '#64748B', fontWeight: 600 }}>Total Harvest Amount:</span>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27' }}>
                    ₱{selectedOrder.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Customer & Delivery Card */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1.5px solid #E2E8F0', padding: '18px', marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Customer & Delivery Details
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>👤</span>
                    <span style={{ color: '#0F172A', fontWeight: 700 }}>{selectedOrder.buyerName}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>📍</span>
                    <span style={{ color: '#334155', fontWeight: 600 }}>{parsedModal.fulfillment}</span>
                  </div>

                  {parsedModal.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px' }}>📞</span>
                      <a href={`tel:${parsedModal.phone.replace(/[^0-9+]/g, '')}`} style={{ color: '#0284C7', fontWeight: 700, textDecoration: 'none' }}>
                        {parsedModal.phone}
                      </a>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>💵</span>
                    <span style={{ color: '#0F172A', fontWeight: 600 }}>{parsedModal.payment}</span>
                  </div>

                  {parsedModal.notes && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <span style={{ fontSize: '16px' }}>📝</span>
                      <span style={{ color: '#475569', fontStyle: 'italic' }}>"{parsedModal.notes}"</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {parsedModal.phone && (
                  <a
                    href={`tel:${parsedModal.phone.replace(/[^0-9+]/g, '')}`}
                    style={{
                      flex: 1,
                      minWidth: '140px',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1.5px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A',
                      fontWeight: 700,
                      fontSize: '15px',
                      textAlign: 'center',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>📞</span>
                    <span>Call Buyer</span>
                  </a>
                )}

                {selectedOrder.status === 'Pending' && (
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={async () => {
                      await handleUpdateStatus(selectedOrder.id, 'confirmed');
                      setSelectedOrder(null);
                    }}
                    style={{
                      flex: 2,
                      minWidth: '180px',
                      padding: '12px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: '#16A34A',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '15px',
                      cursor: 'pointer',
                    }}
                  >
                    {isUpdatingStatus ? 'Updating...' : '✓ Confirm Order'}
                  </button>
                )}

                {selectedOrder.status === 'Confirmed' && (
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={async () => {
                      await handleUpdateStatus(selectedOrder.id, 'completed');
                      setSelectedOrder(null);
                    }}
                    style={{
                      flex: 2,
                      minWidth: '180px',
                      padding: '12px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '15px',
                      cursor: 'pointer',
                    }}
                  >
                    {isUpdatingStatus ? 'Updating...' : '✓ Mark Completed'}
                  </button>
                )}

                {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Completed' && (
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to cancel this order?')) {
                        await handleUpdateStatus(selectedOrder.id, 'cancelled');
                        setSelectedOrder(null);
                      }
                    }}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '12px',
                      border: '1.5px solid #FECACA',
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      fontWeight: 700,
                      fontSize: '15px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
