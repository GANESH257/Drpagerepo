# V2 Approval Workflows Documentation

## Overview

This document details all approval workflows in AIP v2, including multi-party approval processes, status transitions, and UI requirements. This is critical for implementing the approval system correctly.

**Last Updated**: January 29, 2026  
**Version**: 2.0

---

## Approval System Architecture

### Unified Approval Queue

All approval requests are stored in a single queue: `aip_approval_requests`

**Benefits**:
- Single source of truth
- Easier to track and manage
- Clear status visibility
- Unified admin UI

### Approval Request Types

1. `doctor_join_existing_practice` - Doctor wants to join existing practice
2. `practice_create_with_admin` - Doctor creates new practice (becomes Practice Admin)
3. `practice_edit` - Practice Admin requests practice changes
4. `doctor_add_to_practice` - Practice Admin adds doctor (via invitation)
5. `practice_location_change` - Practice Admin adds/edits/removes location
6. `practice_insurance_change` - Practice Admin edits insurance list
7. `practice_services_change` - Practice Admin edits services list

---

## Workflow Scenarios

### Scenario A: Doctor Joins Existing Practice

**Flow Diagram**:
```
Doctor Signs Up
    ↓
Selects Existing Practice
    ↓
Submits Doctor Info
    ↓
Status: pending_practice_admin_approval + pending_admin_approval
    ↓
    ├─→ Practice Admin Reviews
    │       ├─→ Approves → practiceAdminStatus: 'approved'
    │       └─→ Denies → practiceAdminStatus: 'rejected' → REJECTED
    │
    └─→ Admin Reviews
            ├─→ Approves → adminStatus: 'approved'
            └─→ Denies → adminStatus: 'rejected' → REJECTED
    ↓
Both Approved?
    ├─→ YES → Doctor becomes Active
    └─→ NO → Request Rejected
```

**Detailed Steps**:

1. **Doctor Initiates Request**
   - Doctor visits `/join-us`
   - Selects "Join Existing Practice"
   - Chooses practice from dropdown/search
   - Fills doctor profile form
   - Submits application

2. **Request Created**
   ```typescript
   {
     type: 'doctor_join_existing_practice',
     requestedBy: doctorId,
     practiceId: selectedPracticeId,
     payload: {
       doctor: { firstName, lastName, email, specialty, ... }
     },
     adminStatus: 'pending',
     practiceAdminStatus: 'pending'
   }
   ```

3. **Practice Admin Notification**
   - Practice Admin receives notification
   - Notification type: `practice_admin_approval_request`
   - Link to approval screen

4. **Practice Admin Reviews**
   - Views request details
   - Sees doctor information
   - Options:
     - **Approve**: Sets `practiceAdminStatus: 'approved'`
     - **Deny**: Sets `practiceAdminStatus: 'rejected'` + reason

5. **Admin Reviews** (can happen before/after Practice Admin)
   - Admin sees request in approval queue
   - Views all details
   - Options:
     - **Approve**: Sets `adminStatus: 'approved'`
     - **Deny**: Sets `adminStatus: 'rejected'` + reason

6. **Final Decision**
   - **Both Approved**: Doctor created, added to practice, portal access granted
   - **Either Rejected**: Request rejected, applicant notified

**Status Transitions**:
```
pending + pending → approved + approved → ACTIVE
pending + pending → rejected + * → REJECTED
pending + pending → * + rejected → REJECTED
```

**UI Requirements**:
- Show both approval statuses
- Show who approved/rejected
- Show rejection reasons
- Show timestamps
- Allow Practice Admin to approve/deny
- Allow Admin to approve/deny
- Show final status clearly

---

### Scenario B: Doctor Creates New Practice

**Flow Diagram**:
```
Doctor Signs Up
    ↓
Selects "Create New Practice"
    ↓
Fills Practice Info
    ↓
Fills Doctor Info (as Practice Admin)
    ↓
Submits Application
    ↓
Status: pending_admin_approval
    ↓
Admin Reviews
    ↓
    ├─→ Approves → Practice Created + Doctor Created as Practice Admin
    └─→ Denies → Nothing Created, Applicant Notified
```

**Detailed Steps**:

1. **Doctor Initiates Request**
   - Doctor visits `/join-us`
   - Selects "Create New Practice"
   - Fills practice information form:
     - Practice name, description
     - Address, phone, email
     - Initial location
     - Insurance, services
   - Fills doctor profile (as Practice Admin)
   - Submits application

2. **Request Created**
   ```typescript
   {
     type: 'practice_create_with_admin',
     requestedBy: doctorEmail, // May not have doctorId yet
     practiceId: null, // Practice doesn't exist yet
     payload: {
       practice: { name, description, address, ... },
       doctor: { firstName, lastName, email, specialty, ... }
     },
     adminStatus: 'pending'
     // No practiceAdminStatus (practice doesn't exist)
   }
   ```

3. **Admin Reviews**
   - Admin sees "New Practice + Practice Admin Doctor" request
   - Views practice details
   - Views doctor details
   - Options:
     - **Approve**: Creates practice + doctor, sets doctor as Practice Admin
     - **Deny**: Rejects request, sends notification

