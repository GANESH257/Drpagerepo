# Admin Activities Documentation

## Overview

This document details all administrative activities, operations, and capabilities available in the Admin Portal.

---

## Admin Portal Structure

### Main Dashboard (`/admin`)

**Purpose**: Overview of network statistics and recent activity

**Components**:
1. **Stats Cards** - Key metrics at a glance
2. **Analytics Charts** - Visual data representations
3. **Recent Requests** - Latest membership applications

**Stats Displayed**:
- Total membership requests
- Total active members
- Total membership plans
- Request status breakdown

**Charts Available**:
- Doctors Joined Per Month
- Growth Trend
- Doctors Per Department
- Doctors Per Plan
- Request Status Distribution

---

## Admin Activities by Section

### 1. Membership Requests Management (`/admin/requests`)

#### View All Requests

**Activity**: Browse all join requests  
**Access**: Admin only  
**Display**:
- Table view with sortable columns
- Filter by status (All, Pending, Accepted, Rejected)
- Search functionality
- Pagination (if needed)

**Table Columns**:
- Applicant Name
- Specialty
- Plan Selected
- Status Badge
- Submission Date
- Actions (View Details)

#### View Request Details

**Activity**: Open detailed view of specific request  
**Access**: Admin only  
**Information Displayed**:
- Applicant Information:
  - Full name with credentials
  - Email address
  - Phone number
  - City, State
  - Practice name (if provided)
  - Website (if provided)
  - Message to admin (if provided)
- Plan Information:
  - Selected plan (Basic/Professional/Premier)
  - Billing cycle (Monthly/Annual)
- Payment Information:
  - Payment method (PayPal/Card)
  - Cardholder name (if card)
  - Billing ZIP (if card)
- Status History:
  - Submission date
  - Review date (if reviewed)
  - Decision date (if decided)
  - Admin notes (if any)
  - Rejection reason (if rejected)

#### Approve Request

**Activity**: Accept a membership application  
**Access**: Admin only  
**Process**:
1. Click "Approve" button in request detail drawer
2. Optional: Add admin notes
3. Confirm approval
4. Request status updated to `'approved'`
5. Timestamp and admin email recorded

**Function**: `acceptJoinRequest(requestId, notes?)`  
**Storage**: Updates `aip_join_requests` array in localStorage

**Post-Approval**:
- Request marked as approved
- Admin notes saved
- Doctor account creation (manual step)
- Email notification (future feature)

#### Reject Request

**Activity**: Deny a membership application  
**Access**: Admin only  
**Process**:
1. Click "Reject" button in request detail drawer
2. Required: Enter rejection reason
3. Confirm rejection
4. Request status updated to `'rejected'`
5. Timestamp, admin email, and reason recorded

**Function**: `rejectJoinRequest(requestId, reason)`  
**Storage**: Updates `aip_join_requests` array in localStorage

**Post-Rejection**:
- Request marked as rejected
- Rejection reason saved
- No doctor account created
- Email notification (future feature)

#### Mark Under Review

**Activity**: Mark request as being reviewed  
**Access**: Admin only  
**Process**:
1. Update request status to `'under_review'`
2. Optional: Add review notes
3. Status updated in system

**Function**: `updateJoinRequest(id, { status: 'under_review' })`

#### Generate Sample Requests

**Activity**: Seed mock data for testing  
**Access**: Admin only  
**Process**:
1. Click "Generate Sample Requests" button
2. Loads 16 mock join requests
3. Various statuses (submitted, approved, rejected, under_review)
4. Different plans and specialties

**Function**: `seedMockJoinRequests()` from `mockJoinRequests.ts`

---

### 2. Member Management (`/admin/members`)

#### View All Members

**Activity**: Browse all registered doctors  
**Access**: Admin only  
**Display**:
- Table view with all doctors
- Search by name, email, specialty, credentials
- Sortable columns

**Table Columns**:
- Name
- Email
- Specialty
- Credentials
- Verified Status
- Featured Status
- Actions (Edit, Delete)

#### Edit Member Profile

**Activity**: Update doctor information  
**Access**: Admin only  
**Editable Fields**:
- Basic Information:
  - First name
  - Last name
  - Credentials
  - Email
  - Specialty
  - Additional specialties
- Profile Information:
  - Bio (short)
  - About (extended)
  - Verified status (checkbox)
  - Featured status (checkbox)
  - Accepts new patients (checkbox)
- Locations:
  - Add new location
  - Edit existing locations
  - Delete locations
- Insurance:
  - Add insurance plans
  - Remove insurance plans

**Function**: `saveDoctorOverride(doctorId, partialData)`  
**Storage**: Updates `aip_doctor_overrides` in localStorage

**Note**: Changes are merged with seed data on read

#### Delete Member

