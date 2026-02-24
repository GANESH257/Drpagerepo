# Complete Project Understanding — Alliance of Independent Physicians (AIP)

**Last Updated**: January 29, 2026  
**Purpose**: Single source of truth for the entire project, deployment, and recent work.

---

## 1. Executive Summary

| Aspect | Details |
|--------|---------|
| **Project** | Alliance of Independent Physicians (AIP) — Physician network & patient directory |
| **Audiences** | Patients (find doctors), Physicians (join network, dashboard), Admins (approve, manage) |
| **Frontend** | Next.js 16, TypeScript, Tailwind, shadcn/ui — **Static export** → GoDaddy cPanel |
| **Backend** | Node 18, Express, PostgreSQL — **Cloud Run** (GCP) |
| **Database** | Cloud SQL PostgreSQL — **aipdr-488018** project, instance `aip-database` |
| **Auth** | JWT (localStorage: `aip_doctor_token`, `aip_doctor_user`) |

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BROWSER                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         │ HTTPS (static HTML/JS/CSS)
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  FRONTEND (Static Site)                                                      │
│  • Host: GoDaddy cPanel (public_html)                                        │
│  • Build: npm run build → /out folder                                        │
│  • No server; all API calls from browser via fetch()                         │
│  • API URL: NEXT_PUBLIC_API_URL (baked in at build)                          │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         │ fetch(API_URL + /api/..., Authorization: Bearer <JWT>)
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  BACKEND (Node/Express)                                                      │
│  • Host: Google Cloud Run (us-central1)                                      │
│  • URL: https://aip-backend-682175235100.us-central1.run.app                  │
│  • Connects to DB via Unix socket (Cloud SQL Proxy)                          │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         │ pg Pool (DB_SOCKET_PATH)
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  DATABASE (PostgreSQL)                                                       │
│  • Cloud SQL: aip-database (IP 34.133.206.33)                               │
│  • DB name: postgres (new GCP) or aip_production (legacy)                     │
│  • 42+ tables: users, practices, doctors, approval_requests, etc.             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tech Stack

### Frontend
- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5.5.0
- **Styling**: Tailwind CSS 3.4.4, shadcn/ui, Lucide React
- **Charts**: Recharts
- **Build**: `output: 'export'` → static HTML in `/out`
- **Port**: 3001 (dev), 3000 (alt)

### Backend (aip-backend/)
- **Runtime**: Node 18
- **Framework**: Express
- **DB**: pg (PostgreSQL)
- **Auth**: jsonwebtoken, bcrypt
- **CORS**: FRONTEND_URL, FRONTEND_URL_WWW
- **Port**: 8080 (Cloud Run sets PORT)

### Database
- **Engine**: PostgreSQL (Cloud SQL)
- **Setup**: `docs/CLOUD_SQL_FULL_FRESH_SETUP.sql` (42 tables, seed data)
- **Admin password**: `docs/SET_ADMIN_PASSWORD.sql` (admin@aip.com / Admin@12345)

---

## 4. Project Structure

```
EnsembleDrPage-main/
├── src/                          # Next.js frontend
│   ├── app/                      # Routes (95 page.tsx files)
│   │   ├── page.tsx              # Home
│   │   ├── doctors/, doctors/[slug]/
│   │   ├── practices/, practices/[slug]/
│   │   ├── join-us/, join-us/application/, join-us/submitted/, join-us/onboarding/
│   │   ├── doctor/dashboard/     # Doctor portal (20+ sub-routes)
│   │   ├── admin/                # Admin portal (30+ sub-routes)
│   │   ├── patients/, physicians/
│   │   ├── contact-us/, about/, membership/
│   │   ├── trustee-board/, medical-students/, public-health/
│   │   └── homedark/, newhome/, homenew/
│   ├── components/
│   │   ├── ui/                   # shadcn
│   │   ├── dashboard/, admin/, join-us/, newhome/, home/
│   │   └── ...
│   ├── lib/
│   │   ├── api/                  # config, auth, doctors, practices, approval-requests, etc.
│   │   ├── services/            # permissionService, practiceDirectoryService, approvalEngine
│   │   └── storage/
│   └── types/
├── public/                       # Static assets
├── aip-backend/                  # Backend API
│   ├── src/
│   │   ├── index.ts              # Express app, routes
│   │   ├── routes/               # auth, doctors, practices, approval-requests, etc.
│   │   ├── middleware/           # auth (JWT), cors
│   │   └── db/connection.ts
│   ├── migrations/
│   ├── Dockerfile
│   └── deploy-to-gcp.sh
├── docs/                         # 97+ documentation files
├── next.config.js
└── package.json
```

