import { Doctor, OnboardingDraft, MembershipData } from '@/types';
import { saveDoctorProfile } from './doctorStorage';
import { saveMembership, completeMembershipPayment } from './membershipStorage';

/**
 * Generate deterministic doctor ID from email
 */
function generateDoctorId(email: string): string {
  // Simple hash function for deterministic ID generation
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `doctor-${Math.abs(hash)}`;
}

/**
 * Generate slug from name
 */
function generateSlug(firstName: string, lastName: string): string {
  const fullName = `${firstName}-${lastName}`.toLowerCase();
  return fullName
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Create doctor profile from onboarding data
 */
export function createDoctorFromOnboarding(
  email: string,
  draft: OnboardingDraft
): Doctor {
  if (!draft.basicDetails || !draft.selectedPlan) {
    throw new Error('Onboarding data incomplete');
  }

  const { basicDetails, selectedPlan, paymentMethod } = draft;
  const doctorId = generateDoctorId(email);
  const slug = generateSlug(basicDetails.firstName, basicDetails.lastName);
  const now = new Date().toISOString();

  // Build full name
  const fullName = `${basicDetails.firstName} ${basicDetails.lastName}, ${basicDetails.credentials}`;

  // Create doctor object
  const doctor: Doctor = {
    id: doctorId,
    slug,
    firstName: basicDetails.firstName,
    lastName: basicDetails.lastName,
    fullName,
    specialty: basicDetails.specialty,
    specialties: basicDetails.specialties || [basicDetails.specialty],
    credentials: basicDetails.credentials,
    email,
    bio: basicDetails.bio,
    locations: [
      {
        name: 'Main Office',
        address: '', // Can be filled later
        city: basicDetails.city,
        state: basicDetails.state,
        zip: basicDetails.zip,
        phone: basicDetails.phone,
      },
    ],
    insurance: [], // Can be added later
    rating: 0,
    reviewCount: 0,
    reviews: [],
    featured: false,
    verified: false,
    availability: [],
    acceptsNewPatients: basicDetails.acceptsNewPatients,
    conditionsAndServices: [],
    medicalSchool: basicDetails.medicalSchool,
    residency: basicDetails.residency,
    boardCertifications: [],
    hospitalPrivileges: [],
    statesLicensedIn: [basicDetails.state],
  };

  // Save doctor profile
  saveDoctorProfile(doctorId, doctor);

  // Create membership record
  const renewalDate =
    selectedPlan.billingCycle === 'annual'
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const membership: MembershipData = {
    planId: selectedPlan.planId,
    billingCycle: selectedPlan.billingCycle,
    status: paymentMethod ? 'active' : 'pending_payment',
    memberSince: now,
    renewalDate: renewalDate.toISOString(),
    lastPaymentMethod: paymentMethod || null,
    history: [],
  };

  saveMembership(doctorId, membership);

  // If payment method was provided, complete payment
  if (paymentMethod) {
    completeMembershipPayment(doctorId, paymentMethod);
  }

  return doctor;
}