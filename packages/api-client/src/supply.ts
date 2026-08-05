import { apiClient } from './client';
import type {
  CreateSupplyOrderRequest,
  CreateSupplyProductRequest,
  SupplyOrder,
  SupplyOrderStatus,
  SupplyProduct,
} from './types';

export interface SupplyFilterOptions {
  category?: string;
  q?: string;
  supplierId?: string;
}

export async function listSupplyProducts(options?: SupplyFilterOptions): Promise<SupplyProduct[]> {
  const params = new URLSearchParams();
  if (options?.category) params.append('category', options.category);
  if (options?.q) params.append('q', options.q);
  if (options?.supplierId) params.append('supplierId', options.supplierId);

  const res = await apiClient.get<SupplyProduct[]>(`/api/supply/products?${params.toString()}`);
  return res.data;
}

export async function getSupplyProductByID(id: string): Promise<SupplyProduct> {
  const res = await apiClient.get<SupplyProduct>(`/api/supply/products/${id}`);
  return res.data;
}

export async function createSupplyProduct(data: CreateSupplyProductRequest): Promise<SupplyProduct> {
  const res = await apiClient.post<SupplyProduct>('/api/supply/products', data);
  return res.data;
}

export async function updateSupplyProduct(id: string, data: Partial<CreateSupplyProductRequest>): Promise<SupplyProduct> {
  const res = await apiClient.put<SupplyProduct>(`/api/supply/products/${id}`, data);
  return res.data;
}

export async function deleteSupplyProduct(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(`/api/supply/products/${id}`);
  return res.data;
}

export async function createSupplyOrder(data: CreateSupplyOrderRequest): Promise<SupplyOrder> {
  const res = await apiClient.post<SupplyOrder>('/api/supply/orders', data);
  return res.data;
}

export async function listSupplyOrders(): Promise<SupplyOrder[]> {
  const res = await apiClient.get<SupplyOrder[]>('/api/supply/orders');
  return res.data;
}

export async function updateSupplyOrderStatus(id: string, status: SupplyOrderStatus): Promise<SupplyOrder> {
  const res = await apiClient.put<SupplyOrder>(`/api/supply/orders/${id}/status`, { status });
  return res.data;
}
