# Database Structure Documentation

## Overview

This project uses a **client-side data storage architecture** with no traditional database. Data is stored in:
- **Static TypeScript files** (`src/data/*.ts`) - Seed data
- **localStorage** - Runtime overrides, sessions, and dynamic data

## Data Storage Pattern

### Architecture
```
Seed Data (TypeScript files)
    ↓
localStorage Overrides (if any)
    ↓
Deleted Items Filter
    ↓
Final Data Set
```

### Storage Locations

| Data Type | Seed File | localStorage Key | Override Pattern |
|-----------|-----------|------------------|------------------|
| Doctors | `src/data/doctors.ts` | `aip_doctor_overrides` | Partial updates |
| Institutions | `src/data/institutions.ts` | `aip_institution_overrides` | Partial updates |
| Join Requests | `src/data/mockJoinRequests.ts` | `aip_join_requests` | Full array |
| Membership Plans | `src/data/membershipPlans.ts` | `aip_membership_plans_override` | Full array |
| Policies | `src/data/orgPolicies.ts` | `aip_policies_override` | Full array |
| Events | `src/data/globalMedicalEvents.ts` | `aip_global_medical_events_override` | Full array |
| Board Meetings | `src/data/boardMeetings.ts` | `aip_board_meetings_override` | Full object |

---

## Entity: Doctor

### Table Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier (e.g., "real-1", "real-19") |
| `slug` | `string` | Yes | URL-friendly identifier (e.g., "robert-hacker") |
| `firstName` | `string` | Yes | Doctor's first name |
| `lastName` | `string` | Yes | Doctor's last name |
| `fullName` | `string` | Yes | Full name with credentials (e.g., "Robert Hacker, M.D.") |
| `specialty` | `string` | Yes | Primary specialty |
| `specialties` | `string[]` | No | Additional specialties |
| `credentials` | `string` | Yes | Medical credentials (M.D., D.O., D.P.M., N.P., etc.) |
| `bio` | `string` | Yes | Short biography |
| `about` | `string` | No | Extended biographical text |
| `image` | `string` | No | Profile image path |
| `email` | `string` | No | Email for dashboard login |
| `locations` | `Location[]` | Yes | Practice locations (array) |
| `insurance` | `Insurance[]` | Yes | Accepted insurance plans |
| `rating` | `number` | Yes | Average rating (0-5) |
| `reviewCount` | `number` | Yes | Number of reviews |
| `reviews` | `Review[]` | Yes | Patient reviews array |
| `featured` | `boolean` | Yes | Featured doctor flag |
| `verified` | `boolean` | Yes | Verified credentials flag |
| `availability` | `BookingSlot[]` | Yes | Available appointment slots |
| `acceptsNewPatients` | `boolean` | Yes | Accepting new patients |
| `conditionsAndServices` | `string[]` | No | Conditions treated / services offered |
| `hospitalPrivileges` | `string[]` | No | Hospital affiliations |
| `medicalSchool` | `string` | No | Medical school attended |
| `residency` | `string` | No | Residency program |
| `internship` | `string` | No | Internship program |
| `boardCertifications` | `string[]` | No | Board certifications |
| `statesLicensedIn` | `string[]` | No | Licensed states |
| `website` | `string` | No | Personal/practice website |
| `bookingUrl` | `string` | No | Direct booking URL |
| `institutionId` | `string` | No | Foreign key to Institution |

### Current Statistics

- **Total Doctors**: ~121 doctors
- **States Distribution**:
  - IL (Illinois): 51 doctors (41.8%)
  - TN (Tennessee): 51 doctors (41.8%)
  - MO (Missouri): 20 doctors (16.4%)
- **All doctors assigned to institutions**: Yes (via `institutionId`)

### Location Sub-Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Location name |
| `address` | `string` | Yes | Street address |
| `city` | `string` | Yes | City |
| `state` | `string` | Yes | State (2-letter code) |
| `zip` | `string` | Yes | ZIP code (5 digits) |
| `phone` | `string` | Yes | Phone number |
| `directionsUrl` | `string` | No | Google Maps URL |
| `hours` | `string` | No | Practice hours |

### Insurance Sub-Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Insurance provider name |
| `slug` | `string` | Yes | URL-friendly identifier |

