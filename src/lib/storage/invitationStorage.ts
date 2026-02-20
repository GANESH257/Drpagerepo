import { PracticeInvitation } from '@/types/invitations';
import { LS_KEYS } from './keys';
import { readJSON, writeJSON, updateArrayItemById } from './localStorage';

/**
 * Get all practice invitations from localStorage
 */
export function getPracticeInvitations(): PracticeInvitation[] {
  return readJSON<PracticeInvitation[]>(LS_KEYS.PRACTICE_INVITATIONS, []);
}

/**
 * Save all practice invitations to localStorage
 * 
 * @param invitations Array of invitations
 */
export function savePracticeInvitations(invitations: PracticeInvitation[]): void {
  writeJSON(LS_KEYS.PRACTICE_INVITATIONS, invitations);
}

/**
 * Add new practice invitation
 * Prepends to array (newest first)
 * 
 * @param invitation Invitation to add
 */
export function addPracticeInvitation(invitation: PracticeInvitation): void {
  const existing = getPracticeInvitations();
  const updated = [invitation, ...existing];
  savePracticeInvitations(updated);
}

/**
 * Get practice invitation by ID
 * 
 * @param id Invitation ID
 * @returns Invitation or null if not found
 */
export function getPracticeInvitationById(id: string): PracticeInvitation | null {
  const invitations = getPracticeInvitations();
  return invitations.find(inv => inv.id === id) || null;
}

/**
 * Update practice invitation by ID
 * 
 * @param id Invitation ID
 * @param patch Partial update to apply
 */
export function updatePracticeInvitation(id: string, patch: Partial<PracticeInvitation>): void {
  updateArrayItemById<PracticeInvitation>(LS_KEYS.PRACTICE_INVITATIONS, id, patch);
}
