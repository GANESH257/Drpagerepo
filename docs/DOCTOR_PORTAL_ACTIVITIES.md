# Doctor Portal Activities Documentation

## Overview

This document details all activities, operations, and capabilities available in the Doctor Portal dashboard. The portal provides doctors with tools to manage their profile, locations, insurance, appointments, referrals, and membership.

---

## Doctor Portal Structure

### Main Dashboard (`/doctor/dashboard`)

**Purpose**: Overview of doctor's statistics and quick access to all sections

**Components**:
1. **Stats Cards** - Key metrics at a glance
2. **Monthly Charts** - Visual data representations
3. **Quick Actions** - Fast navigation to common tasks

**Stats Displayed**:
- Profile Completion Percentage
- New Appointment Requests count
- Referrals This Month count
- Verification Status badge

**Charts Available**:
- Monthly Appointments Chart
- Monthly Referrals Chart

**Quick Actions**:
- Edit Profile
- Manage Locations
- Insurance & Services
- Appointments
- Referrals

---

## Authentication & Access

### Login Process

**Route**: `/join-us`

**Authentication Method**:
- Email/password authentication
- Google Sign-In (placeholder for Phase 2)
- Session stored in localStorage as `aip_doctor_session`

**Dummy Credentials**:
- Email: `doctor@aip.com`
- Password: `AIP@12345`

**Session Structure**:
```typescript
{
  email: string;
  role: 'doctor';
  doctorId?: string;
  loginAt: string;
}
```

### Access Control

**Protection**: Client-side route protection via layout component

**Access Requirements**:
1. Valid session in localStorage
2. Doctor must exist in seed data (`src/data/doctors.ts`)
3. Doctor profile must have valid email

**Access Denied Scenarios**:
- No session → Redirect to `/join-us`
- Doctor not found → Show error message
- Profile incomplete → Show error message

**Error Messages**:
- "Dashboard access is available after approval."
- Provides links to submit join request or return to login

---

## Doctor Activities by Section

### 1. Overview Dashboard (`/doctor/dashboard`)

#### View Dashboard Overview

**Activity**: View summary statistics and quick actions  
**Access**: Authenticated doctors only  
**Display**:
- Welcome message with doctor's first name
- Four stat cards showing key metrics
- Two monthly charts (appointments and referrals)
- Quick action buttons for common tasks

**Profile Completion Calculation**:
- Checks 11 fields: firstName, lastName, fullName, specialty, bio, credentials, medicalSchool, residency, locations, insurance, boardCertifications
- Calculates percentage: (filled fields / total fields) × 100

**New Appointments Count**:
- Filters appointment requests with status = 'New'
- Loaded from localStorage: `aip_doctor_requests_{doctorId}`

**Referrals This Month**:
- Filters referrals from current month
- Loaded from localStorage: `aip_doctor_referrals_{doctorId}`

**Verification Status**:
- Shows "Verified" badge if `doctor.verified === true`
- Shows "Pending" badge if `doctor.verified === false`

---

### 2. Edit Profile (`/doctor/dashboard/profile`)

#### View Profile Information

**Activity**: View and edit professional information  
**Access**: Authenticated doctors only  
**Form Sections** (Accordion layout):

1. **Basic Information**:
   - First Name (text input)
   - Last Name (text input)
   - Full Name (required, auto-updates from first/last)
   - Credentials (select: M.D., D.O., D.P.M., D.D.S., D.M.D., N.P., P.A.)
   - Specialty (select from departments)
   - Bio (textarea, required)
   - Profile Image URL (text input)

2. **Professional Details**:
   - Medical School (text input)
   - Residency (text input)
   - Years of Experience (number input)
   - Board Certifications (tag input with suggestions)
   - Languages Spoken (tag input)
   - Accepts New Patients (toggle switch)
   - Featured Doctor (toggle switch)