4. **On Approval**:
   - Practice created with provided data
   - Doctor created and linked to practice
   - Practice Admin role assigned: `aip_practice_roles[practiceId].adminDoctorId = doctorId`
   - Doctor portal access granted
   - Practice Admin portal access granted

5. **On Rejection**:
   - Request marked as rejected
   - Applicant receives notification
   - No data created

**Status Transitions**:
```
pending → approved → ACTIVE (Practice + Doctor Created)
pending → rejected → REJECTED
```

**UI Requirements**:
- Show practice creation form
- Show doctor profile form
- Admin sees combined view
- Show approval/rejection clearly
- Show created practice/doctor IDs on approval

---

### Scenario C: Practice Admin Invites Doctor

**Flow Diagram**:
```
Practice Admin Invites Doctor
    ↓
Enters Doctor Email + Basic Info
    ↓
Invitation Created (status: 'sent')
    ↓
Email Sent (future) / Link Generated
    ↓
Doctor Clicks Invitation Link
    ↓
Practice Preselected
    ↓
Doctor Completes Profile
    ↓
Join Request Created
    ↓
Status: pending_admin_approval + pending_practice_admin_approval
    ↓
Practice Admin Approval (may auto-approve)
    ↓
Admin Approval
    ↓
Both Approved → Doctor Added to Practice
```

**Detailed Steps**:

1. **Practice Admin Invites**
   - Practice Admin goes to `/doctor/dashboard/practice/doctors`
   - Clicks "Invite Doctor"
   - Enters:
     - Doctor email (required)
     - Doctor name (optional, if known)
     - Message (optional)
   - Submits invitation

2. **Invitation Created**
   ```typescript
   {
     id: invitationId,
     practiceId: practiceId,
     email: doctorEmail,
     invitedBy: practiceAdminId,
     status: 'sent',
     token: uniqueToken,
     expiresAt: date + 30 days
   }
   ```

3. **Invitation Sent**
   - Email sent with invitation link (future)
   - Link format: `/join-us?invitation={token}`
   - For now: Show invitation link in UI

4. **Doctor Accepts Invitation**
   - Doctor clicks invitation link
   - Practice preselected in form
   - Doctor completes profile
   - Submits application

5. **Join Request Created**
   ```typescript
   {
     type: 'doctor_add_to_practice',
     requestedBy: doctorId,
     practiceId: practiceId, // From invitation
     payload: {
       doctor: { ... },
       invitationId: invitationId
     },
     adminStatus: 'pending',
     practiceAdminStatus: 'pending' // Or 'approved' if auto-approve
   }
   ```

6. **Approval Flow**
   - **Practice Admin**: May auto-approve (since they invited) OR manual approval
   - **Admin**: Always required
   - Both must approve → Doctor added to practice

**Status Transitions**:
```
invitation: sent → accepted → join request created
join request: pending + pending → approved + approved → ACTIVE
```

**UI Requirements**:
- Show invitation form
- Show invitation list (sent, accepted, expired)
- Show invitation link (for now, until email implemented)
- Pre-select practice in join form
- Show invitation context in approval queue

---

### Scenario D: Practice Edit Request

**Flow Diagram**:
```
Practice Admin Edits Practice
    ↓
Submits Changes
    ↓
Edit Request Created (status: pending_admin_approval)
    ↓
Admin Reviews Changes
    ↓
    ├─→ Approves → Changes Applied to Practice
    └─→ Denies → Changes Rejected, Practice Unchanged
```

**Detailed Steps**:

1. **Practice Admin Requests Edit**
   - Practice Admin goes to `/doctor/dashboard/practice`
   - Makes changes to:
     - Practice name/description
     - Contact information
     - Locations (add/edit/remove)
     - Insurance list
     - Services list
   - Clicks "Submit Changes"

2. **Edit Request Created**
   ```typescript
   {
     type: 'practice_edit', // Or specific: 'practice_location_change'
     requestedBy: practiceAdminId,
     practiceId: practiceId,
     payload: {
       changes: {
         name: 'New Name', // If changed
         locations: [...], // Updated locations
         insurance: [...], // Updated insurance
         // ... other changes
       },
       original: {
         // Original practice data (for diff view)
       }
     },
     adminStatus: 'pending'
   }
   ```

3. **Admin Reviews**
   - Admin sees "Practice Edit Request"
   - Views diff (what changed)
   - Views original vs proposed
   - Options:
     - **Approve**: Applies changes to practice
     - **Deny**: Rejects changes, practice unchanged

4. **On Approval**:
   - Changes merged into practice data
   - Practice updated
   - Practice Admin notified

5. **On Rejection**:
   - Changes rejected
   - Practice Admin notified with reason
   - Practice remains unchanged

**Edit Types**:
- `practice_edit` - General practice info
- `practice_location_change` - Location add/edit/remove
- `practice_insurance_change` - Insurance list changes
- `practice_services_change` - Services list changes

