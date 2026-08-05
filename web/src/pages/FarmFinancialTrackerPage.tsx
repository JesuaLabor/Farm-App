import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { financialApi } from '../api/financial';
import type { FinancialEntry, FinancialSummary, FinancialCategory, EntryType } from '../types/financial';

const INCOME_CATEGORIES: { value: FinancialCategory; label: string; icon: string }[] = [
  { value: 'produce_sale', label: 'Produce Sale', icon: '🌾' },
  { value: 'other',        label: 'Other Income', icon: '💰' },
];

const EXPENSE_CATEGORIES: { value: FinancialCategory; label: string; icon: string }[] = [
  { value: 'seeds',      label: 'Seeds',      icon: '🌱' },
  { value: 'fertilizer', label: 'Fertilizer', icon: '🧴' },
  { value: 'labor',      label: 'Labor',      icon: '👷' },
  { value: 'equipment',  label: 'Equipment',  icon: '🚜' },
  { value: 'other',      label: 'Other',      icon: '📦' },
];

const ALL_CATEGORIES: Record<FinancialCategory, { label: string; icon: string; color: string }> = {
  produce_sale: { label: 'Produce Sale', icon: '🌾', color: 'var(--green-600)' },
  seeds:        { label: 'Seeds',        icon: '🌱', color: '#0284c7' },
  fertilizer:   { label: 'Fertilizer',   icon: '🧴', color: '#7c3aed' },
  labor:        { label: 'Labor',        icon: '👷', color: '#d97706' },
  equipment:    { label: 'Equipment',    icon: '🚜', color: '#dc2626' },
  other:        { label: 'Other',        icon: '📦', color: 'var(--gray-500)' },
};

function today() {
  return new Date().toISOString().split('T')[0];
}

function getMonthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function fmt(n: number) {
  return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Mini bar chart for category breakdown ────────────────────────────────────

const BreakdownChart: React.FC<{ summary: FinancialSummary }> = ({ summary }) => {
  const total = summary.breakdown.reduce((s, b) => s + b.amount, 0) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {summary.breakdown
        .slice()
        .sort((a, b) => b.amount - a.amount)
        .map((b) => {
          const meta = ALL_CATEGORIES[b.category] ?? { label: b.category, icon: '📊', color: 'var(--gray-500)' };
          const pct = Math.round((b.amount / total) * 100);
          return (
            <div key={b.category}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                <span>{meta.icon} {meta.label}</span>
                <span className="text-mono" style={{ color: meta.color }}>{fmt(b.amount)} ({pct}%)</span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--gray-100)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, backgroundColor: meta.color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
              </div>
            </div>
          );
        })}
      {summary.breakdown.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>No breakdown data logged yet.</p>
      )}
    </div>
  );
};

// ── Net Profit Sparkline SVG ──────────────────────────────────────────────────

