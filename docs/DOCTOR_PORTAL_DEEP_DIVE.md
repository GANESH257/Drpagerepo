# Doctor Portal – Deep Dive

Complete reference for the doctor dashboard: structure, navigation, pages, components, and API/storage usage.

---

## 1. Entry and layout

### 1.1 Route structure

- **Base path:** `/doctor/dashboard`
- **Layout:** `src/app/doctor/dashboard/layout.tsx` (wraps all dashboard routes)

### 1.2 Layout behavior

1. **Auth**
   - Uses `useDoctorSession()`: `getToken()`, `getUser()`, `isAuthenticated()`, `updateSessionDoctorId()`.
   - If not authenticated → redirect to `/join-us`.
   - If no token/user or `user.role !== 'doctor'` → show error + “Submit Join Request” / “Return to Login”.
   - If no `user.doctorId` → “Doctor profile not found”.

2. **Load doctor**
   - **API:** `getDoctor(doctorId, token)` from `@/lib/api/doctors` (GET `/api/doctors/:id`).
   - On success: `setDoctor(loadedDoctor)`, optionally `updateSessionDoctorId(doctorId)`.
   - On 401/token error → redirect to `/join-us`.
   - On 404/other → error state.

3. **Completion gate**
   - If `doctor.profileStatus === 'pending_profile'` or `doctor.verified === false`:
     - Renders **only** `CompleteProfileGate` (no full dashboard).
     - Gate redirects any path that doesn’t include `complete-profile` to `/doctor/dashboard/complete-profile`.
   - Else: full dashboard with `DashboardLayout`.

4. **Full dashboard**
   - Renders `DashboardLayout` with `doctor` and `onProfileUpdate` (no-op).
   - Children are the current page (Overview, Profile, etc.).

### 1.3 Session (useDoctorSession)

- **Storage:** `aip_doctor_token`, `aip_doctor_user`, legacy `aip_doctor_session`.
- **Exposed:** `getToken`, `getUser`, `getSession`, `setToken`, `setSession`, `updateSessionDoctorId`, `clearSession`, `isAuthenticated`.
- Token is used for all API calls that require auth.

---

## 2. Shell: PortalShell, sidebar, header

### 2.1 DashboardLayout

- **File:** `src/components/dashboard/DashboardLayout.tsx`
- **Wraps:** `DoctorProvider` + `PortalShell`.
- **Nav:** Builds `navItems` from:
  - **Base (all doctors):** `baseDoctorNavItems`
  - **If practice admin:** `baseDoctorNavItems` + `practiceAdminNavItems`
- **Header right:** Doctor name, “Verified Physician”, “Practice Admin” badge, MessageBell, AnnouncementBell, NotificationBell, Sign Out button.
- **Sign out:** `clearSession()` then `router.push('/join-us')`.

### 2.2 Base sidebar items (all doctors)

| Label              | href                              | Icon           |
|--------------------|-----------------------------------|----------------|
| Overview           | /doctor/dashboard                 | LayoutDashboard |
| Edit Profile       | /doctor/dashboard/profile         | User           |
| View Practice      | /doctor/dashboard/practice-info   | Building       |
| Manage Locations   | /doctor/dashboard/locations       | MapPin         |
| Insurance & Services | /doctor/dashboard/insurance     | CreditCard     |
| Appointment Requests | /doctor/dashboard/appointments  | Calendar       |
| Referrals          | /doctor/dashboard/referrals       | Users          |
| Community          | /doctor/dashboard/community       | MessageSquare  |
| Announcements      | /doctor/dashboard/announcements   | Megaphone      |
| Messages           | /doctor/dashboard/messages        | MessageCircle  |
| Membership         | /doctor/dashboard/membership      | Crown          |

### 2.3 Practice-admin-only sidebar items

| Label              | href                                          | Icon     |
|--------------------|-----------------------------------------------|----------|
| Practice           | /doctor/dashboard/practice                   | Building |
| Practice Approvals | /doctor/dashboard/practice/approvals         | FileCheck |
| Practice Doctors   | /doctor/dashboard/practice/doctors           | Users    |
| Practice Locations | /doctor/dashboard/practice/locations        | MapPin   |
| Services & Insurance | /doctor/dashboard/practice/services-insurance | Settings |
| Practice Membership | /doctor/dashboard/practice/membership       | Crown    |
| Practice History   | /doctor/dashboard/practice/history          | History  |

