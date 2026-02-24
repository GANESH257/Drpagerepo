# Admin & Doctor Portals – API vs Local Audit

Quick reference for what uses the backend API vs local storage / Firestore. Updated after admin API migration.

---

## Project, deployment, and APIs (summary)

- **App:** Next.js 14 (App Router), static export (`output: 'export'`), dual-audience (physicians + patients). Frontend talks to a **separate backend API** (no Next API routes at runtime).
- **Deployment:** Static build → `out/` or `deployment.tar.gz`; deploy to GoDaddy cPanel (or any static host). Backend runs elsewhere (e.g. GCP Cloud Run: `NEXT_PUBLIC_API_URL`).
- **Auth:** JWT in `localStorage` (`aip_doctor_token`). Same key used for doctor and admin; backend distinguishes by token payload.
- **APIs (frontend clients in `src/lib/api/`):** auth, doctors (GET/PUT/DELETE), practices (GET/PUT), join-requests, approval-requests, announcements, events, policies, membership-plans, departments, messages, notifications, referrals, admin-stats, admin-settings, community. Base URL: `NEXT_PUBLIC_API_URL` or default Cloud Run URL.

---

## Admin portal

### Fully API-backed
- **Login** – `@/lib/api/auth`
- **Dashboard** – `getAdminStats`, `getJoinRequests` (API); stats cards, charts use API data
- **Approvals** – `getApprovalRequestsAPI`, `getPractices`, `getDoctors` (API)
- **Approval detail** – `getApprovalRequestAPI`, approve/reject/update, `getAllDoctorsArray(getToken())`, `getAllPractices` (API)
- **History / Approvals** – `getApprovalHistoryAPI`, `getApprovalRequestsAPI`, `getAllPractices`, `getAllDoctorsArray` (API); normalizer receives doctors from API
- **Members (practices, doctors)** – `getPractices`, `getDoctors`, `getPractice`, `getDoctor`, `updatePractice`, `updateDoctor`, `deleteDoctor` (API)
- **MembersTable** – `getAllDoctorsArray`, `deleteDoctor` (API), `getAllPracticesForAdmin` (API-backed)
- **PracticeRosterSection** – `getDoctorsByPractice` (API), `getAllDoctorsArray`, `updateDoctor`, `updatePractice` (API)
- **ReferralsTable** – `getAllReferralsAPI`, `getAllDoctorsArray`, `getAllPracticesForAdmin` (API)
- **Reports** – `getJoinRequests` (API)
- **Config (settings, medical-data, memberships)** – `getAdminSettings`, `updateAdminSettings`, specialties/insurance/conditions/treatments APIs, `PlansEditor` (API)
- **Events, Policies** – `EventsEditor`, `PoliciesEditor` (API)
- **Content / Leadership** – `getCommittees` (API)
- **Notifications, Referrals** – `getAllNotifications`, referrals API
- **Community (forum, users, reports)** – community + admin-community APIs
- **Messages** – `MessagesSectionAPI` with `basePath="/admin/messages"` (threads, send, create, `getAllDoctorsArray` for new chat)
- **Announcements** – `createAnnouncement`, `getAllDoctorsArray` (API)
- **Doctors per department chart** – `getDoctorsPerDepartment()` uses `getAllDoctorsArray(getToken())` + `getDepartments()` (API)
- **Doctors per plan chart** – `getDoctorsPerPlan()` uses `getAllDoctorsArray(getToken())`; plan from API only (`planId`/`membership_plan_id`) or default `'basic'` (no loadMembership).
- **MemberEditDialog** – `updateDoctor` (API) for profile; membership display from API doctor (`planId`/`membership_plan_id`) only; no loadMembership.
- **approvalEngine** – Uses `getAllDoctorsArray(getToken())` for validation and `updateDoctor` / `updatePractice` (API) for side effects; no `saveDoctorOverride` when applying approvals (backend applies on approve).

### Still using local (by design until backend supports it)
- **adminHelpers.createNewDoctor** – Uses `saveDoctorOverride` only for the “create doctor” step (no `POST /api/doctors` yet). Practice roster update uses `updatePractice` (API). When backend adds create-doctor, replace with API call.
- **adminStorage** – Type `AdminJoinRequest` + legacy localStorage helpers; dashboard/approvals **data** comes from API. Type-only usage is fine.

---

## Doctor portal

### Fully API-backed
- **Dashboard** – stats, links; messages use `MessagesSectionAPI`
- **Messages** – `MessagesSectionWrapper` → `MessagesSectionAPI` (threads, thread, send, create, `getAllDoctorsArray`)
- **Community / Announcements & events** – `getAnnouncements()`, `markAnnouncementRead()`, `getEvents()` (API)
- **Announcements (standalone)** – `getAnnouncements()`, `markAnnouncementRead()` (API) – migrated from Firestore
- **Referrals** – `getAllReferralsAPI`, `getAllDoctorsArray` (API)
- **Settings** – preferences API where used
- **Profile / practices** – profile and practice updates use API where implemented

### Fully API-backed (migrated)
- **Dashboard history** – `getAllDoctorsArray(getToken())` for doctor name lookup.
- **Practice history** – `getAllDoctorsArray(getToken())` for doctor list/selector.
- **Practice doctors** – Plan from API doctor (`planId`/`plan_id`/`membership_plan_id`) + `getMembershipPlans()`; no `loadMembership`.
- **Referrals page** – `getAllDoctorsArray(getToken())` for network doctors.
- **MessagesSection** (when used) – `getAllDoctorsArray(getToken())`; doctor messages use `MessagesSectionAPI`.
- **InstitutionDetailClient, institutionSearch** – `getAllDoctorsArray(getToken())` (or public when no token).
- **DashboardZones** – `getDoctors({ limit: 1 }, getToken())` for network size.

### Still using local / mixed (optional follow-ups)
- **Practice announcements create** – `createAnnouncement(actor, input)` from `announcementService` (Firestore). Backend may support practice-scoped create with `audience_type: 'practice'`.
- **MembershipSection** (doctor dashboard) – Uses API for plans and `getMyMembership`; uses `membershipStorage` for upgrade/payment flow (initializeMembership, completeMembershipPayment, etc.) until backend supports full flow.

---

## Shared / global

### Fixed in this pass
- **FloatingMessageIcon** – Uses `getUnreadCount()` from `@/lib/api/messages` with polling (30s) and on window focus. Admin link set to `/admin/messages` (was `/admin/announcements`).

### Optional
- **FloatingMessageIcon** – No real-time push; polling only. Backend could add WebSocket/SSE for instant unread updates.

---

## Summary

- **Admin:** Dashboard, approvals, history, members (list/update/delete), roster, referrals, messages, announcements, config, events, policies, community, notifications, and charts (doctors per department, doctors per plan) are API-based. Approval engine uses API for doctor list and for applying doctor/practice updates (no `saveDoctorOverride` on approve). Remaining local: `createNewDoctor` (saveDoctorOverride until backend has POST doctor). MemberEditDialog uses API for plan display.
- **Doctor:** Dashboard (layout, zones with token for network size), history, practice history, practice doctors (plan from API), practice membership overview, referrals, messages, find-physician, and institution search/detail are API-based. Remaining local: practice announcements create (Firestore), MembershipSection upgrade/payment flow (membershipStorage).

No critical missing pieces for core admin flows; remaining items are optional (create doctor API, membership/plan from API).
