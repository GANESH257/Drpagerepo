/**
 * ID generation and utility helpers
 */

import { slugify as baseSlugify } from '@/lib/slugify';

/**
 * Get current ISO timestamp
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Generate a unique ID with prefix
 * Format: {prefix}-{timestamp}-{random}
 * 
 * @param prefix Prefix for the ID (e.g., 'apr', 'ref', 'mem')
 */
export function makeId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Create URL-friendly slug from string
 */
export function slugify(input: string): string {
  return baseSlugify(input);
}

/**
 * Normalize email address (lowercase, trim)
 */
export function normalizeEmail(email?: string): string | undefined {
  if (!email) return undefined;
  return email.toLowerCase().trim();
}
