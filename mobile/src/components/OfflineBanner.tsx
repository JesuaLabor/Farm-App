import React from 'react';
import { useOffline } from '../contexts/OfflineContext';

export const OfflineBanner: React.FC = () => {
  const { isOnline, pendingCount, syncing, toastMessage, triggerSync } = useOffline();

  const showBanner = !isOnline || pendingCount > 0;

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="offline-toast">
          {toastMessage}
        </div>
      )}

      {/* Floating Offline / Pending Sync Banner */}
      {showBanner && (
        <div className={`offline-banner ${!isOnline ? 'offline' : 'syncing'}`}>
          <div className="offline-banner-text">
            {!isOnline ? (
              <>
                <span>⚡</span> Offline Mode &mdash; {pendingCount} item{pendingCount === 1 ? '' : 's'} queued
              </>
            ) : syncing ? (
              <>
                <span>🔄</span> Syncing {pendingCount} offline item{pendingCount === 1 ? '' : 's'}...
              </>
            ) : (
              <>
                <span>⏳</span> {pendingCount} offline item{pendingCount === 1 ? '' : 's'} ready to sync
              </>
            )}
          </div>
          {isOnline && !syncing && pendingCount > 0 && (
            <button className="offline-sync-btn" onClick={() => triggerSync()}>
              Sync Now
            </button>
          )}
        </div>
      )}
    </>
  );
};