### 2.4 PortalShell

- **File:** `src/components/portal/PortalShell.tsx`
- **Desktop:** `PortalHeader` (sticky) + `PortalSidebar` (fixed left, collapsible) + main content (with `lg:ml-72` / `lg:ml-20` when collapsed).
- **Mobile:** Same header; sidebar as Sheet (opens from menu button).
- **Sidebar:** `PortalSidebar` – list of nav links, active state by pathname, collapse toggle (ChevronLeft/Right).

### 2.5 PortalHeader

- Title: “Doctor Dashboard”, subtitle “Physician Governance”.
- Left: Menu button (mobile only).
- Right: `headerRight` from DashboardLayout (name, badges, bells, Sign Out).

### 2.6 Header bells

- **MessageBell:** `subscribeToTotalUnreadCount(userId)` from `@/lib/messageStorage` (localStorage). Links to `/doctor/dashboard/messages`.
- **AnnouncementBell:** `subscribeToAnnouncements(doctorId, practiceId)` from `@/lib/services/announcementService` (Firestore). Links to `/doctor/dashboard/announcements`.
- **NotificationBell:** `getNotifications(doctorId)` from `@/lib/storage/notificationStorage` (localStorage). Links to `/doctor/dashboard/notifications`.

---

## 3. DoctorContext

- **File:** `src/components/dashboard/DoctorContext.tsx`
- **Provider:** `DoctorProvider` holds `doctor` in state, syncs from prop, exposes `updateDoctor`.
- **Consumer:** `useDoctorContext()` → `{ doctor, updateDoctor }`.
- Used by Overview, Profile, Locations, Insurance, Membership, Appointments so they all see the same doctor and can trigger profile updates.

---

## 4. Pages and data flow

### 4.1 /doctor/dashboard (Overview)

- **Page:** `src/app/doctor/dashboard/page.tsx` → `<OverviewSection doctor={doctor} />`.
- **OverviewSection:**
  - **API/storage:** `loadAppointmentRequests(doctor.id)`, `loadReferrals(doctor.id)` from `@/lib/doctorStorage` (which uses API: getAppointments, getReferrals).
  - **UI:** Profile completion %, new appointments count, this-month referrals, quick action cards (Edit Profile, Manage Locations, Insurance, Appointments, Referrals), MonthlyAppointmentsChart, MonthlyReferralsChart.

### 4.2 /doctor/dashboard/profile (Edit Profile)

- **Page:** `profile/page.tsx` → `<EditProfileSection doctor={doctor} onProfileUpdate={updateDoctor} />`.
- **EditProfileSection:**
  - **API:** `loadDoctorProfile`, `saveDoctorProfile`, `saveDoctorProfileToAPI` from `@/lib/doctorStorage` (under the hood: getDoctor, updateDoctor from `@/lib/api/doctors`).
  - **UI:** Accordion sections (photo, basic info, credentials, board certifications with CredentialItemForm, hospital privileges, badges & awards, education, location, insurance, etc.), TagInput, EditableList, CredentialItemForm. Save persists via doctorStorage → API.

### 4.3 /doctor/dashboard/practice-info (View Practice)

- **Page:** `practice-info/page.tsx`
- **API:** `getPractice(practiceId)` from `@/lib/api/practices` (GET `/api/practices/:id`). Normalizes locations (lat/lng from latitude/longitude, address from address_line1).
- **UI:** SectionHeader, practice name/description, phone/email/website, address (MapPin), locations list, specialties, services, insurance. Read-only.

### 4.4 /doctor/dashboard/locations (Manage Locations – doctor-level)

- **Page:** `locations/page.tsx` → `<LocationsSection doctor={doctor} onProfileUpdate={updateDoctor} />`.
- **LocationsSection:** Uses `loadDoctorProfile` / `saveDoctorProfile` from doctorStorage (API). Locations are part of doctor profile; add/edit/delete via LocationFormDialog, then save profile. No approval flow here (doctor’s own profile locations).

