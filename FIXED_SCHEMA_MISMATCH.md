# Fixed Schema Mismatch - approval_history Table

## Problem
The database table `approval_history` uses columns:
- `actor_id` (NOT NULL)
- `actor_type` (NOT NULL)

But the backend code was trying to INSERT using:
- `performed_by`
- `performed_by_type`

This caused the error: `null value in column "actor_id" of relation "approval_history" violates not-null constraint`

## Root Cause
There are two different schemas in the codebase:
1. **Old schema** (in `docs/CLOUD_SQL_MIGRATION.sql`): Uses `actor_id` and `actor_type`
2. **New schema** (in `001_approval_requests_schema.sql`): Uses `performed_by` and `performed_by_type`

The database was created with the **old schema**, but the code was written for the **new schema**.

## Solution

### Backend Changes ✅
Updated all INSERT statements in `aip-backend/src/routes/approval-requests.ts` to use:
- `actor_id` instead of `performed_by`
- `actor_type` instead of `performed_by_type`

**Files updated:**
- `aip-backend/src/routes/approval-requests.ts` (4 INSERT statements updated)

### Frontend Changes ✅
Updated frontend code to handle both schemas (backward compatibility):
- `src/lib/services/approvalEngine.ts` - Updated `getApprovalTimeline()` function
- `src/app/admin/history/approvals/page.tsx` - Updated history transformation

**Files updated:**
- `src/lib/services/approvalEngine.ts`
- `src/app/admin/history/approvals/page.tsx`

The frontend now checks for both `actor_id`/`actor_type` (new) and `performed_by`/`performed_by_type` (old) for backward compatibility.

## Next Steps

1. **Redeploy backend** with the updated INSERT statements:
   ```bash
   cd aip-backend
   gcloud builds submit --tag gcr.io/aip-backend-112180822704/aip-backend:latest
   gcloud run deploy aip-backend \
     --image gcr.io/aip-backend-112180822704/aip-backend:latest \
     --region us-central1 \
     --platform managed
   ```

2. **Rebuild frontend** (if needed):
   ```bash
   npm run build
   ```

3. **Test approval flow** - The approval should now work correctly!

## Verification

After redeploying, test:
1. Admin approves a request ✅
2. Practice admin approves a request ✅
3. Admin rejects a request ✅
4. Practice admin rejects a request ✅

All should work without the `actor_id` null constraint error.
