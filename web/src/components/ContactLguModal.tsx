import React from 'react';

interface ContactLguModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactLguModal: React.FC<ContactLguModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lgu-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 25, 15, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #14532D 0%, #166534 100%)',
            padding: '24px 28px',
            color: '#FFFFFF',
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#FFFFFF',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.background = 'rgba(255,255,255,0.3)')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'rgba(255,255,255,0.15)')}
          >
            ✕
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
              }}
            >
              🏛️
            </div>
            <div>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#BBF7D0', fontWeight: 700 }}>
                Municipal Agriculture Desk
              </div>
              <h3 id="lgu-modal-title" style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }}>
                LGU & Agricultural Support
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '26px 28px' }}>
          <p style={{ margin: '0 0 18px 0', fontSize: '14px', color: '#4B5563', lineHeight: 1.5 }}>
            Need help recovering your credentials, verifying RSBSA enrollment, or registering your farm cooperative? Reach out through our official local government assistance desks:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
            {/* Contact 1 */}
            <div
              style={{
                padding: '14px 16px',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '20px' }}>📍</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                  Municipal Agriculture Office (MAO)
                </div>
                <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                  Ground Floor, City Hall / Municipal Hall Complex
                </div>
                <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600, marginTop: '4px' }}>
                  Monday – Friday • 8:00 AM – 5:00 PM PHT
                </div>
              </div>
            </div>

            {/* Contact 2 */}
            <div
              style={{
                padding: '14px 16px',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '20px' }}>📞</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                  DA Regional Hotline & SMS Desk
                </div>
                <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                  Hotline: (088) 856-2753 • Mobile: +63 917 842 5481
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  Toll-free agricultural verification line
                </div>
              </div>
            </div>

            {/* Contact 3 */}
            <div
              style={{
                padding: '14px 16px',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '20px' }}>✉️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                  Official Email Desk
                </div>
                <div style={{ fontSize: '13px', color: '#166534', fontWeight: 600, marginTop: '2px' }}>
                  support@agriconnect.gov.ph
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  RSBSA verification response within 24 business hours
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: '#166534',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
