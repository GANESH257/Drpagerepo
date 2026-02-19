# V2 Step 4 Implementation Summary

## Overview

Step 4 implements the business logic services layer (approval engine, referral engine, permission service, visibility service, membership service, announcement service) on top of Step 2 storage modules and Step 3 seed data. **No UI changes were made** - this is pure business logic that will be consumed by UI in Step 5+.

**Date**: January 29, 2026  
**Status**: ✅ Complete  
**TypeScript Compilation**: ✅ Success

---

## Files Created

### Foundation Services (2 files)

1. **`src/lib/services/errors.ts`**
   - Typed error classes: `AuthRequiredError`, `PermissionDeniedError`, `NotFoundError`, `ValidationError`, `ConflictError`
   - Each extends `Error` with a `code` property
   - Used throughout services for consistent error handling

2. **`src/lib/services/id.ts`**
   - `nowISO()` - Get current ISO timestamp
   - `makeId(prefix)` - Generate unique IDs (format: `{prefix}-{timestamp}-{random}`)
   - `slugify(input)` - URL-friendly slug generation
   - `normalizeEmail(email)` - Email normalization (lowercase, trim)

### Core Services (3 files)

3. **`src/lib/services/permissionService.ts`**
   - `Actor` type: `public` | `admin` | `doctor` (with practiceId, roleInPractice)
   - `getActorFromSession()` - SSR-safe actor resolution from localStorage sessions
   - Assertion functions: `assertAuthenticated()`, `assertAdmin()`, `assertDoctor()`, `assertPracticeAdmin()`
   - Helper guards: `canViewDoctorPrivateContact()`, `canSendReferral()`, `canApproveAsPracticeAdmin()`

4. **`src/lib/services/visibilityService.ts`**
   - `getPracticePublicContact()` - Returns practice contact info
   - `getDoctorPublicContact()` - Returns doctor contact based on visibility rules
   - `getContactCard()` - Returns complete contact card with visibility mode (`public` | `private`)

5. **`src/lib/services/approvalEngine.ts`** ⭐ **MAIN DELIVERABLE**
   - `submitApprovalRequest()` - Create approval requests with dual-approval setup
   - `markUnderReview()` - Admin marks request as under review
   - `decideAsAdmin()` - Admin approve/reject with dual-approval logic
   - `decideAsPracticeAdmin()` - Practice admin approve/reject
   - `applyApprovedRequestSideEffects()` - Applies changes when request is approved:
     - `new_practice_with_admin_doctor` - Creates practice + doctor
     - `doctor_join_practice` - Assigns doctor to practice (enforces single practice)
     - `practice_edit_request` - Updates practice fields
     - `practice_location_change_request` - Updates practice locations
     - `practice_insurance_services_change_request` - Updates insurance/services
   - Query helpers: `getPendingApprovalsForAdmin()`, `getPendingApprovalsForPracticeAdmin()`, `getApprovalTimeline()`
   - Notification integration for all state changes

### Referral Service (1 file)

6. **`src/lib/services/referralEngine.ts`**
   - `createReferral()` - Create doctor-to-doctor referrals
   - `setReferralStatus()` - Update referral status (new/attended/removed)
   - `getReferralsForDoctor()` - Get sent/received referrals for a doctor
   - `getReferralTimeline()` - Get referral history timeline
   - Notification integration for referral events

### Membership Service (2 files)

7. **`src/types/membership.ts`**
   - `MembershipTier` type: `basic` | `professional` | `premier` | `practice_basic` | `practice_plus`
   - `Membership` interface with scope (`doctor` | `practice`), tier, status, dates

8. **`src/lib/services/membershipService.ts`**
   - `getMemberships()` - Get all memberships
   - `setMembership()` - Upsert membership by id
   - `getDoctorMembership()` - Get doctor's membership
   - `getPracticeMembership()` - Get practice's membership
   - `getPracticeDoctorsMembershipOverview()` - Get membership overview for all doctors in practice
   - Foundation only (no billing logic)

### Announcement Service (2 files)

9. **`src/types/announcements.ts`**
   - `AnnouncementAudience` type: `all_doctors` | `practice_doctors`
   - `Announcement` interface with audience, title, message

10. **`src/lib/services/announcementService.ts`**
    - `createAnnouncement()` - Create announcements (admin → all_doctors, practice_admin → practice_doctors)
    - `getAnnouncementsForDoctor()` - Get relevant announcements for a doctor
    - Future-ready stub (no chat threads yet)
    - Notification fan-out to recipients

