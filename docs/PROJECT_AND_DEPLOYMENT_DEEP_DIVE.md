# Project & Deployment — Complete Deep Dive

This document describes the **Alliance of Independent Physicians (AIP)** system: frontend, backend, database, and how each is deployed.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  USER BROWSER                                                            │
└─────────────────────────────────────────────────────────────────────────┘
         │
         │ HTTPS
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  FRONTEND (Static site)                                                  │
│  • Host: GoDaddy cPanel (or any static host)                            │
│  • Content: Next.js static export → /out → public_html                  │
│  • No server process; all API calls from browser                        │
└─────────────────────────────────────────────────────────────────────────┘
         │
         │ fetch() with Authorization: Bearer <JWT>
         │ Base URL: NEXT_PUBLIC_API_URL
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  BACKEND (Node/Express API)                                             │
│  • Host: Google Cloud Run (us-central1)                                 │
│  • URL: https://aip-backend-112180822704.us-central1.run.app            │
│  • Auth: JWT in Authorization header; validates with JWT_SECRET          │
└─────────────────────────────────────────────────────────────────────────┘
         │
         │ pg Pool (Unix socket in Cloud Run)
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  DATABASE (PostgreSQL)                                                  │
│  • Host: Google Cloud SQL (same GCP project)                             │
│  • DB name: aip_production                                              │
│  • Connection from Cloud Run: Unix socket via Cloud SQL Proxy            │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Frontend** and **backend** are separate deployments. The frontend only needs the backend URL at build time.
- **Database** is not directly exposed; only the backend connects to it.

---

## 2. Frontend (Next.js)

### 2.1 Role and Stack

- **Purpose**: Public site (home, doctor directory, join-us, public health, etc.) and post-login experiences: doctor dashboard, admin dashboard.
- **Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui. **Static export** (`output: 'export'` in `next.config.js`).

### 2.2 Build and Output

- **Build**: `npm run build` → generates the **`out/`** directory (static HTML, JS, CSS, assets).
- **No Node server in production**: No `next start` in production; the host serves files from `out/` as plain static files.
- **Env at build time**: `NEXT_PUBLIC_*` variables are inlined at build. The important one is **`NEXT_PUBLIC_API_URL`** (backend base URL). Default in code: `https://aip-backend-112180822704.us-central1.run.app`.

### 2.3 How the Frontend Talks to the Backend

- **API client**: `src/lib/api/config.ts` defines `API_BASE_URL` from `process.env.NEXT_PUBLIC_API_URL` and exports `getToken()` (reads `localStorage.getItem('aip_doctor_token')`).
- **Calls**: All API modules (`src/lib/api/*.ts`) use this client and pass the token for protected routes: `apiClient.get/post/put(..., token)`.
- **Auth flow**: User signs up → backend creates `users` row (role `applicant`, status `pending`). User logs in → backend returns JWT + user object. Frontend stores token in `localStorage` (`aip_doctor_token`) and user in `aip_doctor_user`. Session hook: `src/lib/useDoctorSession.ts` (getToken, getUser, isAuthenticated, setToken, clearSession, etc.).
- **JWT payload** (from backend): `{ userId, role, doctorId }`. Used for dashboard (load doctor by `doctorId`), admin (role), and permission checks.

### 2.4 Frontend Deployment (GoDaddy / Static Host)

1. Set backend URL (e.g. in `.env.local`):  
   `NEXT_PUBLIC_API_URL=https://aip-backend-112180822704.us-central1.run.app`
2. Build: `npm run build`
3. Upload **entire contents of `out/`** to the web root (e.g. `public_html/`) via cPanel File Manager or FTP. Keep structure (e.g. `index.html` at root, `_next/`, `doctors/`, etc.).
4. Optional: run `./create-deployment.sh` to produce `deployment.zip` from `out/` for upload.

No server-side env at runtime; the built JS already contains the API URL.

---

## 3. Backend (Node/Express — aip-backend)

