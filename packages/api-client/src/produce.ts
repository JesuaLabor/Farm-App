import { apiClient } from './client';
import type {
  CreateProduceListingRequest,
  CreateProduceTransactionRequest,
  ProduceListing,
  ProduceTransaction,
  TransactionStatus,
} from './types';

export interface ProduceFilterOptions {
  cropName?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  farmerId?: string;
}

export async function listProduceListings(options?: ProduceFilterOptions): Promise<ProduceListing[]> {
  const params = new URLSearchParams();
  if (options?.cropName) params.append('cropName', options.cropName);
  if (options?.category) params.append('category', options.category);
  if (options?.location) params.append('location', options.location);
  if (options?.minPrice !== undefined) params.append('minPrice', options.minPrice.toString());
  if (options?.maxPrice !== undefined) params.append('maxPrice', options.maxPrice.toString());
  if (options?.status) params.append('status', options.status);
  if (options?.farmerId) params.append('farmerId', options.farmerId);

  const res = await apiClient.get<ProduceListing[]>(`/api/produce/listings?${params.toString()}`);
  return res.data;
}

export async function getProduceListingByID(id: string): Promise<ProduceListing> {
  const res = await apiClient.get<ProduceListing>(`/api/produce/listings/${id}`);
  return res.data;
}

export async function createProduceListing(data: CreateProduceListingRequest): Promise<ProduceListing> {
  const res = await apiClient.post<ProduceListing>('/api/produce/listings', data);
  return res.data;
}

export async function updateProduceListing(id: string, data: Partial<CreateProduceListingRequest>): Promise<ProduceListing> {
  const res = await apiClient.put<ProduceListing>(`/api/produce/listings/${id}`, data);
  return res.data;
}

export async function deleteProduceListing(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(`/api/produce/listings/${id}`);
  return res.data;
}

export async function initiateProduceTransaction(data: CreateProduceTransactionRequest): Promise<ProduceTransaction> {
  const res = await apiClient.post<ProduceTransaction>('/api/produce/transactions', data);
  return res.data;
}

export async function listProduceTransactions(): Promise<ProduceTransaction[]> {
  const res = await apiClient.get<ProduceTransaction[]>('/api/produce/transactions');
  return res.data;
}

export async function updateProduceTransactionStatus(id: string, status: TransactionStatus): Promise<ProduceTransaction> {
  const res = await apiClient.put<ProduceTransaction>(`/api/produce/transactions/${id}/status`, { status });
  return res.data;
}
