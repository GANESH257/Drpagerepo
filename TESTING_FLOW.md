# Testing Flow After Deployment

## Setup

### Frontend (Local)
```bash
# Make sure NEXT_PUBLIC_API_URL points to your GCP backend
# In .env.local:
NEXT_PUBLIC_API_URL=https://aip-backend-XXXXX.us-central1.run.app

# Run frontend locally
npm run dev
# Opens at http://localhost:3000
```

### Backend (GCP)
- ✅ Already deployed to Cloud Run
- ✅ Connected to Cloud SQL
- ✅ All endpoints working

---

## Complete Test Flow

### Step 1: Sign Up as New Doctor

1. **Go to**: `http://localhost:3000/join-us`
2. **Click**: "Sign Up"
3. **Enter**:
   - Email: `testdoctor@example.com`
   - Password: `TestPassword123!`
   - Confirm password
   - Agree to terms
4. **Click**: "Sign Up"
5. **Expected**: Redirects to `/join-us/application`

**What happens**:
- ✅ User created in Cloud SQL with `role='applicant'`, `status='pending'`
- ✅ Password stored temporarily in `sessionStorage` for silent login

---

### Step 2: Fill Application Form

#### Step 2.1: Basic Details
- Full Name: `Dr. Test Doctor`
- Credentials: `MD`
- Specialty: `Cardiology`
- Phone: `555-123-4567`
- City: `St. Louis`
- State: `MO`
- **Practice Selection**: **"Create New Practice"**
- Practice Name: `Test Cardiology Clinic`
- Website: `https://testclinic.com`
- **Click**: "Continue"

**What happens**:
- ✅ Draft saved to `localStorage` (for UX)
- ✅ Plans loaded from GCP API

#### Step 2.2: Select Plan
- Select a membership plan (e.g., "Professional")
- Billing: Annual or Monthly
- **Click**: "Continue"

**What happens**:
- ✅ Plans loaded from GCP API (`/api/membership-plans`)

#### Step 2.3: Payment
- Select payment method
- **Click**: "Continue"

#### Step 2.4: Review & Submit
- Review all information
- Check "I confirm my information is accurate"
- **Click**: "Submit Join Request"

**What happens**:
- ✅ Silent login to GCP backend (gets JWT token)
- ✅ Creates approval request via API (`POST /api/approval-requests`)
- ✅ Request stored in Cloud SQL with `type='new_practice_with_admin_doctor'`
- ✅ `admin_status='pending'`, `practice_admin_status=NULL` (not required)
- ✅ Redirects to `/join-us/submitted`

---

### Step 3: Login as Admin and Approve

1. **Go to**: `http://localhost:3000/admin/login`
2. **Login** with admin credentials
3. **Go to**: `/admin/requests-v2`
4. **Find** request for `testdoctor@example.com`
5. **Click** on the request
6. **Click**: "Approve"
7. **Add notes** (optional)
8. **Click**: "Confirm Approval"

**What happens**:
- ✅ Backend receives `POST /api/approval-requests/:id/approve`
- ✅ Updates `admin_status='approved'` in Cloud SQL
- ✅ Checks if side effects should run (only admin approval needed for `new_practice_with_admin_doctor`)
- ✅ **Calls `applyApprovalSideEffects()`**:
  - Creates practice record in `practices` table
  - Creates doctor record in `doctors` table
  - Creates practice role in `practice_roles` table (`role='admin'`)
  - Creates membership record in `memberships` table
  - **Updates user**: `role='doctor'`, `status='active'`
- ✅ Request status shows as `approved`

---

### Step 4: Login as New Doctor (Practice Admin)

1. **Logout** from admin (if logged in)
2. **Go to**: `http://localhost:3000/join-us`
3. **Click**: "Sign In"
4. **Enter**:
   - Email: `testdoctor@example.com`
   - Password: `TestPassword123!`
5. **Click**: "Sign In"

**What happens**:
- ✅ Frontend calls `POST /api/auth/login` on GCP backend
- ✅ Backend checks user: `role='doctor'`, `status='active'` ✅
- ✅ Returns JWT token with `role='doctor'`, `doctorId` set
- ✅ Frontend stores token in `localStorage`
- ✅ Redirects to `/doctor/dashboard`

**Expected Result**:
- ✅ Doctor sees dashboard
- ✅ Doctor is practice admin of "Test Cardiology Clinic"
- ✅ Doctor can access practice management
- ✅ No "Access denied" or "Pending approval" message

---

## Verification Queries (Optional)

You can verify in Cloud SQL:

```sql
-- Check user was updated
SELECT email, role, status FROM users WHERE email = 'testdoctor@example.com';
-- Should show: role='doctor', status='active'

-- Check practice was created
SELECT id, name, status FROM practices WHERE name = 'Test Cardiology Clinic';

-- Check doctor was created
SELECT id, user_id, practice_id, full_name, verified FROM doctors 
WHERE email = 'testdoctor@example.com';

-- Check practice role
SELECT practice_id, doctor_id, role FROM practice_roles 
WHERE doctor_id = (SELECT id FROM doctors WHERE email = 'testdoctor@example.com');
-- Should show: role='admin'

-- Check membership
SELECT doctor_id, plan_id, status FROM memberships 
WHERE doctor_id = (SELECT id FROM doctors WHERE email = 'testdoctor@example.com');
```

---

## Important Notes

### ✅ What Works:
- Frontend runs locally (`npm run dev`)
- Frontend connects to GCP backend (via `NEXT_PUBLIC_API_URL`)
- All API calls go to GCP Cloud Run
- All data stored in GCP Cloud SQL
- No localhost backend needed
- No local database needed

### ⚠️ Requirements:
- `NEXT_PUBLIC_API_URL` must point to your GCP Cloud Run URL
- Backend must be deployed and running on GCP
- Cloud SQL must be accessible from Cloud Run
- SQL migration must be run

### 🔍 Troubleshooting:

**If doctor can't login after approval**:
1. Check user role/status in database: `SELECT role, status FROM users WHERE email = '...'`
2. Should be: `role='doctor'`, `status='active'`
3. If not, check Cloud Run logs for errors in `applyApprovalSideEffects`

**If approval doesn't create records**:
1. Check Cloud Run logs: `gcloud run services logs read aip-backend --region us-central1`
2. Look for "Error applying approval side effects"
3. Verify SQL migration was run

**If frontend can't connect to backend**:
1. Check `NEXT_PUBLIC_API_URL` in `.env.local`
2. Test backend health: `curl https://YOUR-BACKEND-URL/health`
3. Check browser console for CORS errors

---

## Summary

✅ **YES, you can**:
1. Run frontend locally (`npm run dev`)
2. Join as doctor → Creates approval request on GCP
3. Login as admin → Approve request on GCP
4. Backend creates all records automatically on GCP
5. Login as new doctor → Access dashboard as practice admin

**Everything works end-to-end!** 🎉
