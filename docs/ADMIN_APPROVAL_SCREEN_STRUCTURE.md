# Admin Approval Screen Structure

## Overview

This document details the current structure of the Admin Approval screens in the V2 implementation. The admin approval system consists of three main pages: the approval queue list, the approval detail page, and the approval history page.

**Route Base:** `/admin/requests-v2`  
**Implementation Date:** Step 5 (V2 Implementation)  
**Status:** ✅ Complete  
**TypeScript Errors:** 0

---

## Page Structure

### 1. Admin Approval Queue (`/admin/requests-v2`)

**File:** `src/app/admin/requests-v2/page.tsx`

#### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ SectionHeader                                           │
│   Title: "Approval Requests (V2)"                      │
│   Description: "Review and manage all approval requests" │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Stats Cards (5 cards in grid)                          │
│   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│   │Total │ │Pending│ │Under │ │Approved│ │Rejected│    │
│   │      │ │(yellow)│ │Review│ │(green) │ │(red)  │    │
│   └──────┘ └──────┘ └──────┘ └──────┘ └──────┘        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ SearchAndFilterBar                                      │
│   [Search Input] [Status Filter] [Type Filter]         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Requests Table (Card wrapper)                          │
│   ┌──────────────────────────────────────────────────┐  │
│   │ Type │ Status │ Submitted │ By │ Target │ ... │  │  │
│   ├──────────────────────────────────────────────────┤  │
│   │ [Badge] │ [Badge] │ Date │ Role │ Name │ ... │  │  │
│   │ ...     │ ...     │ ...  │ ...  │ ...  │ ... │  │  │
│   └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### Components Used

1. **SectionHeader**
   - Title: "Approval Requests (V2)"
   - Description: "Review and manage all approval requests"

2. **Stats Cards** (5 cards)
   - Total Requests (all requests)
   - Pending (admin status = pending, yellow)
   - Under Review (status = under_review, blue)
   - Approved (status = approved, green)
   - Rejected (status = rejected, red)

3. **SearchAndFilterBar**
   - Search input: Searches by practice name, doctor name, or email
   - Status filter: All, Submitted, Under Review, Approved, Rejected
   - Type filter: All Types, New Practice, Doctor Join, Practice Edit, etc.

4. **Requests Table**
   - Columns:
     - **Type:** `ApprovalTypeBadge` component
     - **Status:** `ApprovalStatusBadge` component (request.status)
     - **Submitted:** Formatted date/time
     - **Submitted By:** Role + email (if available)
     - **Target:** Practice name or Doctor name (derived from target.practiceId or target.doctorId)
     - **Required Approvals:** Shows both admin and practice admin statuses
       - "Admin: [status badge]"
       - "Practice Admin: [status badge]" (if applicable)
     - **Actions:** "Open" button (Eye icon) → navigates to detail page

#### Data Flow

1. **Load Requests:**
   ```typescript
   const allRequests = getApprovalRequests();
   setRequests(allRequests);
   setFilteredRequests(allRequests);
   ```

2. **Filtering Logic:**
   - Filter by status: `r.status === filters.status`
   - Filter by type: `r.type === filters.type`
   - Search: Matches practice name, doctor name, or submittedBy.email

3. **Stats Calculation:**
   - Pending: `requests.filter(r => r.approvals.admin.status === 'pending')`
   - Under Review: `requests.filter(r => r.status === 'under_review')`
   - Approved: `requests.filter(r => r.status === 'approved')`
   - Rejected: `requests.filter(r => r.status === 'rejected')`

#### Key Features

- **Permission Check:** `assertAdmin(actor)` on page load
- **Empty State:** Shows `EmptyState` component when no requests match filters
- **Navigation:** Clicking "Open" navigates to `/admin/requests-v2/[id]`

---

### 2. Admin Approval Detail Page (`/admin/requests-v2/[id]`)

**File:** `src/app/admin/requests-v2/[id]/page.tsx`

#### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ SectionHeader + Back Button                            │
│   Title: "Approval Request Details"                    │
│   Description: "Request ID: {id}"                       │
│   [Back to Queue] button                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Request Summary Card                                   │
│   ┌──────────────────────────────────────────────────┐  │
│   │ Title: Request Summary                          │  │
│   │ Badges: [Type Badge] [Status Badge]            │  │
│   ├──────────────────────────────────────────────────┤  │
│   │ Submitted At │ Last Updated                     │  │
│   │ Submitted By │ Target (Practice/Doctor)          │  │
│   └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Approval Status Card                                   │
│   ┌──────────────────────────────────────────────────┐  │
│   │ Title: Approval Status                           │  │
│   ├──────────────────────────────────────────────────┤  │
│   │ Admin Approval: [Badge] on {date}                │  │
│   │ Notes: {admin.notes}                             │  │
│   ├──────────────────────────────────────────────────┤  │
│   │ Practice Admin Approval: [Badge] on {date}       │  │
│   │ Notes: {practiceAdmin.notes}                     │  │
│   └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Requested Changes Card                                 │
│   ┌──────────────────────────────────────────────────┐  │
│   │ Title: Requested Changes                         │  │
│   │ [JSON Payload Display]                           │  │
│   └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Actions Card                                           │
│   ┌──────────────────────────────────────────────────┐  │
│   │ Title: Actions                                   │  │
│   │ [Mark Under Review] [Approve] [Reject] buttons   │  │
│   └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Timeline Card                                          │
│   ┌──────────────────────────────────────────────────┐  │
│   │ Title: Timeline                                  │  │
│   │ [Timeline Component]                             │  │
│   └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### Components Used

