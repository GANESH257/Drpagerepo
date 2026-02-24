# Deploy Backend from Google Cloud Shell — Exact Steps

Your project: **aipdr-488018**  
Cloud SQL instance: **aip-database** (IP 34.133.206.33)

---

## Step 1: Zip the backend on your LOCAL machine

On your Mac (in Terminal, not Cloud Shell):

```bash
cd /Users/ganesh/Desktop/DRPLatest/EnsembleDrPage-main
zip -r aip-backend.zip aip-backend -x "aip-backend/node_modules/*" -x "aip-backend/.env"
```

This creates `aip-backend.zip` (excluding node_modules and .env for smaller size). The deploy will run `npm ci` so dependencies are installed during the Docker build.

---

## Step 2: Upload to Cloud Shell

1. In **Cloud Shell** (the browser terminal), click the **three-dot menu (⋮)** in the top-right.
2. Click **"Upload file"**.
3. Select `aip-backend.zip` from your computer.
4. Wait for the upload to finish (it will appear in your home directory).

---

## Step 3: Unzip and prepare in Cloud Shell

In Cloud Shell, run:

```bash
cd ~
unzip -o aip-backend.zip
cd aip-backend
```

---

## Step 4: Create .env for the build (optional)

The Docker build does not need .env (secrets go in Cloud Run env vars). If you want to run `npm run build` locally in Cloud Shell first to verify, create a minimal .env:

```bash
# Optional - only if you want to test build locally
echo 'DB_HOST=34.133.206.33
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=TechsoDream2021!
JWT_SECRET=temp-secret-for-build-only' > .env
```

You can skip this — the Docker build uses `npm ci` and `npm run build` which don't need DB connection.

---

## Step 5: Get Cloud SQL connection name

```bash
gcloud sql instances describe aip-database --format="value(connectionName)"
```

**Expected output:** `aipdr-488018:us-central1:aip-database`  
Copy this value.

---

## Step 6: Enable required APIs (if not already)

```bash
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com
```

---

## Step 7: Create Artifact Registry repo (if needed)

If you prefer Artifact Registry (like your old setup):

```bash
gcloud artifacts repositories create aip-backend \
  --repository-format=docker \
  --location=us-central1 \
  --description="AIP Backend Docker images"
```

If you get "already exists", skip this step.

---

## Step 8: Build the Docker image

**Option A — Artifact Registry (matches your old setup):**
```bash
cd ~/aip-backend
gcloud builds submit --tag us-central1-docker.pkg.dev/aipdr-488018/aip-backend/aip-backend:latest .
```

**Option B — GCR (simpler, no repo creation):**
```bash
cd ~/aip-backend
gcloud builds submit --tag gcr.io/aipdr-488018/aip-backend:latest .
```

Wait 3–5 minutes for the build to finish.

---

## Step 9: Deploy to Cloud Run

**If you used Artifact Registry (Option A):**
```bash
gcloud run deploy aip-backend \
  --image us-central1-docker.pkg.dev/aipdr-488018/aip-backend/aip-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances "aipdr-488018:us-central1:aip-database" \
  --set-env-vars "DB_SOCKET_PATH=/cloudsql/aipdr-488018:us-central1:aip-database" \
  --set-env-vars "DB_NAME=postgres" \
  --set-env-vars "DB_USER=postgres" \
  --set-env-vars "DB_PASSWORD=TechsoDream2021!" \
  --set-env-vars "JWT_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890+/=" \
  --set-env-vars "JWT_EXPIRES_IN=7d" \
  --set-env-vars "FRONTEND_URL=https://ensembledemospace.com" \
  --set-env-vars "FRONTEND_URL_WWW=https://www.ensembledemospace.com" \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "GCS_BUCKET=aipdr-488018-uploads" \
  --set-env-vars "UPLOAD_STORAGE=gcs" \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10
```

**If you used GCR (Option B):** Replace `--image` with `gcr.io/aipdr-488018/aip-backend:latest`.

**GCS uploads:** The two vars `GCS_BUCKET` and `UPLOAD_STORAGE=gcs` make profile/logo/badge images upload to Cloud Storage. Ensure the bucket exists and the Cloud Run service account has Storage Object Admin on it; make the bucket publicly readable (allUsers → Storage Object Viewer) if you want image URLs to load in the browser. See `docs/GCS_IMAGE_UPLOAD_SETUP.md`.

**Changes from your old project:**
- Project: `aipdr-488018` (was `ensemble-portal`)
- Cloud SQL: `aipdr-488018:us-central1:aip-database` (was `ensemble-portal:us-central1:aip-database`)
- DB_NAME: `postgres` (your new DB; was `aip_production`)

---

## Step 10: Get your backend URL

```bash
gcloud run services describe aip-backend --region us-central1 --format="value(status.url)"
```

---

## Step 11: Test the health endpoint

```bash
curl $(gcloud run services describe aip-backend --region us-central1 --format="value(status.url)")/health
```

Expected: `{"status":"ok","database":"connected",...}`

---

## Step 12: Update your local frontend

On your Mac, edit `.env.local`:

```
NEXT_PUBLIC_API_URL=https://aip-backend-xxxxx-uc.a.run.app
```

Use the URL from Step 9. Then rebuild the frontend: `npm run build`

---

## Summary — Copy-paste block (Artifact Registry, like your old setup)

Run these in order in Cloud Shell (after uploading and unzipping):

```bash
cd ~/aip-backend

# Create Artifact Registry repo (if needed)
gcloud artifacts repositories create aip-backend --repository-format=docker --location=us-central1 2>/dev/null || true

# Build
gcloud builds submit --tag us-central1-docker.pkg.dev/aipdr-488018/aip-backend/aip-backend:latest .

# Deploy
gcloud run deploy aip-backend \
  --image us-central1-docker.pkg.dev/aipdr-488018/aip-backend/aip-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances "aipdr-488018:us-central1:aip-database" \
  --set-env-vars "DB_SOCKET_PATH=/cloudsql/aipdr-488018:us-central1:aip-database" \
  --set-env-vars "DB_NAME=postgres" \
  --set-env-vars "DB_USER=postgres" \
  --set-env-vars "DB_PASSWORD=TechsoDream2021!" \
  --set-env-vars "JWT_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890+/=" \
  --set-env-vars "JWT_EXPIRES_IN=7d" \
  --set-env-vars "FRONTEND_URL=https://ensembledemospace.com" \
  --set-env-vars "FRONTEND_URL_WWW=https://www.ensembledemospace.com" \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "GCS_BUCKET=aipdr-488018-uploads" \
  --set-env-vars "UPLOAD_STORAGE=gcs" \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10

# Get URL
gcloud run services describe aip-backend --region us-central1 --format="value(status.url)"
```

---

## If Cloud Run service account lacks Cloud SQL access

If the health check shows DB disconnected, grant the Cloud SQL Client role:

```bash
PROJECT_NUMBER=$(gcloud projects describe aipdr-488018 --format="value(projectNumber)")
gcloud projects add-iam-policy-binding aipdr-488018 \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/cloudsql.client"
```

Then redeploy or wait a few minutes.
