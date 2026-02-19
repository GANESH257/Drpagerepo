/**
 * Centralized localStorage keys for AIP application
 * 
 * This file provides a single source of truth for all localStorage keys.
 * Use these constants instead of hardcoding strings throughout the codebase.
 */

export const LS_KEYS = {
  // Doctor storage
  DOCTOR_OVERRIDES: 'aip_doctor_overrides',
  DELETED_DOCTORS: 'aip_deleted_doctors',

  // Practice storage (V2)
  PRACTICE_OVERRIDES: 'aip_practice_overrides',
  DELETED_PRACTICES: 'aip_deleted_practices',

  // Institution storage (backward compatibility - keep for V1)
  INSTITUTION_OVERRIDES: 'aip_institution_overrides',
  DELETED_INSTITUTIONS: 'aip_deleted_institutions',

  // Approval system (V2)
  APPROVAL_REQUESTS: 'aip_approval_requests',
  APPROVAL_HISTORY: 'aip_approval_history',

  // Referrals (V2)
  REFERRALS: 'aip_referrals',
  REFERRAL_HISTORY: 'aip_referral_history',

  // Practice invitations (V2)
  PRACTICE_INVITATIONS: 'aip_practice_invitations',

  // Notifications (V2) - prefix, append doctorId
  NOTIFICATIONS_PREFIX: 'aip_notifications_',

  // Created practices (V2) - practices created via approval workflow
  CREATED_PRACTICES: 'aip_created_practices',

  // Memberships (V2)
  MEMBERSHIPS: 'aip_memberships',

  // Announcements (V2)
  ANNOUNCEMENTS: 'aip_announcements',
} as const;

/**
 * Get notification key for a specific doctor
 */
export function getNotificationKey(doctorId: string): string {
  return `${LS_KEYS.NOTIFICATIONS_PREFIX}${doctorId}`;
}
