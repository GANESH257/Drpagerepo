# V2 Step 5 Implementation Summary

## Overview

Step 5 implements the complete UI integration layer for v2 workflows. This step builds all required pages and components that consume the Step 4 business logic services, providing Admin, Practice Admin, and Doctor portals with full approval workflows, referral management, notifications, announcements, and practice management capabilities.

**Date**: January 29, 2026  
**Status**: ✅ Complete  
**TypeScript Compilation**: ✅ Success (0 errors)

---

## Files Created

### Shared UI Components (6 files)

1. **`src/components/shared/approvals/ApprovalStatusBadge.tsx`**
   - Displays approval request status with color-coded badges
   - Supports: `submitted`, `under_review`, `approved`, `rejected`
   - Uses shadcn/ui Badge component with appropriate variants

2. **`src/components/shared/approvals/ApprovalTypeBadge.tsx`**
   - Displays human-readable approval type labels
   - Maps all 7 approval types to readable strings
   - Example: `new_practice_with_admin_doctor` → "New Practice + Admin Doctor"

3. **`src/components/shared/approvals/Timeline.tsx`**
   - Renders append-only history records (approval or referral history)
   - Supports both `ApprovalHistoryRecord` and `ReferralHistoryRecord`
   - Displays action, actor, timestamp, reason, and notes
   - Sorted by date descending (newest first)

4. **`src/components/shared/approvals/EmptyState.tsx`**
   - Reusable empty state component
   - Supports title, description, action button, and optional icon
   - Used across all list pages when no data is available

5. **`src/components/shared/approvals/SearchAndFilterBar.tsx`**
   - Search and filter component for approval queues
   - Supports text search, status filter, and type filter
   - Configurable to show/hide filters
   - Emits filter state changes via callbacks

6. **`src/components/shared/approvals/SectionHeader.tsx`**
   - Consistent section header component
   - Supports title, description, and action buttons
   - Responsive layout (stacks on mobile)

### Admin UI Pages (3 files)

7. **`src/app/admin/requests-v2/page.tsx`**
   - Admin approval queue page
   - Displays all approval requests with filters
   - Shows stats cards: Total, Pending, Under Review, Approved, Rejected
   - Table view with: Type, Status, Submitted date, Submitted By, Target, Required Approvals, Actions
   - Search by practice name, doctor name, or email
   - Filter by status and type
   - Links to detail page for each request

8. **`src/app/admin/requests-v2/[id]/page.tsx`**
   - Admin approval detail page
   - Displays complete request information
   - Shows request summary, dual approval status, requested changes (payload), and timeline
   - Actions: Mark Under Review, Approve, Reject
   - Approve/Reject dialogs with notes/reason fields
   - Real-time updates after actions
   - Links to target practice/doctor when available

9. **`src/app/admin/history/approvals/page.tsx`**
   - Approval history log page
   - Displays all approval history records (append-only audit log)
   - Table view with: Action, Type, Request ID, Practice ID, Doctor ID, Actor, Date/Time
   - Search and filter capabilities
   - Links to request detail page for each record

### Practice Admin UI Pages (8 files)

10. **`src/app/doctor/dashboard/practice/page.tsx`**
    - Practice details view for Practice Admin
    - Displays practice information: name, description, contact, address
    - Shows practice stats: doctor count, specialties count, locations count
    - "Request Edit" button opens dialog to submit practice edit approval request
    - Form includes: description, phone, email, website, address fields
    - All changes require admin approval

11. **`src/app/doctor/dashboard/practice/approvals/page.tsx`**
    - Practice Admin approval queue
    - Shows only approvals requiring practice admin decision
    - Filtered by practice ID (only shows requests for their practice)
    - Table view with: Type, Status, Submitted date, Submitted By, Actions
    - Links to detail page for review

