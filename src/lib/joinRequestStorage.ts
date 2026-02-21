import { ApplicationDraft, JoinRequest } from '@/types';

/**
 * Save signup email to localStorage
 */
export function saveJoinEmail(email: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('aip_join_email', email);
  } catch (error) {
    console.error('Error saving join email:', error);
  }
}

/**
 * Get signup email from localStorage
 */
export function getJoinEmail(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem('aip_join_email');
  } catch (error) {
    console.error('Error getting join email:', error);
    return null;
  }
}

/**
 * Clear signup email from localStorage
 */
export function clearJoinEmail(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('aip_join_email');
  } catch (error) {
    console.error('Error clearing join email:', error);
  }
}

/**
 * Save application draft to localStorage
 */
export function saveApplicationDraft(draft: ApplicationDraft): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('aip_join_request_draft', JSON.stringify(draft));
  } catch (error) {
    console.error('Error saving application draft:', error);
  }
}

/**
 * Load application draft from localStorage
 */
export function loadApplicationDraft(): ApplicationDraft | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem('aip_join_request_draft');
    if (stored) {
      return JSON.parse(stored) as ApplicationDraft;
    }
    return null;
  } catch (error) {
    console.error('Error loading application draft:', error);
    return null;
  }
}

/**
 * Clear application draft from localStorage
 */
export function clearApplicationDraft(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('aip_join_request_draft');
  } catch (error) {
    console.error('Error clearing application draft:', error);
  }
}

/**
 * NOTE: submitJoinRequest, getJoinRequests, getJoinRequestById, and updateJoinRequestStatus
 * have been removed. Join request submission is now handled directly via API in ApplicationReview.tsx.
 * Only draft and email storage functions remain for the application flow.
 */
