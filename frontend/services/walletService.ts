import { apiClient, parseApiError } from '@/lib/api';

export interface WalletResponse {
  id: string;
  user_id: string;
  wallet_address: string | null;
  is_verified: boolean;
  fiat_balance: number;
  carbon_balance: number;
  total_purchased: number;
  total_retired: number;
  currency: string;
  last_blockchain_sync: string | null;
  updated_at: string;
}

export interface WalletBalanceResponse {
  carbon_balance: number;
  fiat_balance: number;
  currency: string;
}

export interface CreditOwnershipResponse {
  id: string;
  project_id: string;
  project_name: string;
  total_credits_owned: number;
  credits_retired: number;
  updated_at: string;
}

export interface WalletTransactionResponse {
  id: string;
  transaction_type: string;
  amount: number;
  credits: number;
  currency: string;
  status: string;
  blockchain_tx_hash: string | null;
  created_at: string;
}

export async function fetchWalletInfo(): Promise<WalletResponse> {
  try {
    const response = await apiClient.get('/api/wallet/');
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to fetch wallet info.'));
  }
}

export async function verifyWallet(payload: {
  wallet_address: string;
  signature?: string;
}): Promise<WalletResponse> {
  try {
    const response = await apiClient.post('/api/wallet/verify', payload);
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Wallet verification failed.'));
  }
}

export async function fetchWalletBalance(): Promise<WalletBalanceResponse> {
  try {
    const response = await apiClient.get('/api/wallet/balance');
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to fetch wallet balance.'));
  }
}

export async function fetchWalletCredits(): Promise<CreditOwnershipResponse[]> {
  try {
    const response = await apiClient.get('/api/wallet/credits');
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to fetch wallet credits.'));
  }
}

export async function fetchWalletTransactions(): Promise<WalletTransactionResponse[]> {
  try {
    const response = await apiClient.get('/api/wallet/transactions');
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to fetch wallet transactions.'));
  }
}

export const WALLET_VERIFICATION_MESSAGE_PREFIX = 'Verify your Carbon MRV wallet ownership. Nonce:';

export function buildVerificationMessage(nonce: string): string {
  return `${WALLET_VERIFICATION_MESSAGE_PREFIX} ${nonce}`;
}