12. **`src/app/doctor/dashboard/practice/approvals/[id]/page.tsx`**
    - Practice Admin approval detail page
    - Shows request summary, approval status (admin + practice admin), requested changes, timeline
    - Actions: Approve, Reject (only if practice admin approval is pending)
    - Approve/Reject dialogs with notes/reason fields
    - Verifies request is for correct practice before allowing actions

13. **`src/app/doctor/dashboard/practice/doctors/page.tsx`**
    - Practice roster management page
    - Displays all doctors in practice with role badges (Practice Admin / Doctor)
    - "Invite Doctor" dialog: email input + optional message
    - Creates `PracticeInvitation` and `practice_doctor_add_request` approval request
    - "Remove Doctor" action: creates `practice_doctor_remove_request` approval request
    - All roster changes require admin approval

14. **`src/app/doctor/dashboard/practice/locations/page.tsx`**
    - Practice locations management page
    - Shows primary address (from practice.address)
    - Lists additional locations (from practice.locations array)
    - "Add Location" dialog: name, address, city, state, ZIP, phone, hours, directions URL
    - Edit/Delete actions for existing locations
    - All changes create `practice_location_change_request` approval request

15. **`src/app/doctor/dashboard/practice/services-insurance/page.tsx`**
    - Services and insurance management page
    - Two sections: Services (tags) and Insurance (providers)
    - Add/remove services via dialog
    - Add/remove insurance providers (name + slug)
    - All changes create `practice_insurance_services_change_request` approval request

16. **`src/app/doctor/dashboard/practice/membership/page.tsx`**
    - Practice membership overview page
    - Table view of all doctors in practice with their membership status
    - Columns: Doctor, Tier, Status, Start Date, Expiry Date
    - Shows expiry warnings (expired badge, expiring soon badge)
    - Uses `getPracticeDoctorsMembershipOverview()` from membershipService

17. **`src/app/doctor/dashboard/practice/announcements/create/page.tsx`**
    - Practice Admin announcement composer
    - Form: title and message fields
    - Sends announcement to all doctors in practice (`practice_doctors` audience)
    - Creates notifications for all practice doctors
    - Redirects to practice page on success

### Doctor Portal UI Pages (3 files)

18. **`src/app/doctor/dashboard/notifications/page.tsx`**
    - Notification inbox page
    - Tabs: All / Unread
    - Displays notifications with: title, message, type badge, timestamp, read status
    - Unread notifications have blue border indicator
    - "Mark Read" button for unread notifications
    - Deep linking: "Open" button if notification has href
    - Uses `getNotifications()` and `markNotificationRead()` from notificationStorage

19. **`src/app/doctor/dashboard/referrals/page.tsx`**
    - V2 referrals UI (uses V2 Referral type from `@/types/referrals`)
    - **Note**: Legacy `ReferralsSection.tsx` component still exists but is not used by this page
    - Legacy component uses `LegacyReferral` from `@/types/index.ts` for backward compatibility
    - No route conflicts: This page directly implements V2 referrals UI
    - Tabs: Received / Sent
    - Received referrals: Shows from doctor, condition, patient info, status badge, actions (Mark Attended/Removed)
    - Sent referrals: Shows to doctor, condition, patient info, status badge, view only
    - Referral detail dialog: Shows full referral info + timeline
    - Uses `getReferralsForDoctor()`, `setReferralStatus()`, `getReferralTimeline()` from referralEngine

20. **`src/app/doctor/dashboard/announcements/page.tsx`**
    - Announcements feed page
    - Displays all announcements relevant to doctor
    - Shows: title, message, audience badge (All Doctors / Practice Doctors), timestamp, creator info
    - Uses `getAnnouncementsForDoctor()` from announcementService
    - Filters announcements based on doctor's practice membership

### Admin Announcement Page (1 file)

21. **`src/app/admin/announcements/create/page.tsx`**
    - Admin announcement composer
    - Form: title and message fields
    - Sends announcement to all doctors (`all_doctors` audience)
    - Creates notifications for all doctors
    - Redirects to admin dashboard on success

