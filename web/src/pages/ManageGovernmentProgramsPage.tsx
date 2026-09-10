import React, { useState, useEffect } from 'react';
import { programApi } from '../api/program';
import { getImageUrl } from '../api';
import { useToast } from '../contexts/ToastContext';
import type { GovernmentProgram, ProgramApplication, ApplicationStatus } from '../types/program';

export const ManageGovernmentProgramsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [programs, setPrograms] = useState<GovernmentProgram[]>([]);
  const [selectedProgId, setSelectedProgId] = useState<string>('');
  const [applications, setApplications] = useState<ProgramApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // New Program form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [agency, setAgency] = useState('Municipal Agriculture Office');
  const [criteria, setCriteria] = useState('Registered in RSBSA, Smallholder farmer (< 3 hectares)');
  const [reqDocs, setReqDocs] = useState('RSBSA Card, Government ID');
  const [deadline, setDeadline] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Review modal state
  const [reviewApp, setReviewApp] = useState<ProgramApplication | null>(null);
  const [reviewStatus, setReviewStatus] = useState<ApplicationStatus>('approved');
  const [remarks, setRemarks] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const data = await programApi.listPrograms();
      setPrograms(data);
      if (data.length > 0 && !selectedProgId) {
        setSelectedProgId(data[0].id);
      }
    } catch (e) {
      console.error('Failed to fetch programs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchApplications = async (progId: string) => {
    if (!progId) return;
    try {
      const apps = await programApi.listProgramApplications(progId);
      setApplications(apps);
    } catch (e) {
      console.error('Failed to fetch applications:', e);
    }
  };

  useEffect(() => {
    if (selectedProgId) fetchApplications(selectedProgId);
  }, [selectedProgId]);

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await programApi.createProgram({
        title,
        description,
        agency,
        eligibilityCriteria: criteria.split(',').map((s) => s.trim()).filter(Boolean),
        requiredDocuments: reqDocs.split(',').map((s) => s.trim()).filter(Boolean),
        deadline,
      });
      success('Program Published!', `"${title}" is now open for farmer applications.`);
      setShowCreateForm(false);
      setTitle('');
      setDescription('');
      fetchPrograms();
    } catch (err: any) {
      toastError('Failed to Create Program', err.response?.data?.error || 'Could not publish program.');
    } finally {
      setCreating(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewApp) return;
    setReviewing(true);
    try {
      await programApi.reviewApplication(reviewApp.id, {
        status: reviewStatus,
        remarks,
      });
      success('Application Updated!', `Marked application for ${reviewApp.farmerName} as ${reviewStatus}.`);
      setReviewApp(null);
      fetchApplications(selectedProgId);
    } catch (err: any) {
      toastError('Update Failed', err.response?.data?.error || 'Failed to update review status.');
    } finally {
      setReviewing(false);
    }
  };

  const pendingAppsCount = applications.filter((a) => a.status === 'submitted' || a.status === 'under_review').length;
  const approvedAppsCount = applications.filter((a) => a.status === 'approved').length;

  return (
    <div className="app-container" style={{ paddingBottom: '40px' }}>
      {/* ─── Header Banner ─── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '22px',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div>
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
              🏛️ LGU Subsidy Administration
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27', margin: 0, lineHeight: 1.2 }}>
            Manage Government Programs
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: '4px 0 0 0' }}>
            Create agricultural assistance initiatives and evaluate farmer RSBSA applications.
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm((v) => !v)}
          className={showCreateForm ? 'btn btn-secondary' : 'btn btn-primary'}
          style={{ padding: '10px 18px', borderRadius: '12px', fontWeight: 700, fontSize: '14px' }}
        >
          {showCreateForm ? '✕ Close Form' : '+ Post New Program'}
        </button>
      </div>

      {/* ─── Top KPI Overview ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '22px',
        }}
      >
        <div
          className="card"
          style={{
            padding: '14px 18px',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            borderLeft: '4px solid #176B3A',
            background: '#FFFFFF',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Active Programs
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0E4A27', marginTop: '2px' }}>
            {programs.length}
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '14px 18px',
            borderRadius: '14px',
            border: '1px solid #FDE68A',
            borderLeft: '4px solid #D97706',
            background: '#FFFBEB',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            ⏳ Pending Review
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#B45309', marginTop: '2px' }}>
            {pendingAppsCount}
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '14px 18px',
            borderRadius: '14px',
            border: '1px solid #BBF7D0',
            borderLeft: '4px solid #16A34A',
            background: '#F0FDF4',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            ✓ Approved Beneficiaries
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#15803D', marginTop: '2px' }}>
            {approvedAppsCount}
          </div>
        </div>
      </div>

      {/* ─── Post Program Form Card ─── */}
      {showCreateForm && (
        <div
          className="card"
          style={{
            padding: '24px 28px',
            borderRadius: '20px',
            marginBottom: '28px',
            border: '1.5px solid #BBF7D0',
            background: '#FFFFFF',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0E4A27', marginBottom: '16px' }}>
            Create New Support Program
          </h2>

          <form onSubmit={handleCreateProgram}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Program Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Free Certified Rice Seeds 2026"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Managing Agency *
                </label>
                <input
                  type="text"
                  required
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Program objectives, assistance details, and coverage..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '22px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Eligibility Criteria
                </label>
                <input
                  type="text"
                  value={criteria}
                  onChange={(e) => setCriteria(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Required Documents
                </label>
                <input
                  type="text"
                  value={reqDocs}
                  onChange={(e) => setReqDocs(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Application Deadline
                </label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="btn btn-primary"
              style={{ padding: '11px 24px', borderRadius: '10px', fontWeight: 800, fontSize: '14px' }}
            >
              {creating ? 'Publishing...' : '✓ Publish Program Listing'}
            </button>
          </form>
        </div>
      )}

      {/* ─── Program Selector & Review Queue Card ─── */}
      <div
        className="card"
        style={{
          padding: '24px 28px',
          borderRadius: '20px',
          border: '1.5px solid #E2E8F0',
          background: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Applicant Evaluation Queue
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
              Inspect farmer RSBSA documents and approve or reject submissions.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Select Program:</label>
            <select
              value={selectedProgId}
              onChange={(e) => setSelectedProgId(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748B', fontSize: '14px' }}>
            Loading evaluation queue...
          </div>
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B', fontSize: '14px' }}>
            No applications submitted for this program yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '10px' }}>Farmer Name</th>
                  <th style={{ padding: '10px' }}>RSBSA ID</th>
                  <th style={{ padding: '10px' }}>Region</th>
                  <th style={{ padding: '10px' }}>Farm Size</th>
                  <th style={{ padding: '10px' }}>Crops</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Submitted</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 700, color: '#0F172A' }}>{app.farmerName}</td>
                    <td style={{ padding: '12px 10px' }}>
                      {app.rsbsaNumber ? (
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, background: '#F1F5F9', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', color: '#166534' }}>
                          {app.rsbsaNumber}
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 10px', color: '#475569' }}>{app.farmerRegion || '—'}</td>
                    <td style={{ padding: '12px 10px', color: '#475569' }}>{app.farmSizeHectares} ha</td>
                    <td style={{ padding: '12px 10px', color: '#475569' }}>{app.cropsGrown.join(', ')}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: app.status === 'approved' ? '#DCFCE7' : app.status === 'rejected' ? '#FEE2E2' : '#DBEAFE',
                          color: app.status === 'approved' ? '#166534' : app.status === 'rejected' ? '#991B1B' : '#1E40AF',
                        }}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', fontSize: '12px', color: '#64748B' }}>
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setReviewApp(app);
                          setReviewStatus(app.status);
                          setRemarks(app.remarks || '');
                        }}
                        className="btn btn-primary"
                        style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}
                      >
                        Evaluate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Review Application Modal ─── */}
      {reviewApp && (
        <div className="modal-backdrop" onClick={() => setReviewApp(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', borderRadius: '24px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0E4A27', margin: 0 }}>
                Evaluate Application
              </h2>
              <button
                type="button"
                onClick={() => setReviewApp(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px', fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
              <div>👤 Farmer: <strong>{reviewApp.farmerName}</strong></div>
              {reviewApp.farmerPhone && <div>📞 Phone: <strong>{reviewApp.farmerPhone}</strong></div>}
              <div>🪪 RSBSA ID: <strong style={{ fontFamily: 'monospace', color: '#166534' }}>{reviewApp.rsbsaNumber || 'Not specified'}</strong></div>
              <div>📍 Region: <strong>{reviewApp.farmerRegion || 'N/A'}</strong></div>
              <div>🌾 Crops: <strong>{reviewApp.cropsGrown.join(', ')}</strong> ({reviewApp.farmSizeHectares} ha)</div>
            </div>

            {/* Attached RSBSA Document Preview */}
            {(() => {
              const imgDoc = reviewApp.submittedDocs?.find((d) =>
                d.startsWith('/uploads') || d.startsWith('http') || d.startsWith('data:image') || /\.(png|jpe?g|webp)$/i.test(d)
              );
              if (!imgDoc) return null;
              const fullUrl = getImageUrl(imgDoc);
              return (
                <div style={{ marginBottom: '18px', background: '#F0FDF4', padding: '12px', borderRadius: '12px', border: '1.5px solid #86EFAC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#166534' }}>
                      📸 Attached RSBSA Card / Document:
                    </span>
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '11px', color: '#15803D', fontWeight: 700, textDecoration: 'none' }}
                    >
                      Open Full ↗
                    </a>
                  </div>
                  <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={fullUrl}
                      alt="Attached RSBSA Document"
                      style={{
                        width: '100%',
                        maxHeight: '190px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        cursor: 'pointer',
                      }}
                    />
                  </a>
                </div>
              );
            })()}

            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Decision Status</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value as ApplicationStatus)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', fontWeight: 600 }}
                >
                  <option value="under_review">⏳ Under Review</option>
                  <option value="approved">✓ Approved</option>
                  <option value="rejected">✕ Rejected</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Remarks / Feedback for Farmer</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Provide instructions, pickup schedule, or reason..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setReviewApp(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 700 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewing}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 800 }}
                >
                  {reviewing ? 'Saving...' : 'Save Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
