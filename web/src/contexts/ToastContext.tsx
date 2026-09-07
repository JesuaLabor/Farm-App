import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4500 }: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => showToast({ type: 'success', title, message }),
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string) => showToast({ type: 'error', title, message }),
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string) => showToast({ type: 'info', title, message }),
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => showToast({ type: 'warning', title, message }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, removeToast }}>
      {children}

      {/* ─── Top-Right Floating Toast Container ─── */}
      <div
        style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '420px',
          width: 'calc(100vw - 48px)',
          pointerEvents: 'none',
        }}
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const config = {
            success: {
              border: '#86EFAC',
              bg: '#FFFFFF',
              iconBg: '#DCFCE7',
              iconColor: '#166534',
              icon: '✓',
              titleColor: '#0E4A27',
              barColor: '#22C55E',
            },
            error: {
              border: '#FCA5A5',
              bg: '#FFFFFF',
              iconBg: '#FEE2E2',
              iconColor: '#991B1B',
              icon: '✕',
              titleColor: '#7F1D1D',
              barColor: '#EF4444',
            },
            warning: {
              border: '#FCD34D',
              bg: '#FFFFFF',
              iconBg: '#FEF3C7',
              iconColor: '#92400E',
              icon: '⚠️',
              titleColor: '#78350F',
              barColor: '#F59E0B',
            },
            info: {
              border: '#93C5FD',
              bg: '#FFFFFF',
              iconBg: '#DBEAFE',
              iconColor: '#1E40AF',
              icon: 'ℹ',
              titleColor: '#1E3A8A',
              barColor: '#3B82F6',
            },
          }[toast.type];

          return (
            <div
              key={toast.id}
              className="toast-card-animate"
              style={{
                pointerEvents: 'auto',
                background: config.bg,
                border: `1.5px solid ${config.border}`,
                borderRadius: '14px',
                padding: '14px 16px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Type Icon */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: config.iconBg,
                  color: config.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '15px',
                  flexShrink: 0,
                }}
              >
                {config.icon}
              </div>

              {/* Text content */}
              <div style={{ flex: 1, minWidth: 0, paddingRight: '6px' }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: config.titleColor,
                    lineHeight: 1.3,
                  }}
                >
                  {toast.title}
                </div>
                {toast.message && (
                  <div
                    style={{
                      fontSize: '12.5px',
                      color: '#4B5563',
                      marginTop: '3px',
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                    }}
                  >
                    {toast.message}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  fontSize: '16px',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#374151')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                aria-label="Close notification"
              >
                ✕
              </button>

              {/* Auto-dismiss progress indicator */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: config.barColor,
                    animation: `toastProgress ${toast.duration || 4500}ms linear forwards`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
