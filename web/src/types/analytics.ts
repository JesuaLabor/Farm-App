import type { MarketPrice } from './price';

export interface CropStat {
  cropName: string;
  listingCount: number;
}

export interface StatusStat {
  status: string;
  count: number;
}

export interface CommunityStat {
  totalPosts: number;
  totalComments: number;
}

export interface LGUDashboardSummary {
  region: string;
  municipality?: string;
  totalRegisteredFarmers: number;
  totalTransactionsCount: number;
  totalTransactionsValue: number;
  topCrops: CropStat[];
  programApplicationsByStatus: StatusStat[];
  communityActivity: CommunityStat;
  recentMarketPrices: MarketPrice[];
}
