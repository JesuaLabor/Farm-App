import { apiClient } from './index';
import type { CreateMarketPricePayload, LatestPriceResponse, MarketPrice } from '../types/price';

export interface PriceFilterOptions {
  cropName?: string;
  region?: string;
  startDate?: string;
  endDate?: string;
}

export const priceApi = {
  listHistory: async (options?: PriceFilterOptions): Promise<MarketPrice[]> => {
    const params = new URLSearchParams();
    if (options?.cropName) params.append('cropName', options.cropName);
    if (options?.region) params.append('region', options.region);
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);

    const res = await apiClient.get<MarketPrice[]>(`/api/market-prices?${params.toString()}`);
    return res.data;
  },

  getLatestPrice: async (cropName: string, region?: string): Promise<LatestPriceResponse> => {
    const params = new URLSearchParams();
    params.append('cropName', cropName);
    if (region) params.append('region', region);

    const res = await apiClient.get<LatestPriceResponse>(`/api/market-prices/latest?${params.toString()}`);
    return res.data;
  },

  createRecord: async (payload: CreateMarketPricePayload): Promise<MarketPrice> => {
    const res = await apiClient.post<MarketPrice>('/api/market-prices', payload);
    return res.data;
  },
};
