import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { AuthResponse, LoginPayload, RegisterPayload, UpdateProfilePayload, User } from '../types/auth';

// API_URL is injected at launch time by run_mobile_web_backend_locally.sh
// via the API_URL env variable → app.config.js → Constants.expoConfig.extra.apiUrl
// This makes the app work on physical devices without any manual IP changes.
const extra = (Constants.expoConfig?.extra ?? (Constants as any).manifest?.extra ?? {}) as Record<string, string>;
const injectedUrl: string | undefined = extra.apiUrl;

const getFallbackUrl = (): string => {
  // Android emulator: 10.0.2.2 maps to the host machine's localhost
  if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
  // Physical iOS/Android on same Wi-Fi — use LAN IP
  return 'http://192.168.100.164:8080';
};

const API_URL = injectedUrl || getFallbackUrl();
console.log('[AgriConnect Mobile] API Base URL:', API_URL);

let userToken: string | null = null;

export const setMobileToken = (token: string | null) => {
  userToken = token;
};

export const getMobileToken = () => userToken;

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
    setMobileToken(res.data.token);
    return res.data;
  },
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/api/auth/login', payload);
    setMobileToken(res.data.token);
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
  uploadPhoto: async (fileUri: string): Promise<User> => {
    const formData = new FormData();
    const filename = fileUri.split('/').pop() || 'photo.jpg';

    formData.append('photo', {
      uri: fileUri,
      name: filename,
      type: 'image/jpeg',
    } as any);

    const res = await apiClient.put<User>('/api/users/me/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  // Produce Marketplace
  listProduce: async (cropName?: string, category?: string) => {
    let url = '/api/produce/listings';
    const params: string[] = [];
    if (cropName) params.push(`cropName=${encodeURIComponent(cropName)}`);
    if (category && category !== 'All') params.push(`category=${encodeURIComponent(category)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    const res = await apiClient.get(url);
    return res.data;
  },
  createProduceListing: async (payload: { cropName: string; category: string; quantity: number; unit: string; pricePerUnit: number; location: string; description?: string }) => {
    const res = await apiClient.post('/api/produce/listings', payload);
    return res.data;
  },
  initiatePurchase: async (payload: { listingId: string; quantity: number; contactMessage: string }) => {
    const res = await apiClient.post('/api/produce/transactions', payload);
    return res.data;
  },
  // Agri-Supply Store
  listSupply: async (category?: string) => {
    const url = category && category !== 'All' ? `/api/supply/products?category=${encodeURIComponent(category)}` : '/api/supply/products';
    const res = await apiClient.get(url);
    return res.data;
  },
  createSupplyProduct: async (payload: { name: string; category: string; price: number; unit: string; stockQuantity: number; description?: string }) => {
    const res = await apiClient.post('/api/supply/products', payload);
    return res.data;
  },
  // Community Forum
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
  // Market Prices
  listPrices: async (region?: string) => {
    const url = region && region !== 'All Regions' ? `/api/prices?region=${encodeURIComponent(region)}` : '/api/prices';
    const res = await apiClient.get(url);
    return res.data;
  },
  createPriceRecord: async (payload: { commodity: string; category: string; region: string; price: number; unit: string; source?: string }) => {
    const res = await apiClient.post('/api/prices', payload);
    return res.data;
  },
  // Government Programs
  listPrograms: async () => {
    const res = await apiClient.get('/api/programs');
    return res.data;
  },
  createProgram: async (payload: { title: string; agency: string; description: string; deadline: string; eligibilityCriteria?: string[]; requiredDocuments?: string[] }) => {
    const res = await apiClient.post('/api/programs', payload);
    return res.data;
  },
  // Farm Financial Tracker
  listFinancialEntries: async () => {
    const res = await apiClient.get('/api/financial/entries');
    return res.data;
  },
  createFinancialEntry: async (payload: { type: 'income' | 'expense'; category: string; amount: number; description: string; date: string }) => {
    const res = await apiClient.post('/api/financial/entries', payload);
    return res.data;
  },
};
