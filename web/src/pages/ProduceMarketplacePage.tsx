import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { produceApi } from '../api/produce';
import type { ProduceListing } from '../types/produce';

const categories = ['All', 'Grains & Cereals', 'Vegetables', 'Fruits', 'Root Crops', 'Livestock & Poultry'];
const philippineRegions = [
  'All Regions',
  'NCR - National Capital Region',
  'CAR - Cordillera Administrative Region',
  'Region I - Ilocos Region',
  'Region II - Cagayan Valley',
  'Region III - Central Luzon',
  'Region IV-A - CALABARZON',
  'Region V - Bicol Region',
  'Region VI - Western Visayas',
  'Region VII - Central Visayas',
  'Region VIII - Eastern Visayas',
  'Region IX - Zamboanga Peninsula',
  'Region X - Northern Mindanao',
  'Region XI - Davao Region',
  'Region XII - SOCCSKSARGEN',
  'Region XIII - Caraga',
  'BARMM - Bangsamoro Autonomous Region',
];

const categoryIcons: Record<string, string> = {
  'All': '🌿',
  'Grains & Cereals': '🌾',
  'Vegetables': '🥬',
  'Fruits': '🍌',
  'Root Crops': '🥔',
  'Livestock & Poultry': '🐓',
};

// Seeded placeholder images per crop category
const categoryImages: Record<string, string> = {
  'Grains & Cereals': 'https://picsum.photos/seed/grain/640/360',
  'Vegetables': 'https://picsum.photos/seed/veggies/640/360',
  'Fruits': 'https://picsum.photos/seed/fruits/640/360',
  'Root Crops': 'https://picsum.photos/seed/rootcrop/640/360',
  'Livestock & Poultry': 'https://picsum.photos/seed/livestock/640/360',
};

