# V2 Step 2 Implementation Summary

## Overview

Step 2 establishes the foundational data model and storage infrastructure for AIP v2. This step introduces TypeScript types, centralized localStorage key management, and SSR-safe storage helper modules. **No UI or seed data changes were made** - this is purely foundational infrastructure.

**Date**: January 29, 2026  
**Status**: ✅ Complete  
**TypeScript Compilation**: ✅ Success

---

## Files Created

### Type Definitions (5 files)

1. **`src/types/practice.ts`**
   - `Practice` interface - Primary directory entity with full field set
   - `PracticeOverride` type - Partial override type for localStorage
   - Fields: id, slug, name, description, contact info, address, location (lat/lng), specialties, doctorIds, services, insurance, locations array, media, timestamps

2. **`src/types/approvals.ts`**
   - `ApprovalStatus` type - 'submitted' | 'under_review' | 'approved' | 'rejected'
   - `ApprovalType` union - 7 approval request types
   - `ApprovalRequest` interface - Unified approval entity with dual-approval support
   - `ApprovalHistoryRecord` interface - Append-only audit log

3. **`src/types/referrals.ts`**
   - `ReferralStatus` type - 'new' | 'attended' | 'removed'
   - `Referral` interface - V2 referral structure (doctor-to-doctor)
   - `ReferralHistoryRecord` interface - Append-only referral change log

4. **`src/types/notifications.ts`**
   - `NotificationType` union - 5 notification types
   - `Notification` interface - Per-doctor notification structure

5. **`src/types/invitations.ts`**
   - `PracticeInvitation` interface - Practice Admin invitation structure

### Storage Infrastructure (7 files)

6. **`src/lib/storage/keys.ts`**
   - Centralized `LS_KEYS` constant object with all localStorage keys
   - Helper function `getNotificationKey(doctorId)` for per-doctor notifications
   - Includes backward-compatible institution keys

7. **`src/lib/storage/localStorage.ts`**
   - Generic SSR-safe helper functions:
     - `isBrowser()` - Browser environment check
     - `readJSON<T>(key, fallback)` - Safe JSON read with fallback
     - `writeJSON<T>(key, value)` - Safe JSON write
     - `removeKey(key)` - Safe key removal
     - `appendToArray<T>(key, item, maxItems?)` - Array append with cap
     - `updateArrayItemById<T>(key, id, patch)` - Array item update by ID
   - All functions never throw, return safe fallbacks

8. **`src/lib/storage/practiceStorage.ts`**
   - `getPracticeOverrides()` - Read override map
   - `savePracticeOverride(practiceId, patch)` - Save override
   - `deletePractice(practiceId)` - Mark as deleted
   - `restorePractice(practiceId)` - Restore deleted
   - `getDeletedPracticeIds()` - Get deleted IDs
   - `mergePractices(seedPractices)` - Merge seed + overrides + filter deleted

9. **`src/lib/storage/approvalStorage.ts`**
   - `getApprovalRequests()` - Read all requests (sorted by submittedAt desc)
   - `saveApprovalRequests(requests)` - Save all requests
   - `addApprovalRequest(req)` - Add new request (prepend)
   - `updateApprovalRequest(id, patch)` - Update by ID
   - `getApprovalHistory()` - Read history log
   - `appendApprovalHistory(record)` - Append history (capped at 2000 items)

10. **`src/lib/storage/referralStorage.ts`**
    - `getReferrals()` - Read all referrals
    - `saveReferrals(refs)` - Save all referrals
    - `addReferral(ref)` - Add new referral (prepend)
    - `updateReferral(id, patch)` - Update by ID
    - `getReferralHistory()` - Read history log
    - `appendReferralHistory(record)` - Append history (capped at 1000 items)

11. **`src/lib/storage/notificationStorage.ts`**
    - `getNotifications(doctorId)` - Read doctor's notifications (sorted by createdAt desc)
    - `addNotification(doctorId, notification)` - Add notification (capped at 200 items)
    - `markNotificationRead(doctorId, notificationId)` - Mark as read

12. **`src/lib/storage/invitationStorage.ts`**
    - `getPracticeInvitations()` - Read all invitations
    - `savePracticeInvitations(invitations)` - Save all invitations
    - `addPracticeInvitation(invitation)` - Add new invitation (prepend)
    - `updatePracticeInvitation(id, patch)` - Update by ID

13. **`src/lib/storage/__debug.ts`**
    - Debug helper functions for testing:
      - `createDummyApprovalRequest()` - Sample approval request
      - `createDummyApprovalHistoryRecord(requestId)` - Sample history record
      - `createDummyReferral()` - Sample referral
      - `createDummyReferralHistoryRecord(referralId)` - Sample referral history

### Files Updated

