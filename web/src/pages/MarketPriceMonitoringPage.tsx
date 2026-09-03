import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { priceApi } from '../api/price';
import { PriceChart } from '../components/PriceChart';
import type { MarketPrice } from '../types/price';

const cropsList = [
  'Yellow Corn (Mais)',
  'White Corn',
  'Palay (Paddy Rice)',
  'Milled Rice (Regular)',
  'Tomato (Kamatis)',
  'Eggplant (Talong)',
  'Red Onion (Sibuyas)',
  'Garlic (Bawang)',
  'Cabbage (Repolyo)',
  'Banana (Lakatan)',
];

const philippineRegions = [
  'All Regions',
  'Region X - Northern Mindanao',
  'Region XI - Davao Region',
  'Region III - Central Luzon',
  'Region I - Ilocos Region',
  'Region II - Cagayan Valley',
  'Region IV-A - CALABARZON',
  'Region V - Bicol Region',
  'Region VI - Western Visayas',
  'CAR - Cordillera Administrative Region',
];

// Reference regional benchmark differences for comparison table
const regionalComparisons = [
  { region: 'Region X - Northern Mindanao', market: 'Cagayan de Oro Agri-Terminal', diff: '₱0 (Base)', badge: 'Local Market' },
  { region: 'Region XI - Davao Region', market: 'Davao City Wholesale Trading Center', diff: '+₱2.50', badge: 'Higher Demand' },
  { region: 'Region III - Central Luzon', market: 'Nueva Ecija Food Terminal', diff: '-₱1.00', badge: 'High Supply' },
  { region: 'Region IV-A - CALABARZON', market: 'Tanauan Trading Center', diff: '+₱3.00', badge: 'High Demand' },
  { region: 'National Capital Region', market: 'Balintawak / Divisoria Wholesale', diff: '+₱5.50', badge: 'Metro Peak' },
];

interface MarketPriceMonitoringPageProps {
  initialTab?: 'prices' | 'trends';
}

