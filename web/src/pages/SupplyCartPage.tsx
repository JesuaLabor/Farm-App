import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supplyApi } from '../api/supply';
import type { DeliveryMethod, PaymentMethod, SupplyProduct } from '../types/supply';

interface CartItem {
  product: SupplyProduct;
  quantity: number;
}

// Payment options config — easy to enable/disable as gateways go live.
const getPaymentOptions = (isPickup: boolean): {
  id: PaymentMethod;
  label: string;
  icon: string;
  desc: string;
  comingSoon?: boolean;
}[] => [
  {
    id: 'cod',
    label: isPickup ? 'Cash on Pickup' : 'Cash on Delivery',
    icon: '💵',
    desc: isPickup ? 'Pay in cash upon in-store collection.' : 'Pay in cash when your order arrives.',
  },
  {
    id: 'gcash',
    label: 'GCash',
    icon: '📱',
    desc: 'Send via GCash e-wallet.',
    comingSoon: true,
  },
  {
    id: 'maya',
    label: 'Maya',
    icon: '💜',
    desc: 'Pay with Maya (formerly PayMaya).',
    comingSoon: true,
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    icon: '🏦',
    desc: 'InstaPay / PESONet transfer.',
    comingSoon: true,
  },
  {
    id: 'card',
    label: 'Credit / Debit Card',
    icon: '💳',
    desc: 'Visa, Mastercard via secure gateway.',
    comingSoon: true,
  },
];

