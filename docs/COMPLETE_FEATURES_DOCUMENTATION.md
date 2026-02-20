# Complete Features Documentation

**Date**: January 29, 2026  
**Version**: 2.0  
**Status**: Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Core Features](#core-features)
3. [User Roles & Portals](#user-roles--portals)
4. [Feature Details with Function References](#feature-details-with-function-references)
5. [Data Models](#data-models)
6. [Storage Architecture](#storage-architecture)

---

## Overview

The Alliance of Independent Physicians (AIP) platform is a comprehensive physician network and patient directory system built on a **practice-centric architecture (V2)**. The system supports multi-party approval workflows, doctor-to-doctor referrals, real-time messaging, and comprehensive practice management.

### Key Architectural Principles

- **Practice-Centric**: Practices are the primary entity; doctors belong to practices
- **Multi-Party Approvals**: Admin + Practice Admin dual-approval system
- **Role-Based Access Control**: Strict permission enforcement at the service layer
- **Data Integrity**: Governance rules prevent corruption and ensure consistency
- **Audit Trail**: Append-only history for all state changes

---

## Core Features

### 1. Practice Management
**Description**: Complete practice lifecycle management with multi-location support, roster management, and approval workflows.

**Key Capabilities**:
- Create new practices (requires admin approval)
- Edit practice information (requires admin approval)
- Manage multiple locations per practice
- Manage practice roster (add/remove doctors)
- Manage insurance and services lists
- View practice membership status

**Function References**:
- `submitApprovalRequest()` - `src/lib/services/approvalEngine.ts:304`
- `decideAsAdmin()` - `src/lib/services/approvalEngine.ts:470`
- `decideAsPracticeAdmin()` - `src/lib/services/approvalEngine.ts:580`
- `getPracticeById()` - `src/lib/services/practiceDirectoryService.ts:106`
- `savePracticeOverride()` - `src/lib/storage/practiceStorage.ts`

**UI Components**:
- `/practices` - Practice directory listing
- `/practices/[slug]` - Practice detail page
- `/doctor/dashboard/practice` - Practice admin portal

---

### 2. Doctor Management
**Description**: Doctor profile management, practice assignment, and role management.

**Key Capabilities**:
- Create doctor profiles (via approval workflow)
- Edit doctor profiles
- Assign doctors to practices
- Manage doctor roles (doctor vs practice_admin)
- View doctor personal contacts (role-dependent visibility)

**Function References**:
- `submitApprovalRequest()` - `src/lib/services/approvalEngine.ts:304` (for join requests)
- `saveDoctorOverride()` - `src/lib/memberStorage.ts`
- `getActorFromSession()` - `src/lib/services/permissionService.ts:32`
- `canViewDoctorPrivateContact()` - `src/lib/services/permissionService.ts:157`

**UI Components**:
- `/doctors` - Doctor directory
- `/doctors/[slug]` - Doctor profile page
- `/doctor/dashboard/profile` - Edit own profile

---

### 3. Approval Workflows
**Description**: Multi-party approval system for all practice and doctor changes.

**Approval Types**:
1. `new_practice_with_admin_doctor` - Create practice + admin doctor
2. `doctor_join_practice` - Doctor joins existing practice
3. `practice_edit_request` - Edit practice details
4. `practice_location_add_request` - Add location
5. `practice_location_edit_request` - Edit location
6. `practice_location_remove_request` - Remove location
7. `practice_doctor_add_request` - Add doctor to roster
8. `practice_doctor_remove_request` - Remove doctor from roster

**Function References**:
- `submitApprovalRequest()` - `src/lib/services/approvalEngine.ts:304`
- `decideAsAdmin()` - `src/lib/services/approvalEngine.ts:470`
- `decideAsPracticeAdmin()` - `src/lib/services/approvalEngine.ts:580`
- `getApprovalRequests()` - `src/lib/storage/approvalStorage.ts`
- `appendApprovalHistory()` - `src/lib/storage/approvalStorage.ts`
- `requiresPracticeAdminApproval()` - `src/lib/services/approvalEngine.ts:70`

**UI Components**:
- `/admin/requests-v2` - Admin approval queue
- `/admin/requests-v2/[id]` - Approval detail page
- `/admin/history/approvals` - Approval history
- `/doctor/dashboard/practice/approvals` - Practice admin approval queue

---

### 4. Referral System
**Description**: Doctor-to-doctor referral management with history tracking and notifications.

**Key Capabilities**:
- Send referrals to other doctors
- View sent and received referrals
- Update referral status (new → attended → removed)
- Track referral history (append-only audit trail)
- Receive notifications for new referrals

**Function References**:
- `createReferral()` - `src/lib/services/referralEngine.ts:83`
- `updateReferralStatus()` - `src/lib/services/referralEngine.ts:165`
- `getReferrals()` - `src/lib/storage/referralStorage.ts`
- `getHistoryForReferral()` - `src/lib/storage/referralHistoryStorage.ts`
- `canSendReferral()` - `src/lib/services/permissionService.ts:179`

**UI Components**:
- `/doctor/dashboard/referrals` - Referrals page (Sent/Received tabs)
- Doctor profile page - "Send Referral" button

---

### 5. Notification System
**Description**: Real-time notifications for doctors with deep linking support.

**Notification Types**:
1. `referral_received` - New referral received
2. `referral_status_changed` - Referral status updated
3. `practice_admin_approval_request` - Approval request needs action
4. `admin_approval_result` - Admin approved/rejected request
5. `membership_expiry_warning` - Membership expiring soon

**Function References**:
- `addNotification()` - `src/lib/storage/notificationStorage.ts`
- `getNotifications()` - `src/lib/storage/notificationStorage.ts`
- `markNotificationRead()` - `src/lib/storage/notificationStorage.ts`
- `getUnreadCount()` - `src/lib/storage/notificationStorage.ts`

**UI Components**:
- `/doctor/dashboard/notifications` - Notifications page
- Floating notification icon (unread count badge)

---

### 6. Messaging System
**Description**: Real-time doctor-to-doctor messaging using Firebase Firestore.

**Key Capabilities**:
- Send messages to other doctors
- View conversation threads
- Real-time message updates
- Unread message count
- Message persistence (IndexedDB)

**Function References**:
- `sendMessage()` - `src/lib/messageStorage.ts:20`
- `subscribeToConversation()` - `src/lib/messageStorage.ts:76`
- `subscribeToConversationPartners()` - `src/lib/messageStorage.ts:143`
- `markConversationAsRead()` - `src/lib/messageStorage.ts:147`

**UI Components**:
- `/doctor/dashboard/messages` - Messages page
- `/doctor/dashboard/messages/[otherDoctorId]` - Conversation view
- Floating message icon (unread count)
- Message button on doctor cards and profiles

---

### 7. Multi-Location Support
**Description**: Practices can have multiple locations with individual management.

**Key Capabilities**:
- Add multiple locations to a practice
- Edit location details
- Remove locations (with last-location guard)
- View all locations on map
- Distance calculation uses closest location

**Function References**:
- `submitApprovalRequest()` - `src/lib/services/approvalEngine.ts:304` (location types)
- `validateLocationApprovalRequest()` - `src/lib/services/approvalEngine.ts:318`
- `geocodeZip()` - `src/lib/services/geocodingService.ts:9`

**UI Components**:
- `/doctor/dashboard/practice/locations` - Location management page
- Practice profile page - Map with all locations

---

### 8. Contact Visibility Rules
**Description**: Role-based contact information display for privacy compliance.

**Visibility Rules**:
- **Public**: See practice contact only
- **Logged-in Doctors**: See personal doctor contacts
- **Practice Admin**: See all practice doctor contacts
- **Admin**: See all contacts

**Function References**:
- `getContactCard()` - `src/lib/services/visibilityService.ts:44`
- `canViewDoctorPrivateContact()` - `src/lib/services/permissionService.ts:157`
- `getDoctorPublicContact()` - `src/lib/services/visibilityService.ts:44`

**UI Components**:
- Doctor profile page - Conditional contact display
- Practice profile page - Doctor cards with visibility rules

---

### 9. Membership Management
**Description**: Track doctor and practice membership plans and status.

**Key Capabilities**:
- View membership status
- Track membership expiry
- View billing information
- Receive expiry warnings

**Function References**:
- `getMembership()` - `src/lib/services/membershipService.ts`
- `getMembershipStatus()` - `src/lib/services/membershipService.ts`

**UI Components**:
- `/doctor/dashboard/membership` - Membership page
- `/doctor/dashboard/practice/membership` - Practice membership view

---

### 10. Announcements
**Description**: System-wide and practice-specific announcements.

**Key Capabilities**:
- Admin can create system-wide announcements
- Practice Admin can create practice announcements
- Doctors receive announcements in their feed
- Announcements are time-stamped and categorized

**Function References**:
- `createAnnouncement()` - `src/lib/services/announcementService.ts`
- `getAnnouncements()` - `src/lib/services/announcementService.ts`
- `getPracticeAnnouncements()` - `src/lib/services/announcementService.ts`

**UI Components**:
- `/doctor/dashboard/announcements` - Announcements feed
- `/admin/announcements` - Admin announcement management

---

## User Roles & Portals

### Admin Portal
**Route**: `/admin/*`

**Features**:
- Approval queue management
- Member management
- Membership plan management
- Policy management
- Event management
- Analytics and statistics

**Key Functions**:
- `assertAdmin()` - `src/lib/services/permissionService.ts:109`
- `decideAsAdmin()` - `src/lib/services/approvalEngine.ts:470`

---

### Practice Admin Portal
**Route**: `/doctor/dashboard/practice/*`

**Features**:
- Practice overview and management
- Approval queue (practice-specific)
- Location management
- Roster management (doctors)
- Insurance/services management
- Practice history

**Key Functions**:
- `assertPracticeAdmin()` - `src/lib/services/permissionService.ts:132`
- `decideAsPracticeAdmin()` - `src/lib/services/approvalEngine.ts:580`
- `canApproveAsPracticeAdmin()` - `src/lib/services/permissionService.ts:189`

---

### Doctor Portal
**Route**: `/doctor/dashboard/*`

**Features**:
- Dashboard overview
- Profile editing
- Referrals (sent/received)
- Notifications
- Messages
- Announcements
- Membership view

**Key Functions**:
- `assertAuthenticated()` - `src/lib/services/permissionService.ts:99`
- `canSendReferral()` - `src/lib/services/permissionService.ts:179`

---

### Public Portal
**Route**: `/`, `/practices`, `/doctors`

**Features**:
- Practice directory search
- Doctor directory search
- Practice profile pages
- Doctor profile pages (limited info)
- Contact information (practice-level only)

**Key Functions**:
- `getContactCard()` - `src/lib/services/visibilityService.ts:44` (public mode)

---

## Feature Details with Function References

### Practice Creation Workflow

**Flow**:
1. Doctor submits practice creation request
2. Admin reviews and approves/rejects
3. On approval: Practice + Doctor created, Practice Admin role assigned

**Functions**:
```typescript
// Submit request
submitApprovalRequest(actor, {
  type: 'new_practice_with_admin_doctor',
  payload: { practice: {...}, doctor: {...} }
})
// Location: src/lib/services/approvalEngine.ts:304

// Admin approves
decideAsAdmin(actor, requestId, 'approve', { notes: '...' })
// Location: src/lib/services/approvalEngine.ts:470

// Side effects (on approval):
// - Practice created: addCreatedPractice()
// - Doctor created: saveDoctorOverride()
// - Practice Admin assigned: setPracticeAdmin()
```

---

### Doctor Join Practice Workflow

**Flow**:
1. Doctor selects practice and submits join request
2. Practice Admin reviews and approves/rejects
3. Admin reviews and approves/rejects
4. Both must approve → Doctor added to practice

**Functions**:
```typescript
// Submit request
submitApprovalRequest(actor, {
  type: 'doctor_join_practice',
  payload: { doctor: {...} },
  target: { practiceId: '...' }
})
// Location: src/lib/services/approvalEngine.ts:304

// Practice Admin approves
decideAsPracticeAdmin(actor, requestId, 'approve', { notes: '...' })
// Location: src/lib/services/approvalEngine.ts:580

// Admin approves
decideAsAdmin(actor, requestId, 'approve', { notes: '...' })
// Location: src/lib/services/approvalEngine.ts:470

// Side effects (on both approvals):
// - Doctor added to practice: updatePracticeDoctorIds()
// - Notification sent: addNotification()
```

---

### Referral Creation Workflow

**Flow**:
1. Doctor selects recipient and fills referral form
2. Referral created with status 'new'
3. Recipient receives notification
4. Recipient can update status (attended/removed)

**Functions**:
```typescript
// Create referral
createReferral(actor, {
  toDoctorId: '...',
  patient: { initials: '...', age: 45 },
  condition: '...',
  notes: '...'
})
// Location: src/lib/services/referralEngine.ts:83

// Update status
updateReferralStatus(actor, referralId, 'attended')
// Location: src/lib/services/referralEngine.ts:165

// History tracking (automatic)
appendReferralHistoryRecord(referralId, 'created', actor)
// Location: src/lib/services/referralEngine.ts:48
```

---

### Location Management Workflow

**Flow**:
1. Practice Admin requests location add/edit/remove
2. Admin reviews changes (with diff view)
3. Admin approves/rejects
4. On approval: Location changes applied

**Functions**:
```typescript
// Submit location add request
submitApprovalRequest(actor, {
  type: 'practice_location_add_request',
  payload: {
    location: { name: '...', address: {...}, isPrimary: false }
  },
  target: { practiceId: '...' }
})
// Location: src/lib/services/approvalEngine.ts:304

// Validation
validateLocationApprovalRequest(type, payload, target)
// Location: src/lib/services/approvalEngine.ts:318

// Admin approves
decideAsAdmin(actor, requestId, 'approve')
// Location: src/lib/services/approvalEngine.ts:470

// Side effects (on approval):
// - Location added: updatePracticeLocations()
// - Practice updated: savePracticeOverride()
```

---

## Data Models

### Practice
```typescript
interface Practice {
  id: string;
  slug: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  address: Address;
  location: { lat: number; lng: number };
  locationList: PracticeLocation[];
  doctorIds: string[];
  specialties: string[];
  services: string[];
  insurance: Insurance[];
  createdAt: string;
  updatedAt: string;
}
```
**Location**: `src/types/practice.ts`

---

### Doctor
```typescript
interface Doctor {
  id: string;
  slug: string;
  practiceId: string; // Required in V2
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  specialty: string;
  specialties: string[];
  roleInPractice: 'doctor' | 'practice_admin';
  verified: boolean;
  // ... other fields
}
```
**Location**: `src/types/index.ts`

---

### ApprovalRequest
```typescript
interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  submittedBy: { role: string; email: string; doctorId?: string };
  target: { practiceId?: string; doctorId?: string };
  payload: Record<string, any>;
  approvals: {
    admin: { status: 'pending' | 'approved' | 'rejected'; ... };
    practiceAdmin?: { status: 'pending' | 'approved' | 'rejected'; ... };
  };
  createdAt: string;
  updatedAt: string;
}
```
**Location**: `src/types/approvals.ts`

---

### Referral
```typescript
interface Referral {
  id: string;
  fromDoctorId: string;
  toDoctorId: string;
  fromPracticeId: string;
  toPracticeId: string;
  patient: { initials?: string; age?: number; sex?: string };
  condition: string;
  notes?: string;
  status: 'new' | 'attended' | 'removed';
  createdAt: string;
  updatedAt: string;
}
```
**Location**: `src/types/referrals.ts`

---

## Storage Architecture

### localStorage Keys

**Practice Storage**:
- `aip_practice_overrides` - Practice modifications
- `aip_created_practices` - Practices created via approval
- `aip_deleted_practices` - Deleted practices

**Doctor Storage**:
- `aip_doctor_overrides` - Doctor modifications
- `aip_deleted_doctors` - Deleted doctors

**Approval System**:
- `aip_approval_requests` - All approval requests
- `aip_approval_history` - Approval history log
- `aip_practice_invitations` - Practice invitations

**Referrals**:
- `aip_referrals` - All referrals
- `aip_referral_history` - Referral history

**Notifications**:
- `aip_notifications_{doctorId}` - Per-doctor notifications

**Sessions**:
- `aip_admin_session` - Admin session
- `aip_doctor_session` - Doctor session

**Roles**:
- `aip_practice_roles` - Practice role assignments

---

## Key Service Files

### Approval Engine
**File**: `src/lib/services/approvalEngine.ts` (2000+ lines)

**Main Functions**:
- `submitApprovalRequest()` - Submit new approval request
- `decideAsAdmin()` - Admin approval/rejection
- `decideAsPracticeAdmin()` - Practice Admin approval/rejection
- `getApprovalRequests()` - Get requests (filtered by role)
- `validateLocationApprovalRequest()` - Validate location requests
- `validateRosterPayload()` - Validate roster requests

---

### Referral Engine
**File**: `src/lib/services/referralEngine.ts`

**Main Functions**:
- `createReferral()` - Create new referral
- `updateReferralStatus()` - Update referral status
- `getReferralsForDoctor()` - Get doctor's referrals
- `appendReferralHistoryRecord()` - Add history entry

---

### Permission Service
**File**: `src/lib/services/permissionService.ts`

**Main Functions**:
- `getActorFromSession()` - Get current user actor
- `assertAuthenticated()` - Require authentication
- `assertAdmin()` - Require admin role
- `assertPracticeAdmin()` - Require practice admin role
- `canSendReferral()` - Check referral permission
- `canViewDoctorPrivateContact()` - Check contact visibility
- `canApproveAsPracticeAdmin()` - Check approval permission

---

### Visibility Service
**File**: `src/lib/services/visibilityService.ts`

**Main Functions**:
- `getContactCard()` - Get contact info based on role
- `getDoctorPublicContact()` - Get public contact info

---

## UI Component Structure

### Admin Components
- `src/app/admin/requests-v2/page.tsx` - Approval queue
- `src/app/admin/requests-v2/[id]/page.tsx` - Approval detail
- `src/components/admin/RequestsTable.tsx` - Request table
- `src/components/shared/approvals/RequestedChangesRenderer.tsx` - Request renderer

### Practice Admin Components
- `src/app/doctor/dashboard/practice/page.tsx` - Practice overview
- `src/app/doctor/dashboard/practice/locations/page.tsx` - Location management
- `src/app/doctor/dashboard/practice/doctors/page.tsx` - Roster management

### Doctor Components
- `src/app/doctor/dashboard/referrals/page.tsx` - Referrals page
- `src/app/doctor/dashboard/notifications/page.tsx` - Notifications
- `src/app/doctor/dashboard/messages/page.tsx` - Messages
- `src/components/dashboard/MessagesSection.tsx` - Message UI

### Public Components
- `src/app/practices/page.tsx` - Practice directory
- `src/app/practices/[slug]/page.tsx` - Practice profile
- `src/components/public/practices/PracticeCard.tsx` - Practice card
- `src/components/public/practices/DoctorMiniCard.tsx` - Doctor card

---

## Storage Functions

### Approval Storage
**File**: `src/lib/storage/approvalStorage.ts`

**Functions**:
- `getApprovalRequests()` - Get all requests
- `addApprovalRequest()` - Add new request
- `updateApprovalRequest()` - Update request
- `appendApprovalHistory()` - Add history entry
- `getApprovalHistory()` - Get history

### Referral Storage
**File**: `src/lib/storage/referralStorage.ts`

**Functions**:
- `getReferrals()` - Get all referrals
- `addReferral()` - Add new referral
- `updateReferral()` - Update referral

### Notification Storage
**File**: `src/lib/storage/notificationStorage.ts`

**Functions**:
- `addNotification()` - Add notification
- `getNotifications()` - Get doctor's notifications
- `markNotificationRead()` - Mark as read
- `getUnreadCount()` - Get unread count

---

## Error Handling

### Error Types
**File**: `src/lib/services/errors.ts`

**Error Classes**:
- `AuthRequiredError` - Authentication required
- `PermissionDeniedError` - Permission denied
- `NotFoundError` - Resource not found
- `ValidationError` - Validation failed
- `ConflictError` - Conflict (duplicate, etc.)

---

## Testing & Verification

### Test Credentials

**Admin**:
- Email: `admin@aip.com`
- Password: `Admin@12345`

**Doctor**:
- Email: `doctor@aip.com`
- Password: `Doctor@12345`

**Practice Admin**:
- Email: `[practice_admin_email]@aip.com`
- Password: `Doctor@12345`

---

## Future Enhancements

### Planned Features
- Chat scaffolding (Phase 8) - Low priority
- Server-side API endpoints
- Real-time collaboration features
- Advanced analytics dashboard
- Email notifications
- Mobile app

---

**Last Updated**: January 29, 2026  
**Documentation Version**: 1.0
