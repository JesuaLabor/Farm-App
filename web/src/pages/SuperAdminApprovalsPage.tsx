import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { adminApi } from '../api/admin';
import { useToast } from '../contexts/ToastContext';
import type { User } from '../types/auth';
import { getRegions, getProvinces, getMunicipalities } from '../data/philippineLocations';

export const SuperAdminApprovalsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('All Regions');
  const [provinceFilter, setProvinceFilter] = useState('All Provinces');
  const [municipalityFilter, setMunicipalityFilter] = useState('All Municipalities');
  const { success: toastSuccess, error: toastError } = useToast();

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
      toastError('Fetch Failed', e.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, regionFilter, provinceFilter, municipalityFilter, toastError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      await adminApi.approveUser(userId);
      toastSuccess('Account Approved', 'The account has been approved successfully.');
      await fetchUsers();
    } catch (e: any) {
      toastError('Approval Failed', e.response?.data?.error || 'Failed to approve user.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    setActionLoading(userId);
    try {
      await adminApi.rejectUser(userId);
      toastSuccess('Account Rejected', 'The account registration has been rejected.');
      await fetchUsers();
    } catch (e: any) {
      toastError('Rejection Failed', e.response?.data?.error || 'Failed to reject user.');
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

        {/* Filter Bar */}
        <div className="filter-bar" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '28px' }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label className="filter-label">Target Role</label>
            <select className="form-input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Roles (System-Wide)</option>
              <option value="farmer">🧑‍🌾 Farmer</option>
              <option value="buyer">🛒 Buyer</option>
              <option value="supplier">📦 Supplier</option>
              <option value="expert">🌿 Expert / Agronomist</option>
              <option value="lgu_staff">🏛️ LGU Staff</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '180px' }}>
            <label className="filter-label">Approval Status</label>
            <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="pending">⏳ Pending Approval</option>
              <option value="approved">✅ Approved</option>
              <option value="rejected">❌ Rejected</option>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {users.map((u) => {
              const isApproved = u.status === 'approved';
              const isRejected = u.status === 'rejected';

              const statusColor = isApproved ? '#1E7E45' : isRejected ? '#BA3C3C' : '#B87A00';
              const statusBg = isApproved ? '#EAF6EE' : isRejected ? '#FDF2F2' : '#FEF3D6';
              const statusBorder = isApproved ? 'rgba(30,126,69,0.25)' : isRejected ? 'rgba(186,60,60,0.25)' : 'rgba(184,122,0,0.25)';
              const statusLabel = isApproved ? '✓ Approved' : isRejected ? '✕ Rejected' : '⏳ Pending';

              const roleColors: Record<string, { bg: string; text: string }> = {
                farmer: { bg: '#E8F5E9', text: '#1B5E20' },
                buyer: { bg: '#E3F2FD', text: '#1565C0' },
                supplier: { bg: '#FFF3E0', text: '#E65100' },
                expert: { bg: '#F3E5F5', text: '#6A1B9A' },
                lgu_staff: { bg: '#E0F2F1', text: '#00695C' },
                super_admin: { bg: '#FCE4EC', text: '#880E4F' },
              };
              const roleColor = roleColors[u.role] || { bg: '#F5F5F5', text: '#333' };
              const roleLabel = u.role === 'lgu_staff' ? 'LGU Staff' : u.role === 'super_admin' ? 'Super Admin' : u.role.charAt(0).toUpperCase() + u.role.slice(1);
              const initials = `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();

              const locationParts = [u.municipality, u.province, u.region].filter(Boolean);

              return (
                <div
                  key={u.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1.5px solid #E4E2DC',
                    boxShadow: '0 2px 8px rgba(26,28,26,0.06)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(23,107,58,0.12)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(26,28,26,0.06)';
                  }}
                >
                  {/* ── Top accent strip colored by status ── */}
                  <div style={{ height: '4px', background: statusColor }} />

                  {/* ── Card Body ── */}
                  <div style={{ padding: '20px 20px 16px', flex: 1 }}>
                    {/* Header row: avatar + name/email + status pill */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                      {/* Avatar */}
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: roleColor.bg, color: roleColor.text,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '17px', flexShrink: 0,
                        border: `2px solid ${roleColor.text}22`,
                      }}>
                        {initials || '?'}
                      </div>

                      {/* Name + Email */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '16px', fontWeight: 800, color: '#0E4A27',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {u.firstName} {u.lastName}
                        </div>
                        <div style={{
                          fontSize: '12px', color: '#6F716C', fontFamily: 'monospace',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          marginTop: '2px',
                        }}>
                          {u.email}
                        </div>
                      </div>

                      {/* Status Pill */}
                      <span style={{
                        padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
                        fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: '0.04em',
                        background: statusBg, color: statusColor,
                        border: `1.5px solid ${statusBorder}`,
                        flexShrink: 0,
                      }}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Role badge */}
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                        background: roleColor.bg, color: roleColor.text,
                        border: `1.5px solid ${roleColor.text}33`,
                      }}>
                        {u.role === 'farmer' ? '🧑‍🌾' : u.role === 'buyer' ? '🛒' : u.role === 'supplier' ? '📦' : u.role === 'expert' ? '🌿' : u.role === 'lgu_staff' ? '🏛️' : '🔐'}
                        {roleLabel}
                      </span>
                    </div>

                    {/* Location row */}
                    {locationParts.length > 0 && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '12px', color: '#525450', marginBottom: '4px',
                      }}>
                        <span style={{ color: '#176B3A', fontSize: '13px' }}>📍</span>
                        <span style={{ fontWeight: 600 }}>{locationParts.join(' · ')}</span>
                      </div>
                    )}
                    {u.barangay && (
                      <div style={{ fontSize: '12px', color: '#6F716C', paddingLeft: '19px' }}>
                        Brgy. {u.barangay}
                      </div>
                    )}
                  </div>

                  {/* ── Action Buttons ── */}
                  <div style={{
                    borderTop: '1px solid #F0EFE9',
                    padding: '12px 16px',
                    display: 'flex', gap: '10px',
                    background: '#FAFAF7',
                  }}>
                    {!isApproved && (
                      <button
                        disabled={actionLoading === u.id}
                        onClick={() => handleApprove(u.id)}
                        style={{
                          flex: 1, padding: '10px', border: 'none', borderRadius: '10px',
                          background: '#176B3A', color: '#FFFFFF',
                          fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                          opacity: actionLoading === u.id ? 0.6 : 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={e => { if (!actionLoading) (e.currentTarget as HTMLButtonElement).style.background = '#0E4A27'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#176B3A'; }}
                      >
                        {actionLoading === u.id ? 'Approving…' : '✓ Approve'}
                      </button>
                    )}
                    {!isRejected && (
                      <button
                        disabled={actionLoading === u.id}
                        onClick={() => handleReject(u.id)}
                        style={{
                          flex: isApproved ? 1 : undefined, padding: '10px 16px',
                          border: '1.5px solid #fca5a5', borderRadius: '10px',
                          background: '#FFFFFF', color: '#BA3C3C',
                          fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                          opacity: actionLoading === u.id ? 0.6 : 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => {
                          if (!actionLoading) {
                            (e.currentTarget as HTMLButtonElement).style.background = '#FDF2F2';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = '#BA3C3C';
                          }
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#fca5a5';
                        }}
                      >
                        {actionLoading === u.id ? 'Rejecting…' : '✕ Reject'}
                      </button>
                    )}
                    {isApproved && isRejected && (
                      <span style={{ fontSize: '13px', color: '#6F716C', fontStyle: 'italic' }}>No actions available</span>
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
