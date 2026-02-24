/**
 * Approval Type Labels and Categories
 * 
 * Maps ApprovalType to user-friendly labels for filters and display
 */

import { ApprovalType } from '@/types/approvals';

/**
 * User-friendly labels for approval types
 */
export const APPROVAL_TYPE_LABELS: Record<ApprovalType, string> = {
  new_practice_with_admin_doctor: 'Practice Create',
  practice_admin_profile_practice_completion: 'PA Profile & Practice Completion',
  doctor_profile_completion: 'Doctor Profile Completion',
  doctor_profile_edit: 'Doctor Profile Edit',
  practice_admin_profile_edit: 'Practice Admin Profile Edit',
  doctor_insurance_edit: 'Doctor Insurance & Services',
  practice_admin_insurance_edit: 'Practice Admin Insurance & Services',
  practice_edit_request: 'Practice Edit',
  practice_admin_practice_profile_edit: 'Practice Profile Edit',
  practice_admin_practice_locations_edit: 'Practice Locations Edit',
  doctor_join_practice: 'Doctor Join Practice',
  practice_doctor_add_request: 'Roster Change',
  practice_doctor_remove_request: 'Roster Change',
  practice_location_change_request: 'Practice Edit',
  practice_insurance_services_change_request: 'Practice Edit',
  practice_location_add_request: 'Location Add',
  practice_location_edit_request: 'Location Edit',
  practice_location_remove_request: 'Location Remove',
};

/**
 * Get user-friendly label for approval type
 */
export function getApprovalTypeLabel(type: ApprovalType): string {
  return APPROVAL_TYPE_LABELS[type] || 'Other';
}

/**
 * Approval type categories for filter grouping
 */
export type ApprovalTypeCategory =
  | 'practice_create'
  | 'practice_edit'
  | 'doctor_join_practice'
  | 'doctor_edit'
  | 'roster_change'
  | 'other';

/**
 * Map approval type to category
 */
export function getApprovalTypeCategory(type: ApprovalType): ApprovalTypeCategory {
  switch (type) {
    case 'new_practice_with_admin_doctor':
      return 'practice_create';
    case 'practice_admin_profile_practice_completion':
      return 'practice_edit';
    case 'doctor_profile_completion':
    case 'doctor_profile_edit':
    case 'practice_admin_profile_edit':
      return 'doctor_edit';
    case 'practice_edit_request':
    case 'practice_admin_practice_profile_edit':
    case 'practice_admin_practice_locations_edit':
    case 'practice_location_change_request':
    case 'practice_insurance_services_change_request':
    case 'practice_location_add_request':
    case 'practice_location_edit_request':
    case 'practice_location_remove_request':
      return 'practice_edit';
    case 'doctor_join_practice':
      return 'doctor_join_practice';
    case 'practice_doctor_add_request':
    case 'practice_doctor_remove_request':
      return 'roster_change';
    default:
      return 'other';
  }
}

/**
 * Filter-friendly type options for dropdowns
 */
export interface ApprovalTypeOption {
  value: ApprovalType | 'all';
  label: string;
  category?: ApprovalTypeCategory;
}

/**
 * Get all approval type options for filter dropdowns
 */
export function getApprovalTypeOptions(): ApprovalTypeOption[] {
  const types: ApprovalType[] = [
    'new_practice_with_admin_doctor',
    'practice_admin_profile_practice_completion',
    'doctor_profile_completion',
    'doctor_profile_edit',
    'practice_admin_profile_edit',
    'doctor_insurance_edit',
    'practice_admin_insurance_edit',
    'practice_edit_request',
    'practice_admin_practice_profile_edit',
    'practice_admin_practice_locations_edit',
    'doctor_join_practice',
    'practice_doctor_add_request',
    'practice_doctor_remove_request',
    'practice_location_change_request',
    'practice_insurance_services_change_request',
    'practice_location_add_request',
    'practice_location_edit_request',
    'practice_location_remove_request',
  ];

  return [
    { value: 'all', label: 'All Types' },
    ...types.map((type) => ({
      value: type,
      label: getApprovalTypeLabel(type),
      category: getApprovalTypeCategory(type),
    })),
  ];
}
