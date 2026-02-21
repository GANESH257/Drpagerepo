# GCP Backend Deployment & Testing Guide

## ✅ Pre-Deployment Verification

### Critical Logic Check:
1. ✅ **`new_practice_with_admin_doctor`** - Only requires ADMIN approval (NOT practice admin)
2. ✅ **`doctor_join_practice`** - Requires BOTH admin AND practice admin approval
3. ✅ Backend automatically creates practice/doctor/membership records on approval
4. ✅ Backend updates user role to 'doctor' and status to 'active' on approval
5. ✅ All approval types have side effects implemented
6. ✅ Frontend uses GCP Cloud Run API (no localhost)

---

## Step 1: Run SQL Migration on GCP Cloud SQL

### Connect to Cloud SQL Database:

```bash
# Get Cloud SQL connection name
gcloud sql instances list

# Connect using Cloud SQL Proxy (recommended)
gcloud sql connect YOUR_INSTANCE_NAME --user=postgres

# OR connect directly (if authorized network is set)
psql -h YOUR_DB_HOST -U postgres -d aip_production
```

### Run Migration:

```sql
-- Copy and paste the entire contents of:
-- aip-backend/migrations/001_approval_requests_schema.sql

-- This will:
-- 1. Create approval_requests table with all columns
-- 2. Create approval_history table
-- 3. Create practice_locations, practice_services, practice_insurance, practice_specialties, practice_roles tables
-- 4. Add missing columns if tables already exist
-- 5. Create all necessary indexes
```

### Verify Tables Exist:

```sql
-- Check approval_requests table
\d approval_requests

-- Should show columns:
-- id, type, requested_by, requested_by_type, practice_id, target_doctor_id, payload
-- admin_status, practice_admin_status, admin_notes, practice_admin_notes
-- admin_reviewed_at, practice_admin_reviewed_at, rejection_reason, rejected_by
-- created_at, updated_at

-- Check other tables
\d practice_locations
\d practice_services
\d practice_insurance
\d practice_specialties
\d practice_roles
\d approval_history
```

---

## Step 2: Deploy Backend to Cloud Run

### Get Your Cloud SQL Connection Name:

```bash
gcloud sql instances describe YOUR_INSTANCE_NAME --format="value(connectionName)"
```

**Example output**: `aip-backend-112180822704:us-central1:aip-production`

### Build and Deploy:

```bash
cd aip-backend

# Build Docker image
gcloud builds submit --tag gcr.io/aip-backend-112180822704/aip-backend:latest

# Deploy to Cloud Run (replace YOUR_CONNECTION_NAME and YOUR_DB_PASSWORD)
gcloud run deploy aip-backend \
  --image gcr.io/aip-backend-112180822704/aip-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances YOUR_CONNECTION_NAME \
  --set-env-vars "DB_SOCKET_PATH=/cloudsql/YOUR_CONNECTION_NAME" \
  --set-env-vars "DB_NAME=aip_production" \
  --set-env-vars "DB_USER=postgres" \
  --set-env-vars "DB_PASSWORD=YOUR_DB_PASSWORD" \
  --set-env-vars "JWT_SECRET=YOUR_JWT_SECRET" \
  --set-env-vars "JWT_EXPIRES_IN=7d" \
  --set-env-vars "FRONTEND_URL=https://ensembledemospace.com" \
  --set-env-vars "FRONTEND_URL_WWW=https://www.ensembledemospace.com" \
  --set-env-vars "NODE_ENV=production" \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10
```

### Get Service URL:

After deployment, you'll see:
```
Service URL: https://aip-backend-XXXXX.us-central1.run.app
```

**Save this URL** - Update your frontend `.env.local` or environment variable:
```bash
NEXT_PUBLIC_API_URL=https://aip-backend-XXXXX.us-central1.run.app
```

---

## Step 3: Verify Backend Deployment

### Test Health Endpoint:

```bash
curl https://YOUR-SERVICE-URL/health
```

