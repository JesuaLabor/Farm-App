import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { adminApi } from '../api/admin';
import type { User } from '../types/auth';
import { getRegions, getProvinces, getMunicipalities } from '../data/philippineLocations';

export const SuperAdminApprovalsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [roleFilter, setRoleFilter] = useState('lgu_staff');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [regionFilter, setRegionFilter] = useState('All Regions');
  const [provinceFilter, setProvinceFilter] = useState('All Provinces');
  const [municipalityFilter, setMunicipalityFilter] = useState('All Municipalities');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const regions = ['All Regions', ...getRegions()];
  const provinces = regionFilter !== 'All Regions'
    ? ['All Provinces', ...getProvinces(regionFilter)]
    : ['All Provinces'];
  const municipalities = (regionFilter !== 'All Regions' && provinceFilter !== 'All Provinces')
    ? ['All Municipalities', ...getMunicipalities(regionFilter, provinceFilter)]
    : ['All Municipalities'];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listUsers({
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        region: regionFilter !== 'All Regions' ? regionFilter : undefined,
        province: provinceFilter !== 'All Provinces' ? provinceFilter : undefined,
        municipality: municipalityFilter !== 'All Municipalities' ? municipalityFilter : undefined,
      });
      setUsers(data);
    } catch (e: any) {
      console.error('Failed to list users:', e);
      setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to fetch users' });
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, regionFilter, provinceFilter, municipalityFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    setMessage(null);
    try {
      await adminApi.approveUser(userId);
      setMessage({ type: 'success', text: 'Account approved successfully.' });
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
      setMessage({ type: 'success', text: 'Account rejected successfully.' });
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
        {/* Page Banner */}
        <div className="page-header-banner">
          <div>
            <span className="page-header-label">System Administration</span>
            <h1 className="page-header-title">Super Admin — LGU Staff Account Approvals</h1>
            <p className="page-header-sub">
              Review and approve LGU Staff accounts across all regions. Approved LGU staff can manage local farmers, buyers, suppliers, and experts.
            </p>
          </div>
        </div>

        {/* Action Alert Banner */}
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
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label className="filter-label">Target Role</label>
            <select className="form-input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="lgu_staff">🏛️ LGU Staff Only</option>
              <option value="all">All Roles (System-Wide)</option>
              <option value="farmer">Farmer</option>
              <option value="buyer">Buyer</option>
              <option value="supplier">Supplier</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '180px' }}>
            <label className="filter-label">Approval Status</label>
            <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="pending">⏳ Pending Approval</option>
              <option value="approved">✅ Approved</option>
              <option value="rejected">❌ Rejected</option>
              <option value="all">All Statuses</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '180px' }}>
            <label className="filter-label">Region</label>
            <select
              className="form-input"
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value);
                setProvinceFilter('All Provinces');
                setMunicipalityFilter('All Municipalities');
              }}
            >
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '180px' }}>
            <label className="filter-label">Province</label>
            <select
              className="form-input"
              value={provinceFilter}
              disabled={regionFilter === 'All Regions'}
              onChange={(e) => {
                setProvinceFilter(e.target.value);
                setMunicipalityFilter('All Municipalities');
              }}
            >
              {provinces.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '180px' }}>
            <label className="filter-label">Municipality / City</label>
            <select
              className="form-input"
              value={municipalityFilter}
              disabled={provinceFilter === 'All Provinces'}
              onChange={(e) => setMunicipalityFilter(e.target.value)}
            >
              {municipalities.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <button className="btn btn--primary" onClick={fetchUsers}>
            Refresh
          </button>
        </div>

        {/* User Cards / Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--color-text-muted)' }}>
            Fetching account requests…
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📋</div>
            <h3 className="empty-state__title">No user account requests found</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
              There are no accounts matching the selected role, status, or region filters.
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
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

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      <span className="badge badge-green" style={{ textTransform: 'capitalize' }}>
                        {u.role.replace(/_/g, ' ')}
                      </span>
                      {u.region && (
                        <span className="badge" style={{ backgroundColor: 'var(--gray-100)', color: 'var(--color-text)', fontSize: '11px' }}>
                          🗺️ {u.region}
                        </span>
                      )}
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
