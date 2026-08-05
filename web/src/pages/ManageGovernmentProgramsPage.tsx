import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { programApi } from '../api/program';
import type { GovernmentProgram, ProgramApplication, ApplicationStatus } from '../types/program';

export const ManageGovernmentProgramsPage: React.FC = () => {
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

  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  useEffect(() => { fetchPrograms(); }, []);

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
    setMsg(null);
    try {
      await programApi.createProgram({
        title,
        description,
        agency,
        eligibilityCriteria: criteria.split(',').map((s) => s.trim()).filter(Boolean),
        requiredDocuments: reqDocs.split(',').map((s) => s.trim()).filter(Boolean),
        deadline,
      });
      setMsg({ type: 'success', text: `Program "${title}" created successfully!` });
      setShowCreateForm(false);
      setTitle(''); setDescription('');
      fetchPrograms();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to create program.' });
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
      setMsg({ type: 'success', text: `Application for ${reviewApp.farmerName} updated to ${reviewStatus}.` });
      setReviewApp(null);
      fetchApplications(selectedProgId);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update review status.' });
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Manage Government Programs
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>
              LGU & Agriculture Office Review Queue & Program Management.
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm((v) => !v)}
            style={{ padding: '12px 20px', borderRadius: '12px', backgroundColor: '#7c3aed', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}
          >
            {showCreateForm ? '✕ Close Form' : '+ Post New Program'}
          </button>
        </div>

        {msg && (
          <div style={{ padding: '14px', borderRadius: '12px', marginBottom: '24px', backgroundColor: msg.type === 'success' ? '#f0fdf4' : '#fef2f2', color: msg.type === 'success' ? '#166534' : '#991b1b', fontWeight: 600 }}>
            {msg.text}
          </div>
        )}

        {/* Post Program Form */}
        {showCreateForm && (
          <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px', marginBottom: '32px', borderTop: '4px solid #7c3aed' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Create New Support Program</h2>
            <form onSubmit={handleCreateProgram}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Program Title *</label>
                  <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Free Rice Seed Distribution 2026" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Managing Agency *</label>
                  <input type="text" required value={agency} onChange={(e) => setAgency(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Description *</label>
                <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Program objectives, benefits, and coverage..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Eligibility Criteria (comma-separated)</label>
                  <input type="text" value={criteria} onChange={(e) => setCriteria(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Required Documents</label>
                  <input type="text" value={reqDocs} onChange={(e) => setReqDocs(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Application Deadline</label>
                  <input type="date" required value={deadline} onChange={(e) => setDeadline(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <button type="submit" disabled={creating} style={{ padding: '12px 24px', borderRadius: '10px', backgroundColor: '#7c3aed', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
                {creating ? 'Posting...' : 'Post Program Listing'}
              </button>
            </form>
          </div>
        )}

        {/* Program Selector & Application Queue */}
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Applicant Review Queue</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Select Program:</label>
              <select value={selectedProgId} onChange={(e) => setSelectedProgId(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '14px' }}>
                {programs.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div>Loading review queue...</div>
          ) : applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>No applications submitted for this program yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '10px' }}>Farmer Name</th>
                    <th style={{ padding: '10px' }}>Region</th>
                    <th style={{ padding: '10px' }}>Farm Size</th>
                    <th style={{ padding: '10px' }}>Crops</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px' }}>Submitted</th>
                    <th style={{ padding: '10px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 700 }}>{app.farmerName}</td>
                      <td style={{ padding: '12px 10px' }}>{app.farmerRegion || '—'}</td>
                      <td style={{ padding: '12px 10px' }}>{app.farmSizeHectares} ha</td>
                      <td style={{ padding: '12px 10px' }}>{app.cropsGrown.join(', ')}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, backgroundColor: app.status === 'approved' ? '#dcfce7' : app.status === 'rejected' ? '#fee2e2' : '#dbeafe', color: app.status === 'approved' ? '#166534' : app.status === 'rejected' ? '#991b1b' : '#1e40af' }}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', fontSize: '12px', color: '#64748b' }}>{new Date(app.submittedAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <button onClick={() => { setReviewApp(app); setReviewStatus(app.status); setRemarks(app.remarks || ''); }} style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Review Application Modal */}
        {reviewApp && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <div className="glass-panel" style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '32px', maxWidth: '500px', width: '100%' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                Review Application: {reviewApp.farmerName}
              </h2>

              <div style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
                📍 Region: <strong>{reviewApp.farmerRegion || 'N/A'}</strong><br />
                🌾 Crops: <strong>{reviewApp.cropsGrown.join(', ')}</strong> ({reviewApp.farmSizeHectares} ha)<br />
                📄 Docs: <strong>{reviewApp.submittedDocs.join(', ')}</strong>
              </div>

              <form onSubmit={handleReviewSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Update Status</label>
                  <select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value as ApplicationStatus)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option value="under_review">⏳ Under Review</option>
                    <option value="approved">✓ Approved</option>
                    <option value="rejected">✕ Rejected</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Remarks / Feedback for Farmer</label>
                  <textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Provide reasoning or pickup instructions..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setReviewApp(null)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={reviewing} style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#7c3aed', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                    {reviewing ? 'Saving...' : 'Save Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
