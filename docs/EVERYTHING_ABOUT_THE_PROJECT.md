# Everything About the Project — Alliance of Independent Physicians (AIP)

This is the single reference for understanding the full project: what it is, how it works, and how it’s deployed.

---

## 1. What It Is

- **Name**: Alliance of Independent Physicians (AIP).
- **Purpose**: Dual-audience platform:
  - **Patients**: Find doctors, view profiles, locations, insurance, contact.
  - **Physicians**: Join the network, manage profile/practice, referrals, messages, membership.
- **Admins**: Approve join requests (new practice or join existing), manage members, policies, announcements.
- **Deployment**: Frontend = static site (e.g. GoDaddy). Backend = REST API on GCP Cloud Run. Data = PostgreSQL on Cloud SQL.

---

## 2. Architecture (One Picture)

```
Browser
   │
   ├── Static site (HTML/JS/CSS from out/)  ← GoDaddy public_html
   │      NEXT_PUBLIC_API_URL points to ↓
   │
   └── fetch(API_URL + /api/..., { headers: { Authorization: Bearer <JWT> } })
            │
            ▼
      Cloud Run (Node/Express)  ← aip-backend
            │
            └── pg Pool (Unix socket) → Cloud SQL PostgreSQL (aip_production)
```

- Frontend has **no server** in production; it’s static files. All dynamic behavior is via API calls from the browser.
- Backend is the **only** thing that talks to the database.

---

## 3. Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | Next.js 16 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui, Lucide. Build: `output: 'export'` → static `out/`. |
| **Backend** | Node 18, Express, TypeScript, `pg`, `jsonwebtoken`, `bcrypt`, CORS. Runs as `node dist/index.js`. |
| **Database** | PostgreSQL (Cloud SQL). DB name: `aip_production`. |
| **Auth** | JWT. Stored in browser: `localStorage` (`aip_doctor_token`, `aip_doctor_user`). |

---

## 4. Repo Structure (What Lives Where)

```
EnsembleDrPage-main/
├── src/                          # Next.js frontend
│   ├── app/                      # Routes (page.tsx per route)
│   │   ├── page.tsx              # Home
│   │   ├── doctors/, doctors/[slug]/   # Directory & profile
│   │   ├── practices/, practices/[slug]/ # Practice directory & profile
│   │   ├── join-us/, join-us/application/, join-us/onboarding/, join-us/submitted/
│   │   ├── doctor/dashboard/     # Doctor dashboard (overview, profile, practice, referrals, etc.)
│   │   ├── admin/                # Admin (requests, members, practices, policies, etc.)
│   │   ├── contact-us/, about/, membership/, patients/, physicians/
│   │   ├── trustee-board/, medical-students/, public-health/
│   │   └── institutions/[slug]/
│   ├── components/               # Shared + feature components
│   │   ├── ui/                   # shadcn
│   │   ├── dashboard/, join-us/, admin/, public/practices/
│   │   └── ...
│   ├── lib/
│   │   ├── api/                  # config.ts, doctors.ts, practices.ts, approval-requests.ts, auth, etc.
│   │   ├── services/             # practiceDirectoryService, permissionService, etc.
│   │   └── storage/              # localStorage helpers
│   └── types/                    # Doctor, Practice, ApprovalRequest, etc.
├── public/                       # Static assets (images, PDFs, videos) → copied to out/
├── aip-backend/                  # Backend API
│   ├── src/
│   │   ├── index.ts              # Express app, PORT, mount /api/* routes
│   │   ├── routes/               # auth, doctors, practices, approval-requests, membership-plans, ...
│   │   ├── middleware/           # auth (JWT), cors
│   │   └── db/                   # connection.ts (pg Pool)
│   ├── migrations/001_approval_requests_schema.sql
│   ├── Dockerfile
│   └── deploy-to-gcp.sh
├── next.config.js                # output: 'export', NEXT_PUBLIC_API_URL default
├── build-and-zip-for-godaddy.sh   # Build + zip out/ → aip-frontend-godaddy.zip
├── DEPLOY_FRONTEND_GODADDY.md
├── PROJECT_AND_DEPLOYMENT.md
└── docs/
    ├── PROJECT_AND_DEPLOYMENT_DEEP_DIVE.md
    ├── CLOUD_SQL_MIGRATION.sql    # Reference full schema
    └── ...
```

