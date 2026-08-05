import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { produceApi } from '../api/produce';
import type { ProduceListing } from '../types/produce';

const categories = ['Grains & Cereals', 'Vegetables', 'Fruits', 'Root Crops', 'Livestock & Poultry'];
const philippineRegions = [
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

export const ManageProduceListingsPage: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [cropName, setCropName] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState('kg');
  const [pricePerUnit, setPricePerUnit] = useState<number>(50);
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState(user?.region || philippineRegions[0]);
  const [description, setDescription] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMyListings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await produceApi.listListings({ farmerId: user.id });
      setListings(data);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, [user]);

  const handleOpenForm = (listing?: ProduceListing) => {
    if (listing) {
      setEditingId(listing.id);
      setCropName(listing.cropName);
      setCategory(listing.category);
      setQuantity(listing.quantity);
      setUnit(listing.unit);
      setPricePerUnit(listing.pricePerUnit);
      setHarvestDate(listing.harvestDate ? listing.harvestDate.split('T')[0] : new Date().toISOString().split('T')[0]);
      setLocation(listing.location);
      setDescription(listing.description || '');
    } else {
      setEditingId(null);
      setCropName('');
      setCategory(categories[0]);
      setQuantity(100);
      setUnit('kg');
      setPricePerUnit(50);
      setHarvestDate(new Date().toISOString().split('T')[0]);
      setLocation(user?.region || philippineRegions[0]);
      setDescription('');
    }
    setShowForm(true);
    setMessage(null);
  };

  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      cropName,
      category,
      quantity,
      unit,
      pricePerUnit,
      harvestDate,
      location,
      description,
    };

    try {
      if (editingId) {
        await produceApi.updateListing(editingId, payload);
        setMessage({ type: 'success', text: 'Listing updated successfully!' });
      } else {
        await produceApi.createListing(payload);
        setMessage({ type: 'success', text: 'New produce listing created!' });
      }
      setShowForm(false);
      fetchMyListings();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to save listing.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      await produceApi.deleteListing(id);
      fetchMyListings();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete listing');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>My Crop Listings</h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Post and manage produce available for buyers.</p>
          </div>

          <button
            onClick={() => handleOpenForm()}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              backgroundColor: '#16a34a',
              color: '#fff',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            + Create New Listing
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
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{editingId ? 'Edit Listing' : 'New Crop Listing'}</h2>
                <button onClick={() => setShowForm(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleSaveListing}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Crop Name</label>
                    <input type="text" required value={cropName} onChange={(e) => setCropName(e.target.value)} placeholder="e.g. Yellow Corn" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Quantity</label>
                    <input type="number" min="1" required value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Unit</label>
                    <input type="text" required value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="kg, tons, sacks" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Price / Unit (₱)</label>
                    <input type="number" min="1" required value={pricePerUnit} onChange={(e) => setPricePerUnit(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Harvest Date</label>
                    <input type="date" required value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Farm Location / Region</label>
                    <select value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                      {philippineRegions.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Description</label>
                  <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Variety details, organic status, delivery terms..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }} />
                </div>

                <button type="submit" disabled={saving} style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  {saving ? 'Saving...' : editingId ? 'Update Listing' : 'Publish Listing'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Listings List */}
        {loading ? (
          <div>Loading your listings...</div>
        ) : listings.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', borderRadius: '16px', textAlign: 'center' }}>
            <p style={{ color: '#64748b' }}>You haven't posted any crop listings yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {listings.map((item) => (
              <div key={item.id} className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{item.cropName}</h3>
                    <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', backgroundColor: item.status === 'available' ? '#dcfce7' : '#fee2e2', color: item.status === 'available' ? '#166534' : '#991b1b' }}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                    {item.quantity} {item.unit} @ ₱{item.pricePerUnit}/{item.unit} • {item.location}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleOpenForm(item)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDeleteListing(item.id)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#fef2f2', color: '#991b1b', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
