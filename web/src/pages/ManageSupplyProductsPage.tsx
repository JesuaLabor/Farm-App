import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supplyApi } from '../api/supply';
import { api, getImageUrl } from '../api';
import type { SupplyCategory, SupplyProduct } from '../types/supply';

const categories: { key: SupplyCategory; label: string }[] = [
  { key: 'fertilizer', label: 'Fertilizers' },
  { key: 'pesticide_herbicide_fungicide', label: 'Crop Protection' },
  { key: 'seeds_seedlings', label: 'Seeds & Seedlings' },
  { key: 'tools', label: 'Tools & Equipment' },
  { key: 'ppe', label: 'Safety PPE' },
];

export const ManageSupplyProductsPage: React.FC = () => {
  const navigate = useNavigate();
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (product) {
      setEditingId(product.id);
      setName(product.name);
      setCategory(product.category);
      setDescription(product.description);
      setPrice(product.price);
      setStockQuantity(product.stockQuantity);
      setUnit(product.unit);
      const img = product.images?.[0] || '';
      setExistingImageUrl(img);
      setImagePreview(img ? getImageUrl(img) : '');
    } else {
      setEditingId(null);
      setName('');
      setCategory('fertilizer');
      setDescription('');
      setPrice(1000);
      setStockQuantity(50);
      setUnit('bag');
      setExistingImageUrl('');
      setImagePreview('');
    }
    setShowForm(true);
    setMessage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setExistingImageUrl('');
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    let finalImageUrl = existingImageUrl;
    if (imageFile) {
      try {
        const uploadRes = await api.uploadImage(imageFile);
        finalImageUrl = uploadRes.url;
      } catch (err: any) {
        setMessage({ type: 'error', text: 'Failed to upload product image: ' + (err.response?.data?.error || err.message) });
        setSaving(false);
        return;
      }
    }

    const payload = {
      name,
      category,
      description,
      price,
      stockQuantity,
      unit,
      images: finalImageUrl ? [finalImageUrl] : [],
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
      setImageFile(null);
      setExistingImageUrl('');
      setImagePreview('');
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

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/supply')}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                fontWeight: 700,
                border: '1.5px solid #cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
              }}
            >
              🏪 View Storefront
            </button>

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
                fontSize: '14px',
              }}
            >
              + Add New Product
            </button>
          </div>
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

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Product Image (optional)</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />

                  {!imagePreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: '2px dashed #ca8a04',
                        borderRadius: '12px',
                        padding: '18px',
                        textAlign: 'center',
                        backgroundColor: '#fefce8',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}>📦📸</div>
                      <div style={{ fontWeight: 700, color: '#854d0e', fontSize: '14px' }}>Click to upload product photo</div>
                      <div style={{ fontSize: '12px', color: '#a16207' }}>Supports JPG, PNG, WEBP (Max 10MB)</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px', borderRadius: '12px', border: '1px solid #fef08a', backgroundColor: '#fefce8' }}>
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{imageFile?.name || 'Current product photo'}</div>
                        <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>Ready to save</div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #fca5a5', backgroundColor: '#fff', color: '#dc2626', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={getImageUrl(item.images[0])}
                      alt={item.name}
                      style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                    />
                  ) : (
                    <div style={{ width: '64px', height: '64px', borderRadius: '10px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                      📦
                    </div>
                  )}
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
