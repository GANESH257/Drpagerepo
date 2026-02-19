# V2 Roles & Permissions Matrix

## Overview

This document defines the complete role hierarchy, permissions, and access control rules for AIP v2. Use this as a reference when implementing permission checks and UI rendering logic.

**Last Updated**: January 29, 2026  
**Version**: 2.0

---

## Role Hierarchy

```
Admin (Highest)
  │
  ├── Practice Admin (Elevated Doctor)
  │     │
  │     └── Doctor (Normal)
  │
  └── Applicant (Pending)
        │
        └── Public (Unauthenticated)
```

---

## Role Definitions

### 1. Admin

**Description**: Highest level access, full system control

**Authentication**:
- Email/password login
- Session: `aip_admin_session`
- Dummy credentials: `admin@aip.com` / `Admin@12345`

**Capabilities**:

#### Approval Powers
- ✅ Approve/reject new doctor join requests
- ✅ Approve/reject new practice creation requests
- ✅ Approve/reject doctor joining existing practice requests
- ✅ Approve/reject practice edit requests (locations, insurance, services)
- ✅ Approve/reject practice admin changes
- ✅ Override any approval decision
- ✅ Bypass approval workflows (direct edits)

#### Management Powers
- ✅ Edit ANY doctor profile (full override)
- ✅ Edit ANY practice profile (full override)
- ✅ Create/delete doctors
- ✅ Create/delete practices
- ✅ Assign Practice Admin role
- ✅ Remove Practice Admin role
- ✅ Manage membership plans
- ✅ Manage policies
- ✅ Manage events

#### Viewing Powers
- ✅ View all analytics and statistics
- ✅ View all doctors (including personal contacts)
- ✅ View all practices
- ✅ View all approval requests
- ✅ View all referrals
- ✅ View all notifications
- ✅ View all membership data

#### System Powers
- ✅ Access admin portal (`/admin/*`)
- ✅ Cannot access doctor portal (different role)
- ✅ Full localStorage access (all keys)

**UI Access**:
- `/admin` - Dashboard
- `/admin/requests` - Approval queue
- `/admin/members` - Member management
- `/admin/memberships` - Membership plans
- `/admin/policies` - Policies
- `/admin/events` - Events

---

### 2. Practice Admin

**Description**: Elevated doctor with practice management permissions

**Authentication**:
- Email/password login (same as Doctor)
- Session: `aip_doctor_session`
- Role determined by `aip_practice_roles[practiceId].adminDoctorId`

**Capabilities**:

#### Practice Management
- ✅ View practice information
- ✅ Edit practice info (name, description, contact) → **Requires Admin approval**
- ✅ Manage practice locations (add/edit/remove) → **Requires Admin approval**
- ✅ Manage practice insurance list (edit) → **Requires Admin approval**
- ✅ Manage practice services list (edit) → **Requires Admin approval**
- ✅ View practice membership status

#### Doctor Management (Within Practice)
- ✅ Invite doctors to practice (create invitation)
- ✅ Approve/deny doctors requesting to join practice
- ✅ View all doctors in practice
- ✅ Edit doctor details for doctors in practice → **May require Admin approval** (field-dependent)
- ✅ Remove doctor from practice → **May require Admin approval**
- ✅ View personal contacts of all practice doctors

#### Approval Powers
- ✅ Approve/deny doctor join requests for their practice
- ✅ Auto-approve invitations they sent (configurable)
- ❌ Cannot approve practice creation requests
- ❌ Cannot approve practice edits (only request them)

#### Personal Doctor Powers
- ✅ All normal Doctor capabilities (see below)
- ✅ Edit own profile
- ✅ Send referrals
- ✅ View own referrals (sent/received)
- ✅ View own notifications
- ✅ Manage own membership

#### Communication
- ✅ Send practice announcements (via chat/notifications)
- ✅ View practice-level chat/announcements

