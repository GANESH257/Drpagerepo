# Approval Processes and Permissions Documentation

## Overview

This document details the approval workflows, permission levels, and access control mechanisms in the Alliance of Independent Physicians platform.

---

## User Roles and Permission Levels

### Role Hierarchy

```
Admin (Highest)
  ├─ Full system access
  ├─ Can approve/reject join requests
  ├─ Can manage all members
  ├─ Can edit plans, policies, events
  └─ Can view analytics

Doctor (Member)
  ├─ Access to own dashboard
  ├─ Can edit own profile
  ├─ Can manage own locations/insurance
  ├─ Can view own appointments/referrals
  └─ Cannot access admin functions

Applicant (Pending)
  ├─ Can submit join request
  ├─ Can view application status
  └─ No dashboard access until approved

Public (Unauthenticated)
  ├─ Can view public pages
  ├─ Can search doctors/practices
  └─ Cannot access protected routes
```

---

## Join Request Approval Process

### Workflow Stages

```
1. SUBMITTED
   ↓
2. UNDER_REVIEW (optional)
   ↓
3. APPROVED or REJECTED
```

### Status Definitions

| Status | Description | Who Can Change | Next Actions |
|--------|-------------|-----------------|--------------|
| `submitted` | Initial submission | Admin only | Admin reviews |
| `under_review` | Admin reviewing | Admin only | Admin decides |
| `approved` | Request accepted | Admin only | Doctor account created |
| `rejected` | Request denied | Admin only | Applicant notified |

### Approval Process Steps

#### Step 1: Application Submission

**Who**: Applicant (physician)  
**Where**: `/join-us` → Application form  
**Actions**:
- Fill out basic details (name, credentials, specialty, contact info)
- Select membership plan (Basic, Professional, Premier)
- Choose billing cycle (monthly/annual)
- Select payment method (PayPal/Card)
- Optionally add practice name, website, message to admin

**Storage**:
- Draft saved to `aip_join_request_draft` (localStorage)
- On submit: Creates `JoinRequest` object
- Saved to `aip_join_requests` array (localStorage)

**Function**: `submitJoinRequest(request)` in `joinRequestStorage.ts`

#### Step 2: Admin Review

**Who**: Admin  
**Where**: `/admin/requests`  
**Actions**:
- View all join requests in table
- Filter by status (All, Pending, Accepted, Rejected)
- Click request to view details in drawer
- Review applicant information:
  - Personal details (name, credentials, specialty)
  - Contact information (email, phone, location)
  - Practice information (name, website)
  - Selected plan and billing cycle
  - Payment method
  - Message to admin (if provided)

**Functions**:
- `getJoinRequests()` - Load all requests
- `getJoinRequestById(id)` - Get specific request
- `updateJoinRequest(id, updates)` - Update request fields

#### Step 3: Approval Decision

**Who**: Admin  
**Actions**:

**A. Approve Request**:
- Click "Approve" button
- Optionally add admin notes
- Function: `acceptJoinRequest(requestId, notes?)`
- Updates:
  - `status` → `'approved'`
  - `decidedAt` → Current timestamp
  - `decidedBy` → `'admin@aip.com'`
  - `notes` → Admin notes (if provided)

**B. Reject Request**:
- Click "Reject" button
- Required: Provide rejection reason
- Function: `rejectJoinRequest(requestId, reason)`
- Updates:
  - `status` → `'rejected'`
  - `decidedAt` → Current timestamp
  - `decidedBy` → `'admin@aip.com'`
  - `rejectionReason` → Reason provided

**C. Mark Under Review**:
- Optional intermediate step
- Function: `updateJoinRequest(id, { status: 'under_review' })`

### Post-Approval Actions

**When Request is Approved**:

1. **Doctor Account Creation** (Manual or Automated):
   - Admin creates doctor record in system
   - Uses information from approved join request
   - Assigns `institutionId` if applicable
   - Sets default password: `AIP@12345`

2. **Email Notification** (Future):
   - Send welcome email to doctor
   - Include login credentials
   - Link to doctor dashboard

3. **Dashboard Access**:
   - Doctor can log in with email + password
   - Access granted to `/doctor/dashboard`
   - Full member benefits activated

### Post-Rejection Actions

**When Request is Rejected**:

1. **Status Update**:
   - Request marked as `'rejected'`
   - Rejection reason stored

2. **Email Notification** (Future):
   - Send rejection email to applicant
   - Include rejection reason
   - Option to reapply

3. **No Account Created**:
   - No doctor record created
   - No dashboard access granted

---

## Authentication and Session Management

### Admin Authentication

**Credentials**:
- Email: `admin@aip.com`
- Password: `Admin@12345`

