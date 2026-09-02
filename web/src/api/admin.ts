import { apiClient } from './index';
import type { User } from '../types/auth';

export interface ListUsersParams {
  role?: string;
  status?: string;
  region?: string;
  province?: string;
  municipality?: string;
  barangay?: string;
}

export const adminApi = {
  listUsers: async (params?: ListUsersParams): Promise<User[]> => {
    const res = await apiClient.get<User[]>('/api/admin/users', { params });
    return res.data;
  },

  approveUser: async (userId: string): Promise<{ message: string }> => {
    const res = await apiClient.put<{ message: string }>(`/api/admin/users/${userId}/approve`);
    return res.data;
  },

  rejectUser: async (userId: string): Promise<{ message: string }> => {
    const res = await apiClient.put<{ message: string }>(`/api/admin/users/${userId}/reject`);
    return res.data;
  },
};
