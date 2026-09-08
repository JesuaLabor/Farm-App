import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useChat } from '../contexts/ChatContext';
import { produceApi } from '../api/produce';
import { getImageUrl } from '../api';

export interface OrderItem {
  id: string;
  isBackend?: boolean;
  buyerId?: string;
  farmerId?: string;
  buyerName: string;
  buyerLocation: string;
  farmerName?: string;
  product: string;
  photo?: string;
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

export function getCropImageFallback(cropName: string = ''): string {
  const c = cropName.toLowerCase();
  if (c.includes('corn') || c.includes('mais')) return 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80';
  if (c.includes('rice') || c.includes('palay') || c.includes('bugas') || c.includes('dinorado')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80';
  if (c.includes('tomato') || c.includes('kamatis')) return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80';
  if (c.includes('mango') || c.includes('mangga')) return 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80';
  if (c.includes('banana') || c.includes('saging')) return 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=600&q=80';
  if (c.includes('potato') || c.includes('patatas') || c.includes('cassava') || c.includes('kamote')) return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80';
  if (c.includes('onion') || c.includes('sibuyas')) return 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80';
  if (c.includes('garlic') || c.includes('ahos') || c.includes('bawang')) return 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80';
  if (c.includes('cabbage') || c.includes('lettuce') || c.includes('pechay')) return 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80';
  if (c.includes('eggplant') || c.includes('talong')) return 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80';
  if (c.includes('chili') || c.includes('sili')) return 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80';
  return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80';
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
  const { openChatWith } = useChat();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const isFarmer = user?.role === 'farmer';
  const isBuyer = user?.role === 'buyer';

  // viewMode: 'sales' = farmer selling to buyers, 'purchases' = farmer buying from other farmers
  const [viewMode, setViewMode] = useState<'sales' | 'purchases'>('sales');
  const isViewingPurchases = isFarmer && viewMode === 'purchases';

  const handleChatOrderParty = (ord: OrderItem) => {
    // When viewing farmer's own purchases, chat target is the seller (farmerId)
    // When viewing sales orders, chat target is the buyer (buyerId)
    const targetUserId = isViewingPurchases ? ord.farmerId : (isFarmer ? ord.buyerId : ord.farmerId);
    if (!targetUserId) {
      toastError('Account Unavailable', 'Contact information is currently unavailable for this user.');
      return;
    }
    openChatWith(
      targetUserId,
      {
        type: 'produce_order',
        referenceId: ord.id,
        title: `Order #${ord.id.slice(-6).toUpperCase()} - ${ord.product}`,
        image: ord.photo ? getImageUrl(ord.photo) : undefined,
        price: ord.total,
      },
      `Hi! Inquiring regarding order #${ord.id.slice(-6).toUpperCase()} (${ord.product}, total ₱${ord.total?.toLocaleString()}).`
    );
  };

  const [selectedTab, setSelectedTab] = useState<'All Orders' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'>('All Orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<OrderItem | null>(null);
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
      const [res, listingsRes] = await Promise.all([
        produceApi.listTransactions(),
        produceApi.listListings().catch(() => [] as any),
      ]);
      const listingMap = new Map<string, string>();
      if (Array.isArray(listingsRes)) {
        for (const l of listingsRes) {
          if (l.photos && l.photos.length > 0) {
            listingMap.set(l.id, l.photos[0]);
          }
        }
      }

      if (res && res.length > 0) {
        const mapped: OrderItem[] = res.map((t) => {
          const capStatus = (t.status.charAt(0).toUpperCase() + t.status.slice(1).toLowerCase()) as any;
          const d = new Date(t.createdAt);
          const timeStr = !isNaN(d.getTime())
            ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'Just now';
          const parsedContact = parseContactMessage(t.contactMessage);
          const photo = t.cropPhoto || (t.listingId ? listingMap.get(t.listingId) : undefined);
          return {
            id: t.id,
            isBackend: true,
            buyerId: t.buyerId,
            farmerId: t.farmerId,
            buyerName: t.buyerName || 'Buyer',
            buyerLocation: parsedContact.fulfillment || 'Northern Mindanao',
            farmerName: t.farmerName,
            product: t.cropName || 'Farm Produce',
            photo,
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

  // Split orders into sales (farmer as seller) and purchases (farmer as buyer)
  const salesOrders = isFarmer
    ? orders.filter((o) => o.farmerId === user?.id)
    : orders;
  const purchaseOrders = isFarmer
    ? orders.filter((o) => o.buyerId === user?.id)
    : [];

  // Which pool of orders to show based on viewMode
  const activeOrders = isViewingPurchases ? purchaseOrders : salesOrders;

  // KPI recalculations based on active pool
  const activePendingCount = activeOrders.filter((o) => o.status === 'Pending').length;
  const activeConfirmedCount = activeOrders.filter((o) => o.status === 'Confirmed').length;
  const activeCompletedCount = activeOrders.filter((o) => o.status === 'Completed').length;
  const activeCancelledCount = activeOrders.filter((o) => o.status === 'Cancelled').length;

  // Filtering
  const filteredOrders = activeOrders.filter((ord) => {
    const matchesTab = selectedTab === 'All Orders' || ord.status.toLowerCase() === selectedTab.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      ord.product.toLowerCase().includes(query) ||
      ord.buyerName.toLowerCase().includes(query) ||
      (ord.farmerName && ord.farmerName.toLowerCase().includes(query)) ||
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

        {/* Sales Orders tab (farmer's default view) / Buyer Produce Purchases */}
        <button
          type="button"
          onClick={() => { setViewMode('sales'); setSelectedTab('All Orders'); }}
          style={{
            padding: '10px 22px',
            borderRadius: '24px',
            border: `2px solid ${!isViewingPurchases ? '#176B3A' : '#e2e8f0'}`,
            backgroundColor: !isViewingPurchases ? '#EAF6EE' : '#ffffff',
            color: !isViewingPurchases ? '#0E4A27' : '#64748b',
            fontWeight: !isViewingPurchases ? 800 : 700,
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: !isViewingPurchases ? '0 2px 8px rgba(23, 107, 58, 0.12)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <span>{isFarmer ? '🌾 Crop Sales Orders' : '🌱 My Produce Purchases'}</span>
          <span style={{
            backgroundColor: !isViewingPurchases ? '#176B3A' : '#cbd5e1',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '10px',
          }}>
            {salesOrders.length}
          </span>
        </button>

        {/* My Crop Purchases tab — only visible for Farmers */}
        {isFarmer && (
          <button
            type="button"
            onClick={() => { setViewMode('purchases'); setSelectedTab('All Orders'); }}
            style={{
              padding: '10px 22px',
              borderRadius: '24px',
              border: `2px solid ${isViewingPurchases ? '#7C3AED' : '#e2e8f0'}`,
              backgroundColor: isViewingPurchases ? '#F5F3FF' : '#ffffff',
              color: isViewingPurchases ? '#4C1D95' : '#64748b',
              fontWeight: isViewingPurchases ? 800 : 700,
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: isViewingPurchases ? '0 2px 8px rgba(124, 58, 237, 0.12)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🛒 My Crop Purchases</span>
            <span style={{
              backgroundColor: isViewingPurchases ? '#7C3AED' : '#cbd5e1',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '10px',
            }}>
              {purchaseOrders.length}
            </span>
          </button>
        )}

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
            <span style={{ fontSize: '32px' }}>{isViewingPurchases ? '🛒' : (isFarmer ? '🌾' : '🛒')}</span>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: isViewingPurchases ? '#4C1D95' : '#0E4A27', margin: 0 }}>
              {isViewingPurchases ? 'My Crop Purchases' : (isFarmer ? 'Crop Sales & Buyer Orders' : 'My Produce Purchases')}
            </h1>
          </div>
          <p style={{ fontSize: '16px', color: '#525450', margin: 0 }}>
            {isViewingPurchases
              ? 'Track produce you purchased from other farmers. View order status and contact the seller.'
              : (isFarmer
                ? 'Review incoming purchase requests from buyers for your harvests, confirm fulfillment, and track payments.'
                : 'Track fresh farm harvests you ordered from local farmers across Northern Mindanao.')}
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
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>{activeOrders.length}</div>
          </div>
        </div>

        <div
          style={{
            background: activePendingCount > 0 ? '#FEFCE8' : '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: `1.5px solid ${activePendingCount > 0 ? '#FDE047' : '#E2E8F0'}`,
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
            <div style={{ fontSize: '13px', fontWeight: 700, color: activePendingCount > 0 ? '#A16207' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pending Action
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: activePendingCount > 0 ? '#A16207' : '#0F172A' }}>
              {activePendingCount}
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
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#1E40AF' }}>{activeConfirmedCount}</div>
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
            let count = activeOrders.length;
            if (tab === 'Pending') count = activePendingCount;
            if (tab === 'Confirmed') count = activeConfirmedCount;
            if (tab === 'Completed') count = activeCompletedCount;
            if (tab === 'Cancelled') count = activeCancelledCount;

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
                        backgroundColor: '#F1F5F9',
                        border: '1.5px solid #E2E8F0',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '30px',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                      }}
                    >
                      <img
                        src={getImageUrl(ord.photo, getCropImageFallback(ord.product))}
                        alt={ord.product}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          if (target.parentElement) {
                            target.parentElement.innerHTML = `<span style="font-size: 28px;">${cropIcon}</span>`;
                          }
                        }}
                      />
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

                  {/* Right Column: Buyer / Seller Info depending on viewMode */}
                  <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                    {/* Party Identity */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: isViewingPurchases ? '#4C1D95' : '#0E4A27', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>
                        {isViewingPurchases
                          ? (ord.farmerName || 'S').charAt(0).toUpperCase()
                          : ord.buyerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: isViewingPurchases ? '#6D28D9' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          {isViewingPurchases ? 'Selling Farmer' : 'Buyer'}
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                          {isViewingPurchases ? (ord.farmerName || 'Unknown Farmer') : ord.buyerName}
                        </div>
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
                    {/* Chat with other party */}
                    {((isViewingPurchases && ord.farmerId) || (isFarmer && !isViewingPurchases && ord.buyerId) || (isBuyer && ord.farmerId)) && (
                      <button
                        type="button"
                        onClick={() => handleChatOrderParty(ord)}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '10px',
                          backgroundColor: '#EFFDF5',
                          color: '#0E4A27',
                          fontWeight: 700,
                          fontSize: '14px',
                          border: '1.5px solid #16A34A',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                        title={isViewingPurchases ? `Chat with Farmer (${ord.farmerName || 'Farmer'})` : (isFarmer ? `Chat with Buyer (${ord.buyerName})` : `Chat with Farmer (${ord.farmerName || 'Farmer'})`)}
                      >
                        <span>💬</span>
                        <span>{isViewingPurchases ? 'Chat Farmer' : (isFarmer ? 'Chat Buyer' : 'Chat Farmer')}</span>
                      </button>
                    )}

                    {ord.status === 'Pending' && isFarmer && !isViewingPurchases && (
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
                        <span>Accept & Confirm Order</span>
                      </button>
                    )}

                    {ord.status === 'Pending' && (isBuyer || isViewingPurchases) && (
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#D97706',
                          backgroundColor: '#FEF3C7',
                          padding: '8px 14px',
                          borderRadius: '10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>⏳</span>
                        <span>Waiting for Farmer Confirmation</span>
                      </span>
                    )}

                    {ord.status === 'Confirmed' && (
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => handleUpdateStatus(ord.id, 'completed')}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '10px',
                          backgroundColor: (isFarmer && !isViewingPurchases) ? '#16A34A' : '#2563EB',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '14px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: (isFarmer && !isViewingPurchases)
                            ? '0 2px 6px rgba(22,163,74,0.25)'
                            : '0 2px 6px rgba(37,99,235,0.25)',
                        }}
                      >
                        <span>{(isFarmer && !isViewingPurchases) ? '💵' : '✓'}</span>
                        <span>
                          {isUpdatingStatus
                            ? 'Updating...'
                            : (isFarmer && !isViewingPurchases)
                            ? `Confirm Payment Received (₱${ord.total.toLocaleString()})`
                            : 'Confirm Produce Received & Paid'}
                        </span>
                      </button>
                    )}

                    {/* Direct Cancel Order button for Pending Orders */}
                    {ord.status === 'Pending' && (
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOrderToCancel(ord);
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
        const isPending = selectedOrder.status === 'Pending';
        const isConfirmed = selectedOrder.status === 'Confirmed';
        const isCompleted = selectedOrder.status === 'Completed';
        const isCancelled = selectedOrder.status === 'Cancelled';

        return (
          <div
            className="modal-backdrop"
            onClick={() => setSelectedOrder(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '620px',
                width: '100%',
                maxHeight: '92vh',
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: 0,
                animation: 'modalPop 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* 1. Sleek Sticky Header */}
              <div
                style={{
                  padding: '18px 24px',
                  backgroundColor: '#FFFFFF',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#16A34A',
                        backgroundColor: '#DCFCE7',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      RECEIPT & DETAILS
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleCopyId(selectedOrder.id, e)}
                      title="Click to copy full Order ID"
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#334155',
                        backgroundColor: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{formatOrderId(selectedOrder.id)}</span>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>
                        {copiedId === selectedOrder.id ? '✓' : '📋'}
                      </span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Order Summary
                    </h2>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>
                      • 📅 {selectedOrder.date}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      padding: '5px 12px',
                      borderRadius: '16px',
                      backgroundColor: modalBadge.bg,
                      color: modalBadge.color,
                      fontWeight: 800,
                      fontSize: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {modalBadge.label}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    aria-label="Close modal"
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      color: '#64748B',
                      fontSize: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#E2E8F0';
                      e.currentTarget.style.color = '#0F172A';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F1F5F9';
                      e.currentTarget.style.color = '#64748B';
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* 2. Scrollable Body */}
              <div
                style={{
                  padding: '20px 24px',
                  overflowY: 'auto',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {/* ── Section A: Digital Invoice & Crop Summary Card (Prominently at the top!) ── */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '16px 18px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '14px',
                          backgroundColor: '#F1F5F9',
                          border: '1.5px solid #E2E8F0',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '26px',
                          flexShrink: 0,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                        }}
                      >
                        <img
                          src={getImageUrl(selectedOrder.photo, getCropImageFallback(selectedOrder.product))}
                          alt={selectedOrder.product}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            if (target.parentElement) {
                              target.parentElement.innerHTML = `<span style="font-size: 26px;">${modalCropIcon}</span>`;
                            }
                          }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
                          {selectedOrder.product}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span>Quantity: <strong style={{ color: '#0F172A' }}>{selectedOrder.quantity}</strong></span>
                          <span>•</span>
                          <span>₱{(selectedOrder.unitPrice || (selectedOrder.total / (selectedOrder.quantityNum || 1))).toFixed(2)} / kg</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: '#0E4A27' }}>
                        ₱{selectedOrder.total.toLocaleString()}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#16A34A',
                          backgroundColor: '#DCFCE7',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          display: 'inline-block',
                          marginTop: '2px',
                        }}
                      >
                        {isCompleted ? '✓ Paid' : parsedModal.payment}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Section B: Order Lifecycle Tracker with True Connecting Track Line ── */}
                {isCancelled ? (
                  <div
                    style={{
                      backgroundColor: '#FEF2F2',
                      border: '1.5px solid #FECACA',
                      borderRadius: '16px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#DC2626',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      ✕
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#991B1B' }}>
                        Order Cancelled
                      </div>
                      <div style={{ fontSize: '12px', color: '#B91C1C', marginTop: '2px' }}>
                        This transaction was cancelled. Reserved harvest ({selectedOrder.quantity}) was safely restored to the listing.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '16px',
                      padding: '14px 18px 16px 18px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B' }}>
                        Order Lifecycle Tracker
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: isCompleted ? '#16A34A' : isConfirmed ? '#2563EB' : '#D97706' }}>
                        {isPending && '⏳ Waiting for Farmer Confirmation'}
                        {isConfirmed && '🚚 Ready for Delivery / Pickup'}
                        {isCompleted && '✓ Completed & Delivered'}
                      </span>
                    </div>

                    {/* Stepper with continuous connecting bar */}
                    <div style={{ position: 'relative', padding: '0 8px' }}>
                      {/* Gray Background Track */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '15px',
                          left: '32px',
                          right: '32px',
                          height: '3px',
                          backgroundColor: '#E2E8F0',
                          zIndex: 1,
                        }}
                      >
                        {/* Green Active Fill Track */}
                        <div
                          style={{
                            height: '100%',
                            backgroundColor: '#16A34A',
                            width: isCompleted ? '100%' : isConfirmed ? '66%' : '10%',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                        {[
                          { stepNum: 1, title: 'Placed', full: '1. Order Placed' },
                          { stepNum: 2, title: 'Confirmed', full: '2. Confirmed' },
                          { stepNum: 3, title: 'In Transit', full: '3. In Transit' },
                          { stepNum: 4, title: 'Delivered', full: '4. Delivered' },
                        ].map((s) => {
                          const stepDone = isCompleted
                            ? true
                            : isConfirmed
                            ? s.stepNum <= 3
                            : s.stepNum === 1;

                          const isCurrent = isCompleted
                            ? s.stepNum === 4
                            : isConfirmed
                            ? s.stepNum === 3
                            : s.stepNum === 1;

                          return (
                            <div
                              key={s.stepNum}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                width: '68px',
                              }}
                            >
                              <div
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '50%',
                                  backgroundColor: stepDone ? (isCurrent ? '#16A34A' : '#0E4A27') : '#E2E8F0',
                                  color: stepDone ? '#FFFFFF' : '#94A3B8',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '12px',
                                  boxShadow: isCurrent ? '0 0 0 3px rgba(22, 163, 74, 0.25)' : 'none',
                                  border: '2px solid #FFFFFF',
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                {stepDone ? (s.stepNum === 4 ? '✓' : (isCurrent || s.stepNum === 1 ? '✓' : s.stepNum)) : s.stepNum}
                              </div>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: isCurrent ? 800 : 600,
                                  color: isCurrent ? '#0E4A27' : stepDone ? '#166534' : '#94A3B8',
                                  marginTop: '5px',
                                  textAlign: 'center',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {s.title}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Section C: Clean Structured Logistics & Customer Grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {/* Fulfillment Details */}
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>📍</span>
                      <span>Fulfillment & Logistics</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                        {parsedModal.fulfillment.toLowerCase().includes('pickup') ? 'Farm-Gate Pickup' : 'Delivery Address'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4, marginTop: '2px' }}>
                        {parsedModal.fulfillment}
                      </div>
                    </div>
                    {parsedModal.notes && (
                      <div
                        style={{
                          marginTop: '4px',
                          padding: '6px 10px',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          fontSize: '11px',
                          color: '#475569',
                          fontStyle: 'italic',
                        }}
                      >
                        "{parsedModal.notes}"
                      </div>
                    )}
                  </div>

                  {/* Party & Contact Details */}
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: isViewingPurchases ? '#6D28D9' : '#64748B', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>👤</span>
                      <span>{isViewingPurchases ? 'Selling Farmer' : 'Customer & Payment'}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{isViewingPurchases ? (selectedOrder.farmerName || 'Verified Farmer') : selectedOrder.buyerName}</span>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '1px 6px', borderRadius: '4px' }}>
                          Verified
                        </span>
                      </div>
                    </div>

                    {/* Phone Row with Copy */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px', backgroundColor: '#FFFFFF', padding: '6px 10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '12px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📞</span>
                        <span>{parsedModal.phone || 'No phone'}</span>
                      </span>
                      {parsedModal.phone && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(parsedModal.phone);
                            toastInfo('Phone Copied', `${parsedModal.phone} copied.`);
                          }}
                          title="Copy Phone Number"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#0284C7',
                            padding: '2px 4px',
                            fontWeight: 700,
                          }}
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Sticky Action Footer */}
              <div
                style={{
                  padding: '14px 24px',
                  backgroundColor: '#F8FAFC',
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 10,
                }}
              >
                <div>
                  {/* Cancel Button */}
                  {!isCancelled && !isCompleted && (
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() => setOrderToCancel(selectedOrder)}
                      style={{
                        padding: '9px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #FECACA',
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEE2E2')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
                    >
                      <span>✕</span>
                      <span>Cancel Order</span>
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {parsedModal.phone && (
                    <a
                      href={`tel:${parsedModal.phone.replace(/[^0-9+]/g, '')}`}
                      style={{
                        padding: '9px 16px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        fontWeight: 700,
                        fontSize: '13px',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>📞</span>
                      <span>{isViewingPurchases ? 'Call Farmer' : 'Call Buyer'}</span>
                    </a>
                  )}

                  {isPending && isFarmer && !isViewingPurchases && (
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={async () => {
                        await handleUpdateStatus(selectedOrder.id, 'confirmed');
                      }}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: '#16A34A',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                      }}
                    >
                      <span>✓</span>
                      <span>{isUpdatingStatus ? 'Confirming...' : 'Accept & Confirm Order'}</span>
                    </button>
                  )}

                  {isPending && (isBuyer || isViewingPurchases) && (
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#D97706',
                        backgroundColor: '#FEF3C7',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>⏳</span>
                      <span>Awaiting Farmer Acceptance</span>
                    </span>
                  )}

                  {isConfirmed && (
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={async () => {
                        await handleUpdateStatus(selectedOrder.id, 'completed');
                      }}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: (isFarmer && !isViewingPurchases) ? '#16A34A' : '#2563EB',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: (isFarmer && !isViewingPurchases)
                          ? '0 2px 6px rgba(22, 163, 74, 0.25)'
                          : '0 2px 6px rgba(37, 99, 235, 0.25)',
                      }}
                    >
                      <span>{(isFarmer && !isViewingPurchases) ? '💵' : '✓'}</span>
                      <span>
                        {isUpdatingStatus
                          ? 'Updating...'
                          : (isFarmer && !isViewingPurchases)
                          ? `Confirm Payment Received (₱${selectedOrder.total.toLocaleString()})`
                          : 'Confirm Produce Received & Paid'}
                      </span>
                    </button>
                  )}

                  {isCompleted && (
                    <div
                      style={{
                        padding: '9px 16px',
                        borderRadius: '10px',
                        backgroundColor: '#DCFCE7',
                        color: '#166534',
                        fontWeight: 800,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>✓</span>
                      <span>{(isFarmer && !isViewingPurchases) ? 'Payment Received · Completed' : 'Order Completed & Paid'}</span>
                    </div>
                  )}

                  {isCancelled && (
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(null)}
                      style={{
                        padding: '9px 18px',
                        borderRadius: '10px',
                        backgroundColor: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        color: '#475569',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── In-App Cancel Order Confirmation Dialog ─── */}
      {orderToCancel && (
        <div
          className="modal-backdrop"
          onClick={() => !isUpdatingStatus && setOrderToCancel(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '460px',
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              padding: '24px',
              animation: 'modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  flexShrink: 0,
                }}
              >
                ⚠️
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Cancel Order?
                </h3>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                  Order {formatOrderId(orderToCancel.id)}
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '14px',
                padding: '14px 16px',
                fontSize: '13px',
                color: '#991B1B',
                lineHeight: 1.5,
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1px solid #FECACA',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <img
                  src={getImageUrl(orderToCancel.photo, getCropImageFallback(orderToCancel.product))}
                  alt={orderToCancel.product}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div>
                Are you sure you want to cancel this order for{' '}
                <strong>{orderToCancel.quantity}</strong> of <strong>{orderToCancel.product}</strong>?
                <div style={{ marginTop: '4px', color: '#B91C1C', fontWeight: 600, fontSize: '12px' }}>
                  🌾 Reserved harvest will be immediately returned to the marketplace listing for other buyers.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => setOrderToCancel(null)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Nevermind, Keep Order
              </button>

              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={async () => {
                  const id = orderToCancel.id;
                  await handleUpdateStatus(id, 'cancelled');
                  if (selectedOrder && selectedOrder.id === id) {
                    setSelectedOrder((prev) => (prev ? { ...prev, status: 'Cancelled' } : null));
                  }
                  setOrderToCancel(null);
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
                }}
              >
                <span>✕</span>
                <span>{isUpdatingStatus ? 'Cancelling...' : 'Yes, Cancel Order'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
