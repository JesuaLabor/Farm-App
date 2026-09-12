import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
  };

  if (!installPrompt || isDismissed || isInstalled) {
    return null;
  }

  return (
    <div
      role="banner"
      aria-label="Install AgriConnect Application"
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '24px',
        zIndex: 9999,
        maxWidth: '380px',
        width: 'calc(100vw - 32px)',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 12px 36px rgba(14, 74, 39, 0.18), 0 2px 8px rgba(0, 0, 0, 0.08)',
        border: '1px solid #D1E7D8',
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <img
        src="/pwa-192x192.png"
        alt="AgriConnect App Icon"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          objectFit: 'contain',
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 800, color: '#0E4A27', lineHeight: 1.2 }}>
          Install AgriConnect App
        </div>
        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', lineHeight: 1.3 }}>
          Fast access, works offline &amp; updates automatically.
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={handleInstallClick}
          style={{
            backgroundColor: '#176B3A',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(23, 107, 58, 0.3)',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#0E4A27')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#176B3A')}
        >
          Install
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          aria-label="Dismiss app install banner"
          style={{
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};