**Expected response**:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-01-29T...",
  "dbTime": "..."
}
```

### Test Approval Requests Endpoint (requires auth):

```bash
# First, get an admin token (login via frontend or API)
# Then test:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://YOUR-SERVICE-URL/api/approval-requests
```

---

## Step 4: Test Full Flow - New Doctor Joining with New Clinic

### Test Scenario:
1. **New doctor signs up** → Creates user with `role='applicant'`, `status='pending'`
2. **Doctor fills application** → Selects "Create new practice"
3. **Doctor submits application** → Creates approval request `type='new_practice_with_admin_doctor'`
4. **Admin approves** → Backend creates:
   - Practice record
   - Doctor record (linked to user)
   - Practice role (practice_admin)
   - Membership record
   - Updates user: `role='doctor'`, `status='active'`
5. **Doctor can now login** → Sees dashboard

### Step-by-Step Testing:

#### 4.1: Sign Up as New Doctor

1. Go to: `https://ensembledemospace.com/join-us`
2. Click "Sign Up"
3. Enter:
   - Email: `testdoctor@example.com`
   - Password: `TestPassword123!`
   - Confirm password
   - Agree to terms
4. Click "Sign Up"
5. **Expected**: Redirects to `/join-us/application`

#### 4.2: Fill Application Form

1. **Step 1 - Basic Details**:
   - Full Name: `Dr. Test Doctor`
   - Credentials: `MD`
   - Specialty: `Cardiology`
   - Phone: `555-123-4567`
   - City: `St. Louis`
   - State: `MO`
   - Practice Selection: **"Create New Practice"**
   - Practice Name: `Test Cardiology Clinic`
   - Website: `https://testclinic.com`
   - Click "Continue"

2. **Step 2 - Select Plan**:
   - Select any membership plan (e.g., "Professional")
   - Billing: Annual or Monthly
   - Click "Continue"

3. **Step 3 - Payment**:
   - Select payment method (PayPal or Card)
   - Click "Continue"

4. **Step 4 - Review**:
   - Review all information
   - Check "I confirm my information is accurate"
   - Click "Submit Join Request"

5. **Expected**: 
   - Redirects to `/join-us/submitted`
   - Approval request created in database
   - User can see "Application submitted" message

#### 4.3: Verify Approval Request in Database

```sql
-- Check approval request was created
SELECT id, type, requested_by, admin_status, practice_admin_status, created_at
FROM approval_requests
WHERE type = 'new_practice_with_admin_doctor'
ORDER BY created_at DESC
LIMIT 1;

-- Check payload
SELECT payload::text
FROM approval_requests
WHERE type = 'new_practice_with_admin_doctor'
ORDER BY created_at DESC
LIMIT 1;

-- Should show:
-- {
--   "practice": { "name": "Test Cardiology Clinic", ... },
--   "doctor": { "email": "testdoctor@example.com", ... },
--   "plan": { "planId": "...", "billingCycle": "..." }
-- }
```

#### 4.4: Admin Approves Request

1. **Login as Admin**:
   - Go to: `https://ensembledemospace.com/admin/login`
   - Login with admin credentials
   - Go to: `/admin/requests-v2`

2. **Find the Request**:
   - Look for `testdoctor@example.com`
   - Request type: `new_practice_with_admin_doctor`
   - Status: `pending`

3. **Approve**:
   - Click on the request
   - Click "Approve"
   - Add optional notes
   - Click "Confirm Approval"

4. **Expected**:
   - Request status changes to `approved`
   - Backend creates:
     - Practice record in `practices` table
     - Doctor record in `doctors` table
     - Practice role in `practice_roles` table (role='admin')
     - Membership record in `memberships` table
   - User role updated to `doctor`, status to `active`

#### 4.5: Verify Database Records Were Created

```sql
-- Check practice was created
SELECT id, name, slug, status, created_at
FROM practices
WHERE name = 'Test Cardiology Clinic'
ORDER BY created_at DESC
LIMIT 1;

-- Check doctor was created
SELECT id, user_id, practice_id, full_name, specialty, verified
FROM doctors
WHERE email = 'testdoctor@example.com';

-- Check practice role
SELECT practice_id, doctor_id, role
FROM practice_roles
WHERE doctor_id = (SELECT id FROM doctors WHERE email = 'testdoctor@example.com');

-- Should show: role = 'admin'

-- Check membership
SELECT id, doctor_id, plan_id, billing_cycle, status, start_date, end_date
FROM memberships
WHERE doctor_id = (SELECT id FROM doctors WHERE email = 'testdoctor@example.com');

-- Check user was updated
SELECT id, email, role, status
FROM users
WHERE email = 'testdoctor@example.com';

-- Should show: role = 'doctor', status = 'active'
```

#### 4.6: Doctor Can Now Login

1. **Logout** from admin (if logged in)
2. **Go to**: `https://ensembledemospace.com/join-us`
3. **Click "Sign In"**
4. **Login with**:
   - Email: `testdoctor@example.com`
   - Password: `TestPassword123!`
