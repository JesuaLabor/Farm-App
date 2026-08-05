import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supplyApi } from '../api/supply';
import type { SupplyProduct } from '../types/supply';

const categories: { key: string; label: string; icon: string }[] = [
  { key: 'all',                            label: 'All inputs',         icon: '🏪' },
  { key: 'fertilizer',                     label: 'Fertilizers',        icon: '🌱' },
  { key: 'pesticide_herbicide_fungicide', label: 'Crop protection',    icon: '🧪' },
  { key: 'seeds_seedlings',                label: 'Seeds & seedlings',  icon: '🌽' },
  { key: 'tools',                          label: 'Tools & machinery',  icon: '🔧' },
  { key: 'ppe',                            label: 'Safety PPE',         icon: '🥽' },
];

const categoryImages: Record<string, string> = {
  fertilizer:                     'https://picsum.photos/seed/fertilizer/640/360',
  pesticide_herbicide_fungicide: 'https://picsum.photos/seed/pesticide/640/360',
  seeds_seedlings:                'https://picsum.photos/seed/seeds/640/360',
  tools:                          'https://picsum.photos/seed/machinery/640/360',
  ppe:                            'https://picsum.photos/seed/safety/640/360',
};

export const SupplyStorePage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<SupplyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Cart state in localStorage
  const [cartCount, setCartCount] = useState<number>(0);
  const [addingProduct, setAddingProduct] = useState<SupplyProduct | null>(null);
  const [addQty, setAddQty] = useState<number>(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Supplier Add Product Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('fertilizer');
  const [prodPrice, setProdPrice] = useState<number>(1450);
  const [prodUnit, setProdUnit] = useState('50kg bag');
  const [prodStock, setProdStock] = useState<number>(500);
  const [prodDesc, setProdDesc] = useState('');
  const [submittingProd, setSubmittingProd] = useState(false);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProd(true);
    try {
      await supplyApi.createProduct({
        name: prodName,
        category: prodCategory as any,
        price: prodPrice,
        unit: prodUnit,
        stockQuantity: prodStock,
        description: prodDesc,
      });
      setShowAddModal(false);
      setProdName(''); setProdDesc('');
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create supply product.');
    } finally {
      setSubmittingProd(false);
    }
  };

  const updateCartCount = () => {
    const raw = localStorage.getItem('agriconnect_cart');
    if (raw) {
      try {
        const items = JSON.parse(raw);
        const count = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setCartCount(count);
      } catch (e) {
        setCartCount(0);
      }
    } else {
      setCartCount(0);
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
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    updateCartCount();
  }, [activeCategory, search]);

  const handleAddToCart = () => {
    if (!addingProduct) return;

    const raw = localStorage.getItem('agriconnect_cart');
    let items: { product: SupplyProduct; quantity: number }[] = [];
    if (raw) {
      try { items = JSON.parse(raw); } catch (e) {}
    }

    const existingIndex = items.findIndex((i) => i.product.id === addingProduct.id);
    if (existingIndex > -1) {
      items[existingIndex].quantity += addQty;
    } else {
      items.push({ product: addingProduct, quantity: addQty });
    }

    localStorage.setItem('agriconnect_cart', JSON.stringify(items));
    updateCartCount();
    setFeedback(`Added ${addQty} × ${addingProduct.name} to cart!`);
    setTimeout(() => {
      setAddingProduct(null);
      setFeedback(null);
    }, 1500);
  };

  return (
    <div className="page-root">
      <Navbar />

      <main className="page-main">
        {/* ── Page Header Banner ──────────────────────────────── */}
        <div className="page-header-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span className="page-header-label">Agri-supply store</span>
            <h1 className="page-header-title">Quality agricultural inputs &amp; equipment</h1>
            <p className="page-header-sub">
              Certified fertilizers, seeds, crop protection, and machinery directly from verified suppliers.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {user?.role === 'supplier' && (
              <button className="btn btn--inverse" onClick={() => setShowAddModal(true)}>
                + Add supply product
              </button>
            )}
            <a href="/supply/cart" className="btn btn--inverse" style={{ textDecoration: 'none' }}>
              🛒 Cart ({cartCount})
            </a>
          </div>
        </div>

        {/* ── Category Pill Tabs ───────────────────────────────── */}
        <div className="pill-tabs-row">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`pill-tab${activeCategory === cat.key ? ' pill-tab--active' : ''}`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── Filter Bar ───────────────────────────────────────── */}
        <div className="filter-bar">
          <div className="filter-field" style={{ maxWidth: '400px' }}>
            <label className="filter-label">Search supply store</label>
            <input
              className="form-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Fertilizers, seeds, machinery…"
            />
          </div>
        </div>

        {/* ── Products Grid ────────────────────────────────────── */}
        {loading ? (
          <div className="listings-skeleton">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="skeleton-card">
                <div className="skeleton-img" />
                <div className="skeleton-body">
                  <div className="skeleton-line skeleton-line--short" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-line--med" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🚜</div>
            <h3 className="empty-state__title">No products found</h3>
            <p className="empty-state__desc">Try adjusting your search query or category filter.</p>
          </div>
        ) : (
          <div className="listings-grid">
            {products.map((item) => (
              <div key={item.id} className="listing-card">
                <div className="listing-card__img">
                  <img
                    src={categoryImages[item.category] ?? 'https://picsum.photos/seed/agrisupply/640/360'}
                    alt={item.name}
                  />
                  <span className="listing-card__category-badge">{item.category.replace('_', ' ')}</span>
                </div>

                <div className="listing-card__body">
                  <div className="listing-card__meta">
                    <span className="listing-card__farmer">by {item.supplierName}</span>
                    {item.isVerified && (
                      <span className="badge badge-green">✓ Verified</span>
                    )}
                  </div>

                  <h3 className="listing-card__name">{item.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '14px', lineHeight: 1.5, flex: 1 }}>
                    {item.description}
                  </p>

                  <div className="listing-card__price">
                    <span className="listing-card__price-value">₱{item.price.toLocaleString()}</span>
                    <span className="listing-card__price-unit"> / {item.unit}</span>
                  </div>

                  <p className="listing-card__stock" style={{ color: item.stockQuantity > 0 ? 'var(--green-600)' : 'var(--color-error)', fontWeight: 700 }}>
                    {item.stockQuantity > 0 ? `In Stock (${item.stockQuantity} ${item.unit}s)` : 'Out of Stock'}
                  </p>

                  <button
                    onClick={() => {
                      setAddingProduct(item);
                      setAddQty(1);
                    }}
                    disabled={item.stockQuantity <= 0}
                    className="btn btn--primary btn--full"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Add to Cart Modal ───────────────────────────────────── */}
      {addingProduct && (
        <div className="modal-backdrop" onClick={() => setAddingProduct(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-header__sub">Agri-supply store</p>
                <h2 className="modal-header__title">Add to cart</h2>
              </div>
              <button className="modal-close" onClick={() => setAddingProduct(null)}>✕</button>
            </div>

            {feedback && (
              <div className="feedback-box feedback-box--success">{feedback}</div>
            )}

            <div className="modal-details">
              <div className="modal-detail-row">
                <span>Product</span>
                <strong>{addingProduct.name}</strong>
              </div>
              <div className="modal-detail-row">
                <span>Supplier</span>
                <strong>{addingProduct.supplierName}</strong>
              </div>
              <div className="modal-detail-row">
                <span>Price</span>
                <strong className="modal-detail--accent">₱{addingProduct.price.toLocaleString()} / {addingProduct.unit}</strong>
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Quantity</label>
              <input
                className="form-input"
                type="number"
                min="1"
                max={addingProduct.stockQuantity}
                value={addQty}
                onChange={(e) => setAddQty(Number(e.target.value))}
              />
            </div>

            <div className="modal-total">
              <span>Total amount</span>
              <span className="modal-total__value">₱{(addQty * addingProduct.price).toLocaleString()}</span>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn btn--primary btn--full"
            >
              Confirm add to cart
            </button>
          </div>
        </div>
      )}
      {/* ── Supplier Add Product Modal ──────────────────────────── */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-header__sub">Supplier portal</p>
                <h2 className="modal-header__title">Add product to store catalog</h2>
              </div>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div className="form-field">
                <label className="form-label">Product Name *</label>
                <input className="form-input" type="text" required value={prodName} onChange={(e) => setProdName(e.target.value)} placeholder="e.g. Urea Fertilizer 46-0-0, Corn Seeds" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-field">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={prodCategory} onChange={(e) => setProdCategory(e.target.value)}>
                    {categories.filter(c => c.key !== 'all').map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Stock Quantity *</label>
                  <input className="form-input" type="number" required min="1" value={prodStock} onChange={(e) => setProdStock(Number(e.target.value))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-field">
                  <label className="form-label">Price (₱) *</label>
                  <input className="form-input" type="number" required min="1" value={prodPrice} onChange={(e) => setProdPrice(Number(e.target.value))} />
                </div>
                <div className="form-field">
                  <label className="form-label">Unit</label>
                  <input className="form-input" type="text" required value={prodUnit} onChange={(e) => setProdUnit(e.target.value)} placeholder="50kg bag, bottle, set" />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Description</label>
                <textarea className="form-input form-textarea" rows={3} value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} placeholder="Product specs, usage guidelines, certification details..." />
              </div>

              <button type="submit" disabled={submittingProd} className="btn btn--primary btn--full">
                {submittingProd ? 'Publishing…' : 'Publish supply product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
