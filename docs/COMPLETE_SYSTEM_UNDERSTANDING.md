# Complete System Understanding – Alliance of Independent Physicians

Single reference to understand the project **deeply and thoroughly**: product, auth, data, portals, backend, deployment, and key behaviors.

---

## 1. Product and architecture

| Aspect | Detail |
|--------|--------|
| **Product** | Physician network + patient-facing doctor directory (dual audience: physicians and patients). |
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind, shadcn/ui. **Static export** (`output: 'export'`). No server at runtime. |
| **Backend** | Separate REST API (e.g. GCP Cloud Run). Base URL: `NEXT_PUBLIC_API_URL`. No API routes in this repo. |
| **Deployment** | `npm run build` → `/out`; deploy to GoDaddy cPanel or any static host. Backend deployed separately (e.g. Cloud Run). |

---

## 2. Authentication – who logs in where

### Two login entry points

| Where | Route | Who it’s for | What happens on success |
|-------|--------|--------------|--------------------------|
| **Join Us** | `/join-us` (SignInForm) | **Doctors and applicants only.** Admins are **rejected** here. | Token + user stored; redirect to `/doctor/dashboard` (if doctor with doctorId) or show “membership approved” message (applicant). |
| **Admin login** | `/admin/login` | **Admins only.** | Token + user stored; **setAdminSession(email)**; redirect to `/admin`. |

### Backend

- **Single endpoint:** `POST /api/auth/login` (email + password). Backend looks up `users`, verifies password, returns `{ token, user: { id, email, role, doctorId? } }`. Role is `doctor`, `admin`, or `applicant` (etc.); `doctorId` only when `role === 'doctor'`.

### Join Us form (doctor login)

- Calls `login(email, password)`.
- **If API returns `role === 'admin'`:** Does **not** store token or redirect. Shows error: **“Please use the Admin login page to sign in as an administrator.”** Admin cannot log in from Join Us.
- If `role === 'doctor'` and `doctorId`: `setToken(token, user)` → redirect `/doctor/dashboard`.
- If applicant or other: show “Access is available after your membership is approved…”; token is still stored (for approval flows) but no dashboard redirect.

### Admin login page

- Calls `login(email, password)`; then sets `aip_doctor_token`, `aip_doctor_user`, and **setAdminSession(email)** (`aip_admin_session`). Redirect to `/admin`.

### How the app knows “who is who”

- **getActorFromSession()** (permissionService):  
  - If `getAdminSession()` (aip_admin_session) exists → `{ kind: 'admin' }`.  
  - Else if `aip_doctor_user` / `aip_doctor_session` with `role === 'doctor'` and doctorId → `{ kind: 'doctor', doctorId, practiceId?, roleInPractice? }`.  
  - Else → `{ kind: 'public' }`.
- **Admin layout** uses `isAdminAuthenticated()` (= `getAdminSession() !== null`). So admin **must** have logged in via `/admin/login` (where setAdminSession is called). Join Us never sets admin session and now rejects admin.

---

## 3. Data: API vs local

### API as source of truth (primary)

- **Doctors:** `getAllDoctorsArray(token?)`, `getDoctors()`, `getDoctor(id)`, `getDoctorBySlug(slug)`, `updateDoctor()`, `deleteDoctor()` – `@/lib/api/doctors`. Token from `getToken()` (`aip_doctor_token`).
- **Practices:** `getAllPractices`, `getPractice`, `updatePractice`, invitations – `@/lib/api/practices`.
- **Approvals, referrals, messages, notifications, membership-plans, announcements, events, policies, join-requests, admin-stats, community, committees, leadership** – respective files in `src/lib/api/`.
- **Plan display:** Admin (MemberEditDialog) and doctor (practice doctors list) use API doctor fields `planId` / `plan_id` / `membership_plan_id` plus `getMembershipPlans()` API. No `loadMembership` for display.

### Local / hybrid (intentional)

