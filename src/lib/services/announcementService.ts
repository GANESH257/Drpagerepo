/**
 * Announcement Service - Future-ready stub for chat/announcements
 * 
 * Handles announcement creation and retrieval (no chat threads yet)
 */

import { Announcement, AnnouncementAudience } from '@/types/announcements';
import { Actor } from './permissionService';
import { assertAdmin, assertPracticeAdmin } from './permissionService';
import { makeId, nowISO } from './id';
import { PermissionDeniedError } from './errors';
import { LS_KEYS } from '@/lib/storage/keys';
import { readJSON, writeJSON } from '@/lib/storage/localStorage';
import { addNotification } from '@/lib/storage/notificationStorage';
import { doctors } from '@/data/doctors';

/**
 * Input type for creating announcements
 */
export type CreateAnnouncementInput = {
  audience: AnnouncementAudience;
  title: string;
  message: string;
};

/**
 * Create announcement
 */
export function createAnnouncement(
  actor: Actor,
  input: CreateAnnouncementInput
): Announcement {
  // Admin can send to all_doctors
  // Practice admin can send to practice_doctors(own practice only)
  
  if (input.audience.kind === 'all_doctors') {
    assertAdmin(actor);
  } else if (input.audience.kind === 'practice_doctors') {
    assertPracticeAdmin(actor, input.audience.practiceId);
    
    // Verify practice admin's practice matches audience practice
    if (actor.kind === 'doctor' && actor.practiceId !== input.audience.practiceId) {
      throw new PermissionDeniedError(
        'Practice admin can only send announcements to their own practice'
      );
    }
  } else {
    throw new PermissionDeniedError('Invalid audience type');
  }

  const now = nowISO();
  const announcement: Announcement = {
    id: makeId('ann'),
    createdAt: now,
    createdBy: {
      role: actor.kind === 'admin' ? 'admin' : 'practice_admin',
      doctorId: actor.kind === 'doctor' ? actor.doctorId : undefined,
      practiceId: actor.kind === 'doctor' ? actor.practiceId : undefined,
      email: actor.kind === 'admin' ? actor.email : actor.kind === 'doctor' ? actor.email : undefined,
    },
    audience: input.audience,
    title: input.title,
    message: input.message,
  };

  // Save announcement
  const announcements = readJSON<Announcement[]>(LS_KEYS.ANNOUNCEMENTS, []);
  announcements.push(announcement);
  writeJSON(LS_KEYS.ANNOUNCEMENTS, announcements);

  // Fan-out notifications to recipients
  if (input.audience.kind === 'all_doctors') {
    // Notify all doctors
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
          meta: { announcementId: announcement.id },
        });
      }
    });
  } else if (input.audience.kind === 'practice_doctors') {
    // Notify doctors in practice
    const practiceId = input.audience.practiceId;
    const practiceDoctors = doctors.filter(
      (d) => d.practiceId === practiceId
    );
    practiceDoctors.forEach((doctor) => {
      if (doctor.id) {
        addNotification(doctor.id, {
          id: makeId('ntf'),
          doctorId: doctor.id,
          createdAt: now,
          type: 'announcement',
          title: input.title,
          message: input.message,
          href: `/doctor/dashboard/notifications`,
          meta: { announcementId: announcement.id },
        });
      }
    });
  }

  return announcement;
}

/**
 * Get announcements relevant to a doctor
 */
export function getAnnouncementsForDoctor(
  actor: Actor,
  doctorId: string
): Announcement[] {
  const announcements = readJSON<Announcement[]>(LS_KEYS.ANNOUNCEMENTS, []);
  const doctor = doctors.find((d) => d.id === doctorId);
  
  if (!doctor) {
    return [];
  }

  // Filter announcements relevant to this doctor
  return announcements.filter((ann) => {
    if (ann.audience.kind === 'all_doctors') {
      return true;
    }
    
    if (ann.audience.kind === 'practice_doctors') {
      return doctor.practiceId === ann.audience.practiceId;
    }
    
    return false;
  });
}
