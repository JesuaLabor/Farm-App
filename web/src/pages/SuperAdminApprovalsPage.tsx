import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { adminApi } from '../api/admin';
import { useToast } from '../contexts/ToastContext';
import type { User } from '../types/auth';
import { getRegions, getProvinces, getMunicipalities } from '../data/philippineLocations';

const ROLE_FILTER_DEFAULT = 'all';
const STATUS_FILTER_DEFAULT = 'all';
const REGION_DEFAULT = 'All Regions';
const PROVINCE_DEFAULT = 'All Provinces';
const MUNICIPALITY_DEFAULT = 'All Municipalities';

export const SuperAdminApprovalsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [roleFilter, setRoleFilter] = useState(ROLE_FILTER_DEFAULT);
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTER_DEFAULT);
  const [regionFilter, setRegionFilter] = useState(REGION_DEFAULT);
  const [provinceFilter, setProvinceFilter] = useState(PROVINCE_DEFAULT);
  const [municipalityFilter, setMunicipalityFilter] = useState(MUNICIPALITY_DEFAULT);
  const { success: toastSuccess, error: toastError } = useToast();

  const regions = ['All Regions', ...getRegions()];
  const provinces = regionFilter !== REGION_DEFAULT
    ? [PROVINCE_DEFAULT, ...getProvinces(regionFilter)]
    : [PROVINCE_DEFAULT];
  const municipalities = (regionFilter !== REGION_DEFAULT && provinceFilter !== PROVINCE_DEFAULT)
    ? [MUNICIPALITY_DEFAULT, ...getMunicipalities(regionFilter, provinceFilter)]
    : [MUNICIPALITY_DEFAULT];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listUsers({
        role: roleFilter !== ROLE_FILTER_DEFAULT ? roleFilter : undefined,
        status: statusFilter !== STATUS_FILTER_DEFAULT ? statusFilter : undefined,
        region: regionFilter !== REGION_DEFAULT ? regionFilter : undefined,
        province: provinceFilter !== PROVINCE_DEFAULT ? provinceFilter : undefined,
        municipality: municipalityFilter !== MUNICIPALITY_DEFAULT ? municipalityFilter : undefined,
      });
      setUsers(data);
    } catch (e: any) {
      console.error('Failed to list users:', e);
      toastError('Fetch Failed', e.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, regionFilter, provinceFilter, municipalityFilter, toastError]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      await adminApi.approveUser(userId);
      toastSuccess('Account Approved', 'The account has been approved successfully.');
      await fetchUsers();
    } catch (e: any) {
      toastError('Approval Failed', e.response?.data?.error || 'Failed to approve user.');
    } finally { setActionLoading(null); }
  };

  const handleReject = async (userId: string) => {
    setActionLoading(userId);
    try {
      await adminApi.rejectUser(userId);
      toastSuccess('Account Rejected', 'The account registration has been rejected.');
      await fetchUsers();
    } catch (e: any) {
      toastError('Rejection Failed', e.response?.data?.error || 'Failed to reject user.');
    } finally { setActionLoading(null); }
  };

  const handleSuspend = async (userId: string) => {
    setActionLoading(userId);
    try {
      await adminApi.suspendUser(userId);
      toastSuccess('Account Suspended', 'The account has been suspended and login has been blocked.');
      await fetchUsers();
    } catch (e: any) {
      toastError('Suspend Failed', e.response?.data?.error || 'Failed to suspend user.');
    } finally { setActionLoading(null); }
  };

  const handleUnsuspend = async (userId: string) => {
    setActionLoading(userId);
    try {
      await adminApi.unsuspendUser(userId);
      toastSuccess('Account Reinstated', 'The account has been unsuspended and can now log in.');
      await fetchUsers();
    } catch (e: any) {
      toastError('Unsuspend Failed', e.response?.data?.error || 'Failed to unsuspend user.');
    } finally { setActionLoading(null); }
  };

  const handleReset = () => {
    setRoleFilter(ROLE_FILTER_DEFAULT);
    setStatusFilter(STATUS_FILTER_DEFAULT);
    setRegionFilter(REGION_DEFAULT);
    setProvinceFilter(PROVINCE_DEFAULT);
    setMunicipalityFilter(MUNICIPALITY_DEFAULT);
  };

  const pendingCount = users.filter(u => u.status === 'pending').length;

  // Shared select style
  const selectStyle: React.CSSProperties = {
    width: '100%',
    height: '40px',
    padding: '0 12px',
    borderRadius: '10px',
    border: '1.5px solid #D8D6CE',
    background: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1A1C1A',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236F716C' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '32px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: 800,
    color: '#525450',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '6px',
  };

  return (
    <div className="page-root">
      <Navbar />
      <main className="page-main">

        {/* ── Page Header ── */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '20px',
                background: '#F0FDF4',
                color: '#166534',
                border: '1px solid #BBF7D0',
              }}
            >
              🛡️ System Administration
            </span>
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#0E4A27',
              margin: '4px 0',
              lineHeight: 1.2,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            Super Admin — LGU Staff Account Approvals
            {pendingCount > 0 && !loading && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#FEF3D6',
                  color: '#B87A00',
                  border: '1.5px solid rgba(184,122,0,0.3)',
                  borderRadius: '20px',
                  padding: '3px 10px',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  verticalAlign: 'middle',
                }}
              >
                ⏳ {pendingCount} pending
              </span>
            )}
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0 0', lineHeight: 1.5 }}>
            Review and approve LGU Staff accounts across all regions. Approved LGU staff can manage local farmers, buyers, and suppliers.
          </p>
        </div>

        {/* ── Filter Bar ── */}
        <div style={{
          display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'flex-end',
          marginBottom: '28px',
          background: '#FFFFFF',
          border: '1.5px solid #E4E2DC',
          borderRadius: '14px',
          padding: '18px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>

          {/* Target Role */}
          <div style={{ flex: '1', minWidth: '160px' }}>
            <label style={labelStyle}>
              <span>👤</span> Target Role
            </label>
            <select style={selectStyle} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="all">All Roles (System)</option>
              <option value="farmer">Farmer</option>
              <option value="buyer">Buyer</option>
              <option value="supplier">Supplier</option>
              <option value="lgu_staff">LGU Staff</option>
            </select>
          </div>

          {/* Approval Status */}
          <div style={{ flex: '1', minWidth: '160px' }}>
            <label style={labelStyle}>
              <span>🔖</span> Approval Status
            </label>
            <select style={selectStyle} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Region */}
          <div style={{ flex: '1', minWidth: '160px' }}>
            <label style={labelStyle}>
              <span>📍</span> Region
            </label>
            <select
              style={selectStyle}
              value={regionFilter}
              onChange={e => {
                setRegionFilter(e.target.value);
                setProvinceFilter(PROVINCE_DEFAULT);
                setMunicipalityFilter(MUNICIPALITY_DEFAULT);
              }}
            >
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Province */}
          <div style={{ flex: '1', minWidth: '160px' }}>
            <label style={labelStyle}>
              <span>🏴</span> Province
            </label>
            <select
              style={{ ...selectStyle, opacity: regionFilter === REGION_DEFAULT ? 0.5 : 1, cursor: regionFilter === REGION_DEFAULT ? 'not-allowed' : 'pointer' }}
              value={provinceFilter}
              disabled={regionFilter === REGION_DEFAULT}
              onChange={e => { setProvinceFilter(e.target.value); setMunicipalityFilter(MUNICIPALITY_DEFAULT); }}
            >
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Municipality */}
          <div style={{ flex: '1', minWidth: '160px' }}>
            <label style={labelStyle}>
              <span>🏙️</span> Municipality / City
            </label>
            <select
              style={{ ...selectStyle, opacity: provinceFilter === PROVINCE_DEFAULT ? 0.5 : 1, cursor: provinceFilter === PROVINCE_DEFAULT ? 'not-allowed' : 'pointer' }}
              value={municipalityFilter}
              disabled={provinceFilter === PROVINCE_DEFAULT}
              onChange={e => setMunicipalityFilter(e.target.value)}
            >
              {municipalities.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Reset Button */}
          <div style={{ flexShrink: 0 }}>
            <label style={{ ...labelStyle, opacity: 0 }}>Reset</label>
            <button
              onClick={handleReset}
              style={{
                height: '40px', padding: '0 20px',
                borderRadius: '10px',
                border: '1.5px solid #D8D6CE',
                background: '#F8F7F3', color: '#374151',
                fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#176B3A';
                (e.currentTarget as HTMLButtonElement).style.color = '#176B3A';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = '#F8F7F3';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#D8D6CE';
                (e.currentTarget as HTMLButtonElement).style.color = '#374151';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.86" />
              </svg>
              Reset
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#6F716C' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>Fetching account requests…</div>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {users.map(u => {
              const isApproved = u.status === 'approved';
              const isRejected = u.status === 'rejected';
              const isSuspended = u.status === 'suspended';
              const isPending = !isApproved && !isRejected && !isSuspended;

              const statusColor = isApproved ? '#1E7E45' : isRejected ? '#BA3C3C' : isSuspended ? '#7C3AED' : '#B87A00';
              const statusBg = isApproved ? '#EAF6EE' : isRejected ? '#FDF2F2' : isSuspended ? '#F5F3FF' : '#FEF3D6';
              const statusBorder = isApproved ? 'rgba(30,126,69,0.25)' : isRejected ? 'rgba(186,60,60,0.25)' : isSuspended ? 'rgba(124,58,237,0.25)' : 'rgba(184,122,0,0.25)';
              const statusLabel = isApproved ? '✓ Approved' : isRejected ? '✕ Rejected' : isSuspended ? '⏸ Suspended' : '⏳ Pending Review';

              const roleColors: Record<string, { bg: string; text: string }> = {
                farmer: { bg: '#E8F5E9', text: '#1B5E20' },
                buyer: { bg: '#E3F2FD', text: '#1565C0' },
                supplier: { bg: '#FFF3E0', text: '#E65100' },
                lgu_staff: { bg: '#E0F2F1', text: '#00695C' },
                super_admin: { bg: '#FCE4EC', text: '#880E4F' },
              };
              const roleColor = roleColors[u.role] || { bg: '#F5F5F5', text: '#333' };
              const roleEmoji = u.role === 'farmer' ? '🧑‍🌾' : u.role === 'buyer' ? '🛒' : u.role === 'supplier' ? '📦' : u.role === 'lgu_staff' ? '🏛️' : '🔐';
              const roleLabel = u.role === 'lgu_staff' ? 'LGU Staff' : u.role === 'super_admin' ? 'Super Admin' : u.role.charAt(0).toUpperCase() + u.role.slice(1);
              const initials = `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();
              const locationParts = [u.municipality, u.province, u.region].filter(Boolean);

              // Format submitted date
              const submittedDate = u.createdAt
                ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : null;

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
                  {/* Top status strip */}
                  <div style={{ height: '4px', background: statusColor }} />

                  {/* Card Body */}
                  <div style={{ padding: '20px', flex: 1 }}>

                    {/* Header: avatar + name/email + status pill */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                      {/* Avatar — keep role colors */}
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: roleColor.bg, color: roleColor.text,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '17px', flexShrink: 0,
                        border: `2px solid ${roleColor.text}22`,
                      }}>
                        {initials || '?'}
                      </div>

                      {/* Name + email */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0E4A27', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.firstName} {u.lastName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6F716C', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                          {u.email}
                        </div>
                      </div>

                      {/* Status pill */}
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px',
                        fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: '0.04em',
                        background: statusBg, color: statusColor,
                        border: `1.5px solid ${statusBorder}`, flexShrink: 0,
                      }}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Role badge */}
                    <div style={{ marginBottom: '14px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                        background: roleColor.bg, color: roleColor.text,
                        border: `1.5px solid ${roleColor.text}33`,
                      }}>
                        {roleEmoji} {roleLabel}
                      </span>
                    </div>

                    {/* Location */}
                    {locationParts.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: '#525450', marginBottom: '6px' }}>
                        <span style={{ color: '#176B3A', fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>📍</span>
                        <span style={{ fontWeight: 600, lineHeight: 1.4 }}>{locationParts.join(' · ')}</span>
                      </div>
                    )}

                    {/* Submitted date */}
                    {submittedDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6F716C', marginBottom: '14px' }}>
                        <span style={{ fontSize: '13px' }}>📅</span>
                        <span>Submitted {submittedDate}</span>
                      </div>
                    )}

                    {/* View Details row */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #E4E2DC',
                      background: '#FAFAF7',
                      cursor: 'pointer',
                      marginBottom: '10px',
                      transition: 'background 0.15s ease',
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#EAF6EE'}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = '#FAFAF7'}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: 700, color: '#176B3A' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                        View Details
                      </span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#176B3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>

                    {/* Info note */}
                    {isPending && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#525450', padding: '0 2px' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#176B3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>Review account details before deciding.</span>
                      </div>
                    )}
                  </div>

                  {/* ── Action Buttons (State Machine) ── */}
                  <div style={{
                    borderTop: '1px solid #F0EFE9',
                    padding: '14px 16px',
                    display: 'flex', gap: '10px',
                    background: '#FAFAF7',
                  }}>

                    {/* PENDING → Approve + Reject */}
                    {isPending && (
                      <>
                        <button
                          disabled={actionLoading === u.id}
                          onClick={() => handleApprove(u.id)}
                          style={{ flex: 1, padding: '11px', border: 'none', borderRadius: '10px', background: '#176B3A', color: '#FFFFFF', fontSize: '14px', fontWeight: 800, cursor: 'pointer', opacity: actionLoading === u.id ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', transition: 'background 0.15s ease', boxShadow: '0 2px 8px rgba(23,107,58,0.2)' }}
                          onMouseEnter={e => { if (!actionLoading) (e.currentTarget as HTMLButtonElement).style.background = '#0E4A27'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#176B3A'; }}
                        >
                          {actionLoading === u.id ? 'Approving…' : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Approve</>}
                        </button>
                        <button
                          disabled={actionLoading === u.id}
                          onClick={() => handleReject(u.id)}
                          style={{ padding: '11px 18px', border: '1.5px solid #fca5a5', borderRadius: '10px', background: '#FFFFFF', color: '#BA3C3C', fontSize: '14px', fontWeight: 800, cursor: 'pointer', opacity: actionLoading === u.id ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', transition: 'all 0.15s ease' }}
                          onMouseEnter={e => { if (!actionLoading) { (e.currentTarget as HTMLButtonElement).style.background = '#FDF2F2'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#BA3C3C'; } }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#fca5a5'; }}
                        >
                          {actionLoading === u.id ? 'Rejecting…' : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg> Reject</>}
                        </button>
                      </>
                    )}

                    {/* APPROVED → Suspend only */}
                    {isApproved && (
                      <button
                        disabled={actionLoading === u.id}
                        onClick={() => handleSuspend(u.id)}
                        style={{ flex: 1, padding: '11px', border: '1.5px solid #C4B5FD', borderRadius: '10px', background: '#FFFFFF', color: '#7C3AED', fontSize: '14px', fontWeight: 800, cursor: 'pointer', opacity: actionLoading === u.id ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', transition: 'all 0.15s ease' }}
                        onMouseEnter={e => { if (!actionLoading) { (e.currentTarget as HTMLButtonElement).style.background = '#F5F3FF'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#7C3AED'; } }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#C4B5FD'; }}
                      >
                        {actionLoading === u.id ? 'Suspending…' : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg> Suspend Account</>}
                      </button>
                    )}

                    {/* SUSPENDED → Unsuspend + Reject */}
                    {isSuspended && (
                      <>
                        <button
                          disabled={actionLoading === u.id}
                          onClick={() => handleUnsuspend(u.id)}
                          style={{ flex: 1, padding: '11px', border: 'none', borderRadius: '10px', background: '#176B3A', color: '#FFFFFF', fontSize: '14px', fontWeight: 800, cursor: 'pointer', opacity: actionLoading === u.id ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', transition: 'background 0.15s ease', boxShadow: '0 2px 8px rgba(23,107,58,0.2)' }}
                          onMouseEnter={e => { if (!actionLoading) (e.currentTarget as HTMLButtonElement).style.background = '#0E4A27'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#176B3A'; }}
                        >
                          {actionLoading === u.id ? 'Reinstating…' : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg> Unsuspend</>}
                        </button>
                        <button
                          disabled={actionLoading === u.id}
                          onClick={() => handleReject(u.id)}
                          style={{ padding: '11px 18px', border: '1.5px solid #fca5a5', borderRadius: '10px', background: '#FFFFFF', color: '#BA3C3C', fontSize: '14px', fontWeight: 800, cursor: 'pointer', opacity: actionLoading === u.id ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', transition: 'all 0.15s ease' }}
                          onMouseEnter={e => { if (!actionLoading) { (e.currentTarget as HTMLButtonElement).style.background = '#FDF2F2'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#BA3C3C'; } }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#fca5a5'; }}
                        >
                          {actionLoading === u.id ? 'Rejecting…' : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg> Reject</>}
                        </button>
                      </>
                    )}

                    {/* REJECTED → No actions */}
                    {isRejected && (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', color: '#BA3C3C', fontWeight: 600, fontStyle: 'italic' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        Registration permanently rejected
                      </div>
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