3. **Contact Information**:
   - Email (read-only, from session)
   - Phone (text input)
   - Website (text input)
   - City (text input)
   - State (select: US states)
   - ZIP Code (text input)

4. **Social Media**:
   - LinkedIn URL (text input)
   - Twitter/X URL (text input)
   - Facebook URL (text input)
   - Instagram URL (text input)

#### Save Profile Changes

**Activity**: Save updated profile information  
**Process**:
1. Click "Save" button
2. Validation runs (checks required fields)
3. Profile saved to localStorage: `aip_doctor_profile_{doctorId}`
4. Success message displayed for 3 seconds
5. Original data updated

**Validation Rules**:
- Specialty: Required
- Bio: Required
- Full Name: Required

**Reset Function**:
- Click "Reset" button to revert all changes
- Restores original profile data

**Storage**:
- Merges changes with existing profile
- Falls back to seed data if localStorage empty
- Updates both localStorage and component state

---

### 3. Manage Locations (`/doctor/dashboard/locations`)

#### View Practice Locations

**Activity**: View all practice locations  
**Access**: Authenticated doctors only  
**Display**:
- List of location cards
- Each card shows: name, address, phone, hours, services
- Primary location badge (first location)
- Edit and Delete buttons per location

**Location Card Information**:
- Practice Name
- Full Address (street, city, state, ZIP)
- Phone Number
- Hours of Operation
- Services Offered (tags)
- Primary Location indicator

#### Add New Location

**Activity**: Add a new practice location  
**Process**:
1. Click "Add Location" button
2. Location form dialog opens
3. Fill in location details:
   - Practice Name (required)
   - Street Address (required)
   - City (required)
   - State (select, required)
   - ZIP Code (required)
   - Phone Number
   - Hours of Operation (textarea)
   - Services Offered (tag input)
4. Click "Save Location"
5. Location added to doctor's locations array
6. Saved to localStorage

**Form Validation**:
- Practice Name: Required
- Street Address: Required
- City: Required
- State: Required
- ZIP Code: Required

#### Edit Existing Location

**Activity**: Update location information  
**Process**:
1. Click "Edit" button on location card
2. Location form dialog opens with pre-filled data
3. Modify fields as needed
4. Click "Save Location"
5. Location updated in array
6. Saved to localStorage

#### Delete Location

**Activity**: Remove a practice location  
**Process**:
1. Click "Delete" button on location card
2. Confirmation dialog appears
3. Click "Delete" to confirm
4. Location removed from array
5. Saved to localStorage

**Note**: Cannot delete if only one location exists

#### Set Primary Location

**Activity**: Mark a location as primary  
**Process**:
1. Click "Set as Primary" button
2. Location moved to first position in array
3. Saved to localStorage

**Note**: First location in array is considered primary

---

### 4. Insurance & Services (`/doctor/dashboard/insurance`)

#### View Accepted Insurance Plans

**Activity**: View all accepted insurance plans  
**Access**: Authenticated doctors only  
**Display**:
- List of insurance plan badges
- Each badge shows insurance name with remove button
- Add insurance input field with suggestions

**Common Insurance Providers** (suggestions):
- Aetna
- Blue Cross Blue Shield
- Cigna
- UnitedHealthcare
- Medicare
- Medicaid
- Humana
- Kaiser Permanente
- Anthem
- AARP
- Tricare
- Oscar Health

#### Add Insurance Plan

**Activity**: Add a new accepted insurance plan  
**Process**:
1. Type insurance name in input field
2. Select from suggestions or type custom name
3. Click "Add" button or press Enter
4. Insurance added to doctor's insurance array
5. Saved to localStorage

**Validation**:
- Insurance name cannot be empty
- Duplicate insurance names are prevented (case-insensitive)

#### Remove Insurance Plan

**Activity**: Remove an accepted insurance plan  
**Process**:
1. Click "X" button on insurance badge
2. Insurance removed from array
3. Saved to localStorage

