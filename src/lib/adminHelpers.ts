'use client';

import { Practice } from '@/types/practice';
import { Doctor } from '@/types';
import { Referral } from '@/types/referrals';
import { Notification } from '@/types/notifications';
import { getAllPractices } from '@/lib/services/practiceDirectoryService';
import { getDoctorsForPractice } from '@/lib/services/practiceDirectoryService';
import { getAllDoctorsArray, updateDoctor } from '@/lib/api/doctors';
import { updatePractice } from '@/lib/api/practices';
import { getToken } from '@/lib/api/config';
import { saveDoctorOverride } from '@/lib/memberStorage';
import { formatFullName } from '@/lib/nameUtils';
import { addCreatedPractice } from '@/lib/storage/practiceStorage';
import { getReferrals } from '@/lib/storage/referralStorage';
import { getNotifications } from '@/lib/storage/notificationStorage';
import { LS_KEYS } from '@/lib/storage/keys';
import { readJSON, writeJSON } from '@/lib/storage/localStorage';
import { makeId } from '@/lib/services/id';

/**
 * Get all practices for admin (includes pending_profile practices for approval flows)
 */
export async function getAllPracticesForAdmin(): Promise<Practice[]> {
  return getAllPractices({ forAdmin: true });
}

/**
 * Get doctors by practice ID
 * Alias for getDoctorsForPractice() for consistency
 */
export async function getDoctorsByPractice(practiceId: string): Promise<Doctor[]> {
  return getDoctorsForPractice(practiceId);
}

/**
 * Assign Practice Admin role to a doctor
 * If practice already has a Practice Admin, transfers the role
 * 
 * @param practiceId Practice ID
 * @param newAdminDoctorId New Practice Admin doctor ID
 * @param oldAdminDoctorId Optional old Practice Admin doctor ID (if known)
 */
export async function assignPracticeAdminRole(
  practiceId: string,
  newAdminDoctorId: string,
  oldAdminDoctorId?: string
): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const allDoctors = await getAllDoctorsArray(token);

  if (!oldAdminDoctorId) {
    const practiceDoctors = allDoctors.filter(d => d.practiceId === practiceId);
    const oldAdmin = practiceDoctors.find(d => d.roleInPractice === 'practice_admin');
    if (oldAdmin) oldAdminDoctorId = oldAdmin.id;
  }

  if (oldAdminDoctorId && oldAdminDoctorId !== newAdminDoctorId) {
    await updateDoctor(oldAdminDoctorId, { roleInPractice: 'doctor' }, token);
  }

  const newAdmin = allDoctors.find(d => d.id === newAdminDoctorId);
  if (!newAdmin) throw new Error(`Doctor ${newAdminDoctorId} not found`);

  await updateDoctor(
    newAdminDoctorId,
    newAdmin.practiceId !== practiceId
      ? { practiceId, roleInPractice: 'practice_admin' }
      : { roleInPractice: 'practice_admin' },
    token
  );

  const allPractices = await getAllPracticesForAdmin();
  const practice = allPractices.find(p => p.id === practiceId);
  if (practice) {
    const doctorIds = practice.doctorIds || [];
    if (!doctorIds.includes(newAdminDoctorId)) {
      try {
        await updatePractice(practiceId, { doctor_ids: [...doctorIds, newAdminDoctorId] } as any, token);
      } catch {
        // Backend may not support doctor_ids on practice
      }
    }
  }
}

/**
 * Create a new doctor
 * Saves to created doctors storage
 * 
 * @param doctorData Partial doctor data (must include required fields)
 * @returns New doctor ID
 */
