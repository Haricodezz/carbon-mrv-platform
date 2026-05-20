import { apiClient, parseApiError } from '@/lib/api';

export interface LandDocument {
  id: string;
  document_type: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  uploaded_at: string | null;
  verified_at: string | null;
}

export interface LandVerificationStatus {
  project_id: string;
  land_verification_status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  documents: LandDocument[];
  lifecycle_status: string;
}

export interface PendingLandItem {
  land_id: string;
  project_id: string;
  project_name: string;
  document_type: string;
  file_url: string;
  verification_status: string;
  uploaded_at: string | null;
}

/** Upload land ownership document for a project */
export async function uploadLandDocument(
  projectId: string,
  documentType: string,
  file: File
): Promise<{ land_verification_id: string; status: string }> {
  const formData = new FormData();
  formData.append('document_type', documentType);
  formData.append('file', file);
  try {
    const res = await apiClient.post(`/api/land-verification/${projectId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to upload land document.'));
  }
}

/** Get land verification status for a project */
export async function getLandVerificationStatus(projectId: string): Promise<LandVerificationStatus> {
  try {
    const res = await apiClient.get(`/api/land-verification/${projectId}/status`);
    return res.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to fetch land verification status.'));
  }
}

/** Admin/Auditor: list all pending land documents */
export async function listPendingLandDocs(): Promise<PendingLandItem[]> {
  try {
    const res = await apiClient.get('/api/land-verification/pending/all');
    return Array.isArray(res.data) ? res.data : [];
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to fetch pending land documents.'));
  }
}

/** Admin/Auditor: approve a land document */
export async function approveLandDoc(landId: string): Promise<{ message: string }> {
  try {
    const res = await apiClient.post(`/api/land-verification/${landId}/approve`);
    return res.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to approve land document.'));
  }
}

/** Admin/Auditor: reject a land document */
export async function rejectLandDoc(landId: string, rejectionReason: string): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append('rejection_reason', rejectionReason);
  try {
    const res = await apiClient.post(`/api/land-verification/${landId}/reject`, formData);
    return res.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to reject land document.'));
  }
}

/** Admin-only: issue credits for an approved project */
export async function adminIssueCredits(projectId: string): Promise<{ message: string; lifecycle_status: string }> {
  try {
    const res = await apiClient.post(`/api/projects/${projectId}/issue-credits`);
    return res.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to issue credits.'));
  }
}
