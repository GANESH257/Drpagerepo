# V2 Testing and Verification Guide

**Date**: January 29, 2026  
**Version**: 2.0  
**Status**: Comprehensive Testing Guide for All V2 Features

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Testing Setup](#pre-testing-setup)
3. [Step 2: Data Model & Storage Testing](#step-2-data-model--storage-testing)
4. [Step 3: Seed Data & Migration Testing](#step-3-seed-data--migration-testing)
5. [Step 4: Business Logic Services Testing](#step-4-business-logic-services-testing)
6. [Step 5: UI Integration Testing](#step-5-ui-integration-testing)
7. [Step 6: Practice Directory Pages Testing](#step-6-practice-directory-pages-testing)
8. [Step 7: Search & Directory Updates Testing](#step-7-search--directory-updates-testing)
9. [Step 8: Chat Scaffolding Testing](#step-8-chat-scaffolding-testing)
10. [Step 9: Announcements System Testing](#step-9-announcements-system-testing)
11. [Step 10.1-10.3: Practice Management Testing](#step-101-103-practice-management-testing)
12. [Step 10.4: Location Management Testing](#step-104-location-management-testing)
13. [Step 10.5: Admin Approval UI Testing](#step-105-admin-approval-ui-testing)
14. [Step 10.6: Practice Edit Refinement Testing](#step-106-practice-edit-refinement-testing)
15. [Step 10.7: Roster Governance Testing](#step-107-roster-governance-testing)
16. [Cross-Feature Integration Testing](#cross-feature-integration-testing)
17. [Performance & Edge Cases](#performance--edge-cases)

---

## Overview

This guide provides comprehensive testing scenarios for all V2 features implemented across Steps 2-10.7. Each section includes:

- **Test Scenarios**: Step-by-step test cases
- **Expected Results**: What should happen
- **Verification Points**: What to check
- **Edge Cases**: Boundary conditions to test
- **Regression Checks**: Ensure existing features still work

**Testing Approach**:
- Manual testing with browser
- Console verification for data integrity
- localStorage inspection for data persistence
- Network tab for API calls (if applicable)
- TypeScript compilation verification

---

## Pre-Testing Setup

### 1. Environment Preparation

**Required**:
- ✅ Node.js installed
- ✅ Dependencies installed (`npm install`)
- ✅ Development server running (`npm run dev`)
- ✅ Browser with DevTools open (Console, Application/Storage tab)

**Test Accounts**:
- Admin account (email: `admin@aip.com`, password: any)
- Doctor account (create via join-us flow)
- Practice Admin account (doctor with `roleInPractice: 'practice_admin'`)

### 2. Data Preparation

**Before Testing**:
1. Clear browser localStorage: `localStorage.clear()`
2. Verify seed data exists: Check `src/data/practices.ts` and `src/data/doctors.ts`
3. Create test practice (if needed): Use admin portal or seed data

### 3. Browser Setup

**Recommended**:
- Chrome/Edge with DevTools
- Enable "Preserve log" in Console
- Open Application tab → Local Storage → `http://localhost:3000`
- Open Network tab (if testing API calls)

---

## Step 2: Data Model & Storage Testing

### Test 2.1: Type Definitions

**Objective**: Verify all V2 types are correctly defined

**Steps**:
1. Open `src/types/practice.ts`
2. Verify `Practice` interface exists with required fields
3. Open `src/types/approvals.ts`
4. Verify `ApprovalRequest` interface exists
5. Open `src/types/referrals.ts`
6. Verify `Referral` interface exists
7. Open `src/types/notifications.ts`
8. Verify `Notification` interface exists

**Expected Results**:
- ✅ All type files exist
- ✅ TypeScript compilation succeeds (`npx tsc --noEmit`)
- ✅ No type errors in IDE

**Verification**:
```bash
npx tsc --noEmit
# Should output: 0 errors
```

### Test 2.2: Storage Keys

**Objective**: Verify storage keys are consistent

**Steps**:
1. Open `src/lib/storage/storageKeys.ts`
2. Verify all storage keys defined
3. Check that keys follow naming convention

**Expected Results**:
- ✅ Storage keys defined for: practices, doctors, approvals, referrals, notifications
- ✅ Keys use consistent prefix pattern

**Verification Points**:
- `STORAGE_KEYS.practices` exists
- `STORAGE_KEYS.approvals` exists
- `STORAGE_KEYS.referrals` exists
- `STORAGE_KEYS.notifications` exists

### Test 2.3: Storage Helpers

**Objective**: Verify SSR-safe storage helpers work

**Steps**:
1. Open browser console
2. Run: `localStorage.setItem('test', 'value')`
3. Verify value persists after page refresh
4. Check that storage helpers handle `window` undefined (SSR)

**Expected Results**:
- ✅ Storage helpers check for `typeof window !== 'undefined'`
- ✅ No SSR errors in console

---

## Step 3: Seed Data & Migration Testing

### Test 3.1: Seed Data Generation

**Objective**: Verify practices and doctors are seeded correctly

**Steps**:
1. Clear localStorage: `localStorage.clear()`
2. Refresh page
3. Navigate to `/doctors` page
4. Verify doctors are displayed
5. Navigate to `/practices` page (if exists)
6. Verify practices are displayed

**Expected Results**:
- ✅ Doctors appear on `/doctors` page
- ✅ Practices appear on `/practices` page (if implemented)
- ✅ Data persists after refresh

**Verification**:
- Open DevTools → Application → Local Storage
- Check for `aip_practices` and `aip_doctors` keys
- Verify data structure matches type definitions

### Test 3.2: Doctor-to-Practice Assignment

**Objective**: Verify doctors are assigned to practices

**Steps**:
1. Open browser console
2. Run: `JSON.parse(localStorage.getItem('aip_doctors'))`
3. Check that doctors have `practiceId` field
4. Verify `practiceId` matches existing practice IDs

**Expected Results**:
- ✅ All doctors have `practiceId` field
- ✅ `practiceId` values match practice IDs in storage
- ✅ No orphaned doctors (doctors without valid practiceId)

**Verification Points**:
- Check `doctor.practiceId` exists
- Verify `doctor.roleInPractice` is set (some doctors should be `practice_admin`)

---

## Step 4: Business Logic Services Testing

### Test 4.1: Approval Engine - Submit Request

**Objective**: Verify approval requests can be submitted

**Steps**:
1. Log in as Practice Admin
2. Navigate to `/doctor/dashboard/practice/locations`
3. Click "Add Location"
4. Fill in form fields
5. Submit request
6. Check console for errors
7. Verify request appears in admin approval queue

**Expected Results**:
- ✅ No console errors
- ✅ Toast notification shows success
- ✅ Request appears in `/admin/requests-v2`
- ✅ Request has correct `type`, `status`, `payload`

**Verification**:
- Open `/admin/requests-v2`
- Find submitted request
- Verify request type is `practice_location_add_request`
- Verify status is `submitted`
- Verify payload contains location data

### Test 4.2: Approval Engine - Admin Approval

**Objective**: Verify admin can approve requests

**Steps**:
1. Log in as Admin
2. Navigate to `/admin/requests-v2`
3. Open a pending request
4. Click "Approve"
5. Add approval notes (optional)
6. Submit approval
7. Verify request status changes

**Expected Results**:
- ✅ Request status changes to `approved`
- ✅ Approval history record created
- ✅ Side effects applied (if applicable)
- ✅ Toast notification shows success

**Verification**:
- Check request status in approval queue
- Open approval history (`/admin/history/approvals`)
- Verify history record exists with action `approved`
- If location add request: Verify location appears in practice

### Test 4.3: Approval Engine - Practice Admin Approval

**Objective**: Verify practice admin can approve requests

**Steps**:
1. Log in as Practice Admin
2. Navigate to `/doctor/dashboard/practice/approvals`
3. Open a pending request (should be scoped to practice)
4. Click "Approve"
5. Submit approval
6. Verify request status changes

**Expected Results**:
- ✅ Practice admin sees only their practice's requests
- ✅ Approval works correctly
- ✅ Status updates properly

**Verification**:
- Verify practice admin cannot see other practices' requests
- Check that approval updates request status
- Verify history record created

### Test 4.4: Referral Engine - Send Referral

**Objective**: Verify doctors can send referrals

**Steps**:
1. Log in as Doctor
2. Navigate to `/doctors/[slug]` (another doctor's profile)
3. Click "Send Referral" button
4. Fill in referral form (patient initials, age, sex, reason)
5. Submit referral
6. Verify referral appears in sent referrals

**Expected Results**:
- ✅ Referral created successfully
- ✅ Referral appears in `/doctor/dashboard/referrals` (Sent tab)
- ✅ Notification sent to receiving doctor
- ✅ Toast notification shows success

**Verification**:
- Check `/doctor/dashboard/referrals` → Sent tab
- Verify referral details match submitted data
- Check receiving doctor's notifications
- Verify referral history record created

### Test 4.5: Permission Service - Role-Based Access

**Objective**: Verify role-based access control works

**Steps**:
1. Log in as regular Doctor (not practice admin)
2. Try to access `/doctor/dashboard/practice/locations`
3. Verify access denied or redirect
4. Log in as Practice Admin
5. Access same route
6. Verify access granted

**Expected Results**:
- ✅ Regular doctors cannot access practice admin routes
- ✅ Practice admins can access practice admin routes
- ✅ Admins can access admin routes
- ✅ Proper error messages shown

**Verification Points**:
- Check console for permission errors
- Verify redirects work correctly
- Verify error messages are user-friendly

---

## Step 5: UI Integration Testing

### Test 5.1: Admin Approval Queue

**Objective**: Verify admin approval queue displays correctly

**Steps**:
1. Log in as Admin
2. Navigate to `/admin/requests-v2`
3. Verify request list displays
4. Test filters (status, type)
5. Test search functionality
6. Click on a request to open detail page

**Expected Results**:
- ✅ Request list displays all pending requests
- ✅ Filters work correctly
- ✅ Search works correctly
- ✅ Detail page opens correctly
- ✅ Request information displays correctly

**Verification Points**:
- Request type badges display correctly
- Status badges display correctly
- Date formatting is correct
- Pagination works (if implemented)

### Test 5.2: Practice Admin Approval Queue

**Objective**: Verify practice admin approval queue is scoped correctly

**Steps**:
1. Log in as Practice Admin
2. Navigate to `/doctor/dashboard/practice/approvals`
3. Verify only practice's requests appear
4. Test filters
5. Open a request detail page

**Expected Results**:
- ✅ Only practice's requests visible
- ✅ Filters work correctly
- ✅ Detail page displays correctly

**Verification**:
- Verify requests have correct `practiceId`
- Check that other practices' requests don't appear

### Test 5.3: Doctor Notifications

**Objective**: Verify notifications display correctly

**Steps**:
1. Log in as Doctor
2. Navigate to `/doctor/dashboard/notifications`
3. Verify notifications list displays
4. Click "Mark as Read" on unread notification
5. Verify notification updates
6. Click notification link (if has href)
7. Verify navigation works

**Expected Results**:
- ✅ Notifications list displays
- ✅ Unread/read filtering works
- ✅ Mark as read updates notification
- ✅ Links navigate correctly

**Verification Points**:
- Notification badges display correctly
- Timestamps format correctly
- Read/unread states update correctly

### Test 5.4: Doctor Referrals

**Objective**: Verify referrals page displays correctly

**Steps**:
1. Log in as Doctor
2. Navigate to `/doctor/dashboard/referrals`
3. Verify Sent and Received tabs
4. Switch between tabs
5. Open a referral detail
6. Change referral status (if applicable)

**Expected Results**:
- ✅ Tabs switch correctly
- ✅ Referrals display in correct tab
- ✅ Detail view works
- ✅ Status changes work

**Verification Points**:
- Sent referrals show in Sent tab
- Received referrals show in Received tab
- Status badges display correctly

---

## Step 6: Practice Directory Pages Testing

### Test 6.1: Practice List Page

**Objective**: Verify practice directory page displays

**Steps**:
1. Navigate to `/practices` (if exists)
2. Verify practice cards display
3. Test search/filter functionality
4. Click on a practice card
5. Verify navigation to practice detail page

**Expected Results**:
- ✅ Practices display correctly
- ✅ Search/filter works
- ✅ Navigation works

**Verification Points**:
- Practice cards show correct information
- Images load correctly
- Links work correctly

### Test 6.2: Practice Detail Page

**Objective**: Verify practice profile page displays correctly

**Steps**:
1. Navigate to `/practices/[slug]`
2. Verify practice information displays
3. Check locations section
4. Check doctors section
5. Check insurance/services section
6. Verify contact information displays correctly

**Expected Results**:
- ✅ All practice information displays
- ✅ Locations list correctly
- ✅ Doctors list correctly
- ✅ Contact info displays based on visibility rules

**Verification Points**:
- Public users see practice contact only
- Logged-in doctors see personal contact if available
- Fallback to practice contact works

---

## Step 7: Search & Directory Updates Testing

### Test 7.1: Practice-Centric Search

**Objective**: Verify search prioritizes practices

**Steps**:
1. Navigate to homepage or search page
2. Enter search query
3. Verify results prioritize practices
4. Check that doctors are grouped by practice

**Expected Results**:
- ✅ Practices appear first in results
- ✅ Doctors grouped by practice
- ✅ Search works correctly

**Verification Points**:
- Search results structure matches practice-centric model
- Filtering works correctly

---

## Step 8: Chat Scaffolding Testing

**Status**: ⚠️ **PENDING** (Not yet implemented)

**Note**: Chat scaffolding is the only remaining V2 feature. When implemented, test:
- Chat UI components
- Message sending/receiving
- Real-time updates
- Message history

---

## Step 9: Announcements System Testing

### Test 9.1: Admin Create Announcement

**Objective**: Verify admin can create announcements

**Steps**:
1. Log in as Admin
2. Navigate to `/admin/announcements/create`
3. Fill in announcement form
4. Select audience (all doctors)
5. Submit announcement
6. Verify announcement appears in doctor feeds

**Expected Results**:
- ✅ Announcement created successfully
- ✅ Notifications sent to all doctors
- ✅ Announcement appears in `/doctor/dashboard/announcements`

**Verification Points**:
- Announcement displays correctly
- Notifications created for all doctors
- Timestamps correct

### Test 9.2: Practice Admin Create Announcement

**Objective**: Verify practice admin can create practice announcements

**Steps**:
1. Log in as Practice Admin
2. Navigate to `/doctor/dashboard/practice/announcements/create`
3. Fill in announcement form
4. Submit announcement
5. Verify announcement appears only for practice doctors

**Expected Results**:
- ✅ Announcement created successfully
- ✅ Notifications sent only to practice doctors
- ✅ Announcement appears in practice doctors' feeds

**Verification Points**:
- Only practice doctors receive notifications
- Announcement scoped correctly

### Test 9.3: Doctor Announcements Feed

**Objective**: Verify doctors see announcements

**Steps**:
1. Log in as Doctor
2. Navigate to `/doctor/dashboard/announcements`
3. Verify announcements display
4. Check filtering (if implemented)
5. Click on announcement to view details

**Expected Results**:
- ✅ Announcements display correctly
- ✅ Filtering works
- ✅ Details view works

**Verification Points**:
- Announcements sorted by date (newest first)
- Badges display correctly (admin vs practice admin)

---

## Step 10.1-10.3: Practice Management Testing

### Test 10.1: Practice Details View

**Objective**: Verify practice details display correctly

**Steps**:
1. Log in as Practice Admin
2. Navigate to `/doctor/dashboard/practice`
3. Verify practice information displays
4. Check all sections (details, locations, doctors, insurance/services)

**Expected Results**:
- ✅ All practice information displays
- ✅ Read-only view works correctly
- ✅ Edit button present (for edit requests)

**Verification Points**:
- Practice name, description display
- Locations list correctly
- Doctors list correctly
- Insurance/services display correctly

### Test 10.2: Practice Edit Request Submission

**Objective**: Verify practice edit requests can be submitted

**Steps**:
1. Log in as Practice Admin
2. Navigate to `/doctor/dashboard/practice`
3. Click "Edit Practice" or "Request Edit"
4. Fill in edit form
5. Submit request
6. Verify request appears in approval queue

**Expected Results**:
- ✅ Edit request submitted successfully
- ✅ Request appears in admin approval queue
- ✅ Payload contains before/after snapshots

**Verification Points**:
- Request type is `practice_edit_request`
- Payload structure matches `PracticeEditPayload`
- Before/after snapshots included

### Test 10.3: Services & Insurance Management

**Objective**: Verify services and insurance can be managed

**Steps**:
1. Log in as Practice Admin
2. Navigate to `/doctor/dashboard/practice/services-insurance`
3. Verify current services/insurance display
4. Test add/edit/remove functionality (if implemented)
5. Verify changes require approval

**Expected Results**:
- ✅ Services/insurance display correctly
- ✅ Changes go through approval workflow
- ✅ UI updates after approval

**Verification Points**:
- Lists display correctly
- Approval workflow works
- Changes persist after approval

---

## Step 10.4: Location Management Testing

### Test 10.4.1: Locations Read-Only View

**Objective**: Verify locations display correctly

**Steps**:
1. Log in as Practice Admin
2. Navigate to `/doctor/dashboard/practice/locations`
3. Verify locations list displays
4. Check location cards show all information
5. Verify "Add Location" button present

**Expected Results**:
- ✅ Locations list displays
- ✅ Location cards show: name, address, phone, hours, coordinates
- ✅ Add button visible

**Verification Points**:
- All locations from practice.locations display
- Location information complete
- Cards styled correctly

### Test 10.4.2: Add Location Request

**Objective**: Verify location add requests work correctly

**Steps**:
1. Log in as Practice Admin
2. Navigate to `/doctor/dashboard/practice/locations`
3. Click "Add Location"
4. Fill in form:
   - Address, City, State, ZIP
   - Test ZIP geocoding (auto-fill coordinates)
   - Test manual coordinate entry
   - Add optional fields (phone, hours)
5. Submit request
6. Verify validation works (try invalid data)
7. Verify request appears in approval queue

**Expected Results**:
- ✅ Form validation works
- ✅ ZIP geocoding works
- ✅ Manual coordinate entry works
- ✅ Request submitted successfully
- ✅ Request appears in admin approval queue

**Verification Points**:
- Required fields validated
- ZIP format validated (5 digits)
- State format validated (2 letters)
- Coordinates validated (lat [-90, 90], lng [-180, 180])
- Duplicate address check works
- Duplicate coordinate warning shows
- Request payload correct

**Edge Cases**:
- Invalid ZIP code
- Invalid coordinates
- Duplicate address
- Duplicate coordinates (should warn, not block)
- Missing required fields

### Test 10.4.3: Edit Location Request

**Objective**: Verify location edit requests work correctly

**Steps**:
1. Log in as Practice Admin
2. Navigate to `/doctor/dashboard/practice/locations`
3. Click "Edit" on a location
4. Verify form pre-filled with location data
5. Modify fields
6. Submit request
7. Verify validation (ID immutability, duplicates)
8. Verify request appears in approval queue

**Expected Results**:
- ✅ Form pre-filled correctly
- ✅ ID field read-only (cannot change)
- ✅ Validation works
- ✅ Request submitted successfully

**Verification Points**:
- Form pre-filled with existing location data
- Location ID cannot be changed
- Duplicate address check works
- Duplicate coordinate warning shows
- Request payload contains `locationId` and `updatedLocation`

**Edge Cases**:
- Try to change location ID (should be blocked)
- Duplicate address (should block)
- Duplicate coordinates (should warn)

### Test 10.4.4: Remove Location Request

**Objective**: Verify location remove requests work correctly

**Steps**:
1. Log in as Practice Admin
2. Navigate to `/doctor/dashboard/practice/locations`
3. Click "Remove" on a location
4. Verify confirmation dialog appears
5. Test "Last Location" guard (try removing last location)
6. Submit removal request
7. Verify request appears in approval queue

**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ Last location guard prevents removal
- ✅ Request submitted successfully
- ✅ Request appears in approval queue

**Verification Points**:
- Remove button disabled if last location
- Confirmation dialog shows location details
- Request payload contains `locationId`
- Last location guard works in UI and engine

**Edge Cases**:
- Try to remove last location (should be blocked)
- Remove button disabled when only one location
- Confirmation dialog shows correct location

---

## Step 10.5: Admin Approval UI Testing

### Test 10.5.1: Location Add Request Rendering

**Objective**: Verify location add requests display formatted view

**Steps**:
1. Log in as Admin
2. Navigate to `/admin/requests-v2`
3. Find a `practice_location_add_request`
4. Open request detail page
5. Verify formatted view displays (not raw JSON)
6. Check for duplicate warnings
7. Verify location summary displays correctly

**Expected Results**:
- ✅ Formatted view displays (LocationSummary component)
- ✅ Duplicate warnings show if applicable
- ✅ Raw JSON available in collapsible section
- ✅ Location information formatted correctly

**Verification Points**:
- LocationSummary shows: name, address, phone, hours, coordinates
- Badges display correctly ("Has coords", "Has phone", etc.)
- Duplicate address warning shows if duplicate exists
- Duplicate coordinate warning shows if duplicate exists
- Practice information displays

### Test 10.5.2: Location Edit Request Rendering

**Objective**: Verify location edit requests show before/after diff

**Steps**:
1. Log in as Admin
2. Navigate to `/admin/requests-v2`
3. Find a `practice_location_edit_request`
4. Open request detail page
5. Verify before/after comparison displays
6. Check ChangedFieldsList shows only changed fields
7. Verify location summaries display correctly

**Expected Results**:
- ✅ Before/After comparison displays
- ✅ ChangedFieldsList shows only changed fields
- ✅ Location summaries display for both before and after
- ✅ Visual diff highlights changes

**Verification Points**:
- Before location summary displays
- After location summary displays
- Changed fields list shows only modified fields
- Field labels are human-readable
- Values display correctly

### Test 10.5.3: Location Remove Request Rendering

**Objective**: Verify location remove requests display formatted view

**Steps**:
1. Log in as Admin
2. Navigate to `/admin/requests-v2`
3. Find a `practice_location_remove_request`
4. Open request detail page
5. Verify formatted view displays
6. Check for last location warning
7. Verify location summary displays

**Expected Results**:
- ✅ LocationSummary displays location to be removed
- ✅ Last location warning shows if applicable
- ✅ Important message about last location rule
- ✅ Location information formatted correctly

**Verification Points**:
- Location summary shows location details
- Last location warning displays if it's the last location
- Important message about retaining at least one location
- Location ID displays

### Test 10.5.4: Approval History Rendering

**Objective**: Verify approval history uses formatted rendering

**Steps**:
1. Log in as Admin
2. Navigate to `/admin/history/approvals`
3. Open a historical location request
4. Verify formatted view displays in drawer
5. Check that RequestedChangesRenderer works for history

**Expected Results**:
- ✅ Formatted view displays in history drawer
- ✅ RequestedChangesRenderer works with history records
- ✅ Snapshot data displays correctly

**Verification Points**:
- History drawer shows formatted view
- Practice ID resolved correctly from snapshot
- Location data displays correctly
- Timeline displays correctly

---

## Step 10.6: Practice Edit Refinement Testing

### Test 10.6.1: Practice Edit Request Submission

**Objective**: Verify practice edit requests use structured payload

**Steps**:
1. Log in as Practice Admin
2. Navigate to `/doctor/dashboard/practice`
3. Click "Edit Practice" or "Request Edit"
4. Modify practice fields (name, description, phone, website, insurances, services)
5. Submit request
6. Verify payload structure in approval queue

**Expected Results**:
- ✅ Request submitted successfully
- ✅ Payload contains `before` and `after` snapshots
- ✅ Payload structure matches `PracticeEditPayload`

**Verification Points**:
- Payload has `practiceId`
- Payload has `before` snapshot (full practice data)
- Payload has `after` snapshot (full practice data)
- Snapshots are deep clones (not references)

### Test 10.6.2: Practice Edit Request Rendering

**Objective**: Verify practice edit requests show formatted diff

**Steps**:
1. Log in as Admin
2. Navigate to `/admin/requests-v2`
3. Find a `practice_edit_request`
4. Open request detail page
5. Verify before/after comparison displays
6. Check PracticeSummary components display
7. Verify ChangedFieldsList shows only changed fields

**Expected Results**:
- ✅ Before/After comparison displays
- ✅ PracticeSummary shows practice information
- ✅ ChangedFieldsList shows only modified fields
- ✅ Visual diff highlights changes

**Verification Points**:
- Before practice summary displays
- After practice summary displays
- Changed fields list shows: name, description, phone, website, insurances, services
- Field labels are human-readable
- Array comparisons work (insurances, services)

### Test 10.6.3: Practice Edit Approval

**Objective**: Verify practice edit approval applies changes correctly

**Steps**:
1. Log in as Admin
2. Navigate to `/admin/requests-v2`
3. Find a `practice_edit_request`
4. Approve request
5. Verify practice data updates correctly
6. Check that `after` snapshot applied (not partial merge)

**Expected Results**:
- ✅ Request approved successfully
- ✅ Practice data updates correctly
- ✅ All fields from `after` snapshot applied
- ✅ History record created with snapshots

**Verification Points**:
- Practice name updates
- Description updates
- Phone updates
- Website updates
- Insurances array updates correctly
- Services array updates correctly
- History record contains before/after snapshots

**Edge Cases**:
- Verify deep cloning prevents reference mutations
- Verify `after` snapshot is authoritative (not merged)
- Verify all fields update, not just changed ones

---

## Step 10.7: Roster Governance Testing

### Test 10.7.1: Doctor Join Practice Request

**Objective**: Verify doctor join practice requests work correctly

**Steps**:
1. Log in as Doctor (not in a practice)
2. Navigate to `/doctors/[slug]` (practice admin's profile)
3. Click "Join Practice" or similar button
4. Submit request
5. Verify request appears in approval queue
6. Verify payload structure

**Expected Results**:
- ✅ Request submitted successfully
- ✅ Payload contains `doctorId` and `practiceId`
- ✅ Request appears in admin approval queue
- ✅ Practice admin can also see request

**Verification Points**:
- Request type is `doctor_join_practice`
- Payload has `doctorId` and `practiceId`
- Request visible to admin
- Request visible to practice admin (scoped)

### Test 10.7.2: Practice Add Doctor Request

**Objective**: Verify practice admin can invite doctors

**Steps**:
1. Log in as Practice Admin
2. Navigate to `/doctor/dashboard/practice/doctors`
3. Click "Add Doctor" or "Invite Doctor"
4. Search/select doctor
5. Submit request
6. Verify request appears in approval queue

**Expected Results**:
- ✅ Request submitted successfully
- ✅ Payload contains `doctorId` and `practiceId`
- ✅ Request appears in approval queue
- ✅ Doctor receives notification (if implemented)

**Verification Points**:
- Request type is `practice_add_doctor_request`
- Payload structure correct
- Request visible to admin
- Validation prevents duplicate adds

### Test 10.7.3: Practice Remove Doctor Request

**Objective**: Verify practice admin can remove doctors

**Steps**:
1. Log in as Practice Admin
2. Navigate to `/doctor/dashboard/practice/doctors`
3. Click "Remove" on a doctor
4. Verify confirmation dialog
5. Test "Last Practice Admin" guard
6. Submit request
7. Verify request appears in approval queue

**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ Last practice admin guard prevents removal
- ✅ Request submitted successfully
- ✅ Request appears in approval queue

**Verification Points**:
- Remove button disabled if last practice admin
- Confirmation dialog shows doctor details
- Request type is `practice_remove_doctor_request`
- Payload contains `doctorId` and `practiceId`
- Last practice admin guard works in UI and engine

**Edge Cases**:
- Try to remove last practice admin (should be blocked)
- Remove button disabled when only one practice admin
- Verify guard works in approval engine

### Test 10.7.4: Roster Approval - Add Doctor

**Objective**: Verify roster add approval works correctly

**Steps**:
1. Log in as Admin
2. Navigate to `/admin/requests-v2`
3. Find a `practice_add_doctor_request` or `doctor_join_practice`
4. Approve request
5. Verify two-sided mutation:
   - Doctor added to practice.doctorIds
   - Doctor.practiceId updated
   - Previous practice updated (if doctor was in another practice)
6. Verify idempotency (approve again, should not duplicate)

**Expected Results**:
- ✅ Request approved successfully
- ✅ Doctor added to practice.doctorIds
- ✅ Doctor.practiceId updated
- ✅ Previous practice updated (if applicable)
- ✅ Idempotency prevents duplicates

**Verification Points**:
- Check `practice.doctorIds` includes doctor ID
- Check `doctor.practiceId` matches practice ID
- If doctor was in another practice: verify removed from previous practice
- Verify idempotency: re-approving doesn't duplicate

**Edge Cases**:
- Doctor already in another practice (should be removed)
- Doctor already in this practice (should be idempotent)
- Doctor not found (should error)
- Practice not found (should error)

### Test 10.7.5: Roster Approval - Remove Doctor

**Objective**: Verify roster remove approval works correctly

**Steps**:
1. Log in as Admin
2. Navigate to `/admin/requests-v2`
3. Find a `practice_remove_doctor_request`
4. Verify last practice admin guard (if removing practice admin)
5. Approve request
6. Verify two-sided mutation:
   - Doctor removed from practice.doctorIds
   - Doctor.practiceId cleared
7. Verify idempotency

**Expected Results**:
- ✅ Request approved successfully
- ✅ Doctor removed from practice.doctorIds
- ✅ Doctor.practiceId cleared (set to null/undefined)
- ✅ Last practice admin guard prevents removal
- ✅ Idempotency prevents errors

**Verification Points**:
- Check `practice.doctorIds` doesn't include doctor ID
- Check `doctor.practiceId` is cleared
- Last practice admin guard works
- Verify idempotency: re-approving doesn't error

**Edge Cases**:
- Try to remove last practice admin (should be blocked)
- Doctor not in practice (should be idempotent)
- Doctor not found (should error)
- Practice not found (should error)

### Test 10.7.6: Roster Rejection

**Objective**: Verify roster request rejection doesn't mutate data

**Steps**:
1. Log in as Admin
2. Navigate to `/admin/requests-v2`
3. Find a roster request (add or remove)
4. Reject request
5. Verify no mutations occurred:
   - Practice.doctorIds unchanged
   - Doctor.practiceId unchanged
6. Verify history record created

**Expected Results**:
- ✅ Request rejected successfully
- ✅ No mutations to practice or doctor data
- ✅ History record created with rejection action
- ✅ Status updated to `rejected`

**Verification Points**:
- Practice.doctorIds unchanged
- Doctor.practiceId unchanged
- History record shows rejection
- Status is `rejected`

---

## Cross-Feature Integration Testing

### Test CF.1: End-to-End Location Workflow

**Objective**: Test complete location add workflow

**Steps**:
1. Practice Admin submits location add request
2. Verify request appears in admin queue
3. Admin views formatted request
4. Admin approves request
5. Verify location appears in practice
6. Verify notifications sent (if implemented)
7. Verify history record created

**Expected Results**:
- ✅ Complete workflow works end-to-end
- ✅ All steps execute correctly
- ✅ Data integrity maintained

### Test CF.2: End-to-End Roster Workflow

**Objective**: Test complete doctor add workflow

**Steps**:
1. Practice Admin submits add doctor request
2. Verify request appears in admin queue
3. Admin views request
4. Admin approves request
5. Verify doctor added to practice
6. Verify doctor.practiceId updated
7. Verify notifications sent
8. Verify history record created

**Expected Results**:
- ✅ Complete workflow works end-to-end
- ✅ Two-sided mutations work
- ✅ Notifications work
- ✅ History integrity maintained

### Test CF.3: Multi-Request Approval

**Objective**: Test approving multiple requests

**Steps**:
1. Submit multiple requests (locations, roster, practice edits)
2. Approve multiple requests
3. Verify all approvals work correctly
4. Verify no conflicts or race conditions

**Expected Results**:
- ✅ Multiple approvals work
- ✅ No data conflicts
- ✅ All side effects applied correctly

---

## Performance & Edge Cases

### Test P.1: Large Data Sets

**Objective**: Verify performance with many requests

**Steps**:
1. Create many approval requests (50+)
2. Navigate to approval queue
3. Verify page loads in reasonable time
4. Test filtering/search with large dataset
5. Verify pagination works (if implemented)

**Expected Results**:
- ✅ Page loads in < 3 seconds
- ✅ Filtering works efficiently
- ✅ No UI freezing

### Test P.2: Concurrent Approvals

**Objective**: Test concurrent approval scenarios

**Steps**:
1. Submit multiple requests for same practice
2. Approve requests concurrently (different tabs)
3. Verify no data corruption
4. Verify all approvals succeed

**Expected Results**:
- ✅ No data corruption
- ✅ All approvals succeed
- ✅ No race conditions

### Test P.3: Invalid Data Handling

**Objective**: Verify error handling for invalid data

**Steps**:
1. Try to submit request with invalid data
2. Try to approve non-existent request
3. Try to access invalid routes
4. Verify error messages are user-friendly

**Expected Results**:
- ✅ Validation prevents invalid submissions
- ✅ Error messages are clear
- ✅ No crashes or console errors

### Test P.4: Storage Persistence

**Objective**: Verify data persists correctly

**Steps**:
1. Submit requests
2. Refresh page
3. Verify data persists
4. Clear localStorage
5. Verify seed data regenerates

**Expected Results**:
- ✅ Data persists after refresh
- ✅ Seed data regenerates if cleared
- ✅ No data loss

---

## Testing Checklist Summary

### Pre-Testing ✅
- [ ] Environment set up
- [ ] Test accounts created
- [ ] Browser DevTools open
- [ ] localStorage cleared (if needed)

### Core Features ✅
- [ ] Step 2: Data Model & Storage
- [ ] Step 3: Seed Data & Migration
- [ ] Step 4: Business Logic Services
- [ ] Step 5: UI Integration
- [ ] Step 6: Practice Directory Pages
- [ ] Step 7: Search & Directory Updates
- [ ] Step 9: Announcements System

### Practice Management ✅
- [ ] Step 10.1-10.3: Practice Management
- [ ] Step 10.4: Location Management
- [ ] Step 10.5: Admin Approval UI
- [ ] Step 10.6: Practice Edit Refinement
- [ ] Step 10.7: Roster Governance

### Integration ✅
- [ ] End-to-end workflows
- [ ] Cross-feature integration
- [ ] Performance testing
- [ ] Edge case testing

---

## Reporting Issues

When reporting issues, include:

1. **Test Case**: Which test failed
2. **Steps to Reproduce**: Exact steps taken
3. **Expected Result**: What should have happened
4. **Actual Result**: What actually happened
5. **Console Errors**: Any errors in browser console
6. **Browser/OS**: Browser version and OS
7. **Screenshots**: If applicable

---

## Conclusion

This guide covers all V2 features implemented in Steps 2-10.7. Use this guide to systematically test all functionality and ensure the system works correctly before deployment.

**Last Updated**: January 29, 2026  
**Version**: 1.0  
**Status**: Complete Testing Guide
