import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { analyticsApi } from '../api/analytics';
import { PriceChart } from '../components/PriceChart';
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

export const LGUDashboardPage: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
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

  return (
    <div className="page-root">
      <Navbar />

      <main className="page-main">
        {/* ── Page Header Banner ──────────────────────────────── */}
        <div className="page-header-banner">
          <div>
            <span className="page-header-label">Regional oversight &amp; analytics</span>
            <h1 className="page-header-title">LGU agricultural office monitoring dashboard</h1>
            <p className="page-header-sub">
              Macro view of agricultural activity: registered farmers, marketplace trade volume, crop listings, subsidy programs, and community engagement.
            </p>
          </div>
        </div>

        {/* ── Filter Bar ───────────────────────────────────────── */}
        <div className="filter-bar" style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <label className="filter-label">Region / municipality</label>
            <select
              className="form-input"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              {philippineRegions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="filter-field">
            <label className="filter-label">Start date</label>
            <input className="form-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div className="filter-field">
            <label className="filter-label">End date</label>
            <input className="form-input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <button className="btn btn--primary" onClick={fetchMetrics}>
            Refresh metrics
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--color-text-muted)' }}>Computing aggregation pipelines…</div>
        ) : !data ? (
          <div className="empty-state">
            <div className="empty-state__icon">📊</div>
            <h3 className="empty-state__title">No analytics data available</h3>
          </div>
        ) : (
          <>
            {/* ── KPI Cards Row ─────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div className="card-elevated" style={{ borderLeft: '4px solid var(--color-accent)' }}>
                <span style={{ fontSize: '28px' }}>👨‍🌾</span>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '6px' }}>
                  Registered farmers
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-accent)', marginTop: '2px' }}>
                  {data.totalRegisteredFarmers.toLocaleString()}
                </div>
              </div>

              <div className="card-elevated" style={{ borderLeft: '4px solid #0284c7' }}>
                <span style={{ fontSize: '28px' }}>💰</span>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '6px' }}>
                  Marketplace trade volume
                </div>
                <div className="text-mono" style={{ fontSize: '24px', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                  {fmt(data.totalTransactionsValue)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {data.totalTransactionsCount} completed transactions
                </div>
              </div>

              <div className="card-elevated" style={{ borderLeft: '4px solid #7c3aed' }}>
                <span style={{ fontSize: '28px' }}>🏛️</span>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '6px' }}>
                  Program applications
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#7c3aed', marginTop: '2px' }}>
                  {data.programApplicationsByStatus.reduce((s, a) => s + a.count, 0)}
                </div>
              </div>

              <div className="card-elevated" style={{ borderLeft: '4px solid #0d9488' }}>
                <span style={{ fontSize: '28px' }}>💬</span>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '6px' }}>
                  Community engagement
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0d9488', marginTop: '2px' }}>
                  {data.communityActivity.totalPosts} Posts
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {data.communityActivity.totalComments} Expert replies
                </div>
              </div>
            </div>

            {/* ── Visual Charts Grid ─────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              {/* Top Crops Listed Bar Chart */}
              <div className="card-elevated">
                <h2 className="text-title" style={{ marginBottom: '4px' }}>
                  🌾 Top produce commodities listed
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                  Most commonly offered crops by farmers in this region.
                </p>

                {data.topCrops.length === 0 ? (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>No produce listings logged yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {data.topCrops.map((c) => {
                      const pct = Math.round((c.listingCount / maxCropCount) * 100);
                      return (
                        <div key={c.cropName}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                            <span>{c.cropName}</span>
                            <span style={{ color: 'var(--color-accent)' }}>{c.listingCount} listings</span>
                          </div>
                          <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--gray-100)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, backgroundColor: 'var(--color-accent)', borderRadius: '4px', transition: 'width 0.6s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Program Applications Status Breakdown */}
              <div className="card-elevated">
                <h2 className="text-title" style={{ marginBottom: '4px' }}>
                  📋 Program applications by status
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                  Review progress of farmer applications across all subsidy programs.
                </p>

                {data.programApplicationsByStatus.length === 0 ? (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>No program applications submitted yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {data.programApplicationsByStatus.map((st) => {
                      const colorMap: Record<string, string> = {
                        approved: 'var(--green-600)',
                        rejected: 'var(--color-error)',
                        under_review: '#d97706',
                        submitted: '#0284c7',
                      };
                      const color = colorMap[st.status] || 'var(--color-text-muted)';
                      return (
                        <div key={st.status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface)', borderLeft: `4px solid ${color}`, border: '1px solid var(--color-border)', borderLeftWidth: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px', textTransform: 'capitalize' }}>
                            {st.status.replace('_', ' ')}
                          </span>
                          <span style={{ fontWeight: 800, fontSize: '18px', color }}>
                            {st.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Price Trend Chart for Regional Commodities */}
            {data.recentMarketPrices.length > 0 && (
              <div className="card-elevated">
                <h2 className="text-title" style={{ marginBottom: '4px' }}>
                  📈 Regional commodity market price trends
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                  Historical daily market rates recorded by local agriculture staff.
                </p>
                <PriceChart data={data.recentMarketPrices.map((p) => ({ date: p.recordedAt, price: p.price, marketLocation: p.marketLocation }))} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
