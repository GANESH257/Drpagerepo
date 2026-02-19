import { Notification } from '@/types/notifications';
import { getNotificationKey } from './keys';
import { readJSON, writeJSON } from './localStorage';

/**
 * Get notifications for a doctor
 * Returns sorted by createdAt desc (newest first)
 * 
 * @param doctorId Doctor ID
 */
export function getNotifications(doctorId: string): Notification[] {
  const notifications = readJSON<Notification[]>(getNotificationKey(doctorId), []);
  // Sort by createdAt desc (newest first)
  return notifications.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Add notification for a doctor
 * Prepends to array (newest first), capped at 200 items
 * 
 * @param doctorId Doctor ID
 * @param notification Notification to add
 */
export function addNotification(doctorId: string, notification: Notification): void {
  const existing = getNotifications(doctorId);
  const updated = [notification, ...existing];
  
  // Cap at 200 items (keep latest)
  const capped = updated.slice(0, 200);
  
  writeJSON(getNotificationKey(doctorId), capped);
}

/**
 * Mark notification as read
 * 
 * @param doctorId Doctor ID
 * @param notificationId Notification ID to mark as read
 */
export function markNotificationRead(doctorId: string, notificationId: string): void {
  const notifications = getNotifications(doctorId);
  const updated = notifications.map((n) =>
    n.id === notificationId && !n.readAt
      ? { ...n, readAt: new Date().toISOString() }
      : n
  );
  writeJSON(getNotificationKey(doctorId), updated);
}
