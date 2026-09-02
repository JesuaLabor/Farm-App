import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { adminApi } from '../api/admin';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types/auth';

export const LGUAccountApprovalsPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listUsers({
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setUsers(data);
    } catch (e: any) {
      console.error('Failed to list regional users:', e);
      setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to fetch user accounts' });
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    setMessage(null);
    try {
      await adminApi.approveUser(userId);
      setMessage({ type: 'success', text: 'User approved successfully.' });
      await fetchUsers();
    } catch (e: any) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to approve user.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    setActionLoading(userId);
    setMessage(null);
    try {
      await adminApi.rejectUser(userId);
      setMessage({ type: 'success', text: 'User rejected successfully.' });
      await fetchUsers();
    } catch (e: any) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to reject user.' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="page-root">
      <Navbar />

      <main className="page-main">
        {/* Header Banner */}
        <div className="page-header-banner">
          <div>
            <span className="page-header-label">🏛️ LGU Agricultural Office</span>
            <h1 className="page-header-title">Regional Account Approvals &amp; Management</h1>
            <p className="page-header-sub">
              Review and manage account applications for <strong>{user?.municipality || user?.region || 'Your LGU Region'}</strong>{user?.barangay ? <>, Brgy. <strong>{user.barangay}</strong></> : null}. As LGU Staff, you approve or reject local Farmers, Buyers, Suppliers, and Agronomic Experts.
            </p>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            style={{
              padding: '14px 20px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '24px',
              backgroundColor: message.type === 'success' ? 'var(--green-50, #f0fdf4)' : '#fef2f2',
              color: message.type === 'success' ? 'var(--green-700, #15803d)' : '#991b1b',
              border: `1.5px solid ${message.type === 'success' ? 'var(--green-200, #bbf7d0)' : '#fecaca'}`,
              fontWeight: 600,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'inherit' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="filter-bar" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '28px' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label className="filter-label">Filter by Role</label>
            <select className="form-input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Regional Roles</option>
              <option value="farmer">🧑‍🌾 Farmers</option>
              <option value="buyer">📦 Buyers</option>
              <option value="supplier">🚜 Agri-Suppliers</option>
              <option value="expert">🎓 Agronomic Experts</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <label className="filter-label">Status Filter</label>
            <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="pending">⏳ Pending Approval</option>
              <option value="approved">✅ Approved</option>
              <option value="rejected">❌ Rejected</option>
              <option value="all">All Statuses</option>
            </select>
          </div>

          <button className="btn btn--primary" onClick={fetchUsers}>
            Refresh List
          </button>
        </div>

        {/* User Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--color-text-muted)' }}>
            Loading regional user applications…
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">👨‍🌾</div>
            <h3 className="empty-state__title">No matching accounts found</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
              There are currently no registration applications for {user?.region || 'your region'} with the selected filter.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            {users.map((u) => {
              const isApproved = u.status === 'approved';
              const isRejected = u.status === 'rejected';

              return (
                <div
                  key={u.id}
                  className="card-elevated"
                  style={{
                    borderLeft: `5px solid ${
                      isApproved ? 'var(--green-500, #22c55e)' : isRejected ? '#ef4444' : '#f59e0b'
                    }`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '2px' }}>
                          {u.firstName} {u.lastName}
                        </h3>
                        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                          {u.email}
                        </div>
                      </div>

                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          backgroundColor: isApproved ? '#dcfce7' : isRejected ? '#fee2e2' : '#fef3c7',
                          color: isApproved ? '#15803d' : isRejected ? '#b91c1c' : '#b45309',
                        }}
                      >
                        {u.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                      <span className="badge badge-green" style={{ textTransform: 'capitalize' }}>
                        {u.role.replace(/_/g, ' ')}
                      </span>
                      {u.province && (
                        <span className="badge" style={{ backgroundColor: 'var(--gray-100)', color: 'var(--color-text)', fontSize: '11px' }}>
                          🏛️ {u.province}
                        </span>
                      )}
                      {u.municipality && (
                        <span className="badge" style={{ backgroundColor: 'var(--gray-100)', color: 'var(--color-text)', fontSize: '11px' }}>
                          🏙️ {u.municipality}
                        </span>
                      )}
                      {u.barangay && (
                        <span className="badge" style={{ backgroundColor: 'var(--gray-100)', color: 'var(--color-text)', fontSize: '11px' }}>
                          📍 Brgy. {u.barangay}
                        </span>
                      )}
                      {u.phone && (
                        <span className="badge" style={{ backgroundColor: 'var(--gray-100)', color: 'var(--color-text)', fontSize: '11px' }}>
                          📞 {u.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '14px', marginTop: '12px', display: 'flex', gap: '10px' }}>
                    {!isApproved && (
                      <button
                        className="btn btn--primary btn-sm"
                        style={{ flex: 1, backgroundColor: 'var(--green-600)' }}
                        disabled={actionLoading === u.id}
                        onClick={() => handleApprove(u.id)}
                      >
                        {actionLoading === u.id ? 'Approving…' : '✓ Approve'}
                      </button>
                    )}

                    {!isRejected && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, color: '#dc2626', borderColor: '#fca5a5' }}
                        disabled={actionLoading === u.id}
                        onClick={() => handleReject(u.id)}
                      >
                        {actionLoading === u.id ? 'Rejecting…' : '✕ Reject'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