### 3.1 Role and Stack

- **Purpose**: REST API for auth, doctors, practices, approval requests, membership plans, referrals, appointments, messages, notifications, policies, events.
- **Stack**: Node 18, Express, TypeScript, `pg` (PostgreSQL), `jsonwebtoken`, `bcrypt`, CORS. Built with `tsc`; runs as `node dist/index.js`.

### 3.2 Entry and Routing

- **Entry**: `aip-backend/src/index.ts`. Reads `PORT` from env (Cloud Run sets it; default 8080). Listens on `0.0.0.0:PORT`.
- **Routes** (all under `/api/*`):
  - `/api/auth` — login, signup
  - `/api/doctors` — list, get by id, update
  - `/api/practices` — list, get by id
  - `/api/approval-requests` — list, get, create, approve, reject, apply-side-effects
  - `/api/membership-plans`, `/api/join-requests`, `/api/referrals`, `/api/appointments`, `/api/messages`, `/api/notifications`, `/api/policies`, `/api/events`, `/api/departments`
- **Middleware**: `cors(corsOptions)` (allow FRONTEND_URL, localhost:3001), `express.json()`, and for protected routes **`authenticateToken`** (reads `Authorization: Bearer <token>`, verifies JWT with `JWT_SECRET`, sets `req.userId`, `req.userRole`, `req.doctorId`).

### 3.3 Auth (Backend)

- **Login** (`POST /api/auth/login`): Look up `users` by email, compare password with `bcrypt`, block only if status is `suspended` or `deleted`. If role is `doctor`, look up `doctors.id` by `user_id`. Issue JWT with `userId`, `role`, `doctorId`. Return `{ token, user: { id, email, role, doctorId } }`.
- **Signup** (`POST /api/auth/signup`): Insert `users` with `role='applicant'`, `status='pending'`, bcrypt-hashed password.
- **JWT**: Signed with `JWT_SECRET`; expiry from `JWT_EXPIRES_IN` (default `7d`). No refresh token; frontend keeps using the same token until expiry or logout.

### 3.4 Database Connection (Backend)

- **File**: `aip-backend/src/db/connection.ts`. Uses `pg.Pool`.
- **Cloud Run**: If `DB_SOCKET_PATH` is set (e.g. `/cloudsql/PROJECT:REGION:INSTANCE`), connects via **Unix socket** (Cloud SQL Proxy). Env: `DB_SOCKET_PATH`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
- **Local**: Otherwise TCP to `DB_HOST` (default `35.225.60.9`), `DB_PORT` (5432), `DB_NAME`, `DB_USER`, `DB_PASSWORD`, with SSL for non-localhost.
- **Database name**: `aip_production` (or `DB_NAME`).

### 3.5 Backend Deployment (GCP Cloud Run)

**Option A — Script (recommended)**