export async function createNewDoctor(doctorData: Partial<Doctor>): Promise<string> {
  const token = getToken();
  const allDoctors = token ? await getAllDoctorsArray(token) : [];
  
  // Generate new ID
  const newId = makeId('doc');
  
  // Ensure slug is unique
  let slug = doctorData.slug || `${doctorData.firstName?.toLowerCase()}-${doctorData.lastName?.toLowerCase()}`.replace(/\s+/g, '-');
  let slugCounter = 1;
  while (allDoctors.some(d => d.slug === slug)) {
    slug = `${slug}-${slugCounter}`;
    slugCounter++;
  }
  
  // Create full doctor object
  const fullName = doctorData.fullName ?? formatFullName(
    doctorData.firstName ?? '',
    doctorData.middleName,
    doctorData.lastName ?? '',
    doctorData.credentials
  );

  const newDoctor: Doctor = {
    id: newId,
    slug,
    firstName: doctorData.firstName || '',
    middleName: doctorData.middleName,
    lastName: doctorData.lastName || '',
    fullName,
    specialty: doctorData.specialty || '',
    credentials: doctorData.credentials || '',
    bio: doctorData.bio || '',
    email: doctorData.email,
    locations: doctorData.locations || [],
    insurance: doctorData.insurance || [],
    rating: doctorData.rating || 0,
    reviewCount: doctorData.reviewCount || 0,
    reviews: doctorData.reviews || [],
    featured: doctorData.featured || false,
    verified: doctorData.verified || false,
    availability: doctorData.availability || [],
    acceptsNewPatients: doctorData.acceptsNewPatients ?? true,
    practiceId: doctorData.practiceId,
    roleInPractice: doctorData.roleInPractice,
    ...doctorData,
  };
  
  saveDoctorOverride(newId, newDoctor);

  if (newDoctor.practiceId && token) {
    const allPractices = await getAllPracticesForAdmin();
    const practice = allPractices.find((p) => p.id === newDoctor.practiceId);
    if (practice) {
      const doctorIds = practice.doctorIds ?? [];
      if (!doctorIds.includes(newId)) {
        try {
          await updatePractice(newDoctor.practiceId, { doctor_ids: [...doctorIds, newId] } as any, token);
        } catch {
          // Backend may not support doctor_ids on practice
        }
      }
    }
  }

  return newId;
}

/**
 * Create a new practice
 * Saves via addCreatedPractice()
 * 
 * @param practiceData Partial practice data (must include required fields)
 * @returns New practice ID
 */
export async function createNewPractice(practiceData: Partial<Practice>): Promise<string> {
  const allPractices = await getAllPractices();
  
  // Generate new ID
  const newId = makeId('practice');
  
  // Ensure slug is unique
  let slug = practiceData.slug || practiceData.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `practice-${newId}`;
  let slugCounter = 1;
  while (allPractices.some(p => p.slug === slug)) {
    slug = `${slug}-${slugCounter}`;
    slugCounter++;
  }
  
  const now = new Date().toISOString();
  
  // Create full practice object
  const newPractice: Practice = {
    id: newId,
    slug,
    name: practiceData.name || '',
    description: practiceData.description || '',
    phone: practiceData.phone || '',
    email: practiceData.email,
    website: practiceData.website,
    address: practiceData.address || {
      line1: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA',
    },
    locations: practiceData.locations || [],
    specialties: practiceData.specialties || [],
    doctorIds: practiceData.doctorIds || [],
    services: practiceData.services || [],
    insurance: practiceData.insurance || [],
    logo: practiceData.logo,
    images: practiceData.images,
    createdAt: practiceData.createdAt || now,
    updatedAt: now,
  };
  
  // Save via addCreatedPractice
  addCreatedPractice(newPractice);
  
  return newId;
}

/**
 * Get all referrals system-wide
 * Aggregates all referrals from storage
 */
export function getAllReferrals(): Referral[] {
  return getReferrals();
}

/**
 * Get all notifications system-wide
 * Aggregates all notifications from all doctors
 */
export async function getAllNotifications(): Promise<Array<Notification & { doctorName?: string; doctorEmail?: string }>> {
  const token = getToken();
  const allDoctors = token ? await getAllDoctorsArray(token) : [];
  const allNotifications: Array<Notification & { doctorName?: string; doctorEmail?: string }> = [];
  
  // Iterate through all doctors and collect their notifications
  for (const doctor of allDoctors) {
    if (doctor.id) {
      const doctorNotifications = getNotifications(doctor.id);
      const enriched = doctorNotifications.map(notif => ({
        ...notif,
        doctorName: doctor.fullName,
        doctorEmail: doctor.email,
      }));
      allNotifications.push(...enriched);
    }
  }
  
  // Sort by createdAt desc (newest first)
  return allNotifications.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
