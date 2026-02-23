# AIP Portal – Complete Project Understanding

This document is the **single reference** for the Alliance of Independent Physicians (AIP) portal. It covers:

- **Admin portal** – all pages, features, and APIs
- **Doctor portal** – all pages, features, and APIs
- **Practice Admin** – role, pages (nested under doctor dashboard), and APIs
- **Database** – all tables and purpose
- **Workflows** – join, approvals, referrals, community, messages
- **Approval system** – types, two-level (PA then Admin), side effects
- **APIs** – every backend route and purpose

---

## Verification checklist (what this doc covers)

| Area | Included |
|------|----------|
| Admin portal pages and nav | Yes – Dashboard, Approval Requests, Memberships, Policies, Events, Members, Practices, Referrals, Community, Messages, Notifications, Announcements |
| Doctor portal pages and nav | Yes – Overview, Profile, Practice Info, Locations, Insurance, Appointments, Referrals, Community, Announcements, Messages, Membership |
| Practice Admin pages and nav | Yes – Practice, Approvals, Doctors, Locations, Services & Insurance, Membership, History, Create Announcement |
| All database tables | Yes – users, admins, practices, doctors, practice_roles, practice_locations, practice_specialties, practice_services, practice_insurance, membership_plans, memberships, approval_requests, approval_history, referrals, notifications, appointment_requests, practice_invitations, message_threads, messages, thread_participants, departments, community_posts, community_comments, org_policies, global_medical_events |
| Workflows | Yes – Join (new/existing), practice edit, location/insurance/roster, referrals, community, messages |
| Approval system | Yes – types, creators, PA then Admin flow, side effects per type, reject, history |
| All API routes | Yes – auth, doctors, practices, departments, membership-plans, approval-requests, join-requests, referrals, appointments, messages, notifications, policies, events, community |

---

## 1. Portal overview

| Portal | Entry | Auth | Who |
|--------|--------|------|-----|
| **Admin** | `/admin` (login at `/admin/login`) | `adminSession` (separate from doctor); `assertAdmin(actor)` | Users with `users.role = 'admin'` (linked via `admins` table) |
| **Doctor** | `/doctor/dashboard` (auth via `/join-us`) | `useDoctorSession()` + JWT; `user.role === 'doctor'` and `doctors.user_id` set | Users with `users.role = 'doctor'` and approved doctor record |
| **Practice Admin** | Same doctor dashboard; **extra nav** when `doctor.roleInPractice === 'practice_admin'` | Same as Doctor; pages under `/doctor/dashboard/practice/*` use `assertPracticeAdmin(actor)` | Doctors with `practice_roles.role = 'practice_admin'` for their practice |

There is **no separate “Practice Admin” app or URL**. Practice admin is a **role inside the doctor dashboard**, with additional sidebar items and pages.

---

## 2. Admin portal – pages and features

- **Layout:** `src/app/admin/layout.tsx` – redirects unauthenticated to `/admin/login`; wraps in `AdminShell`.
- **Nav:** `AdminSidebar.tsx` and `AdminMobileSidebar.tsx`.

