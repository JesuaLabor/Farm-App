import React, { useEffect, useState } from 'react';
import { UserAvatar } from './UserAvatar';
import type { User } from '../types/auth';

interface AccountDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (userId: string) => Promise<void> | void;
  onReject?: (userId: string) => Promise<void> | void;
  onSuspend?: (userId: string) => Promise<void> | void;
  onUnsuspend?: (userId: string) => Promise<void> | void;
  actionLoading?: string | null;
}

export const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({
  user,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onSuspend,
  onUnsuspend,
  actionLoading = null,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !actionLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, actionLoading, onClose]);

  if (!isOpen || !user) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isApproved = user.status === 'approved';
  const isRejected = user.status === 'rejected';
  const isSuspended = user.status === 'suspended';
  const isPending = !isApproved && !isRejected && !isSuspended;

  const statusColor = isApproved ? '#1E7E45' : isRejected ? '#BA3C3C' : isSuspended ? '#7C3AED' : '#B87A00';
  const statusBg = isApproved ? '#EAF6EE' : isRejected ? '#FDF2F2' : isSuspended ? '#F5F3FF' : '#FEF3D6';
  const statusBorder = isApproved ? 'rgba(30,126,69,0.3)' : isRejected ? 'rgba(186,60,60,0.3)' : isSuspended ? 'rgba(124,58,237,0.3)' : 'rgba(184,122,0,0.3)';
  const statusLabel = isApproved ? '✓ Approved' : isRejected ? '✕ Rejected' : isSuspended ? '⏸ Suspended' : '⏳ Pending Review';

  const roleColors: Record<string, { bg: string; text: string }> = {
    farmer: { bg: '#E8F5E9', text: '#1B5E20' },
    buyer: { bg: '#E3F2FD', text: '#1565C0' },
    supplier: { bg: '#FFF3E0', text: '#E65100' },
    lgu_staff: { bg: '#E0F2F1', text: '#00695C' },
    super_admin: { bg: '#FCE4EC', text: '#880E4F' },
  };
  const roleColor = roleColors[user.role] || { bg: '#F5F5F5', text: '#333333' };
  const roleEmoji = user.role === 'farmer' ? '🧑‍🌾' : user.role === 'buyer' ? '🛒' : user.role === 'supplier' ? '📦' : user.role === 'lgu_staff' ? '🏛️' : '🛡️';
  const roleLabel = user.role === 'lgu_staff' ? 'LGU Staff' : user.role === 'super_admin' ? 'Super Admin' : user.role.charAt(0).toUpperCase() + user.role.slice(1);
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed User';
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?';

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'Not available';
    try {
      return new Date(isoString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const getRoleDescription = () => {
    switch (user.role) {
      case 'lgu_staff':
        return 'Local Government Officer authorized to verify farmers, oversee regional programs, and benchmark agricultural market commodity prices.';
      case 'farmer':
        return 'Local agricultural producer registered to apply for government subsidies, access market price indices, and list farm produce.';
      case 'buyer':
        return 'Commercial wholesale buyer registered to purchase fresh produce directly from verified farmers and local farming cooperatives.';
      case 'supplier':
        return 'Agricultural merchant authorized to sell farming supplies, certified seeds, fertilizers, and agricultural equipment.';
      default:
        return 'Platform administration account with elevated governance privileges.';
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => {
        if (!actionLoading) onClose();
      }}
      style={{
        zIndex: 1100,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '24px 26px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.25)',
          border: '1.5px solid #E2E8F0',
        }}
      >
        {/* Modal Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#166534',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                padding: '2px 8px',
                borderRadius: '12px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Account Verification
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0E4A27', margin: '4px 0 0 0' }}>
              Account Profile Details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={Boolean(actionLoading)}
            aria-label="Close dialog"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: '#F1F5F9',
              color: '#475569',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#E2E8F0')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#F1F5F9')}
          >
            ✕
          </button>
        </div>

        {/* User Identity Profile Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '16px',
            borderRadius: '14px',
            background: '#F8F7F3',
            border: '1.5px solid #E4E2DC',
            marginBottom: '18px',
          }}
        >
          <UserAvatar
            photoUrl={user.photoUrl}
            name={fullName}
            initials={initials}
            size={56}
            bg={roleColor.bg}
            color={roleColor.text}
            border={`2px solid ${roleColor.text}33`}
            fontSize="18px"
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '17px', fontWeight: 800, color: '#0E4A27' }}>
                {fullName}
              </span>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 800,
                  background: statusBg,
                  color: statusColor,
                  border: `1.5px solid ${statusBorder}`,
                }}
              >
                {statusLabel}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: roleColor.bg,
                  color: roleColor.text,
                  border: `1px solid ${roleColor.text}22`,
                }}
              >
                {roleEmoji} {roleLabel}
              </span>

              {user.isVerified && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#166534',
                    background: '#DCFCE7',
                    border: '1px solid #86EFAC',
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}
                >
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 1: Contact Information */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#525450', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Contact Details
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '10px' }}>
            {/* Email */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                background: '#FAFAF7',
                border: '1px solid #E4E2DC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#6F716C', fontWeight: 600 }}>Email Address</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1A1C1A', wordBreak: 'break-all', marginTop: '2px' }}>
                  {user.email}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(user.email, 'email')}
                title="Copy email"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: copiedField === 'email' ? '#166534' : '#6F716C',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {copiedField === 'email' ? '✓ Copied' : '📋'}
              </button>
            </div>

            {/* Phone */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                background: '#FAFAF7',
                border: '1px solid #E4E2DC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#6F716C', fontWeight: 600 }}>Contact Phone</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1A1C1A', marginTop: '2px' }}>
                  {user.phone ? (
                    <a href={`tel:${user.phone}`} style={{ color: '#176B3A', textDecoration: 'none' }}>
                      📞 {user.phone}
                    </a>
                  ) : (
                    <span style={{ color: '#8C8E88', fontWeight: 500, fontStyle: 'italic' }}>Not provided</span>
                  )}
                </div>
              </div>
              {user.phone && (
                <button
                  type="button"
                  onClick={() => handleCopy(user.phone!, 'phone')}
                  title="Copy phone"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: copiedField === 'phone' ? '#166534' : '#6F716C',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {copiedField === 'phone' ? '✓ Copied' : '📋'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Regional Jurisdiction & Address */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#525450', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Location & Jurisdiction
          </div>
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: '#FAFAF7',
              border: '1px solid #E4E2DC',
              fontSize: '13px',
              lineHeight: 1.6,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div>
                <span style={{ color: '#6F716C', fontSize: '11px', display: 'block' }}>Region</span>
                <span style={{ fontWeight: 700, color: '#1A1C1A' }}>{user.region || 'All Regions'}</span>
              </div>
              <div>
                <span style={{ color: '#6F716C', fontSize: '11px', display: 'block' }}>Province</span>
                <span style={{ fontWeight: 700, color: '#1A1C1A' }}>{user.province || 'All Provinces'}</span>
              </div>
              <div>
                <span style={{ color: '#6F716C', fontSize: '11px', display: 'block' }}>Municipality / City</span>
                <span style={{ fontWeight: 700, color: '#1A1C1A' }}>{user.municipality || 'All Municipalities'}</span>
              </div>
              <div>
                <span style={{ color: '#6F716C', fontSize: '11px', display: 'block' }}>Barangay</span>
                <span style={{ fontWeight: 700, color: '#1A1C1A' }}>{user.barangay || 'Not specified'}</span>
              </div>
            </div>

            {user.address && (
              <div style={{ borderTop: '1px solid #EFEFEA', paddingTop: '8px', marginTop: '6px' }}>
                <span style={{ color: '#6F716C', fontSize: '11px', display: 'block' }}>Street / Detailed Address</span>
                <span style={{ fontWeight: 600, color: '#1A1C1A' }}>{user.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Role & System Context */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#525450', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            System Role Information
          </div>
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              fontSize: '12px',
              color: '#166534',
              lineHeight: 1.5,
            }}
          >
            <strong>{roleEmoji} {roleLabel}:</strong> {getRoleDescription()}
          </div>
        </div>

        {/* Section 4: Audit Metadata */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: '#6F716C',
            padding: '4px 2px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '6px',
          }}
        >
          <div>📅 Registered: {formatDateTime(user.createdAt)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>ID:</span>
            <code style={{ fontSize: '11px', background: '#F1F5F9', padding: '2px 4px', borderRadius: '4px' }}>
              {user.id.slice(0, 12)}…
            </code>
            <button
              type="button"
              onClick={() => handleCopy(user.id, 'id')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#166534' }}
              title="Copy Full ID"
            >
              {copiedField === 'id' ? '✓' : '📋'}
            </button>
          </div>
        </div>

        {/* Action Controls (State Machine Integrated) */}
        <div
          style={{
            borderTop: '1.5px solid #E2E8F0',
            paddingTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={Boolean(actionLoading)}
            style={{
              height: '38px',
              padding: '0 16px',
              borderRadius: '10px',
              border: '1.5px solid #D8D6CE',
              background: '#FFFFFF',
              color: '#374151',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Close
          </button>

          {/* Pending: Approve + Reject */}
          {isPending && onApprove && onReject && (
            <>
              <button
                type="button"
                disabled={actionLoading === user.id}
                onClick={() => onReject(user.id)}
                style={{
                  height: '38px',
                  padding: '0 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #FECACA',
                  background: '#FFFFFF',
                  color: '#BA3C3C',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: actionLoading === user.id ? 0.6 : 1,
                }}
              >
                ✕ Reject
              </button>
              <button
                type="button"
                disabled={actionLoading === user.id}
                onClick={() => onApprove(user.id)}
                style={{
                  height: '38px',
                  padding: '0 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#176B3A',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(23,107,58,0.2)',
                  opacity: actionLoading === user.id ? 0.6 : 1,
                }}
              >
                {actionLoading === user.id ? 'Approving…' : '✓ Approve Account'}
              </button>
            </>
          )}

          {/* Approved: Suspend */}
          {isApproved && onSuspend && (
            <button
              type="button"
              disabled={actionLoading === user.id}
              onClick={() => onSuspend(user.id)}
              style={{
                height: '38px',
                padding: '0 16px',
                borderRadius: '10px',
                border: '1.5px solid #C4B5FD',
                background: '#FAF5FF',
                color: '#7C3AED',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: actionLoading === user.id ? 0.6 : 1,
              }}
            >
              {actionLoading === user.id ? 'Suspending…' : '⏸ Suspend Account'}
            </button>
          )}

          {/* Suspended: Unsuspend + Reject */}
          {isSuspended && onUnsuspend && onReject && (
            <>
              <button
                type="button"
                disabled={actionLoading === user.id}
                onClick={() => onReject(user.id)}
                style={{
                  height: '38px',
                  padding: '0 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #FECACA',
                  background: '#FFFFFF',
                  color: '#BA3C3C',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: actionLoading === user.id ? 0.6 : 1,
                }}
              >
                ✕ Reject
              </button>
              <button
                type="button"
                disabled={actionLoading === user.id}
                onClick={() => onUnsuspend(user.id)}
                style={{
                  height: '38px',
                  padding: '0 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#176B3A',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: actionLoading === user.id ? 0.6 : 1,
                }}
              >
                {actionLoading === user.id ? 'Reinstating…' : '▶ Unsuspend Account'}
              </button>
            </>
          )}

          {/* Rejected state note */}
          {isRejected && (
            <span style={{ fontSize: '13px', color: '#BA3C3C', fontStyle: 'italic', fontWeight: 600 }}>
              Registration permanently rejected
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
