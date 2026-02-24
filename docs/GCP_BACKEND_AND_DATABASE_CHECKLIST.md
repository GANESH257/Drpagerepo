# GCP Backend & Database Checklist – Ready for All Frontend Changes

Use this to get your **GCP backend and Cloud SQL database** in sync with the frontend (API-based doctor/practice/approvals/referrals, plan display, leadership, messages, etc.).

---

## 1. SQL to run on your Cloud SQL database

Run these **in order** on your Cloud SQL instance (Cloud Console → Cloud SQL → your instance → Open Cloud SQL Studio, or `psql`).

### If you already have the database from an earlier setup

Apply only the **migrations you haven’t run yet** (in order):

| Order | File | Purpose |
|-------|------|--------|
| 1 | `aip-backend/migrations/006_doctors_insurance.sql` | Add `insurance` JSONB to `doctors`. |
| 2 | `aip-backend/migrations/007_referrals.sql` | Create `referrals` table (if not exists). |
| 3 | **`aip-backend/migrations/008_board_of_directors.sql`** | Create `board_of_directors` and `board_directors` for Leadership/Board API. **Required for `/api/leadership/board`.** |

**Copy-paste or run:**

```bash
# From repo root
cd aip-backend

# Run each migration in order (example with psql - replace with your connection)
# Option A: Cloud SQL Studio – open each file and execute.

# Option B: If using psql
psql "host=YOUR_DB_HOST port=5432 dbname=postgres user=postgres password=YOUR_PASSWORD sslmode=require" -f migrations/006_doctors_insurance.sql
psql "..." -f migrations/007_referrals.sql
psql "..." -f migrations/008_board_of_directors.sql
```

- **006** – Idempotent (`ADD COLUMN IF NOT EXISTS`). Safe to run again.
- **007** – Idempotent (`CREATE TABLE IF NOT EXISTS`). Safe to run again.
- **008** – Idempotent (IF NOT EXISTS, ON CONFLICT DO NOTHING). Safe to run again. **This is the one that’s easy to miss** if you used an older full-setup script that didn’t include Board of Directors.

### If you are doing a **fresh** database (empty)

1. Run the **full** setup script first:
   - **`docs/CLOUD_SQL_FULL_FRESH_SETUP.sql`**
   - Then run **`aip-backend/migrations/008_board_of_directors.sql`** (the full setup file does **not** include `board_of_directors` / `board_directors`).

2. Replace the placeholder admin password in that script (see comments in the file) and set any other required values.

---

## 2. Backend files that must be present and deployed

These are the backend files that the frontend expects. Ensure they exist and are deployed to Cloud Run.

### Routes (must be mounted in `src/index.ts`)

| File | Route mount | Purpose |
|------|-------------|--------|
| `src/routes/auth.ts` | `/api/auth` | Login, signup, JWT. |
| `src/routes/doctors.ts` | `/api/doctors` | List/Get/Update/Delete doctors, /me/contacts, /me/preferences, /me/membership. |
| `src/routes/practices.ts` | `/api/practices` | List/Get/Update practices, invitations. |
| `src/routes/departments.ts` | `/api/departments` | Departments/specialties. |
| `src/routes/membership-plans.ts` | `/api/membership-plans` | Plans for plan dropdown/display. |
| `src/routes/approval-requests.ts` | `/api/approval-requests` | Create/approve/reject approval requests. |
| `src/routes/join-requests.ts` | `/api/join-requests` | Join requests. |
| `src/routes/referrals.ts` | `/api/referrals` | Referrals CRUD (status: considering/accepted/no_show/cancelled). |
| `src/routes/appointments.ts` | `/api/appointments` | Appointments. |
| `src/routes/messages.ts` | `/api/messages` | Threads, messages, unread count. **GET /threads must return each thread with a `participants` array `[{ id, full_name }]`** (see below). |
| `src/routes/notifications.ts` | `/api/notifications` | Notifications. |
| `src/routes/policies.ts` | `/api/policies` | Policies. |
| `src/routes/events.ts` | `/api/events` | Events. |
| `src/routes/community.ts` | `/api/community` | Community sections, posts, comments. |
| `src/routes/committees.ts` | `/api/committees` | Committees. |
| **`src/routes/leadership.ts`** | **`/api/leadership`** | **Board of Directors (GET /api/leadership/board).** Required for Leadership page. |
| `src/routes/announcements.ts` | `/api/announcements` | Announcements, mark read. |
| `src/routes/admin-community.ts` | `/api/admin/community` | Admin community reports/moderation. |
| `src/routes/admin-settings.ts` | `/api/admin/settings` | Admin config. |
| `src/routes/insurance-providers.ts` | `/api/insurance-providers` | Insurance providers. |
| `src/routes/specialties.ts` | `/api/specialties` | Specialties. |
| `src/routes/conditions.ts` | `/api/conditions` | Conditions. |
| `src/routes/treatments.ts` | `/api/treatments` | Treatments. |
| `src/routes/condition-treatments.ts` | `/api/condition-treatments` | Condition–treatment links. |
| `src/routes/upload.ts` | `/api/upload` | Image/file upload (e.g. profile, GCS). |

### Messages route – required behavior

The frontend (MessagesSectionAPI) expects **GET /api/messages/threads** to return each thread with a **`participants`** array so it can show the other participant’s name and resolve `?otherDoctorId=` to a thread. If the backend returns threads without `participants`, the UI shows “Unknown” for thread names and “Start new message” won’t open the correct thread.