| Route | Purpose | Main data/APIs |
|-------|---------|----------------|
| `/admin` | Dashboard: stats, charts | Stats cards, charts (doctors per plan/department/month, growth, request status); data from API or local |
| `/admin/requests-v2` | Approval requests list (all types) | GET/POST/PUT `/api/approval-requests`; approve/reject |
| `/admin/requests-v2/[id]` | Single approval request detail | GET `/api/approval-requests/:id`; approve/reject; `ApprovalRequestDetailClient` |
| `/admin/history/approvals` | Approval history (admin only) | GET `/api/approval-requests/admin/history` |
| `/admin/memberships` | Membership plans CRUD | GET/POST/PUT/DELETE `/api/membership-plans`; `PlansEditor` |
| `/admin/policies` | Org policies CRUD | GET/POST/PUT/DELETE `/api/policies` |
| `/admin/events` | Events CRUD | GET/POST/PUT/DELETE `/api/events` |
| `/admin/members` | Doctor members list/edit | Doctors API + `MembersTable`, `CreateDoctorDialog`, `MemberEditDialog` |
| `/admin/practices` | Practices and locations | GET `/api/practices`; `PracticesTable`, `CreatePracticeDialog`, `PracticeEditDialog`, `PracticeRosterSection` |
| `/admin/referrals` | All referrals | GET `/api/referrals` (admin sees all); `ReferralsTable` |
| `/admin/community` | Community posts (admin view) | GET/POST `/api/community/posts`, comments |
| `/admin/messages` | Admin messaging | GET/POST `/api/messages` (threads, send); `AdminMessagesWrapper` |
| `/admin/notifications` | Notifications list | GET `/api/notifications/admin/all`; `NotificationsTable` |
| `/admin/announcements` | Announcements (and create) | Announcement service/data; create at `/admin/announcements/create` |

Admin login uses a separate session (e.g. admin cookie/localStorage); backend login is the same `/api/auth/login` with an admin user from `users` + `admins`.

---

## 3. Doctor portal – pages and features

- **Layout:** `src/app/doctor/dashboard/layout.tsx` – ensures user is logged in as doctor and loads doctor via GET `/api/doctors/:id`; wraps in `DashboardLayout`.
- **Nav:** Base nav in `DashboardLayout` (`baseDoctorNavItems`). If `doctor.roleInPractice === 'practice_admin'`, **practice admin nav** is appended (`practiceAdminNavItems`).

### Base doctor nav (all doctors)

| Route | Purpose | Main data/APIs |
|-------|---------|----------------|
| `/doctor/dashboard` | Overview | Doctor, referrals, appointments, stats |
| `/doctor/dashboard/profile` | Edit profile | GET/PUT `/api/doctors/:id`; `EditProfileSection` |
| `/doctor/dashboard/practice-info` | View practice (read-only) | Practice + locations from API |
| `/doctor/dashboard/locations` | Manage locations | Practice locations (may create approval requests for changes) |
| `/doctor/dashboard/insurance` | Insurance & services | Practice insurance/services (view; edit may go through approvals) |
| `/doctor/dashboard/appointments` | Appointment requests | GET/PUT `/api/appointments` |
| `/doctor/dashboard/referrals` | Referrals (in/out) | GET `/api/referrals` (filtered by doctor) |
| `/doctor/dashboard/community` | Community | GET/POST `/api/community` (posts, comments) |
| `/doctor/dashboard/announcements` | Announcements | Announcement service |
| `/doctor/dashboard/messages` | Messages | GET/POST `/api/messages` (threads, send) |
| `/doctor/dashboard/membership` | Membership | Membership plans / status |

### Practice Admin–only nav (same app, extra items)

| Route | Purpose | Main data/APIs |
|-------|---------|----------------|
| `/doctor/dashboard/practice` | Edit practice details | Practice API; submit `practice_edit_request` via approval-requests |
| `/doctor/dashboard/practice/approvals` | PA approval queue | GET `/api/approval-requests` (filtered by practice); approve/reject as PA |
| `/doctor/dashboard/practice/approvals/[id]` | PA approval detail | GET `/api/approval-requests/:id`; `PracticeAdminApprovalDetailClient` |
| `/doctor/dashboard/practice/doctors` | Practice roster | Practice doctors; add/remove via approval requests |
| `/doctor/dashboard/practice/locations` | Practice locations | Add/edit/remove locations via approval requests |
| `/doctor/dashboard/practice/services-insurance` | Services & insurance | Edit via approval (e.g. `practice_insurance_services_change_request`) |
| `/doctor/dashboard/practice/membership` | Practice membership | Membership overview for practice |
| `/doctor/dashboard/practice/history` | Practice approval history | GET approval-requests for practice |
| `/doctor/dashboard/practice/announcements/create` | Create practice announcement | Announcement create (PA only) |

