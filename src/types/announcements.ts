/**
 * Announcement types for V2 (future-ready for chat)
 */

/**
 * Announcement audience types
 */
export type AnnouncementAudience =
  | { kind: 'all_doctors' }
  | { kind: 'practice_doctors'; practiceId: string };

/**
 * Announcement entity
 */
export interface Announcement {
  id: string; // "ann-..."
  createdAt: string;
  createdBy: {
    role: 'admin' | 'practice_admin';
    doctorId?: string;
    practiceId?: string;
    email?: string;
  };
  audience: AnnouncementAudience;
  title: string;
  message: string;
}
