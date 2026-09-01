import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { db, type CachedProduceListing } from '../db/db';
import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';
import { Spinner } from '../components/Spinner';

const categories = ['All', 'Grains & Cereals', 'Vegetables', 'Fruits', 'Root Crops', 'Livestock & Poultry'];

export const MarketplaceScreen: React.FC = () => {
  const { user } = useAuth();
  const { isOnline, enqueueOfflineItem } = useOffline();
  const navigate = useNavigate();
  const [listings, setListings] = useState<CachedProduceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Purchase modal (for Buyers)
  const [selectedItem, setSelectedItem] = useState<CachedProduceListing | null>(null);
  const [purchaseQty, setPurchaseQty] = useState('1');
  const [contactMsg, setContactMsg] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sell Produce Modal (for Farmers)
  const [showSellModal, setShowSellModal] = useState(false);
  const [cropName, setCropName] = useState('');
  const [sellCat, setSellCat] = useState('Grains & Cereals');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [location, setLocation] = useState(user?.region || 'Central Luzon');
  const [desc, setDesc] = useState('');
  const [submittingSell, setSubmittingSell] = useState(false);
  const [sellErr, setSellErr] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    try {
      if (navigator.onLine) {
        const data = await api.listProduce(search, selectedCategory);
        setListings(data);
        // Cache to IndexedDB for offline read
        if (!search && selectedCategory === 'All') {
          await db.produceCache.clear();
          await db.produceCache.bulkPut(data);
        }
      } else {
        let cached = await db.produceCache.toArray();
        if (selectedCategory !== 'All') {
          cached = cached.filter((c) => c.category === selectedCategory);
        }
        if (search) {
          cached = cached.filter((c) => c.cropName.toLowerCase().includes(search.toLowerCase()));
        }
        setListings(cached);
      }
    } catch (e) {
      console.warn('Network request failed, reading produce listings from IndexedDB cache:', e);
      let cached = await db.produceCache.toArray();
      if (selectedCategory !== 'All') {
        cached = cached.filter((c) => c.category === selectedCategory);
      }
      if (search) {
        cached = cached.filter((c) => c.cropName.toLowerCase().includes(search.toLowerCase()));
      }
      setListings(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [search, selectedCategory]);

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    const qty = Number(purchaseQty);
    if (!qty || qty <= 0) {
      setFeedback({ type: 'error', text: 'Please enter a valid quantity.' });
      return;
    }
    setPurchasing(true);
    setFeedback(null);
    try {
      await api.initiatePurchase({
        listingId: selectedItem.id,
        quantity: qty,
        contactMessage: contactMsg,
      });
      setFeedback({ type: 'success', text: 'Purchase request sent! Track under your order history.' });
      setTimeout(() => {
        setSelectedItem(null);
        setFeedback(null);
      }, 1500);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.response?.data?.error || 'Purchase failed.' });
    } finally {
      setPurchasing(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName || !quantity || !pricePerUnit) {
      setSellErr('Please fill in crop name, quantity, and price.');
      return;
    }
    setSubmittingSell(true);
    setSellErr('');

    const payload = {
      cropName,
      category: sellCat,
      quantity: Number(quantity),
      unit,
      pricePerUnit: Number(pricePerUnit),
      location,
      description: desc,
    };

    try {
      if (isOnline) {
        await api.createProduceListing(payload);
        fetchListings();
      } else {
        const tempId = `offline-${Date.now()}`;
        const localRecord: CachedProduceListing = {
          ...payload,
          id: tempId,
          farmerName: `${user?.firstName || 'Local'} ${user?.lastName || 'Farmer'}`,
          createdAt: new Date().toISOString(),
          pendingSync: true,
        };
        await db.produceCache.put(localRecord);
        await enqueueOfflineItem('PRODUCE_LISTING', { ...payload, tempId });
        setListings((prev) => [localRecord, ...prev]);
      }

      setShowSellModal(false);
      setCropName(''); setQuantity(''); setPricePerUnit(''); setDesc('');
    } catch (err: any) {
      console.warn('Listing creation failed, queuing offline:', err);
      const tempId = `offline-${Date.now()}`;
      const localRecord: CachedProduceListing = {
        ...payload,
        id: tempId,
        farmerName: `${user?.firstName || 'Local'} ${user?.lastName || 'Farmer'}`,
        createdAt: new Date().toISOString(),
        pendingSync: true,
      };
      await db.produceCache.put(localRecord);
      await enqueueOfflineItem('PRODUCE_LISTING', { ...payload, tempId });
      setListings((prev) => [localRecord, ...prev]);

      setShowSellModal(false);
      setCropName(''); setQuantity(''); setPricePerUnit(''); setDesc('');
    } finally {
      setSubmittingSell(false);
    }
  };

  return (
    <div>
      {/* ── Top Bar ──────────────────────────────────────────── */}
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <span>←</span> Back
        </button>
        <div className="top-bar-title">Produce Marketplace</div>
        {user?.role === 'farmer' ? (
          <button className="btn-action" onClick={() => setShowSellModal(true)}>
            + Sell
          </button>
        ) : (
          <div style={{ width: 50 }} />
        )}
      </div>

      {/* ── Search Bar ────────────────────────────────────────── */}
      <div className="search-bar-wrap">
        <input
          className="search-input"
          placeholder="Search crop name (e.g. Rice, Mango)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Category Chips ────────────────────────────────────── */}
      <div className="chips-wrapper">
        <div className="chips-scroll">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Listings ──────────────────────────────────────────── */}
      <div className="scroll-content">
        {loading ? (
          <Spinner />
        ) : listings.length === 0 ? (
          <div className="empty-card">
            <div className="empty-icon">🌾</div>
            <div className="empty-title">No produce listings found</div>
            <div className="empty-desc">Try searching for a different crop or category.</div>
          </div>
        ) : (
          listings.map((item) => (
            <div key={item.id} className="listing-card">
              <div className="listing-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="category-badge">{item.category}</span>
                  {item.pendingSync && <span className="pending-badge">Pending Sync ⏳</span>}
                </div>
                <span className="empty-desc">📍 {item.location}</span>
              </div>

              <div className="quick-title" style={{ marginTop: 4 }}>{item.cropName}</div>
              <div className="empty-desc" style={{ marginBottom: 8 }}>by {item.farmerName}</div>

              <div className="price-row">
                <span className="price-value">₱{item.pricePerUnit.toLocaleString()}</span>
                <span className="price-unit"> / {item.unit}</span>
              </div>
              <div className="empty-desc" style={{ marginBottom: 12 }}>
                Available: {item.quantity} {item.unit}
              </div>

              <button
                className="btn btn-primary"
                style={{ fontSize: 13, padding: 10 }}
                onClick={() => {
                  setSelectedItem(item);
                  setPurchaseQty('1');
                  setContactMsg('');
                  setFeedback(null);
                }}
              >
                View Details & Order
              </button>
            </div>
          ))
        )}
      </div>

      {/* ── Farmer: Sell Produce Modal ─────────────────────────── */}
      {showSellModal && (
        <div className="modal-backdrop" onClick={() => setShowSellModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">List Produce for Sale</div>
              <button className="modal-close" onClick={() => setShowSellModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateListing}>
              {sellErr && <div className="error-box">{sellErr}</div>}

              <div className="field">
                <label className="label">Crop Name *</label>
                <input
                  className="input"
                  placeholder="e.g. Yellow Corn, Dinorado Rice"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label className="label">Category</label>
                <select
                  className="input"
                  value={sellCat}
                  onChange={(e) => setSellCat(e.target.value)}
                >
                  {categories.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="label">Quantity *</label>
                  <input
                    className="input"
                    type="number"
                    placeholder="100"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label className="label">Unit</label>
                  <input
                    className="input"
                    placeholder="kg / sack"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">Price per Unit (₱) *</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  placeholder="25.00"
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label className="label">Farm Location</label>
                <input
                  className="input"
                  placeholder="e.g. Cabanatuan, Nueva Ecija"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="label">Description (optional)</label>
                <textarea
                  className="input input-textarea"
                  placeholder="Harvest date, quality grade, organic..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={2}
                />
              </div>

              <button className="btn btn-primary" type="submit" disabled={submittingSell}>
                {submittingSell ? <Spinner size={20} /> : !isOnline ? 'Publish Produce Offline ⚡' : 'Publish Produce Listing'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Buyer: Purchase Request Modal ───────────────────────── */}
      {selectedItem && (
        <div className="modal-backdrop" onClick={() => setSelectedItem(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Order Request</div>
              <button className="modal-close" onClick={() => setSelectedItem(null)}>✕</button>
            </div>

            <div className="section-title" style={{ color: 'var(--color-accent)' }}>{selectedItem.cropName}</div>
            <div className="empty-desc">Farmer: {selectedItem.farmerName}</div>
            <div className="empty-desc" style={{ marginBottom: 12 }}>
              Price: ₱{selectedItem.pricePerUnit} / {selectedItem.unit}
            </div>

            {feedback && (
              <div className={feedback.type === 'error' ? 'error-box' : 'success-box'}>
                {feedback.text}
              </div>
            )}

            {user?.role === 'buyer' ? (
              <form onSubmit={handleBuy}>
                <div className="field">
                  <label className="label">Quantity Needed ({selectedItem.unit})</label>
                  <input
                    className="input"
                    type="number"
                    value={purchaseQty}
                    onChange={(e) => setPurchaseQty(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label className="label">Delivery Note / Instructions</label>
                  <textarea
                    className="input input-textarea"
                    placeholder="Preferred pickup address..."
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="total-row">
                  <span className="total-label">Total Estimate:</span>
                  <span className="total-value">
                    ₱{((Number(purchaseQty) || 0) * selectedItem.pricePerUnit).toLocaleString()}
                  </span>
                </div>

                <button className="btn btn-primary" type="submit" disabled={purchasing || !isOnline}>
                  {purchasing ? <Spinner size={20} /> : !isOnline ? 'Requires Internet' : 'Submit Order Request'}
                </button>
              </form>
            ) : (
              <div className="rbac-box">
                Only registered <strong>Buyers</strong> can initiate produce purchase requests. Log in with a buyer account to buy directly.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
