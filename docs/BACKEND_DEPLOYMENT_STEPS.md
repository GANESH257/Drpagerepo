# Backend Deployment Steps - Cloud Run

**Date**: January 29, 2026  
**Status**: Ready for Deployment

---

## Prerequisites

✅ Cloud SQL PostgreSQL instance created  
✅ Database schema migrated (all tables exist)  
✅ `gcloud` CLI installed and authenticated  
✅ Project ID: `aip-backend-112180822704`  
✅ Region: `us-central1`

---

## Step 1: Prepare Files for Cloud Shell

Since you're working locally, you need to upload the new backend files to Cloud Shell:

### Files to Upload:
1. **All new route files**:
   - `aip-backend/src/routes/departments.ts`
   - `aip-backend/src/routes/membership-plans.ts`
   - `aip-backend/src/routes/approval-requests.ts`
   - `aip-backend/src/routes/referrals.ts`
   - `aip-backend/src/routes/appointments.ts`
   - `aip-backend/src/routes/messages.ts`
   - `aip-backend/src/routes/notifications.ts`

2. **Updated files**:
   - `aip-backend/src/index.ts` (has new route imports)
   - `aip-backend/src/routes/doctors.ts` (updated with filters)
   - `aip-backend/src/routes/practices.ts` (updated with filters)

### Upload Method:
**Option A: Using Cloud Shell Editor**
1. Open Cloud Shell: https://shell.cloud.google.com
2. Click "Open Editor" (pencil icon)
3. Navigate to your backend directory
4. Upload files via drag-and-drop or "Upload" button

**Option B: Using `gcloud` CLI (if you have it locally)**
```bash
# From your local machine
cd /path/to/EnsembleDrPage-main/aip-backend

# Upload files to Cloud Shell
gcloud cloud-shell scp --recurse src/routes/*.ts user@cloudshell:~/aip-backend/src/routes/
gcloud cloud-shell scp src/index.ts user@cloudshell:~/aip-backend/src/index.ts
```

**Option C: Manual Copy-Paste**
1. Open files locally
2. Copy content
3. Open Cloud Shell Editor
4. Create/edit files and paste content

---

## Step 2: Connect to Cloud Shell

1. Go to: https://shell.cloud.google.com
2. Make sure you're in the correct project:
   ```bash
   gcloud config set project aip-backend-112180822704
   ```

3. Navigate to backend directory:
   ```bash
   cd ~/aip-backend
   # Or wherever your backend code is located
   ```

---

## Step 3: Verify Files Are Present

Check that all new route files exist:
```bash
ls -la src/routes/
```

You should see:
- `auth.ts`
- `doctors.ts`
- `practices.ts`
- `departments.ts` ✅ NEW
- `membership-plans.ts` ✅ NEW
- `approval-requests.ts` ✅ NEW
- `referrals.ts` ✅ NEW
- `appointments.ts` ✅ NEW
- `messages.ts` ✅ NEW
- `notifications.ts` ✅ NEW

Verify `src/index.ts` has all imports:
```bash
grep "import.*Routes" src/index.ts
```

---

## Step 4: Install Dependencies (if needed)

If you added any new npm packages:
```bash
npm install
```

Check `package.json` for any new dependencies (we didn't add any, but verify).

---

## Step 5: Get Cloud SQL Connection Name

```bash
gcloud sql instances describe YOUR_INSTANCE_NAME --format="value(connectionName)"
```

**Replace `YOUR_INSTANCE_NAME`** with your actual Cloud SQL instance name.

**Example output**: `aip-backend-112180822704:us-central1:aip-production`

**Save this value** - you'll need it in the next step.

---

## Step 6: Build Docker Image

```bash
gcloud builds submit --tag gcr.io/aip-backend-112180822704/aip-backend:latest
```

This will:
- Build your Docker image
- Push it to Google Container Registry
- Take 2-5 minutes

**Watch for errors** - if build fails, check:
- All TypeScript files compile (`npm run build` locally first)
- Dockerfile is correct
- No syntax errors in route files

---

## Step 7: Deploy to Cloud Run

**IMPORTANT**: Use the Cloud SQL connection name from Step 5.

```bash
gcloud run deploy aip-backend \
  --image gcr.io/aip-backend-112180822704/aip-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances YOUR_CONNECTION_NAME \
  --set-env-vars "DB_SOCKET_PATH=/cloudsql/YOUR_CONNECTION_NAME" \
  --set-env-vars "DB_NAME=aip_production" \
  --set-env-vars "DB_USER=postgres" \
  --set-env-vars "DB_PASSWORD=YOUR_DB_PASSWORD" \
  --set-env-vars "JWT_SECRET=YOUR_JWT_SECRET" \
  --set-env-vars "NODE_ENV=production"
```

**Replace**:
- `YOUR_CONNECTION_NAME` - From Step 5
- `YOUR_DB_PASSWORD` - Your Cloud SQL password
- `YOUR_JWT_SECRET` - Your JWT secret (same as before)

**Example**:
```bash
gcloud run deploy aip-backend \
  --image gcr.io/aip-backend-112180822704/aip-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances aip-backend-112180822704:us-central1:aip-production \
  --set-env-vars "DB_SOCKET_PATH=/cloudsql/aip-backend-112180822704:us-central1:aip-production" \
  --set-env-vars "DB_NAME=aip_production" \
  --set-env-vars "DB_USER=postgres" \
  --set-env-vars "DB_PASSWORD=YourSecurePassword123!" \
  --set-env-vars "JWT_SECRET=your-super-secret-jwt-key-change-this" \
  --set-env-vars "NODE_ENV=production"
```

**Deployment takes 2-5 minutes**. Wait for success message.

---

## Step 8: Get Service URL

After deployment completes, you'll see:
```
Service URL: https://aip-backend-XXXXX.us-central1.run.app
```

**Save this URL** - this is your backend API URL.

---

## Step 9: Test Deployment

### Test Health Endpoint:
```bash
curl https://YOUR-SERVICE-URL/health
```

**Expected response**:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-01-29T...",
  "dbTime": "..."
}
```

### Test New Endpoints:
```bash
# Test departments endpoint
curl https://YOUR-SERVICE-URL/api/departments

