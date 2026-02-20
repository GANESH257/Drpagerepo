'use client';

export interface ContactEnquiry {
  id: string;
  createdAt: string; // ISO string
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  preferredContact?: 'email' | 'phone' | 'sms';
  consentPrivacy: boolean;
  consentSms: boolean;
}

const STORAGE_KEY = 'aip_contact_enquiries';

/**
 * Generate unique ID for enquiry
 */
function generateEnquiryId(): string {
  return `enq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all contact enquiries from localStorage
 */
export function getContactEnquiries(): ContactEnquiry[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as ContactEnquiry[];
    }
    return [];
  } catch (error) {
    console.error('Error loading contact enquiries:', error);
    return [];
  }
}

/**
 * Save contact enquiry to localStorage
 */
export function saveContactEnquiry(
  enquiry: Omit<ContactEnquiry, 'id' | 'createdAt'>
): ContactEnquiry {
  if (typeof window === 'undefined') {
    throw new Error('Cannot save enquiry on server');
  }

  try {
    const fullEnquiry: ContactEnquiry = {
      ...enquiry,
      id: generateEnquiryId(),
      createdAt: new Date().toISOString(),
    };

    // Get existing enquiries
    const existing = getContactEnquiries();
    const updated = [fullEnquiry, ...existing];

    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    return fullEnquiry;
  } catch (error) {
    console.error('Error saving contact enquiry:', error);
    throw error;
  }
}
