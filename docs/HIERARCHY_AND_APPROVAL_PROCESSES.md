# Hierarchy and Approval Processes Documentation

**Date**: January 29, 2026  
**Version**: 2.0  
**Status**: Production Ready

---

## Table of Contents

1. [Role Hierarchy](#role-hierarchy)
2. [Approval System Architecture](#approval-system-architecture)
3. [Approval Workflows](#approval-workflows)
4. [Status Management](#status-management)
5. [Permission Enforcement](#permission-enforcement)
6. [Governance Rules](#governance-rules)

---

## Role Hierarchy

### Visual Hierarchy

```
Admin (Highest Authority)
  │
  ├── Practice Admin (Elevated Doctor)
  │     │
  │     └── Doctor (Normal Member)
  │
  └── Applicant (Pending Approval)
        │
        └── Public (Unauthenticated)
```

### Role Definitions

#### 1. Admin
**Authority Level**: Highest

**Capabilities**:
- ✅ Approve/reject ALL approval requests
- ✅ Create/edit/delete practices and doctors directly
- ✅ Assign Practice Admin roles
- ✅ Override any decision
- ✅ Bypass approval workflows
- ✅ View all data (including personal contacts)

**Session Storage**: `aip_admin_session`  
**Function**: `getAdminSession()` - `src/lib/adminSession.ts`

**Permission Checks**:
- `assertAdmin()` - `src/lib/services/permissionService.ts:109`
- `actor.kind === 'admin'` - `src/lib/services/permissionService.ts:16`

---

#### 2. Practice Admin
**Authority Level**: Elevated Doctor

**Capabilities**:
- ✅ Approve/reject requests for THEIR practice only
- ✅ Request practice edits (requires admin approval)
- ✅ Invite doctors to practice
- ✅ Manage practice roster (with approval)
- ✅ View all practice doctor contacts
- ✅ All normal doctor capabilities

**Session Storage**: `aip_doctor_session`  
**Role Storage**: `aip_practice_roles[practiceId].adminDoctorId`

**Permission Checks**:
- `assertPracticeAdmin()` - `src/lib/services/permissionService.ts:132`
- `isPracticeAdmin()` - Check via `aip_practice_roles`
- `canApproveAsPracticeAdmin()` - `src/lib/services/permissionService.ts:189`

**Function References**:
- `findPracticeAdminDoctor()` - `src/lib/services/approvalEngine.ts:91`
- `decideAsPracticeAdmin()` - `src/lib/services/approvalEngine.ts:580`

---

#### 3. Doctor
**Authority Level**: Normal Member

**Capabilities**:
- ✅ Edit own profile
- ✅ Send referrals
- ✅ View own referrals and notifications
- ✅ Send messages to other doctors
- ✅ View personal contacts of other doctors
- ❌ Cannot approve requests
- ❌ Cannot edit practice data

**Session Storage**: `aip_doctor_session`  
**Role Storage**: `aip_practice_roles[practiceId].doctorRoles[doctorId]`

**Permission Checks**:
- `assertAuthenticated()` - `src/lib/services/permissionService.ts:99`
- `canSendReferral()` - `src/lib/services/permissionService.ts:179`

---

#### 4. Applicant
**Authority Level**: Pending

**Capabilities**:
- ✅ Submit join request
- ✅ View own application status
- ❌ Cannot access full portal
- ❌ Cannot send referrals

**Status**: Awaiting approval

---

#### 5. Public
**Authority Level**: None

**Capabilities**:
- ✅ View practice directory
- ✅ View doctor profiles (limited)
- ✅ View practice contact information
- ❌ Cannot view personal contacts
- ❌ Cannot access portals

**Actor Type**: `{ kind: 'public' }`  
**Function**: `getActorFromSession()` returns public if no session

---

## Approval System Architecture

### Unified Approval Queue

All approval requests are stored in a single queue: `aip_approval_requests`

**Storage**: `src/lib/storage/approvalStorage.ts`

**Key Functions**:
- `getApprovalRequests()` - Get all requests
- `addApprovalRequest()` - Add new request
- `updateApprovalRequest()` - Update request status
- `appendApprovalHistory()` - Add history entry

---

### Approval Request Structure

```typescript
interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  submittedBy: {
    role: 'admin' | 'practice_admin' | 'doctor' | 'public';
    email: string;
    doctorId?: string;
    practiceId?: string;
  };
  target: {
    practiceId?: string;
    doctorId?: string;
  };
  payload: Record<string, any>; // Type-specific payload
  approvals: {
    admin: {
      status: 'pending' | 'approved' | 'rejected';
      reviewedAt?: string;
      notes?: string;
    };
    practiceAdmin?: {
      status: 'pending' | 'approved' | 'rejected';
      practiceId?: string;
      reviewedAt?: string;
      notes?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}
```

**Location**: `src/types/approvals.ts`

---

### Approval Types

#### 1. `new_practice_with_admin_doctor`
**Description**: Create new practice with Practice Admin doctor

**Required Approvals**: Admin only

**Payload Structure**:
```typescript
{
  practice: Partial<Practice>;
  doctor: Partial<Doctor>;
}
```

**Function**: `submitApprovalRequest()` - `src/lib/services/approvalEngine.ts:304`

**Side Effects** (on approval):
- Practice created: `addCreatedPractice()` - `src/lib/storage/practiceStorage.ts`
- Doctor created: `saveDoctorOverride()` - `src/lib/memberStorage.ts`
- Practice Admin assigned: `setPracticeAdmin()` - via approval engine

---

#### 2. `doctor_join_practice`
**Description**: Doctor joins existing practice

**Required Approvals**: Practice Admin + Admin (both required)

**Payload Structure**:
```typescript
{
  doctor: Partial<Doctor>;
  practiceId: string;
}
```

**Function**: `submitApprovalRequest()` - `src/lib/services/approvalEngine.ts:304`

**Validation**: `validateRosterPayload()` - `src/lib/services/approvalEngine.ts:327`

**Side Effects** (on both approvals):
- Doctor added to practice: `updatePracticeDoctorIds()`
- Doctor role assigned: `addDoctorToPractice()`
- Notification sent: `addNotification()`

---

#### 3. `practice_edit_request`
**Description**: Edit practice information

**Required Approvals**: Admin only

**Payload Structure**:
```typescript
{
  before: Practice; // Snapshot before changes
  after: Practice; // Snapshot after changes
  changedFields: string[]; // List of changed field names
}
```

**Function**: `submitApprovalRequest()` - `src/lib/services/approvalEngine.ts:304`

**Rendering**: `RequestedChangesRenderer` - `src/components/shared/approvals/RequestedChangesRenderer.tsx`

**Side Effects** (on approval):
- Practice updated: `savePracticeOverride()`
- Changes applied: Deep merge of `after` into practice

---

#### 4. `practice_location_add_request`
**Description**: Add new location to practice

**Required Approvals**: Admin only

**Payload Structure**:
```typescript
{
  location: PracticeLocation;
  practiceId: string;
}
```

**Function**: `submitApprovalRequest()` - `src/lib/services/approvalEngine.ts:304`

**Validation**: `validateLocationApprovalRequest()` - `src/lib/services/approvalEngine.ts:318`

**Validation Rules**:
- Duplicate address check
- Duplicate coordinates check
- Last location guard (cannot remove last location)

**Side Effects** (on approval):
- Location added: `updatePracticeLocations()`
- Practice updated: `savePracticeOverride()`

---

#### 5. `practice_location_edit_request`
**Description**: Edit existing location

**Required Approvals**: Admin only

**Payload Structure**:
```typescript
{
  locationId: string;
  before: PracticeLocation;
  after: PracticeLocation;
  changedFields: string[];
}
```

**Function**: `submitApprovalRequest()` - `src/lib/services/approvalEngine.ts:304`

**Rendering**: `LocationEditDiffView` - `src/components/shared/approvals/RequestedChangesRenderer.tsx`

**Side Effects** (on approval):
- Location updated: `updatePracticeLocations()`
- Practice updated: `savePracticeOverride()`

---

#### 6. `practice_location_remove_request`
**Description**: Remove location from practice

**Required Approvals**: Admin only

**Payload Structure**:
```typescript
{
  locationId: string;
  location: PracticeLocation;
  practiceId: string;
}
```

**Function**: `submitApprovalRequest()` - `src/lib/services/approvalEngine.ts:304`

**Validation**: Last location guard (cannot remove if it's the only location)

**Side Effects** (on approval):
- Location removed: `updatePracticeLocations()`
- Practice updated: `savePracticeOverride()`

---

#### 7. `practice_doctor_add_request`
**Description**: Add doctor to practice roster (via invitation)

**Required Approvals**: Practice Admin + Admin (both required)

**Payload Structure**:
```typescript
{
  doctorId: string;
  practiceId: string;
  invitationId?: string;
}
```

**Function**: `submitApprovalRequest()` - `src/lib/services/approvalEngine.ts:304`

**Validation**: `validateRosterPayload()` - `src/lib/services/approvalEngine.ts:327`

**Validation Rules**:
- Doctor must exist
- Practice must exist
- Doctor not already in practice (idempotency)
- Practice Admin must exist

**Side Effects** (on both approvals):
- Doctor added to practice: `updatePracticeDoctorIds()`
- Doctor role assigned: `addDoctorToPractice()`
- Notification sent: `addNotification()`

---

#### 8. `practice_doctor_remove_request`
**Description**: Remove doctor from practice roster

**Required Approvals**: Practice Admin + Admin (both required)

**Payload Structure**:
```typescript
{
  doctorId: string;
  practiceId: string;
}
```

**Function**: `submitApprovalRequest()` - `src/lib/services/approvalEngine.ts:304`

**Validation**: `validateRosterPayload()` - `src/lib/services/approvalEngine.ts:327`

**Validation Rules**:
- Doctor must exist
- Practice must exist
- Doctor must be in practice
- Cannot remove last Practice Admin (governance rule)

**Side Effects** (on both approvals):
- Doctor removed from practice: `updatePracticeDoctorIds()`
- Doctor role removed: `removeDoctorFromPractice()`
- Notification sent: `addNotification()`

---

## Approval Workflows

### Workflow 1: Doctor Joins Existing Practice

**Flow**:
```
Doctor Submits Join Request
    ↓
Request Created (status: pending + pending)
    ↓
    ├─→ Practice Admin Reviews
    │       ├─→ Approves → practiceAdminStatus: 'approved'
    │       └─→ Rejects → practiceAdminStatus: 'rejected' → REJECTED
    │
    └─→ Admin Reviews
            ├─→ Approves → adminStatus: 'approved'
            └─→ Rejects → adminStatus: 'rejected' → REJECTED
    ↓
Both Approved? → YES → Doctor Added to Practice
```

**Function Flow**:
1. `submitApprovalRequest()` - Create request
   - Location: `src/lib/services/approvalEngine.ts:304`
   - Sets both approvals to 'pending'

2. `decideAsPracticeAdmin()` - Practice Admin decision
   - Location: `src/lib/services/approvalEngine.ts:580`
   - Updates `practiceAdminStatus`
   - If rejected → Request rejected

3. `decideAsAdmin()` - Admin decision
   - Location: `src/lib/services/approvalEngine.ts:470`
   - Updates `adminStatus`
   - If rejected → Request rejected

4. Both approved → Side effects executed:
   - `updatePracticeDoctorIds()` - Add doctor to practice
   - `addDoctorToPractice()` - Assign role
   - `addNotification()` - Notify doctor

**Status Transitions**:
```
pending + pending → approved + approved → ACTIVE
pending + pending → rejected + * → REJECTED
pending + pending → * + rejected → REJECTED
```

---

### Workflow 2: Practice Creation

**Flow**:
```
Doctor Submits Practice Creation Request
    ↓
Request Created (status: pending_admin_approval)
    ↓
Admin Reviews
    ↓
    ├─→ Approves → Practice + Doctor Created
    └─→ Rejects → Request Rejected
```

**Function Flow**:
1. `submitApprovalRequest()` - Create request
   - Location: `src/lib/services/approvalEngine.ts:304`
   - Type: `new_practice_with_admin_doctor`
   - Only admin approval required

2. `decideAsAdmin()` - Admin decision
   - Location: `src/lib/services/approvalEngine.ts:470`
   - On approval:
     - `addCreatedPractice()` - Create practice
     - `saveDoctorOverride()` - Create doctor
     - `setPracticeAdmin()` - Assign Practice Admin role

**Status Transitions**:
```
pending → approved → ACTIVE (Practice + Doctor Created)
pending → rejected → REJECTED
```

---

### Workflow 3: Practice Edit Request

**Flow**:
```
Practice Admin Requests Edit
    ↓
Request Created (status: pending_admin_approval)
    ↓
Admin Reviews Changes (with diff view)
    ↓
    ├─→ Approves → Changes Applied
    └─→ Rejects → Changes Rejected
```

**Function Flow**:
1. `submitApprovalRequest()` - Create request
   - Location: `src/lib/services/approvalEngine.ts:304`
   - Type: `practice_edit_request`
   - Payload includes `before` and `after` snapshots

2. `decideAsAdmin()` - Admin decision
   - Location: `src/lib/services/approvalEngine.ts:470`
   - On approval:
     - `savePracticeOverride()` - Apply changes
     - Deep merge `after` into practice

**Rendering**:
- `PracticeSummary` - `src/components/shared/approvals/PracticeSummary.tsx`
- `ChangedFieldsList` - `src/components/shared/approvals/ChangedFieldsList.tsx`
- `RequestedChangesRenderer` - `src/components/shared/approvals/RequestedChangesRenderer.tsx`

**Status Transitions**:
```
pending → approved → CHANGES APPLIED
pending → rejected → CHANGES REJECTED
```

---

### Workflow 4: Location Management

**Flow** (Add Location):
```
Practice Admin Requests Location Add
    ↓
Validation (duplicate check)
    ↓
Request Created (status: pending_admin_approval)
    ↓
Admin Reviews
    ↓
    ├─→ Approves → Location Added
    └─→ Rejects → Location Not Added
```

**Function Flow**:
1. `validateLocationApprovalRequest()` - Validate before creation
   - Location: `src/lib/services/approvalEngine.ts:318`
   - Checks for duplicate address/coordinates

2. `submitApprovalRequest()` - Create request
   - Location: `src/lib/services/approvalEngine.ts:304`
   - Type: `practice_location_add_request`

3. `decideAsAdmin()` - Admin decision
   - Location: `src/lib/services/approvalEngine.ts:470`
   - On approval:
     - `updatePracticeLocations()` - Add location
     - `savePracticeOverride()` - Update practice

**Validation Rules**:
- Address uniqueness (within practice)
- Coordinate uniqueness (within practice)
- Last location guard (for removal)

---

## Status Management

### Status Values

**Admin Status**:
- `pending` - Awaiting admin review
- `approved` - Admin approved
- `rejected` - Admin rejected

**Practice Admin Status**:
- `pending` - Awaiting practice admin review
- `approved` - Practice admin approved
- `rejected` - Practice admin rejected
- `not_applicable` - Not required for this request type

---

### Status Combinations

| Admin Status | Practice Admin Status | Final Status | Action |
|-------------|----------------------|--------------|--------|
| pending | pending | PENDING | Awaiting both |
| pending | approved | PENDING | Awaiting admin |
| approved | pending | PENDING | Awaiting practice admin |
| approved | approved | APPROVED | ✅ Complete |
| rejected | * | REJECTED | ❌ Rejected |
| * | rejected | REJECTED | ❌ Rejected |

**Function**: `getApprovalStatus()` - Calculates final status from both approvals

---

### Status Transitions

**Valid Transitions**:
```
pending → approved ✅
pending → rejected ✅
approved → (cannot change) ❌
rejected → (cannot change) ❌
```

**Enforcement**:
- Once approved/rejected, status cannot change
- Admin can override (bypass workflow)
- All transitions logged in history

**Function**: `decideAsAdmin()` / `decideAsPracticeAdmin()` - Enforce transition rules

---

## Permission Enforcement

### Permission Check Functions

#### 1. Authentication Checks
```typescript
assertAuthenticated(actor: Actor): void
```
**Location**: `src/lib/services/permissionService.ts:99`

**Usage**: Required for all authenticated operations

**Throws**: `AuthRequiredError` if public

---

#### 2. Admin Checks
```typescript
assertAdmin(actor: Actor): void
```
**Location**: `src/lib/services/permissionService.ts:109`

**Usage**: Required for admin-only operations

**Throws**: `PermissionDeniedError` if not admin

---

#### 3. Practice Admin Checks
```typescript
assertPracticeAdmin(actor: Actor, practiceId?: string): void
```
**Location**: `src/lib/services/permissionService.ts:132`

**Usage**: Required for practice admin operations

**Throws**: `PermissionDeniedError` if not practice admin

**Scope Enforcement**: If `practiceId` provided, verifies actor's practice matches

---

#### 4. Approval Permission Checks
```typescript
canApproveAsPracticeAdmin(actor: Actor, request: ApprovalRequest): boolean
```
**Location**: `src/lib/services/permissionService.ts:189`

**Usage**: Check if actor can approve as practice admin

**Returns**: `true` if actor is practice admin for request's practice

---

### Permission Enforcement Points

**Service Layer** (Primary Enforcement):
- All business logic functions check permissions
- Functions throw errors if permission denied
- UI should handle errors gracefully

**UI Layer** (Secondary Enforcement):
- Hide/show UI elements based on permissions
- Redirect unauthorized users
- Show appropriate error messages

**Example**:
```typescript
// Service layer (enforced)
export function decideAsPracticeAdmin(actor: Actor, requestId: string, ...) {
  assertPracticeAdmin(actor, request.practiceId); // Throws if not authorized
  // ... proceed with approval
}

// UI layer (user experience)
{canApproveAsPracticeAdmin(actor, request) && (
  <Button onClick={() => decideAsPracticeAdmin(...)}>Approve</Button>
)}
```

---

## Governance Rules

### Rule 1: Last Practice Admin Guard

**Description**: Cannot remove the last Practice Admin from a practice

**Enforcement**:
- Checked in `validateRosterPayload()` - `src/lib/services/approvalEngine.ts:327`
- Checked in `decideAsAdmin()` / `decideAsPracticeAdmin()` - Approval functions

**Function**:
```typescript
function checkLastPracticeAdminGuard(practiceId: string, doctorId: string): void {
  const practiceAdmins = doctors.filter(
    d => d.practiceId === practiceId && d.roleInPractice === 'practice_admin'
  );
  
  if (practiceAdmins.length === 1 && practiceAdmins[0].id === doctorId) {
    throw new ValidationError('Cannot remove last Practice Admin');
  }
}
```

**Location**: `src/lib/services/approvalEngine.ts`

---

### Rule 2: Last Location Guard

**Description**: Cannot remove the last location from a practice

**Enforcement**:
- Checked in `validateLocationApprovalRequest()` - `src/lib/services/approvalEngine.ts:318`
- UI prevents removal if only one location

**Function**:
```typescript
function checkLastLocationGuard(practiceId: string, locationId: string): void {
  const practice = getPracticeById(practiceId);
  if (practice.locationList.length === 1 && practice.locationList[0].id === locationId) {
    throw new ValidationError('Cannot remove last location');
  }
}
```

---

### Rule 3: Idempotency Protection

**Description**: Cannot add doctor already in practice, cannot remove doctor not in practice

**Enforcement**:
- Checked in `validateRosterPayload()` - `src/lib/services/approvalEngine.ts:327`

**Function**:
```typescript
function validateRosterPayload(type: ApprovalType, payload: any, target: any): void {
  const practice = getPracticeById(target.practiceId);
  const doctorId = payload.doctorId;
  
  if (type === 'practice_doctor_add_request') {
    if (practice.doctorIds.includes(doctorId)) {
      throw new ConflictError('Doctor already in practice');
    }
  }
  
  if (type === 'practice_doctor_remove_request') {
    if (!practice.doctorIds.includes(doctorId)) {
      throw new NotFoundError('Doctor not in practice');
    }
  }
}
```

---

### Rule 4: Scope Enforcement

**Description**: Practice Admin can only approve requests for their own practice

**Enforcement**:
- Checked in `canApproveAsPracticeAdmin()` - `src/lib/services/permissionService.ts:189`
- Checked in `decideAsPracticeAdmin()` - `src/lib/services/approvalEngine.ts:580`

**Function**:
```typescript
export function canApproveAsPracticeAdmin(actor: Actor, request: ApprovalRequest): boolean {
  if (actor.kind !== 'doctor' || actor.roleInPractice !== 'practice_admin') {
    return false;
  }
  
  const requestPracticeId = request.target?.practiceId || request.approvals?.practiceAdmin?.practiceId;
  return actor.practiceId === requestPracticeId;
}
```

---

### Rule 5: Pure Rejection

**Description**: Rejecting a request does not apply any mutations

**Enforcement**:
- `decideAsAdmin()` / `decideAsPracticeAdmin()` only update status on rejection
- No side effects executed on rejection

**Function**:
```typescript
export function decideAsAdmin(actor: Actor, requestId: string, decision: 'approve' | 'reject', ...) {
  if (decision === 'reject') {
    updateApprovalRequest(requestId, { adminStatus: 'rejected', ... });
    appendApprovalHistory(...);
    addNotification(...); // Notify requester only
    return; // No mutations
  }
  
  // On approve: execute side effects
  // ...
}
```

---

### Rule 6: Snapshot Integrity

**Description**: Before/after snapshots must be deep cloned to prevent mutation

**Enforcement**:
- Deep clone before storing snapshots
- Use structured clone or JSON parse/stringify

**Function**:
```typescript
function createSnapshot<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)); // Deep clone
}
```

**Location**: Used in `submitApprovalRequest()` for edit requests

---

### Rule 7: History Integrity

**Description**: All state transitions must be logged in history

**Enforcement**:
- Every approval/rejection appends to history
- History is append-only (immutable)

**Function**:
```typescript
appendApprovalHistory(requestId, {
  action: 'approved' | 'rejected',
  actor: { actorId, actorRole, actorName },
  timestamp: nowISO(),
  notes: '...'
});
```

**Location**: `src/lib/storage/approvalStorage.ts`

---

## Approval History

### History Record Structure

```typescript
interface ApprovalHistoryRecord {
  id: string;
  requestId: string;
  action: 'submitted' | 'approved' | 'rejected' | 'updated';
  actor: {
    actorId: string; // doctorId or 'admin'
    actorRole: 'admin' | 'practice_admin' | 'doctor';
    actorName?: string;
    practiceId?: string;
  };
  timestamp: string;
  notes?: string;
  metadata?: Record<string, any>;
}
```

**Location**: `src/types/approvals.ts`

---

### History Functions

**Add History**:
```typescript
appendApprovalHistory(requestId: string, record: ApprovalHistoryRecord): void
```
**Location**: `src/lib/storage/approvalStorage.ts`

**Get History**:
```typescript
getApprovalHistory(requestId: string): ApprovalHistoryRecord[]
```
**Location**: `src/lib/storage/approvalStorage.ts`

---

## Notification Triggers

### Approval-Related Notifications

**1. Request Created**:
- Practice Admin: `practice_admin_approval_request`
- Admin: `admin_approval_request` (if high priority)

**Function**: `submitApprovalRequest()` - Creates notifications

**2. Approval Status Changed**:
- Requester: `admin_approval_result` or `practice_admin_approval_result`
- Other approver: Status update notification

**Function**: `decideAsAdmin()` / `decideAsPracticeAdmin()` - Creates notifications

**3. Request Approved**:
- Requester: `request_approved` (with details)
- Practice Admin: `doctor_added_to_practice` (if applicable)

**Function**: Approval functions - Creates notifications

**4. Request Rejected**:
- Requester: `request_rejected` (with reason)

**Function**: Approval functions - Creates notifications

---

## Error Handling

### Common Scenarios

**1. Practice Admin Not Found**:
- If practice has no Practice Admin
- Admin must assign Practice Admin first
- Or admin handles approval directly

**Function**: `findPracticeAdminDoctor()` - `src/lib/services/approvalEngine.ts:91`

**2. Practice Deleted**:
- If practice deleted while request pending
- Request automatically rejected
- Applicant notified

**3. Doctor Already Exists**:
- If email already in system
- Request rejected with reason
- Suggest login instead

**Function**: Validation in `submitApprovalRequest()`

**4. Invitation Expired**:
- If invitation expired
- Doctor cannot use invitation link
- Practice Admin can resend invitation

---

## Best Practices

### 1. Always Check Permissions
- Use `assert*()` functions at service layer
- Check permissions before UI actions
- Handle errors gracefully

### 2. Validate Before Submission
- Validate payload before creating request
- Check for duplicates
- Check governance rules

### 3. Log All Actions
- Append to history for every state change
- Include actor information
- Include timestamps

### 4. Notify Appropriately
- Notify requester on status change
- Notify approvers when action needed
- Use deep links for easy navigation

### 5. Maintain Data Integrity
- Deep clone snapshots
- Two-sided mutations (practice + doctor)
- Idempotency protection

---

**Last Updated**: January 29, 2026  
**Documentation Version**: 1.0
