/**
 * Membership Service - Foundation for membership management
 * 
 * Handles membership storage and retrieval (no billing logic)
 */

import { Membership } from '@/types/membership';
import { LS_KEYS } from '@/lib/storage/keys';
import { readJSON, writeJSON } from '@/lib/storage/localStorage';

/**
 * Get all memberships
 */
export function getMemberships(): Membership[] {
  return readJSON<Membership[]>(LS_KEYS.MEMBERSHIPS, []);
}

/**
 * Set membership (upsert by id)
 */
export function setMembership(m: Membership): void {
  const memberships = getMemberships();
  const index = memberships.findIndex((mem) => mem.id === m.id);
  
  if (index >= 0) {
    memberships[index] = m;
  } else {
    memberships.push(m);
  }
  
  writeJSON(LS_KEYS.MEMBERSHIPS, memberships);
}

/**
 * Get doctor's membership
 */
export function getDoctorMembership(doctorId: string): Membership | null {
  const memberships = getMemberships();
  return (
    memberships.find(
      (m) => m.scope === 'doctor' && m.doctorId === doctorId
    ) || null
  );
}

/**
 * Get practice's membership
 */
export function getPracticeMembership(practiceId: string): Membership | null {
  const memberships = getMemberships();
  return (
    memberships.find(
      (m) => m.scope === 'practice' && m.practiceId === practiceId
    ) || null
  );
}

/**
 * Get membership overview for all doctors in a practice
 */
export function getPracticeDoctorsMembershipOverview(
  practiceId: string
): Array<{ doctorId: string; membership?: Membership }> {
  const memberships = getMemberships();
  const { doctors } = require('@/data/doctors');
  
  // Get all doctors in practice
  const practiceDoctors = doctors.filter(
    (d: any) => d.practiceId === practiceId
  );
  
  return practiceDoctors.map((doctor: any) => {
    const membership = memberships.find(
      (m) => m.scope === 'doctor' && m.doctorId === doctor.id
    );
    return {
      doctorId: doctor.id,
      membership,
    };
  });
}