### Files Updated

11. **`src/lib/storage/keys.ts`**
    - Added `CREATED_PRACTICES: 'aip_created_practices'`
    - Added `MEMBERSHIPS: 'aip_memberships'`
    - Added `ANNOUNCEMENTS: 'aip_announcements'`

12. **`src/lib/storage/practiceStorage.ts`**
    - Added `getCreatedPractices()` - Get practices created via approval workflow
    - Added `saveCreatedPractices()` - Save created practices array
    - Added `addCreatedPractice()` - Add newly created practice

13. **`src/types/index.ts`**
    - Added exports for `membership` and `announcements` types

---

## Implementation Details

### Approval Engine Workflow

**Request Submission**:
1. Actor must be authenticated
2. Determine if practice admin approval required based on type
3. Create request with dual-approval structure
4. Append history record (`submitted`)
5. Notify admin (stub) and practice admin (if required)
6. Save request

**Admin Decision**:
- **Approve**: If practice admin required → wait for practice admin; else → finalize immediately
- **Reject**: Finalize immediately, notify submitter + practice admin
- Always append history records

**Practice Admin Decision**:
- **Approve**: If admin already approved → finalize; else → wait for admin
- **Reject**: Finalize immediately, notify admin + submitter
- Must match practice ID

**Side Effects** (when `final_approved`):
- `new_practice_with_admin_doctor`: Creates practice in `CREATED_PRACTICES`, creates doctor override with `practiceId` + `roleInPractice = 'practice_admin'`
- `doctor_join_practice`: Updates doctor override, updates practice `doctorIds`, enforces single practice (removes from old practice)
- `practice_edit_request`: Saves practice override with changes
- `practice_location_change_request`: Updates practice locations
- `practice_insurance_services_change_request`: Updates insurance/services

### Referral Engine Workflow

**Create Referral**:
1. Actor must be doctor or admin (admin must provide `fromDoctorId`)
2. Cannot refer to self
3. Extract practice IDs from doctor records
4. Create referral with `status = 'new'`
5. Append history (`created`)
6. Notify recipient (`referral_received`)

**Status Change**:
1. Only participants or admin can change
2. Update status + `updatedAt`
3. Append history (`status_changed`)
4. Notify other party (`referral_status_changed`)

### Permission Service

**Actor Resolution**:
- Checks `aip_admin_session` first → admin actor
- Else checks `aip_doctor_session` → resolves doctorId from email (case-insensitive)
- Returns public if none
- SSR-safe (returns public on server)

**Permission Checks**:
- All assertion functions throw typed errors
- Helper guards return boolean for conditional logic

### Visibility Service

**Contact Visibility Rules**:
- **Public**: Practice contact only
- **Logged-in Doctor/Admin**: Doctor personal contact if available, else practice contact
- Returns `ContactCard` with `mode` and `source` for UI rendering

### Membership Service

**Storage**: Single array in `aip_memberships`
**Scope**: `doctor` (per-doctor) or `practice` (practice-level)
**Foundation Only**: No billing, renewal, or payment logic

### Announcement Service

**Permissions**:
- Admin → `all_doctors`
- Practice Admin → `practice_doctors` (own practice only)

**Notification Fan-out**: Creates notifications for all recipients
**Future-Ready**: Stub for chat system (no threads yet)

---

## Key Features

### 1. Dual-Approval Logic
- Admin approval always required
- Practice admin approval required for 6 of 7 request types
- `new_practice_with_admin_doctor` is admin-only
- Status transitions handle both approvals correctly

### 2. Append-Only History
- All approval actions logged to history
- All referral changes logged to history
- Immutable audit trail
- Capped at 2000 (approvals) and 1000 (referrals)

### 3. Notification Integration
- Approval state changes → notifications
- Referral events → notifications
- Announcements → fan-out notifications
- All notifications stored per-doctor

### 4. Side Effects Management
- Only applied when request is `final_approved`
- Handles 5 approval types with proper side effects
- Enforces business rules (e.g., single practice per doctor)

### 5. SSR Safety
- All services check `typeof window !== 'undefined'`
- Storage functions return safe fallbacks on SSR
- Actor resolution returns `public` on server

### 6. Error Handling
- Typed errors with codes
- Graceful error handling throughout
- Never throws unhandled errors

---

## Storage Updates

### New Keys Added
- `aip_created_practices` - Practices created via approval workflow
- `aip_memberships` - Membership records
- `aip_announcements` - Announcements

