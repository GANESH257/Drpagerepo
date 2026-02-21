# Fixed Approval History Column Mismatch

## Problem
The database table `approval_history` uses:
- `actor_id` (NOT NULL)
- `actor_type` (enum, NOT NULL)

But the code was trying to insert:
- `performed_by`
- `performed_by_type`

This caused: `null value in column "actor_id" violates not-null constraint`

## Solution
Updated all `INSERT INTO approval_history` statements in `aip-backend/src/routes/approval-requests.ts` to use:
- `actor_id` instead of `performed_by`
- `actor_type` instead of `performed_by_type`

## Files Changed
- `aip-backend/src/routes/approval-requests.ts` (4 INSERT statements updated)

## Next Steps
1. **Redeploy the backend:**
   ```bash
   cd aip-backend
   gcloud builds submit --tag gcr.io/aip-backend-112180822704/aip-backend:latest
   gcloud run deploy aip-backend \
     --image gcr.io/aip-backend-112180822704/aip-backend:latest \
     --region us-central1 \
     --platform managed
   ```

2. **Test approval again** - It should work now!

## Note
The database schema uses enum types (`history_actor_type`, `approval_action`), but PostgreSQL accepts string literals that match enum values, so the code should work as-is.
