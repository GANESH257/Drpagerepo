# V2 Quick Reference Guide

## Overview

This is a quick reference guide for AIP v2 implementation. Use this for quick lookups during development.

**Last Updated**: January 29, 2026  
**Version**: 2.0

---

## Key Changes at a Glance

| Aspect | v1 | v2 |
|--------|----|----|
| **Primary Entity** | Doctors | Practices |
| **Doctor Relationship** | Standalone | Belongs to Practice |
| **Approval** | Admin only | Admin + Practice Admin |
| **Join Flow** | Single request | Multi-party approval |
| **Contact Visibility** | Always visible | Role-dependent |
| **Practice Data** | Doctor-level | Practice-level |

---

## Core Entities Quick Reference

### Practice
```typescript
{
  id, slug, name, description,
  phone, email, website,
  address: { line1, city, state, zip, country },
  location: { lat, lng },
  logo, images[],
  specialties[], services[], insurance[],
  locationList: PracticeLocation[],
  doctorIds: string[],
  createdAt, updatedAt
}
```

### Doctor
```typescript
{
  id, slug, practiceId, // ← NEW: practiceId required
  firstName, lastName, fullName,
  credentials[], bio, specialty, specialties[],
  email, phone, // ← Visibility controlled
  // ... other fields
}
```

### ApprovalRequest
```typescript
{
  id, type: ApprovalRequestType,
  requestedBy, practiceId?,
  payload: any,
  adminStatus: 'pending' | 'approved' | 'rejected',
  practiceAdminStatus?: 'pending' | 'approved' | 'rejected',
  createdAt, updatedAt
}
```

---

## Role Hierarchy

```
Admin (Highest)
  ├── Practice Admin (Elevated Doctor)
  │     └── Doctor (Normal)
  └── Applicant → Public
```

---

## Permission Quick Checks

### Is Practice Admin?
```typescript
isPracticeAdmin(doctorId, practiceId)
// Checks: aip_practice_roles[practiceId].adminDoctorId === doctorId
```

### Can Edit Practice?
```typescript
canEditPractice(doctorId, practiceId)
// Returns: isAdmin() || isPracticeAdmin(doctorId, practiceId)
```

### Can View Personal Contacts?
```typescript
canViewDoctorContacts(role, isAuthenticated)
// Returns: role === 'admin' || (role in ['practice_admin', 'doctor'] && isAuthenticated)
```

### Can Send Referral?
```typescript
canSendReferral(role)
// Returns: role in ['admin', 'practice_admin', 'doctor']
```

---

## Approval Workflows

### Scenario A: Doctor Joins Practice
1. Doctor selects practice → submits
2. Status: `pending_practice_admin_approval + pending_admin_approval`
3. Both must approve → Active

### Scenario B: Doctor Creates Practice
1. Doctor creates practice → submits
2. Status: `pending_admin_approval`
3. Admin approves → Practice + Doctor created

### Scenario C: Practice Admin Invites
1. Practice Admin invites → invitation created
2. Doctor accepts → join request created
3. Both approve → Doctor added

### Scenario D: Practice Edit
1. Practice Admin edits → edit request created
2. Status: `pending_admin_approval`
3. Admin approves → Changes applied

---

## localStorage Keys

### Existing (Keep)
- `aip_doctor_overrides`
- `aip_institution_overrides` → Treat as practices
- `aip_join_requests` → Migrate to approval_requests
- `aip_admin_session`
- `aip_doctor_session`
- `aip_membership_{doctorId}`

### New (v2)
- `aip_practice_overrides`
- `aip_practice_roles` ← **NEW**
- `aip_approval_requests` ← **NEW**
- `aip_practice_invitations` ← **NEW**
- `aip_notifications_{doctorId}` ← **NEW**
- `aip_referrals` ← **NEW** (or per-doctor)

---

## Contact Visibility Rules

### Public (Not Logged In)
- ❌ Doctor personal phone/email
- ✅ Practice contact phone/email

### Doctor Logged In
- ✅ Doctor personal phone/email
- ✅ Practice contact
- ✅ "Send Referral" button

### Practice Admin Logged In
- ✅ All practice doctor contacts
- ✅ Practice contact
- ✅ Practice management UI

### Admin Logged In
- ✅ All contacts
- ✅ Edit capabilities

---

## File Structure

### New Files to Create
```
src/
├── types/
│   ├── practice.ts          ← NEW
│   ├── approval.ts          ← NEW
│   └── notification.ts      ← NEW
├── data/
│   └── practices.ts         ← NEW (or rename institutions.ts)
├── lib/
│   ├── practiceRoles.ts     ← NEW
│   ├── permissions.ts       ← NEW
│   ├── approvalRequests.ts  ← NEW
│   └── notifications.ts      ← NEW
└── app/
    ├── practices/           ← NEW
    │   └── [slug]/
    │       └── page.tsx
    └── doctor/
        └── dashboard/
            ├── notifications/    ← NEW
            │   └── page.tsx
            └── practice/         ← NEW
                ├── page.tsx
                ├── locations/
                ├── doctors/
                └── approvals/
```

---

## Routes Quick Reference

### Public Routes
- `/` - Homepage
- `/doctors` - Doctor directory
- `/practices` - Practice directory ← **NEW**
- `/practices/[slug]` - Practice page ← **NEW**
- `/doctors/[slug]` - Doctor page (updated)

