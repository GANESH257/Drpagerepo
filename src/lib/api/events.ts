/**
 * Events API functions
 */

import { apiClient, ApiError, getToken } from './config';

export interface Event {
  id: string;
  title: string;
  date: string; // ISO date string
  location: string;
  is_online: boolean;
  description?: string;
  url?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all events — passes auth token when available so authenticated
 * users (doctors) get the full list instead of a 401/403.
 */
export async function getEvents(): Promise<Event[]> {
  try {
    const token = getToken();
    const response = await apiClient.get<Event[]>('/api/events', token ?? undefined);
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to fetch events');
  }
}

/**
 * Get single event
 */
export async function getEvent(id: string): Promise<Event> {
  try {
    const response = await apiClient.get<Event>(`/api/events/${id}`);
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      throw new Error('Event not found');
    }
    throw new Error(apiError.error || 'Failed to fetch event');
  }
}

/**
 * Create new event (admin only)
 */
export async function createEvent(data: Omit<Event, 'created_at' | 'updated_at'>): Promise<Event> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.post<Event>(
      '/api/events',
      data,
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to create event');
  }
}

/**
 * Update event (admin only)
 */
export async function updateEvent(
  id: string,
  data: Partial<Event>
): Promise<Event> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.put<Event>(
      `/api/events/${id}`,
      data,
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to update event');
  }
}

/**
 * Delete event (admin only)
 */
export async function deleteEvent(id: string): Promise<void> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    await apiClient.delete(`/api/events/${id}`, token);
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to delete event');
  }
}
