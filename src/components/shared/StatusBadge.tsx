'use client';

import { cn } from '@/lib/utils';

/** Maps status strings to aip-doctor-portal-ui badge-* classes. Use for approvals, referrals, members, etc. */
const STATUS_TO_CLASS: Record<string, string> = {
  accepted: 'badge-accepted',
  approved: 'badge-accepted',
  final_approved: 'badge-accepted',
  sent: 'badge-sent',
  pending: 'badge-pending',
  submitted: 'badge-sent',
  under_review: 'badge-pending',
  completed: 'badge-completed',
  rejected: 'badge-rejected',
  final_rejected: 'badge-rejected',
  live: 'badge-live',
  review: 'badge-review',
  active: 'badge-accepted',
  inactive: 'badge-completed',
  suspended: 'badge-pending',
  banned: 'badge-rejected',
  considering: 'badge-sent',
  no_show: 'badge-completed',
  cancelled: 'badge-rejected',
};

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Pending',
  under_review: 'Under Review',
  approved: 'Approved',
  final_approved: 'Approved',
  rejected: 'Rejected',
  final_rejected: 'Rejected',
  accepted: 'Accepted',
  sent: 'Sent',
  pending: 'Pending',
  completed: 'Completed',
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
  banned: 'Banned',
  considering: 'Considering',
  no_show: 'No Show',
  cancelled: 'Cancelled',
};

function normalizeStatus(s: string): string {
  return String(s || '').toLowerCase().replace(/\s+/g, '_');
}

function toLabel(s: string): string {
  const key = normalizeStatus(s);
  return STATUS_LABELS[key] ?? (s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' '));
}

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const key = normalizeStatus(status);
  const badgeClass = STATUS_TO_CLASS[key] ?? 'badge-pending';
  const displayLabel = label ?? toLabel(status);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        badgeClass,
        className
      )}
    >
      {displayLabel}
    </span>
  );
}
