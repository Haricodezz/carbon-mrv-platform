import { apiClient, parseApiError } from '@/lib/api';

export interface KYCDocument {
  id: string;
  document_type: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  uploaded_at: string | null;
  reviewed_at: string | null;
}

export interface KYCStatus {
  kyc_status: 'not_submitted' | 'pending' | 'approved' | 'rejected' | 'verified';
  documents: KYCDocument[];
  is_trusted_role: boolean;
}

export interface PendingKYCItem {
  kyc_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  document_type: string;
  file_url: string;
  status: string;
  uploaded_at: string | null;
}

/** Upload a KYC document (farmer/ngo/company side) */
export async function uploadKYCDocument(documentType: string, file: File): Promise<{ kyc_id: string; status: string }> {
  const formData = new FormData();
  formData.append('document_type', documentType);
  formData.append('file', file);
  try {
    const res = await apiClient.post('/api/kyc/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to upload KYC document.'));
  }
}

/** Get my KYC status */
export async function getMyKYCStatus(): Promise<KYCStatus> {
  try {
    const res = await apiClient.get('/api/kyc/status');
    return res.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to fetch KYC status.'));
  }
}

/** Admin/Auditor: list pending KYC documents */
export async function listPendingKYC(): Promise<PendingKYCItem[]> {
  try {
    const res = await apiClient.get('/api/kyc/pending');
    return Array.isArray(res.data) ? res.data : [];
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to fetch pending KYC.'));
  }
}

/** Admin/Auditor: approve a KYC document */
export async function approveKYC(kycId: string): Promise<{ message: string }> {
  try {
    const res = await apiClient.post(`/api/kyc/${kycId}/approve`);
    return res.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to approve KYC.'));
  }
}

/** Admin/Auditor: reject a KYC document */
export async function rejectKYC(kycId: string, rejectionReason: string): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append('rejection_reason', rejectionReason);
  try {
    const res = await apiClient.post(`/api/kyc/${kycId}/reject`, formData);
    return res.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to reject KYC.'));
  }
}
