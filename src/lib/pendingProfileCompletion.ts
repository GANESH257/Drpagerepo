/**
 * Validation and payload building for pending profile completion (dashboard Submit).
 * Mirrors complete-profile/page.tsx logic so dashboard can send the same approval payloads.
 */

import { Doctor } from '@/types';
import { CertificationItem } from '@/types';
import { toCertificationItems } from '@/lib/utils/credentialUtils';

export function validateProfileForCompletion(doctor: Doctor): string {
  if (!doctor.fullName?.trim()) return 'Full name is required';
  if (!doctor.bio?.trim()) return 'Bio is required';
  if (!doctor.phone?.trim()) return 'Phone is required';
  if (!doctor.website?.trim()) return 'Website is required';
  if (!doctor.npi?.trim()) return 'NPI is required';
  if (!/^\d{10}$/.test((doctor.npi ?? '').trim())) return 'NPI must be 10 digits';
  if (!doctor.medicalSchool?.trim()) return 'Medical school is required';
  return '';
}

export interface PracticeForValidation {
  name?: string;
  phone?: string;
  address?: { line1?: string; line2?: string; city?: string; state?: string; zip?: string };
  address_line1?: string;
  city?: string;
  state?: string;
  zip?: string;
  locations?: Array<{
    id?: string;
    name?: string;
    address?: string;
    address_line1?: string;
    city?: string;
    state?: string;
    zip?: string;
  }>;
}

export function validatePracticeForCompletion(practice: PracticeForValidation | null): string {
  if (!practice) return 'Practice is required';
  if (!practice.name?.trim()) return 'Practice name is required';
  if (!practice.phone?.trim()) return 'Practice phone is required';
  const addr = practice.address ?? {};
  const zip = (practice.zip ?? addr.zip ?? '').toString().trim();
  if (!zip) return 'ZIP is required for the primary location.';
  const line1 = (practice.address_line1 ?? addr.line1 ?? '').toString().trim();
  const city = (practice.city ?? addr.city ?? '').toString().trim();
  const state = (practice.state ?? addr.state ?? '').toString().trim();
  const locs = practice.locations ?? [];
  const hasValidLocation =
    locs.some(
      (loc) =>
        (loc.name?.trim() || '').length > 0 &&
        (((loc.address_line1 ?? loc.address ?? '').toString().trim().length > 0) ||
          (city.length > 0 && state.length > 0))
    ) ||
    line1.length > 0 ||
    (city.length > 0 && state.length > 0);
  if (!hasValidLocation) {
    return 'At least one practice location with address is required (address line or city and state).';
  }
  return '';
}

const withName = (item: CertificationItem) => (item?.name ?? '').trim().length > 0;

export function buildDoctorPayloadForCompletion(doctor: Doctor): Record<string, unknown> {
  const boardCerts = toCertificationItems(doctor.boardCertifications ?? []).filter(withName);
  const badges = (doctor.badgesAwards ?? []).filter(withName);
  return {
    fullName: doctor.fullName,
    bio: doctor.bio,
    about: doctor.about,
    phone: doctor.phone,
    website: doctor.website,
    medicalSchool: doctor.medicalSchool,
    residency: doctor.residency,
    internship: doctor.internship,
    boardCertifications: boardCerts,
    hospitalPrivileges: doctor.hospitalPrivileges ?? [],
    statesLicensedIn: doctor.statesLicensedIn ?? [],
    npi: doctor.npi,
    badgesAwards: badges,
  };
}

export function buildPracticePayloadForCompletion(
  practice: PracticeForValidation & { id: string },
  locationsToSend: Array<{
    id?: string;
    name: string;
    address_line1?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
  }>
): Record<string, unknown> {
  const addr = practice.address ?? {};
  const line1 = (practice.address_line1 ?? addr.line1 ?? '') as string;
  const line2 = (addr.line2 ?? '') as string;
  const city = (practice.city ?? addr.city ?? '') as string;
  const state = (practice.state ?? addr.state ?? '') as string;
  const zip = (practice.zip ?? addr.zip ?? '') as string;
  return {
    name: practice.name,
    description: (practice as { description?: string }).description || undefined,
    phone: practice.phone || undefined,
    website: (practice as { website?: string }).website || undefined,
    address: { line1, line2, city, state, zip },
    address_line1: line1,
    address_line2: line2,
    city,
    state,
    zip,
  };
}

export function buildLocationsFromPractice(
  practice: PracticeForValidation & { id: string },
  primaryLat?: number | null,
  primaryLng?: number | null
): Array<{
  id?: string;
  name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
}> {
  const addr = practice.address ?? {};
  const locs = practice.locations ?? [];
  if (locs.length === 0) {
    return [
      {
        id: undefined,
        name: 'Main Office',
        address_line1: (practice.address_line1 ?? addr.line1 ?? '') as string,
        address_line2: undefined,
        city: (practice.city ?? addr.city ?? '') as string,
        state: (practice.state ?? addr.state ?? '') as string,
        zip: (practice.zip ?? addr.zip ?? '') as string,
        phone: undefined,
        latitude: primaryLat ?? undefined,
        longitude: primaryLng ?? undefined,
      },
    ];
  }
  return locs.map((loc, i) => {
    const isFirst = i === 0;
    const locZip = loc.zip && loc.zip !== '00000' ? loc.zip : '';
    return {
      id: loc.id,
      name: loc.name || 'Main Office',
      address_line1: isFirst
        ? ((practice.address_line1 ?? addr.line1 ?? loc.address_line1 ?? loc.address ?? '') as string)
        : ((loc.address_line1 ?? loc.address ?? '') as string),
      address_line2: undefined,
      city: isFirst ? ((practice.city ?? addr.city ?? loc.city ?? '') as string) : ((loc.city ?? '') as string),
      state: isFirst ? ((practice.state ?? addr.state ?? loc.state ?? '') as string) : ((loc.state ?? '') as string),
      zip: isFirst ? ((practice.zip ?? addr.zip ?? locZip ?? '') as string) : ((loc.zip ?? '') as string),
      phone: loc.phone,
      latitude: i === 0 ? primaryLat ?? undefined : undefined,
      longitude: i === 0 ? primaryLng ?? undefined : undefined,
    };
  });
}
