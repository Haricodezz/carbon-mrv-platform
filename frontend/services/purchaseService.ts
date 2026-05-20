import { apiClient, parseApiError } from '@/lib/api';

export interface PurchaseInitiateResponse {
  order_id: string;
  amount: number;
  currency: string;
  project_id: string;
  key_id: string | null;
}

export interface PurchaseVerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  project_id: string;
  amount: number;
}

export interface PurchaseResponse {
  message: string;
  purchase_id: string;
  transaction_id: string;
  project_id: string;
  credits_purchased: number;
  total_price: number;
  currency: string;
  status: string;
}

export interface PurchaseHistory {
  purchase_id: string;
  project_id: string;
  project_name: string;
  credits_purchased: number;
  price_per_credit: number;
  total_price: number;
  blockchain_tx_hash?: string | null;
  status: string;
  created_at: string;
}

export async function initiatePurchase(
  project_id: string,
  amount: number
): Promise<PurchaseInitiateResponse> {
  try {
    const response = await apiClient.post('/api/purchases/create-order', {
      project_id,
      amount,
    });
    const data = response.data;
    return {
      order_id: data.order_id,
      amount: data.amount_inr,
      currency: data.currency,
      project_id: data.project_id,
      key_id: data.key_id ?? null,
    };
  } catch (error: unknown) {
    const detail =
      typeof error === 'object' &&
      error !== null &&
      'response' in error
        ? (error as { response?: { data?: { detail?: unknown } } }).response
            ?.data?.detail
        : undefined;
    throw new Error(parseApiError(detail, 'Failed to initiate purchase.'));
  }
}

export async function verifyPurchase(
  data: PurchaseVerifyRequest
): Promise<PurchaseResponse> {
  try {
    const response = await apiClient.post('/api/purchases/verify-payment', data);
    return response.data;
  } catch (error: unknown) {
    const detail =
      typeof error === 'object' &&
      error !== null &&
      'response' in error
        ? (error as { response?: { data?: { detail?: unknown } } }).response
            ?.data?.detail
        : undefined;
    throw new Error(parseApiError(detail, 'Payment verification failed.'));
  }
}

export async function purchaseCredits(
  projectId: string,
  amount: number
): Promise<PurchaseResponse> {
  const init = await initiatePurchase(projectId, amount);
  return verifyPurchase({
    razorpay_order_id: init.order_id,
    razorpay_payment_id: 'mock_payment_id',
    razorpay_signature: 'mock_signature',
    project_id: projectId,
    amount,
  });
}

export async function getPurchaseHistory(): Promise<PurchaseHistory[]> {
  try {
    const response = await apiClient.get('/api/purchases/history');
    return response.data;
  } catch (error: unknown) {
    const detail =
      typeof error === 'object' &&
      error !== null &&
      'response' in error
        ? (error as { response?: { data?: { detail?: unknown } } }).response
            ?.data?.detail
        : undefined;
    throw new Error(parseApiError(detail, 'Failed to fetch purchase history.'));
  }
}