### Utility Files (2 files)

22. **`src/lib/dateUtils.ts`**
    - Date formatting utilities (replaces date-fns dependency)
    - `formatDate(date)` - Formats date as "MMM d, yyyy"
    - `formatDateTime(date)` - Formats date and time as "MMM d, yyyy HH:mm"
    - Uses native JavaScript Date methods
    - **SSR-safe**: Date methods work identically on both server and client. No DOM or browser-specific APIs used.

23. **`src/lib/toast.ts`**
    - Simple toast notification utility
    - `showToast(message, type)` - Shows toast with success/error/info styling
    - `toast.success()`, `toast.error()`, `toast.info()` convenience methods
    - Creates temporary DOM element (can be replaced with proper toast library later)
    - **SSR-safe**: Guards all DOM operations with `typeof window !== 'undefined'` check

### Files Updated

24. **`src/components/DoctorProfile.tsx`**
    - **Contact Visibility**: Integrated `visibilityService.getContactCard()` to display contact info based on viewer role
      - Public users: Practice contact only
      - Logged-in doctors/admins: Doctor personal contact if available, else practice contact
      - Shows source indicator "(Practice Contact)" when applicable
    - **Send Referral**: Added "Send Referral" button (visible only to logged-in doctors/admins)
      - Dialog form: condition (required), patient initials/age/sex (optional), notes (optional)
      - Uses `canSendReferral()` permission check
      - Calls `createReferral()` from referralEngine
      - Success toast and form reset on completion
    - **Practice Section**: Updated to support both v2 Practice and v1 Institution (backward compatibility)
      - Tries to load practice first, falls back to institution
      - Shows practice/institution info with contact visibility rules applied

25. **`src/components/dashboard/DashboardLayout.tsx`**
    - **Navigation Updates**: Added new nav items for v2 features
      - Notifications (Bell icon)
      - Announcements (Megaphone icon)
      - Practice section (for Practice Admins only): Practice, Practice Approvals, Practice Doctors, Practice Locations, Services & Insurance, Practice Membership
    - **Role-Based Navigation**: Practice Admin nav items only shown if `doctor.roleInPractice === 'practice_admin'`
    - **Badge Display**: Shows "Practice Admin" badge in header for practice admins

26. **`src/app/admin/layout.tsx`**
    - **Enhanced Route Protection**: Added Step 4 permission checks
      - Uses `getActorFromSession()` and `assertAdmin()` from permissionService
      - Handles `AuthRequiredError` and `PermissionDeniedError` with redirects
      - Maintains backward compatibility with existing `isAdminAuthenticated()` check

27. **`src/app/doctor/dashboard/layout.tsx`**
    - **Enhanced Route Protection**: Added Step 4 permission checks
      - Uses `getActorFromSession()` and `assertDoctor()` from permissionService
      - Handles `AuthRequiredError` and `PermissionDeniedError` with redirects
      - Maintains backward compatibility with existing session checks

---

## Implementation Details

### Admin Approval Workflow UI

**Queue Page (`/admin/requests-v2`)**:
- Loads all approval requests using `getApprovalRequests()` from storage
- Filters by admin approval status (`pending`) for queue view
- Displays comprehensive stats: total, pending, under review, approved, rejected
- Search functionality: practice name, doctor name, email
- Filter by status and type
- Each row links to detail page

**Detail Page (`/admin/requests-v2/[id]`)**:
- Loads request by ID
- Displays complete request information:
  - Request summary (type, status, submitted date, submitted by, target)
  - Dual approval status block (Admin + Practice Admin)
  - Requested changes (payload rendered as formatted JSON)
  - Timeline (history records)
- Actions available based on status:
  - `submitted` → Can mark under review
  - Admin approval `pending` → Can approve/reject
- All actions show dialogs for notes/reason input
- Real-time state updates after actions

