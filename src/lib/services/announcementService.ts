import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Announcement, AnnouncementAudience } from '@/types/announcements';
import { Actor, assertAdmin, assertPracticeAdmin } from './permissionService';
import { makeId } from './id';
import { PermissionDeniedError } from './errors';
import { addNotification } from '@/lib/storage/notificationStorage';
import { doctors } from '@/data/doctors';

const ANNOUNCEMENTS_COLLECTION = 'announcements';
const ANNOUNCEMENT_READ_COLLECTION = 'announcement_read_status';

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
  } else if (input.audience.kind === 'specialty_doctors') {
    assertAdmin(actor);
  } else if (input.audience.kind === 'specific_doctors') {
    assertAdmin(actor);
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

  // Send legacy notifications to ensure they show up in the Bell icon
  const recipientDoctors = doctors.filter(doctor => {
    if (!doctor.id) return false;
    if (input.audience.kind === 'all_doctors') return true;
    if (input.audience.kind === 'practice_doctors') return doctor.practiceId === input.audience.practiceId;
    if (input.audience.kind === 'specialty_doctors') return doctor.specialty === input.audience.specialty;
    if (input.audience.kind === 'specific_doctors') return input.audience.doctorIds.includes(doctor.id);
    return false;
  });

  recipientDoctors.forEach((doctor) => {
    addNotification(doctor.id!, {
      id: makeId('ntf'),
      doctorId: doctor.id!,
      createdAt: now,
      type: 'announcement',
      title: input.title,
      message: input.message,
      href: `/doctor/dashboard/notifications`,
      meta: { announcementId: docRef.id },
    });
  });

  return { id: docRef.id, ...announcementData } as Announcement;
}

/**
 * Marks an announcement as read for a specific user
 */
export async function markAnnouncementAsRead(userId: string, announcementId: string): Promise<void> {
  try {
    const q = query(
      collection(db, ANNOUNCEMENT_READ_COLLECTION),
      where('userId', '==', userId),
      where('announcementId', '==', announcementId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      await addDoc(collection(db, ANNOUNCEMENT_READ_COLLECTION), {
        userId,
        announcementId,
        readAt: Timestamp.now(),
      });
    }
  } catch (err) {
    console.error('[markAnnouncementAsRead] Failed:', err);
  }
}

/**
 * Subscribe to announcements relevant to a doctor, including read status
 */
export function subscribeToAnnouncements(
  doctorId: string,
  practiceId: string | undefined,
  callback: (announcements: (Announcement & { isRead?: boolean })[]) => void
) {
  // Query announcements
  const qAnn = query(
    collection(db, ANNOUNCEMENTS_COLLECTION),
    orderBy('serverTimestamp', 'desc')
  );

  // Query read status for this doctor
  const qRead = query(
    collection(db, ANNOUNCEMENT_READ_COLLECTION),
    where('userId', '==', doctorId)
  );

  let announcements: Announcement[] = [];
  let readIds: Set<string> = new Set();

  const merge = () => {
    const filtered = announcements.filter(ann => {
      if (ann.audience.kind === 'all_doctors') return true;
      if (ann.audience.kind === 'practice_doctors' && practiceId && ann.audience.practiceId === practiceId) return true;
      if (ann.audience.kind === 'specialty_doctors') {
        const docSpecialty = doctors.find(d => d.id === doctorId)?.specialty;
        return docSpecialty === ann.audience.specialty;
      }
      if (ann.audience.kind === 'specific_doctors') return ann.audience.doctorIds.includes(doctorId);
      return false;
    });

    const result = filtered.map(ann => ({
      ...ann,
      isRead: readIds.has(ann.id)
    }));

    callback(result);
  };

  const unsubAnn = onSnapshot(qAnn, (snapshot) => {
    announcements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Announcement[];
    merge();
  });

  const unsubRead = onSnapshot(qRead, (snapshot) => {
    readIds = new Set(snapshot.docs.map(doc => doc.data().announcementId));
    merge();
  });

  return () => {
    unsubAnn();
    unsubRead();
  };
}
