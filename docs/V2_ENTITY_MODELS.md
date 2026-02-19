# V2 Entity Models & Data Structures

## Overview

This document defines all entity models, data structures, and TypeScript types for AIP v2. Use this as a reference when implementing new features or updating existing code.

**Last Updated**: January 29, 2026  
**Version**: 2.0

---

## Core Entities

### 1. Practice

**Primary Entity** - The main directory entity in v2.

```typescript
interface Practice {
  // Identifiers
  id: string;
  slug: string;
  name: string;

  // Description
  description: string;

  // Contact Information
  phone: string;
  email: string;
  website?: string;

  // Address
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string; // Default: 'US'
  };

  // Location (for search/radius)
  location: {
    lat: number;
    lng: number;
  };

  // Media
  logo?: string;
  images: string[];

  // Practice Data
  specialties: string[]; // Derived from doctors OR editable by practice admin
  services: string[]; // Practice-level services
  insurance: Insurance[]; // Practice-level insurance

  // Locations (multiple locations per practice)
  locationList: PracticeLocation[];

  // Relationships
  doctorIds: string[]; // Array of doctor IDs belonging to this practice

  // Metadata
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
```

**PracticeLocation**:
```typescript
interface PracticeLocation {
  id: string;
  name: string; // e.g., "Main Office", "Downtown Clinic"
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
  phone?: string;
  hours?: string; // e.g., "Mon-Fri: 9am-5pm"
  isPrimary: boolean;
}
```

**Storage**:
- Seed: `src/data/practices.ts`
- Overrides: `aip_practice_overrides` (localStorage)
- Deleted: `aip_deleted_practices` (localStorage)

---

### 2. Doctor

**Secondary Entity** - Now practice-linked.

```typescript
interface Doctor {
  // Identifiers
  id: string;
  slug: string;
  
  // Practice Relationship (REQUIRED in v2)
  practiceId: string; // Must reference existing practice

  // Personal Information
  firstName: string;
  lastName: string;
  fullName: string;
  credentials: string[]; // e.g., ['M.D.', 'F.A.C.S.']
  
  // Profile
  bio: string;
  profileImage?: string;
  
  // Professional
  specialty: string; // Primary specialty
  specialties: string[]; // All specialties
  boardCertifications: string[];
  medicalSchool?: string;
  residency?: string;
  yearsOfExperience?: number;
  
  // Contact (Personal - visible only to logged-in doctors)
  email: string;
  phone?: string;
  website?: string;
  
  // Location
  city?: string;
  state?: string;
  zip?: string;
  
  // Social Media
  linkedIn?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  
  // Practice Data (legacy - now managed at practice level)
  locations: Location[]; // Deprecated in v2, use practice.locationList
  insurance: Insurance[]; // Deprecated in v2, use practice.insurance
  
  // Services
  conditionsAndServices: string[];
  
  // Status
  verified: boolean;
  featured: boolean;
  acceptsNewPatients: boolean;
  
  // Languages
  languages: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}
```

**Changes from v1**:
- ✅ Added `practiceId: string` (required)
- ⚠️ `locations` deprecated (use `practice.locationList`)
- ⚠️ `insurance` deprecated (use `practice.insurance`)
- ✅ Personal contacts now visibility-controlled

**Storage**:
- Seed: `src/data/doctors.ts`
- Overrides: `aip_doctor_overrides` (localStorage)
- Deleted: `aip_deleted_doctors` (localStorage)

---

### 3. Practice Roles

**New Entity** - Manages roles within practices.

```typescript
interface PracticeRoles {
  [practiceId: string]: {
    adminDoctorId: string; // Practice Admin doctor ID
    doctorRoles: {
      [doctorId: string]: 'practice_admin' | 'doctor';
    };
  };
}
```

**Example**:
```typescript
{
  "practice-123": {
    adminDoctorId: "doctor-456",
    doctorRoles: {
      "doctor-456": "practice_admin",
      "doctor-789": "doctor",
      "doctor-101": "doctor"
    }
  }
}
```

**Storage**:
- `aip_practice_roles` (localStorage)

**Helper Functions**:
```typescript
function isPracticeAdmin(doctorId: string, practiceId: string): boolean
function getDoctorRole(doctorId: string, practiceId: string): 'practice_admin' | 'doctor' | null
function setPracticeAdmin(practiceId: string, doctorId: string): void
function addDoctorToPractice(practiceId: string, doctorId: string, role: 'practice_admin' | 'doctor'): void
```

---

### 4. Approval Request

**Unified Entity** - All approval workflows.

