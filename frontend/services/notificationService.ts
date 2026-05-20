import { apiClient, parseApiError } from '@/lib/api';

export interface NotificationResponse {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export async function fetchNotifications(): Promise<NotificationResponse[]> {
  try {
    const response = await apiClient.get('/api/notifications');
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to fetch notifications.'));
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    await apiClient.put(`/api/notifications/${id}/read`);
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to mark notification as read.'));
  }
}