#### Manage Conditions & Services

**Activity**: View and edit conditions and services offered  
**Display**:
- Tag input field for conditions/services
- List of current services as removable tags

**Common Services** (suggestions):
- General Health Consultation
- Preventive Care
- Chronic Disease Management
- Health Screenings
- Diagnostic Testing
- Treatment Planning
- Follow-up Care
- Medication Management
- Wellness Exams
- Vaccinations
- Health Education
- Referral Coordination

**Add Service**:
1. Type service name
2. Select from suggestions or add custom
3. Press Enter or click tag
4. Service added to array
5. Saved to localStorage

**Remove Service**:
1. Click "X" on service tag
2. Service removed from array
3. Saved to localStorage

---

### 5. Appointment Requests (`/doctor/dashboard/appointments`)

#### View Appointment Requests

**Activity**: View all patient appointment requests  
**Access**: Authenticated doctors only  
**Display**:
- Table view with sortable columns
- Filter tabs by status (All, New, Confirmed, Completed, Declined)
- Status badges with color coding
- Action buttons per request

**Table Columns**:
- Patient Name
- Requested Date
- Requested Time
- Reason
- Insurance
- Status Badge
- Actions (View Details, Confirm, Decline)

**Status Types**:
- New (blue badge)
- Confirmed (green badge)
- Completed (gray badge)
- Declined (red badge)

#### View Request Details

**Activity**: View detailed information about an appointment request  
**Process**:
1. Click "View Details" button
2. Dialog opens showing:
   - Patient Name
   - Requested Date
   - Requested Time
   - Reason for Visit
   - Insurance Information
   - Status
   - Created Date

#### Confirm Appointment Request

**Activity**: Accept an appointment request  
**Process**:
1. Click "Confirm" button on request
2. Status updated to 'Confirmed'
3. Saved to localStorage
4. Table refreshes

#### Decline Appointment Request

**Activity**: Reject an appointment request  
**Process**:
1. Click "Decline" button on request
2. Decline dialog opens
3. Optional: Add decline note/reason
4. Click "Decline Appointment"
5. Status updated to 'Declined'
6. Decline note saved
7. Saved to localStorage
8. Table refreshes

#### Generate Sample Requests

**Activity**: Generate sample appointment requests for testing  
**Process**:
1. Click "Generate Sample Requests" button
2. Creates 8 sample requests with:
   - Random patient names
   - Random dates (next 1-14 days)
   - Random times (9:00-16:00)
   - Random reasons
   - Random insurance providers
   - Random statuses
3. Saved to localStorage

**Sample Data**:
- Patient Names: John Smith, Sarah Johnson, Michael Chen, etc.
- Reasons: Annual checkup, Follow-up appointment, New patient consultation, etc.
- Insurance: Aetna, Blue Cross Blue Shield, Cigna, UnitedHealthcare, Medicare

---

### 6. Referrals (`/doctor/dashboard/referrals`)

#### View Referrals

**Activity**: View referrals from network physicians  
**Access**: Authenticated doctors only  
**Display**:
- Table view with sortable columns
- Filter tabs by status (All, New, In Progress, Closed)
- Status badges with color coding
- Action buttons per referral

**Table Columns**:
- Referring Physician Name
- Specialty
- Patient Initials
- Date
- Reason
- Status Badge
- Actions (Change Status)

**Status Types**:
- New (blue badge)
- In Progress (yellow badge)
- Closed (green badge)

#### Change Referral Status

**Activity**: Update referral status  
**Process**:
1. Click status dropdown on referral row
2. Select new status (New, In Progress, Closed)
3. Status updated immediately
4. Saved to localStorage
5. Table refreshes

#### Generate Sample Referrals

**Activity**: Generate sample referrals for testing  
**Process**:
1. Click "Generate Sample Referrals" button
2. Creates 6 sample referrals with:
   - Random referring physicians
   - Random specialties
   - Random dates (past 30 days)
   - Random patient initials
   - Random reasons
   - Random statuses
