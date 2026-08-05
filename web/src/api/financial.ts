import { apiClient } from './index';
import type {
  CreateFinancialEntryPayload,
  FinancialEntry,
  FinancialSummary,
} from '../types/financial';

export interface FinancialFilterOptions {
  startDate?: string;
  endDate?: string;
}

export const financialApi = {
  listEntries: async (options?: FinancialFilterOptions): Promise<FinancialEntry[]> => {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);

    const res = await apiClient.get<FinancialEntry[]>(`/api/finances/entries?${params.toString()}`);
    return res.data;
  },

  createEntry: async (payload: CreateFinancialEntryPayload): Promise<FinancialEntry> => {
    const res = await apiClient.post<FinancialEntry>('/api/finances/entries', payload);
    return res.data;
  },

  deleteEntry: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/finances/entries/${id}`);
  },

  getSummary: async (options?: FinancialFilterOptions): Promise<FinancialSummary> => {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);

    const res = await apiClient.get<FinancialSummary>(`/api/finances/summary?${params.toString()}`);
    return res.data;
  },
};
