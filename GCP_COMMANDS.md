# GCP Deployment Commands

## Step 1: Connect to Cloud Shell

Open Cloud Shell: https://shell.cloud.google.com

```bash
# Set your project
gcloud config set project aip-backend-112180822704

# Navigate to backend directory (or wherever your backend code is)
cd ~/aip-backend
```

---

## Step 2: Upload Changed File

### Option A: Using Cloud Shell Editor (Easiest)
1. Click "Open Editor" (pencil icon) in Cloud Shell
2. Navigate to `src/routes/approval-requests.ts`
3. Copy entire contents from your local file
4. Paste and save

### Option B: Using gcloud cloud-shell scp (if you have gcloud CLI locally)
```bash
# From your LOCAL machine (not Cloud Shell)
gcloud cloud-shell scp aip-backend/src/routes/approval-requests.ts cloudshell:~/aip-backend/src/routes/
```

### Option C: Manual Upload via Cloud Shell
```bash
# In Cloud Shell, create/edit the file
nano src/routes/approval-requests.ts
# Then copy-paste entire file contents
```

---

## Step 3: Upload Migration File

```bash
# In Cloud Shell, create migrations directory if it doesn't exist
mkdir -p migrations

# Create the migration file
nano migrations/001_approval_requests_schema.sql
# Copy-paste entire contents of the migration file
```

---

## Step 4: Run SQL Migration

```bash
# Get your Cloud SQL instance name
gcloud sql instances list

# Connect to Cloud SQL (replace YOUR_INSTANCE_NAME)
gcloud sql connect YOUR_INSTANCE_NAME --user=postgres

# Once connected, run:
\c aip_production

# Then copy-paste entire contents of migrations/001_approval_requests_schema.sql
# OR if you uploaded the file:
\i migrations/001_approval_requests_schema.sql

# Verify tables were created:
\dt approval_requests
\dt practice_roles
\dt practice_locations

# Exit psql
\q
```

---

## Step 5: Get Cloud SQL Connection Name

```bash
# Get connection name (replace YOUR_INSTANCE_NAME)
gcloud sql instances describe YOUR_INSTANCE_NAME --format="value(connectionName)"

# Save this value - you'll need it for deployment
# Example output: aip-backend-112180822704:us-central1:aip-production
```

---

## Step 6: Build Docker Image

```bash
# Make sure you're in the backend directory
cd ~/aip-backend

# Build and push image
gcloud builds submit --tag gcr.io/aip-backend-112180822704/aip-backend:latest

# This will take 2-5 minutes
```

---

## Step 7: Deploy to Cloud Run

**Replace these values**:
- `YOUR_CONNECTION_NAME` - From Step 5 (e.g., `aip-backend-112180822704:us-central1:aip-production`)
- `YOUR_DB_PASSWORD` - Your Cloud SQL password
- `YOUR_JWT_SECRET` - Your JWT secret

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
  --set-env-vars "NODE_ENV=production" \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10
```

**Example** (with actual values):
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
  --set-env-vars "DB_PASSWORD=YourPassword123!" \
  --set-env-vars "JWT_SECRET=your-super-secret-jwt-key-min-32-chars" \
  --set-env-vars "JWT_EXPIRES_IN=7d" \
  --set-env-vars "FRONTEND_URL=https://ensembledemospace.com" \
  --set-env-vars "FRONTEND_URL_WWW=https://www.ensembledemospace.com" \
  --set-env-vars "NODE_ENV=production" \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10
```

---

## Step 8: Verify Deployment

```bash
# Get service URL
gcloud run services describe aip-backend --region us-central1 --format="value(status.url)"

# Test health endpoint
curl https://YOUR-SERVICE-URL/health

# Should return: {"status":"ok","database":"connected",...}
```

---

## Quick Copy-Paste Commands (All Steps)

```bash
# 1. Set project and navigate
gcloud config set project aip-backend-112180822704
cd ~/aip-backend

# 2. Get connection name
CONNECTION_NAME=$(gcloud sql instances list --format="value(name)" --limit=1 | xargs -I {} gcloud sql instances describe {} --format="value(connectionName)")
echo "Connection Name: $CONNECTION_NAME"

# 3. Run SQL migration (interactive - you'll need to paste SQL)
gcloud sql connect $(gcloud sql instances list --format="value(name)" --limit=1) --user=postgres
# Then in psql: \c aip_production
# Then paste migration SQL or: \i migrations/001_approval_requests_schema.sql

# 4. Build image
gcloud builds submit --tag gcr.io/aip-backend-112180822704/aip-backend:latest

# 5. Deploy (replace YOUR_DB_PASSWORD and YOUR_JWT_SECRET)
gcloud run deploy aip-backend \
  --image gcr.io/aip-backend-112180822704/aip-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances $CONNECTION_NAME \
  --set-env-vars "DB_SOCKET_PATH=/cloudsql/$CONNECTION_NAME,DB_NAME=aip_production,DB_USER=postgres,DB_PASSWORD=YOUR_DB_PASSWORD,JWT_SECRET=YOUR_JWT_SECRET,JWT_EXPIRES_IN=7d,FRONTEND_URL=https://ensembledemospace.com,FRONTEND_URL_WWW=https://www.ensembledemospace.com,NODE_ENV=production" \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10

# 6. Test
SERVICE_URL=$(gcloud run services describe aip-backend --region us-central1 --format="value(status.url)")
curl $SERVICE_URL/health
```

---

## Troubleshooting

### If build fails:
```bash
# Check build logs
gcloud builds list --limit=1
gcloud builds log $(gcloud builds list --limit=1 --format="value(id)")
```

### If deployment fails:
```bash
# Check Cloud Run logs
gcloud run services logs read aip-backend --region us-central1 --limit 50
```

### If database connection fails:
```bash
# Verify connection name is correct
gcloud sql instances describe YOUR_INSTANCE_NAME --format="value(connectionName)"

# Check Cloud SQL instance is running
gcloud sql instances list
```

---

## Notes

- Replace `YOUR_INSTANCE_NAME`, `YOUR_DB_PASSWORD`, `YOUR_JWT_SECRET` with actual values
- The SQL migration is safe to run multiple times (uses `IF NOT EXISTS`)
- Build takes 2-5 minutes
- Deployment takes 1-3 minutes