3. Saved to localStorage

**Sample Data**:
- Referring Physicians: Dr. Sarah Johnson (Internal Medicine), Dr. Michael Chen (Cardiology), etc.
- Reasons: Specialty consultation needed, Second opinion requested, Complex case management, etc.

---

### 7. Membership (`/doctor/dashboard/membership`)

#### View Current Membership

**Activity**: View current membership plan and details  
**Access**: Authenticated doctors only  
**Display**:
- Current plan card with:
  - Plan name and tier
  - Monthly/Annual pricing
  - Billing cycle
  - Next billing date
  - Payment method
- Membership benefits list
- Billing information
- Upgrade/Change plan button

**Membership Plans Available**:
1. **Basic Plan**:
   - Monthly: $49/month
   - Annual: $490/year (save $98)
   - Features: Basic profile, 1 location, Standard support

2. **Professional Plan**:
   - Monthly: $99/month
   - Annual: $990/year (save $198)
   - Features: Enhanced profile, 3 locations, Priority support, Analytics

3. **Premier Plan**:
   - Monthly: $199/month
   - Annual: $1,990/year (save $398)
   - Features: Premium profile, Unlimited locations, 24/7 support, Advanced analytics, Featured listing

#### Upgrade Membership Plan

**Activity**: Change to a higher tier plan  
**Process**:
1. Click "Upgrade Plan" or "Change Plan" button
2. Plan selector dialog opens
3. Select desired plan
4. Choose billing cycle (Monthly/Annual)
5. Click "Confirm Upgrade"
6. Confirmation dialog shows:
   - Current plan
   - New plan
   - Price difference
   - Effective date
7. Click "Confirm" to proceed
8. Payment method selection dialog opens
9. Complete payment (PayPal or Card)
10. Membership updated
11. Saved to localStorage: `aip_membership_{doctorId}`

#### Change Billing Cycle

**Activity**: Switch between monthly and annual billing  
**Process**:
1. Click "Change Billing Cycle" button
2. Select new cycle (Monthly/Annual)
3. Confirmation dialog shows:
   - Current cycle
   - New cycle
   - Price difference
   - Prorated amount (if applicable)
4. Click "Confirm"
5. Billing cycle updated
6. Saved to localStorage

#### Update Payment Method

**Activity**: Change payment method for membership  
**Process**:
1. Click "Update Payment Method" button
2. Payment method dialog opens
3. Select PayPal or Credit/Debit Card
4. If PayPal: Redirect to PayPal (placeholder)
5. If Card: Enter card details:
   - Card Number
   - Expiry Date
   - CVV
   - Cardholder Name
   - Billing ZIP
6. Click "Save Payment Method"
7. Payment method updated
8. Saved to localStorage

#### View Membership Benefits

**Activity**: View benefits included in current plan  
**Display**:
- List of plan features with checkmarks
- Comparison with other plans
- Upgrade prompts for higher tiers

#### Download Invoice

**Activity**: Download membership invoice/receipt  
**Process**:
1. Click "Download Invoice" button
2. Invoice PDF generated (placeholder)
3. Download starts

**Note**: Invoice generation is placeholder functionality

---

## Data Storage

### localStorage Keys

**Profile Data**:
- `aip_doctor_profile_{doctorId}` - Complete doctor profile

**Appointment Requests**:
- `aip_doctor_requests_{doctorId}` - Array of appointment requests

**Referrals**:
- `aip_doctor_referrals_{doctorId}` - Array of referrals

**Membership**:
- `aip_membership_{doctorId}` - Membership data (plan, billing, payment)

**Session**:
- `aip_doctor_session` - Authentication session

### Data Loading Strategy

**Profile Loading**:
1. Check localStorage first
2. If not found, load from seed data (`src/data/doctors.ts`)
3. Merge updates with existing data

