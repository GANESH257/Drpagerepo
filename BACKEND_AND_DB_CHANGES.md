# Backend & Database Changes (Referrals + Approvals)

Apply these so referrals and approval flows work as implemented. No new SQL is required for approvals—only code changes. For referrals you must run the new migration.

---

## 1. Database: New migration (referrals)

**Run this migration** so the `referrals` table exists. Requires existing `doctors` table.

**File:** `aip-backend/migrations/007_referrals.sql`

```sql
-- Migration 007: Referrals table (doctor-to-doctor referrals)
-- Requires: doctors table

CREATE TABLE IF NOT EXISTS referrals (
    id VARCHAR(255) PRIMARY KEY,
    from_doctor_id VARCHAR(255) NOT NULL,
    to_doctor_id VARCHAR(255) NOT NULL,
    patient_name_or_initials VARCHAR(500) NOT NULL,
    patient_age INT,
    patient_sex VARCHAR(50),
    patient_phone VARCHAR(100),
    condition_summary TEXT NOT NULL,
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'considering',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    attended_at TIMESTAMP,
    FOREIGN KEY (from_doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (to_doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_referrals_from_doctor_id ON referrals(from_doctor_id);
CREATE INDEX IF NOT EXISTS idx_referrals_to_doctor_id ON referrals(to_doctor_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at DESC);
```

**How to run:** Use your usual migration process (e.g. `psql`, Cloud SQL, or a migration runner) against the same DB the backend uses. Run 007 after any earlier migrations (001–006) that create `doctors`.

---

## 2. Backend code changes (no new migrations)

### 2.1 `aip-backend/src/routes/approval-requests.ts`

- **approval_history INSERT (approve path)**  
  Use only columns that exist: `id`, `approval_request_id`, `action`, `performed_by`, `performed_by_type`, `notes`.  
  **Removed:** `actor_id`, `actor_type` (not in schema).

- **approval_history INSERT (reject paths, 2 places)**  
  Same: only `id`, `approval_request_id`, `action`, `performed_by`, `performed_by_type`, `notes`.  
  **Removed:** `actor_id`, `actor_type`.

- **OVERWRITE_TYPES**  
  **Added:** `'doctor_insurance_edit'` so resubmitting insurance edit updates the existing pending request instead of creating a new one.

No changes to `approval_requests` or `approval_history` table schemas—migration 001 already has the right columns.

---

### 2.2 `aip-backend/src/routes/referrals.ts`

- **GET /** (list)  
  Selects `from_practice_id` and `to_practice_id` from the doctors table (JOIN on `from_doctor_id` / `to_doctor_id`) so admin can filter by practice.

- **GET /:id** (single)  
  Same extra columns.  
  **Added:** Authorization so only the referring doctor, the recipient doctor, or an admin can load a referral; others get 403.

- **POST /** (create)  
  New referrals are created with `status = 'considering'` (was `'new'`).

- **PUT /:id** (update)  
  - Only these fields are writable: `status`, `notes`, `attended_at`.  
  - `status` must be one of: `considering`, `accepted`, `no_show`, `cancelled`.  
  - When `status === 'accepted'`, backend sets `attended_at = NOW()` if not already set.  
  - Only sender, recipient, or admin can update.

---

## 3. Checklist

| Step | Action |
|------|--------|
| 1 | Run `007_referrals.sql` on the backend database (after 001–006). |
| 2 | Deploy updated `aip-backend` (so `approval-requests.ts` and `referrals.ts` use the logic above). |
| 3 | Ensure `doctors` table has `practice_id` if you use practice filters for referrals (backend JOINs `doctors` for `from_practice_id` / `to_practice_id`). |

---

## 4. No SQL changes for approvals

- `approval_requests` and `approval_history` schemas from migration 001 are unchanged.  
- All approval fixes are in **code** only (`approval-requests.ts`): history INSERT columns and OVERWRITE_TYPES.

---

*Last updated from the session that implemented referrals (considering/accepted/no_show/cancelled), PA approve persistence, and insurance single “Save Changes” flow.*
