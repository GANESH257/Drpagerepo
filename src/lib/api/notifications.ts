/**
 * Notifications API functions
 */

import { apiClient, ApiError, getToken } from './config';

export interface Notification {
  id: string;
  doctor_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
  read_at?: string;
}

/**
 * Get notifications for authenticated user
 */
export async function getNotifications(unreadOnly?: boolean): Promise<Notification[]> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const endpoint = unreadOnly
      ? '/api/notifications?unreadOnly=true'
      : '/api/notifications';

    const response = await apiClient.get<Notification[]>(endpoint, token);
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to fetch notifications');
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(id: string): Promise<Notification> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.put<Notification>(
      `/api/notifications/${id}/read`,
      {},
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to mark notification as read');
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<{ message: string }> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.put<{ message: string }>(
      '/api/notifications/read-all',
      {},
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to mark all notifications as read');
  }
}

/**
 * Get all notifications for all doctors (admin only)
 */
export async function getAllNotifications(): Promise<Array<Notification & { doctorName?: string; doctorEmail?: string }>> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.get<Array<Notification & { doctorName?: string; doctorEmail?: string }>>(
      '/api/notifications/admin/all',
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to fetch all notifications');
  }
}
