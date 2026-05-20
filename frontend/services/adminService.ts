import { apiClient, parseApiError } from '@/lib/api';

export interface DashboardMetrics {
  total_users: number;
  total_projects: number;
  verified_projects: number;
  pending_verifications: number;
  total_credits_sold: number;
  total_revenue_inr: number;
  active_companies: number;
  active_farmers: number;
  active_ngos: number;
  active_auditors: number;
  rejected_projects: number;
  total_carbon_stock: number;
  marketplace_volume: number;
  satellite_verified: number;
  avg_ndvi: number;
  avg_agb: number;
  fraud_alerts: number;
}

export interface UserAdminResponse {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface FraudReportResponse {
  project_id: string;
  project_name: string;
  fraud_risk_score: number;
  status: string;
  verification_notes: string | null;
}

export async function fetchAdminDashboard(): Promise<DashboardMetrics> {
  try {
    const response = await apiClient.get('/api/admin/dashboard');
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to fetch dashboard metrics.'));
  }
}

export async function fetchAllUsers(role?: string): Promise<UserAdminResponse[]> {
  try {
    const response = await apiClient.get('/api/admin/users', { params: { role } });
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to fetch users.'));
  }
}

export async function moderateUser(userId: string, is_active: boolean, notes?: string): Promise<{ message: string }> {
  try {
    const response = await apiClient.post(`/api/admin/users/${userId}/moderate`, { is_active, notes });
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to moderate user.'));
  }
}

export async function fetchFraudReports(): Promise<FraudReportResponse[]> {
  try {
    const response = await apiClient.get('/api/admin/fraud-reports');
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to fetch fraud reports.'));
  }
}