---

## 5. Key Routes & Features

### Public Routes
| Route | Purpose |
|-------|---------|
| `/` | Homepage (hero, mission, departments, featured doctors) |
| `/homedark` | Dark mode homepage |
| `/doctors` | Doctor directory (filters, search) |
| `/doctors/[slug]` | Doctor profile |
| `/practices` | Practice directory |
| `/practices/[slug]` | Practice profile |
| `/join-us` | Sign in / Sign up |
| `/join-us/application` | Multi-step application (new practice or join existing) |
| `/join-us/submitted` | Post-submission confirmation |
| `/patients`, `/physicians` | Audience-specific landing pages |
| `/membership`, `/contact-us`, `/about` | Info pages |
| `/trustee-board`, `/medical-students`, `/public-health` | Resources |

### Doctor Dashboard (Protected)
- Overview, Profile, Locations, Insurance
- Practice (profile, locations, doctors, approvals, services-insurance)
- Referrals, Appointments, Messages, Announcements
- Community, Membership, Settings, Find Physician

### Admin Portal (Protected)
- Requests (approval workflow)
- Members (doctors, practices)
- Policies, Events, Announcements
- Community, Reports, Config

---

## 6. Authentication Flow

1. **Signup**: `POST /api/auth/signup` → creates `users` (role=applicant, status=pending)
2. **Login**: `POST /api/auth/login` → bcrypt verify → JWT `{ userId, role, doctorId }`
3. **Storage**: `localStorage`: `aip_doctor_token`, `aip_doctor_user`, `aip_doctor_session` (legacy)
4. **API calls**: `Authorization: Bearer <token>`
5. **Session hook**: `useDoctorSession()` in `src/lib/useDoctorSession.ts`

### Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@aip.com | Admin@12345 |
| Doctor (demo) | doctor@aip.com | AIP@12345 |

---

## 7. Approval System (Join Flow)

### Types
- `new_practice_with_admin_doctor` — Admin only
- `doctor_join_practice` — Practice Admin first, then Admin (tiered)

### Flow
1. Applicant signs up → user (applicant)
2. Applicant submits application → `POST /api/approval-requests`
3. Admin (or Practice Admin) approves → `POST /api/approval-requests/:id/approve`
4. Backend runs `applyApprovalSideEffects`: creates practice, doctor, practice_roles, memberships, updates user
5. User logs in → JWT with doctorId → dashboard access

### Key Backend Files
- `aip-backend/src/routes/approval-requests.ts` — approve, reject, apply-side-effects
- `aip-backend/src/routes/auth.ts` — login, signup

---

## 8. Environment Variables

### Frontend (build time)
| Variable | Purpose |
|----------|----------|
| NEXT_PUBLIC_API_URL | Backend base URL (default: aip-backend-112180822704...) |
| NEXT_PUBLIC_BASE_PATH | Optional base path |

### Backend
| Variable | Purpose |
|----------|----------|
| PORT | Set by Cloud Run (8080) |
| DB_SOCKET_PATH | Unix socket (Cloud Run) |
| DB_HOST, DB_PORT | TCP (local dev) |
| DB_NAME | postgres (new) or aip_production |
| DB_USER, DB_PASSWORD | Cloud SQL credentials |
| JWT_SECRET, JWT_EXPIRES_IN | JWT signing |
| FRONTEND_URL, FRONTEND_URL_WWW | CORS origins |

---

## 9. Deployment Processes

### A. Frontend (GoDaddy cPanel)

1. Set `NEXT_PUBLIC_API_URL` in `.env.local` (or build env)
2. `npm run build` → generates `/out`
3. Upload **entire contents of `/out`** to `public_html/`
4. Optional: `npm run deploy:godaddy` or `./build-and-zip-for-godaddy.sh` → zip for upload

**Key**: API URL is baked in at build. Rebuild and re-upload when backend URL changes.

### B. Backend (Cloud Run) — New GCP Project

**Project**: `aipdr-488018`  
**Instance**: `aip-database` (34.133.206.33)  
**Connection**: `aipdr-488018:us-central1:aip-database`

**From Cloud Shell** (see `docs/DEPLOY_FROM_CLOUD_SHELL.md`):

1. Zip backend (exclude node_modules, .env):  
   `zip -r aip-backend.zip aip-backend -x "aip-backend/node_modules/*" -x "aip-backend/.env"`
