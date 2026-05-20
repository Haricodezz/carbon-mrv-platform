import { apiClient, parseApiError } from '@/lib/api';

export interface CertificateRecord {
  certificate_id: string;
  project_id: string;
  project_name: string;
  credits_retired: number;
  issued_to: string;
  blockchain_tx_hash?: string | null;
  issued_at: string;
  status?: string;
  verification_status?: string;
  compliance_standard?: string;
}

export async function getMyCertificates(): Promise<CertificateRecord[]> {
  try {
    const response = await apiClient.get('/api/certificates/');
    return response.data;
  } catch (error: unknown) {
    const detail =
      typeof error === 'object' &&
      error !== null &&
      'response' in error
        ? (error as { response?: { data?: { detail?: unknown } } }).response
            ?.data?.detail
        : undefined;
    throw new Error(parseApiError(detail, 'Failed to fetch your certificates.'));
  }
}

export async function getProjectCertificate(
  projectId: string
): Promise<CertificateRecord> {
  try {
    const response = await apiClient.get(`/api/certificates/${projectId}`);
    return response.data;
  } catch (error: unknown) {
    const detail =
      typeof error === 'object' &&
      error !== null &&
      'response' in error
        ? (error as { response?: { data?: { detail?: unknown } } }).response
            ?.data?.detail
        : undefined;
    throw new Error(parseApiError(detail, 'Failed to fetch certificate.'));
  }
}

export async function downloadCertificatePdf(projectId: string): Promise<Blob> {
  try {
    const response = await apiClient.get(
      `/api/certificates/${projectId}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error: unknown) {
    throw new Error('Certificate download failed.');
  }
}
