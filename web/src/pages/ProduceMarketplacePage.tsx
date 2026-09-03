import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { produceApi } from '../api/produce';
import type { ProduceListing } from '../types/produce';

const categories = [
  { label: 'All Crops', icon: '🌱' },
  { label: 'Vegetables', icon: '🥬' },
  { label: 'Fruits', icon: '🍌' },
  { label: 'Grains', icon: '🌾' },
  { label: 'Root Crops', icon: '🥔' },
  { label: 'Livestock', icon: '🐓' },
];

const sampleCropListings = [
  {
    id: 'crop-1',
    cropName: 'Fresh Red Tomatoes (Kamatis)',
    category: 'Vegetables',
    pricePerUnit: 65,
    unit: 'kg',
    quantity: 120,
    location: 'Cagayan de Oro, Misamis Oriental',
    sellerName: 'Juan Dela Cruz',
    sellerVerified: true,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    description: 'Freshly harvested vine-ripened red tomatoes from Bukidnon farm.',
  },
  {
    id: 'crop-2',
    cropName: 'Sweet Yellow Corn (Mais)',
    category: 'Grains',
    pricePerUnit: 42,
    unit: 'kg',
    quantity: 500,
    location: 'Malaybalay, Bukidnon',
    sellerName: 'Pedro Penduko',
    sellerVerified: true,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
    description: 'High-grade yellow corn suitable for feed or food processing.',
  },
  {
    id: 'crop-3',
    cropName: 'Carabao Mangoes (Mangga)',
    category: 'Fruits',
    pricePerUnit: 95,
    unit: 'kg',
    quantity: 250,
    location: 'Gingoog, Misamis Oriental',
    sellerName: 'Maria Santos',
    sellerVerified: true,
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
    description: 'Sweet Carabao mangoes, freshly harvested yesterday.',
  },
  {
    id: 'crop-4',
    cropName: 'Purple Eggplant (Talong)',
    category: 'Vegetables',
    pricePerUnit: 48,
    unit: 'kg',
    quantity: 180,
    location: 'Valencia, Bukidnon',
    sellerName: 'Roberto Garcia',
    sellerVerified: true,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    description: 'Organic eggplant harvested at peak freshness.',
  },
];