1. **Request Summary Card**
   - Shows request metadata:
     - Submitted At (formatted date/time)
     - Last Updated (formatted date/time)
     - Submitted By (role + email)
     - Target (Practice name or Doctor name with link)

2. **Approval Status Card**
   - **Admin Approval Section:**
     - Status badge
     - Decided date (if decided)
     - Notes (if provided)
   - **Practice Admin Approval Section:** (if applicable)
     - Status badge
     - Decided date (if decided)
     - Notes (if provided)

3. **Requested Changes Card**
   - Displays payload as formatted JSON
   - Uses `<pre>` tag with gray background
   - Scrollable if content is long

4. **Actions Card**
   - **Mark Under Review Button:**
     - Visible when: `request.status === 'submitted'`
     - Opens dialog with optional notes field
     - Calls `markUnderReview(actor, request.id, notes)`
   - **Approve Button:**
     - Visible when: `request.approvals.admin.status === 'pending'`
     - Opens dialog with optional notes field
     - Calls `decideAsAdmin(actor, request.id, 'approve', { notes })`
   - **Reject Button:**
     - Visible when: `request.approvals.admin.status === 'pending'`
     - Opens dialog with required reason + optional notes
     - Calls `decideAsAdmin(actor, request.id, 'reject', { reason, notes })`

5. **Timeline Card**
   - Uses `Timeline` component
   - Displays all approval history records
   - Sorted by date descending (newest first)
   - Shows action, actor, timestamp, reason, notes

#### Action Dialogs

**Mark Under Review Dialog:**
- Title: "Mark Request Under Review"
- Description: "Add optional notes about why this request is being reviewed."
- Field: Notes (Textarea, optional)
- Actions: Cancel, "Mark Under Review"

**Approve Dialog:**
- Title: "Approve Request"
- Description: "Approve this request. Add optional notes."
- Field: Notes (Textarea, optional)
- Actions: Cancel, "Approve"

**Reject Dialog:**
- Title: "Reject Request"
- Description: "Reject this request. A reason is required."
- Fields:
  - Reason (Input, required)
  - Notes (Textarea, optional)
- Actions: Cancel, "Reject" (disabled if reason empty)

#### Data Flow

1. **Load Request:**
   ```typescript
   const requests = getApprovalRequests();
   const foundRequest = requests.find(r => r.id === requestId);
   ```

2. **Load Timeline:**
   ```typescript
   const history = getApprovalTimeline(requestId);
   setTimeline(history);
   ```

3. **After Actions:**
   - Reloads request from storage
   - Reloads timeline
   - Updates UI state
   - Shows success/error toast

#### Key Features

- **Permission Check:** `assertAdmin(actor)` on page load
- **404 Handling:** Redirects to queue if request not found
- **Real-time Updates:** Reloads data after actions
- **Conditional Actions:** Buttons shown based on approval status
- **Target Links:** Links to practice/doctor pages when available

---

### 3. Admin Approval History (`/admin/history/approvals`)

**File:** `src/app/admin/history/approvals/page.tsx`

#### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ SectionHeader                                           │
│   Title: "Approval History"                             │
│   Description: "Complete audit log of all approval..."  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Filters (Accordion)                                    │
│   ┌──────────────────────────────────────────────────┐  │
│   │ [Type Filter] [Status Filter] [Date Range]      │  │
│   │ [Practice Filter] [Doctor Filter]                │  │
│   └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ History Table                                           │
│   ┌──────────────────────────────────────────────────┐  │
│   │ Action │ Type │ Request │ Practice │ Doctor │...│  │
│   ├──────────────────────────────────────────────────┤  │
│   │ [Badge] │ [Badge] │ ID │ Name │ Name │ ... │  │  │
│   └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Details Drawer (Right Side)                             │
│   ┌──────────────────────────────────────────────────┐  │
│   │ Request Details                                  │  │
│   │ Timeline                                         │  │
│   └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### Components Used

