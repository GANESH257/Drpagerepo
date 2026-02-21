# Complete Testing Checklist - GCP Deployment

## ✅ Pre-Deployment Verification

### Code Verification:
- [x] **Backend approval endpoint** handles all approval types
- [x] **`new_practice_with_admin_doctor`** only requires admin approval (NOT practice admin)
- [x] **`doctor_join_practice`** requires both admin AND practice admin approval
- [x] **Side effects function** creates all records correctly
- [x] **Frontend uses GCP API** (no localhost)
- [x] **All async operations** properly handled
- [x] **Error handling** in place

### Database Schema:
- [x] **Migration file** creates all required tables
- [x] **Column names** match backend code
- [x] **Indexes** created for performance
- [x] **Foreign keys** properly set

---

## Step 1: Deploy Backend to GCP

### 1.1: Run SQL Migration

```bash
cd aip-backend

# Option A: Using Cloud SQL Proxy (recommended)
gcloud sql connect YOUR_INSTANCE_NAME --user=postgres
# Then copy-paste contents of migrations/001_approval_requests_schema.sql

# Option B: Using psql directly
psql -h YOUR_DB_HOST -U postgres -d aip_production -f migrations/001_approval_requests_schema.sql
```

**Verify**:
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'approval_requests', 'approval_history', 'practice_locations',
  'practice_services', 'practice_insurance', 'practice_specialties', 'practice_roles'
);

-- Check approval_requests columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'approval_requests';
```

### 1.2: Deploy Backend

```bash
cd aip-backend

# Use deployment script
./deploy-to-gcp.sh

# OR manually:
gcloud builds submit --tag gcr.io/aip-backend-112180822704/aip-backend:latest
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

**Verify**:
```bash
# Test health endpoint
curl https://YOUR-SERVICE-URL/health

# Should return:
# {"status":"ok","database":"connected",...}
```

### 1.3: Update Frontend API URL

Update your frontend environment variable:
```bash
# In your frontend .env.local or production environment
NEXT_PUBLIC_API_URL=https://aip-backend-XXXXX.us-central1.run.app
```

---

## Step 2: Test New Doctor + New Clinic Flow

### Test Case: Complete Join Flow

#### 2.1: Sign Up
- [ ] Go to: `https://ensembledemospace.com/join-us`
- [ ] Click "Sign Up"
- [ ] Enter email: `testdoctor1@example.com`
- [ ] Enter password: `TestPassword123!`
- [ ] Confirm password
- [ ] Agree to terms
- [ ] Click "Sign Up"
- [ ] **Expected**: Redirects to `/join-us/application`

#### 2.2: Fill Application - Step 1 (Basic Details)
- [ ] Full Name: `Dr. Test Doctor One`
- [ ] Credentials: `MD`
- [ ] Specialty: `Cardiology`
- [ ] Phone: `555-123-4567`
- [ ] City: `St. Louis`
- [ ] State: `MO`
- [ ] Practice Selection: **"Create New Practice"**
- [ ] Practice Name: `Test Cardiology Clinic One`
- [ ] Website: `https://testclinic1.com`
- [ ] Click "Continue"
- [ ] **Expected**: Moves to Step 2

#### 2.3: Fill Application - Step 2 (Select Plan)
- [ ] Plans load from API (check network tab)
- [ ] Select a plan (e.g., "Professional")
- [ ] Select billing cycle (Annual/Monthly)
- [ ] Click "Continue"
- [ ] **Expected**: Moves to Step 3

#### 2.4: Fill Application - Step 3 (Payment)
- [ ] Select payment method
- [ ] Click "Continue"
- [ ] **Expected**: Moves to Step 4

#### 2.5: Fill Application - Step 4 (Review & Submit)
- [ ] Review all information
- [ ] Check "I confirm my information is accurate"
- [ ] Click "Submit Join Request"
- [ ] **Expected**: 
  - Redirects to `/join-us/submitted`
  - Approval request created in database
  - No errors in console

#### 2.6: Verify Approval Request Created

