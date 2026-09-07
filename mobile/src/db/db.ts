import Dexie, { type EntityTable } from 'dexie';

export interface OfflineQueueItem {
  id?: number;
  type: 'FINANCIAL_ENTRY' | 'PRODUCE_LISTING';
  payload: any;
  timestamp: string;
}

export interface CachedFinancialEntry {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  pendingSync?: boolean;
}

export interface CachedProduceListing {
  id: string;
  farmerId?: string;
  farmerName: string;
  cropName: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  location: string;
  description?: string;
  photos?: string[];
  status?: string;
  createdAt: string;
  pendingSync?: boolean;
}

export interface CachedPriceRecord {
  id: string;
  commodity: string;
  category: string;
  region: string;
  price: number;
  unit: string;
  updatedAt: string;
}

// Initialize Dexie IndexedDB instance
export const db = new Dexie('AgriConnectDB') as Dexie & {
  offlineQueue: EntityTable<OfflineQueueItem, 'id'>;
  financialCache: EntityTable<CachedFinancialEntry, 'id'>;
  produceCache: EntityTable<CachedProduceListing, 'id'>;
  pricesCache: EntityTable<CachedPriceRecord, 'id'>;
};

db.version(1).stores({
  offlineQueue: '++id, type, timestamp',
  financialCache: 'id, type, date, pendingSync',
  produceCache: 'id, category, cropName, pendingSync',
  pricesCache: 'id, commodity, region',
});