**Permission:** `src/lib/services/permissionService.ts` – `assertPracticeAdmin(actor)` (actor must be doctor with `roleInPractice === 'practice_admin'` for the practice). Backend uses JWT `role` and `practice_roles` to allow PA actions.

---

## 4. Database tables (GCP Cloud SQL)

Source: `docs/GCP_FULL_SETUP.sql` and `aip-backend/migrations/001_approval_requests_schema.sql`.

| Table | Purpose |
|-------|---------|
| **users** | All logins: id, email, password_hash, role (applicant / doctor / admin), status, email_verified, tokens, last_login_at |
| **admins** | Admin identity: id, user_id → users, name, email |
| **practices** | Practices: id, slug, name, description, phone, email, website, address fields, lat/lng, logo_url, status, verified |
| **doctors** | Doctors: id, user_id, practice_id, slug, name, credentials, specialty, bio, about, profile_image_url, email, phone, website, medical_school, residency, etc., verified, featured, accepts_new_patients |
| **practice_roles** | practice_id, doctor_id, role (doctor / practice_admin); who is PA for which practice |
| **practice_locations** | Locations per practice: id, practice_id, name, address, city, state, zip, phone, hours, is_primary, etc. |
| **practice_specialties** | practice_id, specialty (PK composite) |
| **practice_services** | practice_id, service (PK composite) |
| **practice_insurance** | id, practice_id, name, slug |
| **membership_plans** | Plans: id, name, badge, monthly_price, annual_price, features (JSONB), etc. |
| **memberships** | Per-doctor membership: doctor_id, practice_id, plan_id, plan_name, billing_cycle, amount, status, start_date, expiry_date, payment_method |
| **approval_requests** | **Core approval table:** id, type, requested_by (user id), requested_by_type (applicant / doctor / practice_admin), practice_id, target_doctor_id, payload (JSONB), admin_status, practice_admin_status, admin_notes, practice_admin_notes, admin_reviewed_at, practice_admin_reviewed_at, rejection_reason, rejected_by, created_at, updated_at |
| **approval_history** | Append-only log: approval_request_id, action, performed_by, performed_by_type, actor_id, actor_type, notes, created_at |
| **referrals** | from_doctor_id, to_doctor_id, patient_name_or_initials, condition_summary, notes, status, created_at, attended_at |
| **notifications** | doctor_id, type, title, message, link, read, read_at, created_at |
| **appointment_requests** | doctor_id, patient_name, requested_date/time, reason, insurance, status, declined_note |
| **practice_invitations** | practice_id, invited_by (doctor_id), email, token, status, expires_at, accepted_at |
| **message_threads** | id, type, practice_id, last_message_at |
| **messages** | id, thread_id, sender_id, sender_type, sender_name, content, read, created_at |
| **thread_participants** | thread_id, participant_id, participant_type, last_read_at |
| **departments** | id, name, slug, description (for community sections / specialties) |
| **community_posts** | id, section, author_type, author_id, author_display_name, title, body, created_at, updated_at |
| **community_comments** | id, post_id, author_type, author_id, author_display_name, body, created_at |
| **org_policies** | id, category, title, body |
| **global_medical_events** | id, title, date, location, is_online, description, url |

**Note:** There is **no separate `join_requests` table**. Join requests are **approval_requests** with `type IN ('new_practice_with_admin_doctor', 'doctor_join_practice')`. The `/api/join-requests` routes are a **facade** over `approval_requests`.

---

## 5. Approval system – types and flows

### Approval types (from `src/types/approvals.ts` and backend)

- **Join:** `new_practice_with_admin_doctor`, `doctor_join_practice`
- **Practice:** `practice_edit_request`, `practice_location_add_request`, `practice_location_edit_request`, `practice_location_remove_request`, `practice_location_change_request`, `practice_insurance_services_change_request`
- **Roster:** `practice_doctor_add_request`, `practice_doctor_remove_request`
- **Planned** (see `docs/EDIT_APPROVAL_SYSTEM_PLAN.md`): `doctor_profile_edit_request` (not yet in backend)

