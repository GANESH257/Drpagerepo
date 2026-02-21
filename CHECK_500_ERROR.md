# Check 500 Error on Approval

## ✅ Database Schema Verified
All required columns exist in `approval_requests` table:
- `admin_reviewed_at` ✅
- `practice_admin_status` ✅
- `practice_admin_notes` ✅
- `practice_admin_reviewed_at` ✅

## 🔍 Step 1: Check Cloud Run Logs

Run this command to see the detailed error:

```bash
gcloud run services logs read aip-backend --region us-central1 --limit 100 | grep -A 15 "Error approving"
```

Or view all recent logs:
```bash
gcloud run services logs read aip-backend --region us-central1 --limit 50
```

**Look for:**
- `Error approving request:` - Shows the main error
- `Error details:` - Shows `message`, `code`, `detail`, `constraint`
- Any SQL errors or constraint violations

## 🔄 Step 2: Verify Backend is Deployed

The backend code has enhanced error logging. Make sure it's deployed:

```bash
cd aip-backend
gcloud builds submit --tag gcr.io/aip-backend-112180822704/aip-backend:latest
gcloud run deploy aip-backend \
  --image gcr.io/aip-backend-112180822704/aip-backend:latest \
  --region us-central1 \
  --platform managed
```

## 🐛 Common Issues

### A. Missing User Record
If `applyApprovalSideEffects` tries to reference a user that doesn't exist.

### B. Invalid Payload Structure
The `payload` JSON might be missing required fields for the approval type.

### C. SQL Constraint Violation
A foreign key or unique constraint might be failing.

### D. Transaction Error
The transaction might be failing due to a database connection issue.

## 📋 Next Steps

1. **Check logs first** - This will tell us exactly what's failing
2. **Share the error message** - Copy the full error from Cloud Run logs
3. **Fix based on error** - We'll address the specific issue

---

**The error logging in the backend will show:**
- `error.message`
- `error.code` (PostgreSQL error code)
- `error.detail` (Detailed SQL error)
- `error.constraint` (Which constraint failed)

This will pinpoint the exact issue!
