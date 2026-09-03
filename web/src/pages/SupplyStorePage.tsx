import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supplyApi } from '../api/supply';
import type { SupplyProduct } from '../types/supply';

const categories: { key: string; label: string; icon: string }[] = [
  { key: 'all',                            label: 'All Inputs',        icon: '🏪' },
  { key: 'fertilizer',                     label: 'Fertilizers',       icon: '🌱' },
  { key: 'pesticide_herbicide_fungicide', label: 'Crop Protection',  icon: '🧪' },
  { key: 'seeds_seedlings',                label: 'Seeds & Seedlings', icon: '🌽' },
  { key: 'tools',                          label: 'Tools & Machinery', icon: '🔧' },
  { key: 'ppe',                            label: 'Safety PPE',        icon: '🥽' },
];

const categoryImages: Record<string, string> = {
  fertilizer:                     'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80',
  pesticide_herbicide_fungicide: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80',
  seeds_seedlings:                'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80',
  tools:                          'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80',
  ppe:                            'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
};

export const SupplyStorePage: React.FC = () => {
  const navigate = useNavigate();
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
    window.dispatchEvent(new Event('cart-updated'));
    setFeedback(`✓ Added ${addQty} × ${addingProduct.name} to cart!`);
    setTimeout(() => {
      setAddingProduct(null);
      setFeedback(null);
    }, 1800);
  };

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
            <button
              onClick={() => navigate('/supply/cart')}
              className="btn btn-accent btn-large"
              style={{ fontSize: '18px' }}
            >
              🛒 View Cart ({cartCount})
            </button>
          </div>
        </div>
      </div>

      {/* ─── Feedback Toast ─── */}
      {feedback && (
        <div
          style={{
            padding: '20px 24px',
            background: '#EAF6EE',
            border: '3px solid #176B3A',
            borderRadius: '18px',
            color: '#176B3A',
            fontWeight: 800,
            fontSize: '20px',
            marginBottom: '28px',
          }}
        >
          {feedback}
        </div>
      )}

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
          {products.map((item) => (
            <div key={item.id} className="card card-interactive" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ position: 'relative', height: '200px', background: '#EAF6EE' }}>
                <img
                  src={categoryImages[item.category] ?? 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80'}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <span className="badge badge-verified" style={{ background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    ✓ Verified Supplier
                  </span>
                </div>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ fontSize: '15px', color: '#525450', fontWeight: 700, marginBottom: '6px' }}>
                  Supplier: {item.supplierName}
                </div>

                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1A1C1A', marginBottom: '8px' }}>
                  {item.name}
                </h3>

                <p style={{ fontSize: '16px', color: '#525450', marginBottom: '14px', lineHeight: 1.5 }}>
                  {item.description}
                </p>

                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27', marginBottom: '8px' }}>
                  ₱{item.price.toLocaleString()} <span style={{ fontSize: '16px', color: '#525450', fontWeight: 600 }}>/ {item.unit}</span>
                </div>

                <div style={{ fontSize: '16px', color: item.stockQuantity > 0 ? '#1E7E45' : '#BA3C3C', fontWeight: 800, marginBottom: '20px' }}>
                  {item.stockQuantity > 0 ? `✓ In Stock (${item.stockQuantity} ${item.unit}s available)` : '✕ Out of Stock'}
                </div>

                <button
                  onClick={() => {
                    setAddingProduct(item);
                    setAddQty(1);
                  }}
                  disabled={item.stockQuantity <= 0}
                  className="btn btn-primary btn-full btn-large"
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Add to Cart Modal ─── */}
      {addingProduct && (
        <div className="modal-backdrop" onClick={() => setAddingProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27' }}>
                Add to Cart
              </h2>
              <button onClick={() => setAddingProduct(null)} style={{ background: '#F8F7F3', border: 'none', fontSize: '24px', cursor: 'pointer', width: '42px', height: '42px', borderRadius: '50%' }}>✕</button>
            </div>

            <div style={{ padding: '20px', borderRadius: '16px', background: '#EAF6EE', border: '2px solid #176B3A', marginBottom: '24px' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#0E4A27' }}>
                {addingProduct.name}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#176B3A', marginTop: '4px' }}>
                ₱{addingProduct.price.toLocaleString()} per {addingProduct.unit}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label">Quantity to Order ({addingProduct.unit}):</label>
              <input
                type="number"
                value={addQty}
                onChange={(e) => setAddQty(Math.max(1, Number(e.target.value)))}
                min="1"
                max={addingProduct.stockQuantity}
                className="form-input"
                style={{ fontSize: '22px', fontWeight: 800 }}
              />
            </div>

            <div style={{ display: 'flex', gap: '14px' }}>
              <button onClick={() => setAddingProduct(null)} className="btn btn-secondary btn-large" style={{ flex: 1 }}>
                Cancel
              </button>
              <button onClick={handleAddToCart} className="btn btn-primary btn-large" style={{ flex: 2 }}>
                Confirm Add to Cart →
              </button>
            </div>
          </div>
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
    </div>
  );
};