### Who can create

- **Join:** Applicant (signup) or doctor (join existing practice) → creates approval_request with payload (doctor, practice, plan).
- **Practice-type and roster:** Practice Admin only (backend checks `userRole === 'practice_admin'` and practice_id).
- **Doctor profile edit (planned):** Doctor or PA for own profile; non-basic fields only; PA self-edit → admin only.

### Two-level approval

- Types in `TYPES_REQUIRING_PRACTICE_ADMIN` in `aip-backend/src/routes/approval-requests.ts` require **Practice Admin** to approve first, then **Admin**.
- Admin list/detail: admin only sees these requests when `practice_admin_status = 'approved'`.
- When **Practice Admin** submits **practice** edits (or own profile edit in plan): backend can set `practice_admin_status = 'approved'` on INSERT so only **Admin** approves (per EDIT_APPROVAL_SYSTEM_PLAN).

### Flow summary

```
Create: User/PA/Doctor → POST /api/approval-requests → approval_requests row

PA-required types:
  approval_requests row → PA approval → practice_admin_status = approved (or reject)
  → Admin sees request → Admin approval → applyApprovalSideEffects (or reject)

Admin-only (e.g. PA-submitted practice edit):
  PA-submitted request (practice_admin_status set on insert) → Admin sees → Admin approval → side effects
```

### Side effects (when both approvals done for PA-required, or single admin for admin-only)

Implemented in `aip-backend/src/routes/approval-requests.ts` in `applyApprovalSideEffects`:

| Type | Side effect |
|------|-------------|
| **new_practice_with_admin_doctor** | Create practice, practice_locations, doctor, practice_roles (practice_admin), memberships; set users.role = 'doctor', status = 'active' |
| **doctor_join_practice** | Attach existing practice to user; create doctor, practice_roles (doctor), memberships; update user |
| **practice_edit_request** | UPDATE practices + practice_services + practice_insurance from payload.after |
| **practice_location_add_request** | INSERT into practice_locations |
| **practice_location_edit_request** | UPDATE practice_locations |
| **practice_location_remove_request** | DELETE from practice_locations (cannot remove last location) |
| **practice_location_change_request** | Replace all practice_locations for practice |
| **practice_insurance_services_change_request** | Replace practice_insurance and practice_services |
| **practice_doctor_add_request** | Set doctors.practice_id, insert practice_roles, sync practice_specialties |
| **practice_doctor_remove_request** | Remove practice_roles, set doctors.practice_id = NULL (guard: cannot remove last PA) |

### Reject and history

- **Reject:** POST `/api/approval-requests/:id/reject` (admin or PA); updates status and writes to approval_history.
- **Admin history:** GET `/api/approval-requests/admin/history` (admin only) for audit.

---

## 6. Workflows (high level)

1. **Join (new practice):** Signup → POST `/api/auth/signup` → user created as applicant → frontend creates approval_request type `new_practice_with_admin_doctor` (doctor + practice + plan in payload) → Admin approves → side effects create practice, doctor, PA role, membership, set user to doctor → doctor can log in and see dashboard.
2. **Join (existing practice):** Invitation or application → approval_request type `doctor_join_practice` with practice_id → PA approves (if required) → Admin approves → side effects attach doctor to practice.
3. **Practice edit:** PA opens `/doctor/dashboard/practice` → submits form → POST approval-requests type `practice_edit_request` (and optionally location/insurance/services types) → Admin approves (or PA first then Admin per current backend) → side effects update practices and related tables.
4. **Location/insurance/services:** PA submits corresponding approval types → same two-step approval and side effects.
5. **Add/remove doctor:** PA submits `practice_doctor_add_request` or `practice_doctor_remove_request` → PA then Admin approve → side effects update practice_roles and doctors.practice_id.
6. **Referrals:** Doctor creates referral (POST `/api/referrals`); admin sees all at `/admin/referrals`; doctors see own at dashboard.
7. **Community:** Posts and comments via `/api/community`; admin and doctors use same API with auth.
8. **Messages:** Threads and messages via `/api/messages`; admin and doctors by role/context.

