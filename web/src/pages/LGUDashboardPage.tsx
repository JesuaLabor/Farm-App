import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { analyticsApi } from '../api/analytics';
import { PriceChart } from '../components/PriceChart';
import { useAuth } from '../contexts/AuthContext';
import type { LGUDashboardSummary } from '../types/analytics';

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

function fmt(n: number) {
  return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  approved:     { label: 'Approved',     color: '#1E7E45', bg: '#EAF6EE', icon: '✓' },
  rejected:     { label: 'Rejected',     color: '#BA3C3C', bg: '#FDF2F2', icon: '✕' },
  under_review: { label: 'Under Review', color: '#B87A00', bg: '#FEF3D6', icon: '🔍' },
  submitted:    { label: 'Submitted',    color: '#2B72B3', bg: '#EBF4FC', icon: '📨' },
};

export const LGUDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const isLguStaff = user?.role === 'lgu_staff';

  const defaultRegion = isLguStaff && user?.region ? user.region : 'All Regions';

  const [selectedRegion, setSelectedRegion] = useState(defaultRegion);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState<LGUDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const summary = await analyticsApi.getLGUDashboard({
        region: selectedRegion !== 'All Regions' ? selectedRegion : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setData(summary);
    } catch (e) {
      console.error('Failed to fetch LGU dashboard analytics:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, startDate, endDate]);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  const maxCropCount = data?.topCrops.reduce((m, c) => Math.max(m, c.listingCount), 1) || 1;

  const kpiCards = data ? [
    {
      icon: '👨‍🌾',
      label: 'Registered Farmers',
      value: data.totalRegisteredFarmers.toLocaleString(),
      sub: 'Verified accounts in region',
      color: '#176B3A',
      bg: '#EAF6EE',
    },
    {
      icon: '💰',
      label: 'Trade Volume',
      value: fmt(data.totalTransactionsValue),
      sub: `${data.totalTransactionsCount} completed transactions`,
      color: '#2B72B3',
      bg: '#EBF4FC',
    },
    {
      icon: '🏛️',
      label: 'Program Applications',
      value: data.programApplicationsByStatus.reduce((s, a) => s + a.count, 0).toString(),
      sub: 'Across all subsidy programs',
      color: '#7C3AED',
      bg: '#F3E5F5',
    },
    {
      icon: '💬',
      label: 'Community Posts',
      value: data.communityActivity.totalPosts.toString(),
      sub: `${data.communityActivity.totalComments} expert replies`,
      color: '#0D9488',
      bg: '#E0F2F1',
    },
  ] : [];

  return (
    <div className="page-root">
      <Navbar />

      <main className="page-main">

        {/* ── Page Header ─────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #0E4A27 0%, #176B3A 100%)',
          borderRadius: '20px',
          padding: '32px 36px',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative background pattern */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }} />
          <div style={{
            position: 'absolute', bottom: -60, right: 80,
            width: '140px', height: '140px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }} />

          <div style={{ position: 'relative' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px',
            }}>
              🏛️ Regional Oversight & Analytics
            </span>
            <h1 style={{
              fontSize: '28px', fontWeight: 800, color: '#FFFFFF',
              marginBottom: '8px', lineHeight: 1.2,
            }}>
              LGU Agricultural Monitoring
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.72)', maxWidth: '600px', lineHeight: 1.6 }}>
              Macro view of agricultural activity: registered farmers, marketplace trade volume, crop listings, subsidy programs, and community engagement.
            </p>

            {/* Location context pill for LGU staff */}
            {isLguStaff && user?.region && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                marginTop: '16px', padding: '6px 14px', borderRadius: '20px',
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                fontSize: '13px', fontWeight: 700, color: '#FFFFFF',
              }}>
                📍 {user.municipality ? `${user.municipality}, ` : ''}{user.region}
              </div>
            )}
          </div>
        </div>

        {/* ── Filter Bar ───────────────────────────────────── */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #E4E2DC',
          padding: '20px 24px',
          marginBottom: '28px',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          boxShadow: '0 2px 8px rgba(26,28,26,0.05)',
        }}>
          <div style={{ flex: 2, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#525450', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              🗺️ Region / Jurisdiction
            </label>
            {isLguStaff ? (
              <div style={{
                padding: '10px 14px', borderRadius: '10px',
                border: '1.5px solid #C8EDD6', background: '#F6FCF8',
                fontSize: '14px', fontWeight: 700, color: '#176B3A',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                📍 {selectedRegion}
              </div>
            ) : (
              <select
                className="form-input"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                style={{ borderRadius: '10px' }}
              >
                {philippineRegions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            )}
          </div>

          <div style={{ flex: 1, minWidth: '160px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#525450', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              📅 Start Date
            </label>
            <input
              className="form-input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ borderRadius: '10px' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: '160px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#525450', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              📅 End Date
            </label>
            <input
              className="form-input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ borderRadius: '10px' }}
            />
          </div>

          <button
            onClick={fetchMetrics}
            style={{
              padding: '12px 24px', borderRadius: '10px', border: 'none',
              background: '#176B3A', color: '#FFFFFF',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'background 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#0E4A27')}
            onMouseLeave={e => (e.currentTarget.style.background = '#176B3A')}
          >
            🔄 Refresh Metrics
          </button>
        </div>

        {/* ── Content ───────────────────────────────────────── */}
        {loading ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '80px 24px', gap: '16px',
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              border: '4px solid #EAF6EE', borderTopColor: '#176B3A',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: '#525450', fontSize: '14px', fontWeight: 600 }}>Loading regional analytics…</p>
          </div>
        ) : !data ? (
          <div className="empty-state">
            <div className="empty-state__icon">📊</div>
            <h3 className="empty-state__title">No analytics data available</h3>
          </div>
        ) : (
          <>
            {/* ── KPI Cards ──────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              {kpiCards.map((kpi) => (
                <div
                  key={kpi.label}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1.5px solid #E4E2DC',
                    padding: '20px 22px',
                    boxShadow: '0 2px 8px rgba(26,28,26,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 20px rgba(23,107,58,0.1)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(26,28,26,0.05)';
                  }}
                >
                  {/* Color accent top bar */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: kpi.color, borderRadius: '16px 16px 0 0' }} />

                  {/* Icon bubble */}
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: kpi.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '22px', marginTop: '4px',
                  }}>
                    {kpi.icon}
                  </div>

                  {/* Label */}
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#525450', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    {kpi.label}
                  </div>

                  {/* Value */}
                  <div style={{ fontSize: '28px', fontWeight: 800, color: kpi.color, lineHeight: 1.1 }}>
                    {kpi.value}
                  </div>

                  {/* Sub */}
                  <div style={{ fontSize: '12px', color: '#6F716C', fontWeight: 600 }}>
                    {kpi.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Charts Grid ────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>

              {/* Top Crops Bar Chart */}
              <div style={{
                background: '#FFFFFF', borderRadius: '16px',
                border: '1.5px solid #E4E2DC', padding: '24px',
                boxShadow: '0 2px 8px rgba(26,28,26,0.05)',
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '18px' }}>🌾</span>
                    <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0E4A27' }}>Top Produce Commodities</h2>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6F716C', marginLeft: '26px' }}>Most listed crops by farmers in this region</p>
                </div>

                {data.topCrops.length === 0 ? (
                  <div style={{ color: '#6F716C', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>No produce listings logged yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {data.topCrops.map((c, idx) => {
                      const pct = Math.round((c.listingCount / maxCropCount) * 100);
                      const barColors = ['#176B3A', '#2B72B3', '#B87A00', '#7C3AED', '#0D9488'];
                      const color = barColors[idx % barColors.length];
                      return (
                        <div key={c.cropName}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                            <span style={{ color: '#1A1C1A' }}>{c.cropName}</span>
                            <span style={{
                              padding: '2px 8px', borderRadius: '20px', fontSize: '11px',
                              background: '#EAF6EE', color: '#176B3A', fontWeight: 800,
                            }}>
                              {c.listingCount} {c.listingCount === 1 ? 'listing' : 'listings'}
                            </span>
                          </div>
                          <div style={{ height: '7px', borderRadius: '4px', backgroundColor: '#F0EFE9', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', width: `${pct}%`, background: color,
                              borderRadius: '4px', transition: 'width 0.6s ease',
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Program Applications Status */}
              <div style={{
                background: '#FFFFFF', borderRadius: '16px',
                border: '1.5px solid #E4E2DC', padding: '24px',
                boxShadow: '0 2px 8px rgba(26,28,26,0.05)',
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '18px' }}>📋</span>
                    <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0E4A27' }}>Program Applications</h2>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6F716C', marginLeft: '26px' }}>Farmer applications across all subsidy programs</p>
                </div>

                {data.programApplicationsByStatus.length === 0 ? (
                  <div style={{ color: '#6F716C', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>No program applications submitted yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {data.programApplicationsByStatus.map((st) => {
                      const meta = STATUS_META[st.status] || { label: st.status, color: '#525450', bg: '#F5F5F5', icon: '•' };
                      const total = data.programApplicationsByStatus.reduce((s, a) => s + a.count, 0);
                      const pct = total > 0 ? Math.round((st.count / total) * 100) : 0;
                      return (
                        <div key={st.status} style={{
                          padding: '12px 16px', borderRadius: '10px',
                          background: meta.bg, border: `1.5px solid ${meta.color}22`,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              background: meta.color, color: '#FFF',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '12px', fontWeight: 800, flexShrink: 0,
                            }}>
                              {meta.icon}
                            </span>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1A1C1A' }}>{meta.label}</div>
                              <div style={{ fontSize: '11px', color: '#6F716C', fontWeight: 600 }}>{pct}% of total</div>
                            </div>
                          </div>
                          <span style={{ fontSize: '22px', fontWeight: 800, color: meta.color }}>{st.count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Price Trend Chart */}
            {data.recentMarketPrices.length > 0 && (
              <div style={{
                background: '#FFFFFF', borderRadius: '16px',
                border: '1.5px solid #E4E2DC', padding: '24px',
                boxShadow: '0 2px 8px rgba(26,28,26,0.05)',
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '18px' }}>📈</span>
                    <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0E4A27' }}>Regional Market Price Trends</h2>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6F716C', marginLeft: '26px' }}>Historical daily market rates recorded by local agriculture staff</p>
                </div>
                <PriceChart data={data.recentMarketPrices.map((p) => ({ date: p.recordedAt, price: p.price, marketLocation: p.marketLocation }))} />
              </div>
            )}
          </>
        )}
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