5. **Expected**:
   - Redirects to `/doctor/dashboard`
   - Doctor sees dashboard
   - Doctor is practice admin of "Test Cardiology Clinic"

---

## Step 5: Test Doctor Joining Existing Practice

### Test Scenario:
1. **New doctor signs up** → Creates user with `role='applicant'`, `status='pending'`
2. **Doctor fills application** → Selects existing practice
3. **Doctor submits** → Creates approval request `type='doctor_join_practice'`
4. **Practice Admin approves** → Updates `practice_admin_status='approved'`
5. **Admin approves** → Backend creates doctor record and updates user
6. **Doctor can login**

### Testing Steps:

1. **Sign up** as new doctor (different email)
2. **Fill application**:
   - Select "Join Existing Practice"
   - Choose a practice from dropdown
3. **Submit** → Creates `doctor_join_practice` request
4. **Practice Admin approves** (if practice has practice admin)
5. **Admin approves** → Doctor record created
6. **Doctor can login**

---

## Step 6: Verify All Approval Types Work

### Test Each Approval Type:

1. **Practice Edit** (`practice_edit_request`):
   - Practice admin submits edit request
   - Admin approves
   - Practice details updated

2. **Location Add** (`practice_location_add_request`):
   - Practice admin adds location
   - Admin approves
   - Location added to `practice_locations`

3. **Location Edit** (`practice_location_edit_request`):
   - Practice admin edits location
   - Admin approves
   - Location updated

4. **Location Remove** (`practice_location_remove_request`):
   - Practice admin removes location
   - Admin approves
   - Location removed

5. **Services/Insurance Change** (`practice_insurance_services_change_request`):
   - Practice admin updates services/insurance
   - Admin approves
   - Records updated in `practice_services`/`practice_insurance`

6. **Doctor Add** (`practice_doctor_add_request`):
   - Practice admin invites doctor
   - Admin approves
   - Doctor added to practice

7. **Doctor Remove** (`practice_doctor_remove_request`):
   - Practice admin removes doctor
   - Admin approves
   - Doctor removed from practice

---

## Troubleshooting

### Backend Not Connecting to Database:

```bash
# Check Cloud Run logs
gcloud run services logs read aip-backend --region us-central1 --limit 50

# Look for:
# - "Database connection successful" ✅
# - "Database pool error" ❌
# - Connection timeout errors
```

### Approval Side Effects Not Running:

1. **Check logs** for errors:
```bash
gcloud run services logs read aip-backend --region us-central1 --limit 100 | grep "side effects"
```

2. **Verify both approvals are complete**:
```sql
SELECT id, type, admin_status, practice_admin_status
FROM approval_requests
WHERE id = 'YOUR_REQUEST_ID';
```

3. **Manually trigger side effects** (if needed):
   - The backend will retry on next approval action
   - Or manually update approval statuses and trigger

### Frontend Can't Connect to Backend:

1. **Check API URL**:
   - Verify `NEXT_PUBLIC_API_URL` is set correctly
   - Should be: `https://aip-backend-XXXXX.us-central1.run.app`

2. **Check CORS**:
   - Backend should allow requests from your frontend domain
   - Check `aip-backend/src/middleware/cors.ts`

3. **Check browser console**:
   - Look for CORS errors
   - Look for 404/500 errors

---

## Success Criteria

✅ **All tests pass**:
- New doctor can sign up
- Application creates approval request
- Admin can approve
- Backend creates all records automatically
- Doctor can login after approval
- Doctor sees dashboard
- Doctor is practice admin

✅ **Database has all records**:
- User record (role='doctor', status='active')
- Practice record
- Doctor record
- Practice role record (role='admin')
- Membership record

✅ **No localStorage usage**:
- All data comes from API
- No local storage for approval requests
- Only draft/email stored locally (for UX)

---

## Next Steps After Testing

1. ✅ Verify all approval types work
2. ✅ Test practice admin approval flow
3. ✅ Test rejection flow
4. ✅ Monitor Cloud Run logs for errors
5. ✅ Monitor database for data consistency

---

## Important Notes

- **ALL testing is on GCP** - No localhost, no local database
- **Backend runs on Cloud Run** - Auto-scales, serverless
- **Database is Cloud SQL** - Managed PostgreSQL
- **Frontend connects to GCP backend** - Via `NEXT_PUBLIC_API_URL`
- **All data is persistent** - Stored in Cloud SQL, not localStorage