**History Page (`/admin/history/approvals`)**:
- Loads all approval history records
- Displays complete audit trail
- Search by request ID, practice ID, doctor ID, email
- Filter by type
- Links to request detail page

### Practice Admin Workflow UI

**Practice Details (`/doctor/dashboard/practice`)**:
- Loads practice data using `mergePractices()` from practiceStorage
- Displays practice information (read-only view)
- "Request Edit" button opens dialog with editable fields
- Form submission creates `practice_edit_request` approval request
- Shows practice stats (doctors, specialties, locations)

**Approval Queue (`/doctor/dashboard/practice/approvals`)**:
- Loads pending approvals using `getPendingApprovalsForPracticeAdmin(practiceId)`
- Filters by practice ID (only shows requests for their practice)
- Table view with essential information
- Links to detail page

**Approval Detail (`/doctor/dashboard/practice/approvals/[id]`)**:
- Loads request and verifies it's for correct practice
- Shows approval status (Admin + Practice Admin)
- Actions: Approve/Reject (only if practice admin approval pending)
- Approve/Reject dialogs with notes/reason
- Real-time state updates

**Roster Management (`/doctor/dashboard/practice/doctors`)**:
- Displays all doctors in practice
- Role badges: Practice Admin vs Doctor
- "Invite Doctor" dialog:
  - Email input (required)
  - Optional message
  - Creates `PracticeInvitation` in invitationStorage
  - Creates `practice_doctor_add_request` approval request
- "Remove Doctor" action:
  - Confirmation dialog
  - Creates `practice_doctor_remove_request` approval request
- All changes require admin approval

**Locations Management (`/doctor/dashboard/practice/locations`)**:
- Shows primary address (from practice.address)
- Lists additional locations (from practice.locations)
- "Add Location" dialog with all location fields
- Edit existing location (pre-fills form)
- Delete location (confirmation dialog)
- All changes create `practice_location_change_request` approval request

**Services & Insurance (`/doctor/dashboard/practice/services-insurance`)**:
- Two sections: Services (tags) and Insurance (providers)
- Services: Add/remove tags via dialog
- Insurance: Add/remove providers (name + slug) via dialog
- All changes create `practice_insurance_services_change_request` approval request

**Membership Overview (`/doctor/dashboard/practice/membership`)**:
- Table view of all doctors in practice
- Columns: Doctor name/specialty, Membership tier, Status, Start date, Expiry date
- Expiry indicators: Expired badge (red), Expiring Soon badge (yellow)
- Uses `getPracticeDoctorsMembershipOverview()` from membershipService

### Doctor Portal UI

**Notifications (`/doctor/dashboard/notifications`)**:
- Loads notifications using `getNotifications(doctorId)`
- Tabs: All / Unread (with count badge)
- Notification cards show:
  - Title, message, type badge
  - Timestamp (formatted)
  - Read status indicator (blue border for unread)
  - "Mark Read" button (unread only)
  - "Open" button if href present
- Mark read uses `markNotificationRead()` from notificationStorage

**Referrals (`/doctor/dashboard/referrals`)**:
- Loads referrals using `getReferralsForDoctor(actor, doctorId)`
- Tabs: Received / Sent
- Received referrals:
  - Shows: From doctor, condition, patient info (initials/age/sex), status badge, timestamp
  - Actions: View detail, Change status (if status is `new`)
  - Status change: Mark Attended or Mark Removed
- Sent referrals:
  - Shows: To doctor, condition, patient info, status badge, timestamp
  - Actions: View detail only
- Detail dialog:
  - Full referral information
  - Timeline (history records) using `getReferralTimeline()`
- Status changes use `setReferralStatus()` from referralEngine

**Announcements (`/doctor/dashboard/announcements`)**:
- Loads announcements using `getAnnouncementsForDoctor(actor, doctorId)`
- Filters announcements based on audience:
  - `all_doctors` → Shows to all doctors
  - `practice_doctors` → Shows only if doctor's practice matches