**UI Access**:
- `/doctor/dashboard` - Normal doctor dashboard
- `/doctor/dashboard/practice` - Practice management (NEW)
- `/doctor/dashboard/practice/locations` - Practice locations (NEW)
- `/doctor/dashboard/practice/doctors` - Practice doctors (NEW)
- `/doctor/dashboard/notifications` - Notifications

**Restrictions**:
- ❌ Cannot edit other practices
- ❌ Cannot approve requests for other practices
- ❌ Cannot manage system-wide settings
- ❌ Cannot access admin portal

---

### 3. Doctor

**Description**: Normal doctor member of a practice

**Authentication**:
- Email/password login
- Session: `aip_doctor_session`
- Role: `'doctor'` in `aip_practice_roles[practiceId].doctorRoles[doctorId]`

**Capabilities**:

#### Profile Management
- ✅ Edit own profile (name, bio, credentials, etc.)
- ✅ Update own contact information
- ✅ Upload profile image
- ✅ Manage own specialties and certifications
- ❌ Cannot edit practice data
- ❌ Cannot edit other doctors' profiles

#### Viewing Powers
- ✅ View own dashboard
- ✅ View own referrals (sent/received)
- ✅ View own notifications
- ✅ View own membership status
- ✅ View personal contacts of other doctors (when logged in)
- ✅ View practice information (read-only)
- ✅ View other doctors in practice (read-only)

#### Referral Powers
- ✅ Send referrals to other doctors
- ✅ View referrals sent
- ✅ View referrals received
- ✅ Update referral status (own referrals)

#### Communication
- ✅ View notifications
- ✅ Participate in practice chat (future)
- ✅ Send direct messages to other doctors (future)

**UI Access**:
- `/doctor/dashboard` - Dashboard
- `/doctor/dashboard/profile` - Edit profile
- `/doctor/dashboard/referrals` - Referrals
- `/doctor/dashboard/notifications` - Notifications
- `/doctor/dashboard/membership` - Membership

**Restrictions**:
- ❌ Cannot approve join requests
- ❌ Cannot invite doctors
- ❌ Cannot edit practice data
- ❌ Cannot manage practice locations/insurance/services
- ❌ Cannot access admin portal
- ❌ Cannot see admin-only data

---

### 4. Applicant

**Description**: Doctor who has submitted join request but not yet approved

**Authentication**:
- Email/password login (if account created)
- Session: `aip_doctor_session` (limited)
- Status: Pending approval

**Capabilities**:

#### Application Management
- ✅ Submit join request
- ✅ View own application status
- ✅ Edit application (before approval)
- ✅ Track approval progress
- ✅ Receive approval/rejection notifications

**UI Access**:
- `/join-us` - Application form
- `/join-us/submitted` - Application status
- Limited dashboard access (if account created)

**Restrictions**:
- ❌ Cannot access full doctor portal
- ❌ Cannot edit profile (until approved)
- ❌ Cannot send referrals
- ❌ Cannot view other doctors
- ❌ Cannot access practice data

---

### 5. Public

**Description**: Unauthenticated user

**Authentication**:
- None (not logged in)

**Capabilities**:

#### Viewing Powers
- ✅ Search practices
- ✅ View practice pages
- ✅ View doctor pages (limited info)
- ✅ View practice contact information
- ✅ Filter by specialty, location, ZIP
- ❌ Cannot view doctor personal contacts
- ❌ Cannot view doctor email/phone
- ❌ Cannot send referrals
- ❌ Cannot access any portal

**UI Access**:
- `/` - Homepage
- `/doctors` - Doctor directory
- `/practices` - Practice directory (NEW)
- `/practices/[slug]` - Practice page (NEW)
- `/doctors/[slug]` - Doctor page (limited)

**Restrictions**:
- ❌ No portal access
- ❌ No editing capabilities
- ❌ No personal data access
- ❌ No referral capabilities

---

## Permission Matrix

### Practice Data Access