### 4.5 /doctor/dashboard/insurance

- **Page:** `insurance/page.tsx` → `<InsuranceSection doctor={doctor} onProfileUpdate={updateDoctor} />`.
- **InsuranceSection:** `loadDoctorProfile` / `saveDoctorProfile` (API). Manages insurance and conditions/services on the doctor.

### 4.6 /doctor/dashboard/appointments

- **Page:** `appointments/page.tsx` → `<AppointmentsSection doctorId={doctor.id} />`.
- **AppointmentsSection:** `loadAppointmentRequests`, `saveAppointmentRequests` from doctorStorage (getAppointments / createAppointment / updateAppointment from `@/lib/api/appointments`). Table of requests, approve/decline.

### 4.7 /doctor/dashboard/referrals

- **Page:** `referrals/page.tsx` → uses ReferralsSection (or similar). Uses `loadReferrals` / `saveReferrals` from doctorStorage (getReferrals, updateReferral from `@/lib/api/referrals`). Displays and updates referrals.

### 4.8 /doctor/dashboard/community

- **Page:** `community/page.tsx` → `<CommunityView canPost />`. Community posts/discussion (implementation in CommunityView).

### 4.9 /doctor/dashboard/announcements

- **Page:** `announcements/page.tsx`
- **Data:** `subscribeToAnnouncements(doctorId, practiceId)` from `@/lib/services/announcementService` (Firestore). `markAnnouncementAsRead` for read state.
- **UI:** SectionHeader, list of announcements, read/unread, mark as read.

### 4.10 /doctor/dashboard/messages

- **Page:** `messages/page.tsx` → `<MessagesSectionWrapper />`. Messages between doctors (messageStorage / UI in MessagesSection).

### 4.11 /doctor/dashboard/membership

- **Page:** `membership/page.tsx` → `<MembershipSection doctorId={doctor.id} />`. Uses `@/lib/membershipStorage` for membership display.

### 4.12 /doctor/dashboard/notifications

- **Page:** `notifications/page.tsx`
- **Data:** `getNotifications(doctorId)`, `markNotificationRead(doctorId, id)` from `@/lib/storage/notificationStorage` (localStorage). No API call here; backend can write to DB on events (e.g. join approved) but frontend does not yet fetch from GET `/api/notifications`.
- **UI:** Tabs All/Unread, cards with title, message, type badge, mark-read button, link.

### 4.13 /doctor/dashboard/complete-profile

- **Page:** `complete-profile/page.tsx` (used when profile_status is pending_profile).
- **API:** `getDoctor(doctorId, token)`, `getPractice(doctor.practiceId, token)`, `createApprovalRequest(...)` from `@/lib/api/approval-requests`, `geocodeZip` from `@/lib/services/geocodingService`.
- **Flow:** Step 1 – profile (required: fullName, bio, phone, website, NPI, medical school; optional: residency, internship, certifications, badges). Step 2 (PA only) – practice (name, phone, address, ZIP required; description, website optional). Geocodes primary location from ZIP and sends latitude/longitude. Submits either `practice_admin_profile_practice_completion` or `doctor_profile_completion`.
- **UI:** Cards, inputs, CredentialItemForm, “Submit for approval”, success state when `?submitted=1`.

---

## 5. Practice-admin-only pages

### 5.1 /doctor/dashboard/practice

- **Page:** `practice/page.tsx`
- **Data:** `getAllPracticesForAdmin()` (→ getAllPractices({ forAdmin: true }) → API with includePending), `getDoctorsByPractice(practiceId)` (→ getAllDoctors from memberStorage → getDoctors API). Finds practice by current user’s practiceId.
- **UI:** Practice overview, doctors in practice, links to sub-pages.

### 5.2 /doctor/dashboard/practice/approvals

- **Page:** `practice/approvals/page.tsx`
- **Data:** `getPendingApprovalsForPracticeAdmin(practiceId)` from `@/lib/services/approvalEngine` (calls `getApprovalRequestsAPI({ practiceId, status: 'pending' })`, transform, filter).
- **UI:** Table of requests (type, status, submitted, submitted by), “Review” → `/doctor/dashboard/practice/approvals/[id]`.

