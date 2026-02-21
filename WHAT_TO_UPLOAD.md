# What Changed - Upload to GCP

## Files That Changed (Backend Only)

### 1. `aip-backend/src/routes/approval-requests.ts`
**What changed**: Added `applyApprovalSideEffects` function that creates practice/doctor/membership records when approval is finalized.

**Key changes**:
- Added side effects logic in `POST /api/approval-requests/:id/approve` endpoint
- When `new_practice_with_admin_doctor` is approved by admin → creates practice, doctor, practice_role, membership records
- When `doctor_join_practice` is approved by both admin + practice admin → creates doctor, practice_role, membership records
- Updates user role to 'doctor' and status to 'active'

**Action**: Upload this file to your GCP backend

### 2. `aip-backend/migrations/001_approval_requests_schema.sql`
**What changed**: NEW migration file - ensures all required tables/columns exist

**What it does**:
- Creates `approval_requests` table (if not exists) with all columns
- Creates `approval_history` table
- Creates `practice_locations`, `practice_services`, `practice_insurance`, `practice_specialties`, `practice_roles` tables
- Adds missing columns if tables already exist

**Action**: Run this SQL migration on your Cloud SQL database

### 3. `aip-backend/src/routes/auth.ts`
**What changed**: Already allows `pending` users to login (this was done before)

**Action**: Already deployed, no change needed

---

## Steps to Deploy

### Step 1: Upload Changed File to GCP

**Option A: Using Cloud Shell**
```bash
# Open Cloud Shell: https://shell.cloud.google.com
# Navigate to your backend directory
cd ~/aip-backend  # or wherever your backend is

# Upload the changed file
# Copy the contents of approval-requests.ts from local to Cloud Shell
```

**Option B: Using gcloud CLI (if you have it locally)**
```bash
# From your local machine
gcloud cloud-shell scp aip-backend/src/routes/approval-requests.ts user@cloudshell:~/aip-backend/src/routes/
```

**Option C: Manual Copy-Paste**
1. Open `aip-backend/src/routes/approval-requests.ts` locally
2. Copy entire file
3. Open Cloud Shell Editor
4. Open `aip-backend/src/routes/approval-requests.ts` in Cloud Shell
5. Paste and save

### Step 2: Run SQL Migration

```bash
# Connect to Cloud SQL
gcloud sql connect YOUR_INSTANCE_NAME --user=postgres

# Switch to your database
\c aip_production

# Run migration (copy-paste entire contents of 001_approval_requests_schema.sql)
# OR if you uploaded the file:
\i migrations/001_approval_requests_schema.sql
```

**Verify migration**:
```sql
-- Check tables exist
\dt approval_requests
\dt practice_roles
\dt practice_locations

-- Check columns
\d approval_requests
-- Should show: practice_admin_status, practice_admin_notes, practice_admin_reviewed_at
```

### Step 3: Rebuild and Redeploy

```bash
# In Cloud Shell, navigate to backend directory
cd ~/aip-backend

# Build new Docker image
gcloud builds submit --tag gcr.io/aip-backend-112180822704/aip-backend:latest

# Redeploy (use your existing deployment command)
# It should be something like:
gcloud run deploy aip-backend \
  --image gcr.io/aip-backend-112180822704/aip-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances YOUR_CONNECTION_NAME \
  --set-env-vars "DB_SOCKET_PATH=/cloudsql/YOUR_CONNECTION_NAME" \
  --set-env-vars "DB_NAME=aip_production" \
  --set-env-vars "DB_USER=postgres" \
  --set-env-vars "DB_PASSWORD=YOUR_PASSWORD" \
  --set-env-vars "JWT_SECRET=YOUR_SECRET" \
  --set-env-vars "JWT_EXPIRES_IN=7d" \
  --set-env-vars "FRONTEND_URL=https://ensembledemospace.com" \
  --set-env-vars "NODE_ENV=production"
```

**Note**: Use your existing deployment command - just update the image tag to `:latest`

### Step 4: Verify Deployment

```bash
# Test health endpoint
curl https://YOUR-SERVICE-URL/health

# Should return: {"status":"ok","database":"connected",...}
```

---

## Summary

**Files to upload**:
1. ✅ `aip-backend/src/routes/approval-requests.ts` (changed)

**SQL to run**:
1. ✅ `aip-backend/migrations/001_approval_requests_schema.sql` (new migration)

**Then**:
1. ✅ Rebuild Docker image
2. ✅ Redeploy to Cloud Run

**That's it!** The frontend changes are already in your codebase and will work once backend is updated.
