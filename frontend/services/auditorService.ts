import { apiClient, parseApiError } from '@/lib/api';

export interface PendingProject {
  project_id: string;
  project_name: string;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  location: string;
  country: string;
  land_area_acres: number;
  satellite_status: string;
  audit_status: string;
  lifecycle_status: string;
  ndvi_score: number | null;
  vegetation_health: number | null;
  total_biomass: number | null;
  carbon_stock: number | null;
  co2e: number | null;
  estimated_annual_credits: number | null;
  fraud_risk_score: number | null;
  verification_notes: string | null;
  land_docs: {
    id: string;
    document_type: string;
    document_url: string;
    verification_status: string;
  }[];
}

export interface AuditLogResponse {
  id: string;
  actor_id: string | null;
  target_id: string | null;
  action_type: string;
  target_type: string;
  notes: string | null;
  risk_score: number;
  created_at: string;
}

export interface AuditorMetrics {
  pending_kyc: number;
  pending_land: number;
  pending_projects: number;
  approved_projects: number;
  rejected_projects: number;
  fraud_alerts: number;
  total_pending: number;
  recent_reviews: {
    id: string;
    action_type: string;
    target_type: string;
    notes: string | null;
    risk_score: number;
    created_at: string | null;
  }[];
}

export async function fetchAuditorMetrics(): Promise<AuditorMetrics> {
  try {
    const response = await apiClient.get('/api/auditor/dashboard/metrics');
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to fetch auditor metrics.'));
  }
}

export async function fetchPendingProjects(): Promise<PendingProject[]> {
  try {
    const response = await apiClient.get('/api/auditor/projects/pending');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to fetch pending projects.'));
  }
}

export async function verifyProject(
  projectId: string,
  status: 'approved' | 'rejected',
  notes?: string,
  risk_score?: number
): Promise<{ message: string }> {
  try {
    const response = await apiClient.post(`/api/auditor/projects/${projectId}/verify`, {
      status,
      notes,
      risk_score,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, `Failed to ${status} project.`));
  }
}

export async function flagProjectFraud(
  projectId: string,
  notes: string,
  risk_score: number
): Promise<{ message: string; audit_log_id: string }> {
  try {
    const response = await apiClient.post(`/api/auditor/projects/${projectId}/fraud-flag`, {
      notes,
      risk_score,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to flag project for fraud.'));
  }
}

export async function fetchAuditLogs(): Promise<AuditLogResponse[]> {
  try {
    const response = await apiClient.get('/api/auditor/logs');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to fetch audit logs.'));
  }
}

/** Build a URL to securely view a document via the backend serve endpoint */
export function getDocumentViewUrl(filePath: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
  return `${baseUrl}/api/auditor/document/serve?path=${encodeURIComponent(filePath)}&token=${token}`;
}