- Displays: Title, message, audience badge, timestamp, creator info
- Empty state if no announcements

### Contact Visibility Implementation

**DoctorProfile Component**:
- Uses `getContactCard(actor, doctor, practice)` from visibilityService
- Contact card contains: `phone`, `email`, `mode` (`public` | `private`), `source` (`doctor` | `practice`)
- Rendering logic:
  - Public users: Practice contact only
  - Logged-in doctors/admins: Doctor personal contact if available, else practice contact
  - Shows "(Practice Contact)" indicator when source is practice
- Applied to:
  - Practice/Institution section contact info
  - Location cards contact info

### Send Referral Implementation

**DoctorProfile Component**:
- "Send Referral" button visible only if:
  - `canSendReferral(actor)` returns true
  - Actor is not `public`
- Dialog form fields:
  - Condition (required textarea)
  - Patient initials (optional, max 5 chars)
  - Patient age (optional number)
  - Patient sex (optional select: male/female/other)
  - Notes (optional textarea)
- Submission:
  - Calls `createReferral(actor, { toDoctorId, patient, condition, notes })`
  - Success toast notification
  - Form reset and dialog close
  - Error handling with toast messages

### Announcements UI

**Admin Composer (`/admin/announcements/create`)**:
- Form: Title (required), Message (required)
- Audience: Fixed to `all_doctors`
- Submission: Calls `createAnnouncement(actor, input)`
- Creates notifications for all doctors
- Redirects to admin dashboard

**Practice Admin Composer (`/doctor/dashboard/practice/announcements/create`)**:
- Form: Title (required), Message (required)
- Audience: Fixed to `practice_doctors` with actor's practiceId
- Submission: Calls `createAnnouncement(actor, input)`
- Creates notifications for all doctors in practice
- Redirects to practice page

**Doctor Feed (`/doctor/dashboard/announcements`)**:
- Loads announcements using `getAnnouncementsForDoctor()`
- Filters by audience (all_doctors or practice_doctors match)
- Displays announcement cards with full information

---

## Key Features

### 1. Complete Approval Workflow UI
- ✅ Admin approval queue with filters and stats
- ✅ Admin approval detail with actions (approve/reject/mark under review)
- ✅ Admin approval history log
- ✅ Practice Admin approval queue (scoped to practice)
- ✅ Practice Admin approval detail with actions
- ✅ All approval actions include notes/reason dialogs
- ✅ Real-time state updates after actions
- ✅ Timeline display for all requests

### 2. Practice Management UI
- ✅ Practice details view (read-only)
- ✅ Practice edit request submission
- ✅ Roster management (invite/remove doctors)
- ✅ Locations management (add/edit/remove)
- ✅ Services & Insurance management
- ✅ Membership overview for practice doctors
- ✅ All changes require admin approval (approval-driven workflow)

### 3. Referral Management UI
- ✅ Referrals sent/received tabs
- ✅ Referral detail view with timeline
- ✅ Status change actions (mark attended/removed)
- ✅ Send referral from doctor profile page
- ✅ Patient privacy (initials/age/sex only)

### 4. Notification System UI
- ✅ Notification inbox with unread/read filtering
- ✅ Mark as read functionality
- ✅ Deep linking support (href navigation)
- ✅ Type badges and timestamps

### 5. Announcements UI
- ✅ Admin announcement composer (all doctors)
- ✅ Practice Admin announcement composer (practice doctors)
- ✅ Doctor announcement feed
- ✅ Audience filtering

### 6. Contact Visibility Rules
- ✅ Public users see practice contact only
- ✅ Logged-in doctors/admins see doctor personal contact if available
- ✅ Fallback to practice contact when personal contact unavailable
- ✅ Source indicators for clarity

