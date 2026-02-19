/**
 * Visibility service
 * 
 * Handles contact visibility rules based on actor role
 */

import { Doctor, Practice } from '@/types';
import { Actor } from './permissionService';
import { canViewDoctorPrivateContact } from './permissionService';

/**
 * Contact card result
 */
export type ContactCard = {
  mode: 'public' | 'private';
  displayName: string;
  phone?: string;
  email?: string;
  website?: string;
  source: 'doctor' | 'practice';
};

/**
 * Get practice public contact information
 */
export function getPracticePublicContact(practice: Practice): {
  phone: string;
  email?: string;
  website?: string;
} {
  return {
    phone: practice.phone,
    email: practice.email,
    website: practice.website,
  };
}

/**
 * Get doctor contact information based on visibility rules
 * 
 * For PUBLIC: returns practice contact only
 * For LOGGED-IN DOCTOR/ADMIN: returns doctor personal contact if available, else practice contact
 */
export function getDoctorPublicContact(
  doctor: Doctor,
  practice: Practice
): { phone: string; email?: string } {
  // For public users, return practice contact only
  // This function is called with actor context, but we'll handle it in getContactCard
  // For now, return practice contact as default
  return {
    phone: practice.phone,
    email: practice.email,
  };
}

/**
 * Get contact card with visibility rules applied
 * 
 * @param actor Current actor
 * @param doctor Target doctor
 * @param practice Doctor's practice
 */
export function getContactCard(
  actor: Actor,
  doctor: Doctor,
  practice: Practice
): ContactCard {
  const canViewPrivate = canViewDoctorPrivateContact(actor, doctor);

  if (canViewPrivate) {
    // Logged-in doctor or admin: show doctor's personal contact if available
    const doctorPhone =
      doctor.locations?.[0]?.phone || practice.phone;
    const doctorEmail = doctor.email || practice.email;

    return {
      mode: 'private',
      displayName: doctor.fullName,
      phone: doctorPhone,
      email: doctorEmail,
      website: doctor.website || practice.website,
      source: doctorPhone === practice.phone ? 'practice' : 'doctor',
    };
  }

  // Public: show practice contact only
  return {
    mode: 'public',
    displayName: doctor.fullName,
    phone: practice.phone,
    email: practice.email,
    website: practice.website,
    source: 'practice',
  };
}
