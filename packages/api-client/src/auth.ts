import { apiClient, getTokenStorage } from './client';
import type { AuthResponse, LoginRequest, RegisterRequest } from './types';

/**
 * Register a new user account.
 * Automatically stores the returned JWT token.
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
  await getTokenStorage().setToken(response.data.token);
  return response.data;
}

/**
 * Log in with email and password.
 * Automatically stores the returned JWT token.
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
  await getTokenStorage().setToken(response.data.token);
  return response.data;
}

/**
 * Log out by clearing the stored token.
 */
export async function logout(): Promise<void> {
  await getTokenStorage().removeToken();
}
