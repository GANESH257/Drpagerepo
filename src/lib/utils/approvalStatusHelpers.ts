/**
 * Approval Status Helpers
 * 
 * Utility functions for deriving status from approval history actions
 */

import { ApprovalHistoryRecord } from '@/types/approvals';

/**
 * Derive status from approval history action
 */
export function deriveStatusFromAction(
  action: ApprovalHistoryRecord['action']
): 'pending' | 'approved' | 'rejected' {
  if (action === 'submitted' || action === 'under_review') {
    return 'pending';
  }
  if (
    action === 'admin_approved' ||
    action === 'practice_admin_approved' ||
    action === 'final_approved'
  ) {
    return 'approved';
  }
  if (
    action === 'admin_rejected' ||
    action === 'practice_admin_rejected' ||
    action === 'final_rejected'
  ) {
    return 'rejected';
  }
  return 'pending'; // fallback
}

/**
 * Get status label for display
 */
export function getStatusLabel(
  status: 'pending' | 'approved' | 'rejected'
): string {
  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  };
  return labels[status];
}

/**
 * Get status badge variant for UI
 */
export function getStatusBadgeVariant(
  status: 'pending' | 'approved' | 'rejected'
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants = {
    pending: 'outline' as const,
    approved: 'default' as const,
    rejected: 'destructive' as const,
  };
  return variants[status];
}
