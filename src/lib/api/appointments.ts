/**
 * Appointments API functions
 */

import { apiClient, ApiError, getToken } from './config';

export interface AppointmentRequest {
  id: string;
  doctor_id: string;
  patient_name: string;
  requested_date: string;
  requested_time: string;
  reason?: string;
  insurance?: string;
  status: string;
  declined_note?: string;
  created_at: string;
  updated_at: string;
  doctor_name?: string;
}

/**
 * Get appointment requests (optionally filtered by doctorId)
 */
export async function getAppointments(doctorId?: string): Promise<AppointmentRequest[]> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const endpoint = doctorId
      ? `/api/appointments?doctorId=${doctorId}`
      : '/api/appointments';

    const response = await apiClient.get<AppointmentRequest[]>(endpoint, token);
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to fetch appointments');
  }
}

/**
 * Get single appointment request
 */
export async function getAppointment(id: string): Promise<AppointmentRequest> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.get<AppointmentRequest>(
      `/api/appointments/${id}`,
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      throw new Error('Appointment request not found');
    }
    throw new Error(apiError.error || 'Failed to fetch appointment');
  }
}

/**
 * Create new appointment request (public - no auth required)
 */
export async function createAppointment(data: {
  doctor_id: string;
  patient_name: string;
  requested_date: string;
  requested_time: string;
  reason?: string;
  insurance?: string;
}): Promise<AppointmentRequest> {
  try {
    const response = await apiClient.post<AppointmentRequest>(
      '/api/appointments',
      data
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to create appointment request');
  }
}

/**
 * Update appointment request
 */
export async function updateAppointment(
  id: string,
  data: Partial<AppointmentRequest>
): Promise<AppointmentRequest> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.put<AppointmentRequest>(
      `/api/appointments/${id}`,
      data,
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to update appointment');
  }
}
