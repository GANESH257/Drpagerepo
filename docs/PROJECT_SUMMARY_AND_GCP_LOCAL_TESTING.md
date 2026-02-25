# Project Summary & GCP Deployment / Local Frontend Testing

## Part 1: Project and What We Did (Deep Summary)

### What the project is

- **AIP (Alliance of Independent Physicians)** — physician network and patient directory.
- **Frontend:** This repo — Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui. Doctor directory, join-us flow, doctor dashboard, admin dashboard, public health, trustee board, etc.
- **Backend:** Separate Node/Express API in `aip-backend/` — auth, doctors, practices, approval-requests, membership-plans, referrals, events, policies, etc. Uses PostgreSQL (Cloud SQL in production).
- **How they connect:** Frontend uses `NEXT_PUBLIC_API_URL` (see `src/lib/api/config.ts`). Default in code is a GCP Cloud Run URL; you can override with `.env.local` to point to local backend or another deployed backend.

### What we implemented (Phase 2 — unified pending flow)

After a doctor’s **first** approval (e.g. “new practice with admin doctor” or “doctor join practice”), they have `profile_status === 'pending_profile'` and are not verified. They must complete profile (and for practice admins, practice + locations) and submit **one** approval; only after that do they get full dashboard access.

**Before:** A separate “Complete Profile” gate and page; pending doctors were sent to `/doctor/dashboard/complete-profile`.

**After (what we did):**

1. **Layout** (`src/app/doctor/dashboard/layout.tsx`)  
   - Removed `CompleteProfileGate`.  
   - Every authenticated doctor gets `DashboardLayout` with `PendingRouteGuard` around the dashboard children.

2. **PendingRouteGuard** (`src/components/dashboard/PendingRouteGuard.tsx`)  
   - Pending = `profileStatus === 'pending_profile'` or `verified !== true`.  
   - **Pending practice admin (PA):** only dashboard, profile, practice, practice/locations, settings.  
   - **Pending doctor-only:** only dashboard, profile, settings.  
   - Any other path → redirect to `/doctor/dashboard`.

3. **DashboardLayout** (`src/components/dashboard/DashboardLayout.tsx`)  
   - **Pending PA nav:** Dashboard, Edit Profile, Edit Practice, Account Settings.  
   - **Pending doctor-only nav:** Dashboard, Edit Profile, Account Settings.  
   - Full nav unchanged for verified doctors.

4. **DashboardZones** (`src/components/dashboard/DashboardZones.tsx`)  
   - **Pending PA:** 2-step card (Edit profile → Edit practice) + single “Submit for approval” that sends `practice_admin_profile_practice_completion` (doctor + practice + locations). Uses `src/lib/pendingProfileCompletion.ts` for validation and payload.  
   - **Pending doctor-only:** 1-step card (Edit your profile) + “Submit for approval” that sends `doctor_profile_completion`.  
   - After submit: “Submission received” and `?submitted=1`.

5. **Profile page** (`src/app/doctor/dashboard/profile/page.tsx`)  
   - When pending: one page with EditProfileSection + InsuranceSection.  
   - Non-pending: only EditProfileSection (unchanged).

6. **Practice page** (`src/app/doctor/dashboard/practice/page.tsx`)  
   - When **pending PA:** one page with practice details form + Locations and “Manage locations” → `/doctor/dashboard/practice/locations`. Save calls `updatePractice`.  
   - Non-pending PA: existing behavior (e.g. “Request Edit” dialog) unchanged.

7. **complete-profile** (`src/app/doctor/dashboard/complete-profile/page.tsx`)  
   - If the loaded doctor is pending, redirect to `/doctor/dashboard` so they use the new flow.

8. **CompleteProfileGate**  
   - Removed from layout and **deleted** (`src/components/dashboard/CompleteProfileGate.tsx`).

9. **Helpers** (`src/lib/pendingProfileCompletion.ts`)  
   - Validation and payload builders for profile and practice completion, aligned with the approval payload shape.

So: **all** pending doctors now use the **same dashboard** with a **restricted sidebar** and submit **one** approval from the dashboard; no separate Complete Profile gate or page.

---

## Part 2: Can You Deploy the Backend on GCP?

**Yes.** The backend is designed to run on **GCP Cloud Run** with **Cloud SQL (PostgreSQL)**.

### Steps to deploy backend on GCP

1. **GCP project and Cloud SQL**
   - Create a GCP project (or use existing).
   - Create a Cloud SQL instance (PostgreSQL).
   - Run your schema/migrations (e.g. from `aip-backend/migrations/` and any `CLOUD_SQL_FULL_FRESH_SETUP.sql` or equivalent).
   - Set admin password in DB (see “Set Admin Password” in `docs/NEW_GCP_DEPLOYMENT_CHECKLIST.md`).

