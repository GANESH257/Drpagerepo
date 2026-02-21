# Approval & Account Setup — Files, SQL, and Schema Commands

## 1. All relevant files

### Backend (Node/Express)

| File | Purpose |
|------|--------|
| `aip-backend/src/routes/approval-requests.ts` | Approve, reject, apply-side-effects, GET list/detail; `applyApprovalSideEffects()` (practice, doctor, membership, user update) |
| `aip-backend/src/routes/join-requests.ts` | Join-request API; reads/updates `approval_requests`; guard to not overwrite approved/rejected |
| `aip-backend/src/index.ts` | Mounts `app.use('/api/approval-requests', ...)` |
| `aip-backend/src/middleware/auth.ts` | `authenticateToken`, `AuthRequest` (used by approval routes) |
| `aip-backend/src/db/connection.ts` | `pool` (Postgres) |

### Migrations / SQL

| File | Purpose |
|------|--------|
| `aip-backend/migrations/001_approval_requests_schema.sql` | **Run this.** Creates `approval_requests`, `approval_history`, `practice_locations`, `practice_services`, `practice_insurance`, `practice_specialties`, `practice_roles`; adds missing columns. **Assumes `practices` and `doctors` already exist.** |
| `docs/CLOUD_SQL_MIGRATION.sql` | Full reference schema (users, practices, doctors, memberships, etc.). Your DB may have been created from this; column names can differ from what the approval code uses (see §3). |
| `RUN_MIGRATION.sql` (repo root) | Alternative/duplicate migration script; prefer `aip-backend/migrations/001_approval_requests_schema.sql`. |

### Frontend (Next.js)

| File | Purpose |
|------|--------|
| `src/lib/api/approval-requests.ts` | `getApprovalRequests`, `getApprovalRequest`, `approveRequest`, `rejectRequest`, `applySideEffects`, `createApprovalRequest`, etc. |
| `src/lib/api/approval-requests-transform.ts` | Maps API approval request shape to UI shape |
| `src/app/admin/requests-v2/page.tsx` | Admin list of approval requests |
| `src/app/admin/requests-v2/[id]/ApprovalRequestDetailClient.tsx` | Detail + Approve/Reject buttons; calls `approveRequest` |
| `src/lib/services/approvalEngine.ts` | Uses `approveRequest`, `getApprovalRequest` |
| `src/components/join-us/ApplicationReview.tsx` | Uses `createApprovalRequest` (submit application) |
| `src/app/doctor/dashboard/practice/approvals/[id]/PracticeAdminApprovalDetailClient.tsx` | Practice-admin approval detail |
| `src/app/admin/history/approvals/page.tsx` | Approval history UI |
| `src/lib/api/join-requests.ts` | Join-request API (backed by approval_requests) |

### Docs

| File | Purpose |
|------|--------|
| `docs/APPROVAL_FLOW_DEEP_DIVE.md` | End-to-end flow, transaction, response flags |
| `docs/APPROVAL_SETUP_FILES_AND_SCHEMA.md` | This file |

---

## 2. SQL you need (migrations)

Run in this order:

1. **Ensure base tables exist**  
   If your DB was created from `docs/CLOUD_SQL_MIGRATION.sql`, you already have `users`, `practices`, `doctors`, `memberships`, etc. If not, you must create them first (see that file or your DBA).

2. **Run the approval migration** (creates approval tables and any missing columns):
   ```bash
   cd aip-backend
   psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB -f migrations/001_approval_requests_schema.sql
   ```
   Or in Cloud SQL Studio / any client: paste and run the contents of `aip-backend/migrations/001_approval_requests_schema.sql`.

3. **Column alignment**  
   The code in `approval-requests.ts` expects certain column names. If your `practices` / `doctors` / `practice_locations` / `memberships` tables use different names (e.g. `city` vs `address_city`), either change the code to match your DB or add/rename columns. See §3 below.

---

## 3. Commands to see schema

Use these to inspect the current database schema (replace `YOUR_DB` etc. with your connection details).

