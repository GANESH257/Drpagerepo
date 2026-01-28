/**
 * Password utilities for doctor authentication
 * Uses Web Crypto API for simple hashing (SHA-256)
 */

/**
 * Hash a password using SHA-256
 */
export async function hashPassword(password: string): Promise<string> {
  if (typeof window === 'undefined') {
    // Server-side: return a placeholder (shouldn't happen in static export)
    return password;
  }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('Error hashing password:', error);
    // Fallback: simple hash (not secure, but works for demo)
    return btoa(password).split('').reverse().join('');
  }
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

/**
 * Generate a random password
 */
export function generateRandomPassword(length: number = 12): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Reset password for a doctor - generates new password and returns it
 */
export async function resetPassword(email: string): Promise<string> {
  const newPassword = generateRandomPassword(12);
  await setPassword(email, newPassword);
  return newPassword;
}

/**
 * Set password for a doctor (hashes and stores)
 */
export async function setPassword(email: string, password: string): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const hash = await hashPassword(password);
    const passwords = getPasswords();
    passwords[email.toLowerCase()] = hash;
    localStorage.setItem('aip_doctor_passwords', JSON.stringify(passwords));
  } catch (error) {
    console.error('Error setting password:', error);
  }
}

/**
 * Get all passwords from localStorage
 */
export function getPasswords(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem('aip_doctor_passwords');
    if (stored) {
      return JSON.parse(stored) as Record<string, string>;
    }
    return {};
  } catch (error) {
    console.error('Error loading passwords:', error);
    return {};
  }
}

/**
 * Get password hash for a specific email
 */
export function getPasswordHash(email: string): string | null {
  const passwords = getPasswords();
  return passwords[email.toLowerCase()] || null;
}

/**
 * Check if a password matches for a given email
 */
export async function checkPassword(email: string, password: string): Promise<boolean> {
  const hash = getPasswordHash(email);
  if (!hash) {
    // No custom password set, check against default
    return password === 'AIP@12345';
  }
  return verifyPassword(password, hash);
}