export const SupplyCartPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  const [ordering, setOrdering] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const uniqueSupplierNames = Array.from(new Set(cart.map((i) => i.product.supplierName || 'Supplier')));
  const hasMultipleSuppliers = uniqueSupplierNames.length > 1;

  const loadCart = () => {
    const raw = localStorage.getItem('agriconnect_cart');
    if (raw) {
      try { setCart(JSON.parse(raw)); } catch { setCart([]); }
    }
  };

  useEffect(() => {
    if (user?.role === 'supplier') {
      navigate('/supply/manage');
      return;
    }
    loadCart();
  }, [user, navigate]);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('agriconnect_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
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
    saveCart(cart.filter((i) => i.product.id !== productId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (user?.role !== 'farmer') {
      setMessage({ type: 'error', text: 'Only registered Farmers can place supply orders.' });
      return;
    }

    setOrdering(true);
    setMessage(null);

    if (hasMultipleSuppliers) {
      setMessage({
        type: 'error',
        text: `Your cart contains items from multiple suppliers (${uniqueSupplierNames.join(', ')}). Please place separate orders per supplier.`,
      });
      return;
    }

    try {
      await supplyApi.createOrder({
        items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : undefined,
        paymentMethod,
      });
      localStorage.removeItem('agriconnect_cart');
      window.dispatchEvent(new Event('cart-updated'));
      setCart([]);
      setMessage({
        type: 'success',
        text: paymentMethod === 'cod'
          ? (deliveryMethod === 'pickup' ? '✅ Order placed! Pay in cash upon in-store pickup. Track it under My Supply Orders.' : '✅ Order placed! Pay in cash upon delivery. Track it under My Supply Orders.')
          : '✅ Order placed! Check My Supply Orders for payment instructions.',
      });
      setTimeout(() => navigate('/supply/orders'), 2500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to place order.' });
    } finally {
      setOrdering(false);
    }
  };

  // Visible payment options based on delivery method
  const visiblePaymentOptions = getPaymentOptions(deliveryMethod === 'pickup');

  // Card style helpers
  const panelBtn = (active: boolean): React.CSSProperties => ({
    padding: '10px 12px',
    borderRadius: '10px',
    border: active ? '2px solid #ca8a04' : '1.5px solid #e2e8f0',
    backgroundColor: active ? '#fef9c3' : '#fff',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '13px',
    textAlign: 'left',
    transition: 'border-color 0.15s, background 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar />

      <main style={{ maxWidth: '940px', margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
          Agri-Supply Shopping Cart
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
          Review your items, choose delivery, and select how you'd like to pay.
        </p>

        {message && (
          <div style={{
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '24px',
            backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
            fontWeight: 600,
            fontSize: '14px',
          }}>
            {message.text}
          </div>
        )}

        {cart.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', borderRadius: '20px', textAlign: 'center' }}>
            <span style={{ fontSize: '48px' }}>🛒</span>
            <h3 style={{ marginTop: '12px', fontSize: '18px' }}>Your Cart is Empty</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
              Browse the Agri-Supply Store to add fertilizers, seeds, or tools.
            </p>
            <a href="/supply" style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#ca8a04', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
              Go to Supply Store
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>

            {/* ── Cart Items ──────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {cart.map((item) => (
                <div key={item.product.id} className="glass-panel" style={{ padding: '18px 20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.product.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                      ₱{item.product.price.toLocaleString()} / {item.product.unit} · {item.product.supplierName}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                    {/* Qty stepper */}
                    <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                      <button onClick={() => handleUpdateQty(item.product.id, -1)} style={{ padding: '6px 11px', border: 'none', background: '#f8fafc', cursor: 'pointer', fontWeight: 700, fontSize: '15px' }}>−</button>
                      <span style={{ padding: '6px 11px', fontWeight: 700, fontSize: '14px', minWidth: '28px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => handleUpdateQty(item.product.id, 1)} style={{ padding: '6px 11px', border: 'none', background: '#f8fafc', cursor: 'pointer', fontWeight: 700, fontSize: '15px' }}>+</button>
                    </div>

                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#ca8a04', minWidth: '76px', textAlign: 'right' }}>
                      ₱{(item.quantity * item.product.price).toLocaleString()}
                    </div>

                    <button onClick={() => handleRemove(item.product.id)} title="Remove" style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px', padding: '4px', lineHeight: 1 }}>✕</button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Order Summary Panel ─────────────────────── */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>Order Summary</h2>

              <form onSubmit={handleCheckout}>

                {/* Fulfillment Method */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Fulfillment Method
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button type="button" onClick={() => setDeliveryMethod('delivery')} style={panelBtn(deliveryMethod === 'delivery')}>
                      🚚 Delivery
                    </button>
                    <button type="button" onClick={() => setDeliveryMethod('pickup')} style={panelBtn(deliveryMethod === 'pickup')}>
                      🏪 Store Pickup
                    </button>
                  </div>
                </div>

                {/* Delivery Address */}
                {deliveryMethod === 'delivery' && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Delivery Address
                    </label>
                    <textarea
                      rows={3}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Street, Barangay, City, Province"
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontFamily: 'inherit', fontSize: '13px', resize: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                )}

                {/* ── Payment Method ───────────────────────── */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Payment Method
                  </label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {visiblePaymentOptions.map((opt) => {
                      const isActive = paymentMethod === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => !opt.comingSoon && setPaymentMethod(opt.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            border: isActive ? '2px solid #ca8a04' : '1.5px solid #e2e8f0',
                            backgroundColor: isActive ? '#fef9c3' : opt.comingSoon ? '#f8fafc' : '#fff',
                            cursor: opt.comingSoon ? 'default' : 'pointer',
                            textAlign: 'left',
                            transition: 'border-color 0.15s, background 0.15s',
                            opacity: opt.comingSoon ? 0.6 : 1,
                          }}
                        >
                          {/* Radio dot */}
                          <div style={{
                            width: '16px', height: '16px', borderRadius: '50%',
                            border: isActive ? '5px solid #ca8a04' : '2px solid #cbd5e1',
                            flexShrink: 0,
                            transition: 'border 0.15s',
                          }} />

                          <span style={{ fontSize: '18px', lineHeight: 1 }}>{opt.icon}</span>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {opt.label}
                              {opt.comingSoon && (
                                <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '6px', backgroundColor: '#e2e8f0', color: '#64748b' }}>
                                  SOON
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>{opt.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* COD info note */}
                  {paymentMethod === 'cod' && (
                    <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', fontSize: '12px', color: '#92400e' }}>
                      💡 <strong>{deliveryMethod === 'pickup' ? 'Cash on Pickup:' : 'Cash on Delivery:'}</strong>{' '}
                      {deliveryMethod === 'pickup'
                        ? 'Have exact cash ready upon picking up your order at the store.'
                        : "Have the exact amount ready when the supplier's rider arrives. A handling fee may apply."}
                    </div>
                  )}
                </div>

                {hasMultipleSuppliers && (
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#fff1f2',
                    border: '1.5px solid #fecdd3',
                    color: '#9f1239',
                    fontSize: '13px',
                    marginBottom: '16px',
                    lineHeight: 1.4,
                  }}>
                    ⚠️ <strong>Multiple Suppliers in Cart:</strong> Your cart contains items from {uniqueSupplierNames.join(', ')}. Please keep products from only 1 supplier before checking out.
                  </div>
                )}

                {/* Order Total */}
                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Amount</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                      {cart.length} item{cart.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <span style={{ color: '#ca8a04', fontSize: '22px', fontWeight: 800 }}>
                    ₱{totalAmount.toLocaleString()}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={ordering || hasMultipleSuppliers}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: ordering || hasMultipleSuppliers ? '#a3a3a3' : '#ca8a04',
                    color: '#fff',
                    fontWeight: 800,
                    border: 'none',
                    cursor: ordering || hasMultipleSuppliers ? 'not-allowed' : 'pointer',
                    fontSize: '15px',
                    transition: 'background 0.2s',
                  }}
                >
                  {ordering
                    ? 'Placing Order…'
                    : `Place Order · ${visiblePaymentOptions.find(p => p.id === paymentMethod)?.icon || '💵'} ${paymentMethod === 'cod' ? (deliveryMethod === 'pickup' ? 'Pay on Pickup' : 'Pay on Delivery') : 'Pay Now'}`
                  }
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