const ProfitSparkline: React.FC<{ entries: FinancialEntry[] }> = ({ entries }) => {
  const grouped: Record<string, number> = {};
  entries.forEach((e) => {
    const d = e.date.split('T')[0];
    if (!grouped[d]) grouped[d] = 0;
    grouped[d] += e.type === 'income' ? e.amount : -e.amount;
  });

  const sorted = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  if (sorted.length < 2) {
    return <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', textAlign: 'center', padding: '24px' }}>Log more transactions to visualize daily trends.</div>;
  }

  const values = sorted.map(([, v]) => v);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  const W = 500, H = 120, pad = 20;
  const getX = (i: number) => pad + (i / (sorted.length - 1)) * (W - 2 * pad);
  const getY = (v: number) => H - pad - ((v - minV) / range) * (H - 2 * pad);

  const pts = sorted.map(([, v], i) => `${getX(i)},${getY(v)}`).join(' ');
  const area = `${pts} ${getX(sorted.length - 1)},${H - pad} ${getX(0)},${H - pad}`;
  const isPositive = values[values.length - 1] >= 0;
  const lineColor = isPositive ? 'var(--green-600)' : 'var(--color-error)';

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        <defs>
          <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={pad} y1={getY(0)} x2={W - pad} y2={getY(0)} stroke="var(--color-border)" strokeDasharray="4" />
        <polygon points={area} fill="url(#profitGrad)" />
        <polyline fill="none" stroke={lineColor} strokeWidth="2.5" points={pts} strokeLinecap="round" strokeLinejoin="round" />
        {sorted.map(([, v], i) => (
          <circle key={i} cx={getX(i)} cy={getY(v)} r="4" fill={lineColor} stroke="#fff" strokeWidth="1.5" />
        ))}
      </svg>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────

export const FarmFinancialTrackerPage: React.FC = () => {
  const [startDate, setStartDate] = useState(getMonthStart());
  const [endDate, setEndDate] = useState(today());

  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [entryType, setEntryType] = useState<EntryType>('income');
  const [category, setCategory] = useState<FinancialCategory>('produce_sale');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [entryDate, setEntryDate] = useState(today());
  const [notes, setNotes] = useState('');
  const [relatedCrop, setRelatedCrop] = useState('');
  const [saving, setSaving] = useState(false);
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ent, sum] = await Promise.all([
        financialApi.listEntries({ startDate, endDate }),
        financialApi.getSummary({ startDate, endDate }),
      ]);
      setEntries(ent);
      setSummary(sum);
    } catch (e) {
      console.error('Failed to load financial data:', e);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (entryType === 'income') setCategory('produce_sale');
    else setCategory('seeds');
  }, [entryType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormMsg(null);
    try {
      await financialApi.createEntry({
        type: entryType,
        category,
        title,
        amount: parseFloat(amount),
        date: entryDate,
        notes: notes || undefined,
        relatedCrop: relatedCrop || undefined,
      });
      setFormMsg({ type: 'success', text: `${entryType === 'income' ? 'Income' : 'Expense'} entry logged successfully.` });
      setTitle(''); setAmount(''); setNotes(''); setRelatedCrop('');
      loadData();
    } catch (err: any) {
      setFormMsg({ type: 'error', text: err.response?.data?.error || 'Failed to save financial entry.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await financialApi.deleteEntry(id);
      loadData();
    } catch (e) {
      alert('Failed to delete entry.');
    }
  };

  const filteredEntries = entries.filter((e) => activeTab === 'all' || e.type === activeTab);
  const categories = entryType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="page-root">
      <Navbar />

      <main className="page-main">
        {/* ── Header Banner ───────────────────────────────────── */}
        <div className="page-header-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span className="page-header-label">Farm financial management</span>
            <h1 className="page-header-title">Income &amp; expense tracker</h1>
            <p className="page-header-sub">
              Track every peso in and out to maintain full financial clarity for your farm operations.
            </p>
          </div>
          <button className="btn btn--inverse" onClick={() => setShowForm((v) => !v)}>
            {showForm ? '✕ Close form' : '+ Log new entry'}
          </button>
        </div>

        {/* ── Date Range Filter Bar ───────────────────────────── */}
        <div className="filter-bar" style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="filter-field">
            <label className="filter-label">From date</label>
            <input className="form-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="filter-field">
            <label className="filter-label">To date</label>
            <input className="form-input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button className="btn btn--primary" onClick={loadData}>
            Apply filter
          </button>
        </div>

        {/* ── Collapsible Add Entry Form ──────────────────────── */}
        {showForm && (
          <div className="card-elevated" style={{ marginBottom: '32px', borderTop: '4px solid var(--color-accent)' }}>
            <h2 className="text-title" style={{ marginBottom: '20px' }}>
              📝 Log new entry
            </h2>

            {formMsg && (
              <div className={`feedback-box feedback-box--${formMsg.type}`}>
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                {(['income', 'expense'] as EntryType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEntryType(t)}
                    style={{
                      flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '14px',
                      border: entryType === t ? 'none' : '1.5px solid var(--color-border)',
                      cursor: 'pointer',
                      backgroundColor: entryType === t
                        ? (t === 'income' ? 'var(--color-accent)' : 'var(--color-error)')
                        : 'var(--color-surface)',
                      color: entryType === t ? '#fff' : 'var(--color-text-muted)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {t === 'income' ? '💚 Income (+)' : '🔴 Expense (-)'}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-field">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value as FinancialCategory)}>
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Title / Description *</label>
                  <input className="form-input" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sold 100kg of Tomatoes" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-field">
                  <label className="form-label">Amount (₱) *</label>
                  <input className="form-input" type="number" min="0.01" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="form-field">
                  <label className="form-label">Date *</label>
                  <input className="form-input" type="date" required value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
                </div>
                <div className="form-field">
                  <label className="form-label">Related crop (optional)</label>
                  <input className="form-input" type="text" value={relatedCrop} onChange={(e) => setRelatedCrop(e.target.value)} placeholder="Tomato, Corn..." />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Notes (optional)</label>
                <textarea className="form-input form-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes…" rows={2} />
              </div>

              <button type="submit" disabled={saving} className="btn btn--primary btn--full">
                {saving ? 'Saving…' : `Save ${entryType === 'income' ? 'Income' : 'Expense'} entry`}
              </button>
            </form>
          </div>
        )}

        {/* ── Summary KPI Cards ───────────────────────────────── */}
        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            {[
              { label: 'Total income', value: summary.totalIncome, color: 'var(--green-600)', bg: 'var(--green-50)', icon: '💚', border: 'var(--green-300)' },
              { label: 'Total expenses', value: summary.totalExpense, color: 'var(--color-error)', bg: 'var(--color-error-bg)', icon: '🔴', border: 'var(--color-error-border)' },
              {
                label: 'Net profit / loss', value: summary.netProfit,
                color: summary.netProfit >= 0 ? 'var(--color-accent)' : 'var(--color-error)',
                bg: summary.netProfit >= 0 ? 'var(--color-accent-light)' : 'var(--color-error-bg)',
                icon: summary.netProfit >= 0 ? '📈' : '📉',
                border: summary.netProfit >= 0 ? 'var(--color-border-focus)' : 'var(--color-error-border)',
              },
            ].map((card) => (
              <div key={card.label} className="card-elevated" style={{ borderLeft: `4px solid ${card.border}`, backgroundColor: card.bg }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{card.icon}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.label}</div>
                <div className="text-mono" style={{ fontSize: '26px', fontWeight: 800, color: card.color, marginTop: '4px' }}>
                  {fmt(card.value)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', marginBottom: '28px' }}>
          {/* ── Category Breakdown ── */}
          {summary && (
            <div className="card-elevated">
              <h2 className="text-title" style={{ marginBottom: '20px' }}>Category breakdown</h2>
              <BreakdownChart summary={summary} />
            </div>
          )}

          {/* ── Net Profit Sparkline ── */}
          <div className="card-elevated">
            <h2 className="text-title" style={{ marginBottom: '4px' }}>Daily net profit trend</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              Running profit/loss per day over selected period.
            </p>
            {loading ? (
              <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Loading chart…</div>
            ) : (
              <ProfitSparkline entries={entries} />
            )}
          </div>
        </div>

        {/* ── Entries Table ─────────────────────────────────────── */}
        <div className="card-elevated">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 className="text-title" style={{ margin: 0 }}>
              Financial entries ({filteredEntries.length})
            </h2>
            <div className="pill-tabs-row" style={{ marginBottom: 0 }}>
              {(['all', 'income', 'expense'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pill-tab${activeTab === tab ? ' pill-tab--active' : ''}`}
                >
                  {tab === 'all' ? 'All' : tab === 'income' ? '💚 Income' : '🔴 Expenses'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>Loading entries…</div>
          ) : filteredEntries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">📋</div>
              <h3 className="empty-state__title">No entries for this period</h3>
              <p className="empty-state__desc">Log your first income or expense entry above.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px' }}>Type</th>
                    <th style={{ padding: '12px' }}>Category</th>
                    <th style={{ padding: '12px' }}>Title</th>
                    <th style={{ padding: '12px' }}>Crop</th>
                    <th style={{ padding: '12px' }}>Amount</th>
                    <th style={{ padding: '12px' }}>Notes</th>
                    <th style={{ padding: '12px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => {
                    const meta = ALL_CATEGORIES[entry.category] ?? { label: entry.category, icon: '📦', color: 'var(--color-text-muted)' };
                    return (
                      <tr key={entry.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>
                            {new Date(entry.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span className={`badge ${entry.type === 'income' ? 'badge-green' : 'badge-earth'}`}>
                            {entry.type === 'income' ? '+ Income' : '- Expense'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ color: meta.color, fontWeight: 700 }}>{meta.icon} {meta.label}</span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 600, color: 'var(--color-text)' }}>{entry.title}</td>
                        <td style={{ padding: '12px', color: 'var(--color-text-muted)' }}>{entry.relatedCrop || '—'}</td>
                        <td className="text-mono" style={{ padding: '12px', fontWeight: 800, color: entry.type === 'income' ? 'var(--green-600)' : 'var(--color-error)' }}>
                          {entry.type === 'income' ? '+' : '-'}{fmt(entry.amount)}
                        </td>
                        <td style={{ padding: '12px', color: 'var(--color-text-light)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {entry.notes || '—'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="btn btn--ghost btn-sm"
                            style={{ color: 'var(--color-error)' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