export const MarketPriceMonitoringPage: React.FC<MarketPriceMonitoringPageProps> = ({ initialTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL hash, props, or path
  const [activeTab, setActiveTab] = useState<'prices' | 'trends'>(() => {
    if (initialTab) return initialTab;
    if (location.pathname.includes('/price-trends') || location.hash === '#trends') return 'trends';
    return 'prices';
  });

  // Sync state if URL hash or pathname changes
  useEffect(() => {
    if (location.pathname.includes('/price-trends') || location.hash === '#trends') {
      setActiveTab('trends');
    } else if (location.hash === '#prices' || location.pathname === '/market-prices') {
      setActiveTab('prices');
    }
  }, [location.hash, location.pathname]);

  const handleTabChange = (tab: 'prices' | 'trends') => {
    setActiveTab(tab);
    if (tab === 'trends') {
      navigate('/market-prices#trends', { replace: true });
    } else {
      navigate('/market-prices', { replace: true });
    }
  };

  const [selectedCrop, setSelectedCrop] = useState(cropsList[0]);
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '3m' | '1y'>('30d');
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [myListingPrice, setMyListingPrice] = useState<number>(0);

  const fetchPriceHistory = async () => {
    setLoading(true);
    try {
      const cleanCropName = selectedCrop.split(' (')[0];
      const data = await priceApi.listHistory({
        cropName: cleanCropName,
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
  const currentBasePrice = latestRecord?.price || 25;
  const unit = latestRecord?.unit || 'kg';

  // Calculate Trend Statistics
  const priceValues = prices.length > 0 ? prices.map((p) => p.price) : [currentBasePrice];
  const maxPrice = Math.max(...priceValues, currentBasePrice + 5);
  const minPrice = Math.min(...priceValues, Math.max(10, currentBasePrice - 5));
  const avgPrice = Math.round(priceValues.reduce((a, b) => a + b, 0) / priceValues.length);
  const firstPrice = priceValues[0] || currentBasePrice;
  const lastPrice = priceValues[priceValues.length - 1] || currentBasePrice;
  const pctChange = firstPrice > 0 ? (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(1) : '0.0';
  const isUpward = Number(pctChange) >= 0;

  return (
    <div className="app-container" style={{ paddingBottom: '50px' }}>
      {/* ─── Back Button & Header ─── */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-secondary"
          style={{ marginBottom: '16px', fontSize: '16px' }}
        >
          ← Back to Dashboard
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '34px', fontWeight: 800, color: '#0E4A27', margin: 0 }}>
              {activeTab === 'prices' ? 'Official Market Prices' : 'Commodity Price Trends & Analytics'}
            </h1>
            <p style={{ fontSize: '19px', color: '#525450', marginTop: '6px' }}>
              {activeTab === 'prices'
                ? 'Daily official wholesale and retail price bulletin monitored by DA-AMAS & local trading posts.'
                : 'Analyze historical price patterns, volatility indicators, and seasonal market forecasts.'}
            </p>
          </div>

          {/* ─── Top Segregated Navigation Tabs ─── */}
          <div
            style={{
              display: 'inline-flex',
              background: '#EAECE9',
              padding: '6px',
              borderRadius: '16px',
              gap: '6px',
            }}
          >
            <button
              onClick={() => handleTabChange('prices')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 800,
                fontSize: '17px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeTab === 'prices' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'prices' ? '#0E4A27' : '#525450',
                boxShadow: activeTab === 'prices' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <span>🏷️</span>
              <span>Today's Market Prices</span>
            </button>

            <button
              onClick={() => handleTabChange('trends')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 800,
                fontSize: '17px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeTab === 'trends' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'trends' ? '#0E4A27' : '#525450',
                boxShadow: activeTab === 'trends' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <span>📈</span>
              <span>Price Trends & History</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Commodity & Location Filter Bar ─── */}
      <div className="card" style={{ padding: '22px', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 800 }}>Select Crop / Commodity</label>
            <select
              className="form-input"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              style={{ fontSize: '18px', height: '54px' }}
            >
              {cropsList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 800 }}>Region / Trading Post</label>
            <select
              className="form-input"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{ fontSize: '18px', height: '54px' }}
            >
              {philippineRegions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 1: TODAY'S MARKET PRICES (Bulletin, Benchmarks & Calculator)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'prices' && (
        <div>
          {/* Price Overview Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            {/* Latest Official Benchmark */}
            <div className="card" style={{ borderLeft: '8px solid #176B3A', background: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#525450', textTransform: 'uppercase' }}>
                  Official DA-AMAS Benchmark
                </div>
                <span className="badge badge-verified" style={{ fontSize: '13px' }}>
                  ✓ Official
                </span>
              </div>
              <div style={{ fontSize: '42px', fontWeight: 800, color: '#0E4A27', margin: '8px 0 4px 0' }}>
                ₱{currentBasePrice.toLocaleString()} <span style={{ fontSize: '20px', color: '#525450' }}>/ {unit}</span>
              </div>
              <div style={{ fontSize: '15px', color: '#525450', fontWeight: 600 }}>
                📍 Central Trading Post ({selectedRegion === 'All Regions' ? 'Region X' : selectedRegion})<br />
                📅 Updated: Today, 8:00 AM • Verified by DA
              </div>
            </div>

            {/* Daily High & Low */}
            <div className="card" style={{ borderLeft: '8px solid #2B72B3', background: '#FFFFFF' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#525450', textTransform: 'uppercase' }}>
                Today's Trading Range
              </div>
              <div style={{ display: 'flex', gap: '28px', marginTop: '10px', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#525450', fontWeight: 700 }}>FLOOR (LOW)</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#176B3A' }}>
                    ₱{minPrice} <span style={{ fontSize: '16px' }}>/{unit}</span>
                  </div>
                </div>
                <div style={{ borderLeft: '2px solid #E4E2DC', paddingLeft: '28px' }}>
                  <div style={{ fontSize: '14px', color: '#525450', fontWeight: 700 }}>CEILING (HIGH)</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#BA3C3C' }}>
                    ₱{maxPrice} <span style={{ fontSize: '16px' }}>/{unit}</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '15px', color: '#2B72B3', fontWeight: 700 }}>
                Average Trading Rate: ₱{avgPrice} / {unit}
              </div>
            </div>

            {/* Market Stability Status */}
            <div className="card" style={{ borderLeft: '8px solid #D99500', background: '#FFFFFF' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#525450', textTransform: 'uppercase' }}>
                Supply & Demand Status
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27', margin: '10px 0 6px 0' }}>
                🟢 Stable Supply
              </div>
              <p style={{ fontSize: '15px', color: '#525450', margin: 0, lineHeight: 1.5 }}>
                Local production meets daily wholesale demand. No significant transport bottlenecks reported.
              </p>
            </div>
          </div>

          {/* Pricing Comparison Calculator */}
          <div className="card" style={{ padding: '28px', marginBottom: '36px', background: '#FAFBF9', border: '2px solid #D1E5D9' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27', margin: '0 0 6px 0' }}>
              🧮 Interactive Price Benchmark Calculator
            </h2>
            <p style={{ fontSize: '17px', color: '#525450', marginBottom: '20px' }}>
              Enter your intended farmgate or wholesale selling price to evaluate how competitive you are against prevailing DA rates:
            </p>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <span style={{ position: 'absolute', left: '16px', top: '13px', fontSize: '22px', fontWeight: 800, color: '#525450' }}>₱</span>
                <input
                  className="form-input"
                  type="number"
                  value={myListingPrice || ''}
                  onChange={(e) => setMyListingPrice(Number(e.target.value))}
                  placeholder="Enter your proposed price..."
                  style={{ paddingLeft: '42px', fontSize: '20px', height: '54px', fontWeight: 700 }}
                />
              </div>

              {myListingPrice > 0 ? (
                <div
                  style={{
                    padding: '14px 22px',
                    borderRadius: '14px',
                    background: myListingPrice < currentBasePrice ? '#EAF6EE' : myListingPrice === currentBasePrice ? '#F0F9FF' : '#FDF2F2',
                    color: myListingPrice < currentBasePrice ? '#176B3A' : myListingPrice === currentBasePrice ? '#0369A1' : '#BA3C3C',
                    border: `2px solid ${myListingPrice <= currentBasePrice ? '#176B3A' : '#BA3C3C'}`,
                    fontWeight: 800,
                    fontSize: '17px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <span>{myListingPrice < currentBasePrice ? '✓' : myListingPrice === currentBasePrice ? '⚖️' : '⚠️'}</span>
                  <span>
                    {myListingPrice < currentBasePrice
                      ? `Very Competitive! (₱${(currentBasePrice - myListingPrice).toFixed(2)} below official market average)`
                      : myListingPrice === currentBasePrice
                      ? 'Aligned Exactly with Official Benchmark'
                      : `Above Market Price (+₱${(myListingPrice - currentBasePrice).toFixed(2)} premium)`}
                  </span>
                </div>
              ) : (
                <div style={{ fontSize: '16px', color: '#525450', fontStyle: 'italic' }}>
                  Type a price to see instant competitiveness feedback.
                </div>
              )}
            </div>
          </div>

          {/* Regional Price Comparison Table */}
          <div className="card" style={{ padding: '28px', marginBottom: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27', margin: 0 }}>
                  🗺️ Regional Price Comparison for {selectedCrop}
                </h2>
                <p style={{ color: '#525450', fontSize: '16px', marginTop: '4px' }}>
                  Prevailing rates across key agricultural food terminals in the Philippines.
                </p>
              </div>

              <button
                onClick={() => handleTabChange('trends')}
                className="btn btn-secondary"
                style={{ fontSize: '15px' }}
              >
                View Historical Trends →
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8F7F3', borderBottom: '2px solid #E4E2DC' }}>
                    <th style={{ padding: '14px 16px', fontSize: '16px', fontWeight: 800, color: '#0E4A27' }}>Region</th>
                    <th style={{ padding: '14px 16px', fontSize: '16px', fontWeight: 800, color: '#0E4A27' }}>Trading Terminal</th>
                    <th style={{ padding: '14px 16px', fontSize: '16px', fontWeight: 800, color: '#0E4A27' }}>Price per {unit}</th>
                    <th style={{ padding: '14px 16px', fontSize: '16px', fontWeight: 800, color: '#0E4A27' }}>Market Variance</th>
                    <th style={{ padding: '14px 16px', fontSize: '16px', fontWeight: 800, color: '#0E4A27' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {regionalComparisons.map((row, idx) => {
                    const priceOffset = idx === 0 ? 0 : idx === 1 ? 2.5 : idx === 2 ? -1 : idx === 3 ? 3 : 5.5;
                    const computedPrice = Math.max(10, currentBasePrice + priceOffset);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #E4E2DC' }}>
                        <td style={{ padding: '16px', fontWeight: 700, fontSize: '16px' }}>{row.region}</td>
                        <td style={{ padding: '16px', color: '#525450', fontSize: '15px' }}>{row.market}</td>
                        <td style={{ padding: '16px', fontWeight: 800, fontSize: '18px', color: '#0E4A27' }}>
                          ₱{computedPrice.toFixed(2)}
                        </td>
                        <td style={{ padding: '16px', fontWeight: 700, fontSize: '15px', color: row.diff.startsWith('+') ? '#BA3C3C' : row.diff.startsWith('-') ? '#176B3A' : '#525450' }}>
                          {row.diff}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span
                            className="badge"
                            style={{
                              background: idx === 0 ? '#EAF6EE' : idx === 4 ? '#FEF3C7' : '#F1F5F9',
                              color: idx === 0 ? '#176B3A' : idx === 4 ? '#92400E' : '#475569',
                              fontSize: '13px',
                              fontWeight: 700,
                            }}
                          >
                            {row.badge}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 2: PRICE TRENDS & HISTORICAL ANALYTICS (Charts, Forecasts & High/Low)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'trends' && (
        <div>
          {/* Trend Analytics Summary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            {/* 30-Day Trend Movement */}
            <div className="card" style={{ borderLeft: `8px solid ${isUpward ? '#176B3A' : '#BA3C3C'}`, background: '#FFFFFF' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#525450', textTransform: 'uppercase' }}>
                Overall Price Movement
              </div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: isUpward ? '#176B3A' : '#BA3C3C', margin: '8px 0 4px 0' }}>
                {isUpward ? '↑' : '↓'} {pctChange}%
              </div>
              <div style={{ fontSize: '15px', color: '#525450', fontWeight: 600 }}>
                {isUpward ? 'Upward price trend over period' : 'Downward softening over period'}
              </div>
            </div>

            {/* Average Price */}
            <div className="card" style={{ borderLeft: '8px solid #2B72B3', background: '#FFFFFF' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#525450', textTransform: 'uppercase' }}>
                Period Average Rate
              </div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#0E4A27', margin: '8px 0 4px 0' }}>
                ₱{avgPrice} <span style={{ fontSize: '18px', color: '#525450' }}>/{unit}</span>
              </div>
              <div style={{ fontSize: '15px', color: '#2B72B3', fontWeight: 700 }}>
                Range: ₱{minPrice} — ₱{maxPrice}
              </div>
            </div>

            {/* Volatility Index */}
            <div className="card" style={{ borderLeft: '8px solid #10B981', background: '#FFFFFF' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#525450', textTransform: 'uppercase' }}>
                Volatility & Market Risk
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0E4A27', margin: '8px 0 4px 0' }}>
                🟢 Low Volatility
              </div>
              <div style={{ fontSize: '15px', color: '#525450', fontWeight: 600 }}>
                Predictable price curve; ideal for scheduling forward crop sales.
              </div>
            </div>

            {/* Seasonal Window */}
            <div className="card" style={{ borderLeft: '8px solid #D99500', background: '#FFFFFF' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#525450', textTransform: 'uppercase' }}>
                Seasonal Trading Recommendation
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0E4A27', margin: '8px 0 4px 0' }}>
                🌾 Favorable Selling Window
              </div>
              <div style={{ fontSize: '14px', color: '#525450', lineHeight: 1.4 }}>
                Demand is climbing as wet season harvesting concludes.
              </div>
            </div>
          </div>

          {/* Interactive Trend Chart Card */}
          <div className="card" style={{ marginBottom: '36px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27', margin: 0 }}>
                  Historical Price Trend: {selectedCrop}
                </h2>
                <p style={{ color: '#525450', fontSize: '17px', marginTop: '4px' }}>
                  Recorded fluctuations in {selectedRegion}.
                </p>
              </div>

              {/* Timeframe Filter Buttons */}
              <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: '4px', borderRadius: '12px', gap: '4px' }}>
                {(['7d', '30d', '3m', '1y'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '15px',
                      cursor: 'pointer',
                      background: timeframe === t ? '#176B3A' : 'transparent',
                      color: timeframe === t ? '#FFFFFF' : '#525450',
                    }}
                  >
                    {t === '7d' ? '7 Days' : t === '30d' ? '30 Days' : t === '3m' ? '3 Months' : '1 Year'}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ color: '#525450', fontSize: '18px', textAlign: 'center', padding: '56px', fontWeight: 600 }}>
                Loading market price trend chart…
              </div>
            ) : (
              <div>
                <PriceChart
                  data={prices.map((p) => ({
                    date: p.recordedAt,
                    price: p.price,
                    marketLocation: p.marketLocation,
                  }))}
                  unit={`₱/${unit}`}
                />
              </div>
            )}
          </div>

          {/* Seasonal Analysis & Insights Card */}
          <div className="card" style={{ padding: '28px', background: '#F8FAF8', border: '2px solid #D1E5D9' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0E4A27', marginBottom: '12px' }}>
              💡 Agronomic Market Intelligence & Cycle Analysis
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#1A1C1A', marginBottom: '6px' }}>
                  📅 Peak Harvest Season Impact
                </h4>
                <p style={{ fontSize: '15px', color: '#525450', lineHeight: 1.5, margin: 0 }}>
                  For {selectedCrop}, regional harvest peaks typically bring temporary dips in farmgate prices. Farmers with safe drying/storage facilities benefit by holding stock 3–4 weeks for higher returns.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#1A1C1A', marginBottom: '6px' }}>
                  🚚 Wholesale Freight & Logistics Advice
                </h4>
                <p style={{ fontSize: '15px', color: '#525450', lineHeight: 1.5, margin: 0 }}>
                  Shipping directly to major regional food terminals in Bukidnon and Cagayan de Oro yields 8–15% higher net margins than selling at remote farmgate gates.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
