import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = (import.meta as any)?.env?.VITE_API_URL ?? 'http://localhost:8080';

/**
 * Token storage abstraction.
 * Web apps should use localStorage; React Native apps should use AsyncStorage.
 * Call `setTokenStorage` to configure before making API calls.
 */
export interface TokenStorage {
  getToken(): Promise<string | null>;
  setToken(token: string): Promise<void>;
  removeToken(): Promise<void>;
}

// Default to localStorage for web (can be overridden for React Native)
let tokenStorage: TokenStorage = {
  getToken: async () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('agriconnect_token');
    }
    return null;
  },
  setToken: async (token: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('agriconnect_token', token);
    }
  },
  removeToken: async () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('agriconnect_token');
    }
  },
};

/** Configure the token storage implementation (call from app initialization). */
export function setTokenStorage(storage: TokenStorage) {
  tokenStorage = storage;
}

/** Get the current token storage instance. */
export function getTokenStorage(): TokenStorage {
  return tokenStorage;
}

/** Create and configure the Axios API client. */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });

  // Request interceptor: attach JWT
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await tokenStorage.getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor: handle 401 (token expired / invalid)
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        await tokenStorage.removeToken();
        // Emit a custom event so apps can redirect to login
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('agriconnect:unauthorized'));
        }
      }
      return Promise.reject(error);
    },
  );

  return client;
}

/** The shared Axios API client instance. */
export const apiClient = createApiClient();
