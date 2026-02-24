# Deep Understanding – Alliance of Independent Physicians

A single reference for how the project works end-to-end: architecture, data, auth, portals, and approvals.

---

## 1. What the app is

- **Product:** Physician network + patient-facing doctor directory (dual audience).
- **Stack:** Next.js 16 (App Router), TypeScript, Tailwind, shadcn/ui, static export.
- **Deployment:** `npm run build` → static files in `/out`; deploy to GoDaddy cPanel (or any static host). **No Next.js server at runtime.**
- **Backend:** Separate REST API (e.g. GCP Cloud Run). Base URL: `NEXT_PUBLIC_API_URL` or default Cloud Run URL. **No API routes inside this repo** – all HTTP calls go to that external backend.

---

## 2. Auth and identity

- **Token:** JWT in `localStorage` under `aip_doctor_token`. Used for both doctor and admin; backend decides role from token payload.
- **User/session:** `aip_doctor_user` and `aip_doctor_session` hold current user (email, role, doctorId, practiceId, roleInPractice). Admin also uses `aip_admin_session`.
- **Resolution:** `getActorFromSession()` (in `permissionService`) returns:
  - `{ kind: 'admin', email }` if admin session exists,
  - else `{ kind: 'doctor', doctorId, email?, practiceId?, roleInPractice? }` if doctor session/user exists,
  - else `{ kind: 'public' }`.
- **DoctorId source:** Prefer `aip_doctor_user` / session; if missing, resolve from email using **static** `@/data/doctors` (so permissionService still depends on seed data for email→doctor lookup when API hasn’t set doctorId).
- **Helpers:** `assertDoctor(actor)`, `assertPracticeAdmin(actor)`, `assertAdmin(actor)` throw `AuthRequiredError` / `PermissionDeniedError`; dashboard layouts redirect to `/join-us` or dashboard home on error.

---

## 3. Data: API vs local

### API (source of truth where used)

- **Clients live in** `src/lib/api/`: `config.ts` (getToken, apiClient), `auth.ts`, `doctors.ts`, `practices.ts`, `approval-requests.ts`, `referrals.ts`, `messages.ts`, `notifications.ts`, `membership-plans.ts`, `departments.ts`, `join-requests.ts`, `admin-stats.ts`, `events.ts`, `policies.ts`, `community`, etc.
- **Doctors:** `getAllDoctorsArray(token?)`, `getDoctors(filters?, token?)`, `getDoctor(id)`, `getDoctorBySlug(slug)`, `updateDoctor(id, data, token)`, `deleteDoctor(id, token)`. Responses are normalized to camelCase (e.g. `plan_id` → present on raw object; `normalizeDoctorFromAPI` spreads `...raw` so planId/plan_id/membership_plan_id can be read from doctor).
- **Practices:** `getAllPractices`, `getPractice(id)`, `updatePractice(id, data, token)`, etc.
- **Token:** `getToken()` from `@/lib/api/config` reads `aip_doctor_token`; pass to any call that needs auth. Optional for public endpoints (e.g. doctor list for directory).

### Local / hybrid (intentional or legacy)

- **memberStorage:** `getAllDoctors()` is **deprecated** – it just calls `getAllDoctorsArray()`. Still used in a few places; preferred is calling `getAllDoctorsArray(getToken())` directly. `saveDoctorOverride` / `getDoctorOverrides` / `getDeletedDoctorIds` remain for **create-doctor flow** (no `POST /api/doctors` yet) and soft-delete list.
- **permissionService:** Uses `@/data/doctors` for email→doctor resolution when session has no doctorId (legacy/static fallback).
- **membershipStorage:** `loadMembership(doctorId)` reads `aip_doctor_membership_${doctorId}`. Still used by doctor dashboard **MembershipSection** (upgrade/payment flow). Plan **display** in admin (MemberEditDialog) and doctor (practice doctors list) uses API doctor fields (`planId` / `plan_id` / `membership_plan_id`) + `getMembershipPlans()` API; no `loadMembership` there.
- **approvalStorage / referralStorage / notificationStorage / practiceStorage / etc.:** Local storage for approvals history, referrals, notifications, created practices, etc. **Admin/doctor UIs** that need “current list” of requests or history often call **API** (e.g. `getApprovalRequestsAPI`, `getApprovalHistoryAPI`, `getReferralsAPI`); local storage may still back some flows or legacy paths.
- **Institutions:** `institutionStorage` (getInstitutionBySlug, getInstitutionDoctors) + **institutionSearch** use **API** for doctor list (`getAllDoctorsArray(getToken() ?? undefined)`).

So: **listing/updating doctors and practices, approvals, referrals, messages, announcements, membership plans, etc. are API-driven.** Local storage is for auth, session, overrides (create-doctor, soft-delete), membership payment state, and some legacy/cache.

---

## 4. Approval engine (high level)

- **Role:** Handles approval **request** creation, approval/rejection **decisions**, and **side effects** (who can approve, what gets updated).
- **APIs used:** `getApprovalRequestsAPI`, `getApprovalRequestAPI`, `createApprovalRequest`, `approveRequest`, `rejectRequest`, `getApprovalHistoryAPI`; for validation and side effects: `getAllDoctorsArray(getToken())`, `updateDoctor`, `updatePractice` (from `@/lib/api/doctors` and `@/lib/api/practices`). Practice admin resolution uses API doctor list.
- **What changed (API migration):** Approvals are applied **on the backend** when the frontend calls **approveRequest(requestId)**. The frontend **no longer** calls `saveDoctorOverride` or practice overrides when applying approvals; it uses **updateDoctor** / **updatePractice** for any remaining front-end side effects (if any). So: **no saveDoctorOverride in the approval apply path**; backend is source of truth.
- **Local storage:** Approval **history** and **requests** may still be read/written in `approvalStorage` for legacy or caching; primary source for admin/doctor UIs is the API.