2. Upload zip to Cloud Shell
3. `unzip -o aip-backend.zip && cd aip-backend`
4. Build: `gcloud builds submit --tag us-central1-docker.pkg.dev/aipdr-488018/aip-backend/aip-backend:latest .`
5. Deploy with env vars (DB_SOCKET_PATH, DB_NAME=postgres, DB_USER, DB_PASSWORD, JWT_SECRET, FRONTEND_URL, etc.)
6. Get URL: `gcloud run services describe aip-backend --region us-central1 --format="value(status.url)"`
7. Update frontend `.env.local`: `NEXT_PUBLIC_API_URL=<Cloud Run URL>`
8. Rebuild frontend

### C. Database (Cloud SQL)

1. Run `docs/CLOUD_SQL_FULL_FRESH_SETUP.sql` on new instance
2. Run `docs/SET_ADMIN_PASSWORD.sql` to set admin hash (bcrypt for Admin@12345)
3. **Important**: Hash must start with `$2b$10$` — do not strip leading `$`

### D. Verify Admin Login

```bash
cd aip-backend
node verify-admin.js
```

---

## 10. Recent Work & Fixes

### Membership Approvals Page (Jan 29, 2026)
- **View link fix**: Changed from dynamic route `/admin/approvals/[id]` to query param `/admin/approvals/detail?id=xxx` to fix static export error
- **New page**: `admin/approvals/detail/page.tsx` reads `id` from searchParams
- **Removed**: `admin/approvals/[id]/page.tsx` (dynamic route incompatible with static export)
- **Table enhancements**: Added Applicant Name, Practice/Institution, Email columns (from payload.doctor, payload.practice)

### Membership Plans Seed (Jan 29, 2026)
- **Added** to `CLOUD_SQL_FULL_FRESH_SETUP.sql`: Basic, Professional, Premier plans so join flow works out of the box

### Admin Login Fix (Jan 29, 2026)
- **Issue**: "Invalid credentials" for admin@aip.com
- **Cause**: Stored bcrypt hash was malformed (missing leading `$`)
- **Fix**: Updated hash in DB via `docs/SET_ADMIN_PASSWORD.sql`; created `verify-admin.js`

### Session Changes (Jan 28, 2026)
- Mission statement update
- Dark mode toggle (light `/`, dark `/homedark`)
- Removed reviews from home, patients, physicians pages
- Deployment zip created

### Approval & Backend Fixes (Prior)
- Approval persistence (single UPDATE, no overwrite)
- Side effects in one transaction
- `getActorFromSession()` trusts session for doctorId (API-created doctors)
- Null-safe doctor UI (locations, insurance, etc.)

---

## 11. Key File Reference

| Concern | File(s) |
|---------|---------|
| API config | `src/lib/api/config.ts` |
| Session | `src/lib/useDoctorSession.ts` |
| Doctor fetch | `src/lib/api/doctors.ts` |
| Approval API | `src/lib/api/approval-requests.ts` |
| Permission | `src/lib/services/permissionService.ts` |
| Backend entry | `aip-backend/src/index.ts` |
| Backend auth | `aip-backend/src/routes/auth.ts` |
| Backend approval | `aip-backend/src/routes/approval-requests.ts` |
| DB connection | `aip-backend/src/db/connection.ts` |
| Full DB schema | `docs/CLOUD_SQL_FULL_FRESH_SETUP.sql` |
| Admin password | `docs/SET_ADMIN_PASSWORD.sql` |
| Deploy backend | `docs/DEPLOY_FROM_CLOUD_SHELL.md` |
| Deploy frontend | `DEPLOYMENT_INSTRUCTIONS.md`, `docs/DEPLOY_GODADDY.md` |

---

## 12. Data Conventions

- **Backend**: Returns snake_case (`full_name`, `practice_id`)
- **Frontend**: Uses camelCase (`fullName`, `practiceId`)
- **Normalization**: `normalizeDoctorFromAPI()` in doctors.ts, `ensurePracticeShape()` in practiceDirectoryService

---

## 13. Documentation Index

- **Overview**: `EVERYTHING_ABOUT_THE_PROJECT.md`, `PROJECT_AND_DEPLOYMENT_DEEP_DIVE.md`
- **Deployment**: `DEPLOY_FROM_CLOUD_SHELL.md`, `NEW_GCP_DEPLOYMENT_CHECKLIST.md`
- **Approval**: `JOIN_FLOWS_STEP_BY_STEP.md`, `FULL_SYSTEM_UNDERSTANDING.md`
- **Features**: `COMPLETE_FEATURES_DOCUMENTATION.md`, `HIERARCHY_AND_APPROVAL_PROCESSES.md`
- **Index**: `docs/DOCUMENTATION_INDEX.md`

---

*This document consolidates project understanding, deployment processes, and recent work. Use it as the starting point for any development or deployment task.*
