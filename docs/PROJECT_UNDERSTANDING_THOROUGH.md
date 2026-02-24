# Project Understanding — Thorough Reference

**Purpose:** Single, thorough reference for the Alliance of Independent Physicians (AIP) codebase. Use this for onboarding, refactors, or resuming work.

**Last updated:** January 2026

---

## 1. Project Identity

| Item | Description |
|------|-------------|
| **Name** | Alliance of Independent Physicians (AIP) |
| **What it is** | Physician network + patient directory: doctors join practices, manage profiles, get approved; patients find doctors and view profiles. |
| **Audiences** | (1) **Patients** – find doctors, view profiles, insurance, locations. (2) **Physicians** – join network, dashboard (profile, practice, referrals, community, messages), approvals. (3) **Admins** – approve requests, manage members, content, policies. |
| **Repo** | Next.js frontend (this repo) + **aip-backend** (Node/Express, same repo under `aip-backend/`). |
| **Deployment** | Frontend: **static export** (`output: 'export'`) → e.g. GoDaddy `public_html` or any static host. Backend: **GCP Cloud Run**; DB: **PostgreSQL** (Cloud SQL). |

---

## 2. Tech Stack

### Frontend (this repo)
- **Next.js 16** (App Router), **React 18**, **TypeScript 5**
- **Tailwind CSS 3**, **shadcn/ui** (Radix), **Lucide** icons
- **Static export** only: no API routes, no server components at runtime, no `getServerSideProps`-style dynamic server data
- **Env:** `NEXT_PUBLIC_API_URL` (backend), optional `NEXT_PUBLIC_BASE_PATH`

### Backend (aip-backend)
- **Node + Express**, TypeScript, **PostgreSQL** (Cloud SQL)
- **Auth:** JWT (`aip_doctor_token` / admin equivalent); middleware in `middleware/auth.ts`
- **Uploads:** Local disk or **GCS** when `UPLOAD_STORAGE=gcs` and `GCS_BUCKET` set

### Data & auth (frontend)
- **Hybrid data:** Static seed in `src/data/` (e.g. `doctors.ts`, `departments.ts`) **plus** API for live data (doctors, practices, approval-requests, join-requests, referrals, community, etc.)
- **Doctor auth:** `localStorage`: `aip_doctor_token`, `aip_doctor_session`, `aip_doctor_user` (session + user from API)
- **Admin auth:** `localStorage`: `aip_admin_session`
- **API client:** `src/lib/api/config.ts` – `apiClient`, `getToken()`; base URL from `NEXT_PUBLIC_API_URL`

---

## 3. Architecture in One Picture

