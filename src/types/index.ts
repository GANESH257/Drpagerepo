export interface Location {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  directionsUrl?: string;
  hours?: string; // Practice hours as formatted text
}

export interface Insurance {
  name: string;
  slug: string;
}

export interface Review {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
  verified?: boolean;
}

export interface BookingSlot {
  date: string;
  time: string;
  available: boolean;
}

/** Single certification, badge, or award with optional image and year */
export interface CertificationItem {
  name: string;
  imageUrl?: string;
  year?: string;
}

/** One row in Conditions & Services: a condition and the treatments/services offered for it */
export interface ConditionServiceRow {
  condition: string;
  services: string[];
}

export interface Doctor {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  fullName: string;
  specialty: string;
  specialties?: string[];
  credentials: string;
  bio: string;
  about?: string; // Long biographical text for profile page
  image?: string;
  email?: string; // Email address for dashboard login
  phone?: string; // Contact phone
  locations: Location[];
  insurance: Insurance[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  featured: boolean;
  verified: boolean;
  availability: BookingSlot[];
  acceptsNewPatients: boolean;
  /** Legacy: flat list of condition/service strings. Prefer conditionServices when available. */
  conditionsAndServices?: string[];
  /** Condition → treatments/services (two-column). Each row: one condition, multiple services. */
  conditionServices?: ConditionServiceRow[];
  // Professional Credentials
  hospitalPrivileges?: string[];
  medicalSchool?: string;
  residency?: string;
  internship?: string;
  /** Board certifications: legacy string[] or new { name, imageUrl?, year? }[] */
  boardCertifications?: (string | CertificationItem)[];
  statesLicensedIn?: string[];
  /** Badges and awards with name, optional image, year */
  badgesAwards?: CertificationItem[];
  website?: string; // Personal/practice website URL
  bookingUrl?: string; // Direct booking/contact page URL
  institutionId?: string; // FK to Institution (backward compatibility)
  practiceId?: string; // FK to Practice (V2)
  practiceName?: string; // Practice name (from API join)
  roleInPractice?: 'doctor' | 'practice_admin'; // Role within practice (V2)
  npi?: string; // National Provider Identifier (10-digit)
  profileStatus?: string; // 'active' | 'pending_profile'
  status?: string; // 'active' | 'inactive' (admin portal)
}

/**
 * Doctor override for localStorage
 * 
 * @deprecated In Step 4/5, use SafeDoctorOverride instead to prevent id/slug overrides
 * Currently allows all fields for backward compatibility with existing admin flows
 */
export type DoctorOverride = Partial<Doctor>;

/**
 * Safe doctor override type - excludes id and slug to prevent accidental overrides
 * Use this in Step 4/5 for admin flows that should not allow id/slug changes
 */
export type SafeDoctorOverride = Partial<Omit<Doctor, 'id' | 'slug'>>;

export interface AppointmentRequest {
  id: string;
  patientName: string;
  requestedDate: string;
  requestedTime: string;
  reason: string;
  insurance: string;
  status: 'New' | 'Confirmed' | 'Completed' | 'Declined';
  declinedNote?: string;
  createdAt: string;
}

/**
 * Legacy Referral type (V1) - kept for backward compatibility
 * Used by existing doctorStorage.ts and dashboard components
 * @deprecated Use Referral from './referrals' for V2
 */
export interface LegacyReferral {
  id: string;
  referringPhysicianName: string;
  referringPhysicianSpecialty: string;
  date: string;
  patientInitials: string;
  referralReason: string;
  status: 'New' | 'In Progress' | 'Closed';
  createdAt: string;
}

/**
 * Referral type alias for backward compatibility
 * Existing code (doctorStorage.ts, ReferralsSection.tsx, etc.) uses this
 * New V2 code should import Referral from './referrals' directly
 * @deprecated Use LegacyReferral explicitly or import Referral from './referrals' for V2
 * 
 * NOTE: This type conflicts with V2 Referral from './referrals'. Legacy code should use
 * LegacyReferral explicitly. V2 code must import from './referrals'.
 */
export type Referral = LegacyReferral;

export interface DoctorMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string; // ISO date string
  readAt?: string; // ISO date string
}

export interface Department {
  name: string;
  slug: string;
  description: string;
  icon?: string;
}

export interface PillarResource {
  id: string;
  title: string;
  description: string;
  type: 'download' | 'external';
  url: string; // /resources/medical-students/guides/... or external URL
  fileSize?: string; // "2.5 MB"
}

export interface StudentPillar {
  id: string;
  slug: string;
  title: string;
  description: string; // 2-3 sentences
  icon: string; // Lucide icon name
  resources: PillarResource[];
}

export interface StudentArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Full markdown/HTML content
  authorName: string;
  authorSpecialty: string;
  authorId?: string; // Link to doctor profile if exists
  category: 'study-exams' | 'wellness' | 'research' | 'residency' | 'finance';
  readingTime: number; // minutes
  publishDate: string; // ISO date
  featured?: boolean;
}

export interface NewsItem {
  id: string;
  headline: string;
  date: string;
  source: string;
  url: string;
}

export interface PublicHealthArticle {
  id: string;
  slug: string;
  title: string;
  author: string;
  topics: string[]; // Array of topic slugs
  excerpt: string;
  content: string; // Full HTML content
  readingTime: number; // minutes
  publishDate: string; // ISO date
  doctorWritten: boolean;
  authorId?: string; // Link to doctor profile if exists
}

export interface PublicHealthNewsItem {
  headline: string;
  date: string;
  source: string;
  url: string;
  excerpt?: string;
}

