import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { db, type CachedFinancialEntry } from '../db/db';
import { useOffline } from '../contexts/OfflineContext';
import { Spinner } from '../components/Spinner';

export const FinancialTrackerScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isOnline, enqueueOfflineItem } = useOffline();
  const [entries, setEntries] = useState<CachedFinancialEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // New entry modal
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState('Harvest Sale');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      if (navigator.onLine) {
        const data = await api.listFinancialEntries();
        setEntries(data);
        // Cache to IndexedDB for offline read
        await db.financialCache.clear();
        await db.financialCache.bulkPut(data);
      } else {
        const cached = await db.financialCache.toArray();
        setEntries(cached);
      }
    } catch (e) {
      console.warn('Network request failed, reading financial log from IndexedDB cache:', e);
      const cached = await db.financialCache.toArray();
      setEntries(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const totalIncome = entries
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = entries
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0 || !description) return;
    setSaving(true);

    const payload = {
      type,
      category,
      amount: amt,
      description,
      date: new Date().toISOString(),
    };

    try {
      if (isOnline) {
        await api.createFinancialEntry(payload);
        await fetchEntries();
      } else {
        // Offline flow: store local entry with pendingSync badge & queue
        const tempId = `offline-${Date.now()}`;
        const localRecord: CachedFinancialEntry = {
          ...payload,
          id: tempId,
          pendingSync: true,
        };
        await db.financialCache.put(localRecord);
        await enqueueOfflineItem('FINANCIAL_ENTRY', { ...payload, tempId });
        setEntries((prev) => [localRecord, ...prev]);
      }

      setShowModal(false);
      setAmount('');
      setDescription('');
    } catch (err) {
      console.error('Failed to save financial entry, fallback to offline queue:', err);
      const tempId = `offline-${Date.now()}`;
      const localRecord: CachedFinancialEntry = {
        ...payload,
        id: tempId,
        pendingSync: true,
      };
      await db.financialCache.put(localRecord);
      await enqueueOfflineItem('FINANCIAL_ENTRY', { ...payload, tempId });
      setEntries((prev) => [localRecord, ...prev]);
      setShowModal(false);
      setAmount('');
      setDescription('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* ── Top Bar ──────────────────────────────────────────── */}
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <span>←</span> Back
        </button>
        <div className="top-bar-title">Financial Tracker</div>
        <button className="btn-action" onClick={() => setShowModal(true)}>
          + Log
        </button>
      </div>

      {/* ── Net Profit Summary Header ─────────────────────────── */}
      <div className="summary-box">
        <div className="net-box">
          <div className="net-label">Net Profit / Loss</div>
          <div className={`net-value ${netProfit < 0 ? 'negative' : ''}`}>
            ₱{netProfit.toLocaleString()}
          </div>
        </div>

        <div className="stat-row">
          <div className="stat-card">
            <div className="stat-label">Income</div>
            <div className="stat-income">+₱{totalIncome.toLocaleString()}</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-card">
            <div className="stat-label">Expenses</div>
            <div className="stat-expense">-₱{totalExpense.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* ── Transaction Log List ───────────────────────────────── */}
      <div className="scroll-content">
        <div className="section-title" style={{ marginBottom: 12 }}>Transaction Log</div>
        {loading ? (
          <Spinner />
        ) : entries.length === 0 ? (
          <div className="empty-card">
            <div className="empty-icon">📊</div>
            <div className="empty-title">No financial records</div>
            <div className="empty-desc">Tap "+ Log" above to record your farm income or expenses.</div>
          </div>
        ) : (
          entries.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-left">
                <div className={`icon-circle ${item.type === 'income' ? 'income-circle' : 'expense-circle'}`}>
                  {item.type === 'income' ? '↗' : '↘'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="item-category">{item.category}</span>
                    {item.pendingSync && (
                      <span className="pending-badge">Pending Sync ⏳</span>
                    )}
                  </div>
                  <div className="item-desc">{item.description}</div>
                </div>
              </div>
              <div className={`item-amount ${item.type === 'income' ? 'amount-income' : 'amount-expense'}`}>
                {item.type === 'income' ? '+' : '-'}₱{item.amount.toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Log Entry Modal ────────────────────────────────────── */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Log Financial Entry</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddEntry}>
              {/* Type selector */}
              <div className="type-selector">
                <button
                  type="button"
                  className={`type-option ${type === 'income' ? 'income-active' : ''}`}
                  onClick={() => { setType('income'); setCategory('Harvest Sale'); }}
                >
                  Income (+)
                </button>
                <button
                  type="button"
                  className={`type-option ${type === 'expense' ? 'expense-active' : ''}`}
                  onClick={() => { setType('expense'); setCategory('Fertilizers'); }}
                >
                  Expense (-)
                </button>
              </div>

              <div className="field">
                <label className="label">Category</label>
                <input
                  className="input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Harvest Sale, Seeds, Labor"
                />
              </div>

              <div className="field">
                <label className="label">Amount (₱)</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 15000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label className="label">Description / Notes</label>
                <input
                  className="input"
                  placeholder="e.g. Sold 50 sacks of Palay"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? <Spinner size={20} /> : !isOnline ? 'Save Offline ⚡' : 'Save Entry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
