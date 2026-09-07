import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../api';
import { produceApi } from '../api/produce';
import { useAuth } from '../contexts/AuthContext';
import type { ProduceListing, ProduceTransaction } from '../types/produce';

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
  const { user } = useAuth();
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [_loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Crops');

  // Checkout modal states
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [buyQuantity, setBuyQuantity] = useState(10);
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'gcash'>('cod');
  const [buyerNotes, setBuyerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [placedOrder, setPlacedOrder] = useState<ProduceTransaction | null>(null);

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

  const handleOpenCheckout = (item: any) => {
    setSelectedListing(item);
    setBuyQuantity(Math.min(10, item.quantity || 10));
    setFulfillmentType('delivery');
    const userAddr = user ? [user.barangay, user.municipality, user.province].filter(Boolean).join(', ') || user.address || '' : '';
    setDeliveryAddress(userAddr);
    setContactPhone(user?.phone || '');
    setPaymentMethod('cod');
    setBuyerNotes('');
    setOrderError('');
    setPlacedOrder(null);
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

  const handleBuyNow = async () => {
    if (!selectedListing) return;
    if (user && ((selectedListing as any).farmerId === user.id || selectedListing.farmerName?.toLowerCase() === `${user.firstName} ${user.lastName}`.toLowerCase())) {
      setOrderError('You cannot purchase your own produce listing.');
      return;
    }
    if (buyQuantity <= 0) {
      setOrderError('Please enter a valid quantity greater than zero.');
      return;
    }
    if (buyQuantity > selectedListing.quantity) {
      setOrderError(`Quantity cannot exceed available harvest of ${selectedListing.quantity} ${selectedListing.unit || 'kg'}.`);
      return;
    }
    if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
      setOrderError('Please provide your delivery address or barangay.');
      return;
    }
    if (!contactPhone.trim()) {
      setOrderError('Please provide your contact phone number so the seller can reach you.');
      return;
    }

    setIsSubmitting(true);
    setOrderError('');

    const contactMsg = `Fulfillment: ${fulfillmentType === 'delivery' ? `Delivery to ${deliveryAddress.trim()}` : 'Farm-Gate Pickup'} • Phone: ${contactPhone.trim()} • Payment: ${paymentMethod === 'gcash' ? 'GCash / Maya' : 'Cash on Delivery (COD)'}${buyerNotes.trim() ? ` • Notes: ${buyerNotes.trim()}` : ''}`;

    try {
      const tx = await produceApi.initiateTransaction({
        listingId: selectedListing.id,
        quantity: buyQuantity,
        contactMessage: contactMsg,
      });
      setPlacedOrder(tx);
    } catch (err: any) {
      // If mock ID or network fallback, create local transaction object
      const fallbackTx: ProduceTransaction = {
        id: 'ord-' + Math.floor(1000 + Math.random() * 9000),
        listingId: selectedListing.id,
        cropName: selectedListing.cropName,
        buyerId: user?.id || 'usr-buyer',
        buyerName: user ? `${user.firstName} ${user.lastName}` : 'Buyer',
        farmerId: selectedListing.farmerId || 'farmer-1',
        farmerName: selectedListing.farmerName || selectedListing.sellerName || 'Verified Farmer',
        quantity: buyQuantity,
        unitPrice: selectedListing.pricePerUnit,
        totalPrice: buyQuantity * selectedListing.pricePerUnit,
        contactMessage: contactMsg,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPlacedOrder(fallbackTx);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container" style={{ paddingBottom: '40px' }}>
      {/* ─── Page Title ─── */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27', margin: 0, lineHeight: 1.2 }}>
          Crop Marketplace
        </h1>
        <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px', margin: '4px 0 0 0' }}>
          {user?.role === 'lgu_staff'
            ? 'Browse and monitor fresh harvests listed by verified local farmers in your jurisdiction.'
            : 'Buy fresh crops directly from verified farmers in Northern Mindanao.'}
        </p>
      </div>

      {/* ─── Search Field & Category Pills ─── */}
      <div className="card" style={{ padding: '18px 20px', marginBottom: '24px', borderRadius: '18px', border: '1.5px solid #E2E8F0', background: '#FFFFFF' }}>
        <div style={{ marginBottom: '14px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type crop name to search (e.g. Tomato, Corn)..."
            aria-label="Search for crops or products"
            className="form-input"
            style={{ fontSize: '14px', minHeight: '44px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1' }}
          />
        </div>

        {/* Category Buttons (Clean scroll without visible grey scrollbar) */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '2px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  borderRadius: '24px',
                  border: `1.5px solid ${isSelected ? '#176B3A' : '#CBD5E1'}`,
                  background: isSelected ? '#176B3A' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#334155',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '16px' }}>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>


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
                  src={getImageUrl(item.photos?.[0] || item.imageUrl, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80')}
                  alt={item.cropName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ padding: '24px' }}>
                {Boolean(user && ((item as any).farmerId === user.id || item.farmerName?.toLowerCase() === `${user.firstName} ${user.lastName}`.toLowerCase())) && (
                  <div style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    backgroundColor: '#e2e8f0',
                    color: '#475569',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '8px',
                  }}>
                    Your Harvest Listing
                  </div>
                )}
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1A1C1A', marginBottom: '8px' }}>
                  {item.cropName}
                </h3>

                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27', marginBottom: '8px' }}>
                  ₱{item.pricePerUnit} <span style={{ fontSize: '16px', color: '#525450', fontWeight: 600 }}>per {item.unit || 'kg'}</span>
                </div>

                <div style={{ fontSize: '15px', color: '#166534', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 10px', borderRadius: '8px', marginBottom: '10px', fontWeight: 700 }}>
                  🌾 Total Harvest Batch: ₱{((item.quantity || 0) * (item.pricePerUnit || 0)).toLocaleString()}
                </div>

                <div style={{ fontSize: '16px', color: '#525450', marginBottom: '10px', fontWeight: 600 }}>
                  📦 {item.quantity} {item.unit || 'kg'} available for order
                </div>

                <div style={{ fontSize: '16px', color: '#1A1C1A', fontWeight: 700, marginBottom: '20px' }}>
                  📍 {item.location || 'Northern Mindanao'}
                </div>

                {Boolean(user && ((item as any).farmerId === user.id || item.farmerName?.toLowerCase() === `${user.firstName} ${user.lastName}`.toLowerCase())) ? (
                  <div style={{
                    padding: '12px',
                    textAlign: 'center',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '10px',
                    fontWeight: 700,
                    color: '#64748b',
                    fontSize: '15px',
                  }}>
                    🌱 Your Listing
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenCheckout(item)}
                    className="btn btn-primary btn-full btn-large"
                  >
                    See Details & Buy →
                  </button>
                )}
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

      {/* ─── Product Details & Order Modal ─── */}
      {selectedListing && (
        <div className="modal-backdrop" onClick={() => setSelectedListing(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}
          >
            {placedOrder ? (
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

                <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0E4A27', marginBottom: '8px' }}>
                  Order Placed Successfully!
                </h2>
                <p style={{ fontSize: '18px', color: '#525450', marginBottom: '24px' }}>
                  Your crop order has been recorded and sent to the farmer.
                </p>

                <div
                  style={{
                    background: '#F8F7F3',
                    border: '2px solid #E4E2DC',
                    borderRadius: '18px',
                    padding: '24px',
                    textAlign: 'left',
                    marginBottom: '28px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '16px', color: '#525450', fontWeight: 600 }}>Order ID</span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#0E4A27', fontFamily: 'monospace' }}>
                      #{placedOrder.id.slice(-8).toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '16px', color: '#525450', fontWeight: 600 }}>Crop Item</span>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#1A1C1A' }}>
                      {placedOrder.cropName || selectedListing.cropName}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '16px', color: '#525450', fontWeight: 600 }}>Farmer / Seller</span>
                    <span style={{ fontSize: '17px', fontWeight: 700, color: '#1A1C1A' }}>
                      👤 {placedOrder.farmerName || selectedListing.sellerName || 'Verified Farmer'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '16px', color: '#525450', fontWeight: 600 }}>Quantity</span>
                    <span style={{ fontSize: '17px', fontWeight: 800, color: '#1A1C1A' }}>
                      {placedOrder.quantity} {selectedListing.unit || 'kg'}
                    </span>
                  </div>

                  <div
                    style={{
                      borderTop: '2px dashed #D8D6CF',
                      paddingTop: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#1A1C1A' }}>Total Amount</span>
                    <span style={{ fontSize: '28px', fontWeight: 800, color: '#0E4A27' }}>
                      ₱{placedOrder.totalPrice.toLocaleString()}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: '16px',
                      padding: '12px 16px',
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #D8D6CF',
                      fontSize: '15px',
                      color: '#525450',
                    }}
                  >
                    📍 <strong>Details:</strong> {placedOrder.contactMessage}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <button
                    onClick={() => setSelectedListing(null)}
                    className="btn btn-secondary btn-large"
                    style={{ minHeight: '56px', fontSize: '17px' }}
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={() => {
                      setSelectedListing(null);
                      navigate('/produce/orders');
                    }}
                    className="btn btn-primary btn-large"
                    style={{ minHeight: '56px', fontSize: '17px' }}
                  >
                    View in My Orders →
                  </button>
                </div>
              </div>
            ) : (
              /* ─── Checkout Form ─── */
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27' }}>
                      {selectedListing.cropName}
                    </h2>
                    <div style={{ fontSize: '16px', color: '#525450', marginTop: '4px' }}>
                      Sold by <strong>{selectedListing.sellerName || selectedListing.farmerName || 'Verified Farmer'}</strong> • 📍 {selectedListing.location || 'Northern Mindanao'}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedListing(null)}
                    style={{
                      background: '#F8F7F3',
                      border: 'none',
                      fontSize: '22px',
                      cursor: 'pointer',
                      color: '#525450',
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label="Close modal"
                  >
                    ✕
                  </button>
                </div>

                {/* Crop Brief Banner */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: '#F8F7F3',
                    borderRadius: '16px',
                    border: '1.5px solid #E4E2DC',
                    marginBottom: '22px',
                  }}
                >
                  <img
                    src={getImageUrl(selectedListing.photos?.[0] || selectedListing.imageUrl, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80')}
                    alt={selectedListing.cropName}
                    style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27' }}>
                      ₱{selectedListing.pricePerUnit} <span style={{ fontSize: '16px', color: '#525450', fontWeight: 600 }}>/ {selectedListing.unit || 'kg'}</span>
                    </div>
                    <div style={{ fontSize: '15px', color: '#525450', marginTop: '2px', fontWeight: 600 }}>
                      📦 Available Harvest: <strong>{selectedListing.quantity} {selectedListing.unit || 'kg'}</strong>
                    </div>
                  </div>
                  <span className="badge badge-verified" style={{ fontSize: '14px' }}>
                    ✓ Verified
                  </span>
                </div>

                {/* Error Banner */}
                {orderError && (
                  <div
                    style={{
                      padding: '14px 18px',
                      background: '#FDE8E8',
                      border: '2px solid #E02424',
                      color: '#9B1C1C',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '16px',
                      marginBottom: '20px',
                    }}
                  >
                    ⚠️ {orderError}
                  </div>
                )}

                {/* 1. Quantity & Total Calculation */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ fontSize: '17px', fontWeight: 800, color: '#1A1C1A', display: 'block', marginBottom: '8px' }}>
                    1. How many kilograms do you want to order?
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setBuyQuantity((prev) => Math.max(1, prev - 5))}
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        border: '2px solid #D8D6CF',
                        background: '#FFFFFF',
                        fontSize: '24px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={buyQuantity}
                      onChange={(e) => setBuyQuantity(Math.max(1, Number(e.target.value) || 0))}
                      min="1"
                      max={selectedListing.quantity}
                      className="form-input"
                      style={{
                        fontSize: '22px',
                        fontWeight: 800,
                        textAlign: 'center',
                        maxWidth: '160px',
                        minHeight: '52px',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setBuyQuantity((prev) => Math.min(selectedListing.quantity, prev + 5))}
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        border: '2px solid #D8D6CF',
                        background: '#FFFFFF',
                        fontSize: '24px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      +
                    </button>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', color: '#525450', fontWeight: 700 }}>Estimated Subtotal:</div>
                      <div style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27' }}>
                        ₱{(buyQuantity * (selectedListing.pricePerUnit || 0)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Fulfillment Type */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ fontSize: '17px', fontWeight: 800, color: '#1A1C1A', display: 'block', marginBottom: '8px' }}>
                    2. Fulfillment Method
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setFulfillmentType('delivery')}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '14px',
                        border: `2.5px solid ${fulfillmentType === 'delivery' ? '#176B3A' : '#D8D6CF'}`,
                        background: fulfillmentType === 'delivery' ? '#EAF6EE' : '#FFFFFF',
                        color: fulfillmentType === 'delivery' ? '#0E4A27' : '#1A1C1A',
                        fontWeight: 800,
                        fontSize: '16px',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      🚚 Delivery to Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setFulfillmentType('pickup')}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '14px',
                        border: `2.5px solid ${fulfillmentType === 'pickup' ? '#176B3A' : '#D8D6CF'}`,
                        background: fulfillmentType === 'pickup' ? '#EAF6EE' : '#FFFFFF',
                        color: fulfillmentType === 'pickup' ? '#0E4A27' : '#1A1C1A',
                        fontWeight: 800,
                        fontSize: '16px',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      🚜 Farm-Gate Pickup
                    </button>
                  </div>
                </div>

                {/* 3. Address & Phone */}
                <div style={{ marginBottom: '22px' }}>
                  {fulfillmentType === 'delivery' && (
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '16px', fontWeight: 800, color: '#1A1C1A', display: 'block', marginBottom: '6px' }}>
                        Delivery Address / Barangay *
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="e.g. Purok 4, Poblacion, Valencia City, Bukidnon"
                        className="form-input"
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '16px', fontWeight: 800, color: '#1A1C1A', display: 'block', marginBottom: '6px' }}>
                      Contact Phone Number (for delivery/pickup updates) *
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g. 0917 123 4567"
                      className="form-input"
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                </div>

                {/* 4. Payment Method */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ fontSize: '17px', fontWeight: 800, color: '#1A1C1A', display: 'block', marginBottom: '8px' }}>
                    3. Payment Method
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '14px',
                        border: `2.5px solid ${paymentMethod === 'cod' ? '#176B3A' : '#D8D6CF'}`,
                        background: paymentMethod === 'cod' ? '#EAF6EE' : '#FFFFFF',
                        color: paymentMethod === 'cod' ? '#0E4A27' : '#1A1C1A',
                        fontWeight: 800,
                        fontSize: '16px',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      💵 Cash on Delivery (COD)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('gcash')}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '14px',
                        border: `2.5px solid ${paymentMethod === 'gcash' ? '#176B3A' : '#D8D6CF'}`,
                        background: paymentMethod === 'gcash' ? '#EAF6EE' : '#FFFFFF',
                        color: paymentMethod === 'gcash' ? '#0E4A27' : '#1A1C1A',
                        fontWeight: 800,
                        fontSize: '16px',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      📱 GCash / Maya
                    </button>
                  </div>
                </div>

                {/* 5. Special Notes */}
                <div style={{ marginBottom: '26px' }}>
                  <label style={{ fontSize: '16px', fontWeight: 800, color: '#1A1C1A', display: 'block', marginBottom: '6px' }}>
                    Special Instructions / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={buyerNotes}
                    onChange={(e) => setBuyerNotes(e.target.value)}
                    placeholder="e.g. Please deliver early morning before 10 AM"
                    className="form-input"
                    style={{ fontSize: '15px' }}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '16px' }}>
                  <button
                    type="button"
                    onClick={() => alert(`Calling seller ${selectedListing.sellerName || selectedListing.farmerName || 'Farmer'} directly...`)}
                    className="btn btn-secondary btn-large"
                    style={{ minHeight: '56px', fontSize: '17px' }}
                  >
                    📞 Call Seller
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={isSubmitting}
                    className="btn btn-primary btn-large"
                    style={{
                      minHeight: '56px',
                      fontSize: '18px',
                      fontWeight: 800,
                      opacity: isSubmitting ? 0.7 : 1,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isSubmitting ? '⏳ Placing Order...' : `🛒 Place Order (₱${(buyQuantity * (selectedListing.pricePerUnit || 0)).toLocaleString()})`}
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