**In Database**:
```sql
-- Check request was created
SELECT id, type, requested_by, admin_status, practice_admin_status, created_at
FROM approval_requests
WHERE type = 'new_practice_with_admin_doctor'
ORDER BY created_at DESC
LIMIT 1;

-- Should show:
-- type: 'new_practice_with_admin_doctor'
-- admin_status: 'pending'
-- practice_admin_status: NULL (not required for this type)
```

**In Admin Panel**:
- [ ] Login as admin: `https://ensembledemospace.com/admin/login`
- [ ] Go to: `/admin/requests-v2`
- [ ] See request for `testdoctor1@example.com`
- [ ] Request type: `new_practice_with_admin_doctor`
- [ ] Status: `pending`

#### 2.7: Admin Approves Request

**In Admin Panel**:
- [ ] Click on the request
- [ ] Review details (practice name, doctor info, plan)
- [ ] Click "Approve"
- [ ] Add optional notes
- [ ] Click "Confirm Approval"
- [ ] **Expected**: Request status changes to `approved`

**In Database** (verify records created):
```sql
-- Check practice was created
SELECT id, name, slug, status FROM practices 
WHERE name = 'Test Cardiology Clinic One';

-- Check doctor was created
SELECT id, user_id, practice_id, full_name, specialty, verified 
FROM doctors 
WHERE email = 'testdoctor1@example.com';

-- Check practice role (should be 'admin')
SELECT practice_id, doctor_id, role 
FROM practice_roles 
WHERE doctor_id = (SELECT id FROM doctors WHERE email = 'testdoctor1@example.com');

-- Check membership
SELECT id, doctor_id, plan_id, billing_cycle, status 
FROM memberships 
WHERE doctor_id = (SELECT id FROM doctors WHERE email = 'testdoctor1@example.com');

-- Check user updated
SELECT id, email, role, status 
FROM users 
WHERE email = 'testdoctor1@example.com';
-- Should show: role = 'doctor', status = 'active'
```

#### 2.8: Doctor Can Login

- [ ] Logout from admin (if logged in)
- [ ] Go to: `https://ensembledemospace.com/join-us`
- [ ] Click "Sign In"
- [ ] Email: `testdoctor1@example.com`
- [ ] Password: `TestPassword123!`
- [ ] Click "Sign In"
- [ ] **Expected**: 
  - Redirects to `/doctor/dashboard`
  - Doctor sees dashboard
  - No "Access denied" message
  - Doctor is practice admin

#### 2.9: Verify Doctor Dashboard

- [ ] Dashboard loads without errors
- [ ] Doctor sees practice info
- [ ] Doctor can access practice management
- [ ] Doctor role is "Practice Admin"

---

## Step 3: Test Doctor Joining Existing Practice

### Test Case: Doctor Joins Existing Practice

#### 3.1: Sign Up (Different Doctor)
- [ ] Sign up with: `testdoctor2@example.com`
- [ ] Password: `TestPassword123!`

#### 3.2: Fill Application
- [ ] Select "Join Existing Practice"
- [ ] Choose an existing practice from dropdown
- [ ] Fill other details
- [ ] Submit application
- [ ] **Expected**: Creates `doctor_join_practice` request

#### 3.3: Verify Request Type
```sql
SELECT id, type, practice_id, admin_status, practice_admin_status
FROM approval_requests
WHERE requested_by = (SELECT id FROM users WHERE email = 'testdoctor2@example.com');
-- Should show: type = 'doctor_join_practice'
-- Both admin_status and practice_admin_status should be 'pending'
```

#### 3.4: Practice Admin Approves (if practice has practice admin)
- [ ] Login as practice admin of that practice
- [ ] Go to practice approvals
- [ ] Approve the request
- [ ] **Expected**: `practice_admin_status` = 'approved'

#### 3.5: Admin Approves
- [ ] Login as admin
- [ ] Approve the request
- [ ] **Expected**: 
  - `admin_status` = 'approved'
  - Doctor record created
  - Doctor added to practice
  - User role/status updated

