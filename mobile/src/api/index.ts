import axios from 'axios';
import type { AuthResponse, LoginPayload, RegisterPayload, UpdateProfilePayload, User } from '../types/auth';
import type { CreateSupplyOrderPayload, SupplyOrder, UpdatePaymentStatusPayload } from '../types/app';

// API_URL is set via VITE_API_URL env variable (written to .env by launch script).
// Falls back to the LAN IP if not configured.
const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' ? '' : 'http://localhost:8080');
console.log('[AgriConnect PWA] API Base URL:', API_URL);

let userToken: string | null = null;

export const setToken = (token: string | null) => {
  userToken = token;
};

export const getToken = () => userToken;

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }
  return config;
});

export const api = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/api/auth/register', payload);
    setToken(res.data.token);
    return res.data;
  },
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/api/auth/login', payload);
    setToken(res.data.token);
    return res.data;
  },
  getProfile: async (): Promise<User> => {
    const res = await apiClient.get<User>('/api/users/me');
    return res.data;
  },
  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const res = await apiClient.put<User>('/api/users/me', payload);
    return res.data;
  },
  uploadPhoto: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await apiClient.put<User>('/api/users/me/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  uploadImage: async (file: File | Blob, filename?: string): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('image', file, filename || (file instanceof File ? file.name : 'upload.jpg'));
    const res = await apiClient.post<{ url: string; filename: string }>('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  listProduce: async (cropName?: string, category?: string) => {
    const params: string[] = [];
    if (cropName) params.push(`cropName=${encodeURIComponent(cropName)}`);
    if (category && category !== 'All') params.push(`category=${encodeURIComponent(category)}`);
    const url = params.length ? `/api/produce/listings?${params.join('&')}` : '/api/produce/listings';
    const res = await apiClient.get(url);
    return res.data;
  },
  createProduceListing: async (payload: { cropName: string; category: string; quantity: number; unit: string; pricePerUnit: number; location: string; description?: string; photos?: string[] }) => {
    const res = await apiClient.post('/api/produce/listings', payload);
    return res.data;
  },
  initiatePurchase: async (payload: { listingId: string; quantity: number; contactMessage: string }) => {
    const res = await apiClient.post('/api/produce/transactions', payload);
    return res.data;
  },
  listProduceTransactions: async () => {
    const res = await apiClient.get('/api/produce/transactions');
    return res.data;
  },
  updateProduceTransactionStatus: async (txId: string, status: string) => {
    const res = await apiClient.put(`/api/produce/transactions/${txId}/status`, { status });
    return res.data;
  },
  listSupply: async (category?: string) => {
    const url = category && category !== 'All' ? `/api/supply/products?category=${encodeURIComponent(category)}` : '/api/supply/products';
    const res = await apiClient.get(url);
    return res.data;
  },
  createSupplyProduct: async (payload: { name: string; category: string; price: number; unit: string; stockQuantity: number; description?: string; images?: string[] }) => {
    const res = await apiClient.post('/api/supply/products', payload);
    return res.data;
  },
  /** Place a supply order from the mobile PWA checkout flow. */
  createSupplyOrder: async (payload: CreateSupplyOrderPayload): Promise<SupplyOrder> => {
    const res = await apiClient.post<SupplyOrder>('/api/supply/orders', payload);
    return res.data;
  },
  /** List supply orders for the current user (farmer sees their own; supplier sees orders for their products). */
  listSupplyOrders: async (): Promise<SupplyOrder[]> => {
    const res = await apiClient.get<SupplyOrder[]>('/api/supply/orders');
    return res.data;
  },
  /**
   * Update payment status — used by suppliers to confirm COD cash receipt on delivery.
   * In the future, online payment gateway webhooks will also call this via the backend.
   */
  updatePaymentStatus: async (orderId: string, payload: UpdatePaymentStatusPayload): Promise<SupplyOrder> => {
    const res = await apiClient.put<SupplyOrder>(`/api/supply/orders/${orderId}/payment-status`, payload);
    return res.data;
  },
  listCommunityPosts: async (category?: string) => {
    const url = category && category !== 'all' ? `/api/community/posts?category=${encodeURIComponent(category)}` : '/api/community/posts';
    const res = await apiClient.get(url);
    return res.data;
  },
  createCommunityPost: async (payload: { title: string; body: string; category: string }) => {
    const res = await apiClient.post('/api/community/posts', payload);
    return res.data;
  },
  toggleUpvotePost: async (postId: string) => {
    const res = await apiClient.post(`/api/community/posts/${postId}/upvote`);
    return res.data;
  },
  listPrices: async (region?: string) => {
    const url = region && region !== 'All Regions' ? `/api/prices?region=${encodeURIComponent(region)}` : '/api/prices';
    const res = await apiClient.get(url);
    return res.data;
  },
  createPriceRecord: async (payload: { commodity: string; category: string; region: string; price: number; unit: string; source?: string }) => {
    const res = await apiClient.post('/api/prices', payload);
    return res.data;
  },
  listPrograms: async () => {
    const res = await apiClient.get('/api/programs');
    return res.data;
  },
  createProgram: async (payload: { title: string; agency: string; description: string; deadline: string; eligibilityCriteria?: string[]; requiredDocuments?: string[] }) => {
    const res = await apiClient.post('/api/programs', payload);
    return res.data;
  },
  listFinancialEntries: async () => {
    const res = await apiClient.get('/api/financial/entries');
    return res.data;
  },
  createFinancialEntry: async (payload: { type: 'income' | 'expense'; category: string; amount: number; description: string; date: string }) => {
    const res = await apiClient.post('/api/financial/entries', payload);
    return res.data;
  },
  listNotifications: async () => {
    const res = await apiClient.get('/api/notifications');
    return res.data;
  },
  getUnreadNotifCount: async () => {
    const res = await apiClient.get<{ unreadCount: number }>('/api/notifications/unread-count');
    return res.data.unreadCount;
  },
  markNotifAsRead: async (id: string) => {
    const res = await apiClient.put(`/api/notifications/${id}/read`);
    return res.data;
  },
  markAllNotifsAsRead: async () => {
    const res = await apiClient.put('/api/notifications/read-all');
    return res.data;
  },
};

export const getImageUrl = (path?: string, fallback: string = ''): string => {
  if (!path) return fallback;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

