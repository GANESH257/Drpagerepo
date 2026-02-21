# Fix Build and Deploy - Use Artifact Registry

**Issue**: Google Container Registry (GCR) is deprecated  
**Solution**: Use Artifact Registry instead

---

## Step 1: Get Cloud SQL Connection Name (CORRECT COMMAND)

Your instance name is `aip-database` (from the list). Run:

```bash
gcloud sql instances describe aip-database --format="value(connectionName)"
```

**Expected output**: `ensemble-portal:us-central1:aip-database`  
**Save this value!**

---

## Step 2: Create Artifact Registry Repository (One-time Setup)

```bash
gcloud artifacts repositories create aip-backend \
  --repository-format=docker \
  --location=us-central1 \
  --description="AIP Backend Docker images"
```

**This creates**: `us-central1-docker.pkg.dev/ensemble-portal/aip-backend`

---

## Step 3: Build with Artifact Registry

**Use this command instead**:

```bash
cd ~/aip-backend

gcloud builds submit --tag us-central1-docker.pkg.dev/ensemble-portal/aip-backend/aip-backend:latest
```

**Note**: Changed from `gcr.io/aip-backend-112180822704/` to `us-central1-docker.pkg.dev/ensemble-portal/aip-backend/`

---

## Step 4: Deploy to Cloud Run

**Get your connection name first**:
```bash
CONNECTION_NAME=$(gcloud sql instances describe aip-database --format="value(connectionName)")
echo $CONNECTION_NAME
```

**Then deploy** (replace YOUR_DB_PASSWORD and YOUR_JWT_SECRET):

```bash
gcloud run deploy aip-backend \
  --image us-central1-docker.pkg.dev/ensemble-portal/aip-backend/aip-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances $CONNECTION_NAME \
  --set-env-vars "DB_SOCKET_PATH=/cloudsql/$CONNECTION_NAME" \
  --set-env-vars "DB_NAME=aip_production" \
  --set-env-vars "DB_USER=postgres" \
  --set-env-vars "DB_PASSWORD=YOUR_DB_PASSWORD" \
  --set-env-vars "JWT_SECRET=YOUR_JWT_SECRET" \
  --set-env-vars "JWT_EXPIRES_IN=7d" \
  --set-env-vars "FRONTEND_URL=https://ensembledemospace.com" \
  --set-env-vars "FRONTEND_URL_WWW=https://www.ensembledemospace.com" \
  --set-env-vars "NODE_ENV=production"
```

**Or use the connection name directly** (if you got it from Step 1):

```bash
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
  --set-env-vars "JWT_SECRET=your-super-secret-key-min-32-characters-long-change-this" \
  --set-env-vars "JWT_EXPIRES_IN=7d" \
  --set-env-vars "FRONTEND_URL=https://ensembledemospace.com" \
  --set-env-vars "FRONTEND_URL_WWW=https://www.ensembledemospace.com" \
  --set-env-vars "NODE_ENV=production"
```

---

## Quick Commands (Copy-Paste Ready)

### 1. Get Connection Name:
```bash
gcloud sql instances describe aip-database --format="value(connectionName)"
```

### 2. Create Artifact Registry (if not exists):
```bash
gcloud artifacts repositories create aip-backend \
  --repository-format=docker \
  --location=us-central1 \
  --description="AIP Backend Docker images" || echo "Repository already exists"
```

### 3. Build:
```bash
cd ~/aip-backend
gcloud builds submit --tag us-central1-docker.pkg.dev/ensemble-portal/aip-backend/aip-backend:latest
```

### 4. Deploy:
```bash
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
  --set-env-vars "JWT_SECRET=your-super-secret-key-min-32-characters-long-change-this" \
  --set-env-vars "JWT_EXPIRES_IN=7d" \
  --set-env-vars "FRONTEND_URL=https://ensembledemospace.com" \
  --set-env-vars "FRONTEND_URL_WWW=https://www.ensembledemospace.com" \
  --set-env-vars "NODE_ENV=production"
```

---

## What Changed

| Old (GCR - Deprecated) | New (Artifact Registry) |
|------------------------|-------------------------|
| `gcr.io/aip-backend-112180822704/aip-backend:latest` | `us-central1-docker.pkg.dev/ensemble-portal/aip-backend/aip-backend:latest` |

---

## Troubleshooting

### Repository Already Exists:
If you get "already exists" error, that's fine - skip Step 2.

### Permission Denied:
Make sure you're in the correct project:
```bash
gcloud config set project ensemble-portal
```

### Build Succeeds but Deploy Fails:
Check Cloud Run logs:
```bash
gcloud run logs read aip-backend --region us-central1 --limit 50
```

---

## Summary

1. ✅ Get connection name: `aip-database` → `ensemble-portal:us-central1:aip-database`
2. ✅ Create Artifact Registry repository (one-time)
3. ✅ Build with Artifact Registry URL
4. ✅ Deploy with correct connection name

**The build succeeded** - only the push to GCR failed. Using Artifact Registry will fix it!