### Review Sub-Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique review ID |
| `patientName` | `string` | Yes | Patient name (may be anonymized) |
| `rating` | `number` | Yes | Rating (1-5) |
| `comment` | `string` | Yes | Review text |
| `date` | `string` | Yes | ISO date string |
| `verified` | `boolean` | No | Verified visit flag |

---

## Entity: Institution (Practice/Clinic)

### Table Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier (e.g., "institution-1") |
| `slug` | `string` | Yes | URL-friendly identifier |
| `name` | `string` | Yes | Institution name |
| `description` | `string` | Yes | Practice description |
| `phone` | `string` | Yes | Primary phone number |
| `email` | `string` | No | Contact email |
| `website` | `string` | No | Practice website URL |
| `address` | `Address` | Yes | Address object |
| `location` | `Location` | Yes | Geographic coordinates |
| `specialties` | `string[]` | Yes | Derived from doctors' specialties |
| `doctorIds` | `string[]` | Yes | Array of doctor IDs in this institution |
| `logo` | `string` | No | Logo image path |
| `images` | `string[]` | No | Additional images |
| `createdAt` | `string` | Yes | ISO date string |
| `updatedAt` | `string` | Yes | ISO date string |

### Address Sub-Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `line1` | `string` | Yes | Street address |
| `line2` | `string` | No | Suite/Unit number |
| `city` | `string` | Yes | City |
| `state` | `string` | Yes | State (2-letter code) |
| `zip` | `string` | Yes | ZIP code (5 digits) |
| `country` | `string` | Yes | Country (default: "USA") |

### Location Sub-Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `lat` | `number` | Yes | Latitude |
| `lng` | `number` | Yes | Longitude |

### Current Statistics

- **Total Institutions**: 23 institutions
- **Average Doctors per Institution**: ~5 doctors (range: 2-8)
- **All institutions have ZIP codes**: Yes
- **All institutions have coordinates**: Yes (lat/lng)

### Institution-Doctor Relationship

- **Type**: One-to-Many (one institution has many doctors)
- **Doctor Side**: `doctor.institutionId` → `institution.id`
- **Institution Side**: `institution.doctorIds[]` → array of doctor IDs
- **Bidirectional**: Both references maintained for efficient queries

---

## Entity: JoinRequest

### Table Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique request ID (e.g., "req-mock-001") |
| `submittedAt` | `string` | Yes | ISO date string |
| `status` | `string` | Yes | Status: 'submitted' \| 'under_review' \| 'approved' \| 'rejected' |
| `applicant` | `Applicant` | Yes | Applicant information object |
| `plan` | `Plan` | Yes | Selected membership plan |
| `paymentMethod` | `string` | Yes | 'paypal' \| 'card' |
| `paymentDetails` | `PaymentDetails` | No | Payment information |
| `decidedAt` | `string` | No | ISO date (when approved/rejected) |
| `decidedBy` | `string` | No | Admin email who decided |
| `notes` | `string` | No | Admin notes |
| `rejectionReason` | `string` | No | Reason for rejection |

### Applicant Sub-Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | Applicant email |
| `fullName` | `string` | Yes | Full name with credentials |
| `credentials` | `string` | Yes | Medical credentials |
| `specialty` | `string` | Yes | Medical specialty |
| `phone` | `string` | Yes | Phone number |
| `city` | `string` | Yes | City |
| `state` | `string` | Yes | State |
| `practiceName` | `string` | No | Practice name |
| `website` | `string` | No | Practice website |
| `messageToAdmin` | `string` | No | Optional message |

### Plan Sub-Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `planId` | `string` | Yes | 'basic' \| 'professional' \| 'premier' |
| `billingCycle` | `string` | Yes | 'monthly' \| 'annual' |

### PaymentDetails Sub-Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cardName` | `string` | No | Cardholder name |
| `billingZip` | `string` | No | Billing ZIP code |

---

## Entity: MembershipPlan

### Table Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Plan ID ('basic', 'professional', 'premier') |
| `name` | `string` | Yes | Plan display name |
| `badge` | `string` | No | Badge text (e.g., "Most Popular") |
| `pricing` | `Pricing` | Yes | Pricing object |
| `description` | `string` | No | Plan description |
| `features` | `string[]` | Yes | Array of feature descriptions |
| `ctaLabel` | `string` | Yes | CTA button text |
| `ctaHref` | `string` | Yes | CTA link URL |

### Pricing Sub-Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `monthly` | `string \| number` | Yes | Monthly price |
| `annual` | `string \| number` | Yes | Annual price |