export const ProduceMarketplacePage: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('All Regions');
  const [maxPrice, setMaxPrice] = useState<number>(0);

  const [selectedListing, setSelectedListing] = useState<ProduceListing | null>(null);
  const [purchaseQty, setPurchaseQty] = useState<number>(1);
  const [contactMsg, setContactMsg] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Farmer sell modal state
  const [showSellModal, setShowSellModal] = useState(false);
  const [cropName, setCropName] = useState('');
  const [sellCat, setSellCat] = useState('Grains & Cereals');
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState('kg');
  const [pricePerUnit, setPricePerUnit] = useState<number>(25);
  const [sellLocation, setSellLocationState] = useState(user?.region || 'Central Luzon');
  const [desc, setDesc] = useState('');
  const [submittingSell, setSubmittingSell] = useState(false);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSell(true);
    setFeedback(null);
    try {
      await produceApi.createListing({
        cropName,
        category: sellCat,
        quantity,
        unit,
        pricePerUnit,
        location: sellLocation,
        harvestDate: new Date().toISOString(),
        description: desc,
      });
      setShowSellModal(false);
      setCropName(''); setDesc('');
      fetchListings();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to list produce.');
    } finally {
      setSubmittingSell(false);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await produceApi.listListings({
        cropName: search || undefined,
        category: category !== 'All' ? category : undefined,
        location: location !== 'All Regions' ? location : undefined,
        maxPrice: maxPrice > 0 ? maxPrice : undefined,
        status: 'available',
      });
      setListings(data);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [search, category, location, maxPrice]);

  const handleInitiatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;

    setPurchasing(true);
    setFeedback(null);

    try {
      await produceApi.initiateTransaction({
        listingId: selectedListing.id,
        quantity: purchaseQty,
        contactMessage: contactMsg,
      });
      setFeedback({ type: 'success', text: 'Purchase request sent. Track it under My Orders.' });
      setTimeout(() => {
        setSelectedListing(null);
        setFeedback(null);
      }, 2000);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.response?.data?.error || 'Failed to initiate purchase.' });
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="page-root">
      <Navbar />

      <main className="page-main">
        {/* ── Page Header ──────────────────────────────────────── */}
        <div className="page-header-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span className="page-header-label">Produce marketplace</span>
            <h1 className="page-header-title">Fresh harvest, directly from farmers</h1>
            <p className="page-header-sub">
              Source high-quality crops, grains, and livestock with transparent pricing and direct contact.
            </p>
          </div>

          {user?.role === 'farmer' && (
            <button className="btn btn--inverse" onClick={() => setShowSellModal(true)}>
              + List produce for sale
            </button>
          )}
        </div>

        {/* ── Category Pill Tabs ────────────────────────────────── */}
        <div className="pill-tabs-row">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`pill-tab${category === cat ? ' pill-tab--active' : ''}`}
            >
              <span>{categoryIcons[cat]}</span>
              {cat}
            </button>
          ))}
        </div>

        {/* ── Filter Bar ───────────────────────────────────────── */}
        <div className="filter-bar">
          <div className="filter-field">
            <label className="filter-label">Search crop</label>
            <input
              className="form-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rice, Yellow Corn, Mango…"
            />
          </div>
          <div className="filter-field">
            <label className="filter-label">Region</label>
            <select
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {philippineRegions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <label className="filter-label">Max price (₱/unit)</label>
            <input
              className="form-input"
              type="number"
              value={maxPrice || ''}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              placeholder="Any price"
            />
          </div>
        </div>

        {/* ── Listings ─────────────────────────────────────────── */}
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
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🌾</div>
            <h3 className="empty-state__title">No listings found</h3>
            <p className="empty-state__desc">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map((item) => (
              <div key={item.id} className="listing-card">
                <div className="listing-card__img">
                  {item.photos && item.photos.length > 0 ? (
                    <img src={item.photos[0]} alt={item.cropName} />
                  ) : (
                    <img
                      src={categoryImages[item.category] ?? 'https://picsum.photos/seed/farm/640/360'}
                      alt={item.cropName}
                    />
                  )}
                  <span className="listing-card__category-badge">{item.category}</span>
                </div>

                <div className="listing-card__body">
                  <div className="listing-card__meta">
                    <span className="listing-card__location">📍 {item.location}</span>
                  </div>
                  <h3 className="listing-card__name">{item.cropName}</h3>
                  <p className="listing-card__farmer">by {item.farmerName}</p>

                  <div className="listing-card__price">
                    <span className="listing-card__price-value">₱{item.pricePerUnit.toLocaleString()}</span>
                    <span className="listing-card__price-unit"> / {item.unit}</span>
                  </div>
                  <p className="listing-card__stock">
                    {item.quantity} {item.unit} available
                  </p>

                  <button
                    className="btn btn--primary btn--full"
                    onClick={() => {
                      setSelectedListing(item);
                      setPurchaseQty(1);
                      setContactMsg('');
                      setFeedback(null);
                    }}
                  >
                    View details &amp; buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Purchase Modal ───────────────────────────────────────── */}
      {selectedListing && (
        <div className="modal-backdrop" onClick={() => setSelectedListing(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-header__sub">Purchase request</p>
                <h2 className="modal-header__title">{selectedListing.cropName}</h2>
              </div>
              <button className="modal-close" onClick={() => setSelectedListing(null)}>✕</button>
            </div>

            {feedback && (
              <div className={`feedback-box feedback-box--${feedback.type}`}>
                {feedback.text}
              </div>
            )}

            <div className="modal-details">
              <div className="modal-detail-row">
                <span>Farmer</span>
                <strong>{selectedListing.farmerName}{selectedListing.farmerPhone ? ` · ${selectedListing.farmerPhone}` : ''}</strong>
              </div>
              <div className="modal-detail-row">
                <span>Location</span>
                <strong>{selectedListing.location}</strong>
              </div>
              <div className="modal-detail-row">
                <span>Price</span>
                <strong className="modal-detail--accent">₱{selectedListing.pricePerUnit.toLocaleString()} / {selectedListing.unit}</strong>
              </div>
              <div className="modal-detail-row">
                <span>Available stock</span>
                <strong>{selectedListing.quantity} {selectedListing.unit}</strong>
              </div>
            </div>

            {user?.role === 'buyer' ? (
              <form onSubmit={handleInitiatePurchase}>
                <div className="form-field">
                  <label className="form-label">Quantity needed ({selectedListing.unit})</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    max={selectedListing.quantity}
                    value={purchaseQty}
                    onChange={(e) => setPurchaseQty(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Message to farmer</label>
                  <textarea
                    className="form-input form-textarea"
                    rows={3}
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="Delivery location, preferred pickup date, or any questions…"
                  />
                </div>

                <div className="modal-total">
                  <span>Total estimate</span>
                  <span className="modal-total__value">₱{(purchaseQty * selectedListing.pricePerUnit).toLocaleString()}</span>
                </div>

                <button
                  type="submit"
                  disabled={purchasing}
                  className="btn btn--primary btn--full"
                >
                  {purchasing ? 'Sending request…' : 'Confirm purchase request'}
                </button>
              </form>
            ) : (
              <div className="feedback-box feedback-box--info">
                Only registered <strong>Buyers</strong> can initiate produce purchases. Log in with a buyer account to proceed.
              </div>
            )}
          </div>
        </div>
      )}
      {/* ── Farmer Sell Modal ─────────────────────────────────── */}
      {showSellModal && (
        <div className="modal-backdrop" onClick={() => setShowSellModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-header__sub">Farmer portal</p>
                <h2 className="modal-header__title">List produce for sale</h2>
              </div>
              <button className="modal-close" onClick={() => setShowSellModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateListing}>
              <div className="form-field">
                <label className="form-label">Crop Name *</label>
                <input className="form-input" type="text" required value={cropName} onChange={(e) => setCropName(e.target.value)} placeholder="e.g. Yellow Corn, Dinorado Rice" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-field">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={sellCat} onChange={(e) => setSellCat(e.target.value)}>
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Quantity *</label>
                  <input className="form-input" type="number" required min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-field">
                  <label className="form-label">Unit</label>
                  <input className="form-input" type="text" required value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="kg, sack, head" />
                </div>
                <div className="form-field">
                  <label className="form-label">Price per Unit (₱) *</label>
                  <input className="form-input" type="number" required min="1" value={pricePerUnit} onChange={(e) => setPricePerUnit(Number(e.target.value))} />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Farm Location</label>
                <input className="form-input" type="text" required value={sellLocation} onChange={(e) => setSellLocationState(e.target.value)} placeholder="Cabanatuan, Nueva Ecija" />
              </div>

              <div className="form-field">
                <label className="form-label">Description (optional)</label>
                <textarea className="form-input form-textarea" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Harvest date, quality grade..." />
              </div>

              <button type="submit" disabled={submittingSell} className="btn btn--primary btn--full">
                {submittingSell ? 'Publishing…' : 'Publish produce listing'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