### Option A: `psql` (interactive)

```bash
# Connect (examples)
psql -h /cloudsql/PROJECT:REGION:INSTANCE -U postgres -d YOUR_DB
# or
psql "postgresql://USER:PASSWORD@HOST:5432/YOUR_DB"
# or for local
psql -U postgres -d aip_dev
```

Then run:

```sql
-- List all tables
\dt

-- Describe one table (columns, types, constraints)
\d approval_requests
\d approval_history
\d users
\d practices
\d doctors
\d practice_roles
\d practice_locations
\d practice_specialties
\d memberships
```

### Option B: SQL queries (any client: psql, Cloud SQL Studio, DBeaver, etc.)

```sql
-- List tables in public schema
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Columns of a table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'approval_requests'
ORDER BY ordinal_position;

-- Same for every table the approval setup uses
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'approval_requests', 'approval_history',
    'users', 'practices', 'doctors', 'practice_roles',
    'practice_locations', 'practice_specialties', 'memberships'
  )
ORDER BY table_name, ordinal_position;

-- Check only tables that must exist for approval setup
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'approval_requests', 'approval_history', 'users',
    'practices', 'doctors', 'practice_roles',
    'practice_locations', 'practice_specialties', 'memberships'
  );
```

### One-liner to dump “approval setup” table columns (copy-paste)

```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('approval_requests','approval_history','users','practices','doctors','practice_roles','practice_locations','practice_specialties','memberships')
ORDER BY table_name, ordinal_position;
```

---

## 4. Columns the approval setup code expects

When you run the “see schema” commands, compare with what the code uses. Mismatches (e.g. missing column or different name) will cause `Account setup failed: ...` and show up in logs.

### `practices` (INSERT in applyApprovalSideEffects)

- `id`, `slug`, `name`, `description`, `phone`, `email`, `website`
- `address_line1`, `address_city`, `address_state`, `address_zip`, `address_country`
- `status`, `created_at`, `updated_at`

If your table has `city`, `state`, `zip`, `country` instead of `address_city`, `address_state`, `address_zip`, `address_country`, either add the `address_*` columns or change the code to use `city`, `state`, `zip`, `country`.

### `practice_locations` (INSERT)

- `id`, `practice_id`, `name`, `address`, `city`, `state`, `zip`, `phone`  
  (and possibly `created_at`, `updated_at` if NOT NULL)

Some schemas use `address_line1` instead of `address`; adjust code or schema as needed.

### `doctors` (INSERT)

- `id`, `user_id`, `practice_id`, `full_name`, `credentials`, `specialty`, `phone`, `email`
- `verified`, `created_at`, `updated_at`

If your `doctors` table has required columns like `slug`, `first_name`, `last_name`, add them in the INSERT (e.g. generate `slug` from name, split `full_name` into first/last) or make those columns nullable.

### `practice_roles` (INSERT)

- `practice_id`, `doctor_id`, `role`, `created_at`  
  (PK usually `(practice_id, doctor_id)`; code uses `ON CONFLICT DO NOTHING`)

### `memberships` (INSERT)

- `id`, `doctor_id`, `plan_id`, `billing_cycle`, `status`, `start_date`, `end_date`, `created_at`, `updated_at`

If your table has `expiry_date` instead of `end_date`, or requires `plan_name`, `amount`, `payment_method`, add those in the INSERT or change the code.

### `users` (UPDATE)

- `role`, `status`, `updated_at`  
  (WHERE `id` = user id)

---

## 5. Quick checklist

1. Run `001_approval_requests_schema.sql` so `approval_requests` and `approval_history` (and related) exist.
2. Ensure `users`, `practices`, `doctors`, `practice_roles`, `memberships` exist (and optionally `practice_locations`, `practice_specialties`).
3. Use the “see schema” commands above and align column names with §4 (either in the DB or in the code).
4. Redeploy the backend and approve a test request; check response for `sideEffectsApplied` and logs for `[Approval setup]` and any error.
