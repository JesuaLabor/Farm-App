export type EntryType = 'income' | 'expense';

export type FinancialCategory =
  | 'produce_sale'
  | 'seeds'
  | 'fertilizer'
  | 'labor'
  | 'equipment'
  | 'other';

export interface FinancialEntry {
  id: string;
  farmerId: string;
  type: EntryType;
  category: FinancialCategory;
  title: string;
  amount: number;
  date: string;
  notes?: string;
  relatedCrop?: string;
  linkedProduceTxId?: string;
  linkedSupplyOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFinancialEntryPayload {
  type: EntryType;
  category: FinancialCategory;
  title: string;
  amount: number;
  date: string;
  notes?: string;
  relatedCrop?: string;
  linkedProduceTxId?: string;
  linkedSupplyOrderId?: string;
}

export interface CategoryBreakdown {
  category: FinancialCategory;
  amount: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  breakdown: CategoryBreakdown[];
}
