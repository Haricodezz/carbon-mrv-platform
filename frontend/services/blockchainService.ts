import { apiClient, parseApiError } from '@/lib/api';

export interface BlockchainTransaction {
  tx_hash: string;
  block_number: number;
  status: number;
  simulated?: boolean;
}

export interface TokenBalance {
  wallet_address: string;
  balance: number;
  token_symbol: string;
  simulated?: boolean;
}

export interface TokenSupply {
  total_supply: number;
  token_symbol: string;
  simulated?: boolean;
}

export async function mintCarbonCredits(
  recipientWallet: string,
  amount: number,
  projectId: string
): Promise<BlockchainTransaction> {
  try {
    const response = await apiClient.post('/api/blockchain/mint', {
      recipient_wallet: recipientWallet,
      amount,
      project_id: projectId,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Minting credits failed.'));
  }
}

export async function retireCarbonCredits(
  projectId: string,
  amount: number,
  reason: string
): Promise<BlockchainTransaction> {
  try {
    const response = await apiClient.post('/api/blockchain/retire', {
      project_id: projectId,
      amount,
      reason,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Retiring credits failed.'));
  }
}

export async function transferCarbonCredits(
  recipientWallet: string,
  amount: number
): Promise<BlockchainTransaction> {
  try {
    const response = await apiClient.post('/api/blockchain/transfer', {
      recipient_wallet: recipientWallet,
      amount,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Transferring credits failed.'));
  }
}

export async function getCarbonBalance(): Promise<TokenBalance> {
  try {
    const response = await apiClient.get('/api/blockchain/balance');
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Fetching balance failed.'));
  }
}

export async function getCarbonSupply(): Promise<TokenSupply> {
  try {
    const response = await apiClient.get('/api/blockchain/supply');
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Fetching token supply failed.'));
  }
}