- **Auth/session:** `aip_doctor_token`, `aip_doctor_user`, `aip_doctor_session`, `aip_admin_session` – see `docs/LOCAL_STORAGE_REFERENCE.md`.
- **createNewDoctor (admin):** Still uses `saveDoctorOverride` until backend has `POST /api/doctors`. Practice update uses API.
- **MembershipSection (doctor):** Upgrade/payment flow uses `membershipStorage` until backend supports it; plan list from API.
- **permissionService:** Uses `@/data/doctors` for email→doctorId when session has no doctorId (fallback).
- **Approvals:** Applied on **backend** when frontend calls approve API; frontend uses `updateDoctor` / `updatePractice` for any side effects; **no saveDoctorOverride** when applying approvals.

---

## 4. Portals (admin vs doctor)

### Admin (`/admin/*`)

- **Login:** `/admin/login` only; sets token + **setAdminSession**. Join Us does not allow admin.
- **Data:** Dashboard, approvals, members, referrals, messages, announcements, config, events, policies, community, charts – API-backed. MemberEditDialog and doctors-per-plan chart use API for plan. Approval engine uses API only (no saveDoctorOverride on approve).

### Doctor (`/doctor/dashboard/*`)

- **Login:** Join Us only (admin is rejected there).
- **Data:** Dashboard, history, practice history, practice doctors (plan from API), referrals, messages, institution search/detail – API-backed. MembershipSection payment flow still local until backend supports it.

---

## 5. Backend and database (GCP)

### SQL to run (in order)

- **006_doctors_insurance.sql** – Add `insurance` JSONB to `doctors`.
- **007_referrals.sql** – Create `referrals` table.
- **008_board_of_directors.sql** – Create `board_of_directors` and `board_directors` (for `/api/leadership/board`). Required for Leadership page.
- **009_doctors_plan_id.sql** (optional) – Add `plan_id` to doctors for Membership badge; or backend can JOIN `memberships` when returning doctors.

Fresh DB: run `docs/CLOUD_SQL_FULL_FRESH_SETUP.sql` then **008**.

### Backend routes that must be deployed

- All in `aip-backend/src/routes/` and mounted in `src/index.ts`: auth, doctors, practices, departments, membership-plans, approval-requests, join-requests, referrals, appointments, **messages**, notifications, policies, events, community, committees, **leadership**, announcements, admin/community, admin/settings, insurance-providers, specialties, conditions, treatments, condition-treatments, upload.
- **leadership:** `GET /api/leadership/board` – requires **008** and `src/routes/leadership.ts` + mount in `index.ts`.
- **messages:** **GET /api/messages/threads** must return each thread with **`participants`** array `[{ id, full_name }]` (other participants only). Otherwise Messages UI shows “Unknown” and otherDoctorId matching fails. Current (uncommitted) `messages.ts` implements this.

### Uncommitted backend changes to deploy

- **`aip-backend/src/index.ts`** – Mount `/api/leadership` (leadershipRoutes).
- **`aip-backend/src/routes/messages.ts`** – GET /threads returns `participants`; explicit GROUP BY.
- **`aip-backend/src/routes/leadership.ts`** – New file; GET /board.

See **docs/GCP_BACKEND_AND_DATABASE_CHECKLIST.md** for full checklist.

---

## 6. Static export and routing

- **Dynamic routes** need **generateStaticParams()** (can return `[]` for redirect-only routes like `admin/messages/[otherDoctorId]`).
- **Params in Next 15+:** `params` is a **Promise**; pages and **generateMetadata** must **await params** (e.g. `const { slug } = await params`).
- **Build:** Current failure is Turbopack/font resolution, not routing.

---

## 7. Important behaviors (summary)

