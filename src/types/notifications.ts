/**
 * Notification types
 */
export type NotificationType =
  | 'approval_update'
  | 'referral_received'
  | 'referral_status_changed'
  | 'practice_roster_update'
  | 'announcement';

/**
 * Notification - Per-doctor notifications
 */
export interface Notification {
  id: string; // "ntf-..."
  doctorId: string;
  createdAt: string;
  readAt?: string;

  type: NotificationType;
  title: string;
  message: string;

  href?: string;
  meta?: Record<string, any>;
}
