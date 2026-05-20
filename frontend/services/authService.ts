import { apiClient, parseApiError } from '@/lib/api';
import type { AuthUser } from '@/types/user';

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  country?: string;
  organization_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export async function registerUser(data: RegisterData) {
  try {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Registration failed.'));
  }
}

export async function loginUser(data: LoginData) {
  try {
    const formData = new URLSearchParams();
    formData.append('username', data.email);
    formData.append('password', data.password);

    const response = await apiClient.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Login failed.'));
  }
}

export function saveToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
}

export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

export function logoutUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  } catch (error) {
    logoutUser();
    return null;
  }
}
