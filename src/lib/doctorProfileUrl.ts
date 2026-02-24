/**
 * URL for public doctor profile. Use with static export (no /doctors/[slug]).
 */
export function getDoctorProfileUrlBySlug(slug: string): string {
  if (!slug) return '/doctors';
  return `/doctors/profile?slug=${encodeURIComponent(slug)}`;
}

export function getDoctorProfileUrlById(id: string): string {
  if (!id) return '/doctors';
  return `/doctors/profile?id=${encodeURIComponent(id)}`;
}

/**
 * Build profile URL when you have both slug and id (e.g. from API).
 * Uses slug if present, otherwise id.
 */
export function getDoctorProfileUrl(doctor: { slug?: string | null; id: string }): string {
  const slug = doctor.slug?.trim();
  return slug ? getDoctorProfileUrlBySlug(slug) : getDoctorProfileUrlById(doctor.id);
}
