# ALL Files That Need to Be Uploaded to GCP

## ⚠️ CRITICAL: Upload These 2 Files

### 1. `aip-backend/src/routes/auth.ts` ⚠️ **MUST UPLOAD**
**Why**: Allows pending users to login (required for join flow)
**Key lines**: 35-40
```typescript
// Allow pending users to login (for approval request submission)
// Frontend will handle restricting dashboard access for pending users
// Only block suspended/deleted users
if (user.status === 'suspended' || user.status === 'deleted') {
  return res.status(403).json({ error: 'Account is suspended or deleted' });
}
```

### 2. `aip-backend/src/routes/approval-requests.ts` ⚠️ **MUST UPLOAD**
**Why**: Contains `applyApprovalSideEffects` function that creates practice/doctor/membership records
**Key changes**:
- Added `applyApprovalSideEffects` function (lines 357-786)
- Modified approve endpoint with transactions and side effects
- Added practice admin approval logic

---

## ✅ Files That DON'T Need Uploading

- ✅ `aip-backend/src/routes/membership-plans.ts` - No changes
- ✅ `aip-backend/src/routes/join-requests.ts` - No changes (uses approval-requests internally)
- ✅ `aip-backend/src/routes/doctors.ts` - No changes
- ✅ `aip-backend/src/routes/practices.ts` - No changes
- ✅ `aip-backend/src/routes/departments.ts` - No changes
- ✅ `aip-backend/src/routes/referrals.ts` - No changes
- ✅ `aip-backend/src/routes/appointments.ts` - No changes
- ✅ `aip-backend/src/routes/messages.ts` - No changes
- ✅ `aip-backend/src/routes/notifications.ts` - No changes
- ✅ `aip-backend/src/routes/policies.ts` - No changes
- ✅ `aip-backend/src/routes/events.ts` - No changes
- ✅ `aip-backend/src/index.ts` - No changes
- ✅ `aip-backend/src/middleware/auth.ts` - No changes
- ✅ `aip-backend/src/db/connection.ts` - No changes

---

## Upload Commands

### In Cloud Shell:

```bash
cd ~/aip-backend

# Upload auth.ts
nano src/routes/auth.ts
# Copy-paste entire file from local

# Upload approval-requests.ts
nano src/routes/approval-requests.ts
# Copy-paste entire file from local
```

---

## Then Rebuild and Redeploy

```bash
# Build
gcloud builds submit --tag us-central1-docker.pkg.dev/ensemble-portal/aip-backend/aip-backend:latest

# Deploy
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

---

## Summary

**TOTAL FILES TO UPLOAD: 2**
1. ✅ `aip-backend/src/routes/auth.ts`
2. ✅ `aip-backend/src/routes/approval-requests.ts`

**PLUS**: Run SQL migration (`001_approval_requests_schema.sql`)

**That's it!** No other files need uploading.