1. **Filters Accordion**
   - Type filter (all approval types)
   - Status filter (action types: submitted, approved, rejected, etc.)
   - Date range picker
   - Practice filter (dropdown)
   - Doctor filter (dropdown)

2. **History Table**
   - Columns:
     - **Action:** Action badge (submitted, admin_approved, etc.)
     - **Type:** Approval type badge
     - **Request ID:** Clickable link to detail page
     - **Practice:** Practice name (if applicable)
     - **Doctor:** Doctor name (if applicable)
     - **Actor:** Who performed the action
     - **Date/Time:** Formatted timestamp

3. **Details Drawer**
   - Opens when clicking a history record
   - Shows request details
   - Shows timeline for that request
   - Right-side slide-out panel

#### Key Features

- **Append-Only Log:** Shows all approval history records
- **Advanced Filtering:** Multiple filter criteria
- **Deep Linking:** Links to request detail pages
- **Drawer View:** Side panel for detailed view

---

## Shared Components

### 1. ApprovalStatusBadge

**File:** `src/components/shared/approvals/ApprovalStatusBadge.tsx`

Displays approval status with color-coded badges:
- `submitted` → Outline badge
- `under_review` → Secondary badge
- `approved` → Default (green) badge
- `rejected` → Destructive (red) badge

### 2. ApprovalTypeBadge

**File:** `src/components/shared/approvals/ApprovalTypeBadge.tsx`

Maps approval types to human-readable labels:
- `new_practice_with_admin_doctor` → "New Practice + Admin Doctor"
- `doctor_join_practice` → "Doctor Joining Practice"
- `practice_edit_request` → "Practice Edit Request"
- `practice_location_add_request` → "Location Add"
- `practice_location_edit_request` → "Location Edit"
- `practice_location_remove_request` → "Location Remove"
- etc.

### 3. Timeline

**File:** `src/components/shared/approvals/Timeline.tsx`

Displays approval history records:
- Sorted by date descending (newest first)
- Shows action badge, actor, timestamp
- Displays reason and notes if available
- Supports both `ApprovalHistoryRecord` and `ReferralHistoryRecord`

### 4. SearchAndFilterBar

**File:** `src/components/shared/approvals/SearchAndFilterBar.tsx`

Search and filter component:
- Search input (searches practice name, doctor name, email)
- Status filter dropdown
- Type filter dropdown
- Configurable to show/hide filters

### 5. SectionHeader

**File:** `src/components/shared/approvals/SectionHeader.tsx`

Consistent section header:
- Title and description
- Optional action buttons
- Responsive layout

### 6. EmptyState

**File:** `src/components/shared/approvals/EmptyState.tsx`

Empty state component:
- Title and description
- Optional action button
- Optional icon

---

## Data Models

### ApprovalRequest Structure

```typescript
interface ApprovalRequest {
  id: string; // "apr-..."
  type: ApprovalType;
  status: ApprovalStatus; // 'submitted' | 'under_review' | 'approved' | 'rejected'
  
  submittedAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  
  submittedBy: {
    role: 'public' | 'doctor' | 'practice_admin' | 'admin';
    email?: string;
    doctorId?: string;
    practiceId?: string;
  };
  
  approvals: {
    admin: {
      status: 'pending' | 'approved' | 'rejected';
      decidedAt?: string;
      notes?: string;
    };
    practiceAdmin?: {
      practiceId: string;
      status: 'pending' | 'approved' | 'rejected';
      decidedAt?: string;
      notes?: string;
    };
  };
  
  target: {
    practiceId?: string;
    doctorId?: string;
    invitedDoctorEmail?: string;
  };
  
  payload: Record<string, any>; // Type-specific payload
}
```

### ApprovalHistoryRecord Structure

```typescript
interface ApprovalHistoryRecord {
  id: string; // "ahr-..."
  requestId: string;
  type: ApprovalType;
  
  practiceId?: string;
  doctorId?: string;
  
  action: 
    | 'submitted'
    | 'under_review'
    | 'admin_approved'
    | 'admin_rejected'
    | 'practice_admin_approved'
    | 'practice_admin_rejected'
    | 'final_approved'
    | 'final_rejected';
  
  at: string; // ISO timestamp
  
  by: {
    role: 'admin' | 'practice_admin' | 'doctor' | 'public';
    email?: string;
    doctorId?: string;
    practiceId?: string;
  };
  
  reason?: string;
  notes?: string;
  
  snapshot?: ApprovalRequest; // Full request snapshot
}
```

---

## Approval Workflow

### Status Flow

```
submitted → under_review → approved/rejected
```

### Dual Approval Flow

For requests requiring practice admin approval:

```
1. Request Submitted
   ├─ Admin: pending
   └─ Practice Admin: pending

2. Admin Approves
   ├─ Admin: approved
   └─ Practice Admin: pending (still waiting)

3. Practice Admin Approves
   ├─ Admin: approved
   ├─ Practice Admin: approved
   └─ Status: approved → Side effects applied

OR

2. Admin Rejects
   ├─ Admin: rejected
   └─ Status: rejected (final, no practice admin needed)
```

### Action Functions

**`markUnderReview(actor, requestId, notes?)`**
- Changes status from `submitted` to `under_review`
- Appends history record
- No approval decision made

**`decideAsAdmin(actor, requestId, decision, opts?)`**
- If `approve`:
  - Sets `admin.status = 'approved'`
  - If practice admin still pending → status stays `under_review`
  - If practice admin already approved → status becomes `approved` → side effects applied
- If `reject`:
  - Sets `admin.status = 'rejected'`
  - Sets status to `rejected` (final)
  - No side effects applied

---

## Filtering & Search

### Search Functionality

Searches across:
- Practice name (from `target.practiceId`)
- Doctor name (from `target.doctorId`)
- Submitted by email (`submittedBy.email`)

### Filter Options

1. **Status Filter:**
   - All Statuses
   - Submitted
   - Under Review
   - Approved
   - Rejected

2. **Type Filter:**
   - All Types
   - New Practice
   - Doctor Join
   - Practice Edit
   - Add Doctor
   - Remove Doctor
   - Location Change
   - Location Add
   - Location Edit
   - Location Remove
   - Insurance/Services

---

## Navigation Flow

```
/admin/requests-v2 (List)
  └─ Click "Open" → /admin/requests-v2/[id] (Detail)
      └─ Click "Back to Queue" → /admin/requests-v2 (List)

/admin/history/approvals (History)
  └─ Click Request ID → /admin/requests-v2/[id] (Detail)
```

---

## Key Functions Used

### From `approvalEngine.ts`

- `getPendingApprovalsForAdmin()` - Gets pending requests for admin
- `getApprovalTimeline(requestId)` - Gets history for a request
- `markUnderReview(actor, requestId, notes?)` - Marks request as under review
- `decideAsAdmin(actor, requestId, decision, opts?)` - Admin approval/rejection

### From `approvalStorage.ts`

- `getApprovalRequests()` - Gets all approval requests
- `getApprovalHistory()` - Gets all approval history records

---

## UI Patterns

### Color Coding

- **Pending:** Yellow (`text-yellow-600`)
- **Under Review:** Blue (`text-blue-600`)
- **Approved:** Green (`text-green-600`)
- **Rejected:** Red (`text-red-600`)

### Badge Variants

- **Submitted:** Outline
- **Under Review:** Secondary
- **Approved:** Default (green)
- **Rejected:** Destructive (red)

### Layout Patterns

- **Cards:** Used for grouping related information
- **Tables:** Used for list views
- **Dialogs:** Used for actions (approve/reject/mark under review)
- **Drawer:** Used for history detail view

---

## Current Limitations & Future Enhancements

### Current Limitations

1. **Payload Display:** Shows raw JSON (no formatted view for specific types)
2. **Diff View:** Not implemented for edit requests
3. **Bulk Actions:** Not supported
4. **Export:** No export functionality

### Future Enhancements (Not Implemented)

1. **Formatted Payload Views:**
   - Location-specific views for location requests
   - Doctor-specific views for doctor requests
   - Practice-specific views for practice requests

2. **Diff View:**
   - Before/after comparison for edit requests
   - Highlighted changes

3. **Bulk Operations:**
   - Bulk approve/reject
   - Bulk mark under review

4. **Advanced Filtering:**
   - Date range filtering
   - Practice-specific filtering
   - Doctor-specific filtering

5. **Export:**
   - Export to CSV
   - Export to PDF

---

## Related Documentation

- **Step 5 Implementation:** `docs/V2_STEP5_IMPLEMENTATION.md`
- **Approval Workflows:** `docs/V2_APPROVAL_WORKFLOWS.md`
- **Entity Models:** `docs/V2_ENTITY_MODELS.md`
- **Roles & Permissions:** `docs/V2_ROLES_PERMISSIONS.md`

---

## Summary

The Admin Approval Screen structure consists of:

1. **List Page** (`/admin/requests-v2`)
   - Stats cards showing request counts
   - Search and filter bar
   - Table view of all requests
   - Navigation to detail pages

2. **Detail Page** (`/admin/requests-v2/[id]`)
   - Request summary
   - Dual approval status display
   - Payload display (JSON)
   - Action buttons (Mark Under Review, Approve, Reject)
   - Timeline of all actions

3. **History Page** (`/admin/history/approvals`)
   - Complete audit log
   - Advanced filtering
   - Details drawer
   - Deep linking to requests

All pages use shared components for consistency and follow the same UI patterns established in Step 5.