# Test membership plans
curl https://YOUR-SERVICE-URL/api/membership-plans

# Test doctors endpoint (with filters)
curl "https://YOUR-SERVICE-URL/api/doctors?page=1&limit=10"
```

---

## Step 10: Update Frontend Environment Variable

In your **local frontend** `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://YOUR-SERVICE-URL
```

**Replace `YOUR-SERVICE-URL`** with the URL from Step 8.

---

## ✅ Testing Locally After Deployment

**YES, you can test locally!** Here's how:

### 1. Start Local Frontend Dev Server:
```bash
cd /Users/ganesh/Desktop/DRPLatest/EnsembleDrPage-main
npm run dev
```

### 2. Frontend Will Use Deployed Backend:
- Your local frontend (`localhost:3000`) will make API calls to the deployed Cloud Run backend
- No need to run backend locally
- All API calls go to: `https://YOUR-SERVICE-URL`

### 3. Test Authentication:
- Go to: http://localhost:3000/join-us
- Try sign-up and sign-in
- Check browser Network tab to see API calls

### 4. Test Doctor Listing:
- Go to: http://localhost:3000/doctors
- Should load doctors from API
- Check browser Console for any errors

### 5. Test Dashboard:
- Sign in as a doctor
- Go to dashboard
- Should load doctor profile from API

---

## Troubleshooting

### Build Fails:
```bash
# Test build locally first
cd aip-backend
npm run build
# Fix any TypeScript errors
```

### Deployment Fails:
- Check Cloud SQL connection name is correct
- Verify environment variables are set correctly
- Check Cloud Run logs: `gcloud run logs read aip-backend --region us-central1`

### Database Connection Fails:
- Verify `DB_SOCKET_PATH` matches connection name exactly
- Check Cloud SQL instance is running
- Verify Cloud Run service account has Cloud SQL Client role

### API Returns 500 Errors:
- Check Cloud Run logs for errors
- Verify database tables exist
- Test database connection manually

---

## Quick Reference Commands

```bash
# View logs
gcloud run logs read aip-backend --region us-central1 --limit 50

# Update environment variables
gcloud run services update aip-backend \
  --region us-central1 \
  --update-env-vars "KEY=VALUE"

# Redeploy (after code changes)
gcloud builds submit --tag gcr.io/aip-backend-112180822704/aip-backend:latest
gcloud run deploy aip-backend \
  --image gcr.io/aip-backend-112180822704/aip-backend:latest \
  --region us-central1 \
  --add-cloudsql-instances YOUR_CONNECTION_NAME \
  --set-env-vars "DB_SOCKET_PATH=/cloudsql/YOUR_CONNECTION_NAME" \
  --set-env-vars "DB_NAME=aip_production" \
  --set-env-vars "DB_USER=postgres" \
  --set-env-vars "DB_PASSWORD=YOUR_PASSWORD" \
  --set-env-vars "JWT_SECRET=YOUR_SECRET"
```

---

## Next Steps After Deployment

1. ✅ Backend deployed and tested
2. ⚠️ Test frontend locally against deployed backend
3. ⚠️ Complete remaining frontend component migrations
4. ⚠️ Deploy frontend to GoDaddy

---

## Summary

**Backend Deployment**: Upload files → Build → Deploy → Test  
**Local Testing**: Start frontend dev server → It uses deployed backend automatically  
**No Local Backend Needed**: Frontend connects to Cloud Run backend

**Estimated Time**: 15-30 minutes for deployment