```typescript
type ApprovalRequestType =
  | 'doctor_join_existing_practice'
  | 'practice_create_with_admin'
  | 'practice_edit'
  | 'doctor_add_to_practice'
  | 'practice_location_change'
  | 'practice_insurance_change'
  | 'practice_services_change';

interface ApprovalRequest {
  id: string;
  type: ApprovalRequestType;
  
  // Requester
  requestedBy: string; // doctorId or email
  
  // Practice Context
  practiceId?: string; // Required for most types
  
  // Proposed Changes
  payload: {
    // Varies by type:
    // - doctor_join_existing_practice: { doctor: Partial<Doctor>, practiceId: string }
    // - practice_create_with_admin: { practice: Partial<Practice>, doctor: Partial<Doctor> }
    // - practice_edit: { changes: Partial<Practice> }
    // - practice_location_change: { location: PracticeLocation, action: 'add' | 'edit' | 'remove' }
    // etc.
    [key: string]: any;
  };
  
  // Approval Status
  adminStatus: 'pending' | 'approved' | 'rejected';
  practiceAdminStatus?: 'pending' | 'approved' | 'rejected'; // When applicable
  
  // Notes & Reasons
  adminNotes?: string;
  practiceAdminNotes?: string;
  rejectionReason?: string;
  rejectedBy?: 'admin' | 'practice_admin';
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  adminReviewedAt?: string;
  practiceAdminReviewedAt?: string;
}
```

**Storage**:
- `aip_approval_requests` (localStorage) - Array of ApprovalRequest

**Status Logic**:
- Both approvals required: `adminStatus === 'approved' && practiceAdminStatus === 'approved'`
- Admin-only: `adminStatus === 'approved'`
- Rejection: Either status === 'rejected'

---

### 5. Practice Invitation

**New Entity** - Practice Admin invites doctors.

```typescript
interface PracticeInvitation {
  id: string;
  practiceId: string;
  email: string;
  invitedBy: string; // Practice Admin doctorId
  
  // Invitation Details
  doctorName?: string; // If known
  message?: string;
  
  // Status
  status: 'sent' | 'accepted' | 'expired' | 'cancelled';
  
  // Invitation Link
  token: string; // Unique token for invitation link
  
  // Timestamps
  createdAt: string;
  expiresAt: string; // Default: 30 days
  acceptedAt?: string;
}
```

**Storage**:
- `aip_practice_invitations` (localStorage) - Array of PracticeInvitation

**Invitation Flow**:
1. Practice Admin creates invitation → status: 'sent'
2. Doctor clicks link → status: 'accepted'
3. Creates join request with practice preselected
4. Approval flow begins

---

### 6. Referral

**Enhanced Entity** - Expanded referral system.

```typescript
interface Referral {
  id: string;
  
  // Participants
  fromDoctorId: string;
  toDoctorId: string;
  
  // Patient Information
  patientNameOrInitials: string;
  patientAge?: number;
  patientPhone?: string;
  
  // Medical Information
  conditionSummary: string; // Short text
  notes?: string; // Optional additional notes
  
  // Status
  status: 'new' | 'attended' | 'removed';
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  attendedAt?: string;
}
```

**Storage Options**:

**Option A (Simple)**: Global array
- `aip_referrals` (localStorage) - Array of all referrals

**Option B (Per-doctor)**: Separate keys
- `aip_referrals_in_{doctorId}` - Incoming referrals
- `aip_referrals_out_{doctorId}` - Outgoing referrals

**Recommended**: Option A (simpler, easier to query)

**Helper Functions**:
```typescript
function getIncomingReferrals(doctorId: string): Referral[]
function getOutgoingReferrals(doctorId: string): Referral[]
function createReferral(fromDoctorId: string, toDoctorId: string, data: Partial<Referral>): Referral
function updateReferralStatus(referralId: string, status: Referral['status']): void
```

---

### 7. Notification

**New Entity** - Doctor notifications.

```typescript
type NotificationType =
  | 'referral_received'
  | 'referral_status_changed'
  | 'practice_admin_invite'
  | 'practice_admin_approval_request'
  | 'admin_approval_result'
  | 'membership_expiry_warning'
  | 'chat_announcement';

interface Notification {
  id: string;
  type: NotificationType;
  
  // Content
  title: string;
  message: string;
  link?: string; // Optional link to relevant page
  
  // Target
  doctorId: string; // Who receives this notification
  
  // Status
  read: boolean;
  
  // Metadata
  createdAt: string;
  readAt?: string;
}
```

**Storage**:
- `aip_notifications_{doctorId}` (localStorage) - Array of Notification

**Notification Triggers**:
- Referral received → `referral_received`
- Referral status changed → `referral_status_changed`
- Practice admin invites → `practice_admin_invite`
- Approval request needs action → `practice_admin_approval_request`
- Admin approved/rejected → `admin_approval_result`
- Membership expiring soon → `membership_expiry_warning`
- Chat announcement → `chat_announcement`

---

### 8. Membership

**Enhanced Entity** - Practice-level and doctor-level views.

