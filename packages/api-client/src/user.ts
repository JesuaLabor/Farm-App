import { apiClient } from './client';
import type { UpdateProfileRequest, User } from './types';

/**
 * Get the current user's profile.
 */
export async function getProfile(): Promise<User> {
  const response = await apiClient.get<User>('/api/users/me');
  return response.data;
}

/**
 * Update the current user's profile.
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const response = await apiClient.put<User>('/api/users/me', data);
  return response.data;
}

/**
 * Upload a profile photo.
 * @param file - File object (web) or { uri, name, type } object (React Native)
 */
export async function uploadPhoto(file: File | { uri: string; name: string; type: string }): Promise<User> {
  const formData = new FormData();
  formData.append('photo', file as any);

  const response = await apiClient.put<User>('/api/users/me/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