- From repo root: `cd aip-backend && ./deploy-to-gcp.sh`
- Script:
  1. Resolves Cloud SQL instance and connection name.
  2. Prompts for: Cloud SQL password, JWT secret (min 32 chars), frontend URL.
  3. Builds image: `gcloud builds submit --tag gcr.io/aip-backend-112180822704/aip-backend:latest`
  4. Deploys to Cloud Run with:
     - `--add-cloudsql-instances <CONNECTION_NAME>` (so the container can use the socket)
     - Env: `DB_SOCKET_PATH=/cloudsql/<CONNECTION_NAME>`, `DB_NAME=aip_production`, `DB_USER=postgres`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRES_IN=7d`, `FRONTEND_URL`, `FRONTEND_URL_WWW`, `NODE_ENV=production`
     - Memory/CPU/timeout/max-instances as in the script

**Option B — Manual**

- Build image from `aip-backend/`:  
  `gcloud builds submit --tag gcr.io/aip-backend-112180822704/aip-backend:latest --project=aip-backend-112180822704`
- Deploy:  
  `gcloud run deploy aip-backend --image gcr.io/... --region us-central1 --add-cloudsql-instances <CONNECTION_NAME> --set-env-vars "DB_SOCKET_PATH=...,DB_NAME=aip_production,..."`  
  (same env as in the script).

**Container**: Built from `aip-backend/Dockerfile`: Node 18 Alpine, `npm ci`, `npm run build`, `npm prune --production`, `CMD ["node", "dist/index.js"]`, port 8080.

---

## 4. Database (Cloud SQL PostgreSQL)

### 4.1 Role

- Single source of truth for users, doctors, practices, approval requests, memberships, referrals, appointments, messages, notifications, policies, events, etc.
- Only the backend connects to it (never the browser).

### 4.2 Schema (Conceptual)

- **Base tables** (from reference schema in `docs/CLOUD_SQL_MIGRATION.sql`; your DB may have been created from this or a variant):
  - **users**: id, email, password_hash, role (admin/doctor/applicant/public), status (active/pending/suspended/deleted), timestamps.
  - **practices**: id, slug, name, description, contact, address (address_line1/2, city, state, zip, country), status, timestamps.
  - **doctors**: id, user_id, practice_id, slug, first_name, last_name, full_name, credentials, specialty, email, phone, verified, etc.
  - **membership_plans**: id, name, monthly_price, annual_price, etc.
- **Approval-related** (created or ensured by `aip-backend/migrations/001_approval_requests_schema.sql`):
  - **approval_requests**: id, type, requested_by, requested_by_type, practice_id, target_doctor_id, payload (JSONB), admin_status, practice_admin_status, notes, reviewed_at, rejection_reason, created_at, updated_at.
  - **approval_history**: id, approval_request_id, action, performed_by, performed_by_type, notes, created_at.
  - **practice_roles**: links practice_id, doctor_id, role (e.g. practice_admin, doctor).
  - **practice_locations**, **practice_services**, **practice_insurance**, **practice_specialties** (per practice).
- **memberships**: doctor_id, practice_id, plan_id, billing_cycle, status, start_date, expiry_date, etc.
- **Referrals, appointments, messages, notifications, policies, events** tables exist per the full migration.

The migration `001_approval_requests_schema.sql` **assumes** `practices` and `doctors` (and usually `users`) already exist. It creates or alters approval-related tables and adds missing columns.

### 4.3 How the Backend Reaches the DB

- **Cloud Run**: Container gets `DB_SOCKET_PATH=/cloudsql/PROJECT:REGION:INSTANCE`. Cloud Run automatically provides the Cloud SQL Proxy socket at that path. `pg` connects with `host: process.env.DB_SOCKET_PATH`, no port, and the rest from env.
- **Local**: Backend uses TCP to the DB host (e.g. Cloud SQL public IP or a dev instance) with `DB_HOST`, `DB_PORT`, `DB_PASSWORD`, and SSL as configured in `connection.ts`.

### 4.4 Running Migrations

- **One-time / updates**: Connect to Cloud SQL (e.g. `gcloud sql connect INSTANCE_NAME --user=postgres`), then run the migration SQL (e.g. `\i aip-backend/migrations/001_approval_requests_schema.sql` from the correct working directory, or paste the file contents into Cloud SQL Studio).
- **Script**: `aip-backend/run-migration.sh` uses `gcloud sql connect` and runs the migration from the `aip-backend` directory. Requires `gcloud` and psql in path.

---

## 5. End-to-End Data Flows (Summary)

### 5.1 Join (New Practice)

1. User signs up → `POST /api/auth/signup` → `users` row (applicant, pending).
2. User completes application (basic details, plan, payment) → frontend calls `POST /api/approval-requests` with type `new_practice_with_admin_doctor` and payload (practice, doctor, plan, payment). Backend inserts `approval_requests` row; `requested_by` = user id from JWT.
3. Admin approves → `POST /api/approval-requests/:id/approve` → backend sets `admin_status = 'approved'`, then runs `applyApprovalSideEffects`: in one transaction creates practice, practice_locations, doctor, practice_roles, memberships, and updates user (role=doctor, status=active).
4. User logs in again → backend returns JWT with `doctorId`; frontend loads doctor and dashboard.

### 5.2 Join (Existing Practice)

1. Same signup/login start. User selects “Join an existing practice” and a practice from the list (from `GET /api/practices`).
2. Frontend submits `POST /api/approval-requests` with type `doctor_join_practice`, `practice_id`, and payload (practiceId, doctor details, plan, payment).
3. **Tiered approval**: Practice Admin approves first → `practice_admin_status = 'approved'`. Then Admin sees the request and approves → `admin_status = 'approved'`. When both are set, side effects run: create doctor linked to existing practice, practice_roles, memberships, update user.

### 5.3 Doctor Dashboard and Name

1. Frontend (dashboard layout) loads doctor: `getDoctor(doctorId, token)` → `GET /api/doctors/:id`. Backend returns row with snake_case (e.g. full_name, first_name, last_name, practice_id).
2. Frontend normalizes in `src/lib/api/doctors.ts` (`normalizeDoctorFromAPI`) to camelCase (fullName, firstName, lastName, practiceId) so the UI and Edit Profile show the name and practice correctly.

---

## 6. Environment Variables Summary

| Where        | Variable                  | Purpose |
|-------------|---------------------------|--------|
| Frontend    | NEXT_PUBLIC_API_URL       | Backend base URL (build time). |
| Frontend    | NEXT_PUBLIC_BASE_PATH     | Optional base path for static export. |
| Backend     | PORT                      | Set by Cloud Run; default 8080. |
| Backend     | DB_SOCKET_PATH            | Unix socket path in Cloud Run (/cloudsql/...). |
| Backend     | DB_NAME                   | e.g. aip_production. |
| Backend     | DB_USER                   | e.g. postgres. |
| Backend     | DB_PASSWORD               | Cloud SQL password. |
| Backend     | JWT_SECRET                | Sign/verify JWTs. |
| Backend     | JWT_EXPIRES_IN            | e.g. 7d. |
| Backend     | FRONTEND_URL / FRONTEND_URL_WWW | Allowed CORS origins. |
| Backend (local) | DB_HOST, DB_PORT       | Optional for TCP connection to DB. |

---

## 7. What to Deploy When

| Change | Action |
|--------|--------|
| Frontend (Next.js app, `src/`, `next.config.js`, env) | Rebuild (`npm run build`), re-upload `out/` (or deployment package). |
| Backend (anything in `aip-backend/`) | Rebuild image and redeploy Cloud Run (e.g. `./deploy-to-gcp.sh`). |
| DB schema / migrations | Run SQL against Cloud SQL (no app redeploy). |

---

## 8. Key File Reference

| Concern | Files |
|--------|--------|
| Frontend API base & token | `src/lib/api/config.ts` |
| Frontend session | `src/lib/useDoctorSession.ts` |
| Doctor load & normalize | `src/lib/api/doctors.ts` |
| Approval API (frontend) | `src/lib/api/approval-requests.ts` |
| Backend entry & routes | `aip-backend/src/index.ts` |
| Backend auth middleware | `aip-backend/src/middleware/auth.ts` |
| Backend DB connection | `aip-backend/src/db/connection.ts` |
| Backend approval logic | `aip-backend/src/routes/approval-requests.ts` |
| Backend auth (login/signup) | `aip-backend/src/routes/auth.ts` |
| Approval migration | `aip-backend/migrations/001_approval_requests_schema.sql` |
| Full reference schema | `docs/CLOUD_SQL_MIGRATION.sql` |
| Backend deploy script | `aip-backend/deploy-to-gcp.sh` |
| Frontend static deploy | `create-deployment.sh`, `DEPLOYMENT_INSTRUCTIONS.md`, `docs/DEPLOY_GODADDY.md` |

This gives you a complete picture of the project and how frontend, backend, and DB are deployed and wired together.
