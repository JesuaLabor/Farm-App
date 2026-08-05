// API Client
export { apiClient, setTokenStorage, getTokenStorage } from './client';
export type { TokenStorage } from './client';

// Auth
export { register, login, logout } from './auth';

// User
export { getProfile, updateProfile, uploadPhoto } from './user';

// Produce Marketplace
export {
  listProduceListings,
  getProduceListingByID,
  createProduceListing,
  updateProduceListing,
  deleteProduceListing,
  initiateProduceTransaction,
  listProduceTransactions,
  updateProduceTransactionStatus,
} from './produce';
export type { ProduceFilterOptions } from './produce';

// Agri-Supply Store
export {
  listSupplyProducts,
  getSupplyProductByID,
  createSupplyProduct,
  updateSupplyProduct,
  deleteSupplyProduct,
  createSupplyOrder,
  listSupplyOrders,
  updateSupplyOrderStatus,
} from './supply';
export type { SupplyFilterOptions } from './supply';

// Market Price Monitoring
export {
  listPriceHistory,
  getLatestCropPrice,
  createMarketPriceRecord,
} from './price';
export type { PriceFilterOptions } from './price';

// Farm Income & Expense Tracker
export {
  listFinancialEntries,
  createFinancialEntry,
  deleteFinancialEntry,
  getFinancialSummary,
} from './financial';
export type { FinancialFilterOptions } from './financial';

// Types
export type {
  Role,
  User,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  UpdateProfileRequest,
  ListingStatus,
  TransactionStatus,
  ProduceListing,
  CreateProduceListingRequest,
  ProduceTransaction,
  CreateProduceTransactionRequest,
  SupplyCategory,
  DeliveryMethod,
  SupplyOrderStatus,
  SupplyProduct,
  CreateSupplyProductRequest,
  SupplyOrderItem,
  SupplyOrder,
  CreateSupplyOrderRequest,
  MarketPrice,
  CreateMarketPriceRequest,
  LatestPriceResponse,
  EntryType,
  FinancialCategory,
  FinancialEntry,
  CreateFinancialEntryRequest,
  CategoryBreakdown,
  FinancialSummary,
  ApiError,
} from './types';
