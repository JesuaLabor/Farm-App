import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import type { PaymentMethod, SupplyProduct } from '../types/app';
import { Spinner } from '../components/Spinner';

// ── Category config ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'All',                           label: 'All',            icon: '🏪' },
  { key: 'fertilizer',                    label: 'Fertilizers',    icon: '🌱' },
  { key: 'pesticide_herbicide_fungicide', label: 'Crop Protection',icon: '🧪' },
  { key: 'seeds_seedlings',               label: 'Seeds',          icon: '🌽' },
  { key: 'tools',                         label: 'Tools',          icon: '🔧' },
  { key: 'ppe',                           label: 'PPE',            icon: '🥽' },
];

// ── Payment options ──────────────────────────────────────────────────────────
interface PaymentOption {
  id: PaymentMethod;
  label: string;
  icon: string;
  desc: string;
  deliveryOnly?: boolean;
  comingSoon?: boolean;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: 'cod',           label: 'Cash on Delivery', icon: '💵', desc: 'Pay in cash upon delivery.',         deliveryOnly: true },
  { id: 'gcash',         label: 'GCash',            icon: '📱', desc: 'GCash e-wallet payment.',            comingSoon: true },
  { id: 'maya',          label: 'Maya',             icon: '💜', desc: 'Maya (formerly PayMaya).',           comingSoon: true },
  { id: 'bank_transfer', label: 'Bank Transfer',    icon: '🏦', desc: 'InstaPay / PESONet.',               comingSoon: true },
  { id: 'card',          label: 'Card',             icon: '💳', desc: 'Visa / Mastercard (secure).',       comingSoon: true },
];

// ── Cart types ───────────────────────────────────────────────────────────────
interface CartItem {
  product: SupplyProduct;
  quantity: number;
}

