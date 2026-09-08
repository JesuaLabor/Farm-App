import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supplyApi } from '../api/supply';
import { api, getImageUrl } from '../api';
import type { SupplyProduct, DeliveryMethod, PaymentMethod, SupplyOrder } from '../types/supply';

const categories: { key: string; label: string; icon: string }[] = [
  { key: 'all', label: 'All Inputs', icon: '🏪' },
  { key: 'fertilizer', label: 'Fertilizers', icon: '🌱' },
  { key: 'pesticide_herbicide_fungicide', label: 'Crop Protection', icon: '🧪' },
  { key: 'seeds_seedlings', label: 'Seeds & Seedlings', icon: '🌽' },
  { key: 'tools', label: 'Tools & Machinery', icon: '🔧' },
  { key: 'ppe', label: 'Safety PPE', icon: '🥽' },
];

const categoryImages: Record<string, string> = {
  fertilizer: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80',
  pesticide_herbicide_fungicide: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80',
  seeds_seedlings: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80',
  tools: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80',
  ppe: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
};

export const SupplyStorePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();
  const [products, setProducts] = useState<SupplyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Cart state in localStorage
  const [cartCount, setCartCount] = useState<number>(0);
  const [cartItemsMap, setCartItemsMap] = useState<Record<string, number>>({});
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // Quick-view Product Details Modal state
  const [viewProduct, setViewProduct] = useState<SupplyProduct | null>(null);
  const [viewQuantity, setViewQuantity] = useState<number>(1);

  // Buy Now Express Checkout Modal state (Shopee-style direct checkout without cart)
  const [buyNowProduct, setBuyNowProduct] = useState<SupplyProduct | null>(null);
  const [buyNowQuantity, setBuyNowQuantity] = useState<number>(1);
  const [buyNowDeliveryMethod, setBuyNowDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [buyNowAddress, setBuyNowAddress] = useState('');
  const [buyNowPhone, setBuyNowPhone] = useState('');
  const [buyNowPaymentMethod, setBuyNowPaymentMethod] = useState<PaymentMethod>('cod');
  const [isSubmittingBuyNow, setIsSubmittingBuyNow] = useState(false);
  const [placedSupplyOrder, setPlacedSupplyOrder] = useState<SupplyOrder | null>(null);

  // Supplier Add Product Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [prodName, setProdName] = useState('');

  // Purchasing privilege check: Only Farmers and Buyers (and admin) can buy supplies
  const isPurchaser = user?.role === 'farmer' || user?.role === 'buyer' || user?.role === 'super_admin';
  const [prodCategory, setProdCategory] = useState('fertilizer');
  const [prodPrice, setProdPrice] = useState<number>(1450);
  const [prodUnit, setProdUnit] = useState('50kg bag');
  const [prodStock, setProdStock] = useState<number>(500);
  const [prodDesc, setProdDesc] = useState('');
  const [prodImageFile, setProdImageFile] = useState<File | null>(null);
  const [prodImagePreview, setProdImagePreview] = useState<string>('');
  const prodFileInputRef = useRef<HTMLInputElement>(null);
  const [submittingProd, setSubmittingProd] = useState(false);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProd(true);
    let uploadedImageUrl = '';
    if (prodImageFile) {
      try {
        const res = await api.uploadImage(prodImageFile);
        uploadedImageUrl = res.url;
      } catch (uploadErr: any) {
        toastError('Upload Failed', 'Failed to upload image: ' + (uploadErr.response?.data?.error || uploadErr.message));
        setSubmittingProd(false);
        return;
      }
    }

    try {
      await supplyApi.createProduct({
        name: prodName,
        category: prodCategory as any,
        price: prodPrice,
        unit: prodUnit,
        stockQuantity: prodStock,
        description: prodDesc,
        images: uploadedImageUrl ? [uploadedImageUrl] : [],
      });
      toastSuccess('Product Listed', `"${prodName}" has been added to the store.`);
      setShowAddModal(false);
      setProdName(''); setProdDesc('');
      setProdImageFile(null);
      setProdImagePreview('');
      if (prodFileInputRef.current) prodFileInputRef.current.value = '';
      fetchProducts();
    } catch (err: any) {
      toastError('Create Product Failed', err.response?.data?.error || 'Failed to create supply product.');
    } finally {
      setSubmittingProd(false);
    }
  };

  const updateCartCount = () => {
    const raw = localStorage.getItem('agriconnect_cart');
    if (raw) {
      try {
        const items = JSON.parse(raw);
        setCartCount(Array.isArray(items) ? items.length : 0);
        const map: Record<string, number> = {};
        items.forEach((item: any) => {
          if (item.product?.id) {
            map[item.product.id] = (map[item.product.id] || 0) + (Number(item.quantity) || 0);
          }
        });
        setCartItemsMap(map);
      } catch (e) {
        setCartCount(0);
        setCartItemsMap({});
      }
    } else {
      setCartCount(0);
      setCartItemsMap({});
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await supplyApi.listProducts({
        category: activeCategory !== 'all' ? activeCategory : undefined,
        q: search || undefined,
      });
      setProducts(data);

      // Automatically clamp any cart quantities that exceed live available stock
      try {
        const raw = localStorage.getItem('agriconnect_cart');
        if (raw) {
          const cartItems: any[] = JSON.parse(raw);
          if (Array.isArray(cartItems) && cartItems.length > 0) {
            const productMap = new Map(data.map((p) => [p.id, p]));
            let cartModified = false;
            const updated = cartItems.map((c) => {
              const fresh = productMap.get(c.product?.id);
              if (fresh) {
                const maxStock = Math.max(0, fresh.stockQuantity);
                if (c.quantity > maxStock || c.product?.stockQuantity !== fresh.stockQuantity) {
                  cartModified = true;
                  return { ...c, product: fresh, quantity: Math.min(c.quantity, maxStock) };
                }
              }
              return c;
            }).filter((c) => c.quantity > 0);

            if (cartModified) {
              localStorage.setItem('agriconnect_cart', JSON.stringify(updated));
              updateCartCount();
              window.dispatchEvent(new Event('cart-updated'));
            }
          }
        }
      } catch (e) {
        console.error('Failed to reconcile cart in store:', e);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    updateCartCount();

    const handleCartSync = () => updateCartCount();
    window.addEventListener('cart-updated', handleCartSync);
    window.addEventListener('storage', handleCartSync);
    return () => {
      window.removeEventListener('cart-updated', handleCartSync);
      window.removeEventListener('storage', handleCartSync);
    };
  }, [activeCategory, search]);

  const handleDirectAddToCart = (item: SupplyProduct, qty: number = 1, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isPurchaser) {
      toastError('Purchasing Restricted', 'Suppliers cannot make purchases. Shopping cart is reserved for Farmers and Buyers.');
      return;
    }
    if (item.stockQuantity <= 0) return;

    const raw = localStorage.getItem('agriconnect_cart');
    let items: { product: SupplyProduct; quantity: number }[] = [];
    if (raw) {
      try { items = JSON.parse(raw); } catch (e) { }
    }

    const existingIndex = items.findIndex((i) => i.product.id === item.id);
    let newQty = qty;
    if (existingIndex > -1) {
      const currentQty = items[existingIndex].quantity;
      if (currentQty + qty > item.stockQuantity) {
        toastWarning(
          'Maximum Stock in Cart',
          `You already have ${currentQty} in your cart. Only ${item.stockQuantity} ${item.unit}s available.`
        );
        return;
      }
      items[existingIndex].quantity += qty;
      newQty = items[existingIndex].quantity;
    } else {
      items.push({ product: item, quantity: Math.min(qty, item.stockQuantity) });
    }

    localStorage.setItem('agriconnect_cart', JSON.stringify(items));
    updateCartCount();
    window.dispatchEvent(new Event('cart-updated'));

    // Micro-feedback state for this button
    setRecentlyAddedId(item.id);
    setTimeout(() => {
      setRecentlyAddedId((prev) => (prev === item.id ? null : prev));
    }, 1500);

    // Non-intrusive top-right toast notification
    toastSuccess(
      'Added to Cart! 🛒',
      `${qty} ${item.unit} of "${item.name}" added to your cart (${newQty} total in cart).`
    );
  };

  const handleOpenSupplyBuyNow = (item: SupplyProduct, qty: number = 1, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isPurchaser) {
      toastError('Purchasing Restricted', 'Suppliers cannot make purchases. Direct ordering is reserved for Farmers and Buyers.');
      return;
    }
    if (item.stockQuantity <= 0) return;

    // Close quick-view if open
    setViewProduct(null);

    const userAddr = user ? [user.barangay, user.municipality, user.province].filter(Boolean).join(', ') || user.address || '' : '';
    setBuyNowProduct(item);
    setBuyNowQuantity(Math.min(qty, item.stockQuantity || 1));
    setBuyNowDeliveryMethod('delivery');
    setBuyNowAddress(userAddr);
    setBuyNowPhone(user?.phone || '');
    setBuyNowPaymentMethod('cod');
    setPlacedSupplyOrder(null);
  };

  const handlePlaceSupplyBuyNow = async () => {
    if (!buyNowProduct) return;
    if (buyNowQuantity <= 0) {
      toastWarning('Invalid Quantity', 'Please enter a valid quantity of at least 1.');
      return;
    }
    if (buyNowQuantity > buyNowProduct.stockQuantity) {
      toastWarning('Stock Exceeded', `Maximum available stock is ${buyNowProduct.stockQuantity} ${buyNowProduct.unit}s.`);
      return;
    }
    if (buyNowDeliveryMethod === 'delivery' && !buyNowAddress.trim()) {
      toastWarning('Address Required', 'Please provide your complete delivery address or barangay.');
      return;
    }
    if (!buyNowPhone.trim()) {
      toastWarning('Contact Required', 'Please provide your contact phone number so the supplier can coordinate fulfillment.');
      return;
    }

    setIsSubmittingBuyNow(true);

    try {
      const order = await supplyApi.createOrder({
        items: [{ productId: buyNowProduct.id, quantity: buyNowQuantity }],
        deliveryMethod: buyNowDeliveryMethod,
        deliveryAddress: buyNowDeliveryMethod === 'delivery' ? buyNowAddress.trim() : undefined,
        paymentMethod: buyNowPaymentMethod,
      });
      setPlacedSupplyOrder(order);
      // NOTE: Cart in localStorage is completely untouched!
    } catch (err: any) {
      toastError('Order Failed', err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmittingBuyNow(false);
    }
  };

  return (
    <div className="app-container" style={{ paddingBottom: '40px' }}>
      {/* ─── Page Header ─── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '34px', fontWeight: 800, color: '#0E4A27' }}>
              Agri-Supply Store
            </h1>
            <p style={{ fontSize: '20px', color: '#525450', marginTop: '4px' }}>
              Order certified fertilizers, hybrid seeds, crop protection, and machinery directly from verified suppliers.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '14px' }}>
            {user?.role === 'supplier' && (
              <button className="btn btn-primary btn-large" onClick={() => setShowAddModal(true)}>
                + Add Supply Product
              </button>
            )}
            {isPurchaser && (
              <button
                onClick={() => navigate('/supply/cart')}
                className="btn btn-accent btn-large"
                style={{ fontSize: '18px' }}
              >
                🛒 View Cart ({cartCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Search Field & Category Pills ─── */}
      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        {/* Search Field */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for fertilizers, seeds, machinery, tools..."
            aria-label="Search supply store"
            className="form-input"
            style={{ fontSize: '18px', minHeight: '56px' }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
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
                <span style={{ fontSize: '22px' }}>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Products Grid ─── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', fontSize: '20px', color: '#525450', fontWeight: 700 }}>
          Loading certified supply products…
        </div>
      ) : products.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '12px' }}>🚜</div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0E4A27', marginBottom: '8px' }}>
            No products found in this category
          </h2>
          <p style={{ fontSize: '20px', color: '#525450', marginBottom: '24px' }}>
            Try searching for another product or select "All Inputs".
          </p>
          <button onClick={() => setActiveCategory('all')} className="btn btn-primary btn-large">
            Show All Supply Inputs
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '28px',
          }}
        >
          {products.map((item) => {
            const qtyInCart = cartItemsMap[item.id] || 0;
            const isRecentlyAdded = recentlyAddedId === item.id;
            const isOutOfStock = item.stockQuantity <= 0;
            const isMaxInCart = qtyInCart >= item.stockQuantity && !isOutOfStock;

            return (
              <div
                key={item.id}
                className="card card-interactive"
                style={{ padding: '0', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                onClick={() => {
                  setViewProduct(item);
                  setViewQuantity(1);
                }}
              >
                <div style={{ position: 'relative', height: '200px', background: '#EAF6EE' }}>
                  <img
                    src={getImageUrl(item.images?.[0], categoryImages[item.category] ?? 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80')}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {qtyInCart > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#176B3A',
                        color: '#FFFFFF',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 800,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }}
                    >
                      🛒 {qtyInCart} in cart
                    </div>
                  )}
                </div>

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '14px', color: '#525450', fontWeight: 700, marginBottom: '4px' }}>
                    Supplier: {item.supplierName}
                  </div>

                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1A1C1A', marginBottom: '8px' }}>
                    {item.name}
                  </h3>

                  <p style={{ fontSize: '15px', color: '#525450', marginBottom: '14px', lineHeight: 1.4, flex: 1 }}>
                    {item.description}
                  </p>

                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27', marginBottom: '6px' }}>
                    ₱{item.price.toLocaleString()} <span style={{ fontSize: '15px', color: '#525450', fontWeight: 600 }}>/ {item.unit}</span>
                  </div>

                  <div style={{ fontSize: '15px', color: item.stockQuantity > 0 ? '#1E7E45' : '#BA3C3C', fontWeight: 800, marginBottom: '16px' }}>
                    {item.stockQuantity > 0 ? `✓ In Stock (${item.stockQuantity})` : '✕ Out of Stock'}
                  </div>

                  {!isPurchaser ? (
                    <div style={{
                      padding: '10px',
                      textAlign: 'center',
                      backgroundColor: '#f8fafc',
                      borderRadius: '10px',
                      fontWeight: 700,
                      color: '#64748b',
                      fontSize: '14px',
                      border: '1.5px solid #e2e8f0',
                    }}>
                      🏪 Catalog View
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                      {/* Add to Cart button */}
                      <button
                        type="button"
                        onClick={(e) => handleDirectAddToCart(item, 1, e)}
                        disabled={isOutOfStock || isMaxInCart}
                        className="btn btn-secondary"
                        style={{
                          backgroundColor: isRecentlyAdded ? '#EAF6EE' : '#F8F7F3',
                          borderColor: isRecentlyAdded ? '#10B981' : qtyInCart > 0 ? '#176B3A' : '#D8D6CF',
                          color: isOutOfStock ? '#94A3B8' : '#0E4A27',
                          fontWeight: 800,
                          fontSize: '14px',
                          padding: '10px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: isOutOfStock || isMaxInCart ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isRecentlyAdded ? '✓ Added!' : isMaxInCart ? 'Max in Cart' : qtyInCart > 0 ? `🛒 Add (+1)` : '🛒 Add to Cart'}
                      </button>

                      {/* Buy Now button */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenSupplyBuyNow(item, 1, e)}
                        disabled={isOutOfStock}
                        className="btn btn-primary"
                        style={{
                          fontWeight: 800,
                          fontSize: '14px',
                          padding: '10px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          opacity: isOutOfStock ? 0.5 : 1,
                        }}
                      >
                        ⚡ Buy Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Supplier Add Product Modal ─── */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27' }}>
                Add Supply Product
              </h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: '#F8F7F3', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Complete Fertilizer 14-14-14"
                  className="form-input"
                  style={{ fontSize: '18px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '18px' }}
                >
                  <option value="fertilizer">Fertilizers</option>
                  <option value="pesticide_herbicide_fungicide">Crop Protection</option>
                  <option value="seeds_seedlings">Seeds & Seedlings</option>
                  <option value="tools">Tools & Machinery</option>
                  <option value="ppe">Safety PPE</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Price (₱)</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="form-input"
                    style={{ fontSize: '18px' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <input
                    type="text"
                    required
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    placeholder="e.g. 50kg bag"
                    className="form-input"
                    style={{ fontSize: '18px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Available Stock Quantity</label>
                <input
                  type="number"
                  required
                  value={prodStock}
                  onChange={(e) => setProdStock(Number(e.target.value))}
                  className="form-input"
                  style={{ fontSize: '18px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Product Image (optional)</label>
                <input
                  ref={prodFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProdImageFile(file);
                      setProdImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  style={{ display: 'none' }}
                />

                {!prodImagePreview ? (
                  <div
                    onClick={() => prodFileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #0E4A27',
                      borderRadius: '14px',
                      padding: '18px',
                      textAlign: 'center',
                      backgroundColor: '#F0F9F3',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '26px', marginBottom: '4px' }}>📦📸</div>
                    <div style={{ fontWeight: 700, color: '#0E4A27', fontSize: '15px' }}>Click to select product image</div>
                    <div style={{ fontSize: '13px', color: '#525450' }}>Supports JPG, PNG, WEBP (Max 10MB)</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderRadius: '14px', border: '1.5px solid #0E4A27', backgroundColor: '#F0F9F3' }}>
                    <img
                      src={prodImagePreview}
                      alt="Product preview"
                      style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: '#1A1C1A' }}>{prodImageFile?.name || 'Selected product image'}</div>
                      <div style={{ fontSize: '13px', color: '#176B3A', fontWeight: 600 }}>Ready to upload</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProdImageFile(null);
                        setProdImagePreview('');
                        if (prodFileInputRef.current) prodFileInputRef.current.value = '';
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '13px', color: '#b91c1c', borderColor: '#fca5a5' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Description</label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Describe your agricultural supply product..."
                  className="form-input"
                  rows={3}
                  style={{ fontSize: '18px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary btn-large" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submittingProd} className="btn btn-primary btn-large" style={{ flex: 2 }}>
                  {submittingProd ? 'Saving…' : 'Publish Product →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Product Quick-View Details Modal ─── */}
      {viewProduct && (
        <div className="modal-backdrop" onClick={() => setViewProduct(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="badge badge-info" style={{ fontSize: '13px', marginBottom: '6px', display: 'inline-block' }}>
                  {categories.find((c) => c.key === viewProduct.category)?.label || 'Agri-Supply'}
                </span>
                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27' }}>
                  {viewProduct.name}
                </h2>
                <div style={{ fontSize: '15px', color: '#525450', marginTop: '2px' }}>
                  Supplied by <strong>{viewProduct.supplierName}</strong>
                </div>
              </div>
              <button
                onClick={() => setViewProduct(null)}
                style={{
                  background: '#F8F7F3',
                  border: 'none',
                  fontSize: '22px',
                  cursor: 'pointer',
                  color: '#525450',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ height: '240px', background: '#EAF6EE', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
              <img
                src={getImageUrl(viewProduct.images?.[0], categoryImages[viewProduct.category] ?? 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80')}
                alt={viewProduct.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0E4A27' }}>
                  ₱{viewProduct.price.toLocaleString()} <span style={{ fontSize: '17px', color: '#525450', fontWeight: 600 }}>/ {viewProduct.unit}</span>
                </div>
                <div style={{ fontSize: '15px', color: viewProduct.stockQuantity > 0 ? '#1E7E45' : '#BA3C3C', fontWeight: 700, marginTop: '2px' }}>
                  {viewProduct.stockQuantity > 0 ? `✓ ${viewProduct.stockQuantity} available in stock` : '✕ Currently Out of Stock'}
                </div>
              </div>
              <span className="badge badge-verified" style={{ fontSize: '14px' }}>
                ✓ Certified Product
              </span>
            </div>

            <div style={{ padding: '16px', borderRadius: '14px', background: '#F8F7F3', border: '1.5px solid #E4E2DC', marginBottom: '22px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#1A1C1A', marginBottom: '4px' }}>
                Product Description:
              </div>
              <div style={{ fontSize: '15px', color: '#525450', lineHeight: 1.5 }}>
                {viewProduct.description || 'Certified agricultural supply input suitable for regional farming conditions in Northern Mindanao.'}
              </div>
            </div>

            {/* Purchase Controls vs Catalog Notice */}
            {!isPurchaser ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '14px',
                  textAlign: 'center',
                  lineHeight: 1.5,
                }}>
                  ℹ️ Ordering supplies and shopping cart are available for registered Farmers and Buyers.
                </div>
                <button
                  type="button"
                  onClick={() => setViewProduct(null)}
                  className="btn btn-secondary btn-large"
                  style={{ minHeight: '48px', fontSize: '15px', fontWeight: 800 }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* Quantity Selector */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '16px', fontWeight: 800, color: '#1A1C1A', display: 'block', marginBottom: '8px' }}>
                    Select Quantity:
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setViewQuantity((prev) => Math.max(1, prev - 1))}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        border: '2px solid #D8D6CF',
                        background: '#FFFFFF',
                        fontSize: '22px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={viewQuantity}
                      onChange={(e) => setViewQuantity(Math.max(1, Math.min(viewProduct.stockQuantity, Number(e.target.value) || 1)))}
                      min="1"
                      max={viewProduct.stockQuantity}
                      className="form-input"
                      style={{
                        fontSize: '20px',
                        fontWeight: 800,
                        textAlign: 'center',
                        maxWidth: '120px',
                        minHeight: '48px',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setViewQuantity((prev) => Math.min(viewProduct.stockQuantity, prev + 1))}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        border: '2px solid #D8D6CF',
                        background: '#FFFFFF',
                        fontSize: '22px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      +
                    </button>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', color: '#525450', fontWeight: 700 }}>Total Subtotal:</div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27' }}>
                        ₱{(viewQuantity * viewProduct.price).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dual CTA Buttons (Shopee style) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      handleDirectAddToCart(viewProduct, viewQuantity);
                      setViewProduct(null);
                    }}
                    disabled={viewProduct.stockQuantity <= 0}
                    className="btn btn-secondary btn-large"
                    style={{ minHeight: '52px', fontSize: '16px', fontWeight: 800 }}
                  >
                    🛒 Add to Cart
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenSupplyBuyNow(viewProduct, viewQuantity)}
                    disabled={viewProduct.stockQuantity <= 0}
                    className="btn btn-primary btn-large"
                    style={{ minHeight: '52px', fontSize: '16px', fontWeight: 800 }}
                  >
                    ⚡ Buy Now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Supply Express Checkout Modal (Buy Now) ─── */}
      {buyNowProduct && (
        <div className="modal-backdrop" onClick={() => setBuyNowProduct(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '660px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}
          >
            {placedSupplyOrder ? (
              /* ─── Order Placed Successfully Screen ─── */
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#EAF6EE',
                    color: '#176B3A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '44px',
                    margin: '0 auto 20px',
                    border: '3px solid #176B3A',
                  }}
                >
                  ✓
                </div>

                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0E4A27', marginBottom: '8px' }}>
                  Supply Order Placed!
                </h2>
                <p style={{ fontSize: '17px', color: '#525450', marginBottom: '24px' }}>
                  Your direct order has been received by the supplier. Your shopping cart remains untouched!
                </p>

                <div
                  style={{
                    background: '#F8F7F3',
                    border: '2px solid #E4E2DC',
                    borderRadius: '16px',
                    padding: '22px',
                    textAlign: 'left',
                    marginBottom: '26px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '15px', color: '#525450', fontWeight: 600 }}>Order ID</span>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#0E4A27', fontFamily: 'monospace' }}>
                      #{placedSupplyOrder.id.slice(-8).toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '15px', color: '#525450', fontWeight: 600 }}>Product</span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#1A1C1A' }}>
                      {buyNowProduct.name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '15px', color: '#525450', fontWeight: 600 }}>Supplier</span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#1A1C1A' }}>
                      {buyNowProduct.supplierName}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '15px', color: '#525450', fontWeight: 600 }}>Quantity</span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#1A1C1A' }}>
                      {buyNowQuantity} {buyNowProduct.unit}
                    </span>
                  </div>

                  <div
                    style={{
                      borderTop: '2px dashed #D8D6CF',
                      paddingTop: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '17px', fontWeight: 800, color: '#1A1C1A' }}>Total Amount</span>
                    <span style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27' }}>
                      ₱{(buyNowQuantity * buyNowProduct.price).toLocaleString()}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: '14px',
                      padding: '12px 14px',
                      background: '#FFFFFF',
                      borderRadius: '10px',
                      border: '1px solid #D8D6CF',
                      fontSize: '14px',
                      color: '#525450',
                    }}
                  >
                    📍 <strong>Fulfillment:</strong> {buyNowDeliveryMethod === 'delivery' ? `Delivery to ${buyNowAddress}` : 'In-Store Pickup'} • Phone: {buyNowPhone} • {buyNowPaymentMethod === 'cod' ? 'Cash on Delivery/Pickup' : 'GCash'}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <button
                    onClick={() => setBuyNowProduct(null)}
                    className="btn btn-secondary btn-large"
                    style={{ minHeight: '52px', fontSize: '16px' }}
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={() => {
                      setBuyNowProduct(null);
                      navigate('/supply/orders');
                    }}
                    className="btn btn-primary btn-large"
                    style={{ minHeight: '52px', fontSize: '16px' }}
                  >
                    Track in My Orders →
                  </button>
                </div>
              </div>
            ) : (
              /* ─── Express Checkout Form ─── */
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-warning" style={{ fontSize: '12px' }}>
                        ⚡ Express Buy Now
                      </span>
                      <span style={{ fontSize: '13px', color: '#525450' }}>Cart items untouched</span>
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27', marginTop: '4px' }}>
                      {buyNowProduct.name}
                    </h2>
                    <div style={{ fontSize: '15px', color: '#525450' }}>
                      Supplier: <strong>{buyNowProduct.supplierName}</strong>
                    </div>
                  </div>
                  <button
                    onClick={() => setBuyNowProduct(null)}
                    style={{
                      background: '#F8F7F3',
                      border: 'none',
                      fontSize: '22px',
                      cursor: 'pointer',
                      color: '#525450',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* 1. Quantity & Subtotal */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '16px', fontWeight: 800, color: '#1A1C1A', display: 'block', marginBottom: '8px' }}>
                    1. Quantity to Buy
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setBuyNowQuantity((prev) => Math.max(1, prev - 1))}
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        border: '2px solid #D8D6CF',
                        background: '#FFFFFF',
                        fontSize: '22px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={buyNowQuantity}
                      onChange={(e) => setBuyNowQuantity(Math.max(1, Math.min(buyNowProduct.stockQuantity, Number(e.target.value) || 1)))}
                      min="1"
                      max={buyNowProduct.stockQuantity}
                      className="form-input"
                      style={{
                        fontSize: '20px',
                        fontWeight: 800,
                        textAlign: 'center',
                        maxWidth: '120px',
                        minHeight: '46px',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setBuyNowQuantity((prev) => Math.min(buyNowProduct.stockQuantity, prev + 1))}
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        border: '2px solid #D8D6CF',
                        background: '#FFFFFF',
                        fontSize: '22px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      +
                    </button>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', color: '#525450', fontWeight: 700 }}>Total:</div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27' }}>
                        ₱{(buyNowQuantity * buyNowProduct.price).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Fulfillment Method */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '16px', fontWeight: 800, color: '#1A1C1A', display: 'block', marginBottom: '8px' }}>
                    2. Fulfillment Method
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setBuyNowDeliveryMethod('delivery')}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: `2.5px solid ${buyNowDeliveryMethod === 'delivery' ? '#176B3A' : '#D8D6CF'}`,
                        background: buyNowDeliveryMethod === 'delivery' ? '#EAF6EE' : '#FFFFFF',
                        color: buyNowDeliveryMethod === 'delivery' ? '#0E4A27' : '#1A1C1A',
                        fontWeight: 800,
                        fontSize: '15px',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      🚚 Delivery to Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuyNowDeliveryMethod('pickup')}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: `2.5px solid ${buyNowDeliveryMethod === 'pickup' ? '#176B3A' : '#D8D6CF'}`,
                        background: buyNowDeliveryMethod === 'pickup' ? '#EAF6EE' : '#FFFFFF',
                        color: buyNowDeliveryMethod === 'pickup' ? '#0E4A27' : '#1A1C1A',
                        fontWeight: 800,
                        fontSize: '15px',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      🏬 In-Store Pickup
                    </button>
                  </div>
                </div>

                {/* 3. Address & Phone */}
                <div style={{ marginBottom: '20px' }}>
                  {buyNowDeliveryMethod === 'delivery' && (
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '15px', fontWeight: 800, color: '#1A1C1A', display: 'block', marginBottom: '6px' }}>
                        Delivery Address / Barangay *
                      </label>
                      <input
                        type="text"
                        value={buyNowAddress}
                        onChange={(e) => setBuyNowAddress(e.target.value)}
                        placeholder="e.g. Purok 5, Poblacion, Malaybalay, Bukidnon"
                        className="form-input"
                        style={{ fontSize: '15px' }}
                      />
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '15px', fontWeight: 800, color: '#1A1C1A', display: 'block', marginBottom: '6px' }}>
                      Contact Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={buyNowPhone}
                      onChange={(e) => setBuyNowPhone(e.target.value)}
                      placeholder="e.g. 0917 123 4567"
                      className="form-input"
                      style={{ fontSize: '15px' }}
                    />
                  </div>
                </div>

                {/* 4. Payment Method */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '16px', fontWeight: 800, color: '#1A1C1A', display: 'block', marginBottom: '8px' }}>
                    3. Payment Method
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setBuyNowPaymentMethod('cod')}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: `2.5px solid ${buyNowPaymentMethod === 'cod' ? '#176B3A' : '#D8D6CF'}`,
                        background: buyNowPaymentMethod === 'cod' ? '#EAF6EE' : '#FFFFFF',
                        color: buyNowPaymentMethod === 'cod' ? '#0E4A27' : '#1A1C1A',
                        fontWeight: 800,
                        fontSize: '15px',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      💵 {buyNowDeliveryMethod === 'pickup' ? 'Cash on Pickup' : 'Cash on Delivery (COD)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuyNowPaymentMethod('gcash')}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: `2.5px solid ${buyNowPaymentMethod === 'gcash' ? '#176B3A' : '#D8D6CF'}`,
                        background: buyNowPaymentMethod === 'gcash' ? '#EAF6EE' : '#FFFFFF',
                        color: buyNowPaymentMethod === 'gcash' ? '#0E4A27' : '#1A1C1A',
                        fontWeight: 800,
                        fontSize: '15px',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      📱 GCash / E-Wallet
                    </button>
                  </div>
                </div>

                {/* 5. Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '14px', marginTop: '24px' }}>
                  <button
                    type="button"
                    onClick={() => setBuyNowProduct(null)}
                    className="btn btn-secondary btn-large"
                    style={{ minHeight: '52px', fontSize: '16px' }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handlePlaceSupplyBuyNow}
                    disabled={isSubmittingBuyNow}
                    className="btn btn-primary btn-large"
                    style={{
                      minHeight: '52px',
                      fontSize: '17px',
                      fontWeight: 800,
                      opacity: isSubmittingBuyNow ? 0.7 : 1,
                      cursor: isSubmittingBuyNow ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isSubmittingBuyNow ? 'Placing Order...' : `🛒 Place Order (₱${(buyNowQuantity * buyNowProduct.price).toLocaleString()})`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