```
┌─────────────────────────────────────────────────────────────────┐
│  Next.js App (static export)                                    │
│  - All routes pre-rendered at build (generateStaticParams)      │
│  - Client-side nav, client-side API calls                        │
│  - Doctor/Admin session from localStorage                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS (NEXT_PUBLIC_API_URL)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  aip-backend (Cloud Run)                                         │
│  - REST API: /api/doctors, practices, approval-requests,        │
│    join-requests, auth, upload, community, referrals, etc.       │
│  - JWT auth; PostgreSQL (Cloud SQL)                             │
│  - Uploads: local or GCS                                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  PostgreSQL (Cloud SQL)                                          │
│  - users, doctors, practices, practice_locations, approval_      │
│    requests, approval_history, memberships, referrals, etc.     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Routes (App Router)

### Public
- `/` – Homepage (hero, mission, departments, featured doctors, etc.)
- `/doctors` – Directory (filters: specialty, location, insurance, etc.; URL-synced)
- `/doctors/[slug]` – Doctor profile (static params from `src/data/doctors`; fallback `getDoctorBySlug(slug)` from API)
- `/doctors/profile` – Profile by query (e.g. `?id=...`) for API-only doctors
- `/join-us`, `/join-us/application`, `/join-us/onboarding`, `/join-us/submitted`, `/join-us/invitation/[invitationId]`
- `/practices` – Find practices
- `/practices/view` – Single practice (query `?slug=...` or `?id=...`; no dynamic segment)
- `/physicians`, `/patients` – Audience-specific landing pages
- `/membership` – Membership info
- `/public-health`, `/public-health/articles`, `/public-health/articles/[slug]`
- `/medical-students`, `/medical-students/articles/[slug]`
- `/trustee-board`, `/trustee-board/announcements`, `/trustee-board/announcements/[slug]`
- `/contact-us`, `/about`
- `/homedark`, `/newhome`, `/homenew`, `/homedemo` – Alternate home variants

### Doctor dashboard (protected by layout; redirect to `/join-us` if not doctor)
- `/doctor/dashboard` – Overview
- `/doctor/dashboard/profile` – Edit profile (approval flow for profile edits)
- `/doctor/dashboard/locations` – Manage locations
- `/doctor/dashboard/insurance` – Insurance & conditions/services
- `/doctor/dashboard/practice` – My practice (profile, locations, roster, approvals, etc.)
- `/doctor/dashboard/practice/locations`, `/practice/doctors`, `/practice/approvals`, `/practice/history`, etc.
- `/doctor/dashboard/referrals` – Sent/received referrals
- `/doctor/dashboard/history` – Referral/activity history
- `/doctor/dashboard/messages` – Messages (conversation via `?otherDoctorId=...`; no dynamic segment)
- `/doctor/dashboard/community` – Community Q&A (sections, search, posts)
- `/doctor/dashboard/community/announcements`, `/community/leadership`
- `/doctor/dashboard/appointments`, `/notifications`, `/announcements`, `/membership`, `/settings`, `/complete-profile`, etc.

### Admin (protected by layout)
- `/admin`, `/admin/login`
- `/admin/requests-v2`, `/admin/requests-v2/[id]` – Approval queue (main admin workflow)
- `/admin/members`, `/admin/members/doctors`, `/admin/members/practices`
- `/admin/community`, `/admin/community/forum`, `/admin/messages`, `/admin/announcements`, `/admin/events`, `/admin/policies`, `/admin/referrals`, `/admin/reports`, etc.
- `/admin/config/settings`, `/admin/config/plans`, `/admin/config/medical-data`
- `/admin/content/*` – Leadership, policies, events, announcements

### Static export rules
- Every **dynamic segment** must be covered by **generateStaticParams** (or the route must not be used at build). Examples:
  - `/doctors/[slug]` → params from `doctors` in `src/data/doctors`
  - `/public-health/articles/[slug]` → from `publicHealthArticles`
  - `/admin/requests-v2/[id]` → `[{ id: 'placeholder' }]` (detail loads by id client-side)
  - `/doctor/dashboard/messages` – no `[otherDoctorId]`; conversation is `?otherDoctorId=...` to avoid generating one path per doctor

---

## 5. Roles & Permissions

| Role | Session / storage | Who can approve | Notes |
|------|-------------------|------------------|--------|
| **Admin** | `aip_admin_session` | All approval types | Full access; `getAdminSession()`, `assertAdmin()` |
| **Practice Admin** | `aip_doctor_session` + practice role | Requests for their practice only | `roleInPractice === 'practice_admin'`; `canApproveAsPracticeAdmin()` |
| **Doctor** | `aip_doctor_session` | None | Own profile, referrals, messages, community |
| **Applicant** | Join flow only | — | Pending approval; no dashboard |
| **Public** | — | — | Browse doctors, join-us, public pages |

**Key files:** `src/lib/services/permissionService.ts` (getActorFromSession, assertDoctor, assertAdmin, canApproveAsPracticeAdmin), `src/lib/adminSession.ts`, `src/lib/useDoctorSession.ts`.

---

## 6. Approval System (Deep)

- **Single queue:** table `approval_requests`; many **types** (e.g. `new_practice_with_admin_doctor`, `doctor_join_practice`, `practice_admin_profile_edit`, `doctor_profile_edit`, `practice_admin_practice_profile_edit`, `practice_admin_practice_locations_edit`, `doctor_insurance_edit`, …).
- **Statuses:** Admin: `admin_status` (e.g. pending/approved/rejected); Practice admin: `practice_admin_status` where applicable.
- **Flow:** Create request → Admin (and optionally Practice Admin) approve → **Side effects** run (create practice/doctor, update user role, apply profile/location/insurance edits). Approval row is source of truth; side effects are best-effort (repair endpoint exists).
- **Frontend:** Create via `createApprovalRequest()`; list/detail via `getApprovalRequests()`, `getApprovalRequestById()`; approve via `approveRequest()`. UI: `src/app/admin/requests-v2/`, `src/components/shared/approvals/` (RequestedChangesRenderer with per-type views, e.g. DoctorProfileCompletionView with **images** for profile/certs/badges).
- **Pending badges:** Shown where a pending request exists for the current context; refetch on `visibilitychange` so tab focus sees latest state.

**Docs:** `docs/APPROVAL_FLOW_DEEP_DIVE.md`, `docs/HIERARCHY_AND_APPROVAL_PROCESSES.md`, `docs/PRACTICE_PROFILE_AND_LOCATIONS_APPROVAL_IMPLEMENTATION.md`.

---

## 7. Data Flow (Doctors & Practices)

- **Doctor profile page:** `src/app/doctors/[slug]/page.tsx` – first tries `doctors` from `src/data/doctors` by slug; if not found, calls `getDoctorBySlug(slug)` (API). Renders `DoctorProfile` with that doctor.
- **Practices:** Listed via API/practice directory service; single view at `/practices/view?slug=...` or `?id=...`. No `/practices/[slug]` dynamic route.
- **Dashboard doctor:** Layout loads doctor by `doctorId` from session via `getDoctor(doctorId, token)` and stores in context; profile/locations/insurance/practice pages use that or fetch as needed.
- **Images:** Profile, practice logo, certs, badges – stored as path or full URL in DB. Frontend: `getUploadFullUrl()` in `src/lib/api/upload.ts` (path → API base + path; full URL unchanged). Next: `images.remotePatterns` for `storage.googleapis.com`. Backend upload: `aip-backend/src/routes/upload.ts` (local or GCS; no object ACL with uniform bucket).

---

## 8. Key Frontend Files (by area)

| Area | Files |
|------|--------|
| **Layout / shell** | `src/app/layout.tsx`, `TopBar`, `Header`, `Footer`, `FloatingCTA`, `FloatingMessageIcon` |
| **Doctor directory** | `src/app/doctors/page.tsx`, `DoctorCard`, `DoctorFilters`, `src/data/doctors.ts`, `src/data/departments.ts` |
| **Doctor profile** | `src/app/doctors/[slug]/page.tsx`, `DoctorProfile.tsx`, `getDoctorBySlug` in `src/lib/api/doctors.ts` |
| **Join / auth** | `src/app/join-us/*`, `SignInForm`, `SignUpForm`, `src/lib/api/auth.ts`, `useDoctorSession` |
| **Doctor dashboard** | `src/app/doctor/dashboard/layout.tsx`, `DashboardLayout`, `CompleteProfileGate`, pages under `doctor/dashboard/` |
| **Profile edit** | `EditProfileSection.tsx`, approval flow for profile; `InsuranceSection` for insurance |
| **Practice** | `src/app/doctor/dashboard/practice/page.tsx`, locations, roster, approvals; `practiceDirectoryService`, `practiceStorage` |
| **Approvals (admin)** | `src/app/admin/requests-v2/page.tsx`, `requests-v2/[id]/page.tsx`, `RequestedChangesRenderer.tsx`, `ApprovalTypeBadge`, `approval-requests.ts` API |
| **Messages** | `src/app/doctor/dashboard/messages/page.tsx` (query `otherDoctorId`), `MessagesSectionWrapper`, `MessagesSection`, `messageStorage` |
| **Community** | `src/app/doctor/dashboard/community/page.tsx`, `CommunityView.tsx`, `src/lib/api/community.ts` |
| **Referrals** | `src/app/doctor/dashboard/referrals/page.tsx`, `src/app/doctor/dashboard/history/page.tsx`, `src/types/referrals.ts`, `ReferralStatus`: considering \| accepted \| no_show \| cancelled |
| **API / config** | `src/lib/api/config.ts`, `upload.ts` (getUploadFullUrl), per-domain API files under `src/lib/api/` |
| **Permissions** | `src/lib/services/permissionService.ts`, `adminSession.ts`, `useDoctorSession.ts` |
| **Types** | `src/types/index.ts` (Doctor, Location, etc.), `src/types/approvals.ts`, `src/types/referrals.ts`, `src/types/practice.ts` |

---

## 9. Backend (aip-backend) — High Level

- **Entry:** `src/index.ts` – Express app, CORS, auth middleware, routes mounted under `/api/...`.
- **Routes:** doctors, practices, approval-requests, join-requests, auth, upload, departments, referrals, community, committees, announcements, events, policies, messages, notifications, appointments, membership-plans, admin-*, condition-treatments, etc.
- **DB:** `db/connection.ts`; migrations/schema live elsewhere (e.g. Cloud SQL). Tables include users, doctors, practices, practice_locations, approval_requests, approval_history, memberships, referrals.
- **Upload:** `routes/upload.ts` – if GCS configured, upload to bucket and return public URL; else local `UPLOAD_DIR` and return path.
- **Deploy:** Backend built and deployed to Cloud Run; env (e.g. `GCS_BUCKET`, `UPLOAD_STORAGE`, DB URL) set in Cloud Run. Frontend points to backend via `NEXT_PUBLIC_API_URL`.

---

## 10. Static Export Constraints

- **No** `getServerSideProps`, **no** runtime API routes in Next.js, **no** `dynamic = 'force-dynamic'` that would break export.
- **All dynamic routes** must be pre-rendered via `generateStaticParams`.
- **Client-side only** where needed: auth, API calls, localStorage, routing with query params for “infinite” ids (e.g. messages `?otherDoctorId=`, profile by `?id=`).
- **Images:** `unoptimized: true`; remote images from allowed domains (e.g. `storage.googleapis.com`) via `remotePatterns`.

---

## 11. Scripts & Commands

- `npm run dev` – Next.js dev (port 3001, Turbopack default)
- `npm run dev:webpack` – Dev with Webpack (avoids some Turbopack chunk issues)
- `npm run build` – Production static export → `out/`
- `npm run start` – Serve `out/` (for local prod check)
- `npm run lint` – ESLint

---

## 12. Recent Session Context (Summary)

- **Approval screen images:** DoctorProfileCompletionView in RequestedChangesRenderer shows profile image, board cert images, and badge images (fallback and main diff view); uses `approvalImageUrl` / `getUploadFullUrl`.
- **Request Appointment:** Removed from doctor profile; “Book Directly” and messaging remain.
- **Messages:** Conversation is `?otherDoctorId=...` on a single static page; no `/messages/[otherDoctorId]` to satisfy static export.
- **Community:** Redesigned with header, section sidebar/dropdown, search (client-side), and post list; optional dynamic import for CommunityView to avoid Turbopack ChunkLoadError.
- **History page:** Referral status filter and badge map use `ReferralStatus`: considering, accepted, no_show, cancelled (not new/attended/removed).

---

*Use this document as the single thorough reference for the project. For approval internals, GCS, or deployment, see the other docs in `docs/`.*
