# Deploy to Cloud Run via GCP Console (No Terminal Needed)

## Step 1: Prepare Your Code

### Option A: Upload via Cloud Shell Editor

1. **Go to**: https://console.cloud.google.com/cloudshell
2. **Click** "Open Editor" (pencil icon)
3. **Upload your `aip-backend` folder**:
   - Right-click in file explorer → "Upload Files"
   - Select entire `aip-backend` folder
   - Wait for upload to complete

### Option B: Use GitHub (Recommended)

1. **Push your code to GitHub**:
   ```bash
   cd aip-backend
   git init
   git add .
   git commit -m "Initial backend"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Then connect Cloud Build to GitHub** (see Step 2)

---

## Step 2: Build Docker Image via Cloud Build

### Using Cloud Build UI:

1. **Go to**: https://console.cloud.google.com/cloud-build/builds
2. **Click** "Create Build"
3. **Select**:
   - **Source**: GitHub (if using GitHub) OR Cloud Source Repositories OR Upload
   - **Repository**: Select your repo
   - **Branch**: `main` or `master`
4. **Configuration**: Select "Dockerfile"
5. **Dockerfile location**: `aip-backend/Dockerfile`
6. **Image name**: `gcr.io/ensemble-portal/aip-backend`
7. **Click** "Create"

**OR** if you uploaded via Cloud Shell:

1. **Go to**: https://console.cloud.google.com/cloud-build/builds
2. **Click** "Create Build"
3. **Source**: Cloud Source Repositories → Create new repo
4. **Upload** your code
5. **Build configuration**: Use Dockerfile
6. **Image**: `gcr.io/ensemble-portal/aip-backend`

---

## Step 3: Deploy to Cloud Run via Console

1. **Go to**: https://console.cloud.google.com/run
2. **Click** "Create Service"
3. **Configure**:
   - **Service name**: `aip-backend`
   - **Region**: `us-central1`
   - **Deploy one revision from an existing container image**
   - **Container image URL**: `gcr.io/ensemble-portal/aip-backend` (or browse to select)
4. **Click** "Next"
5. **Set environment variables**:
   - Click "Variables & Secrets" tab
   - Add each variable:
     - `DB_HOST` = `35.225.60.9`
     - `DB_PORT` = `5432`
     - `DB_NAME` = `aip_production`
     - `DB_USER` = `postgres`
     - `DB_PASSWORD` = `YOUR_PASSWORD` (click "Create Secret" for password)
     - `JWT_SECRET` = `your-secret-key` (click "Create Secret")
     - `FRONTEND_URL` = `https://yourdomain.com`
     - `FRONTEND_URL_WWW` = `https://www.yourdomain.com`
     - `PORT` = `8080`
6. **Authentication**: Select "Allow unauthenticated invocations"
7. **Click** "Create"

---

## Step 4: Get Your API URL

After deployment:
1. **Go to**: https://console.cloud.google.com/run
2. **Click** on `aip-backend` service
3. **Copy** the URL (e.g., `https://aip-backend-xxxxx-uc.a.run.app`)

---

## Alternative: Use Cloud Shell (Browser-Based Terminal)

If you prefer a browser-based terminal:

1. **Go to**: https://console.cloud.google.com/cloudshell
2. **Upload** your `aip-backend` folder
3. **Run commands** in Cloud Shell:
   ```bash
   cd aip-backend
   gcloud builds submit --tag gcr.io/ensemble-portal/aip-backend
   gcloud run deploy aip-backend --image gcr.io/ensemble-portal/aip-backend ...
   ```

---

## Easiest Method: Cloud Shell

**Recommended**: Use Cloud Shell (browser-based terminal in GCP Console)

1. **Go to**: https://console.cloud.google.com/cloudshell
2. **Upload** your `aip-backend` folder
3. **Run deployment commands** (gcloud is pre-installed)

No local installation needed!
