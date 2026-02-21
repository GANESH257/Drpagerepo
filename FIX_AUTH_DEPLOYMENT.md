# Fix: Upload auth.ts and Redeploy

## Issue
Error: "Account is not active" when trying to login during join flow.

## Root Cause
The deployed backend might have an older version of `auth.ts` that blocks pending users. The local version allows pending users (lines 35-40).

## Solution

### Step 1: Upload auth.ts to GCP

**In Cloud Shell**:
```bash
cd ~/aip-backend

# Option 1: Use Cloud Shell Editor
# Click "Open Editor" → Navigate to src/routes/auth.ts
# Copy entire file from local and paste

# Option 2: Use nano to edit
nano src/routes/auth.ts
# Copy-paste entire file contents
```

**Verify the file has these lines** (around line 35-40):
```typescript
// Allow pending users to login (for approval request submission)
// Frontend will handle restricting dashboard access for pending users
// Only block suspended/deleted users
if (user.status === 'suspended' || user.status === 'deleted') {
  return res.status(403).json({ error: 'Account is suspended or deleted' });
}
```

### Step 2: Rebuild and Redeploy

```bash
cd ~/aip-backend

# Build new image
gcloud builds submit --tag us-central1-docker.pkg.dev/ensemble-portal/aip-backend/aip-backend:latest

# Redeploy
gcloud run deploy aip-backend \
  --image us-central1-docker.pkg.dev/ensemble-portal/aip-backend/aip-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances ensemble-portal:us-central1:aip-database \
  --set-env-vars "DB_SOCKET_PATH=/cloudsql/ensemble-portal:us-central1:aip-database" \
  --set-env-vars "DB_NAME=aip_production" \
  --set-env-vars "DB_USER=postgres" \
  --set-env-vars "DB_PASSWORD=TechsoDream2021!" \
  --set-env-vars "JWT_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890+/=" \
  --set-env-vars "JWT_EXPIRES_IN=7d" \
  --set-env-vars "FRONTEND_URL=https://ensembledemospace.com" \
  --set-env-vars "FRONTEND_URL_WWW=https://www.ensembledemospace.com" \
  --set-env-vars "NODE_ENV=production"
```

### Step 3: Test

After redeployment, test the join flow again:
1. Sign up as new doctor
2. Fill application
3. Submit
4. ✅ Should work now - pending users can login

---

## Verification

After redeployment, check logs:
```bash
gcloud run services logs read aip-backend --region us-central1 --limit 20
```

Look for login attempts - should see successful logins for pending users.

---

## Expected Behavior

- ✅ Pending users (`status='pending'`) can login
- ✅ Suspended users (`status='suspended'`) are blocked
- ✅ Deleted users (`status='deleted'`) are blocked
- ✅ Active users (`status='active'`) can login