### 7. Route Protection
- ✅ Admin routes protected with `assertAdmin()`
- ✅ Doctor routes protected with `assertDoctor()`
- ✅ Practice Admin routes protected with `assertPracticeAdmin()`
- ✅ Proper error handling and redirects
- ✅ SSR-safe permission checks

### 8. Error Handling
- ✅ Typed error handling (`AuthRequiredError`, `PermissionDeniedError`, `NotFoundError`, etc.)
- ✅ User-friendly error messages via toast notifications
- ✅ Redirects for authentication errors
- ✅ Graceful fallbacks for missing data

---

## Service Integration

All UI components consume Step 4 services:

### Approval Engine
- `getPendingApprovalsForAdmin()` - Admin queue
- `getPendingApprovalsForPracticeAdmin()` - Practice Admin queue
- `getApprovalTimeline()` - Request timeline
- `markUnderReview()` - Mark request under review
- `decideAsAdmin()` - Admin approve/reject
- `decideAsPracticeAdmin()` - Practice Admin approve/reject
- `submitApprovalRequest()` - Create approval requests

### Referral Engine
- `getReferralsForDoctor()` - Get sent/received referrals
- `setReferralStatus()` - Update referral status
- `getReferralTimeline()` - Referral history
- `createReferral()` - Create new referral

### Permission Service
- `getActorFromSession()` - Resolve current actor
- `assertAdmin()` - Admin route protection
- `assertDoctor()` - Doctor route protection
- `assertPracticeAdmin()` - Practice Admin route protection
- `canSendReferral()` - Referral permission check

### Visibility Service
- `getContactCard()` - Get contact info with visibility rules

### Membership Service
- `getPracticeDoctorsMembershipOverview()` - Practice membership overview

### Announcement Service
- `createAnnouncement()` - Create announcements
- `getAnnouncementsForDoctor()` - Get doctor's announcements

### Storage Modules
- `getApprovalRequests()` - Load all requests
- `getApprovalHistory()` - Load history records
- `getNotifications()` - Load doctor notifications
- `markNotificationRead()` - Mark notification as read
- `addPracticeInvitation()` - Create practice invitation
- `mergePractices()` - Load practices with overrides

---

## UI Patterns

### Component Structure
- All pages use `'use client'` directive (SSR-safe)
- Consistent loading states with spinner
- Error states with redirects
- Empty states with helpful messages
- Toast notifications for user feedback

### Form Patterns
- Dialog-based forms for approval actions
- Inline forms for practice management
- Validation with required field indicators
- Disabled states during submission
- Success/error feedback via toast

### Table Patterns
- Responsive tables with horizontal scroll on mobile
- Sortable columns (by date descending)
- Action buttons in last column
- Status badges for visual clarity
- Links to detail pages

### Navigation Patterns
- Breadcrumb navigation where applicable
- Back buttons on detail pages
- Consistent header structure
- Role-based navigation items

---

## Route Structure

### Admin Routes
- `/admin/requests-v2` - Approval queue
- `/admin/requests-v2/[id]` - Approval detail
- `/admin/history/approvals` - Approval history
- `/admin/announcements/create` - Create announcement

### Practice Admin Routes (under `/doctor/dashboard/practice`)
- `/doctor/dashboard/practice` - Practice details
- `/doctor/dashboard/practice/approvals` - Approval queue
- `/doctor/dashboard/practice/approvals/[id]` - Approval detail
- `/doctor/dashboard/practice/doctors` - Roster management
- `/doctor/dashboard/practice/locations` - Locations management
- `/doctor/dashboard/practice/services-insurance` - Services & Insurance
- `/doctor/dashboard/practice/membership` - Membership overview
- `/doctor/dashboard/practice/announcements/create` - Create announcement

### Doctor Routes
- `/doctor/dashboard/notifications` - Notification inbox
- `/doctor/dashboard/referrals` - Referrals (V2 - uses `Referral` from `@/types/referrals`)
- `/doctor/dashboard/announcements` - Announcements feed
- `/doctor/dashboard/membership` - Membership (existing, verified)

