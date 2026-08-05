import { apiClient } from './client';
import type {
  CreateFinancialEntryRequest,
  FinancialEntry,
  FinancialSummary,
} from './types';

export interface FinancialFilterOptions {
  startDate?: string;
  endDate?: string;
}

export async function listFinancialEntries(options?: FinancialFilterOptions): Promise<FinancialEntry[]> {
  const params = new URLSearchParams();
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);

  const res = await apiClient.get<FinancialEntry[]>(`/api/finances/entries?${params.toString()}`);
  return res.data;
}

export async function createFinancialEntry(data: CreateFinancialEntryRequest): Promise<FinancialEntry> {
  const res = await apiClient.post<FinancialEntry>('/api/finances/entries', data);
  return res.data;
}

export async function deleteFinancialEntry(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(`/api/finances/entries/${id}`);
  return res.data;
}

export async function getFinancialSummary(options?: FinancialFilterOptions): Promise<FinancialSummary> {
  const params = new URLSearchParams();
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);

  const res = await apiClient.get<FinancialSummary>(`/api/finances/summary?${params.toString()}`);
  return res.data;
}