---

## 5. Main User Flows

### Public (no login)

- **Home** (`/`): Hero, mission, benefits, departments, featured doctors, FAQ.
- **Doctors** (`/doctors`): List + filters; data from API or merged with local.
- **Doctor profile** (`/doctors/[slug]`): Bio, locations, insurance, reviews.
- **Practices** (`/practices`): List + filters; uses `practiceDirectoryService` (getAllPractices → API, then normalized with `ensurePracticeShape`).
- **Practice profile** (`/practices/[slug]`): Practice details.
- **Join Us** (`/join-us`): Sign in / Sign up (API auth).
- **Application** (`/join-us/application`): Multi-step: basic details (including “new practice” vs “join existing practice”), plan, payment, review → `POST /api/approval-requests`.
- **Other**: Contact, About, Membership, Patients, Physicians, Trustee Board, Medical Students, Public Health, Institutions.

### After login (doctor)

- **Dashboard** (`/doctor/dashboard`): Layout loads doctor by `user.doctorId` via `getDoctor(doctorId)`; API returns snake_case, frontend normalizes to camelCase (fullName, practiceId, etc.).
- **Profile, locations, insurance, practice info, referrals, messages, announcements, appointments, membership, history**: All under `/doctor/dashboard/...`. Practice info page uses `getPractice(practiceId)` so newly created practices show.

### Admin

- **Admin** (`/admin`): Requests, members, practices, policies, announcements, etc. Approval list comes from `GET /api/approval-requests` (tiered: admin sees “practice admin required” types only after practice admin approved). Approve/Reject call `POST .../approve` or `.../reject`.

---

## 6. Auth (Detailed)

- **Signup**: `POST /api/auth/signup` → creates `users` with `role='applicant'`, `status='pending'`. No JWT yet.
- **Login**: `POST /api/auth/login` → bcrypt check; if role is `doctor`, backend looks up `doctors.id` by `user_id`; issues JWT `{ userId, role, doctorId }`. Frontend stores token and user in localStorage; all later API calls send `Authorization: Bearer <token>`.
- **Protected routes**: Backend uses `authenticateToken`; frontend uses `useDoctorSession()` and (where needed) `getActorFromSession()` for permission (e.g. doctor vs practice_admin vs admin).
- **No .env on server for frontend**: API URL is baked in at build via `NEXT_PUBLIC_API_URL`.

---

## 7. Approval System (Backend)

- **Tables**: `approval_requests` (id, type, requested_by, practice_id, target_doctor_id, payload, admin_status, practice_admin_status, ...), `approval_history`.
- **Types**: e.g. `new_practice_with_admin_doctor`, `doctor_join_practice`, plus practice_edit, location, insurance/services, add/remove doctor.
- **Create**: `POST /api/approval-requests` with `type`, `practice_id` (if applicable), `payload`. Requires JWT (so applicant must be logged in after signup).
- **Approve**: `POST /api/approval-requests/:id/approve`. Admin sets `admin_status = 'approved'`; practice_admin sets `practice_admin_status = 'approved'`. For types that require both (e.g. `doctor_join_practice`), **tiered**: practice admin must approve first; then admin sees the request and can approve. When both are set, `applyApprovalSideEffects` runs (create practice/doctor/roles/memberships, update user).
- **Who approved**: Response of `GET /api/approval-requests/:id` includes `practice_admin_approved_by` and `practice_admin_approved_at` (from history).
- **Errors**: 500 responses include `detail` with the backend error message for debugging.

---

## 8. Data and API Shape

- **Backend** returns **snake_case** (e.g. `full_name`, `practice_id`, `address_line1`, `city`). **Frontend** types use **camelCase** (e.g. `fullName`, `practiceId`, `address.line1`).
- **Normalization**:
  - **Doctors**: `src/lib/api/doctors.ts` → `normalizeDoctorFromAPI()` in `getDoctor()` so dashboard and profile get fullName, practiceId, etc.
  - **Practices**: `src/lib/services/practiceDirectoryService.ts` → `ensurePracticeShape()` + `ensureLocationsArray()` in `getAllPractices()` so practices always have `address`, `specialties`, `doctorIds`, `insurance`, `services` as arrays/object and don’t throw in filters or cards.