| Action | Admin | Practice Admin | Doctor | Applicant | Public |
|--------|-------|----------------|--------|-----------|--------|
| View practice info | ✅ | ✅ | ✅ | ❌ | ✅ |
| Edit practice info | ✅ | ⚠️ (Admin approval) | ❌ | ❌ | ❌ |
| View practice locations | ✅ | ✅ | ✅ | ❌ | ✅ |
| Edit practice locations | ✅ | ⚠️ (Admin approval) | ❌ | ❌ | ❌ |
| View practice insurance | ✅ | ✅ | ✅ | ❌ | ✅ |
| Edit practice insurance | ✅ | ⚠️ (Admin approval) | ❌ | ❌ | ❌ |
| View practice doctors | ✅ | ✅ | ✅ | ❌ | ✅ |
| Manage practice doctors | ✅ | ✅ (own practice) | ❌ | ❌ | ❌ |

### Doctor Data Access

| Action | Admin | Practice Admin | Doctor | Applicant | Public |
|--------|-------|----------------|--------|-----------|--------|
| View doctor profile | ✅ | ✅ | ✅ | ❌ | ✅ (limited) |
| View doctor personal contacts | ✅ | ✅ | ✅ (logged in) | ❌ | ❌ |
| Edit own profile | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit other doctor profile | ✅ | ⚠️ (practice doctors) | ❌ | ❌ | ❌ |
| View doctor email/phone | ✅ | ✅ | ✅ (logged in) | ❌ | ❌ |

### Approval Powers

| Action | Admin | Practice Admin | Doctor | Applicant | Public |
|--------|-------|----------------|--------|-----------|--------|
| Approve practice creation | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve doctor join | ✅ | ✅ (own practice) | ❌ | ❌ | ❌ |
| Approve practice edits | ✅ | ❌ | ❌ | ❌ | ❌ |
| Invite doctors | ✅ | ✅ (own practice) | ❌ | ❌ | ❌ |
| Override approvals | ✅ | ❌ | ❌ | ❌ | ❌ |

### Referral Powers

| Action | Admin | Practice Admin | Doctor | Applicant | Public |
|--------|-------|----------------|--------|-----------|--------|
| Send referral | ✅ | ✅ | ✅ | ❌ | ❌ |
| View sent referrals | ✅ | ✅ | ✅ | ❌ | ❌ |
| View received referrals | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update referral status | ✅ | ✅ | ✅ (own) | ❌ | ❌ |

### Portal Access

| Portal | Admin | Practice Admin | Doctor | Applicant | Public |
|--------|-------|----------------|--------|-----------|--------|
| Admin Portal | ✅ | ❌ | ❌ | ❌ | ❌ |
| Doctor Portal | ❌ | ✅ | ✅ | ⚠️ (limited) | ❌ |
| Practice Admin Portal | ❌ | ✅ | ❌ | ❌ | ❌ |

**Legend**:
- ✅ Full access
- ⚠️ Conditional/limited access
- ❌ No access

---

## Permission Check Functions

### Implementation Examples

```typescript
// Check if user is Admin
function isAdmin(session: Session): boolean {
  return session.role === 'admin';
}

// Check if doctor is Practice Admin
function isPracticeAdmin(doctorId: string, practiceId: string): boolean {
  const roles = getPracticeRoles();
  return roles[practiceId]?.adminDoctorId === doctorId;
}

// Check if doctor can edit practice
function canEditPractice(doctorId: string, practiceId: string): boolean {
  return isAdmin(getSession()) || isPracticeAdmin(doctorId, practiceId);
}

// Check if doctor can approve join requests
function canApproveJoinRequests(doctorId: string, practiceId: string): boolean {
  return isAdmin(getSession()) || isPracticeAdmin(doctorId, practiceId);
}

// Check if user can view doctor personal contacts
function canViewDoctorContacts(userRole: Role, isAuthenticated: boolean): boolean {
  if (userRole === 'admin') return true;
  if (userRole === 'practice_admin' || userRole === 'doctor') return isAuthenticated;
  return false;
}

// Check if user can send referral
function canSendReferral(userRole: Role): boolean {
  return ['admin', 'practice_admin', 'doctor'].includes(userRole);
}
```