---

## 7. APIs – summary

Base URL: same origin or `NEXT_PUBLIC_API_URL`. Auth: `Authorization: Bearer <token>` (JWT from `/api/auth/login`).

| Prefix | Methods | Purpose |
|--------|---------|---------|
| **/api/auth** | POST /login, POST /signup | Login returns JWT (userId, role, doctorId); signup creates applicant user |
| **/api/doctors** | GET /, GET /slug/:slug, GET /:id, PUT /:id | List, by slug, by id; update (authenticated) |
| **/api/practices** | GET /, GET /:id | List practices, one practice |
| **/api/departments** | GET / | List departments |
| **/api/membership-plans** | GET /, GET /:id, POST, PUT /:id, DELETE /:id | CRUD (auth; admin in practice) |
| **/api/approval-requests** | GET /, GET /:id, POST /, PUT /:id, POST /:id/approve, POST /:id/reject, POST /:id/apply-side-effects, GET /admin/history | List (role-filtered), get one, create, update payload, approve, reject, re-run side effects (admin), history (admin) |
| **/api/join-requests** | GET /, GET /:id, PUT /:id, POST /:id/approve, POST /:id/reject | Admin facade over approval_requests (join types only) |
| **/api/referrals** | GET /, GET /:id, POST /, PUT /:id | List (doctor-filtered or admin all), get, create, update |
| **/api/appointments** | GET /, GET /:id, POST /, PUT /:id | By doctor; create (e.g. public); update status |
| **/api/messages** | GET /threads, GET /threads/:threadId, POST /threads, POST / | Threads and send message (auth) |
| **/api/notifications** | GET /, PUT /:id/read, PUT /read-all, GET /admin/all | By doctor; mark read; admin list all |
| **/api/policies** | GET /, GET /:id, POST, PUT /:id, DELETE /:id | Org policies CRUD |
| **/api/events** | GET /, GET /:id, POST, PUT /:id, DELETE /:id | Events CRUD |
| **/api/community** | GET /sections, GET /posts, POST /posts, GET /posts/:id, POST /posts/:id/comments | Community sections, posts, comments |

Frontend API clients: `src/lib/api/` (e.g. `approval-requests.ts`, `join-requests.ts`, `doctors.ts`, `practices.ts`, `referrals.ts`, `messages.ts`, `notifications.ts`, `community.ts`, `auth.ts`, `config.ts`).

---

## 8. Portals and roles (diagram)

```
Users (users table): applicant, doctor, admin
  → applicant becomes doctor after approval
  → doctor → Doctor Dashboard (/doctor/dashboard)
  → doctor with roleInPractice = practice_admin → also Practice Admin pages (/doctor/dashboard/practice/*)
  → admin → Admin Portal (/admin)

Admin Portal → approval_requests, doctors, practices, join_requests facade
Practice Admin pages → approval_requests (filtered by practice)
Doctor Dashboard → doctors, practices, referrals, appointments, messages, community
```

---

## 9. Planned vs current (from EDIT_APPROVAL_SYSTEM_PLAN)

- **Current:** Practice edits and roster/location/insurance flows use approval_requests; PA can approve then Admin; join requests are approval_requests; doctor profile **edit is direct PUT** (no approval).
- **Planned:**
  - **Practice/PA-submitted:** When requester is PA, set `practice_admin_status = 'approved'` on INSERT so only Admin approves.
  - **Doctor profile:** Split “basic” (direct PUT) vs “non-basic” (create `doctor_profile_edit_request`); doctor-submitted → PA then Admin; PA self-edit → Admin only; side effect UPDATE doctors for non-basic columns.
  - **No localStorage** for approval or source of truth; all from API/DB.

---

This document is the single reference for admin, doctor, and practice admin portals, tables, workflows, approval system, and APIs.
