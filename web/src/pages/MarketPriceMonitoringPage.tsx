import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { priceApi } from '../api/price';
import { PriceChart } from '../components/PriceChart';
import type { MarketPrice } from '../types/price';

const cropsList = ['Yellow Corn', 'White Corn', 'Palay (Paddy Rice)', 'Milled Rice (Regular)', 'Red Onion', 'Garlic', 'Tomato', 'Eggplant', 'Cabbage', 'Banana (Lakatan)'];
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

export const MarketPriceMonitoringPage: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState(cropsList[0]);
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);

  // Price comparison tool
  const [myListingPrice, setMyListingPrice] = useState<number>(0);

  const fetchPriceHistory = async () => {
    setLoading(true);
    try {
      const data = await priceApi.listHistory({
        cropName: selectedCrop,
        region: selectedRegion !== 'All Regions' ? selectedRegion : undefined,
      });
      setPrices(data);
    } catch (err) {
      console.error('Failed to fetch price history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceHistory();
  }, [selectedCrop, selectedRegion]);

  const latestRecord = prices.length > 0 ? prices[prices.length - 1] : null;

  return (
    <div className="page-root">
      <Navbar />

      <main className="page-main">
        {/* ── Page Header ─────────────────────────────────────── */}
        <div className="page-header-banner">
          <div>
            <span className="page-header-label">Market price monitoring</span>
            <h1 className="page-header-title">Regional commodity price tracker</h1>
            <p className="page-header-sub">
              Monitor real-time market prices collected by LGU agriculture offices to price your crops competitively.
            </p>
          </div>
        </div>

        {/* ── Filter Bar ───────────────────────────────────────── */}
        <div className="filter-bar" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="filter-field">
            <label className="filter-label">Select commodity / crop</label>
            <select
              className="form-input"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              {cropsList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label className="filter-label">Region / location</label>
            <select
              className="form-input"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              {philippineRegions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── KPI & Calculator Cards ───────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {/* Latest Recorded Price Card */}
          <div className="card-elevated" style={{ borderLeft: '4px solid var(--color-accent)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Latest market price
            </span>
            <div className="text-mono" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-accent)', margin: '8px 0 4px 0' }}>
              {latestRecord ? `₱${latestRecord.price.toLocaleString()} / ${latestRecord.unit}` : 'No data'}
            </div>
            {latestRecord && (
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                📍 {latestRecord.marketLocation} ({latestRecord.region})<br />
                📅 {new Date(latestRecord.recordedAt).toLocaleDateString()} · Source: <strong>{latestRecord.source}</strong>
              </div>
            )}
          </div>

          {/* Pricing Comparison Calculator */}
          <div className="card-elevated" style={{ borderLeft: '4px solid #d97706' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Farmer pricing comparison tool
            </span>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '6px 0 14px 0' }}>
              Compare your target listing price against official market benchmarks:
            </p>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                className="form-input"
                type="number"
                value={myListingPrice || ''}
                onChange={(e) => setMyListingPrice(Number(e.target.value))}
                placeholder="Enter your price (₱)..."
                style={{ flex: 1 }}
              />

              {myListingPrice > 0 && latestRecord && (
                <div className="feedback-box" style={{
                  margin: 0,
                  backgroundColor: myListingPrice <= latestRecord.price ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                  color: myListingPrice <= latestRecord.price ? 'var(--color-success)' : 'var(--color-error)',
                  borderLeftColor: myListingPrice <= latestRecord.price ? 'var(--color-success)' : 'var(--color-error)',
                  fontWeight: 700,
                  fontSize: '13px',
                }}>
                  {myListingPrice <= latestRecord.price
                    ? `Competitive! (₱${(latestRecord.price - myListingPrice).toFixed(1)} below market)`
                    : `Above Market (+₱${(myListingPrice - latestRecord.price).toFixed(1)})`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Trend Line Chart ─────────────────────────────────── */}
        <div className="card-elevated" style={{ marginBottom: '32px' }}>
          <h2 className="text-title" style={{ marginBottom: '4px' }}>
            Price trend: {selectedCrop}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '24px' }}>
            Historical price movements in {selectedRegion}.
          </p>

          {loading ? (
            <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', textAlign: 'center', padding: '48px' }}>Loading price trend chart…</div>
          ) : (
            <PriceChart data={prices.map((p) => ({ date: p.recordedAt, price: p.price, marketLocation: p.marketLocation }))} />
          )}
        </div>

        {/* ── Historical Price Table ───────────────────────────── */}
        <div className="card-elevated">
          <h3 className="text-title" style={{ marginBottom: '16px' }}>
            Historical records table
          </h3>

          {prices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">📈</div>
              <h3 className="empty-state__title">No price records found</h3>
              <p className="empty-state__desc">Try selecting a different commodity or region.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px' }}>Commodity</th>
                    <th style={{ padding: '12px' }}>Price</th>
                    <th style={{ padding: '12px' }}>Market / Location</th>
                    <th style={{ padding: '12px' }}>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      <td style={{ padding: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                        {new Date(p.recordedAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600, color: 'var(--color-text)' }}>{p.cropName}</td>
                      <td className="text-mono" style={{ padding: '12px', fontWeight: 800, color: 'var(--color-accent)' }}>
                        ₱{p.price.toLocaleString()} / {p.unit}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--color-text-muted)' }}>{p.marketLocation} ({p.region})</td>
                      <td style={{ padding: '12px', color: 'var(--color-text-light)' }}>{p.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
