import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Announcement, AnnouncementAudience } from '@/types/announcements';
import { Actor } from './permissionService';
import { assertAdmin, assertPracticeAdmin } from './permissionService';
import { makeId, nowISO } from './id';
import { PermissionDeniedError } from './errors';
import { addNotification } from '@/lib/storage/notificationStorage';
import { doctors } from '@/data/doctors';

const ANNOUNCEMENTS_COLLECTION = 'announcements';

/**
 * Input type for creating announcements
 */
export type CreateAnnouncementInput = {
  audience: AnnouncementAudience;
  title: string;
  message: string;
};

/**
 * Create announcement in Firestore
 */
export async function createAnnouncement(
  actor: Actor,
  input: CreateAnnouncementInput
): Promise<Announcement> {
  if (input.audience.kind === 'all_doctors') {
    assertAdmin(actor);
  } else if (input.audience.kind === 'practice_doctors') {
    assertPracticeAdmin(actor, input.audience.practiceId);

    if (actor.kind === 'doctor' && actor.practiceId !== input.audience.practiceId) {
      throw new PermissionDeniedError(
        'Practice admin can only send announcements to their own practice'
      );
    }
  } else {
    throw new PermissionDeniedError('Invalid audience type');
  }

  const now = new Date().toISOString();
  const announcementData = {
    createdAt: now,
    createdBy: {
      role: actor.kind === 'admin' ? 'admin' : 'practice_admin',
      doctorId: actor.kind === 'doctor' ? actor.doctorId : null,
      practiceId: actor.kind === 'doctor' ? actor.practiceId : null,
      email: actor.kind === 'admin' ? actor.email : actor.kind === 'doctor' ? actor.email : null,
    },
    audience: input.audience,
    title: input.title,
    message: input.message,
    serverTimestamp: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, ANNOUNCEMENTS_COLLECTION), announcementData);

  // Also send legacy notifications for now to ensure they show up in the Bell icon
  if (input.audience.kind === 'all_doctors') {
    doctors.forEach((doctor) => {
      if (doctor.id) {
        addNotification(doctor.id, {
          id: makeId('ntf'),
          doctorId: doctor.id,
          createdAt: now,
          type: 'announcement',
          title: input.title,
          message: input.message,
          href: `/doctor/dashboard/notifications`,
          meta: { announcementId: docRef.id },
        });
      }
    });
  }

  return { id: docRef.id, ...announcementData } as Announcement;
}

/**
 * Subscribe to announcements relevant to a doctor
 */
export function subscribeToAnnouncements(
  doctorId: string,
  practiceId: string | undefined,
  callback: (announcements: Announcement[]) => void
) {
  // Query for "all_doctors" or specifically for this doctor's practice
  const q = query(
    collection(db, ANNOUNCEMENTS_COLLECTION),
    orderBy('serverTimestamp', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const all = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Announcement[];

    // Filter on client side for now to handle complex audience matching easily
    const filtered = all.filter(ann => {
      if (ann.audience.kind === 'all_doctors') return true;
      if (ann.audience.kind === 'practice_doctors' && practiceId && ann.audience.practiceId === practiceId) return true;
      return false;
    });

    callback(filtered);
  });
}