### 5.3 /doctor/dashboard/practice/approvals/[id]

- **Page:** `practice/approvals/[id]/page.tsx` → detail client.
- **Data:** `getApprovalRequestAPI(requestId)`, `getApprovalTimeline(requestId)`, `decideAsPracticeAdmin(actor, requestId, 'approve'|'reject', opts)` from approvalEngine. approve/reject call `approveRequest` / `rejectRequest` from `@/lib/api/approval-requests`.
- **UI:** Request summary, timeline, approve/reject buttons, notes/reason.

### 5.4 /doctor/dashboard/practice/doctors

- **Page:** `practice/doctors/page.tsx`
- **Data:** `getAllPracticesForAdmin()`, `getDoctorsByPractice(practiceId)`, `getPracticeInvitations()` from `@/lib/storage/invitationStorage`.
- **UI:** Roster, invite doctor, etc.

### 5.5 /doctor/dashboard/practice/locations

- **Page:** `practice/locations/page.tsx`
- **Data:** `getAllPracticesForAdmin()` to find practice, `geocodeZip` for new/edit location coords.
- **Actions:** `submitApprovalRequest(actor, { type: 'practice_location_add_request' | 'practice_location_edit_request' | 'practice_location_remove_request', payload, target })` from `@/lib/services/approvalEngine` (which calls `createApprovalRequest` API). So add/edit/remove location goes through approval API.
- **UI:** List of locations, Add (dialog with address + ZIP geocode), Edit, Remove (with last-location guard).

### 5.6 /doctor/dashboard/practice/services-insurance

- **Page:** `practice/services-insurance/page.tsx`. Practice-level services and insurance (data from practices/adminHelpers or storage as used by the component).

### 5.7 /doctor/dashboard/practice/membership

- **Page:** `practice/membership/page.tsx`
- **Data:** `getPracticeDoctorsMembershipOverview(actor.practiceId)` from `@/lib/services/membershipService`.
- **UI:** Membership overview for the practice.

### 5.8 /doctor/dashboard/practice/history

- **Page:** `practice/history/page.tsx`
- **Data:** `getApprovalHistory()`, `getApprovalRequests()` from `@/lib/storage/approvalStorage` (localStorage), `getApprovalTimeline(requestId)` (approvalEngine – may mix API). So history is partly local.
- **UI:** Filters (type, status, date), table of history records.

### 5.9 /doctor/dashboard/practice/announcements/create

- **Page:** `practice/announcements/create/page.tsx`. Create practice-level announcement (announcementService/createAnnouncement).

---

## 6. API calls summary (doctor portal)

| Source | API / behavior |
|--------|-----------------|
| layout | GET doctor: `getDoctor(doctorId, token)` → `/api/doctors/:id` |
| complete-profile | getDoctor, getPractice(practiceId, token), createApprovalRequest (POST `/api/approval-requests`), geocodeZip (client) |
| practice-info | getPractice(practiceId) → GET `/api/practices/:id` |
| doctorStorage (profile) | getDoctor, updateDoctor → GET/PUT `/api/doctors/:id` |
| doctorStorage (appointments) | getAppointments, createAppointment, updateAppointment → appointments API |
| doctorStorage (referrals) | getReferrals, updateReferral → referrals API |
| approvalEngine | createApprovalRequest, getApprovalRequests, getApprovalRequest, approveRequest, rejectRequest → `/api/approval-requests` |
| Practice PA list | getPendingApprovalsForPracticeAdmin → getApprovalRequests API with filters |
| Practice PA detail | getApprovalRequest, approveRequest, rejectRequest |
| Practice locations (PA) | submitApprovalRequest → createApprovalRequest (location add/edit/remove) |
| Practice page / doctors | getAllPracticesForAdmin → GET `/api/practices?includePending=true` + token; getDoctorsByPractice → getAllDoctors (memberStorage) → getDoctors API |
| Practice history | getApprovalHistory, getApprovalRequests (approvalStorage – localStorage); getApprovalTimeline (approvalEngine) |
| Notifications (page + bell) | notificationStorage (localStorage) – no GET `/api/notifications` in doctor portal |
| Messages | messageStorage (localStorage) |
| Announcements | announcementService (Firestore) |