2. **Get Cloud SQL connection name**
   ```bash
   gcloud sql instances describe YOUR_INSTANCE_NAME --format="value(connectionName)"
   ```
   Example: `aip-backend-112180822704:us-central1:aip-production`

3. **Build and push Docker image**
   ```bash
   cd aip-backend
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/aip-backend:latest
   ```
   (Replace `YOUR_PROJECT_ID` with your GCP project ID.)

4. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy aip-backend \
     --image gcr.io/YOUR_PROJECT_ID/aip-backend:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --add-cloudsql-instances YOUR_CONNECTION_NAME \
     --set-env-vars "DB_SOCKET_PATH=/cloudsql/YOUR_CONNECTION_NAME" \
     --set-env-vars "DB_NAME=aip_production" \
     --set-env-vars "DB_USER=postgres" \
     --set-env-vars "DB_PASSWORD=YOUR_DB_PASSWORD" \
     --set-env-vars "JWT_SECRET=YOUR_JWT_SECRET_MIN_32_CHARS" \
     --set-env-vars "JWT_EXPIRES_IN=7d" \
     --set-env-vars "FRONTEND_URL=https://your-frontend-domain.com" \
     --set-env-vars "FRONTEND_URL_WWW=https://www.your-frontend-domain.com" \
     --set-env-vars "NODE_ENV=production" \
     --memory 512Mi \
     --cpu 1 \
     --timeout 300 \
     --max-instances 10
   ```

5. **Get service URL**  
   After deploy, note the service URL (e.g. `https://aip-backend-XXXXX.us-central1.run.app`). Use it as the frontend API base (see Part 3).

More detail: `GCP_DEPLOYMENT_AND_TESTING.md` and `docs/NEW_GCP_DEPLOYMENT_CHECKLIST.md`.

---

## Part 3: Can You Test the Frontend Locally “Alone”?

**Yes.** “Alone” here means: **run only the frontend on your machine**. The frontend still needs an API; you have two options:

- **Option A — Backend on GCP:** Run frontend locally and point it at your **deployed** Cloud Run backend. No backend process on your machine.
- **Option B — Backend locally:** Run backend locally (e.g. port 8080) and run frontend locally pointing at `http://localhost:8080`.

So you can always “test the frontend alone” in the sense that you don’t run the backend on your machine if you use Option A.

### Option A: Frontend locally → Backend on GCP

1. **Backend already deployed on GCP**  
   You have a Cloud Run URL, e.g. `https://aip-backend-XXXXX.us-central1.run.app`.

2. **Create `.env.local` in the project root** (frontend repo root, not inside `aip-backend`):
   ```bash
   NEXT_PUBLIC_API_URL=https://aip-backend-XXXXX.us-central1.run.app
   ```
   Replace with your actual Cloud Run URL.

3. **Run the frontend:**
   ```bash
   npm install
   npm run dev
   ```
   (Or `npm run dev:3000` for port 3000; see `package.json`.)

4. **Test in browser**  
   Open `http://localhost:3001` (or 3000). Login, dashboard, approvals, etc. will hit the GCP backend. No local backend needed.

### Option B: Frontend locally → Backend locally

1. **Configure backend**  
   In `aip-backend/.env` set DB and JWT (and optionally `FRONTEND_URL=http://localhost:3000`). For local DB, use `DB_HOST=localhost` (or Cloud SQL with authorized networks + `DB_HOST=<public-ip>`).

2. **Start backend:**
   ```bash
   cd aip-backend
   npm install
   npm run dev
   ```
   Backend runs on port 8080 by default.

3. **Point frontend at local backend**  
   In project root create or set `.env.local`:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

4. **Start frontend:**
   ```bash
   npm run dev
   ```

5. **Test**  
   Frontend talks to local backend; good for debugging API and DB.

### Important

- `NEXT_PUBLIC_*` is baked in at **build** time. For `npm run dev`, changing `.env.local` and restarting the dev server is enough; for production build, set `NEXT_PUBLIC_API_URL` in the build environment.
- Copy from `.env.local.example` if you have one:
  ```bash
  cp .env.local.example .env.local
  # then edit .env.local and set NEXT_PUBLIC_API_URL
  ```

---

## Quick reference

| Question | Answer |
|----------|--------|
| Deploy backend on GCP? | Yes — Cloud Run + Cloud SQL; see Part 2 and `GCP_DEPLOYMENT_AND_TESTING.md`. |
| Test frontend locally “alone” (no local backend)? | Yes — set `NEXT_PUBLIC_API_URL` to your GCP Cloud Run URL and run `npm run dev` (Option A). |
| Test frontend locally with local backend? | Yes — run `aip-backend` on 8080, set `NEXT_PUBLIC_API_URL=http://localhost:8080`, run frontend (Option B). |