**Status Transitions**:
```
pending → approved → CHANGES APPLIED
pending → rejected → CHANGES REJECTED
```

**UI Requirements**:
- Show diff view (before/after)
- Highlight changes
- Show what fields changed
- Show approval/rejection clearly
- Allow admin to edit before approving

---

## Approval Queue UI Requirements

### Admin Portal Approval Screen

**Route**: `/admin/requests` (enhanced)

**Display Requirements**:

1. **Request List**
   - Table/card view of all pending requests
   - Filter by type, status, practice
   - Sort by date, priority

2. **Request Card/Row**
   - Type badge (color-coded)
   - Who requested (name, email)
   - Practice involved (if applicable)
   - Current status (both approvals if applicable)
   - Requested date
   - Action buttons

3. **Request Detail View**
   - Full request information
   - Payload data (formatted)
   - Approval statuses (both if applicable)
   - Approval history
   - Action buttons with reason fields
   - Diff view (for edit requests)

4. **Action Buttons**
   - Approve (with optional notes)
   - Deny (with required reason)
   - View Details
   - Edit (admin can modify before approving)

**Request Types Display**:
- "New Practice + Practice Admin Doctor" (practice_create_with_admin)
- "Doctor Joining Practice" (doctor_join_existing_practice)
- "Practice Edit Request" (practice_edit)
- "Practice Location Change" (practice_location_change)
- "Practice Insurance Change" (practice_insurance_change)
- "Practice Services Change" (practice_services_change)

### Practice Admin Approval Screen

**Route**: `/doctor/dashboard/practice/approvals` (NEW)

**Display Requirements**:

1. **Pending Requests**
   - Only requests for their practice
   - Doctor join requests
   - Invitation acceptances

2. **Request Detail**
   - Doctor information
   - Requested date
   - Admin approval status (if already reviewed)
   - Action buttons

3. **Action Buttons**
   - Approve (with optional notes)
   - Deny (with required reason)

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

### Status Combinations

| Admin Status | Practice Admin Status | Final Status | Action |
|-------------|----------------------|--------------|--------|
| pending | pending | PENDING | Awaiting both |
| pending | approved | PENDING | Awaiting admin |
| approved | pending | PENDING | Awaiting practice admin |
| approved | approved | APPROVED | ✅ Complete |
| rejected | * | REJECTED | ❌ Rejected |
| * | rejected | REJECTED | ❌ Rejected |

### Status Transitions

**Valid Transitions**:
```
pending → approved ✅
pending → rejected ✅
approved → (cannot change) ❌
rejected → (cannot change) ❌
```

**Notes**:
- Once approved/rejected, status cannot change
- Admin can override (bypass workflow)
- Status changes logged with timestamp

---

## Notification Triggers

### Approval-Related Notifications

1. **Request Created**
   - Practice Admin: `practice_admin_approval_request`
   - Admin: `admin_approval_request` (if high priority)

2. **Approval Status Changed**
   - Requester: `admin_approval_result` or `practice_admin_approval_result`
   - Other approver: Status update notification

3. **Request Approved**
   - Requester: `request_approved` (with details)
   - Practice Admin: `doctor_added_to_practice` (if applicable)

4. **Request Rejected**
   - Requester: `request_rejected` (with reason)
   - Practice Admin: `join_request_rejected` (if applicable)

---

## Error Handling

### Common Scenarios

1. **Practice Admin Not Found**
   - If practice has no Practice Admin
   - Admin must assign Practice Admin first
   - Or admin handles approval directly

2. **Practice Deleted**
   - If practice deleted while request pending
   - Request automatically rejected
   - Applicant notified

3. **Doctor Already Exists**
   - If email already in system
   - Request rejected with reason
   - Suggest login instead

4. **Invitation Expired**
   - If invitation expired
   - Doctor cannot use invitation link
   - Practice Admin can resend invitation

---

## Implementation Checklist

### Data Structures
- [ ] Create `ApprovalRequest` interface
- [ ] Create `PracticeInvitation` interface
- [ ] Implement `aip_approval_requests` storage
- [ ] Implement `aip_practice_invitations` storage

### Approval Functions
- [ ] `createApprovalRequest(type, data)`
- [ ] `approveRequest(requestId, approverRole, notes?)`
- [ ] `rejectRequest(requestId, approverRole, reason)`
- [ ] `getPendingRequests(role, practiceId?)`
- [ ] `checkApprovalStatus(requestId)`

### UI Components
- [ ] Admin approval queue screen
- [ ] Practice Admin approval screen
- [ ] Request detail view
- [ ] Diff view (for edit requests)
- [ ] Approval/rejection dialogs

### Workflows
- [ ] Doctor join existing practice flow
- [ ] Practice creation flow
- [ ] Practice Admin invitation flow
- [ ] Practice edit request flow

### Notifications
- [ ] Approval request notifications
- [ ] Approval result notifications
- [ ] Status change notifications

---

**Next Steps**: See `V2_IMPLEMENTATION_ROADMAP.md` for implementation timeline.
