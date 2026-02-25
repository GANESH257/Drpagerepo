/**
 * Build display full name from first, optional middle, last, and optional credentials.
 * Used for Edit Profile, joining form, and API payloads.
 */
export function formatFullName(
  firstName: string,
  middleName?: string | null,
  lastName?: string,
  credentials?: string | null
): string {
  const parts = [firstName, middleName, lastName].filter(Boolean).join(' ').trim();
  return credentials ? `${parts}, ${credentials}` : parts;
}
