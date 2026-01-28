import { OnboardingDraft } from '@/types';

/**
 * Get localStorage key for onboarding draft
 */
function getOnboardingKey(email: string): string {
  return `aip_onboarding_draft_${email}`;
}

/**
 * Save onboarding draft to localStorage
 */
export function saveOnboardingDraft(email: string, data: OnboardingDraft): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(getOnboardingKey(email), JSON.stringify(data));
  } catch (error) {
    console.error('Error saving onboarding draft:', error);
  }
}

/**
 * Load onboarding draft from localStorage
 */
export function loadOnboardingDraft(email: string): OnboardingDraft | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(getOnboardingKey(email));
    if (stored) {
      return JSON.parse(stored) as OnboardingDraft;
    }
    return null;
  } catch (error) {
    console.error('Error loading onboarding draft:', error);
    return null;
  }
}

/**
 * Clear onboarding draft from localStorage
 */
export function clearOnboardingDraft(email: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(getOnboardingKey(email));
  } catch (error) {
    console.error('Error clearing onboarding draft:', error);
  }
}