export interface PreventionTopic {
  id: string;
  slug: string;
  title: string;
  description: string;
  resources: Array<{
    title: string;
    url: string;
    type: 'internal' | 'external';
  }>;
}

export interface InsuranceResource {
  title: string;
  description: string;
  url: string;
  type: 'internal' | 'external';
}

export interface DoctorPublication {
  title: string;
  authorName: string;
  authorId?: string;
  year: number;
  venue: string;
  url: string;
}

export interface TrusteeBoardMember {
  id: string;
  name: string;
  role: string; // Chair, Vice Chair, Treasurer, Secretary, Trustee
  photo: string;
  bio: string; // 2-4 lines
  specialty?: string;
  location?: string;
  term?: string; // e.g., "2022-2025"
  email?: string;
}

export interface BoardMeeting {
  id: string;
  date: string; // ISO date string
  time: string; // e.g., "2:00 PM"
  timezone: string; // e.g., "PST", "EST"
  location: string;
  isVirtual: boolean;
  meetingLink?: string;
  agendaHighlights: string[]; // 3-6 items
  icsFile?: string; // Path to ICS file
}

export interface TrusteeAnnouncement {
  id: string;
  slug: string;
  title: string;
  date: string; // ISO date string
  category: 'Announcement' | 'Notice' | 'Update' | 'Policy';
  excerpt: string;
  content?: string; // Full content for detail page
  url?: string; // Internal or external URL
  source?: string;
}

export interface TrusteePolicy {
  id: string;
  title: string;
  description: string;
  category: 'Governance' | 'Compliance' | 'Operations';
  filePath: string; // Path to PDF file
  fileSize?: string; // e.g., "245 KB"
}

export interface MembershipBenefit {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
}

export interface MembershipPlan {
  id: string;
  name: string;
  badge?: string; // e.g., "Most Popular"
  pricing: {
    monthly: string | number;
    annual: string | number;
  };
  description?: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
}

export interface MembershipPolicyItem {
  id: string;
  title: string;
  body: string;
}

export interface MembershipPolicy {
  category: string;
  items: MembershipPolicyItem[];
}

export interface MembershipFAQ {
  question: string;
  answer: string;
}

export interface HomeStat {
  value: string;
  label: string;
}

export interface MemberBenefit {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface CommunityComment {
  id: string;
  author: string;
  role: 'patient' | 'physician';
  comment: string;
  rating?: number;
  doctorName?: string;
  doctorSpecialty?: string;
  specialty?: string;
  date?: string;
}

export interface GlobalMedicalEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  isOnline: boolean;
  description: string;
  url?: string;
}

export interface HomeFAQ {
  question: string;
  answer: string;
}

export interface MembershipTransaction {
  id: string;
  date: string; // ISO date
  amount: number;
  plan: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface MembershipData {
  planId: string; // 'basic' | 'professional' | 'premier'
  billingCycle: 'monthly' | 'annual';
  status: 'active' | 'pending_payment' | 'expired';
  memberSince: string; // ISO date
  renewalDate: string; // ISO date
  lastPaymentMethod: 'paypal' | 'card' | null;
  history: MembershipTransaction[];
}

export interface OnboardingDraft {
  step: 1 | 2 | 3 | 4;
  basicDetails?: {
    firstName: string;
    lastName: string;
    credentials: string;
    specialty: string;
    phone: string;
    city: string;
    state: string;
    zip: string;
    acceptsNewPatients: boolean;
    bio: string;
    medicalSchool?: string;
    residency?: string;
    specialties?: string[];
  };
  selectedPlan?: {
    planId: string;
    billingCycle: 'monthly' | 'annual';
  };
  paymentMethod?: 'paypal' | 'card';
}

export interface ApplicationDraft {
  step: 1 | 2 | 3 | 4;
  basicDetails?: {
    fullName: string;
    credentials: string;
    specialty: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    npi: string;
    practiceName?: string;
    website?: string;
    messageToAdmin?: string;
    practiceSelection?: {
      type: 'existing';
      practiceId: string;
    } | {
      type: 'new';
      practiceName: string;
      website?: string;
    };
  };
  selectedPlan?: {
    planId: string;
    billingCycle: 'monthly' | 'annual';
  };
  paymentMethod?: 'paypal' | 'card';
  paymentDetails?: {
    cardName?: string;
    billingZip?: string;
  };
}

export interface JoinRequest {
  id: string; // UUID
  submittedAt: string; // ISO date
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  applicant: {
    email: string;
    fullName: string;
    credentials: string;
    specialty: string;
    phone: string;
    city: string;
    state: string;
    practiceName?: string;
    website?: string;
    messageToAdmin?: string;
    practiceSelection?: {
      type: 'existing';
      practiceId: string;
    } | {
      type: 'new';
      practiceName: string;
      website?: string;
    };
  };
  plan: {
    planId: string;
    billingCycle: 'monthly' | 'annual';
  };
  paymentMethod: 'paypal' | 'card';
  paymentDetails?: {
    cardName?: string;
    billingZip?: string;
  };
}

export interface Institution {
  id: string;
  slug: string;
  name: string;
  description: string;
  phone: string;
  email?: string;
  website?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  specialties: string[]; // Derived from doctors
  doctorIds: string[]; // References to doctor IDs
  logo?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// V2 Type Exports
export * from './practice';
export * from './approvals';
export * from './referrals';
export * from './notifications';
export * from './invitations';
export * from './membership';
export * from './announcements';