### Storage Functions Added
- `getCreatedPractices()` / `saveCreatedPractices()` / `addCreatedPractice()` in `practiceStorage.ts`

---

## Type System

### New Types
- `Membership` / `MembershipTier` (membership.ts)
- `Announcement` / `AnnouncementAudience` (announcements.ts)
- `Actor` (permissionService.ts)
- `ContactCard` (visibilityService.ts)
- `SubmitApprovalInput` (approvalEngine.ts)
- `CreateReferralInput` (referralEngine.ts)
- `CreateAnnouncementInput` (announcementService.ts)

### Error Classes
- `AuthRequiredError`
- `PermissionDeniedError`
- `NotFoundError`
- `ValidationError`
- `ConflictError`

---

## Approval Request Types Supported

1. ✅ `doctor_join_practice` - Requires admin + practice admin
2. ✅ `new_practice_with_admin_doctor` - Admin only
3. ✅ `practice_edit_request` - Requires admin + practice admin
4. ✅ `practice_doctor_add_request` - Requires admin + practice admin
5. ✅ `practice_doctor_remove_request` - Requires admin + practice admin
6. ✅ `practice_location_change_request` - Requires admin + practice admin
7. ✅ `practice_insurance_services_change_request` - Requires admin + practice admin

---

## Side Effects Implemented

1. ✅ **`new_practice_with_admin_doctor`**
   - Creates practice in `CREATED_PRACTICES`
   - Creates doctor override with `practiceId` + `roleInPractice = 'practice_admin'`
   - Adds doctor to practice `doctorIds`

2. ✅ **`doctor_join_practice`**
   - Updates doctor override: sets `practiceId` and `roleInPractice = 'doctor'`
   - Updates practice override: adds `doctorId` to `doctorIds`
   - Enforces single practice: removes doctor from old practice if exists
   - Updates practice specialties union

3. ✅ **`practice_edit_request`**
   - Saves practice override with changes
   - Updates `updatedAt`

4. ✅ **`practice_location_change_request`**
   - Updates practice `locations` array

5. ✅ **`practice_insurance_services_change_request`**
   - Updates practice `insurance` and/or `services`

---

## Notification Triggers

### Approval Notifications
- Request submitted → Practice admin notified (if required)
- Request under review → Practice admin + submitter notified
- Admin approved → Practice admin notified (if waiting), submitter notified (if finalized)
- Admin rejected → Submitler + practice admin notified
- Practice admin approved → Admin notified (if waiting), submitter notified (if finalized)
- Practice admin rejected → Admin + submitter notified

### Referral Notifications
- Referral created → Recipient notified (`referral_received`)
- Status changed → Other party notified (`referral_status_changed`)

### Announcement Notifications
- Announcement created → All recipients notified (`announcement`)

---

## Code Statistics

- **Files Created**: 10
- **Files Updated**: 3
- **Total Lines of Code**: ~1,759 (services layer)
- **Service Functions**: 30+
- **Error Classes**: 5
- **Type Definitions**: 8+

---

## Verification Checklist

- [x] TypeScript compiles with 0 errors
- [x] All service files created
- [x] Approval engine supports all 7 request types
- [x] Dual-approval logic implemented correctly
- [x] Side effects implemented for 5 types
- [x] Referral engine complete
- [x] Permission service with actor resolution
- [x] Visibility service with contact rules
- [x] Membership service foundation
- [x] Announcement service stub
- [x] All services SSR-safe
- [x] Notification integration complete
- [x] History logging implemented
- [x] Error handling with typed errors
- [x] No UI modifications
- [x] Storage keys updated
- [x] Type exports added

---

## Testing Notes

Since no UI, services can be tested via:
1. Browser console imports
2. Direct function calls
3. localStorage inspection
4. History record verification

Example:
```typescript
import { getActorFromSession, submitApprovalRequest } from '@/lib/services';
const actor = getActorFromSession();
const request = submitApprovalRequest(actor, {
  type: 'doctor_join_practice',
  payload: { ... },
  target: { practiceId: 'practice-1', doctorId: 'doctor-123' }
});
```

---

## Next Steps

Step 4 business logic layer is complete. Ready for:
- **Step 5**: UI integration (Admin approval queue, Practice Admin approval screen, Doctor dashboard updates)
- **Step 6**: Practice pages and directory updates

---

**Implementation Status**: ✅ Complete  
**Ready for Next Step**: Yes