export const ProduceMarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [_loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Crops');
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState('');
  const [buyQuantity, setBuyQuantity] = useState(10);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await produceApi.listListings();
      if (res && res.length > 0) {
        setListings(res);
      } else {
        setListings(sampleCropListings as any);
      }
    } catch {
      setListings(sampleCropListings as any);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter((item: any) => {
    const matchesCategory =
      selectedCategory === 'All Crops' ||
      item.category?.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      search.trim() === '' ||
      item.cropName?.toLowerCase().includes(search.toLowerCase()) ||
      item.location?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBuyNow = () => {
    if (!selectedListing) return;
    const total = buyQuantity * selectedListing.pricePerUnit;
    setOrderSuccessMsg(`✓ Order Confirmed! You ordered ${buyQuantity} kg of ${selectedListing.cropName} for ₱${total.toLocaleString()}. Seller will call your phone.`);
    setTimeout(() => {
      setOrderSuccessMsg('');
      setSelectedListing(null);
    }, 5000);
  };

  return (
    <div className="app-container" style={{ paddingBottom: '40px' }}>
      {/* ─── Back Button & Page Title ─── */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-secondary"
          style={{ marginBottom: '16px', fontSize: '17px' }}
        >
          ← Back to Dashboard
        </button>

        <h1 style={{ fontSize: '34px', fontWeight: 800, color: '#0E4A27' }}>
          Crop Marketplace
        </h1>
        <p style={{ fontSize: '20px', color: '#525450', marginTop: '4px' }}>
          Buy fresh crops directly from verified farmers in Northern Mindanao.
        </p>
      </div>

      {/* ─── Search Field & Category Pills ─── */}
      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type crop name to search (e.g. Tomato, Corn)..."
            aria-label="Search for crops or products"
            className="form-input"
            style={{ fontSize: '18px', minHeight: '56px' }}
          />
        </div>

        {/* Category Buttons */}
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
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

      {/* ─── Success Confirmation Toast ─── */}
      {orderSuccessMsg && (
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
          {orderSuccessMsg}
        </div>
      )}

      {/* ─── Crop Cards Grid ─── */}
      {filteredListings.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '28px',
          }}
        >
          {filteredListings.map((item: any) => (
            <div key={item.id} className="card card-interactive" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ position: 'relative', height: '200px', background: '#EAF6EE' }}>
                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'}
                  alt={item.cropName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <span className="badge badge-verified" style={{ background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    ✓ Verified Farmer
                  </span>
                </div>
              </div>

              <div style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1A1C1A', marginBottom: '8px' }}>
                  {item.cropName}
                </h3>

                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27', marginBottom: '8px' }}>
                  ₱{item.pricePerUnit} <span style={{ fontSize: '16px', color: '#525450', fontWeight: 600 }}>per {item.unit || 'kg'}</span>
                </div>

                <div style={{ fontSize: '16px', color: '#525450', marginBottom: '10px', fontWeight: 600 }}>
                  📦 {item.quantity} {item.unit || 'kg'} available for order
                </div>

                <div style={{ fontSize: '16px', color: '#1A1C1A', fontWeight: 700, marginBottom: '20px' }}>
                  📍 {item.location || 'Northern Mindanao'}
                </div>

                <button
                  onClick={() => setSelectedListing(item)}
                  className="btn btn-primary btn-full btn-large"
                >
                  See Details & Buy →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '12px' }}>🌱</div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27', marginBottom: '8px' }}>
            No crops found in this category
          </h2>
          <p style={{ fontSize: '18px', color: '#525450', marginBottom: '24px' }}>
            Tap the button below to view all crop listings.
          </p>
          <button onClick={() => setSelectedCategory('All Crops')} className="btn btn-primary btn-large">
            Show All Crops
          </button>
        </div>
      )}

      {/* ─── Product Details Modal ─── */}
      {selectedListing && (
        <div className="modal-backdrop" onClick={() => setSelectedListing(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27' }}>
                {selectedListing.cropName}
              </h2>
              <button
                onClick={() => setSelectedListing(null)}
                style={{ background: '#F8F7F3', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#525450', width: '42px', height: '42px', borderRadius: '50%' }}
              >
                ✕
              </button>
            </div>

            <img
              src={selectedListing.imageUrl}
              alt={selectedListing.cropName}
              style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '16px', marginBottom: '20px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '34px', fontWeight: 800, color: '#0E4A27' }}>
                  ₱{selectedListing.pricePerUnit} per {selectedListing.unit || 'kg'}
                </div>
                <div style={{ fontSize: '17px', color: '#525450', marginTop: '4px', fontWeight: 600 }}>
                  Available Harvest: <strong>{selectedListing.quantity} {selectedListing.unit || 'kg'}</strong>
                </div>
              </div>
              <span className="badge badge-verified" style={{ fontSize: '16px' }}>
                ✓ Verified Farmer
              </span>
            </div>

            <div style={{ padding: '18px', borderRadius: '16px', background: '#F8F7F3', border: '2px solid #E4E2DC', marginBottom: '24px' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#1A1C1A', marginBottom: '4px' }}>
                Farmer Info:
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0E4A27' }}>
                👤 {selectedListing.sellerName || 'Juan Dela Cruz'}
              </div>
              <div style={{ fontSize: '16px', color: '#525450', marginTop: '4px' }}>
                📍 Location: {selectedListing.location || 'Cagayan de Oro'}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '18px', fontWeight: 800, color: '#1A1C1A', display: 'block', marginBottom: '8px' }}>
                How many kilograms would you like to buy?
              </label>
              <input
                type="number"
                value={buyQuantity}
                onChange={(e) => setBuyQuantity(Number(e.target.value))}
                min="1"
                max={selectedListing.quantity}
                className="form-input"
                style={{ fontSize: '22px', fontWeight: 800 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <button
                onClick={() => alert(`Calling seller ${selectedListing.sellerName || 'Juan Dela Cruz'} at 0917-123-4567...`)}
                className="btn btn-secondary btn-large"
              >
                📞 Call Seller Directly
              </button>

              <button
                onClick={handleBuyNow}
                className="btn btn-primary btn-large"
              >
                🛒 Buy Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
