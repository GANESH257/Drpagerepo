/**
 * Doctor contacts API (My Contacts)
 */

import { apiClient, ApiError, getToken } from './config';

export interface ContactDoctor {
  id: string;
  full_name: string;
  slug: string;
  specialty?: string;
  profile_image_url?: string;
  added_at?: string;
}

export async function getMyContacts(): Promise<ContactDoctor[]> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const response = await apiClient.get<ContactDoctor[]>('/api/doctors/me/contacts', token);
  return response;
}

export async function addContact(doctorId: string): Promise<ContactDoctor> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const response = await apiClient.post<ContactDoctor>(
    '/api/doctors/me/contacts',
    { doctor_id: doctorId },
    token
  );
  return response;
}

export async function removeContact(contactDoctorId: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  await apiClient.delete(
    `/api/doctors/me/contacts/${contactDoctorId}`,
    token
  );
}