**Activity**: Remove doctor from directory  
**Access**: Admin only  
**Process**:
1. Click "Delete" button
2. Confirm deletion in dialog
3. Doctor ID added to deleted list
4. Doctor filtered out from display

**Function**: `deleteDoctor(doctorId)`  
**Storage**: Adds ID to `aip_deleted_doctors` array

**Note**: Soft delete - doctor remains in seed data but hidden

#### Restore Member

**Activity**: Restore previously deleted doctor  
**Access**: Admin only  
**Process**:
1. Remove doctor ID from deleted list
2. Doctor reappears in directory

**Function**: `restoreDoctor(doctorId)`  
**Storage**: Removes ID from `aip_deleted_doctors` array

#### Reset Member Password

**Activity**: Generate new password for doctor  
**Access**: Admin only  
**Process**:
1. Click "Reset Password" button in edit dialog
2. Choose option:
   - Generate random password (12 characters)
   - Set custom password
3. Password hashed and stored
4. Admin can view/copy password
5. Admin notifies doctor (manual)

**Functions**:
- `resetPassword(email)` → Generates random password
- `setPassword(email, password)` → Sets custom password

**Storage**: Updates `aip_doctor_passwords` in localStorage  
**Hashing**: SHA-256 via Web Crypto API

---

### 3. Membership Plans Management (`/admin/memberships`)

#### View All Plans

**Activity**: Browse membership plans  
**Access**: Admin only  
**Plans**:
- Basic Plan
- Professional Plan
- Premier Plan

#### Edit Plan Details

**Activity**: Update plan information  
**Access**: Admin only  
**Editable Fields**:
- Plan name
- Badge text (e.g., "Most Popular")
- Monthly pricing
- Annual pricing
- Description
- Features list (add/remove/edit)
- CTA label
- CTA href

**Function**: `saveMembershipPlans(plans)`  
**Storage**: Updates `aip_membership_plans_override` in localStorage

**Note**: Changes override seed data

#### Reset Plans to Defaults

**Activity**: Restore original plan data  
**Access**: Admin only  
**Process**:
1. Remove localStorage override
2. System uses seed data from `membershipPlans.ts`

**Function**: `resetMembershipPlans()`

---

### 4. Policies Management (`/admin/policies`)

#### View All Policies

**Activity**: Browse organization policies  
**Access**: Admin only  
**Categories**:
- Governance
- Compliance
- Operations

#### Edit Policy

**Activity**: Update policy content  
**Access**: Admin only  
**Editable Fields**:
- Category
- Title
- Body (full text)

**Function**: `saveOrgPolicies(policies)`  
**Storage**: Updates `aip_policies_override` in localStorage

#### Add New Policy

**Activity**: Create new policy  
**Access**: Admin only  
**Process**:
1. Click "Add Policy" button
2. Fill in category, title, body
3. Save to localStorage

#### Delete Policy

**Activity**: Remove policy  
**Access**: Admin only  
**Process**:
1. Click delete button
2. Confirm deletion
3. Policy removed from array

#### Reset Policies to Defaults

**Activity**: Restore original policy data  
**Access**: Admin only  
**Function**: `resetOrgPolicies()`

---

### 5. Events Management (`/admin/events`)

#### View All Events

**Activity**: Browse global medical events  
**Access**: Admin only  
**Display**: List of events with:
- Title
- Date
- Location
- Online/Virtual flag
- Description
- URL (if external)

#### Edit Event

**Activity**: Update event information  
**Access**: Admin only  
**Editable Fields**:
- Title
- Date
- Location
- Is Online (checkbox)
- Description
- URL

**Function**: `saveGlobalMedicalEvents(events)`  
**Storage**: Updates `aip_global_medical_events_override` in localStorage

#### Add New Event

**Activity**: Create new event  
**Access**: Admin only  
**Process**:
1. Click "Add Event" button
2. Fill in event details
3. Save to localStorage

#### Delete Event

**Activity**: Remove event  
**Access**: Admin only  
**Process**:
1. Click delete button
2. Confirm deletion
3. Event removed from array

#### Reset Events to Defaults

**Activity**: Restore original event data  
**Access**: Admin only  
**Function**: `resetGlobalMedicalEvents()`

---

### 6. Board Meetings Management (`/admin/events`)

#### View Board Meetings

**Activity**: Browse trustee board meetings  
**Access**: Admin only  
**Display**:
- Next meeting (upcoming)
- Upcoming meetings list

**Meeting Information**:
- Date
- Time
- Timezone
- Location
- Virtual flag
- Meeting link (if virtual)
- Agenda highlights
- ICS file (if available)

#### Edit Board Meetings

**Activity**: Update meeting information  
**Access**: Admin only  
**Editable Fields**:
- Next meeting details
- Upcoming meetings array
- All meeting fields

**Function**: `saveBoardMeetings(meetings)`  
**Storage**: Updates `aip_board_meetings_override` in localStorage

#### Reset Meetings to Defaults

