import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supplyApi } from '../api/supply';
import type { SupplyOrder, SupplyOrderStatus } from '../types/supply';

const statusBadges: Record<SupplyOrderStatus, { label: string; bg: string; color: string }> = {
  pending: { label: 'PENDING PROCESSING', bg: '#fef9c3', color: '#854d0e' },
  processing: { label: 'PROCESSING IN WAREHOUSE', bg: '#dbeafe', color: '#1e40af' },
  shipped_ready: { label: 'SHIPPED / READY FOR PICKUP', bg: '#e0e7ff', color: '#3730a3' },
  completed: { label: 'COMPLETED', bg: '#dcfce7', color: '#166534' },
  cancelled: { label: 'CANCELLED', bg: '#fee2e2', color: '#991b1b' },
};

export const SupplyOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<SupplyOrder[]>([]);
  const [loading, setLoading] = useState(true);

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
    try {
      await supplyApi.updateOrderStatus(id, status);
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update order status');
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
          Track input order status, fulfillment methods, and delivery progress.
        </p>

        {loading ? (
          <div>Loading supply orders...</div>
        ) : orders.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', borderRadius: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '48px' }}>📦</span>
            <h3 style={{ marginTop: '12px', fontSize: '18px' }}>No Orders Found</h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Agri-supply orders will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {orders.map((order) => {
              const badge = statusBadges[order.status];
              const isSupplier = user?.id === order.supplierId;
              const isBuyer = user?.id === order.buyerId;

              return (
                <div key={order.id} className="glass-panel" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', backgroundColor: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
                        Order #{order.id.slice(-6).toUpperCase()} • {order.items.length} Item(s)
                      </h3>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: '#ca8a04' }}>
                        ₱{order.totalAmount.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Method: <strong>{order.deliveryMethod.toUpperCase()}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Item List */}
                  <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '12px', fontSize: '13px' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: idx < order.items.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                        <span>{item.quantity} x {item.productName}</span>
                        <span>₱{(item.quantity * item.pricePerItem).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px', color: '#475569' }}>
                    <div>
                      <p style={{ margin: 0 }}><strong>Farmer (Buyer):</strong> {order.buyerName} {isBuyer && '(You)'}</p>
                      {order.deliveryAddress && <p style={{ margin: '2px 0 0 0' }}><strong>Address:</strong> {order.deliveryAddress}</p>}
                    </div>
                    <div>
                      <p style={{ margin: 0 }}><strong>Supplier:</strong> {order.supplierName} {isSupplier && '(You)'}</p>
                    </div>
                  </div>

                  {/* Actions for Supplier / Farmer */}
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                    {isSupplier && order.status === 'pending' && (
                      <button onClick={() => handleUpdateStatus(order.id, 'processing')} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#ca8a04', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                        Start Processing Order
                      </button>
                    )}

                    {isSupplier && order.status === 'processing' && (
                      <button onClick={() => handleUpdateStatus(order.id, 'shipped_ready')} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#3730a3', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                        Mark as Shipped / Ready for Pickup
                      </button>
                    )}

                    {(isSupplier || isBuyer) && order.status === 'shipped_ready' && (
                      <button onClick={() => handleUpdateStatus(order.id, 'completed')} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                        Mark as Completed
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