```typescript
interface MembershipData {
  doctorId: string;
  practiceId?: string; // Optional: for practice-level membership
  
  // Plan
  planId: string; // References membershipPlans
  planName: string;
  
  // Billing
  billingCycle: 'monthly' | 'annual';
  amount: number; // Current amount
  
  // Status
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  
  // Dates
  startDate: string;
  expiryDate: string;
  nextBillingDate?: string; // For recurring
  
  // Payment
  paymentMethod: 'paypal' | 'card';
  cardLast4?: string; // If card payment
  cardBrand?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}
```

**Storage**:
- `aip_membership_{doctorId}` (localStorage)

**Practice-Level Membership** (Future):
- Could have `aip_practice_membership_{practiceId}`
- All doctors in practice inherit membership benefits

---

### 9. Chat (Planned)

**Future Entity** - Chat system data structures.

```typescript
interface ChatThread {
  id: string;
  type: 'direct' | 'practice_group' | 'admin_announcement' | 'practice_announcement';
  
  // Participants (for direct/group)
  participants: string[]; // doctorIds
  
  // Context
  practiceId?: string; // For practice announcements
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
}

interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string; // doctorId or 'admin'
  senderName: string;
  
  // Content
  content: string;
  attachments?: string[]; // URLs
  
  // Status
  read: boolean;
  readBy: string[]; // doctorIds who read
  
  // Metadata
  createdAt: string;
  editedAt?: string;
}
```

**Storage**:
- `aip_chat_threads` (localStorage) - Array of ChatThread
- `aip_chat_messages_{threadId}` (localStorage) - Array of ChatMessage
- `aip_chat_announcements_admin` (localStorage) - Admin announcements
- `aip_chat_announcements_practice_{practiceId}` (localStorage) - Practice announcements

---

## Supporting Types

### Insurance

```typescript
interface Insurance {
  name: string;
  slug: string;
}
```

### Location (Legacy - Deprecated in v2)

```typescript
interface Location {
  id: string;
  name: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
  phone?: string;
  hours?: string;
  services?: string[];
  isPrimary?: boolean;
}
```

**Note**: In v2, use `PracticeLocation` instead.

---

## TypeScript Type Definitions

**File**: `src/types/index.ts`

```typescript
// Export all interfaces above
export interface Practice { ... }
export interface Doctor { ... }
export interface PracticeRoles { ... }
export interface ApprovalRequest { ... }
export interface PracticeInvitation { ... }
export interface Referral { ... }
export interface Notification { ... }
export interface MembershipData { ... }
export interface ChatThread { ... }
export interface ChatMessage { ... }

// Type aliases
export type ApprovalRequestType = ...
export type NotificationType = ...
export type DoctorRole = 'practice_admin' | 'doctor';
```

---

## Data Relationships

```
Practice
  ├── has many Doctors (doctorIds[])
  ├── has many Locations (locationList[])
  ├── has one Practice Admin (via PracticeRoles)
  └── has many Approval Requests (practiceId)

Doctor
  ├── belongs to one Practice (practiceId)
  ├── has one Role in Practice (via PracticeRoles)
  ├── sends many Referrals (fromDoctorId)
  ├── receives many Referrals (toDoctorId)
  ├── has many Notifications (doctorId)
  └── has one Membership (doctorId)

ApprovalRequest
  ├── requested by Doctor (requestedBy)
  └── relates to Practice (practiceId)

PracticeInvitation
  ├── for Practice (practiceId)
  └── invited by Practice Admin (invitedBy)
```

---

## Validation Rules

### Practice

- `name`: Required, min 2 characters
- `slug`: Required, unique, URL-safe
- `email`: Required, valid email format
- `phone`: Required, valid phone format
- `address.city`: Required
- `address.state`: Required, 2-letter US state code
- `address.zip`: Required, 5-digit ZIP code
- `location.lat`: Required, -90 to 90
- `location.lng`: Required, -180 to 180
- `doctorIds`: Array, can be empty initially

### Doctor

- `practiceId`: Required, must reference existing practice
- `fullName`: Required, min 2 characters
- `email`: Required, valid email format, unique
- `specialty`: Required
- `bio`: Required, min 50 characters

### ApprovalRequest

- `type`: Required, must be valid ApprovalRequestType
- `requestedBy`: Required
- `practiceId`: Required for most types (except `practice_create_with_admin`)
- `payload`: Required, structure varies by type

### Referral

- `fromDoctorId`: Required, must be valid doctor ID
- `toDoctorId`: Required, must be valid doctor ID, cannot equal fromDoctorId
- `patientNameOrInitials`: Required, min 1 character
- `conditionSummary`: Required, min 10 characters

---

## Migration Notes

### From v1 to v2

1. **Institution → Practice**: Rename conceptually, keep localStorage keys for compatibility
2. **Doctor.locations → Practice.locationList**: Migrate doctor locations to practice
3. **Doctor.insurance → Practice.insurance**: Migrate doctor insurance to practice
4. **Join Request → ApprovalRequest**: Convert existing join requests to new structure

---

**Next Steps**: See `V2_ROLES_PERMISSIONS.md` for permission matrix.
