# Build and Deploy - Step by Step

**Status**: Files uploaded ✅  
**Next**: Build → Deploy → Test

---

## Step 1: Verify Files Are Uploaded

In Cloud Shell, verify all files exist:

```bash
cd ~/aip-backend

# Check route files
ls -la src/routes/

# Should see 10 files:
# - auth.ts
# - doctors.ts
# - practices.ts
# - departments.ts ✅
# - membership-plans.ts ✅
# - approval-requests.ts ✅
# - referrals.ts ✅
# - appointments.ts ✅
# - messages.ts ✅
# - notifications.ts ✅

# Verify index.ts has new imports
grep "departments\|membership\|approval\|referral\|appointment\|message\|notification" src/index.ts
```

---

## Step 2: Get Cloud SQL Connection Name

**IMPORTANT**: You need this for deployment!

```bash
gcloud sql instances list
```

Find your instance name, then get connection name:

```bash
gcloud sql instances describe YOUR_INSTANCE_NAME --format="value(connectionName)"
```

**Example output**: `aip-backend-112180822704:us-central1:aip-production`

**Save this value** - you'll need it in Step 4.

---

## Step 3: Build Docker Image

```bash
cd ~/aip-backend

gcloud builds submit --tag gcr.io/aip-backend-112180822704/aip-backend:latest
```

**This will**:
- Build your Docker image
- Compile TypeScript
- Push to Google Container Registry
- Take 2-5 minutes

**Watch for errors**:
- If build fails, check TypeScript errors
- Fix any syntax errors
- Re-run build

**Success message**: `SUCCESS`

---

## Step 4: Deploy to Cloud Run

**Replace these values**:
- `YOUR_CONNECTION_NAME` - From Step 2
- `YOUR_DB_PASSWORD` - Your Cloud SQL password
- `YOUR_JWT_SECRET` - Your JWT secret (same as before)

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
  --set-env-vars "JWT_EXPIRES_IN=7d" \
  --set-env-vars "FRONTEND_URL=https://ensembledemospace.com" \
  --set-env-vars "FRONTEND_URL_WWW=https://www.ensembledemospace.com" \
  --set-env-vars "NODE_ENV=production"
```

**Example** (replace with your actual values):

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
  --set-env-vars "DB_PASSWORD=TechsoDream2021!" \
  --set-env-vars "JWT_SECRET=your-super-secret-key-min-32-characters-long-change-this" \
  --set-env-vars "JWT_EXPIRES_IN=7d" \
  --set-env-vars "FRONTEND_URL=https://ensembledemospace.com" \
  --set-env-vars "FRONTEND_URL_WWW=https://www.ensembledemospace.com" \
  --set-env-vars "NODE_ENV=production"
```

**Deployment takes 2-5 minutes**. Wait for success message.

**You'll see**:
```
Service URL: https://aip-backend-XXXXX.us-central1.run.app
```

**Save this URL!** This is your backend API URL.

---

## Step 5: Test Deployment

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
# Test departments
curl https://YOUR-SERVICE-URL/api/departments

# Test membership plans
curl https://YOUR-SERVICE-URL/api/membership-plans

# Test doctors with filters
curl "https://YOUR-SERVICE-URL/api/doctors?page=1&limit=10"

# Test practices with filters
curl "https://YOUR-SERVICE-URL/api/practices?page=1&limit=10"
```

**All should return JSON data** (not errors).

---

## Step 6: Update Frontend Environment Variable

In your **local frontend** `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://YOUR-SERVICE-URL
```

**Replace `YOUR-SERVICE-URL`** with the URL from Step 4.

**Example**:
```env
NEXT_PUBLIC_API_URL=https://aip-backend-112180822704.us-central1.run.app
```

---

## Step 7: Test Locally

Now you can test your frontend locally against the deployed backend:

```bash
cd /Users/ganesh/Desktop/DRPLatest/EnsembleDrPage-main
npm run dev
```

**Frontend will**:
- Run on `http://localhost:3000`
- Make API calls to deployed Cloud Run backend
- No local backend needed!

**Test**:
1. Go to: http://localhost:3000/doctors
2. Should load doctors from API
3. Check browser Network tab - see API calls
4. Check Console - no errors

---

## Troubleshooting

### Build Fails:

```bash
# Test TypeScript compilation first
cd ~/aip-backend
npm run build

# Fix any errors shown
# Then rebuild Docker image
```

### Deployment Fails:

**Check**:
- Cloud SQL connection name is correct
- Environment variables are set correctly
- No typos in command

**View logs**:
```bash
gcloud run logs read aip-backend --region us-central1 --limit 50
```

### Database Connection Fails:

**Verify**:
- `DB_SOCKET_PATH` matches connection name exactly
- Cloud SQL instance is running
- Cloud Run service account has Cloud SQL Client role

**Check connection**:
```bash
gcloud sql instances describe YOUR_INSTANCE_NAME
```

### API Returns 500 Errors:

**Check logs**:
```bash
gcloud run logs read aip-backend --region us-central1 --limit 100
```

**Common issues**:
- Database tables don't exist (run migration)
- Wrong database name
- Wrong password

---

## Quick Reference Commands

```bash
# View logs
gcloud run logs read aip-backend --region us-central1 --limit 50

# View service info
gcloud run services describe aip-backend --region us-central1

# Update environment variable
gcloud run services update aip-backend \
  --region us-central1 \
  --update-env-vars "KEY=VALUE"

# Redeploy (after code changes)
gcloud builds submit --tag gcr.io/aip-backend-112180822704/aip-backend:latest
# Then run deploy command again
```

---

## Summary Checklist

- [x] Files uploaded to Cloud Shell
- [ ] Verified files exist (`ls src/routes/`)
- [ ] Got Cloud SQL connection name
- [ ] Built Docker image (`gcloud builds submit`)
- [ ] Deployed to Cloud Run (`gcloud run deploy`)
- [ ] Got service URL
- [ ] Tested health endpoint (`curl /health`)
- [ ] Tested new endpoints (`curl /api/departments`)
- [ ] Updated frontend `.env.local`
- [ ] Tested frontend locally (`npm run dev`)

---

## Next Steps After Deployment

1. ✅ Backend deployed and tested
2. ⚠️ Test frontend locally against deployed backend
3. ⚠️ Complete remaining frontend component migrations (43 files)
4. ⚠️ Deploy frontend to GoDaddy

---

## Estimated Time

- **Build**: 2-5 minutes
- **Deploy**: 2-5 minutes
- **Test**: 2-3 minutes
- **Total**: ~10-15 minutes

---

**You're ready to build and deploy!** 🚀
