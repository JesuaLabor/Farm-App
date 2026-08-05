export interface MarketPrice {
  id: string;
  cropName: string;
  category: string;
  unit: string;
  price: number;
  region: string;
  marketLocation: string;
  recordedAt: string;
  source: string;
  recordedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMarketPricePayload {
  cropName: string;
  category: string;
  unit: string;
  price: number;
  region: string;
  marketLocation: string;
  recordedAt: string;
  source: string;
}

export interface LatestPriceResponse {
  cropName: string;
  region: string;
  price: number;
  unit: string;
  marketLocation: string;
  recordedAt: string;
  source: string;
}