---

## 7. Components (dashboard and shared)

### 7.1 Dashboard-specific

- **DashboardLayout** – Nav building, DoctorProvider, PortalShell, header right (name, badges, bells, logout).
- **CompleteProfileGate** – Redirects to complete-profile when in pending_profile mode.
- **DoctorContext** / **DoctorProvider** – Doctor state and updateDoctor.
- **OverviewSection** – Stats, quick actions, charts.
- **EditProfileSection** – Full profile form with accordions, credential forms, save to API.
- **LocationsSection** – Doctor’s locations list + LocationFormDialog; save via doctorStorage.
- **InsuranceSection** – Insurance and services; save via doctorStorage.
- **AppointmentsSection** – Appointments table; load/save via doctorStorage (appointments API).
- **ReferralsSection** – Referrals list; load/save via doctorStorage (referrals API).
- **MembershipSection** – Membership display (membershipStorage).
- **MessagesSectionWrapper** / **MessagesSection** – Messages UI (messageStorage).
- **MessageBell, AnnouncementBell, NotificationBell** – Header icons with counts.
- **LocationFormDialog** – Add/edit location (name, address, city, state, zip, phone, etc.).
- **LocationCard** – Single location display.
- **MonthlyAppointmentsChart, MonthlyReferralsChart** – Overview charts.
- **TagInput, EditableList** – Generic inputs used in profile/insurance.

### 7.2 Shared (used by doctor portal)

- **PortalShell, PortalSidebar, PortalHeader** – Shell and nav.
- **SectionHeader, EmptyState** – Headers and empty states.
- **ApprovalStatusBadge, ApprovalTypeBadge** – Approval list/detail.
- **RequestedChangesRenderer** – Approval payload display (admin/PA detail).
- **CredentialItemForm, CredentialGrid** – Certifications/badges (profile + complete-profile).
- **Card, Button, Input, Label, Tabs, Table, Dialog, Sheet, Badge** – UI primitives.

---

## 8. Buttons and actions

- **Sign Out** – clearSession(), push /join-us.
- **Complete-profile** – “Next: Practice details”, “Submit for approval” (createApprovalRequest).
- **Edit Profile** – Save per section / full save → saveDoctorProfile (API).
- **Manage Locations (doctor)** – Add/Edit/Delete location in LocationsSection → save profile (API).
- **Practice Locations (PA)** – Add/Edit/Remove → submitApprovalRequest (practice_location_add_request, etc.) → API.
- **Appointments** – Approve/Decline → updateAppointment (API).
- **Referrals** – Status updates → updateReferral (API).
- **Practice Approvals (PA)** – “Review” → detail page → Approve/Reject → approveRequest/rejectRequest (API).
- **Notifications** – Mark read → markNotificationRead (localStorage).
- **Announcements** – Mark as read → markAnnouncementAsRead (announcementService/Firestore).

---

## 9. Data summary

- **API-backed:** Doctor profile (get/update), practice (get), approval requests (create, list, get, approve, reject), appointments, referrals, practices list (with includePending for admin/PA), doctors list (for roster).
- **localStorage:** Notifications (doctor portal and bell), messages (unread count + messages), approval history (practice history page), invitation storage (practice invites), doctor overrides (memberStorage).
- **Firestore:** Announcements and announcement read state.
- **Client-only:** Geocoding (geocodeZip) for locations.

---

## 10. Notes

- **Notifications:** Backend inserts into `notifications` (e.g. on doctor_join_practice approval). The doctor portal still reads from `notificationStorage` (localStorage). To show backend notifications, the notifications page and NotificationBell could be switched to `@/lib/api/notifications` (GET `/api/notifications`).
- **Practice history:** Uses approvalStorage (localStorage) plus getApprovalTimeline; for a single source of truth, history could be loaded from approval API/history if available.
- **Role:** `doctor.roleInPractice === 'practice_admin'` controls whether the extra Practice nav block and practice-admin-only pages are shown and whether complete-profile has one or two steps.