**Activity**: Restore original meeting data  
**Access**: Admin only  
**Function**: `resetBoardMeetings()`

---

## Analytics and Reporting

### Dashboard Analytics

**Location**: `/admin` (main dashboard)

**Charts Available**:

1. **Doctors Joined Per Month**
   - X-axis: Months
   - Y-axis: Number of doctors
   - Data source: Approved join requests

2. **Growth Trend**
   - Shows network growth over time
   - Line chart
   - Data source: Approved requests timeline

3. **Doctors Per Department**
   - Pie/bar chart
   - Shows specialty distribution
   - Data source: All doctors grouped by specialty

4. **Doctors Per Plan**
   - Pie/bar chart
   - Shows plan distribution
   - Data source: Approved requests grouped by plan

5. **Request Status Distribution**
   - Pie chart
   - Shows: Pending, Approved, Rejected counts
   - Data source: All join requests

### Statistics Cards

**Metrics Displayed**:
- Total Requests (all statuses)
- Active Members (approved doctors)
- Total Plans (membership plans count)
- Request Status Breakdown

**Data Source**: Calculated from localStorage data

---

## Data Management Operations

### Export Data

**Current**: Not implemented  
**Future**: Export to CSV/JSON
- Export all doctors
- Export all institutions
- Export join requests
- Export analytics data

### Import Data

**Current**: Not implemented  
**Future**: Import from CSV/JSON
- Bulk import doctors
- Bulk import institutions
- Import join requests

### Backup/Restore

**Current**: Manual localStorage backup  
**Future**: 
- Export all localStorage data
- Import backup file
- Restore from backup

---

## Admin User Management

### Current Implementation

**Single Admin Account**:
- Email: `admin@aip.com`
- Password: `Admin@12345`
- Hardcoded in `adminSession.ts`

### Future Enhancements

**Planned Features**:
- Multiple admin accounts
- Role-based permissions (Super Admin, Moderator)
- Admin activity logs
- Admin password reset
- Two-factor authentication

---

## Activity Logging

### Current Implementation

**Limited Logging**:
- Join request decisions (`decidedAt`, `decidedBy`)
- Password resets (stored in password hash)
- No comprehensive activity log

### Future Enhancements

**Planned Features**:
- Full activity log:
  - Who did what
  - When it was done
  - What changed
- Audit trail for:
  - Profile edits
  - Request approvals/rejections
  - Plan changes
  - Policy updates
  - Event modifications

---

## Bulk Operations

### Current Limitations

- No bulk approve/reject
- No bulk edit members
- No bulk delete
- Operations are one-at-a-time

### Future Enhancements

**Planned Features**:
- Select multiple requests → Bulk approve/reject
- Select multiple members → Bulk edit
- Select multiple members → Bulk delete
- Bulk export selected items

---

## Search and Filtering

### Join Requests

**Filters Available**:
- Status (All, Pending, Accepted, Rejected)
- Search by applicant name
- Sort by date

### Members

**Filters Available**:
- Search by name, email, specialty, credentials
- Filter by verified status
- Filter by featured status
- Sort by name, specialty

---

## System Maintenance

### Clear Cache

**Activity**: Clear localStorage data  
**Access**: Admin only  
**Process**:
- Clear specific data types
- Reset to seed data
- Clear all admin-related data

### Reset to Defaults

**Activities**:
- Reset membership plans
- Reset policies
- Reset events
- Reset board meetings
- Clear all overrides

**Functions**:
- `resetMembershipPlans()`
- `resetOrgPolicies()`
- `resetGlobalMedicalEvents()`
- `resetBoardMeetings()`

---

## Admin Navigation

### Menu Structure

```
Admin Portal
├── Dashboard (/admin)
├── Membership Requests (/admin/requests)
├── Membership Plans (/admin/memberships)
├── Policies (/admin/policies)
├── Events (/admin/events)
└── Member Management (/admin/members)
```

### Access Control

- All routes protected by `AdminLayout`
- Requires authentication
- Redirects to `/admin/login` if not authenticated
- Session stored in localStorage

---

## Error Handling

### Common Errors

**Join Request Errors**:
- Invalid request ID → Show error message
- Missing required fields → Validation error
- Save failure → Retry option

**Member Management Errors**:
- Doctor not found → Show error
- Invalid email → Validation error
- Password reset failure → Retry option

**Data Save Errors**:
- localStorage quota exceeded → Warning message
- Invalid JSON → Error message
- Network error (future) → Retry option

---

## Performance Considerations

### Data Loading

- All data loaded client-side
- No pagination (loads all at once)
- May be slow with 100+ doctors/requests
- Future: Implement pagination

### localStorage Limits

- Browser limit: ~5-10MB
- Current usage: Minimal
- Monitor for quota exceeded errors

---

**Last Updated**: January 29, 2026  
**Version**: 1.0
