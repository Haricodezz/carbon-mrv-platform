import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export function parseApiError(detail: unknown, fallback: string): string {
  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'object' && item !== null && 'msg' in item) {
          return String((item as { msg: string }).msg);
        }
        return JSON.stringify(item);
      })
      .join(', ');
  }

  return fallback;
}