### Doctor Portal Routes
- `/doctor/dashboard` - Overview
- `/doctor/dashboard/profile` - Edit profile
- `/doctor/dashboard/referrals` - Referrals (enhanced)
- `/doctor/dashboard/notifications` - Notifications ← **NEW**
- `/doctor/dashboard/practice` - Practice management ← **NEW** (Practice Admin)
- `/doctor/dashboard/practice/locations` - Locations ← **NEW** (Practice Admin)
- `/doctor/dashboard/practice/doctors` - Doctors ← **NEW** (Practice Admin)
- `/doctor/dashboard/practice/approvals` - Approvals ← **NEW** (Practice Admin)

### Admin Portal Routes
- `/admin` - Dashboard
- `/admin/requests` - Approval queue (enhanced)
- `/admin/members` - Members
- `/admin/memberships` - Plans
- `/admin/policies` - Policies
- `/admin/events` - Events

---

## Approval Request Types

```typescript
type ApprovalRequestType =
  | 'doctor_join_existing_practice'
  | 'practice_create_with_admin'
  | 'practice_edit'
  | 'doctor_add_to_practice'
  | 'practice_location_change'
  | 'practice_insurance_change'
  | 'practice_services_change';
```

---

## Status Values

### Approval Status
- `pending` - Awaiting review
- `approved` - Approved
- `rejected` - Rejected

### Referral Status
- `new` - New referral
- `attended` - Patient attended
- `removed` - Removed/cancelled

### Notification Status
- `read` - Notification read
- `unread` - Notification unread

---

## Common Functions

### Practice Roles
```typescript
// Get Practice Admin
getPracticeAdmin(practiceId): string | null

// Check if Practice Admin
isPracticeAdmin(doctorId, practiceId): boolean

// Get doctor role
getDoctorRole(doctorId, practiceId): 'practice_admin' | 'doctor' | null

// Set Practice Admin
setPracticeAdmin(practiceId, doctorId): void
```

### Approval Requests
```typescript
// Create request
createApprovalRequest(type, data): ApprovalRequest

// Approve request
approveRequest(requestId, role, notes?): void

// Reject request
rejectRequest(requestId, role, reason): void

// Get pending requests
getPendingRequests(role, practiceId?): ApprovalRequest[]
```

### Referrals
```typescript
// Get incoming referrals
getIncomingReferrals(doctorId): Referral[]

// Get outgoing referrals
getOutgoingReferrals(doctorId): Referral[]

// Create referral
createReferral(fromDoctorId, toDoctorId, data): Referral

// Update status
updateReferralStatus(referralId, status): void
```

### Notifications
```typescript
// Create notification
createNotification(doctorId, type, title, message, link?): Notification

// Get notifications
getNotifications(doctorId): Notification[]

// Mark as read
markNotificationRead(notificationId): void

// Get unread count
getUnreadCount(doctorId): number
```

---

## UI Component Patterns

### Show Based on Role
```tsx
{isPracticeAdmin(doctor.id, practice.id) && (
  <Button>Edit Practice</Button>
)}
```

### Contact Visibility
```tsx
{canViewDoctorContacts(userRole, isAuthenticated) ? (
  <div>
    <p>Email: {doctor.email}</p>
    <p>Phone: {doctor.phone}</p>
  </div>
) : (
  <div>
    <p>Email: {practice.email}</p>
    <p>Phone: {practice.phone}</p>
  </div>
)}
```

### Approval Status Display
```tsx
{request.adminStatus === 'approved' && 
 request.practiceAdminStatus === 'approved' ? (
  <Badge>Approved</Badge>
) : (
  <Badge>Pending</Badge>
)}
```

---

## Migration Checklist

### Data Migration
- [ ] Create practices from institutions
- [ ] Assign practiceId to all doctors
- [ ] Set Practice Admins
- [ ] Migrate join requests to approval queue
- [ ] Update localStorage keys

### Code Migration
- [ ] Update TypeScript types
- [ ] Create Practice components
- [ ] Update search/directory
- [ ] Create practice pages
- [ ] Update doctor portal
- [ ] Implement permissions
- [ ] Update contact visibility

### Testing
- [ ] Test approval workflows
- [ ] Test permission checks
- [ ] Test contact visibility
- [ ] Test data migration
- [ ] Test all user roles

---

## Common Issues & Solutions

### Issue: Practice Admin Not Found
**Solution**: Admin must assign Practice Admin first

### Issue: Doctor Without Practice
**Solution**: Create default practice or assign manually

### Issue: Contact Not Showing
**Solution**: Check `canViewDoctorContacts()` and login state

### Issue: Approval Stuck
**Solution**: Check both `adminStatus` and `practiceAdminStatus`

---

## Documentation Index

1. **V2_MIGRATION_GUIDE.md** - Step-by-step migration
2. **V2_ENTITY_MODELS.md** - Data structures
3. **V2_ROLES_PERMISSIONS.md** - Permission matrix
4. **V2_APPROVAL_WORKFLOWS.md** - Workflow details
5. **V2_IMPLEMENTATION_ROADMAP.md** - Implementation plan
6. **V2_QUICK_REFERENCE.md** - This file

---

## Development Tips

1. **Start with Data Model**: Get entities right first
2. **Test Permissions Early**: Don't wait until the end
3. **Use Feature Flags**: Toggle v1/v2 features
4. **Backup Data**: Before any migration
5. **Document as You Go**: Update docs with changes
6. **Test All Roles**: Don't just test as Admin

---

**For Detailed Information**: See the full documentation files listed above.
