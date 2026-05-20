import { apiClient, parseApiError } from '@/lib/api';

export interface MarketplaceProject {
  id: string;
  project_name: string;
  project_type: string;
  country: string;
  location: string;
  description: string | null;
  estimated_credits: number;
  available_credits: number;
  price_per_credit: number;
  currency: string;
  tokenized: boolean;
  status: string;
  owner_id: string;
}

export async function fetchMarketplaceProjects(): Promise<MarketplaceProject[]> {
  try {
    const response = await apiClient.get('/api/marketplace/');
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to fetch marketplace projects.'));
  }
}