### Current Plans

1. **Basic Plan** (`basic`)
   - Entry-level membership
   - Limited features

2. **Professional Plan** (`professional`)
   - Mid-tier membership
   - Most popular

3. **Premier Plan** (`premier`)
   - Premium membership
   - All features included

---

## Data Access Patterns

### Reading Data

1. **Server-Side (SSR)**:
   - Returns seed data directly from TypeScript files
   - No localStorage access (not available on server)

2. **Client-Side**:
   - Load seed data
   - Apply localStorage overrides
   - Filter deleted items
   - Return merged result

### Writing Data

1. **Doctor Updates**:
   - `saveDoctorOverride(doctorId, partialData)` → Updates `aip_doctor_overrides`
   - Merged with seed data on read

2. **Institution Updates**:
   - `saveInstitutionOverride(institutionId, partialData)` → Updates `aip_institution_overrides`
   - Merged with seed data on read

3. **Join Requests**:
   - `submitJoinRequest(request)` → Adds to `aip_join_requests` array
   - `acceptJoinRequest(id, notes)` → Updates status to 'approved'
   - `rejectJoinRequest(id, reason)` → Updates status to 'rejected'

4. **Deletions**:
   - `deleteDoctor(id)` → Adds ID to `aip_deleted_doctors` array
   - `deleteInstitution(id)` → Adds ID to `aip_deleted_institutions` array
   - Soft delete pattern (filtered on read, not removed from seed)

---

## Relationships

### Doctor ↔ Institution

```
Doctor
  └─ institutionId: string (FK)
  
Institution
  └─ doctorIds: string[] (array of doctor IDs)
```

**Query Pattern**:
- Get institution doctors: `doctors.filter(d => d.institutionId === institutionId)`
- Get doctor institution: `institutions.find(i => i.id === doctor.institutionId)`

### Doctor ↔ JoinRequest

```
JoinRequest
  └─ applicant.email: string
  
Doctor
  └─ email: string
```

**Relationship**: Join requests are submitted by applicants. Once approved, a doctor record may be created with matching email.

---

## Data Files Reference

| File | Entity Count | Purpose |
|------|--------------|---------|
| `doctors.ts` | ~121 | Seed doctor data |
| `institutions.ts` | 23 | Seed institution data |
| `departments.ts` | 20 | Medical specialties/departments |
| `membershipPlans.ts` | 3 | Membership plan definitions |
| `mockJoinRequests.ts` | 16 | Sample join requests |
| `zipCoordinates.ts` | 44+ | ZIP code to lat/lng mapping |
| `orgPolicies.ts` | Multiple | Organization policies |
| `globalMedicalEvents.ts` | Multiple | Medical events calendar |
| `boardMeetings.ts` | Multiple | Trustee board meetings |

---

## Key Constraints

1. **Unique IDs**: All entities have unique string IDs
2. **Slugs**: URL-friendly slugs must be unique
3. **Email Uniqueness**: Doctor emails should be unique (for login)
4. **Institution Assignment**: All doctors should have `institutionId` (optional for backward compatibility)
5. **ZIP Codes**: All institutions must have valid ZIP codes
6. **Coordinates**: All institutions must have lat/lng coordinates

---

## Data Validation

### Doctor Validation
- Must have: id, slug, firstName, lastName, fullName, specialty, credentials, bio
- At least one location required
- At least one insurance plan required
- Email required for dashboard access

### Institution Validation
- Must have: id, slug, name, description, phone, address, location
- Address must include: line1, city, state, zip, country
- Location must include: lat, lng (non-zero values)
- doctorIds array must contain valid doctor IDs

### JoinRequest Validation
- Must have: id, submittedAt, status, applicant, plan, paymentMethod
- Applicant must include: email, fullName, credentials, specialty, phone, city, state
- Status must be one of: 'submitted', 'under_review', 'approved', 'rejected'

---

## Data Migration Notes

- **Institution Generation**: Generated from doctors using grouping logic (ZIP → city+state → state → random)
- **Doctor Assignment**: Doctors assigned to institutions based on location proximity
- **Specialty Derivation**: Institution specialties = unique union of all doctor specialties within institution
- **ZIP Coordinates**: Extracted from doctor locations or mapped from `zipCoordinates.ts`

---

**Last Updated**: January 29, 2026  
**Data Model Version**: 1.0