// ── Screen ───────────────────────────────────────────────────────────────────
export const SupplyStoreScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Products & filter
  const [products, setProducts] = useState<SupplyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // In-memory cart (mobile PWA uses session state, not localStorage)
  const [cart, setCart] = useState<CartItem[]>([]);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.quantity * i.product.price, 0);

  // Quick-add modal (tapping "Order Supply" on a product card)
  const [addingItem, setAddingItem] = useState<SupplyProduct | null>(null);
  const [addQty, setAddQty] = useState(1);

  // Checkout modal state
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderMsg, setOrderMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Supplier: add product modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodCat, setProdCat] = useState('fertilizer');
  const [prodPrice, setProdPrice] = useState('');
  const [prodUnit, setProdUnit] = useState('bag');
  const [prodStock, setProdStock] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [addingProduct, setAddingProduct] = useState(false);
  const [addErr, setAddErr] = useState('');

  // Auto-switch away from COD when pickup is selected
  useEffect(() => {
    if (deliveryMethod === 'pickup' && paymentMethod === 'cod') {
      setPaymentMethod('gcash');
    }
  }, [deliveryMethod]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const cat = selectedCategory === 'All' ? undefined : selectedCategory;
      const data = await api.listSupply(cat);
      setProducts(data);
    } catch {
      console.error('Failed to load supply products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [selectedCategory]);

  // ── Cart helpers ───────────────────────────────────────────────────────────
  const addToCart = (product: SupplyProduct, qty: number) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + qty };
        return updated;
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) => prev
      .map((i) => i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i)
      .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleConfirmAdd = () => {
    if (!addingItem) return;
    addToCart(addingItem, addQty);
    setAddingItem(null);
  };

  // ── Checkout ───────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    if (user?.role !== 'farmer') {
      setOrderMsg({ ok: false, text: 'Only Farmers can place supply orders.' });
      return;
    }
    setPlacingOrder(true);
    setOrderMsg(null);
    try {
      await api.createSupplyOrder({
        items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : undefined,
        paymentMethod,
      });
      setCart([]);
      setShowCheckout(false);
      setOrderMsg({
        ok: true,
        text: paymentMethod === 'cod'
          ? '✅ Order placed! Pay in cash when your order arrives.'
          : '✅ Order placed! Check your orders for payment instructions.',
      });
    } catch (err: any) {
      setOrderMsg({ ok: false, text: err.response?.data?.error || 'Failed to place order.' });
    } finally {
      setPlacingOrder(false);
    }
  };

  // ── Supplier: Create Product ───────────────────────────────────────────────
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodStock) {
      setAddErr('Fill in product name, price, and stock quantity.');
      return;
    }
    setAddingProduct(true);
    setAddErr('');
    try {
      await api.createSupplyProduct({
        name: prodName,
        category: prodCat,
        price: Number(prodPrice),
        unit: prodUnit,
        stockQuantity: Number(prodStock),
        description: prodDesc,
      });
      setShowAddModal(false);
      setProdName(''); setProdPrice(''); setProdStock(''); setProdDesc('');
      fetchProducts();
    } catch (err: any) {
      setAddErr(err.response?.data?.error || 'Failed to add supply product.');
    } finally {
      setAddingProduct(false);
    }
  };

  const visiblePaymentOptions = PAYMENT_OPTIONS.filter(
    (opt) => !(opt.deliveryOnly && deliveryMethod === 'pickup')
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Top Bar ──────────────────────────────────────────── */}
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <span>←</span> Back
        </button>
        <div className="top-bar-title">Agri-Supply Store</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user?.role === 'supplier' && (
            <button className="btn-action" onClick={() => setShowAddModal(true)}>+ Product</button>
          )}
          {(user?.role === 'farmer' || user?.role === 'buyer') && (
            <button
              className="btn-action"
              onClick={() => setShowCheckout(true)}
              style={{ position: 'relative', paddingRight: cartCount > 0 ? 24 : undefined }}
              disabled={cart.length === 0}
            >
              🛒
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  background: '#ca8a04', color: '#fff',
                  borderRadius: '50%', width: 18, height: 18,
                  fontSize: 10, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #fff',
                }}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Success / Error Flash ──────────────────────────────── */}
      {orderMsg && (
        <div style={{
          margin: '12px 16px 0',
          padding: '12px 14px',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 600,
          backgroundColor: orderMsg.ok ? '#dcfce7' : '#fee2e2',
          color: orderMsg.ok ? '#166534' : '#991b1b',
        }}>
          {orderMsg.text}
        </div>
      )}

      {/* ── Category Chips ────────────────────────────────────── */}
      <div className="chips-wrapper">
        <div className="chips-scroll">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`chip ${selectedCategory === cat.key ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.key)}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Product List ──────────────────────────────────────── */}
      <div className="scroll-content">
        {loading ? (
          <Spinner />
        ) : products.length === 0 ? (
          <div className="empty-card">
            <div className="empty-icon">🚜</div>
            <div className="empty-title">No products found</div>
            <div className="empty-desc">Try selecting a different category.</div>
          </div>
        ) : (
          products.map((item) => {
            const inCart = cart.find((c) => c.product.id === item.id);
            return (
              <div key={item.id} className="listing-card">
                <div className="listing-card-header">
                  <span className="category-badge">{item.category.replace(/_/g, ' ')}</span>
                  <span className="empty-desc">by {item.supplierName}</span>
                </div>

                <div className="quick-title" style={{ marginTop: 4 }}>{item.name}</div>
                <div className="empty-desc" style={{ margin: '6px 0' }}>
                  {item.description || 'Quality agricultural input'}
                </div>

                <div className="price-row">
                  <span className="price-value">₱{item.price.toLocaleString()}</span>
                  <span className="price-unit"> / {item.unit}</span>
                </div>
                <div className="empty-desc" style={{ marginBottom: 10 }}>
                  {item.stockQuantity > 0
                    ? `In Stock: ${item.stockQuantity} ${item.unit}s`
                    : 'Out of Stock'}
                </div>

                {inCart ? (
                  /* Inline qty stepper if already in cart */
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => updateCartQty(item.id, -1)}
                      style={{ padding: '6px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}
                    >−</button>
                    <span style={{ fontWeight: 700, minWidth: 28, textAlign: 'center' }}>{inCart.quantity}</span>
                    <button
                      onClick={() => updateCartQty(item.id, 1)}
                      style={{ padding: '6px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}
                    >+</button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{ padding: '6px 10px', border: 'none', background: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}
                    >✕</button>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: 13, padding: 10 }}
                    disabled={item.stockQuantity <= 0}
                    onClick={() => { setAddingItem(item); setAddQty(1); }}
                  >
                    Order Supply
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Quick Add Modal ───────────────────────────────────── */}
      {addingItem && (
        <div className="modal-backdrop" onClick={() => setAddingItem(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add to Cart</div>
              <button className="modal-close" onClick={() => setAddingItem(null)}>✕</button>
            </div>

            <div style={{ padding: '0 16px 16px' }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{addingItem.name}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                ₱{addingItem.price.toLocaleString()} / {addingItem.unit} · by {addingItem.supplierName}
              </div>

              <label className="label">Quantity</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <button onClick={() => setAddQty((q) => Math.max(1, q - 1))} style={{ padding: '8px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}>−</button>
                <span style={{ fontWeight: 800, fontSize: 16, minWidth: 32, textAlign: 'center' }}>{addQty}</span>
                <button onClick={() => setAddQty((q) => Math.min(addingItem.stockQuantity, q + 1))} style={{ padding: '8px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}>+</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: 16, fontSize: 14 }}>
                <span>Subtotal</span>
                <span style={{ color: '#ca8a04' }}>₱{(addQty * addingItem.price).toLocaleString()}</span>
              </div>

              <button className="btn btn-primary" style={{ width: '100%', padding: 12 }} onClick={handleConfirmAdd}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Checkout Modal ────────────────────────────────────── */}
      {showCheckout && (
        <div className="modal-backdrop" onClick={() => !placingOrder && setShowCheckout(false)}>
          <div className="modal-sheet" style={{ maxHeight: '92vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <div className="modal-title">Checkout</div>
              <button className="modal-close" onClick={() => !placingOrder && setShowCheckout(false)}>✕</button>
            </div>

            <div style={{ padding: '0 16px 24px' }}>

              {/* Cart Summary */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Your Cart ({cartCount} items)
                </div>
                {cart.map((item) => (
                  <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span>{item.quantity} × {item.product.name}</span>
                    <span style={{ fontWeight: 700 }}>₱{(item.quantity * item.product.price).toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 15, marginTop: 10, color: '#ca8a04' }}>
                  <span>Total</span>
                  <span>₱{cartTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Fulfillment Method */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Fulfillment
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {(['delivery', 'pickup'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setDeliveryMethod(m)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 10,
                        border: deliveryMethod === m ? '2px solid #ca8a04' : '1.5px solid #e2e8f0',
                        backgroundColor: deliveryMethod === m ? '#fef9c3' : '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      {m === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              {deliveryMethod === 'delivery' && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                    Delivery Address
                  </div>
                  <textarea
                    className="input input-textarea"
                    rows={3}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Street, Barangay, City, Province"
                    required
                  />
                </div>
              )}

              {/* Payment Method */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Payment Method
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {visiblePaymentOptions.map((opt) => {
                    const isActive = paymentMethod === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => !opt.comingSoon && setPaymentMethod(opt.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: isActive ? '2px solid #ca8a04' : '1.5px solid #e2e8f0',
                          backgroundColor: isActive ? '#fef9c3' : opt.comingSoon ? '#f8fafc' : '#fff',
                          cursor: opt.comingSoon ? 'default' : 'pointer',
                          textAlign: 'left',
                          opacity: opt.comingSoon ? 0.6 : 1,
                        }}
                      >
                        {/* Radio indicator */}
                        <div style={{
                          width: 16, height: 16, borderRadius: '50%',
                          border: isActive ? '5px solid #ca8a04' : '2px solid #cbd5e1',
                          flexShrink: 0,
                        }} />
                        <span style={{ fontSize: 18 }}>{opt.icon}</span>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                            {opt.label}
                            {opt.comingSoon && (
                              <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 6, backgroundColor: '#e2e8f0', color: '#64748b' }}>SOON</span>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{opt.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === 'cod' && (
                  <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 8, backgroundColor: '#fffbeb', border: '1px solid #fde68a', fontSize: 12, color: '#92400e' }}>
                    💡 Have exact amount ready when the rider arrives. A handling fee may apply.
                  </div>
                )}
              </div>

              {/* Error */}
              {orderMsg && !orderMsg.ok && (
                <div style={{ padding: '10px 12px', borderRadius: 8, backgroundColor: '#fee2e2', color: '#991b1b', fontSize: 13, marginBottom: 14, fontWeight: 600 }}>
                  {orderMsg.text}
                </div>
              )}

              {/* Place Order Button */}
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: 14, fontSize: 15 }}
                onClick={handlePlaceOrder}
                disabled={placingOrder || (deliveryMethod === 'delivery' && !deliveryAddress.trim())}
              >
                {placingOrder
                  ? <Spinner size={20} />
                  : `Place Order · ${PAYMENT_OPTIONS.find(p => p.id === paymentMethod)?.icon} ${paymentMethod === 'cod' ? 'Pay on Delivery' : 'Pay Now'}`
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Supplier: Add Product Modal ───────────────────────── */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add Supply Product</div>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateProduct} style={{ padding: '0 16px 16px' }}>
              {addErr && <div className="error-box">{addErr}</div>}

              <div className="field">
                <label className="label">Product Name *</label>
                <input className="input" placeholder="e.g. Urea Fertilizer, Hybrid Corn Seeds" value={prodName} onChange={(e) => setProdName(e.target.value)} required />
              </div>

              <div className="field">
                <label className="label">Category</label>
                <select className="input" value={prodCat} onChange={(e) => setProdCat(e.target.value)}>
                  {CATEGORIES.filter((c) => c.key !== 'All').map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="label">Price (₱) *</label>
                  <input className="input" type="number" step="0.01" placeholder="1450" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} required />
                </div>
                <div className="field">
                  <label className="label">Unit</label>
                  <input className="input" placeholder="50kg bag" value={prodUnit} onChange={(e) => setProdUnit(e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label className="label">Stock Quantity *</label>
                <input className="input" type="number" placeholder="500" value={prodStock} onChange={(e) => setProdStock(e.target.value)} required />
              </div>

              <div className="field">
                <label className="label">Description</label>
                <textarea className="input input-textarea" placeholder="Product specs, certification, usage details..." value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} rows={2} />
              </div>

              <button className="btn btn-primary" type="submit" disabled={addingProduct} style={{ width: '100%', padding: 12 }}>
                {addingProduct ? <Spinner size={20} /> : 'Add Product to Store Catalog'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