**Required:** Each thread in the response must include:
- `participants`: array of `{ id: string, full_name: string }` for **other** participants in that thread (excluding the current user).

The current (uncommitted) **`aip-backend/src/routes/messages.ts`** implements this: it fetches threads with an explicit `GROUP BY`, then for each thread queries `thread_participants` + `doctors` and attaches `participants`. **Deploy this version** of `messages.ts` (see “Uncommitted backend changes” below).

### Uncommitted backend changes to deploy

These backend changes are in your working tree and are **not** in the last commit. To have the app work as intended, **deploy them** (commit and deploy, or deploy from current tree):

| File | What changed |
|------|----------------|
| **`aip-backend/src/index.ts`** | Registers **`/api/leadership`** (import + `app.use` for leadership routes). Without this, the Leadership/Board page API fails. |
| **`aip-backend/src/routes/messages.ts`** | **GET /api/messages/threads** returns each thread with **`participants`** (id, full_name) and uses an explicit SELECT/GROUP BY so the query is valid. Without this, the Messages UI shows “Unknown” and can’t match threads by otherDoctorId. |
| **`aip-backend/src/routes/leadership.ts`** | New file. Implements GET /api/leadership/board (board_of_directors + board_directors). Must exist and be deployed. |

### Main app

| File | Purpose |
|------|--------|
| `src/index.ts` | Must import and `app.use('/api/leadership', leadershipRoutes)` (and all other routes above). |
| `src/db/connection.ts` | DB connection (Cloud SQL socket or TCP). |
| `src/middleware/auth.ts` | JWT auth, optional `authenticateToken`. |
| `src/middleware/cors.ts` | CORS (allow frontend origin). |

### Env / deploy

| File | Purpose |
|------|--------|
| `.env` / Cloud Run env vars | `DB_*`, `JWT_SECRET`, `FRONTEND_URL`, `GCS_BUCKET` (if using GCS upload). |
| `deploy-to-gcp.sh` | Deploy to Cloud Run (build, set env vars, Cloud SQL connection). |

---

## 3. Optional: Doctor plan_id for “Membership” badge

The frontend shows a “Membership: &lt;plan name&gt;” badge when the API doctor has `plan_id` (or `membership_plan_id`). Two options:

### Option A – No DB change (backend JOIN)

In **`aip-backend/src/routes/doctors.ts`**, for:

- `GET /api/doctors` (list),
- `GET /api/doctors/:id`,
- `GET /api/doctors/slug/:slug`,

add the current plan from `memberships` (e.g. active membership, latest by expiry). Example for list:

- Add a subquery or `LEFT JOIN LATERAL (SELECT plan_id FROM memberships m WHERE m.doctor_id = d.id AND m.status = 'active' ORDER BY m.expiry_date DESC NULLS LAST LIMIT 1) m ON true` and select `m.plan_id AS plan_id` so each doctor row includes `plan_id` when they have an active membership.

Then the frontend will receive `plan_id` and can show the badge.

### Option B – Add column and sync

1. Add migration **`009_doctors_plan_id.sql`**:

```sql
-- Optional: add plan_id to doctors for quick display (sync from memberships when membership is created/updated)
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS plan_id VARCHAR(50);
CREATE INDEX IF NOT EXISTS idx_doctors_plan_id ON doctors(plan_id) WHERE plan_id IS NOT NULL;
```

2. When creating/updating a row in `memberships`, set `doctors.plan_id` for that `doctor_id` (e.g. trigger or in the route that writes to `memberships`).
3. In **`aip-backend/src/routes/doctors.ts`**, keep `SELECT d.*`; `plan_id` will be returned automatically.

---

## 4. Quick checklist

- [ ] **DB:** Run `006_doctors_insurance.sql` if not already.
- [ ] **DB:** Run `007_referrals.sql` if not already.
- [ ] **DB:** Run **`008_board_of_directors.sql`** (required for Leadership/Board API).
- [ ] **Backend:** `src/index.ts` mounts **`/api/leadership`** and uses **`leadershipRoutes`** from `./routes/leadership`.
- [ ] **Backend:** File **`src/routes/leadership.ts`** exists and implements `GET /board` (board_of_directors + board_directors).
- [ ] **Backend:** **`src/routes/messages.ts`** is the version that returns **`participants`** on GET /threads (explicit GROUP BY + per-thread participants). Otherwise Messages UI shows “Unknown” and otherDoctorId matching fails.
- [ ] **Backend:** All other routes above exist and are mounted (doctors, practices, approval-requests, referrals, messages, etc.).
- [ ] **Backend:** Deploy to Cloud Run (e.g. `./deploy-to-gcp.sh` or your CI), with correct env vars and Cloud SQL connection.
- [ ] **Optional:** Implement doctor `plan_id` (Option A or B) so “Membership” badge works on practice doctors and admin member edit.

---

## 5. Summary

| What | Where |
|------|--------|
| **SQL to run** | `006`, `007`, **`008_board_of_directors.sql`** (in order). If fresh DB: full setup script + **008**. |
| **Backend files** | All routes in §2; **`src/routes/leadership.ts`** and **`app.use('/api/leadership', leadershipRoutes)`** in **`src/index.ts`** are required for the Leadership page. |
| **No extra SQL** | 001–005 and full setup script already cover doctors, practices, memberships, referrals (in full setup), etc. 008 is the only new table set needed for current frontend. |
| **Plan badge** | Optional: add `plan_id` to doctor response (JOIN from `memberships` or add column + sync). |

After this, the GCP backend and database are ready for the current frontend (API-based doctors, practices, approvals, referrals, messages, leadership, plan display).