---

## 5. Portals (admin vs doctor)

### Admin (`/admin/*`)

- **Login:** API auth; token stored like doctor.
- **Dashboard:** Stats and join requests from API (`getAdminStats`, `getJoinRequests`).
- **Approvals:** List and detail from API; approve/reject via API; doctor/practice lists from `getAllDoctorsArray(getToken())`, `getAllPractices`; no saveDoctorOverride on approve.
- **Members:** List/edit/delete doctors and practices via API (MembersTable, MemberEditDialog, PracticeRosterSection). Plan display from API doctor + getMembershipPlans.
- **Referrals, messages, announcements, config, events, policies, community, etc.:** API-backed where implemented.
- **Still local:** `adminHelpers.createNewDoctor` uses `saveDoctorOverride` for the “create doctor” step until backend has `POST /api/doctors`.

### Doctor (`/doctor/dashboard/*`)

- **Dashboard:** Overview, links, messages (MessagesSectionAPI), network size (getDoctors with token).
- **History (referral history):** Referrals from referral engine/storage; **doctor name lookup** via `getAllDoctorsArray(getToken())`.
- **Practice history:** Approval history filtered by practice; **doctor list** for selector from `getAllDoctorsArray(getToken())`.
- **Practice doctors:** Roster from `getDoctorsByPractice` (API); **plan** from API doctor (`planId` / `plan_id` / `membership_plan_id`) + `getMembershipPlans()`; no loadMembership.
- **Referrals page:** Referrals and network doctors from API; token passed to `getAllDoctorsArray(getToken())`.
- **Messages:** MessagesSectionAPI + `getAllDoctorsArray(getToken())` for recipient list (MessagesSection).
- **Institution detail/search:** `getAllDoctorsArray(getToken() ?? undefined)` for doctor list.
- **Still local/hybrid:** Practice announcements create (e.g. Firestore/announcementService); MembershipSection upgrade/payment (membershipStorage) until backend supports full flow.

---

## 6. Static export and routing

- **Config:** `output: 'export'`, `trailingSlash: true`, images unoptimized, optional basePath/assetPrefix.
- **Dynamic routes:** Every `[param]` route must export **generateStaticParams()** so the build can generate static paths. Examples:
  - `admin/messages/[otherDoctorId]` → returns `[]` (redirect-only page).
  - `doctors/[slug]`, `institutions/[slug]`, `public-health/articles/[slug]`, etc. → return lists from data or `[]`.
- **Params in Next 15+:** Page and `generateMetadata` receive **params as a Promise**; must **await params** and then use the resolved slug/id (e.g. `const { slug } = await params`).
- **Build failure (unrelated to routing):** Current failure is Turbopack/Next.js font resolution (`@vercel/turbopack-next/internal/font/google/font`); not caused by generateStaticParams or params/async.

---

## 7. Important file roles

| Area | Files |
|------|--------|
| API entrypoint | `src/lib/api/config.ts` (getToken, apiClient), `src/lib/api/doctors.ts`, `practices.ts`, `auth.ts`, … |
| Auth / session | `useDoctorSession.ts`, `adminSession.ts`, `permissionService.ts` |
| Doctor list (prefer API) | `getAllDoctorsArray(getToken())` from `@/lib/api/doctors` |
| Approvals | `approvalEngine.ts`, `api/approval-requests.ts`, `storage/approvalStorage.ts` |
| Local overrides | `memberStorage.ts` (saveDoctorOverride, getDoctorOverrides), `practiceStorage`, etc. |
| Portals audit | `docs/PORTALS_AUDIT.md` |
| Storage keys | `docs/LOCAL_STORAGE_REFERENCE.md`, `storage/keys.ts` |
| Approval vs override | `docs/APPROVAL_ENGINE_AND_SAVE_DOCTOR_OVERRIDE.md` |

---

## 8. Summary

- **App:** Next.js static export; backend is a separate REST API; auth via JWT in localStorage; identity from session + optional static doctors for email→doctorId.
- **Data:** Doctors, practices, approvals, referrals, messages, membership plans, etc. are **API-first**; local storage is for auth, overrides (create-doctor, soft-delete), membership payment state, and legacy/cache.
- **Approvals:** Applied on the backend; frontend uses API for validation and updateDoctor/updatePractice when needed; **no saveDoctorOverride when applying approvals**.
- **Admin:** API for dashboard, approvals, members, referrals, messages, config; only create-doctor still uses saveDoctorOverride until POST doctor exists.
- **Doctor:** API for dashboard, history, practice history, practice doctors (plan from API), referrals, messages, institution search/detail; local only for membership payment and some practice-announcement paths.
- **Static export:** All dynamic routes use generateStaticParams; params are Promise and must be awaited in pages and generateMetadata.

This document reflects the state after the Doctor portal API migration and the approval-engine/override doc; for key names and what was not removed, see `LOCAL_STORAGE_REFERENCE.md` and `APPROVAL_ENGINE_AND_SAVE_DOCTOR_OVERRIDE.md`.