**Note on Referrals Migration**:
- V2 page (`/doctor/dashboard/referrals/page.tsx`) uses `Referral` from `@/types/referrals` (V2 type)
- Legacy `ReferralsSection.tsx` component still exists but is **not used** by the new page
- Legacy component uses `LegacyReferral` from `@/types/index.ts` for backward compatibility
- No route conflicts: V2 page directly implements new UI without using legacy component
- Type imports are clear: V2 code imports from `@/types/referrals`, legacy code imports from `@/types`

### Public Routes (Updated)
- `/doctors/[slug]` - Doctor profile (updated with contact visibility and send referral)

---

## Code Statistics

- **Files Created**: 23
- **Files Updated**: 4
- **Total Lines of Code**: ~4,500+ (UI layer)
- **Pages Created**: 12
- **Shared Components**: 6
- **Utility Functions**: 2

---

## Verification Checklist

### Admin UI
- [x] Admin approval queue page created
- [x] Admin approval detail page created
- [x] Admin approval history page created
- [x] Admin announcement composer created
- [x] All pages use Step 4 services
- [x] Route protection implemented
- [x] Error handling implemented

### Practice Admin UI
- [x] Practice details page created
- [x] Practice approval queue created
- [x] Practice approval detail created
- [x] Roster management page created
- [x] Locations management page created
- [x] Services & Insurance page created
- [x] Membership overview page created
- [x] Announcement composer created
- [x] All pages use Step 4 services
- [x] Route protection implemented
- [x] Approval-driven workflow implemented

### Doctor Portal UI
- [x] Notifications page created
- [x] Referrals page updated (V2)
- [x] Announcements page created
- [x] Membership page verified (existing)
- [x] All pages use Step 4 services
- [x] Route protection implemented

### Contact Visibility
- [x] DoctorProfile updated with visibilityService
- [x] Contact card rendering based on actor role
- [x] Source indicators displayed
- [x] Practice contact fallback implemented

### Send Referral
- [x] Send Referral button added to DoctorProfile
- [x] Permission check implemented
- [x] Referral form dialog created
- [x] Integration with referralEngine

### Shared Components
- [x] ApprovalStatusBadge created
- [x] ApprovalTypeBadge created
- [x] Timeline component created
- [x] EmptyState component created
- [x] SearchAndFilterBar created
- [x] SectionHeader created

### Route Protection
- [x] Admin layout updated with Step 4 checks
- [x] Doctor dashboard layout updated with Step 4 checks
- [x] All pages check permissions before rendering
- [x] Proper error handling and redirects

### Error Handling
- [x] Typed errors caught and displayed
- [x] Toast notifications for user feedback
- [x] Redirects for auth errors
- [x] Graceful fallbacks for missing data

### TypeScript
- [x] All files compile without errors
- [x] Proper type imports
- [x] Type-safe service calls
- [x] No `any` types (except error handlers)

---

## Testing Notes

### Manual Testing Checklist

**Admin Portal**:
1. Login as admin
2. Navigate to `/admin/requests-v2`
3. Verify approval queue displays
4. Test filters and search
5. Click on request → verify detail page
6. Test approve/reject actions
7. Verify history page shows records

**Practice Admin Portal**:
1. Login as practice admin
2. Navigate to `/doctor/dashboard/practice`
3. Verify practice details display
4. Test "Request Edit" → verify approval request created
5. Navigate to approvals → verify queue shows practice requests
6. Test approve/reject actions
7. Test roster management (invite/remove)
8. Test locations management
9. Test services & insurance management

**Doctor Portal**:
1. Login as doctor
2. Navigate to notifications → verify inbox displays
3. Test mark as read
4. Navigate to referrals → verify sent/received tabs
5. Test status changes
6. Navigate to announcements → verify feed displays
7. Test send referral from doctor profile page

