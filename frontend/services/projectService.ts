import { apiClient, parseApiError } from '@/lib/api';

export interface CreateProjectRequest {
  project_name: string;
  country: string;
  location: string;
  polygon_coordinates: string;
  description?: string;
}

export interface Project {
  id: string;
  owner_id?: string;
  project_name: string;
  project_type?: string;
  country: string;
  location: string;
  latitude?: number;
  longitude?: number;
  polygon_coordinates?: string;
  land_area_acres: number;
  satellite_status: string;
  audit_status: string;
  ndvi_score?: number;
  vegetation_health?: number;
  fraud_risk_score?: number;
  agb_per_hectare?: number;
  total_biomass?: number;
  carbon_stock?: number;
  co2e?: number;
  estimated_annual_credits?: number;
  first_issuance_credits?: number;
  estimated_credits?: number;
  total_credits_generated?: number;
  verification_notes?: string;
  tokenized?: boolean;
  blockchain_tx_hash?: string;
  status: string;
  lifecycle_status?: string;
  credits_issued?: boolean;
  credits_issued_at?: string;
  credits_available?: number;
  credits_sold?: number;
  price_per_credit?: number;
  credit_currency?: string;
  created_at?: string;
  updated_at?: string;
}

export async function createProject(projectData: CreateProjectRequest): Promise<Project> {
  try {
    const response = await apiClient.post('/api/projects/', projectData);
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Project creation failed.'));
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const response = await apiClient.get('/api/projects/');
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to fetch projects.'));
  }
}

export async function getProjectById(projectId: string): Promise<Project> {
  try {
    const response = await apiClient.get(`/api/projects/${projectId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to fetch project details.'));
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  try {
    await apiClient.delete(`/api/projects/${projectId}`);
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Project deletion failed.'));
  }
}

export async function satelliteVerifyProject(projectId: string): Promise<any> {
  try {
    const response = await apiClient.post(`/api/projects/${projectId}/satellite-verify`);
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Satellite verification failed.'));
  }
}

export async function downloadProjectCertificate(projectId: string): Promise<Blob> {
  try {
    const response = await apiClient.get(`/api/projects/${projectId}/certificate`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data instanceof Blob) {
        // we can't easily parse JSON from Blob error synchronously without a FileReader but we can fallback
        throw new Error('Certificate download failed.');
    }
    throw new Error(parseApiError(error.response?.data?.detail, 'Certificate download failed.'));
  }
}
