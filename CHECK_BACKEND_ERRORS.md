# Check Backend Errors - 500 Error on Approval

## Issue
Getting 500 Internal Server Error when approving request from admin panel.

## Debug Steps

### 1. Check Cloud Run Logs

```bash
gcloud run services logs read aip-backend --region us-central1 --limit 50
```

Look for:
- "Error approving request:" - This will show the actual error
- Database connection errors
- SQL syntax errors
- Missing table/column errors

### 2. Common Causes

#### A. Missing Database Tables/Columns
The migration might not have been run. Check if these tables exist:
- `approval_requests` (with `admin_reviewed_at`, `practice_admin_status` columns)
- `approval_history`
- `practice_roles`
- `practice_locations`
- `practice_services`
- `practice_insurance`
- `practice_specialties`

#### B. Missing Columns in approval_requests
Check if these columns exist:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'approval_requests';
```

Should have:
- `admin_reviewed_at`
- `practice_admin_status`
- `practice_admin_notes`
- `practice_admin_reviewed_at`

#### C. Error in applyApprovalSideEffects
The function might be failing due to:
- Missing user record
- Missing practice (for doctor_join_practice)
- Invalid payload structure
- SQL constraint violations

### 3. Quick Fix: Check Logs First

Run this to see the actual error:
```bash
gcloud run services logs read aip-backend --region us-central1 --limit 100 | grep -A 10 "Error approving"
```

### 4. Verify Migration Was Run

```bash
gcloud sql connect aip-database --user=postgres
\c aip_production
\d approval_requests
\d approval_history
```

### 5. Test Approval Endpoint Directly

```bash
# Get your token first (from browser localStorage)
TOKEN="your-admin-token"

# Test approve endpoint
curl -X POST \
  https://aip-backend-112180822704.us-central1.run.app/api/approval-requests/req-1771630284266-60wvtgueu/approve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Test approval"}'
```

---

## Most Likely Issue

**Missing database columns** - The migration might not have been run, so `admin_reviewed_at` or other columns don't exist.

**Solution**: Run the SQL migration:
```bash
gcloud sql connect aip-database --user=postgres
\c aip_production
\i migrations/001_approval_requests_schema.sql
```

---

## Next Steps

1. Check Cloud Run logs for actual error message
2. Verify migration was run
3. Check if tables/columns exist
4. Share the error message from logs
