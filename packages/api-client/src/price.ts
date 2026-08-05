import { apiClient } from './client';
import type {
  CreateMarketPriceRequest,
  LatestPriceResponse,
  MarketPrice,
} from './types';

export interface PriceFilterOptions {
  cropName?: string;
  region?: string;
  startDate?: string;
  endDate?: string;
}

export async function listPriceHistory(options?: PriceFilterOptions): Promise<MarketPrice[]> {
  const params = new URLSearchParams();
  if (options?.cropName) params.append('cropName', options.cropName);
  if (options?.region) params.append('region', options.region);
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);

  const res = await apiClient.get<MarketPrice[]>(`/api/market-prices?${params.toString()}`);
  return res.data;
}

export async function getLatestCropPrice(cropName: string, region?: string): Promise<LatestPriceResponse> {
  const params = new URLSearchParams();
  params.append('cropName', cropName);
  if (region) params.append('region', region);

  const res = await apiClient.get<LatestPriceResponse>(`/api/market-prices/latest?${params.toString()}`);
  return res.data;
}

export async function createMarketPriceRecord(data: CreateMarketPriceRequest): Promise<MarketPrice> {
  const res = await apiClient.post<MarketPrice>('/api/market-prices', data);
  return res.data;
}
