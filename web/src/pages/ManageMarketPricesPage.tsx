import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { priceApi } from '../api/price';

const cropsList = ['Yellow Corn', 'White Corn', 'Palay (Paddy Rice)', 'Milled Rice (Regular)', 'Red Onion', 'Garlic', 'Tomato', 'Eggplant', 'Cabbage', 'Banana (Lakatan)'];
const categories = ['Grains & Cereals', 'Vegetables', 'Fruits', 'Root Crops', 'Livestock'];
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

export const ManageMarketPricesPage: React.FC = () => {
  const [cropName, setCropName] = useState(cropsList[0]);
  const [category, setCategory] = useState(categories[0]);
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState<number>(25);
  const [region, setRegion] = useState(philippineRegions[0]);
  const [marketLocation, setMarketLocation] = useState('Central Trading Post');
  const [recordedAt, setRecordedAt] = useState(new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState('DA-AMAS / Municipal Agriculture Office');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await priceApi.createRecord({
        cropName,
        category,
        unit,
        price,
        region,
        marketLocation,
        recordedAt,
        source,
      });
      setMessage({ type: 'success', text: `Price record added for ${cropName} in ${region}!` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to record price.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Record Official Market Prices
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
          LGU & Expert Data Entry Interface for Regional Agricultural Commodities.
        </p>

        {message && (
          <div style={{ padding: '14px', borderRadius: '12px', marginBottom: '24px', backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2', color: message.type === 'success' ? '#166534' : '#991b1b' }}>
            {message.text}
          </div>
        )}

        <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Crop / Commodity</label>
                <select value={cropName} onChange={(e) => setCropName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                  {cropsList.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Official Price (₱)</label>
                <input type="number" step="0.5" min="0.5" required value={price} onChange={(e) => setPrice(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Unit</label>
                <input type="text" required value={unit} onChange={(e) => setUnit(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Date Recorded</label>
                <input type="date" required value={recordedAt} onChange={(e) => setRecordedAt(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Region</label>
                <select value={region} onChange={(e) => setRegion(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                  {philippineRegions.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Market / Trading Location</label>
                <input type="text" required value={marketLocation} onChange={(e) => setMarketLocation(e.target.value)} placeholder="e.g. Agri-Trading Post" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Data Source Agency</label>
              <input type="text" required value={source} onChange={(e) => setSource(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>

            <button type="submit" disabled={saving} style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              {saving ? 'Recording Price...' : 'Submit Price Record'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
