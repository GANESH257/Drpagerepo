# Feature Explanations with Function References

**Date**: January 29, 2026  
**Version**: 2.0  
**Status**: Production Ready

---

## Table of Contents

1. [Practice Management](#practice-management)
2. [Doctor Management](#doctor-management)
3. [Approval System](#approval-system)
4. [Referral System](#referral-system)
5. [Messaging System](#messaging-system)
6. [Notification System](#notification-system)
7. [Location Management](#location-management)
8. [Contact Visibility](#contact-visibility)
9. [Authentication & Permissions](#authentication--permissions)

---

## Practice Management

### What It Does
Allows Practice Admins to manage their practice information, locations, roster, and services. All changes require Admin approval.

### Key Functions

#### Submit Practice Edit Request
**What**: Practice Admin requests changes to practice information

**Function**: `submitApprovalRequest(actor, { type: 'practice_edit_request', payload: {...} })`  
**Location**: `src/lib/services/approvalEngine.ts:304`

**Usage Example**:
```typescript
import { submitApprovalRequest } from '@/lib/services/approvalEngine';
import { getActorFromSession } from '@/lib/services/permissionService';

const actor = getActorFromSession();
const request = submitApprovalRequest(actor, {
  type: 'practice_edit_request',
  payload: {
    before: currentPractice, // Snapshot
    after: updatedPractice,  // Snapshot
    changedFields: ['name', 'phone']
  },
  target: { practiceId: practice.id }
});
```

**What Happens**:
1. Creates approval request with before/after snapshots
2. Sends notification to Admin
3. Admin reviews and approves/rejects
4. On approval: Changes applied to practice

---

#### Get Practice Information
**What**: Retrieve practice data by ID or slug

**Function**: `getPracticeById(practiceId: string)`  
**Location**: `src/lib/services/practiceDirectoryService.ts:106`

**Usage Example**:
```typescript
import { getPracticeById } from '@/lib/services/practiceDirectoryService';

const practice = getPracticeById('practice-123');
if (practice) {
  console.log(practice.name, practice.doctorIds);
}
```

**What It Returns**: Practice object with all fields including locations, doctors, insurance

---

#### Save Practice Override
**What**: Save modifications to practice (used after approval)

**Function**: `savePracticeOverride(practice: Practice)`  
**Location**: `src/lib/storage/practiceStorage.ts`

**Usage Example**:
```typescript
import { savePracticeOverride } from '@/lib/storage/practiceStorage';

// After approval, apply changes
savePracticeOverride({
  ...practice,
  name: 'New Name',
  phone: '555-1234'
});
```

**What Happens**: Stores practice modifications in `aip_practice_overrides`

---

## Doctor Management

### What It Does
Manages doctor profiles, practice assignments, and role assignments (doctor vs practice_admin).

### Key Functions

#### Submit Doctor Join Request
**What**: Doctor requests to join an existing practice

**Function**: `submitApprovalRequest(actor, { type: 'doctor_join_practice', ... })`  
**Location**: `src/lib/services/approvalEngine.ts:304`

**Usage Example**:
```typescript
const request = submitApprovalRequest(actor, {
  type: 'doctor_join_practice',
  payload: {
    doctor: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      specialty: 'Cardiology'
    }
  },
  target: { practiceId: 'practice-123' }
});
```

**What Happens**:
1. Creates approval request requiring Practice Admin + Admin approval
2. Both must approve → Doctor added to practice

---

#### Get Doctor Information
**What**: Retrieve doctor data by ID or email

**Function**: `getActorFromSession()` (for current doctor)  
**Location**: `src/lib/services/permissionService.ts:32`

**Usage Example**:
```typescript
import { getActorFromSession } from '@/lib/services/permissionService';

const actor = getActorFromSession();
if (actor.kind === 'doctor') {
  console.log('Doctor ID:', actor.doctorId);
  console.log('Practice ID:', actor.practiceId);
  console.log('Role:', actor.roleInPractice);
}
```

**What It Returns**: Actor object with doctor information

---

#### Save Doctor Override
**What**: Save modifications to doctor profile

**Function**: `saveDoctorOverride(doctor: Doctor)`  
**Location**: `src/lib/memberStorage.ts`

**Usage Example**:
```typescript
import { saveDoctorOverride } from '@/lib/memberStorage';

saveDoctorOverride({
  ...doctor,
  bio: 'Updated bio',
  phone: '555-5678'
});
```

**What Happens**: Stores doctor modifications in `aip_doctor_overrides`

---

## Approval System

### What It Does
Handles all approval workflows with multi-party approval (Admin + Practice Admin).

### Key Functions

#### Submit Approval Request
**What**: Create a new approval request

**Function**: `submitApprovalRequest(actor: Actor, input: SubmitApprovalInput)`  
**Location**: `src/lib/services/approvalEngine.ts:304`

**Parameters**:
- `actor`: Current user (from `getActorFromSession()`)
- `input.type`: Approval type (e.g., 'practice_edit_request')
- `input.payload`: Request-specific data
- `input.target`: Target practice/doctor IDs

**Returns**: `ApprovalRequest` object

**Usage Example**:
```typescript
import { submitApprovalRequest } from '@/lib/services/approvalEngine';
import { getActorFromSession } from '@/lib/services/permissionService';

const actor = getActorFromSession();
const request = submitApprovalRequest(actor, {
  type: 'practice_location_add_request',
  payload: {
    location: {
      name: 'Downtown Clinic',
      address: { line1: '123 Main St', city: 'St. Louis', state: 'MO', zip: '63101' },
      isPrimary: false
    }
  },
  target: { practiceId: 'practice-123' }
});
```

---

#### Admin Approve/Reject
**What**: Admin makes approval decision

**Function**: `decideAsAdmin(actor: Actor, requestId: string, decision: 'approve' | 'reject', options?)`  
**Location**: `src/lib/services/approvalEngine.ts:470`

**Parameters**:
- `actor`: Must be admin (checked via `assertAdmin()`)
- `requestId`: ID of approval request
- `decision`: 'approve' or 'reject'
- `options.notes`: Optional notes
- `options.reason`: Required if rejecting

**What Happens**:
- Updates `adminStatus` in request
- If approving: Executes side effects (creates/updates data)
- If rejecting: No mutations, just updates status
- Appends to approval history
- Sends notifications

**Usage Example**:
```typescript
import { decideAsAdmin } from '@/lib/services/approvalEngine';
import { getActorFromSession } from '@/lib/services/permissionService';

const actor = getActorFromSession();
decideAsAdmin(actor, 'apr-123', 'approve', {
  notes: 'Looks good, approved'
});
```

---

#### Practice Admin Approve/Reject
**What**: Practice Admin makes approval decision (for their practice only)

**Function**: `decideAsPracticeAdmin(actor: Actor, requestId: string, decision: 'approve' | 'reject', options?)`  
**Location**: `src/lib/services/approvalEngine.ts:580`

**Parameters**: Same as `decideAsAdmin()`

**What Happens**:
- Checks actor is Practice Admin for request's practice
- Updates `practiceAdminStatus` in request
- If both approvals complete: Executes side effects
- Appends to approval history
- Sends notifications

**Usage Example**:
```typescript
import { decideAsPracticeAdmin } from '@/lib/services/approvalEngine';

decideAsPracticeAdmin(actor, 'apr-123', 'approve', {
  notes: 'Doctor looks qualified'
});
```

---

#### Get Approval Requests
**What**: Retrieve approval requests (filtered by role)

**Function**: `getApprovalRequests()`  
**Location**: `src/lib/storage/approvalStorage.ts`

**Returns**: Array of `ApprovalRequest` objects

**Usage Example**:
```typescript
import { getApprovalRequests } from '@/lib/storage/approvalStorage';

// Get all requests
const allRequests = getApprovalRequests();

// Filter pending requests
const pending = allRequests.filter(r => 
  r.approvals.admin.status === 'pending' ||
  r.approvals.practiceAdmin?.status === 'pending'
);
```

---

#### Get Approval History
**What**: Get history log for an approval request

**Function**: `getApprovalHistory(requestId: string)`  
**Location**: `src/lib/storage/approvalStorage.ts`

**Returns**: Array of `ApprovalHistoryRecord` objects

**Usage Example**:
```typescript
import { getApprovalHistory } from '@/lib/storage/approvalStorage';

const history = getApprovalHistory('apr-123');
history.forEach(record => {
  console.log(`${record.action} by ${record.actor.actorName} at ${record.timestamp}`);
});
```

---

## Referral System

### What It Does
Enables doctor-to-doctor referrals with status tracking and history.

### Key Functions

#### Create Referral
**What**: Send a referral from one doctor to another

**Function**: `createReferral(actor: Actor, input: CreateReferralInput)`  
**Location**: `src/lib/services/referralEngine.ts:83`

**Parameters**:
- `actor`: Current user (must be doctor or admin)
- `input.toDoctorId`: Recipient doctor ID
- `input.patient`: Patient info (initials, age, sex)
- `input.condition`: Condition description
- `input.notes`: Optional notes

**Returns**: `Referral` object

**Usage Example**:
```typescript
import { createReferral } from '@/lib/services/referralEngine';
import { getActorFromSession } from '@/lib/services/permissionService';

const actor = getActorFromSession();
const referral = createReferral(actor, {
  toDoctorId: 'doctor-456',
  patient: {
    initials: 'JD',
    age: 45,
    sex: 'male'
  },
  condition: 'Patient requires cardiology consultation',
  notes: 'Recent EKG shows abnormalities'
});
```

**What Happens**:
1. Validates actor can send referrals
2. Validates recipient exists
3. Creates referral with status 'new'
4. Appends to referral history
5. Sends notification to recipient

---

#### Update Referral Status
**What**: Change referral status (new → attended → removed)

**Function**: `updateReferralStatus(actor: Actor, referralId: string, status: ReferralStatus)`  
**Location**: `src/lib/services/referralEngine.ts:165`

**Parameters**:
- `actor`: Current user
- `referralId`: ID of referral
- `status`: 'new' | 'attended' | 'removed'

**Usage Example**:
```typescript
import { updateReferralStatus } from '@/lib/services/referralEngine';

// Mark as attended
updateReferralStatus(actor, 'ref-123', 'attended');

// Remove referral
updateReferralStatus(actor, 'ref-123', 'removed');
```

**What Happens**:
1. Validates actor has permission
2. Updates referral status
3. Appends to referral history
4. Sends notification to other party

---

#### Get Referrals
**What**: Get referrals for a doctor (sent or received)

**Function**: `getReferrals()`  
**Location**: `src/lib/storage/referralStorage.ts`

**Returns**: Array of all referrals

**Usage Example**:
```typescript
import { getReferrals } from '@/lib/storage/referralStorage';

const allReferrals = getReferrals();

// Filter sent referrals
const sent = allReferrals.filter(r => r.fromDoctorId === doctorId);

// Filter received referrals
const received = allReferrals.filter(r => r.toDoctorId === doctorId);
```

---

#### Get Referral History
**What**: Get history log for a referral

**Function**: `getHistoryForReferral(referralId: string)`  
**Location**: `src/lib/storage/referralHistoryStorage.ts`

**Returns**: Array of `ReferralHistoryRecord` objects

**Usage Example**:
```typescript
import { getHistoryForReferral } from '@/lib/storage/referralHistoryStorage';

const history = getHistoryForReferral('ref-123');
// Shows: created, status_changed events with timestamps and actors
```

---

## Messaging System

### What It Does
Real-time doctor-to-doctor messaging using Firebase Firestore.

### Key Functions

#### Send Message
**What**: Send a message to another doctor

**Function**: `sendMessage(senderId: string, receiverId: string, content: string)`  
**Location**: `src/lib/messageStorage.ts:20`

**Parameters**:
- `senderId`: Sender doctor ID
- `receiverId`: Recipient doctor ID
- `content`: Message text

**Returns**: `Promise<void>`

**Usage Example**:
```typescript
import { sendMessage } from '@/lib/messageStorage';

await sendMessage('doctor-123', 'doctor-456', 'Hello, can we discuss a patient?');
```

**What Happens**:
1. Stores message in Firestore
2. Real-time update sent to recipient
3. Message persisted in IndexedDB

---

#### Subscribe to Conversation
**What**: Get real-time updates for a conversation

**Function**: `subscribeToConversation(doctorId: string, otherDoctorId: string, callback: (messages: DoctorMessage[]) => void)`  
**Location**: `src/lib/messageStorage.ts:76`

**Parameters**:
- `doctorId`: Current doctor ID
- `otherDoctorId`: Other doctor ID
- `callback`: Function called when messages update

**Returns**: Unsubscribe function

**Usage Example**:
```typescript
import { subscribeToConversation } from '@/lib/messageStorage';

const unsubscribe = subscribeToConversation(
  currentDoctorId,
  otherDoctorId,
  (messages) => {
    setMessages(messages); // Update UI
  }
);

// Cleanup on unmount
return () => unsubscribe();
```

**What Happens**:
1. Sets up Firestore real-time listener
2. Calls callback whenever messages change
3. Returns unsubscribe function for cleanup

---

#### Subscribe to Conversation Partners
**What**: Get list of doctors you've messaged with

**Function**: `subscribeToConversationPartners(doctorId: string, callback: (partners: ConversationSummary[]) => void)`  
**Location**: `src/lib/messageStorage.ts:143`

**Parameters**:
- `doctorId`: Current doctor ID
- `callback`: Function called when partners list updates

**Returns**: Unsubscribe function

**Usage Example**:
```typescript
import { subscribeToConversationPartners } from '@/lib/messageStorage';

subscribeToConversationPartners(doctorId, (partners) => {
  setConversations(partners); // Update sidebar
});
```

---

#### Mark Conversation as Read
**What**: Mark all messages in a conversation as read

**Function**: `markConversationAsRead(currentDoctorId: string, otherDoctorId: string)`  
**Location**: `src/lib/messageStorage.ts:147`

**Usage Example**:
```typescript
import { markConversationAsRead } from '@/lib/messageStorage';

// When user opens conversation
markConversationAsRead(currentDoctorId, otherDoctorId);
```

---

## Notification System

### What It Does
Sends notifications to doctors for important events (referrals, approvals, etc.).

### Key Functions

#### Add Notification
**What**: Create a new notification for a doctor

**Function**: `addNotification(doctorId: string, notification: Notification)`  
**Location**: `src/lib/storage/notificationStorage.ts`

**Parameters**:
- `doctorId`: Recipient doctor ID
- `notification`: Notification object with type, title, message, link

**Usage Example**:
```typescript
import { addNotification } from '@/lib/storage/notificationStorage';
import { makeId } from '@/lib/services/id';

addNotification('doctor-123', {
  id: makeId('ntf'),
  type: 'referral_received',
  title: 'New Referral Received',
  message: 'Dr. Smith sent you a referral',
  link: '/doctor/dashboard/referrals?referralId=ref-123',
  read: false,
  createdAt: new Date().toISOString()
});
```

**What Happens**: Stores notification in `aip_notifications_{doctorId}`

---

#### Get Notifications
**What**: Retrieve notifications for a doctor

**Function**: `getNotifications(doctorId: string)`  
**Location**: `src/lib/storage/notificationStorage.ts`

**Returns**: Array of `Notification` objects

**Usage Example**:
```typescript
import { getNotifications } from '@/lib/storage/notificationStorage';

const notifications = getNotifications(doctorId);
const unread = notifications.filter(n => !n.read);
```

---

#### Mark Notification as Read
**What**: Mark a notification as read

**Function**: `markNotificationRead(doctorId: string, notificationId: string)`  
**Location**: `src/lib/storage/notificationStorage.ts`

**Usage Example**:
```typescript
import { markNotificationRead } from '@/lib/storage/notificationStorage';

markNotificationRead(doctorId, 'ntf-123');
```

---

#### Get Unread Count
**What**: Get count of unread notifications

**Function**: `getUnreadCount(doctorId: string)`  
**Location**: `src/lib/storage/notificationStorage.ts`

**Returns**: Number of unread notifications

**Usage Example**:
```typescript
import { getUnreadCount } from '@/lib/storage/notificationStorage';

const unreadCount = getUnreadCount(doctorId);
// Use for badge display
```

---

## Location Management

### What It Does
Allows Practice Admins to manage multiple locations for their practice.

### Key Functions

#### Submit Location Add Request
**What**: Request to add a new location

**Function**: `submitApprovalRequest(actor, { type: 'practice_location_add_request', ... })`  
**Location**: `src/lib/services/approvalEngine.ts:304`

**Usage Example**:
```typescript
import { submitApprovalRequest } from '@/lib/services/approvalEngine';
import { geocodeZip } from '@/lib/services/geocodingService';

// Geocode ZIP first
const { lat, lng } = await geocodeZip('63101');

const request = submitApprovalRequest(actor, {
  type: 'practice_location_add_request',
  payload: {
    location: {
      name: 'Downtown Clinic',
      address: {
        line1: '123 Main St',
        city: 'St. Louis',
        state: 'MO',
        zip: '63101'
      },
      isPrimary: false
    }
  },
  target: { practiceId: practice.id }
});
```

**Validation**: Checks for duplicate addresses/coordinates

---

#### Geocode ZIP Code
**What**: Convert ZIP code to coordinates

**Function**: `geocodeZip(zip: string)`  
**Location**: `src/lib/services/geocodingService.ts:9`

**Returns**: `Promise<{ lat: number; lng: number; label: string }>`

**Usage Example**:
```typescript
import { geocodeZip } from '@/lib/services/geocodingService';

const coords = await geocodeZip('63101');
console.log(coords.lat, coords.lng); // Coordinates
```

---

## Contact Visibility

### What It Does
Controls who can see doctor personal contact information based on role.

### Key Functions

#### Get Contact Card
**What**: Get contact information based on user role

**Function**: `getContactCard(actor: Actor, doctor: Doctor, practice: Practice)`  
**Location**: `src/lib/services/visibilityService.ts:44`

**Returns**: Contact card object with appropriate visibility

**Usage Example**:
```typescript
import { getContactCard } from '@/lib/services/visibilityService';
import { getActorFromSession } from '@/lib/services/permissionService';

const actor = getActorFromSession();
const contactCard = getContactCard(actor, doctor, practice);

// contactCard.phone and contactCard.email are set based on role
```

**Visibility Rules**:
- Public: Practice contact only
- Doctor: Personal + practice contact
- Practice Admin: All practice doctor contacts
- Admin: All contacts

---

#### Check Contact Visibility
**What**: Check if actor can view doctor's personal contact

**Function**: `canViewDoctorPrivateContact(actor: Actor, targetDoctor: Doctor)`  
**Location**: `src/lib/services/permissionService.ts:157`

**Returns**: `boolean`

**Usage Example**:
```typescript
import { canViewDoctorPrivateContact } from '@/lib/services/permissionService';

if (canViewDoctorPrivateContact(actor, doctor)) {
  // Show personal email/phone
} else {
  // Show practice contact only
}
```

---

## Authentication & Permissions

### What It Does
Manages user authentication and permission checks.

### Key Functions

#### Get Actor from Session
**What**: Get current user's actor object

**Function**: `getActorFromSession()`  
**Location**: `src/lib/services/permissionService.ts:32`

**Returns**: `Actor` object (`'public' | 'admin' | 'doctor'`)

**Usage Example**:
```typescript
import { getActorFromSession } from '@/lib/services/permissionService';

const actor = getActorFromSession();

if (actor.kind === 'admin') {
  // Admin actions
} else if (actor.kind === 'doctor') {
  console.log('Doctor ID:', actor.doctorId);
  console.log('Practice ID:', actor.practiceId);
  console.log('Role:', actor.roleInPractice);
} else {
  // Public user
}
```

---

#### Assert Authentication
**What**: Require user to be authenticated (throws if public)

**Function**: `assertAuthenticated(actor: Actor)`  
**Location**: `src/lib/services/permissionService.ts:99`

**Throws**: `AuthRequiredError` if public

**Usage Example**:
```typescript
import { assertAuthenticated } from '@/lib/services/permissionService';

try {
  assertAuthenticated(actor);
  // Proceed with authenticated action
} catch (error) {
  // Redirect to login
}
```

---

#### Assert Admin
**What**: Require user to be admin (throws if not)

**Function**: `assertAdmin(actor: Actor)`  
**Location**: `src/lib/services/permissionService.ts:109`

**Throws**: `PermissionDeniedError` if not admin

**Usage Example**:
```typescript
import { assertAdmin } from '@/lib/services/permissionService';

assertAdmin(actor); // Throws if not admin
decideAsAdmin(actor, requestId, 'approve');
```

---

#### Assert Practice Admin
**What**: Require user to be Practice Admin (optionally for specific practice)

**Function**: `assertPracticeAdmin(actor: Actor, practiceId?: string)`  
**Location**: `src/lib/services/permissionService.ts:132`

**Throws**: `PermissionDeniedError` if not Practice Admin

**Usage Example**:
```typescript
import { assertPracticeAdmin } from '@/lib/services/permissionService';

// Check if Practice Admin (any practice)
assertPracticeAdmin(actor);

// Check if Practice Admin for specific practice
assertPracticeAdmin(actor, 'practice-123');
```

---

#### Check Send Referral Permission
**What**: Check if actor can send referrals

**Function**: `canSendReferral(actor: Actor)`  
**Location**: `src/lib/services/permissionService.ts:179`

**Returns**: `boolean`

**Usage Example**:
```typescript
import { canSendReferral } from '@/lib/services/permissionService';

if (canSendReferral(actor)) {
  // Show "Send Referral" button
}
```

---

#### Check Approval Permission
**What**: Check if Practice Admin can approve a specific request

**Function**: `canApproveAsPracticeAdmin(actor: Actor, request: ApprovalRequest)`  
**Location**: `src/lib/services/permissionService.ts:189`

**Returns**: `boolean`

**Usage Example**:
```typescript
import { canApproveAsPracticeAdmin } from '@/lib/services/permissionService';

if (canApproveAsPracticeAdmin(actor, request)) {
  // Show approve/reject buttons
}
```

---

## Common Patterns

### Pattern 1: Submit Approval Request
```typescript
import { submitApprovalRequest } from '@/lib/services/approvalEngine';
import { getActorFromSession } from '@/lib/services/permissionService';

const actor = getActorFromSession();
const request = submitApprovalRequest(actor, {
  type: 'practice_edit_request',
  payload: { /* request data */ },
  target: { practiceId: '...' }
});
```

### Pattern 2: Check Permission Before Action
```typescript
import { assertPracticeAdmin } from '@/lib/services/permissionService';

try {
  assertPracticeAdmin(actor, practiceId);
  // Proceed with action
} catch (error) {
  // Show error or redirect
}
```

### Pattern 3: Get and Filter Data
```typescript
import { getApprovalRequests } from '@/lib/storage/approvalStorage';

const allRequests = getApprovalRequests();
const pending = allRequests.filter(r => 
  r.approvals.admin.status === 'pending'
);
```

### Pattern 4: Subscribe to Real-time Updates
```typescript
import { subscribeToConversation } from '@/lib/messageStorage';

useEffect(() => {
  const unsubscribe = subscribeToConversation(
    doctorId,
    otherDoctorId,
    (messages) => setMessages(messages)
  );
  return unsubscribe;
}, [doctorId, otherDoctorId]);
```

---

## Error Handling

### Error Types
**Location**: `src/lib/services/errors.ts`

- `AuthRequiredError` - Authentication required
- `PermissionDeniedError` - Permission denied
- `NotFoundError` - Resource not found
- `ValidationError` - Validation failed
- `ConflictError` - Conflict (duplicate, etc.)

### Usage Pattern
```typescript
import {
  AuthRequiredError,
  PermissionDeniedError,
  NotFoundError
} from '@/lib/services/errors';

try {
  assertAuthenticated(actor);
  // Proceed
} catch (error) {
  if (error instanceof AuthRequiredError) {
    // Redirect to login
  } else if (error instanceof PermissionDeniedError) {
    // Show permission denied message
  }
}
```

---

**Last Updated**: January 29, 2026  
**Documentation Version**: 1.0
