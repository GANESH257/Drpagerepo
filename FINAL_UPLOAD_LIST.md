# FINAL LIST: All Files to Upload to GCP

## ⚠️ ONLY 2 FILES NEED UPLOADING

### 1. `aip-backend/src/routes/auth.ts` ✅ **MUST UPLOAD**
**Reason**: Allows pending users to login (lines 35-40)
**Critical code**:
```typescript
// Allow pending users to login (for approval request submission)
if (user.status === 'suspended' || user.status === 'deleted') {
  return res.status(403).json({ error: 'Account is suspended or deleted' });
}
// NO check for status === 'active' - allows pending users
```

### 2. `aip-backend/src/routes/approval-requests.ts` ✅ **MUST UPLOAD**
**Reason**: Contains `applyApprovalSideEffects` function that creates records on approval
**Critical code**: Lines 357-786 (entire function)

---

## ✅ Verified: No Other Files Changed

Checked all route files:
- ✅ `membership-plans.ts` - No changes
- ✅ `join-requests.ts` - No changes
- ✅ `doctors.ts` - No changes
- ✅ `practices.ts` - No changes (only checks `status = 'active'` for queries, not login)
- ✅ `departments.ts` - No changes
- ✅ `referrals.ts` - No changes
- ✅ `appointments.ts` - No changes
- ✅ `messages.ts` - No changes
- ✅ `notifications.ts` - No changes
- ✅ `policies.ts` - No changes
- ✅ `events.ts` - No changes
- ✅ `index.ts` - No changes
- ✅ `middleware/auth.ts` - No changes
- ✅ `db/connection.ts` - No changes

---

## Upload Steps

```bash
cd ~/aip-backend

# Upload auth.ts
nano src/routes/auth.ts
# Copy entire file from local, paste, save (Ctrl+X, Y, Enter)

# Upload approval-requests.ts  
nano src/routes/approval-requests.ts
# Copy entire file from local, paste, save (Ctrl+X, Y, Enter)
```

---

## Then Rebuild & Deploy

```bash
gcloud builds submit --tag us-central1-docker.pkg.dev/ensemble-portal/aip-backend/aip-backend:latest

gcloud run deploy aip-backend \
  --image us-central1-docker.pkg.dev/ensemble-portal/aip-backend/aip-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances ensemble-portal:us-central1:aip-database \
  --set-env-vars "DB_SOCKET_PATH=/cloudsql/ensemble-portal:us-central1:aip-database,DB_NAME=aip_production,DB_USER=postgres,DB_PASSWORD=TechsoDream2021!,JWT_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890+/=,JWT_EXPIRES_IN=7d,FRONTEND_URL=https://ensembledemospace.com,FRONTEND_URL_WWW=https://www.ensembledemospace.com,NODE_ENV=production"
```

---

## Summary

**TOTAL: 2 FILES**
1. `auth.ts`
2. `approval-requests.ts`

**PLUS**: SQL migration (already done or needs to be done)

**NO OTHER FILES NEED UPLOADING** ✅