**Storage**: `aip_admin_session` (localStorage)

**Session Structure**:
```typescript
{
  email: string;
  role: 'admin';
  loginAt: string; // ISO timestamp
}
```

**Functions**:
- `validateAdminCredentials(email, password)` → Returns boolean
- `setAdminSession(email)` → Creates session
- `getAdminSession()` → Returns session or null
- `clearAdminSession()` → Removes session
- `isAdminAuthenticated()` → Returns boolean

**Protected Routes**:
- `/admin/*` (except `/admin/login`)
- Client-side guard in `AdminLayout`
- Redirects to `/admin/login` if not authenticated

### Doctor Authentication

**Credentials**:
- Email: Any doctor email from `doctors.ts`
- Password: `AIP@12345` (default) or custom password set by admin

**Storage**: `aip_doctor_session` (localStorage)

**Session Structure**:
```typescript
{
  email: string;
  role: 'doctor';
  doctorId?: string; // Optional, linked after login
  loginAt: string; // ISO timestamp
}
```

**Password Storage**: `aip_doctor_passwords` (localStorage)
- Key: Email (lowercase)
- Value: Hashed password (SHA-256)

**Functions**:
- `checkPassword(email, password)` → Returns boolean
- `setPassword(email, password)` → Hashes and stores password
- `resetPassword(email)` → Generates new random password
- `getPasswordHash(email)` → Returns hash or null

**Protected Routes**:
- `/doctor/dashboard/*`
- Client-side guard in `DashboardLayout`
- Redirects to `/join-us` if not authenticated

---

## Permission Matrix

### Admin Permissions

| Action | Permission | Function/Route |
|--------|-----------|----------------|
| View Dashboard | ✅ Full | `/admin` |
| View Join Requests | ✅ Full | `/admin/requests` |
| Approve Join Request | ✅ Full | `acceptJoinRequest()` |
| Reject Join Request | ✅ Full | `rejectJoinRequest()` |
| View All Members | ✅ Full | `/admin/members` |
| Edit Member Profile | ✅ Full | `saveDoctorOverride()` |
| Delete Member | ✅ Full | `deleteDoctor()` |
| Reset Member Password | ✅ Full | `resetPassword()` |
| Edit Membership Plans | ✅ Full | `/admin/memberships` |
| Edit Policies | ✅ Full | `/admin/policies` |
| Edit Events | ✅ Full | `/admin/events` |
| View Analytics | ✅ Full | Dashboard charts |

### Doctor Permissions

| Action | Permission | Function/Route |
|--------|-----------|----------------|
| View Own Dashboard | ✅ Own Only | `/doctor/dashboard` |
| Edit Own Profile | ✅ Own Only | `saveDoctorOverride()` (own ID) |
| Manage Own Locations | ✅ Own Only | Dashboard locations section |
| Manage Own Insurance | ✅ Own Only | Dashboard insurance section |
| View Own Appointments | ✅ Own Only | Dashboard appointments |
| View Own Referrals | ✅ Own Only | Dashboard referrals |
| View Membership Status | ✅ Own Only | Dashboard membership |
| Approve/Reject Requests | ❌ No Access | Admin only |
| View Other Members | ❌ No Access | Admin only |
| Edit Plans/Policies | ❌ No Access | Admin only |

### Applicant Permissions

| Action | Permission | Function/Route |
|--------|-----------|----------------|
| Submit Join Request | ✅ Yes | `/join-us` |
| View Application Status | ✅ Own Only | `/join-us/submitted` |
| Edit Own Application Draft | ✅ Own Only | `saveApplicationDraft()` |
| Access Dashboard | ❌ No Access | Requires approval |
| View Admin Panel | ❌ No Access | Admin only |

### Public Permissions

| Action | Permission | Function/Route |
|--------|-----------|----------------|
| View Public Pages | ✅ Yes | All public routes |
| Search Doctors | ✅ Yes | `/doctors`, `/practices` |
| View Doctor Profiles | ✅ Yes | `/doctors/[slug]` |
| View Institution Pages | ✅ Yes | `/institutions/[slug]` |
| Submit Contact Form | ✅ Yes | `/contact-us` |
| Access Dashboard | ❌ No Access | Requires login |
| Access Admin Panel | ❌ No Access | Admin only |

---

## Access Control Implementation

### Route Protection

**Admin Routes** (`src/app/admin/layout.tsx`):
```typescript
// Client-side guard
if (!isAdminAuthenticated()) {
  router.replace('/admin/login');
}
```

**Doctor Routes** (`src/app/doctor/dashboard/layout.tsx`):
```typescript
// Client-side guard
if (!isDoctorAuthenticated()) {
  router.replace('/join-us');
}
```

