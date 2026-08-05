import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { programApi } from '../api/program';
import { useAuth } from '../contexts/AuthContext';
import type { GovernmentProgram, ProgramApplication } from '../types/program';

export const GovernmentProgramsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'programs' | 'my-applications'>('programs');

  const [programs, setPrograms] = useState<GovernmentProgram[]>([]);
  const [myApps, setMyApps] = useState<ProgramApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Application Modal state
  const [selectedProgram, setSelectedProgram] = useState<GovernmentProgram | null>(null);
  const [farmSize, setFarmSize] = useState<number>(1.5);
  const [cropsGrown, setCropsGrown] = useState<string>('Rice, Corn');
  const [submittedDocs, setSubmittedDocs] = useState<string>('RSBSA Registration Card, Barangay Clearance');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [progs, apps] = await Promise.all([
        programApi.listPrograms(),
        user?.role === 'farmer' ? programApi.listMyApplications() : Promise.resolve([]),
      ]);
      setPrograms(progs);
      setMyApps(apps);
    } catch (e) {
      console.error('Failed to load programs:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;
    setSubmitting(true);
    setMsg(null);

    try {
      await programApi.submitApplication(selectedProgram.id, {
        farmSizeHectares: farmSize,
        cropsGrown: cropsGrown.split(',').map((s) => s.trim()).filter(Boolean),
        submittedDocs: submittedDocs.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setMsg({ type: 'success', text: `Application for "${selectedProgram.title}" submitted successfully!` });
      setSelectedProgram(null);
      loadData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to submit application.' });
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (st: string) => {
    switch (st) {
      case 'approved':
        return <span className="badge badge-green">✓ Approved</span>;
      case 'rejected':
        return <span className="badge badge-earth" style={{ color: 'var(--color-error)', backgroundColor: 'var(--color-error-bg)' }}>✕ Rejected</span>;
      case 'under_review':
        return <span className="badge badge-earth">⏳ Under Review</span>;
      default:
        return <span className="badge badge-earth" style={{ color: 'var(--color-accent)', backgroundColor: 'var(--color-accent-light)' }}>📝 Submitted</span>;
    }
  };

  return (
    <div className="page-root">
      <Navbar />

      <main className="page-main">
        {/* ── Page Header ─────────────────────────────────────── */}
        <div className="page-header-banner">
          <div>
            <span className="page-header-label">Institutional support</span>
            <h1 className="page-header-title">Government program &amp; subsidy tracker</h1>
            <p className="page-header-sub">
              Access official LGU &amp; Department of Agriculture subsidies, fertilizer assistance, seed distribution, and equipment support.
            </p>
          </div>
        </div>

        {msg && (
          <div className={`feedback-box feedback-box--${msg.type}`}>
            {msg.text}
          </div>
        )}

        {/* ── Navigation Pill Tabs ─────────────────────────────── */}
        <div className="pill-tabs-row">
          <button
            onClick={() => setActiveTab('programs')}
            className={`pill-tab${activeTab === 'programs' ? ' pill-tab--active' : ''}`}
          >
            🏛️ Available programs ({programs.length})
          </button>
          {user?.role === 'farmer' && (
            <button
              onClick={() => setActiveTab('my-applications')}
              className={`pill-tab${activeTab === 'my-applications' ? ' pill-tab--active' : ''}`}
            >
              📋 My applications ({myApps.length})
            </button>
          )}
        </div>

        {/* ── Tab 1: Available Programs ────────────────────────── */}
        {activeTab === 'programs' && (
          loading ? (
            <div className="listings-skeleton">
              {[1, 2, 3].map((n) => (
                <div key={n} className="skeleton-card">
                  <div className="skeleton-body">
                    <div className="skeleton-line skeleton-line--short" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line skeleton-line--med" />
                  </div>
                </div>
              ))}
            </div>
          ) : programs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">🏛️</div>
              <h3 className="empty-state__title">No government programs listed yet</h3>
              <p className="empty-state__desc">Check back soon for new agricultural subsidies and assistance programs.</p>
            </div>
          ) : (
            <div className="listings-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
              {programs.map((prog) => {
                const isAlreadyApplied = myApps.some((a) => a.programId === prog.id);
                return (
                  <div key={prog.id} className="listing-card" style={{ borderLeft: prog.status === 'open' ? '4px solid var(--color-accent)' : '4px solid var(--gray-300)' }}>
                    <div className="listing-card__body">
                      <div className="listing-card__meta">
                        <span className="badge badge-earth">{prog.agency || 'Dept of Agriculture'}</span>
                        <span className={`badge ${prog.status === 'open' ? 'badge-green' : 'badge-earth'}`}>
                          {prog.status.toUpperCase()}
                        </span>
                      </div>

                      <h3 className="listing-card__name">{prog.title}</h3>
                      <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: 1.5, flex: 1 }}>
                        {prog.description}
                      </p>

                      {prog.eligibilityCriteria?.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>Eligibility criteria:</span>
                          <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', fontSize: '13px', color: 'var(--color-text-light)' }}>
                            {prog.eligibilityCriteria.map((c, i) => <li key={i}>{c}</li>)}
                          </ul>
                        </div>
                      )}

                      {prog.requiredDocuments?.length > 0 && (
                        <div style={{ marginBottom: '16px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>Required documents:</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                            {prog.requiredDocuments.map((d, i) => (
                              <span key={i} className="badge badge-earth" style={{ fontSize: '11px' }}>
                                📄 {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '16px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          📅 Deadline: <strong>{new Date(prog.deadline).toLocaleDateString()}</strong>
                        </span>

                        {user?.role === 'farmer' && (
                          isAlreadyApplied ? (
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green-600)' }}>✓ Application Submitted</span>
                          ) : prog.status === 'open' ? (
                            <button
                              onClick={() => setSelectedProgram(prog)}
                              className="btn btn--primary btn-sm"
                            >
                              Apply now
                            </button>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Closed</span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ── Tab 2: My Applications (Farmer) ─────────────────── */}
        {activeTab === 'my-applications' && (
          myApps.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">📋</div>
              <h3 className="empty-state__title">No applications submitted</h3>
              <p className="empty-state__desc">Browse available government programs and submit an application.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myApps.map((app) => (
                <div key={app.id} className="card-elevated">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 className="text-title" style={{ margin: 0 }}>
                      {app.programTitle || 'Program Application'}
                    </h3>
                    {statusBadge(app.status)}
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                    Submitted on: <strong>{new Date(app.submittedAt).toLocaleDateString()}</strong> · Farm Size: <strong>{app.farmSizeHectares} ha</strong> · Crops: <strong>{app.cropsGrown.join(', ')}</strong>
                  </div>

                  {app.submittedDocs?.length > 0 && (
                    <div style={{ fontSize: '12px', color: 'var(--color-text-light)', marginBottom: '8px' }}>
                      Attached documents: {app.submittedDocs.map((d, i) => <span key={i} className="badge badge-earth" style={{ fontSize: '11px', marginRight: '6px' }}>{d}</span>)}
                    </div>
                  )}

                  {app.remarks && (
                    <div style={{ marginTop: '12px', padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-accent-light)', borderLeft: '3px solid var(--color-accent)', fontSize: '13px', color: 'var(--color-text)' }}>
                      💬 <strong>LGU Office Remarks:</strong> {app.remarks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Application Modal ───────────────────────────────── */}
        {selectedProgram && (
          <div className="modal-backdrop" onClick={() => setSelectedProgram(null)}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <p className="modal-header__sub">Program application</p>
                  <h2 className="modal-header__title">{selectedProgram.title}</h2>
                </div>
                <button className="modal-close" onClick={() => setSelectedProgram(null)}>✕</button>
              </div>

              <form onSubmit={handleApply}>
                <div className="form-field">
                  <label className="form-label">Farm Size (Hectares)</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={farmSize}
                    onChange={(e) => setFarmSize(Number(e.target.value))}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Crops Currently Grown (comma separated)</label>
                  <input
                    className="form-input"
                    type="text"
                    required
                    value={cropsGrown}
                    onChange={(e) => setCropsGrown(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Submitted / Attached Documents</label>
                  <textarea
                    className="form-input form-textarea"
                    rows={2}
                    required
                    value={submittedDocs}
                    onChange={(e) => setSubmittedDocs(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn--primary btn--full"
                >
                  {submitting ? 'Submitting…' : 'Submit program application'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