---

## Contact Visibility Rules

### Doctor Profile Page

**Public (Not Logged In)**:
- ❌ Hide doctor personal phone
- ❌ Hide doctor personal email
- ✅ Show practice contact phone
- ✅ Show practice contact email
- ✅ Show practice name and link

**Doctor Logged In**:
- ✅ Show doctor personal phone
- ✅ Show doctor personal email
- ✅ Show practice section with practice contact
- ✅ Show "Send Referral" button
- ✅ Show practice name and link

**Practice Admin Logged In**:
- ✅ Show all doctor personal contacts (in practice)
- ✅ Show practice contact
- ✅ Show "Send Referral" button
- ✅ Show practice management links

**Admin Logged In**:
- ✅ Show all contacts (full access)
- ✅ Show edit buttons
- ✅ Show approval status

### Practice Profile Page

**All Users**:
- ✅ Show practice contact information
- ✅ Show practice locations
- ✅ Show practice insurance/services
- ✅ Show doctor list (with visibility rules per doctor)

---

## Approval Workflow Permissions

### Scenario A: Doctor Joins Existing Practice

**Required Approvals**:
1. Practice Admin (of target practice)
2. Admin

**Who Can Approve**:
- Practice Admin: ✅ Can approve/deny
- Admin: ✅ Can approve/deny
- Doctor: ❌ Cannot approve
- Other Practice Admin: ❌ Cannot approve (different practice)

### Scenario B: Doctor Creates New Practice

**Required Approvals**:
1. Admin only

**Who Can Approve**:
- Admin: ✅ Can approve/deny
- Practice Admin: ❌ Cannot approve (practice doesn't exist yet)
- Doctor: ❌ Cannot approve

### Scenario C: Practice Admin Invites Doctor

**Required Approvals**:
1. Admin (always)
2. Practice Admin (may auto-approve if configurable)

**Who Can Approve**:
- Admin: ✅ Can approve/deny
- Inviting Practice Admin: ⚠️ May auto-approve (configurable)
- Other Practice Admin: ❌ Cannot approve (different practice)

### Scenario D: Practice Edit Request

**Required Approvals**:
1. Admin only

**Who Can Approve**:
- Admin: ✅ Can approve/deny
- Practice Admin: ❌ Cannot approve own edits (prevents conflicts)
- Doctor: ❌ Cannot approve

---

## UI Rendering Rules

### Show/Hide Based on Role

```typescript
// Example: Show practice edit button
{canEditPractice(currentDoctor.id, practice.id) && (
  <Button>Edit Practice</Button>
)}

// Example: Show invite doctor button
{isPracticeAdmin(currentDoctor.id, practice.id) && (
  <Button>Invite Doctor</Button>
)}

// Example: Show personal contacts
{canViewDoctorContacts(userRole, isAuthenticated) && (
  <div>
    <p>Email: {doctor.email}</p>
    <p>Phone: {doctor.phone}</p>
  </div>
)}

// Example: Show send referral button
{canSendReferral(userRole) && (
  <Button>Send Referral</Button>
)}
```

---

## Security Considerations

### Client-Side Validation

⚠️ **Important**: All permission checks are client-side. For production:
- Implement server-side validation
- Use API endpoints with authentication
- Validate permissions on backend
- Never trust client-side checks alone

### localStorage Security

- Store sensitive data encrypted (future)
- Validate session tokens
- Implement session expiry
- Clear sessions on logout

---

## Migration Notes

### From v1 to v2

**New Roles**:
- Practice Admin (new elevated doctor role)

**Changed Permissions**:
- Doctors can no longer edit practice data directly
- Practice edits require Admin approval
- Multi-party approval workflows introduced

**New Restrictions**:
- Doctors cannot approve join requests (unless Practice Admin)
- Contact visibility now role-dependent

---

**Next Steps**: See `V2_APPROVAL_WORKFLOWS.md` for detailed workflow documentation.