### Component-Level Permissions

**Admin Components**:
- Check `isAdminAuthenticated()` before rendering
- Show loading state during auth check
- Redirect if not authenticated

**Doctor Components**:
- Check `isDoctorAuthenticated()` before rendering
- Filter data by `doctorId` from session
- Only show own data

---

## Approval Workflow Details

### Join Request Lifecycle

```
┌─────────────────┐
│  SUBMITTED      │ ← Applicant submits form
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ UNDER_REVIEW    │ ← Admin marks for review (optional)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ↓         ↓
┌────────┐ ┌──────────┐
│APPROVED│ │ REJECTED │
└────┬───┘ └──────────┘
     │
     ↓
┌─────────────────┐
│ Doctor Created  │ ← Admin creates doctor account
└─────────────────┘
```

### Approval Criteria

**Required Information**:
- ✅ Full name with credentials
- ✅ Valid email address
- ✅ Medical specialty
- ✅ Contact phone number
- ✅ City and state
- ✅ Membership plan selection
- ✅ Payment method selection

**Optional Information**:
- Practice name
- Practice website
- Message to admin

**Admin Decision Factors**:
- Completeness of application
- Credentials verification (manual)
- Practice information accuracy
- Membership plan appropriateness
- Payment method validity

---

## Password Management

### Default Passwords

**Admin**:
- Email: `admin@aip.com`
- Password: `Admin@12345`
- Stored: Hardcoded in `adminSession.ts`

**Doctors**:
- Default: `AIP@12345`
- Custom: Set by admin via password reset
- Storage: Hashed in `aip_doctor_passwords` (localStorage)

### Password Reset Process

**Admin-Initiated Reset** (`MemberEditDialog`):
1. Admin clicks "Reset Password" button
2. Option to generate random password or set custom
3. If random: Generates 12-character password
4. Password hashed using SHA-256
5. Stored in `aip_doctor_passwords` (localStorage)
6. Admin can view/copy new password
7. Admin notifies doctor (manual process)

**Password Hashing**:
- Algorithm: SHA-256 (via Web Crypto API)
- Fallback: Base64 encoding if crypto unavailable
- Storage: Hashed value only (never plain text)

---

## Session Management

### Session Expiration

**Current Implementation**:
- Sessions persist until logout
- No automatic expiration
- Stored in localStorage (persists across browser sessions)

**Session Clearing**:
- Admin logout: Clears `aip_admin_session` + related admin data
- Doctor logout: Clears `aip_doctor_session` only
- Browser clear: All sessions cleared

### Session Security

**Limitations**:
- Client-side only (no server validation)
- localStorage accessible via browser DevTools
- No token expiration
- No refresh tokens

**Best Practices**:
- Logout when done
- Clear browser data regularly
- Use secure passwords
- Don't share credentials

---

## Data Access Patterns

### Admin Data Access

**Read Access**:
- All doctors (via `getAllDoctors()`)
- All institutions (via `getAllInstitutions()`)
- All join requests (via `getJoinRequests()`)
- All membership plans (via `getMembershipPlans()`)
- All policies (via `getOrgPolicies()`)
- All events (via `getGlobalMedicalEvents()`)

**Write Access**:
- Create/update/delete doctors (via overrides)
- Create/update/delete institutions (via overrides)
- Approve/reject join requests
- Edit membership plans
- Edit policies
- Edit events
- Reset passwords

### Doctor Data Access

**Read Access**:
- Own profile data only
- Own appointments
- Own referrals
- Own membership status

**Write Access**:
- Update own profile (via `saveDoctorOverride()`)
- Add/edit own locations
- Add/edit own insurance
- Cannot delete own account (admin only)

---

## Approval Statistics Tracking

**Metrics Tracked**:
- Total requests submitted
- Requests by status (pending, approved, rejected)
- Approval rate
- Average review time
- Requests by plan type
- Requests by specialty

**Storage**: Calculated from `aip_join_requests` array  
**Display**: Admin dashboard charts (`/admin`)

---

## Future Enhancements

### Planned Features

1. **Email Notifications**:
   - Auto-send on request submission
   - Auto-send on approval/rejection
   - Welcome email with credentials

2. **Automated Doctor Creation**:
   - Auto-create doctor account on approval
   - Generate doctor ID and slug
   - Assign default password

3. **Multi-Step Approval**:
   - Initial review
   - Credentials verification
   - Final approval

4. **Role-Based Permissions**:
   - Super admin
   - Moderator (limited admin)
   - Member (doctor)

5. **Session Expiration**:
   - Token-based authentication
   - Automatic logout after inactivity
   - Refresh tokens

---

**Last Updated**: January 29, 2026  
**Version**: 1.0
