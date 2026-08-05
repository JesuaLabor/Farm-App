import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supplyApi } from '../api/supply';
import type { DeliveryMethod, SupplyProduct } from '../types/supply';

interface CartItem {
  product: SupplyProduct;
  quantity: number;
}

export const SupplyCartPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');

  const [ordering, setOrdering] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadCart = () => {
    const raw = localStorage.getItem('agriconnect_cart');
    if (raw) {
      try {
        setCart(JSON.parse(raw));
      } catch (e) {
        setCart([]);
      }
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('agriconnect_cart', JSON.stringify(newCart));
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    const updated = cart.map((item) => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[];

    saveCart(updated);
  };

  const handleRemove = (productId: string) => {
    const updated = cart.filter((i) => i.product.id !== productId);
    saveCart(updated);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (user?.role !== 'farmer') {
      setMessage({ type: 'error', text: 'Only registered Farmers can place supply orders. Please switch to a Farmer account.' });
      return;
    }

    setOrdering(true);
    setMessage(null);

    const payload = {
      items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      deliveryMethod,
      deliveryAddress,
    };

    try {
      await supplyApi.createOrder(payload);
      localStorage.removeItem('agriconnect_cart');
      setCart([]);
      setMessage({ type: 'success', text: 'Order placed successfully! Track order status under My Supply Orders.' });
      setTimeout(() => navigate('/supply/orders'), 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to place order.' });
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar />

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Agri-Supply Shopping Cart
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
          Review selected inputs and choose delivery or pickup.
        </p>

        {message && (
          <div style={{ padding: '14px', borderRadius: '12px', marginBottom: '24px', backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2', color: message.type === 'success' ? '#166534' : '#991b1b' }}>
            {message.text}
          </div>
        )}

        {cart.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', borderRadius: '20px', textAlign: 'center' }}>
            <span style={{ fontSize: '48px' }}>🛒</span>
            <h3 style={{ marginTop: '12px', fontSize: '18px' }}>Your Cart is Empty</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Browse the Agri-Supply Store to add fertilizers, seeds, or tools.</p>
            <a href="/supply" style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#ca8a04', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
              Go to Supply Store
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
            {/* Cart Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.map((item) => (
                <div key={item.product.id} className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{item.product.name}</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                      ₱{item.product.price} / {item.product.unit} • Supplier: {item.product.supplierName}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                      <button onClick={() => handleUpdateQty(item.product.id, -1)} style={{ padding: '6px 12px', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontWeight: 700 }}>-</button>
                      <span style={{ padding: '6px 12px', fontWeight: 700 }}>{item.quantity}</span>
                      <button onClick={() => handleUpdateQty(item.product.id, 1)} style={{ padding: '6px 12px', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontWeight: 700 }}>+</button>
                    </div>

                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#ca8a04', minWidth: '80px', textAlign: 'right' }}>
                      ₱{(item.quantity * item.product.price).toLocaleString()}
                    </div>

                    <button onClick={() => handleRemove(item.product.id)} style={{ border: 'none', background: 'none', color: '#991b1b', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Options Panel */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', height: 'fit-content' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>Order Summary</h2>

              <form onSubmit={handleCheckout}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Fulfillment Method</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('delivery')}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: deliveryMethod === 'delivery' ? '2px solid #ca8a04' : '1px solid #cbd5e1',
                        backgroundColor: deliveryMethod === 'delivery' ? '#fef9c3' : '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      🚚 Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('pickup')}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: deliveryMethod === 'pickup' ? '2px solid #ca8a04' : '1px solid #cbd5e1',
                        backgroundColor: deliveryMethod === 'pickup' ? '#fef9c3' : '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      🏪 Store Pickup
                    </button>
                  </div>
                </div>

                {deliveryMethod === 'delivery' && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Delivery Address</label>
                    <textarea
                      rows={3}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Street, Barangay, City, Province"
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit', fontSize: '13px' }}
                    />
                  </div>
                )}

                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Total Amount:</span>
                  <span style={{ color: '#ca8a04', fontSize: '20px' }}>₱{totalAmount.toLocaleString()}</span>
                </div>

                <button
                  type="submit"
                  disabled={ordering}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#ca8a04', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '15px' }}
                >
                  {ordering ? 'Placing Order...' : 'Place Order Now'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
