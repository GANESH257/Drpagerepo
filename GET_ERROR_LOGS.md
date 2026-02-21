# Get Error Logs from Cloud Run

## The Problem
You're getting `{"error":"Internal server error"}` but need to see the actual error.

## Solution: Check Cloud Run Logs

### Option 1: Using gcloud CLI (Recommended)

```bash
# Get the last 100 log entries and filter for errors
gcloud run services logs read aip-backend --region us-central1 --limit 100 | grep -A 20 "Error approving"

# Or view all recent logs
gcloud run services logs read aip-backend --region us-central1 --limit 50
```

### Option 2: Using Google Cloud Console

1. Go to: https://console.cloud.google.com/run
2. Click on `aip-backend` service
3. Click on "Logs" tab
4. Filter by: `Error approving` or `Error details`
5. Look for entries around the time you made the request (23:38:59 GMT)

### What to Look For

The logs should show:
```
Error approving request: [actual error object]
Error details: {
  message: "...",
  stack: "...",
  code: "...",
  detail: "...",
  constraint: "..."
}
```

## Common Errors You Might See

### 1. Missing Column Error
```
column "some_column" does not exist
```
**Fix:** Run the SQL migration again

### 2. Foreign Key Constraint Error
```
insert or update on table "..." violates foreign key constraint
```
**Fix:** The referenced record doesn't exist (e.g., user_id, practice_id)

### 3. Not Null Constraint Error
```
null value in column "..." violates not-null constraint
```
**Fix:** Missing required field in the payload

### 4. Unique Constraint Error
```
duplicate key value violates unique constraint
```
**Fix:** Trying to insert a duplicate ID or unique field

## After Getting the Error

1. **Copy the full error message** from Cloud Run logs
2. **Share it with me** - I'll help fix it
3. The error will tell us exactly what's wrong

---

**Note:** The error response only shows `{"error":"Internal server error"}` for security, but the detailed error is logged in Cloud Run. That's why we need to check the logs!