- **Practice single fetch**: `getPractice(id)` in `src/lib/api/practices.ts`; practice-info page normalizes the response (address, slug, description, phone, createdAt, updatedAt) for the `Practice` type.

---

## 9. Environment Variables

| Where | Variable | Purpose |
|-------|----------|---------|
| Frontend (build) | `NEXT_PUBLIC_API_URL` | Backend base URL (default in next.config.js). |
| Frontend (build) | `NEXT_PUBLIC_BASE_PATH` | Optional base path for static export. |
| Backend | `PORT` | Set by Cloud Run. |
| Backend | `DB_SOCKET_PATH` | Unix socket to Cloud SQL (e.g. `/cloudsql/PROJECT:REGION:INSTANCE`). |
| Backend | `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Cloud SQL. |
| Backend | `JWT_SECRET`, `JWT_EXPIRES_IN` | JWT signing. |
| Backend | `FRONTEND_URL`, `FRONTEND_URL_WWW` | CORS allowed origins. |
| Backend (local) | `DB_HOST`, `DB_PORT` | Optional TCP to DB. |

---

## 10. Deployment (Summary)

| Component | How |
|-----------|-----|
| **Frontend** | 1) Set `NEXT_PUBLIC_API_URL` in `.env.local` if needed. 2) `npm run build` (or `./build-and-zip-for-godaddy.sh` / `npm run deploy:godaddy`). 3) Upload contents of `out/` (or `aip-frontend-godaddy.zip` extracted) to web root (e.g. GoDaddy `public_html`). |
| **Backend** | `cd aip-backend && ./deploy-to-gcp.sh` (or manual `gcloud builds submit` + `gcloud run deploy` with same env and Cloud SQL instance). |
| **DB** | Run migrations (e.g. `001_approval_requests_schema.sql`) against Cloud SQL when schema changes. No app deploy needed for SQL only. |

---

## 11. Key Files (Quick Reference)

| Concern | File(s) |
|--------|--------|
| API base URL, token | `src/lib/api/config.ts` |
| Session (getToken, getUser, setToken) | `src/lib/useDoctorSession.ts` |
| Doctor fetch + normalize | `src/lib/api/doctors.ts` |
| Practice fetch | `src/lib/api/practices.ts` |
| Approval API (frontend) | `src/lib/api/approval-requests.ts` |
| Practice list + search/filters (safe shape) | `src/lib/services/practiceDirectoryService.ts` |
| Permission / actor from session | `src/lib/services/permissionService.ts` |
| Backend entry + routes | `aip-backend/src/index.ts` |
| Backend auth (JWT) | `aip-backend/src/middleware/auth.ts` |
| Backend DB connection | `aip-backend/src/db/connection.ts` |
| Approval + side effects + tiered logic | `aip-backend/src/routes/approval-requests.ts` |
| Login/signup | `aip-backend/src/routes/auth.ts` |
| Approval migration | `aip-backend/migrations/001_approval_requests_schema.sql` |
| Full DB schema reference | `docs/CLOUD_SQL_MIGRATION.sql` |
| Backend deploy | `aip-backend/deploy-to-gcp.sh` |
| Frontend build + zip | `build-and-zip-for-godaddy.sh` |
| Frontend deploy steps | `DEPLOY_FRONTEND_GODADDY.md`, `docs/PROJECT_AND_DEPLOYMENT_DEEP_DIVE.md` |

---

## 12. Docs That Exist

- **docs/EVERYTHING_ABOUT_THE_PROJECT.md** (this file) — single “understand everything” reference.
- **docs/PROJECT_AND_DEPLOYMENT_DEEP_DIVE.md** — architecture, frontend/backend/DB, deployment, env, flows.
- **PROJECT_AND_DEPLOYMENT.md** — short deployment and “what to deploy when” reference.
- **PROJECT_UNDERSTANDING.md** — feature list and static-export era overview (some overlap with above).
- **DEPLOY_FRONTEND_GODADDY.md** — step-by-step GoDaddy deploy and .env.
- **README.md**, **DEPLOYMENT_INSTRUCTIONS.md** — high-level and GoDaddy package.
- **docs/APPROVAL_SETUP_FILES_AND_SCHEMA.md**, **docs/APPROVAL_FLOW_DEEP_DIVE.md** — approval flows and schema.

Use **this document** for a full picture; use the others for deployment steps or approval/schema detail.
