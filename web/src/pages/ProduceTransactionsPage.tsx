import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const sampleOrders = [
  {
    id: '1042',
    buyerName: 'Maria Santos',
    buyerLocation: 'Cagayan de Oro Market',
    product: 'Sweet Yellow Corn (Mais)',
    quantity: '120 kg',
    total: 5040,
    status: 'Pending',
    date: '10 minutes ago',
  },
  {
    id: '1041',
    buyerName: 'Juanito Store Owner',
    buyerLocation: 'Malaybalay, Bukidnon',
    product: 'Fresh Red Tomatoes (Kamatis)',
    quantity: '75 kg',
    total: 4875,
    status: 'Confirmed',
    date: '1 hour ago',
  },
  {
    id: '1035',
    buyerName: 'CDO Supermarket',
    buyerLocation: 'Cagayan de Oro City',
    product: 'Carabao Mangoes (Mangga)',
    quantity: '50 kg',
    total: 4750,
    status: 'Completed',
    date: '2 hours ago',
  },
];

export const ProduceTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('All Orders');
  const [orders, setOrders] = useState(sampleOrders);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const tabs = ['All Orders', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

  const filteredOrders = orders.filter((ord) => {
    if (selectedTab === 'All Orders') return true;
    return ord.status.toLowerCase() === selectedTab.toLowerCase();
  });

  return (
    <div className="app-container" style={{ paddingBottom: '40px' }}>
      {/* ─── Back Button & Header ─── */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-secondary"
          style={{ marginBottom: '16px', fontSize: '17px' }}
        >
          ← Back to Dashboard
        </button>

        <h1 style={{ fontSize: '34px', fontWeight: 800, color: '#0E4A27' }}>
          My Crop Orders
        </h1>
        <p style={{ fontSize: '20px', color: '#525450', marginTop: '4px' }}>
          View buyer requests and confirm orders for your harvest.
        </p>
      </div>

      {/* ─── Order Tabs ─── */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', marginBottom: '28px' }}>
        {tabs.map((tab) => {
          const isSelected = selectedTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              style={{
                padding: '12px 24px',
                borderRadius: '30px',
                border: `2.5px solid ${isSelected ? '#176B3A' : '#D8D6CF'}`,
                background: isSelected ? '#176B3A' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : '#1A1C1A',
                fontWeight: 800,
                fontSize: '18px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ─── Orders List ─── */}
      {filteredOrders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '24px',
                padding: '24px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#0E4A27' }}>
                    Order #{ord.id}
                  </span>
                  <span
                    className={
                      ord.status === 'Pending'
                        ? 'badge badge-warning'
                        : ord.status === 'Confirmed'
                        ? 'badge badge-info'
                        : 'badge badge-verified'
                    }
                    style={{ fontSize: '15px' }}
                  >
                    {ord.status === 'Pending' ? '⏳ Pending Approval' : ord.status === 'Confirmed' ? '✓ Confirmed' : '✓ Completed'}
                  </span>
                  <span style={{ fontSize: '15px', color: '#525450' }}>• {ord.date}</span>
                </div>

                <div style={{ fontSize: '19px', color: '#1A1C1A', fontWeight: 800 }}>
                  Buyer: <strong>{ord.buyerName}</strong> ({ord.buyerLocation})
                </div>

                <div style={{ fontSize: '18px', color: '#525450', marginTop: '4px', fontWeight: 600 }}>
                  Product: <strong>{ord.product}</strong> • Quantity: <strong>{ord.quantity}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '15px', color: '#525450', fontWeight: 700 }}>Total Amount:</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#0E4A27' }}>
                    ₱{ord.total.toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrder(ord)}
                  className="btn btn-primary btn-large"
                >
                  View Order Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '12px' }}>📦</div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27', marginBottom: '8px' }}>
            No orders found in "{selectedTab}"
          </h2>
          <p style={{ fontSize: '18px', color: '#525450' }}>
            When buyers order your crops, they will appear right here.
          </p>
        </div>
      )}

      {/* ─── View Order Modal ─── */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27' }}>
                Order #{selectedOrder.id} Details
              </h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: '#F8F7F3', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#525450', width: '42px', height: '42px', borderRadius: '50%' }}>✕</button>
            </div>

            <div style={{ padding: '20px', borderRadius: '16px', background: '#F8F7F3', border: '2px solid #E4E2DC', marginBottom: '24px' }}>
              <div style={{ fontSize: '16px', color: '#525450' }}>Buyer Name:</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#1A1C1A', marginBottom: '10px' }}>{selectedOrder.buyerName}</div>
              <div style={{ fontSize: '16px', color: '#525450' }}>Delivery Location:</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#1A1C1A' }}>{selectedOrder.buyerLocation}</div>
            </div>

            <div style={{ padding: '20px', borderRadius: '16px', background: '#EAF6EE', border: '2px solid #176B3A', marginBottom: '28px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#176B3A' }}>
                Item Ordered: {selectedOrder.product} ({selectedOrder.quantity})
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0E4A27', marginTop: '6px' }}>
                Total Payment: ₱{selectedOrder.total.toLocaleString()} (Cash on Delivery)
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <button
                onClick={() => alert(`Calling buyer ${selectedOrder.buyerName} at 0917-987-6543...`)}
                className="btn btn-secondary btn-large"
              >
                📞 Call Buyer
              </button>
              <button
                onClick={() => {
                  setOrders((prev) =>
                    prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: 'Confirmed' } : o))
                  );
                  setSelectedOrder(null);
                }}
                className="btn btn-primary btn-large"
              >
                ✓ Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
