import axios from 'axios';
import type { AuthResponse, LoginPayload, RegisterPayload, UpdateProfilePayload, User } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('agriconnect_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API helper methods
export const api = {
  // Auth
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/api/auth/register', payload);
    return res.data;
  },
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/api/auth/login', payload);
    return res.data;
  },

  // Profile
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
};
