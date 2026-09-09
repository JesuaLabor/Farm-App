import React, { useEffect } from 'react';
import { getImageUrl } from '../api';

export interface DeletableItem {
  id: string;
  name: string;
  category?: string;
  price?: number;
  unit?: string;
  stock?: number;
  image?: string;
  typeLabel?: string; // e.g. 'Product' or 'Produce Listing'
}

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  item: DeletableItem | null;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDeleting?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  item,
  title = 'Delete Product?',
  description,
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel, Keep It',
  isDeleting = false,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !item) return null;

  const itemType = item.typeLabel || 'Product';
  const resolvedDescription =
    description ||
    `Are you sure you want to delete this ${itemType.toLowerCase()}? Once deleted, it will be immediately removed from marketplace listings and cannot be recovered.`;

  return (
    <div
      className="modal-backdrop"
      onClick={() => {
        if (!isDeleting) onClose();
      }}
      style={{
        zIndex: 1000,
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
          maxWidth: '460px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          border: '1px solid #E2E8F0',
          position: 'relative',
          overflow: 'hidden',
          animation: 'modalPop 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Ambient Top Accent Bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '5px',
            background: 'linear-gradient(90deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)',
          }}
        />

        {/* Top Header with Icon & Close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          {/* Danger Pulse Icon */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: '#FEF2F2',
              border: '1.5px solid #FECACA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.12)',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#DC2626"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              if (!isDeleting) onClose();
            }}
            disabled={isDeleting}
            style={{
              background: '#F1F5F9',
              border: 'none',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              color: '#64748B',
              fontSize: '16px',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Title & Explanatory Copy */}
        <div style={{ marginBottom: '20px' }}>
          <h3
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: '#64748B',
              lineHeight: '1.5',
              margin: 0,
            }}
          >
            {resolvedDescription}
          </p>
        </div>

        {/* Item Preview Card */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            borderRadius: '16px',
            padding: '14px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          {item.image ? (
            <img
              src={getImageUrl(item.image)}
              alt={item.name}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                objectFit: 'cover',
                border: '1px solid #CBD5E1',
                flexShrink: 0,
                backgroundColor: '#FFFFFF',
              }}
            />
          ) : (
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: '#F1F5F9',
                border: '1px solid #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0,
              }}
            >
              📦
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#0F172A',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '180px',
                }}
                title={item.name}
              >
                {item.name}
              </span>

              {item.category && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#FEF9C3',
                    color: '#854D0E',
                    letterSpacing: '0.03em',
                  }}
                >
                  {item.category.replace(/_/g, ' ')}
                </span>
              )}
            </div>

            <div style={{ fontSize: '13px', color: '#64748B', display: 'flex', gap: '8px', alignItems: 'center' }}>
              {item.stock !== undefined && (
                <span>
                  Stock: <strong style={{ color: '#334155' }}>{item.stock} {item.unit ? `${item.unit}s` : 'units'}</strong>
                </span>
              )}
              {item.price !== undefined && (
                <>
                  <span>•</span>
                  <span>
                    <strong style={{ color: '#0F172A' }}>₱{item.price.toLocaleString()}</strong>{item.unit ? `/${item.unit}` : ''}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Warning Notice Box */}
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FEE2E2',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '16px', lineHeight: 1 }}>⚠️</span>
          <span style={{ fontSize: '12.5px', color: '#991B1B', lineHeight: '1.45', fontWeight: 500 }}>
            Past customer orders and transaction receipts won't be deleted, but new buyers will no longer be able to discover or order this item.
          </span>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            style={{
              flex: 1,
              height: '48px',
              padding: '0 16px',
              borderRadius: '12px',
              border: '1.5px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontSize: '14px',
              fontWeight: 700,
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) e.currentTarget.style.backgroundColor = '#F8FAFC';
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              flex: 1.2,
              height: '48px',
              padding: '0 18px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: isDeleting ? '#F87171' : '#DC2626',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 700,
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) e.currentTarget.style.backgroundColor = '#B91C1C';
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) e.currentTarget.style.backgroundColor = '#DC2626';
            }}
          >
            {isDeleting ? (
              <>
                <svg
                  style={{ animation: 'spin 1s linear infinite', width: '18px', height: '18px' }}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    style={{ opacity: 0.25 }}
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    style={{ opacity: 0.75 }}
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
