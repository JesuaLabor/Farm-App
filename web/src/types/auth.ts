export type Role = 'farmer' | 'buyer' | 'supplier' | 'lgu_staff' | 'super_admin';

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string;
  region?: string;
  province?: string;
  municipality?: string;
  barangay?: string;
  address?: string;
  photoUrl?: string;
  isVerified?: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: Role;
  firstName: string;
  lastName: string;
  region?: string;
  province?: string;
  municipality?: string;
  barangay?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  region?: string;
  province?: string;
  municipality?: string;
  barangay?: string;
  address?: string;
}
