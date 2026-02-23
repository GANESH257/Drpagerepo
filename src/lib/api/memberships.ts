/**
 * Memberships API (doctor and practice membership)
 */

import { apiClient, ApiError, getToken } from './config';

export interface Membership {
  id: string;
  doctor_id: string;
  practice_id?: string;
  plan_id: string;
  plan_name: string;
  billing_cycle: string;
  amount: number;
  status: string;
  start_date: string;
  expiry_date: string;
  next_billing_date?: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

/**
 * Get current doctor's membership (most recent).
 */
export async function getMyMembership(): Promise<Membership | null> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const response = await apiClient.get<Membership | null>('/api/doctors/me/membership', token);
  return response;
}

/**
 * Get practice memberships (Practice Admin only).
 */
export async function getPracticeMemberships(practiceId: string): Promise<Membership[]> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const response = await apiClient.get<Membership[]>(
    `/api/practices/${practiceId}/membership`,
    token
  );
  return response;
}