**Appointment Requests**:
1. Load from localStorage
2. If empty, return empty array
3. Can generate sample data for testing

**Referrals**:
1. Load from localStorage
2. If empty, return empty array
3. Can generate sample data for testing

**Membership**:
1. Load from localStorage
2. If not found, initialize with Basic plan
3. Default billing cycle: Annual

---

## Navigation & Layout

### Desktop Layout

**Sidebar**:
- Fixed collapsible sidebar (256px expanded, 64px collapsed)
- Navigation items with icons and descriptions
- Active route highlighting
- Smooth collapse/expand transitions

**Header**:
- "Doctor Dashboard" title
- Doctor name and verified badge
- Logout button
- Collapse/expand sidebar button

**Content Area**:
- Main content with padding
- Responsive grid layouts
- Card-based UI components

### Mobile Layout

**Header**:
- Hamburger menu button
- "Doctor Dashboard" title
- Logout button

**Sidebar**:
- Sheet/Drawer component
- Full-width when open
- Overlay background
- Close button

**Content**:
- Full-width content area
- Stacked card layouts
- Touch-friendly buttons

### Navigation Items

1. **Overview** (`/doctor/dashboard`)
   - Icon: LayoutDashboard
   - Description: Dashboard overview and quick actions

2. **Edit Profile** (`/doctor/dashboard/profile`)
   - Icon: User
   - Description: Update your professional information and credentials

3. **Manage Locations** (`/doctor/dashboard/locations`)
   - Icon: MapPin
   - Description: Add or update your practice locations

4. **Insurance & Services** (`/doctor/dashboard/insurance`)
   - Icon: CreditCard
   - Description: View and manage accepted insurance plans and services offered

5. **Appointment Requests** (`/doctor/dashboard/appointments`)
   - Icon: Calendar
   - Description: View and manage patient appointment requests

6. **Referrals** (`/doctor/dashboard/referrals`)
   - Icon: Users
   - Description: Track referrals from other physicians in the network

7. **Membership** (`/doctor/dashboard/membership`)
   - Icon: Crown
   - Description: Manage membership details, renewals, and upgrades

---

## Error Handling

### Authentication Errors

**No Session**:
- Redirect to `/join-us`
- No error message (silent redirect)

**Doctor Not Found**:
- Show error message: "Dashboard access is available after approval."
- Provide links to submit join request or return to login

**Profile Incomplete**:
- Show error message: "Dashboard access is available after approval."
- Provide links to submit join request or return to login

### Data Loading Errors

**localStorage Read Error**:
- Fallback to seed data
- Console error logged
- User sees default data

**localStorage Write Error**:
- Console error logged
- Changes not persisted
- User can retry save

**Invalid JSON**:
- Console error logged
- Fallback to empty array or seed data
- User can regenerate data

### Validation Errors

**Required Fields Missing**:
- Error messages shown below fields
- Save button disabled until valid
- Red border on invalid fields

**Duplicate Entries**:
- Silent prevention (no error shown)
- Entry not added
- Existing entry remains

---

## Performance Considerations

### Data Loading

- All data loaded client-side
- No pagination (loads all at once)
- May be slow with 100+ appointments/referrals
- Future: Implement pagination

### localStorage Limits

- Browser limit: ~5-10MB
- Current usage: Minimal
- Monitor for quota exceeded errors
- Future: Implement data cleanup

### Component Rendering

- React hooks for state management
- useEffect for data loading
- Memoization for expensive calculations
- Lazy loading for charts

---

## Future Enhancements

### Phase 2 Features

- Google Sign-In integration
- Real-time appointment notifications
- Email notifications for new requests
- Calendar integration
- Patient communication portal

### Phase 3 Features

- Verified reviews system
- Patient feedback management
- Advanced analytics dashboard
- Export data functionality
- API integration for external systems

---

**Last Updated**: January 29, 2026  
**Version**: 1.0