| Topic | Behavior |
|-------|----------|
| **Admin on Join Us** | Rejected. Message: “Please use the Admin login page to sign in as an administrator.” No token stored, no redirect. |
| **Doctor on Admin login** | Allowed by API; if role is doctor, token/user stored but **setAdminSession** is still called with that email – so they’d be treated as admin by layout. (Admin login page does not currently reject non-admin; could be tightened.) |
| **Approvals** | Backend applies state on approve; frontend uses updateDoctor/updatePractice only; no saveDoctorOverride. |
| **Messages** | Backend GET /threads must include `participants` per thread for UI to work. |
| **Plan display** | From API doctor (`planId`/`plan_id`/`membership_plan_id`) + getMembershipPlans(); no loadMembership in admin or practice doctors list. |

---

## 8. Steps (procedures)

### Deploy frontend (static)

1. Set env if needed: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_BASE_PATH`.
2. Run `npm run build`.
3. Upload contents of `/out` to your static host (e.g. GoDaddy `public_html`). Use trailing slashes; set file/dir permissions (644/755).

### Deploy backend (GCP Cloud Run)

1. **Database:** Run migrations 006, 007, 008 (and optionally 009) on Cloud SQL in order; for fresh DB run `CLOUD_SQL_FULL_FRESH_SETUP.sql` then 008.
2. **Code:** Ensure `aip-backend/src/index.ts` mounts `/api/leadership`; `src/routes/leadership.ts` exists; `src/routes/messages.ts` returns `participants` on GET /threads.
3. Build and deploy (e.g. `./deploy-to-gcp.sh` or Cloud Build). Set env: `DB_*`, `JWT_SECRET`, `FRONTEND_URL`, `GCS_BUCKET` (if used).
4. Point frontend `NEXT_PUBLIC_API_URL` to the Cloud Run service URL.

### Doctor login (Join Us)

1. User goes to `/join-us`, enters email and password in SignInForm.
2. Frontend calls `POST /api/auth/login`. Backend returns `{ token, user: { role, doctorId? } }`.
3. If `role === 'admin'`: show “Please use the Admin login page…”; **stop** (no token stored, no redirect).
4. If `role === 'doctor'` and `doctorId`: store token and user (`setToken`), redirect to `/doctor/dashboard`.
5. If applicant/other: show “Access after membership approved…” (token may still be stored for approval flows).

### Admin login

1. User goes to `/admin/login`, enters email and password.
2. Frontend calls `POST /api/auth/login`. Backend returns `{ token, user }`.
3. Frontend stores token and user in `aip_doctor_token` and `aip_doctor_user`, and calls **setAdminSession(email)** so `aip_admin_session` is set.
4. Redirect to `/admin`. Layout sees `getAdminSession() !== null` and allows access.

### Apply an approval (admin or practice admin)

1. Load requests from API (`getApprovalRequestsAPI`). User approves a request (e.g. “doctor join practice”).
2. Frontend calls **approveRequest(requestId)** (API). Backend updates DB (doctor, practice, etc.).
3. Frontend does **not** call saveDoctorOverride or practice overrides. Any extra updates use **updateDoctor** / **updatePractice** (API).

---

## 9. Documentation index

| Doc | Purpose |
|-----|--------|
| **COMPLETE_SYSTEM_UNDERSTANDING.md** (this file) | Single place to understand the system deeply and thoroughly. |
| **DEEP_UNDERSTANDING.md** | Architecture, data, auth, approvals, static export (shorter). |
| **PORTALS_AUDIT.md** | What is API vs local in admin and doctor portals. |
| **LOCAL_STORAGE_REFERENCE.md** | All localStorage/sessionStorage keys and purpose. |
| **APPROVAL_ENGINE_AND_SAVE_DOCTOR_OVERRIDE.md** | Why saveDoctorOverride is not used when applying approvals. |
| **GCP_BACKEND_AND_DATABASE_CHECKLIST.md** | SQL to run, backend files, messages/leadership requirements, uncommitted changes. |
| **CHANGES_SINCE_LAST_COMMIT.md** | What the last commit did and what changed after (uncommitted). |

---

*Last updated to include: admin rejected on Join Us; messages participants requirement; leadership and uncommitted backend; GCP checklist; steps (deploy, login, approvals).*