14. **`src/types/index.ts`**
    - Added `practiceId?: string` to `Doctor` interface
    - Added `roleInPractice?: 'doctor' | 'practice_admin'` to `Doctor` interface
    - Created `DoctorOverride` type
    - Renamed existing `Referral` to `LegacyReferral` (backward compatibility)
    - Added V2 type exports (practice, approvals, referrals, notifications, invitations)
    - Kept `institutionId` field for backward compatibility

---

## Technical Implementation Details

### Type System

**Practice Entity**:
- Primary directory entity replacing doctor-centric model
- Includes full address structure, location coordinates, specialties array
- Supports multiple locations per practice
- Links to doctors via `doctorIds` array

**Approval System**:
- Unified `ApprovalRequest` type supporting 7 request types
- Dual-approval model: `admin` + optional `practiceAdmin` approvals
- Append-only `ApprovalHistoryRecord` for audit trail
- Status tracking: submitted → under_review → approved/rejected

**Referral System (V2)**:
- Doctor-to-doctor referrals with practice context
- Patient data structure (initials, age, sex) - no sensitive data
- Status workflow: new → attended/removed
- Append-only history for status changes

**Notification System**:
- Per-doctor storage using `aip_notifications_{doctorId}` pattern
- 5 notification types covering all V2 workflows
- Read/unread tracking with `readAt` timestamp
- Capped at 200 items per doctor

### Storage Architecture

**Pattern**: Seed Data → localStorage Overrides → Deleted Filter → Final Dataset

**SSR Safety**:
- All functions check `typeof window !== 'undefined'` first
- Return safe fallbacks (empty arrays, empty objects) on SSR
- Never throw errors - log and return fallback

**Error Handling**:
- Try/catch all localStorage operations
- Console.error on failures
- Graceful degradation with safe defaults

**History Logs**:
- Append-only arrays (never modify existing records)
- Approval history capped at 2000 items
- Referral history capped at 1000 items
- Notification arrays capped at 200 items per doctor

### Backward Compatibility

- `institutionId` field preserved in `Doctor` type
- Existing `Institution` type unchanged
- Legacy `Referral` type renamed to `LegacyReferral` (not removed)
- Institution localStorage keys preserved
- No breaking changes to existing code

---

## Key Features

### 1. Centralized Key Management
- Single source of truth in `LS_KEYS` constant
- Type-safe with `as const`
- Helper function for dynamic keys (notifications)

### 2. Generic Storage Helpers
- Reusable functions for common patterns
- Type-safe with TypeScript generics
- SSR-safe by default

### 3. Append-Only History
- Audit trail for approvals and referrals
- Immutable history records
- Automatic capping to prevent unbounded growth

### 4. Practice-Centric Model
- Practice as primary entity
- Doctor linked via `practiceId`
- Role-based permissions foundation (`roleInPractice`)

### 5. Dual-Approval Support
- Admin approval always required
- Practice Admin approval when applicable
- Status tracking per approver

---

## Verification Checklist

✅ **TypeScript Compilation**: No errors  
✅ **All Type Files Created**: 5/5  
✅ **All Storage Modules Created**: 7/7  
✅ **Doctor Type Updated**: practiceId and roleInPractice added  
✅ **Type Exports Added**: All new types exported  
✅ **SSR Safety**: All functions check isBrowser()  
✅ **Error Handling**: Try/catch with safe fallbacks  
✅ **History Caps**: Approval (2000), Referral (1000), Notification (200)  
✅ **Backward Compatibility**: Institution logic untouched  
✅ **No UI Changes**: Zero UI components modified  
✅ **No Seed Data Changes**: Zero seed files modified  

---

## Storage Keys Defined

```typescript
DOCTOR_OVERRIDES: 'aip_doctor_overrides'
DELETED_DOCTORS: 'aip_deleted_doctors'
PRACTICE_OVERRIDES: 'aip_practice_overrides'
DELETED_PRACTICES: 'aip_deleted_practices'
APPROVAL_REQUESTS: 'aip_approval_requests'
APPROVAL_HISTORY: 'aip_approval_history'
REFERRALS: 'aip_referrals'
REFERRAL_HISTORY: 'aip_referral_history'
PRACTICE_INVITATIONS: 'aip_practice_invitations'
NOTIFICATIONS_PREFIX: 'aip_notifications_' (+ doctorId)
```

---

## Next Steps

Step 2 foundation is complete. Ready for:
- **Step 3**: Seed data creation and migration
- **Step 4**: UI integration and component updates
- **Step 5**: Approval workflow implementation

---

## Code Statistics

- **Files Created**: 13
- **Files Updated**: 1
- **Lines of Code**: ~1,200+
- **Type Definitions**: 8 interfaces, 4 type unions
- **Storage Functions**: 25+ functions
- **Storage Keys**: 10 keys defined

---

**Implementation Status**: ✅ Complete  
**Ready for Next Step**: Yes
