# Fix Cloud Run → Cloud SQL Connection

## Problem
Cloud Run can't connect to Cloud SQL via public IP. Need to use **Cloud SQL Proxy** (Unix socket).

---

## Solution: Connect Cloud Run to Cloud SQL via Unix Socket

### Step 1: Get Your Cloud SQL Instance Connection Name

Run this in Cloud Shell:

```bash
gcloud sql instances describe aip-database --format="value(connectionName)"
```

**Output will look like**: `ensemble-portal:us-central1:aip-database`

**Save this value** - you'll need it in Step 3.

---

### Step 2: Update Connection Code (Already Done ✅)

The `src/db/connection.ts` file now supports both:
- **Unix socket** (Cloud Run) - when `DB_SOCKET_PATH` is set
- **TCP/IP** (local dev) - when using public IP

---

### Step 3: Redeploy Cloud Run with Cloud SQL Connection

**In Cloud Shell**, run:

```bash
cd ~/aip-backend

# Get your Cloud SQL connection name (replace with actual value from Step 1)
CLOUD_SQL_CONNECTION="ensemble-portal:us-central1:aip-database"

# Rebuild and redeploy with Cloud SQL connection
gcloud builds submit --tag gcr.io/ensemble-portal/aip-backend

gcloud run deploy aip-backend \
  --image gcr.io/ensemble-portal/aip-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances $CLOUD_SQL_CONNECTION \
  --set-env-vars DB_SOCKET_PATH=/cloudsql/$CLOUD_SQL_CONNECTION \
  --set-env-vars DB_NAME=aip_production \
  --set-env-vars DB_USER=postgres \
  --set-env-vars DB_PASSWORD='TechsoDream2021!' \
  --set-env-vars JWT_SECRET='tpQtImgVB2U81QBYaWgbLM6rsx696PD46/tNxEDeVKE=' \
  --set-env-vars FRONTEND_URL=https://ensembledemospace.com \
  --set-env-vars FRONTEND_URL_WWW=https://www.ensembledemospace.com
```

**Key changes:**
- `--add-cloudsql-instances` - Connects Cloud Run to Cloud SQL
- `DB_SOCKET_PATH=/cloudsql/...` - Tells code to use Unix socket

---

### Step 4: Test Connection

```bash
curl https://aip-backend-112180822704.us-central1.run.app/health
```

**Expected response:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "...",
  "dbTime": "..."
}
```

---

## How It Works

### Before (Public IP - Doesn't Work):
```
Cloud Run → Public IP (35.225.60.9) → Timeout ❌
```

### After (Unix Socket - Works):
```
Cloud Run → Unix Socket (/cloudsql/...) → Cloud SQL Proxy → Database ✅
```

---

## Troubleshooting

### If connection still fails:

1. **Check Cloud SQL instance name:**
   ```bash
   gcloud sql instances list
   ```

2. **Verify Cloud Run has permission:**
   Cloud Run's service account needs `Cloud SQL Client` role:
   ```bash
   gcloud projects add-iam-policy-binding ensemble-portal \
     --member="serviceAccount:112180822704-compute@developer.gserviceaccount.com" \
     --role="roles/cloudsql.client"
   ```

3. **Check Cloud Run logs:**
   ```bash
   gcloud run services logs read aip-backend --region us-central1 --limit 50
   ```

---

## Summary

✅ **Updated**: `src/db/connection.ts` supports Unix socket  
⏳ **Next**: Get Cloud SQL connection name and redeploy  
🎯 **Goal**: Cloud Run connects to database via Unix socket
