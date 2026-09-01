import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, type OfflineQueueItem } from '../db/db';
import { api } from '../api';

interface OfflineContextType {
  isOnline: boolean;
  pendingCount: number;
  syncing: boolean;
  toastMessage: string | null;
  triggerSync: () => Promise<void>;
  enqueueOfflineItem: (type: OfflineQueueItem['type'], payload: any) => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Update pending queue count
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await db.offlineQueue.count();
      setPendingCount(count);
    } catch (e) {
      console.error('Failed to count offline queue:', e);
    }
  }, []);

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Perform background synchronization of queued items
  const triggerSync = useCallback(async () => {
    if (!navigator.onLine || syncing) return;
    try {
      const queue = await db.offlineQueue.orderBy('id').toArray();
      if (queue.length === 0) return;

      setSyncing(true);
      let syncedCount = 0;

      for (const item of queue) {
        try {
          if (item.type === 'FINANCIAL_ENTRY') {
            await api.createFinancialEntry(item.payload);
            // Remove pending item from cache and queue
            if (item.payload.tempId) {
              await db.financialCache.delete(item.payload.tempId);
            }
          } else if (item.type === 'PRODUCE_LISTING') {
            await api.createProduceListing(item.payload);
            if (item.payload.tempId) {
              await db.produceCache.delete(item.payload.tempId);
            }
          }

          if (item.id) {
            await db.offlineQueue.delete(item.id);
            syncedCount++;
          }
        } catch (err) {
          console.error(`Sync error for queue item ${item.id}:`, err);
          // Stop on network failure to maintain order
          break;
        }
      }

      await refreshPendingCount();
      if (syncedCount > 0) {
        showToast(`✓ Synced ${syncedCount} offline item${syncedCount > 1 ? 's' : ''} to AgriConnect Cloud`);
      }
    } catch (e) {
      console.error('Error during triggerSync:', e);
    } finally {
      setSyncing(false);
    }
  }, [syncing, refreshPendingCount]);

  // Listen to network status changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial count
    refreshPendingCount();

    // Auto-sync if online and items exist on mount
    if (navigator.onLine) {
      triggerSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerSync, refreshPendingCount]);

  // Enqueue item for offline sync
  const enqueueOfflineItem = async (type: OfflineQueueItem['type'], payload: any) => {
    await db.offlineQueue.add({
      type,
      payload,
      timestamp: new Date().toISOString(),
    });
    await refreshPendingCount();
    if (navigator.onLine) {
      triggerSync();
    }
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        pendingCount,
        syncing,
        toastMessage,
        triggerSync,
        enqueueOfflineItem,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used within an OfflineProvider');
  return ctx;
};
