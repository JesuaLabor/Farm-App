import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/admin';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { User } from '../types/auth';

export const LGUAccountApprovalsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError, warning } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listUsers({
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setUsers(data || []);
    } catch (e: any) {
      console.error('Failed to list regional users:', e);
      const errMsg = e.response?.data?.error || 'Failed to fetch user accounts.';
      // Don't show blocking message if it's just an empty region notice
      if (!errMsg.includes('no region assigned')) {
        toastError('Failed to Load Accounts', errMsg);
      }
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, toastError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleApprove = async (userId: string, name: string) => {
    setActionLoading(userId);
    try {
      await adminApi.approveUser(userId);
      success('Account Approved!', `Verified ${name} for regional access.`);
      await fetchUsers();
    } catch (e: any) {
      toastError('Approval Failed', e.response?.data?.error || 'Failed to approve user.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string, name: string) => {
    setActionLoading(userId);
    try {
      await adminApi.rejectUser(userId);
      warning('Account Rejected', `Application for ${name} has been rejected.`);
      await fetchUsers();
    } catch (e: any) {
      toastError('Rejection Failed', e.response?.data?.error || 'Failed to reject user.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    return (
      fullName.includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.municipality && u.municipality.toLowerCase().includes(term)) ||
      (u.phone && u.phone.includes(term))
    );
  });

  // Calculate glanceable statistics
  const pendingCount = users.filter((u) => u.status === 'pending').length;
  const approvedCount = users.filter((u) => u.status === 'approved').length;
  const rejectedCount = users.filter((u) => u.status === 'rejected').length;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'farmer':
        return '🧑‍🌾';
      case 'supplier':
        return '🚜';
      case 'buyer':
        return '📦';
      case 'expert':
        return '🎓';
      default:
        return '👤';
    }
  };

  return (
    <div className="app-container" style={{ paddingBottom: '40px' }}>
      {/* ─── Header Banner ─── */}
      <div style={{ marginBottom: '22px' }}>
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
            🏛️ LGU Agricultural Jurisdiction
          </span>
          <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
            {user?.municipality || 'Malaybalay City'}, {user?.province || 'Bukidnon'}
          </span>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27', margin: '4px 0', lineHeight: 1.2 }}>
          Regional Account Approvals
        </h1>
        <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
          Verify and approve local Farmers, Wholesale Buyers, Agri-Suppliers, and Agronomic Experts in your jurisdiction.
        </p>
      </div>

      {/* ─── KPI Metrics Bar ─── */}
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
            Total Applications
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0E4A27', marginTop: '2px' }}>
            {users.length}
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
            ⏳ Pending Action
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#B45309', marginTop: '2px' }}>
            {pendingCount}
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
            ✓ Approved Accounts
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#15803D', marginTop: '2px' }}>
            {approvedCount}
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '14px 18px',
            borderRadius: '14px',
            border: '1px solid #FECACA',
            borderLeft: '4px solid #DC2626',
            background: '#FEF2F2',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            ✕ Rejected
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#B91C1C', marginTop: '2px' }}>
            {rejectedCount}
          </div>
        </div>
      </div>

      {/* ─── Filter & Search Bar ─── */}
      <div
        style={{
          background: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: '16px',
          border: '1.5px solid #E2E8F0',
          marginBottom: '24px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
          <div style={{ minWidth: '180px' }}>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="all">All Roles</option>
              <option value="farmer">🧑‍🌾 Farmers</option>
              <option value="supplier">🚜 Agri-Suppliers</option>
              <option value="buyer">📦 Wholesale Buyers</option>
              <option value="expert">🎓 Agronomists</option>
            </select>
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="pending">⏳ Pending Approval ({pendingCount})</option>
              <option value="approved">✅ Approved ({approvedCount})</option>
              <option value="rejected">❌ Rejected ({rejectedCount})</option>
              <option value="all">All Statuses</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Search by name, email, or municipality..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <button
          onClick={fetchUsers}
          className="btn btn-secondary"
          style={{ padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700 }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ─── Applicant Cards Grid ─── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#64748B', fontSize: '14px' }}>
          Loading user verification queue...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 20px',
            background: '#FFFFFF',
            borderRadius: '18px',
            border: '1.5px solid #E2E8F0',
          }}
        >
          <div style={{ fontSize: '38px', marginBottom: '8px' }}>🛡️</div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
            No Matching Accounts Found
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            {statusFilter === 'pending'
              ? 'Great! There are no pending account applications requiring review in your jurisdiction.'
              : 'No accounts match the current filter selection.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredUsers.map((u) => {
            const isApproved = u.status === 'approved';
            const isRejected = u.status === 'rejected';
            const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unnamed Applicant';
            const initials = fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

            return (
              <div
                key={u.id}
                className="card"
                style={{
                  padding: '18px',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  borderLeft: `4px solid ${isApproved ? '#16A34A' : isRejected ? '#DC2626' : '#D97706'}`,
                  background: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div>
                  {/* Top row: Avatar + Name + Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: '#EAF6EE',
                          color: '#166534',
                          fontWeight: 800,
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #BBF7D0',
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
                          {fullName}
                        </h3>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          {u.email}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        backgroundColor: isApproved ? '#DCFCE7' : isRejected ? '#FEE2E2' : '#FEF3C7',
                        color: isApproved ? '#15803D' : isRejected ? '#B91C1C' : '#B45309',
                      }}
                    >
                      {u.status}
                    </span>
                  </div>

                  {/* Metadata Tags */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: '#F1F5F9',
                        color: '#334155',
                      }}
                    >
                      {getRoleIcon(u.role)} {u.role.replace(/_/g, ' ').toUpperCase()}
                    </span>

                    {u.municipality && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: '#F8FAFC',
                          color: '#475569',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        📍 {u.municipality}
                      </span>
                    )}

                    {u.phone && (
                      <a
                        href={`tel:${u.phone}`}
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: '#F8FAFC',
                          color: '#166534',
                          border: '1px solid #BBF7D0',
                          textDecoration: 'none',
                        }}
                      >
                        📞 {u.phone}
                      </a>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px', marginTop: '8px', display: 'flex', gap: '8px' }}>
                  {!isApproved && (
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '8px 12px', fontSize: '13px', borderRadius: '8px', fontWeight: 700 }}
                      disabled={actionLoading === u.id}
                      onClick={() => handleApprove(u.id, fullName)}
                    >
                      {actionLoading === u.id ? 'Approving…' : '✓ Approve'}
                    </button>
                  )}

                  {!isRejected && (
                    <button
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '8px 12px', fontSize: '13px', borderRadius: '8px', fontWeight: 700, color: '#DC2626', borderColor: '#FECACA' }}
                      disabled={actionLoading === u.id}
                      onClick={() => handleReject(u.id, fullName)}
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
    </div>
  );
};
