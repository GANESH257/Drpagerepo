# Backend Changes Summary - What to Upload to GCP

## Files Changed in Backend

### 1. `aip-backend/src/routes/approval-requests.ts` ⚠️ **MODIFIED**

**What changed**:
- **POST `/api/approval-requests/:id/approve` endpoint** (lines ~211-352):
  - Added database transaction (`BEGIN`/`COMMIT`/`ROLLBACK`)
  - Added practice admin approval logic (lines 284-331)
  - Added logic to check if both approvals are needed (lines 257-273)
  - Added call to `applyApprovalSideEffects` when approval is finalized (lines 276-283, 324-330)
  
- **NEW function: `applyApprovalSideEffects`** (lines 357-785):
  - Handles side effects for ALL approval types:
    - `new_practice_with_admin_doctor`: Creates practice, doctor, practice_role, membership, updates user
    - `doctor_join_practice`: Creates doctor, practice_role, membership, updates user
    - `practice_edit_request`: Updates practice details, services, insurance
    - `practice_location_add_request`: Adds location
    - `practice_location_edit_request`: Updates location
    - `practice_location_remove_request`: Removes location
    - `practice_location_change_request`: Bulk updates locations
    - `practice_insurance_services_change_request`: Updates insurance/services
    - `practice_doctor_add_request`: Adds doctor to practice
    - `practice_doctor_remove_request`: Removes doctor from practice

- **GET `/api/approval-requests` endpoint** (line 31):
  - Updated status filter to check both `admin_status` and `practice_admin_status`

- **PUT `/api/approval-requests/:id` endpoint** (line 187):
  - Updated validation to check `practice_admin_status`

- **POST `/api/approval-requests/:id/reject` endpoint** (lines 839-914):
  - Added practice admin rejection logic (lines 875-899)

**Action**: Upload entire `approval-requests.ts` file to GCP backend

---

### 2. `aip-backend/migrations/001_approval_requests_schema.sql` ⚠️ **NEW FILE**

**What it does**:
- Creates `approval_requests` table with all columns:
  - `practice_admin_status`, `practice_admin_notes`, `practice_admin_reviewed_at` (NEW columns)
  - `admin_reviewed_at` (NEW column)
- Creates `approval_history` table
- Creates supporting tables:
  - `practice_locations`
  - `practice_services`
  - `practice_insurance`
  - `practice_specialties`
  - `practice_roles`
- Adds missing columns if tables already exist (lines 114-140)
- Creates indexes for performance

**Action**: Run this SQL migration on Cloud SQL database

---

### 3. `aip-backend/src/routes/auth.ts` ✅ **ALREADY DEPLOYED**

**What changed**: Already allows `pending` users to login (line 35-40)
- This was done in previous work
- No change needed

---

## Summary: What to Do

### Step 1: Upload Changed File
**File**: `aip-backend/src/routes/approval-requests.ts`
- This entire file needs to be uploaded (it's been modified)
- Replace the existing file in your GCP backend

### Step 2: Run SQL Migration
**File**: `aip-backend/migrations/001_approval_requests_schema.sql`
- Connect to Cloud SQL
- Run this migration SQL script
- It will create/update tables safely (uses `IF NOT EXISTS` and `DO $$` blocks)

### Step 3: Rebuild and Redeploy
- Rebuild Docker image
- Redeploy to Cloud Run

---

## Detailed Changes in `approval-requests.ts`

### Key Additions:

1. **Transaction Support** (lines 212-214, 337, 346):
   ```typescript
   const client = await pool.connect();
   await client.query('BEGIN');
   // ... operations ...
   await client.query('COMMIT');
   ```

2. **Practice Admin Approval** (lines 284-331):
   - Checks if user is practice admin for the practice
   - Updates `practice_admin_status`
   - Checks if both approvals complete
   - Calls side effects if both approved

3. **Side Effects Function** (lines 357-785):
   - 430+ lines of logic handling all approval types
   - Creates/updates/deletes records based on approval type

4. **Both Approvals Logic** (lines 257-273):
   - Determines which types need practice admin approval
   - Checks if both approvals are complete before applying side effects

---

## Files NOT Changed (Already Deployed)

- ✅ `aip-backend/src/routes/auth.ts` - Already allows pending users
- ✅ `aip-backend/src/routes/membership-plans.ts` - No changes
- ✅ `aip-backend/src/routes/join-requests.ts` - No changes (uses approval-requests internally)
- ✅ All other route files - No changes

---

## Quick Upload Steps

1. **Upload file to Cloud Shell**:
   ```bash
   # Option 1: Copy-paste via Cloud Shell Editor
   # Option 2: Use gcloud cloud-shell scp
   # Option 3: Upload via Cloud Shell file upload
   ```

2. **Run migration**:
   ```bash
   gcloud sql connect YOUR_INSTANCE_NAME --user=postgres
   \c aip_production
   # Copy-paste contents of 001_approval_requests_schema.sql
   ```

3. **Rebuild and redeploy**:
   ```bash
   cd ~/aip-backend
   gcloud builds submit --tag gcr.io/aip-backend-112180822704/aip-backend:latest
   # Then redeploy with your existing command
   ```

---

**That's it!** Only 1 file changed, 1 new migration file to run.