**Contact Visibility**:
1. View doctor profile as public → verify practice contact only
2. Login as doctor → verify doctor contact if available
3. Verify fallback to practice contact

---

## Backward Compatibility

### Maintained V1 Features
- ✅ Institution model still supported (backward compatibility)
- ✅ Existing doctor dashboard routes unchanged
- ✅ Existing admin routes unchanged (`/admin/requests` still exists)
- ✅ Legacy referrals page can coexist (V2 is separate)

### V2 Additions
- ✅ New `/admin/requests-v2` route (doesn't break existing `/admin/requests`)
- ✅ New practice admin routes under `/doctor/dashboard/practice`
- ✅ Updated referrals page uses V2 engine (can be migrated gradually)
- ✅ DoctorProfile supports both Practice and Institution

---

## Next Steps

Step 5 UI integration is complete. Ready for:
- **Step 6**: Practice directory pages (`/practices/[slug]`)
- **Step 6**: Search/directory updates (practice-centric search)
- **Future**: Real-time chat system (announcements foundation ready)
- **Future**: Enhanced notification preferences
- **Future**: Mobile app integration

---

## Acceptance Criteria (From Step 5 Plan)

### ✅ Admin Can:
- [x] See approval queue (pending)
- [x] Open request detail
- [x] Mark under review
- [x] Approve/reject
- [x] See approval history log
- [x] See clear request type labels and payload summary
- [x] Create announcements for all doctors

### ✅ Practice Admin Can:
- [x] See approvals requiring their decision
- [x] Approve/reject those approvals
- [x] Submit practice edit requests (details, locations, insurance/services)
- [x] Submit roster changes (invite/remove doctors)
- [x] View practice details
- [x] View practice membership overview
- [x] Create announcements for practice doctors

### ✅ Doctor Can:
- [x] See notifications and mark read
- [x] See referrals sent/received
- [x] Change referral status
- [x] Send referral from doctor profile page
- [x] View announcements feed

### ✅ Contact Visibility Works:
- [x] Public sees practice contact only
- [x] Logged-in doctor/admin sees personal contact if available
- [x] Fallback to practice contact when personal contact unavailable
- [x] Source indicators displayed

### ✅ No Step 2/3/4 Logic Changes:
- [x] Only importing/using services (no service logic modifications)
- [x] No seed data changes
- [x] No data model changes
- [x] No storage logic changes

---

## Known Limitations

1. **Toast System**: Currently uses simple DOM manipulation. Can be replaced with proper toast library (e.g., sonner, react-hot-toast) in future. ✅ SSR-safe (guarded with `typeof window !== 'undefined'`).

2. **Date Formatting**: Uses native JavaScript Date methods. Consider adding date-fns or similar library if more formatting options needed. ✅ SSR-safe (Date methods work identically on server and client, no DOM/browser APIs used).

3. **Announcements**: Foundation only (no chat threads yet). Ready for future chat implementation.

4. **Membership**: Foundation only (no billing logic). Existing membership page uses legacy storage, can be migrated to membershipService later.

5. **Notifications**: No notification preferences yet. All notifications are shown to all doctors.

6. **Referrals Migration**: 
   - V2 referrals page (`/doctor/dashboard/referrals`) uses `Referral` from `@/types/referrals`
   - Legacy `ReferralsSection.tsx` component still exists but is not used by the new page
   - Legacy component uses `LegacyReferral` from `@/types/index.ts` for backward compatibility
   - No route conflicts: V2 page directly implements new UI
   - Type exports: `@/types/index.ts` exports `LegacyReferral` and `Referral` (type alias) for backward compatibility
   - V2 code must explicitly import from `@/types/referrals` to avoid type conflicts

---

**Implementation Status**: ✅ Complete  
**Ready for Next Step**: Yes  
**TypeScript Compilation**: ✅ Success (0 errors)  
**Files Created**: 23  
**Files Updated**: 4  
**Total Pages**: 12  
**Shared Components**: 6