#### 3.6: Doctor Can Login
- [ ] Login as `testdoctor2@example.com`
- [ ] **Expected**: Can access dashboard

---

## Step 4: Test Other Approval Types

### 4.1: Practice Edit Request
- [ ] Practice admin edits practice details
- [ ] Submits approval request
- [ ] Admin approves
- [ ] **Verify**: Practice details updated in database

### 4.2: Location Add Request
- [ ] Practice admin adds location
- [ ] Admin approves
- [ ] **Verify**: Location added to `practice_locations`

### 4.3: Location Edit Request
- [ ] Practice admin edits location
- [ ] Admin approves
- [ ] **Verify**: Location updated

### 4.4: Location Remove Request
- [ ] Practice admin removes location (not last one)
- [ ] Admin approves
- [ ] **Verify**: Location removed

### 4.5: Services/Insurance Change
- [ ] Practice admin updates services/insurance
- [ ] Admin approves
- [ ] **Verify**: Records updated in `practice_services`/`practice_insurance`

### 4.6: Doctor Add Request
- [ ] Practice admin invites doctor
- [ ] Admin approves
- [ ] **Verify**: Doctor added to practice

### 4.7: Doctor Remove Request
- [ ] Practice admin removes doctor (not last practice admin)
- [ ] Admin approves
- [ ] **Verify**: Doctor removed from practice

---

## Step 5: Verify No LocalStorage Usage

### Check Browser:
- [ ] Open browser DevTools → Application → Local Storage
- [ ] Check that NO approval request data is stored
- [ ] Only `aip_doctor_token`, `aip_doctor_user`, `aip_join_email`, `aip_join_request_draft` should exist
- [ ] NO `aip_join_requests` or `aip_approval_requests` keys

### Check Network Tab:
- [ ] All API calls go to GCP Cloud Run URL
- [ ] No localhost calls
- [ ] All requests return 200/201 status

---

## Step 6: Monitor Logs

### Cloud Run Logs:
```bash
# Watch logs in real-time
gcloud run services logs tail aip-backend --region us-central1

# Check for errors
gcloud run services logs read aip-backend --region us-central1 --limit 100 | grep -i error
```

**Look for**:
- ✅ "Database connection successful"
- ✅ "Side effects applied successfully"
- ❌ "Error applying approval side effects"
- ❌ "Database pool error"

---

## Success Criteria

✅ **All tests pass**:
- New doctor can sign up
- Application creates approval request via API
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

✅ **All approval types work**:
- Practice edits
- Location changes
- Services/insurance updates
- Doctor add/remove

---

## Troubleshooting

### Issue: Backend not connecting to database
**Solution**:
1. Check Cloud Run logs
2. Verify `DB_SOCKET_PATH` is correct
3. Verify Cloud SQL instance is running
4. Check Cloud SQL connection name matches

### Issue: Approval side effects not running
**Solution**:
1. Check logs for errors
2. Verify both approvals are complete (for types requiring both)
3. Check database for created records
4. Manually verify approval statuses

### Issue: Frontend can't connect to backend
**Solution**:
1. Verify `NEXT_PUBLIC_API_URL` is set
2. Check CORS settings in backend
3. Check browser console for errors
4. Verify backend is deployed and running

### Issue: Doctor can't login after approval
**Solution**:
1. Check user role/status in database
2. Verify JWT token is valid
3. Check backend logs for login errors
4. Verify user.status = 'active' and user.role = 'doctor'

---

## Quick Test Commands

```bash
# Test backend health
curl https://YOUR-SERVICE-URL/health

# Test approval requests (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://YOUR-SERVICE-URL/api/approval-requests

# Check Cloud Run logs
gcloud run services logs read aip-backend --region us-central1 --limit 50

# Check database connection
gcloud sql connect YOUR_INSTANCE_NAME --user=postgres
```

---

## Next Steps After Testing

1. ✅ Monitor Cloud Run metrics
2. ✅ Set up alerting for errors
3. ✅ Document any issues found
4. ✅ Update production environment variables
5. ✅ Test with real data (if safe)
