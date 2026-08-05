import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supplyApi } from '../api/supply';
import type { SupplyCategory, SupplyProduct } from '../types/supply';

const categories: { key: SupplyCategory; label: string }[] = [
  { key: 'fertilizer', label: 'Fertilizers' },
  { key: 'pesticide_herbicide_fungicide', label: 'Crop Protection' },
  { key: 'seeds_seedlings', label: 'Seeds & Seedlings' },
  { key: 'tools', label: 'Tools & Equipment' },
  { key: 'ppe', label: 'Safety PPE' },
];

export const ManageSupplyProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<SupplyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<SupplyCategory>('fertilizer');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(1000);
  const [stockQuantity, setStockQuantity] = useState<number>(50);
  const [unit, setUnit] = useState('bag');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMyProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await supplyApi.listProducts({ supplierId: user.id });
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, [user]);

  const handleOpenForm = (product?: SupplyProduct) => {
    if (product) {
      setEditingId(product.id);
      setName(product.name);
      setCategory(product.category);
      setDescription(product.description);
      setPrice(product.price);
      setStockQuantity(product.stockQuantity);
      setUnit(product.unit);
    } else {
      setEditingId(null);
      setName('');
      setCategory('fertilizer');
      setDescription('');
      setPrice(1000);
      setStockQuantity(50);
      setUnit('bag');
    }
    setShowForm(true);
    setMessage(null);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      name,
      category,
      description,
      price,
      stockQuantity,
      unit,
    };

    try {
      if (editingId) {
        await supplyApi.updateProduct(editingId, payload);
        setMessage({ type: 'success', text: 'Product updated successfully!' });
      } else {
        await supplyApi.createProduct(payload);
        setMessage({ type: 'success', text: 'New supply product added!' });
      }
      setShowForm(false);
      fetchMyProducts();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to save product.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await supplyApi.deleteProduct(id);
      fetchMyProducts();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete product');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>Supply Inventory Catalog</h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Add and manage agricultural input listings.</p>
          </div>

          <button
            onClick={() => handleOpenForm()}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              backgroundColor: '#ca8a04',
              color: '#fff',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            + Add New Product
          </button>
        </div>

        {message && (
          <div style={{ padding: '14px', borderRadius: '12px', marginBottom: '24px', backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2', color: message.type === 'success' ? '#166534' : '#991b1b' }}>
            {message.text}
          </div>
        )}

        {/* Modal Form */}
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <div className="glass-panel" style={{ backgroundColor: '#fff', width: '100%', maxWidth: '600px', borderRadius: '20px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{editingId ? 'Edit Product' : 'Add Supply Product'}</h2>
                <button onClick={() => setShowForm(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleSaveProduct}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Product Name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Complete 14-14-14 Fertilizer 50kg" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value as SupplyCategory)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                      {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Price (₱)</label>
                    <input type="number" min="1" required value={price} onChange={(e) => setPrice(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Stock Qty</label>
                    <input type="number" min="0" required value={stockQuantity} onChange={(e) => setStockQuantity(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Unit</label>
                    <input type="text" required value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="bag, liter, piece" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Description</label>
                  <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Product features, active ingredients, usage guidelines..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }} />
                </div>

                <button type="submit" disabled={saving} style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#ca8a04', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  {saving ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Product List */}
        {loading ? (
          <div>Loading products...</div>
        ) : products.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', borderRadius: '16px', textAlign: 'center' }}>
            <p style={{ color: '#64748b' }}>No supply products listed yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {products.map((item) => (
              <div key={item.id} className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{item.name}</h3>
                    <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', backgroundColor: '#fef9c3', color: '#854d0e' }}>
                      {item.category.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                    Stock: {item.stockQuantity} {item.unit}s • ₱{item.price}/{item.unit}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleOpenForm(item)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDeleteProduct(item.id)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#fef2f2', color: '#991b1b', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
