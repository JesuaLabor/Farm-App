import React, { useState, useEffect } from 'react';
import { priceApi } from '../api/price';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { MarketPrice } from '../types/price';

const cropsList = [
  'Yellow Corn',
  'White Corn',
  'Palay (Paddy Rice)',
  'Milled Rice (Regular)',
  'Red Onion',
  'Garlic',
  'Tomato',
  'Eggplant',
  'Cabbage',
  'Banana (Lakatan)',
];

const categories = ['Grains & Cereals', 'Vegetables', 'Fruits', 'Root Crops', 'Livestock'];

const philippineRegions = [
  'Region X - Northern Mindanao',
  'Region XI - Davao Region',
  'Region XII - SOCCSKSARGEN',
  'Region XIII - Caraga',
  'Region VII - Central Visayas',
  'Region VI - Western Visayas',
  'Region III - Central Luzon',
  'NCR - National Capital Region',
  'BARMM - Bangsamoro Autonomous Region',
];

export const ManageMarketPricesPage: React.FC = () => {
  const { user } = useAuth();
  const isLguStaff = user?.role === 'lgu_staff';

  const userRegion = user?.region || 'Region X - Northern Mindanao';
  const defaultMarketLocation = user?.municipality
    ? `${user.municipality} Agri-Trading Post`
    : 'Malaybalay Central Agri-Trading Post';

  const [cropName, setCropName] = useState(cropsList[0]);
  const [category, setCategory] = useState(categories[0]);
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState<number>(25);
  const [region, setRegion] = useState(userRegion);
  const [marketLocation, setMarketLocation] = useState(defaultMarketLocation);
  const [recordedAt, setRecordedAt] = useState(new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState('DA-AMAS / Municipal Agriculture Office');

  const { success, error: toastError } = useToast();
  const [recentRecords, setRecentRecords] = useState<MarketPrice[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchRecent = async () => {
    setLoadingRecords(true);
    try {
      const data = await priceApi.listHistory({ region });
      setRecentRecords(data.slice(0, 5));
    } catch (e) {
      console.warn('Could not load recent prices:', e);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, [region]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

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
      success(
        'Official Price Recorded!',
        `Official price of ₱${price}/${unit} for ${cropName} recorded in ${region}.`
      );
      fetchRecent();
    } catch (err: any) {
      toastError('Failed to Record Price', err.response?.data?.error || 'Could not save official price.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-container" style={{ paddingBottom: '40px', maxWidth: '880px' }}>
      {/* ─── Header Banner ─── */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '20px',
              background: '#F0FDF4',
              color: '#166534',
              border: '1px solid #BBF7D0',
            }}
          >
            📊 Official Commodity Benchmark
          </span>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
            {userRegion}
          </span>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
          Record Official Market Prices
        </h1>
        <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
          LGU official price monitoring for daily agricultural commodity pricing index.
        </p>
      </div>

      {/* ─── Price Entry Form Card ─── */}
      <div
        className="card"
        style={{
          padding: '24px 28px',
          borderRadius: '20px',
          border: '1.5px solid #E2E8F0',
          background: '#FFFFFF',
          marginBottom: '28px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>
          Commodity Price Details
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Row 1: Crop & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Crop / Commodity *
              </label>
              <select
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {cropsList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Price, Unit, Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Official Price (₱) *
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', fontSize: '14px', fontWeight: 800, color: '#166534' }}>₱</span>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 28px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '14px',
                    fontWeight: 700,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Unit *
              </label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="kg, sack, bunch"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Date Recorded *
              </label>
              <input
                type="date"
                required
                value={recordedAt}
                onChange={(e) => setRecordedAt(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Row 3: Region & Trading Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Jurisdiction / Region
                {isLguStaff && (
                  <span
                    style={{
                      marginLeft: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#166534',
                      background: '#F0FDF4',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: '1px solid #BBF7D0',
                    }}
                  >
                    📍 Assigned
                  </span>
                )}
              </label>
              {isLguStaff ? (
                <div
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #BBF7D0',
                    backgroundColor: '#F0FDF4',
                    fontSize: '14px',
                    color: '#166534',
                    fontWeight: 700,
                    boxSizing: 'border-box',
                  }}
                >
                  🗺️ {region}
                </div>
              ) : (
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    fontSize: '14px',
                  }}
                >
                  {philippineRegions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Market / Trading Post *
              </label>
              <input
                type="text"
                required
                value={marketLocation}
                onChange={(e) => setMarketLocation(e.target.value)}
                placeholder="e.g. Bukidnon Provincial Agri Center"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Row 4: Data Source */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Data Source Agency *
            </label>
            <input
              type="text"
              required
              value={source}
              onChange={(e) => setSource(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-large btn-full"
            style={{ borderRadius: '12px', fontSize: '15px', fontWeight: 800 }}
          >
            {saving ? 'Publishing Benchmark...' : '✓ Publish Official Price Benchmark'}
          </button>
        </form>
      </div>

      {/* ─── Recent Official Records Section ─── */}
      <div
        className="card"
        style={{
          padding: '22px 24px',
          borderRadius: '18px',
          border: '1.5px solid #E2E8F0',
          background: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Recent Published Prices in {region}
          </h2>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            {recentRecords.length} records found
          </span>
        </div>

        {loadingRecords ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#64748B', fontSize: '13px' }}>
            Loading recent records...
          </div>
        ) : recentRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#64748B', fontSize: '13px' }}>
            No recorded commodity prices found for this region yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentRecords.map((rec) => (
              <div
                key={rec.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  fontSize: '13px',
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{rec.cropName}</span>
                  <span style={{ color: '#64748B', marginLeft: '8px' }}>({rec.category})</span>
                  <span style={{ color: '#94A3B8', marginLeft: '8px', fontSize: '12px' }}>📍 {rec.marketLocation}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 800, color: '#166534', fontSize: '14px' }}>
                    ₱{rec.price} / {rec.unit}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    {new Date(rec.recordedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
