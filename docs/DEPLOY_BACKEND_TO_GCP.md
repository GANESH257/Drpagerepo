# Deploy Backend to GCP Cloud Run

Use this guide to host the backend on your **new GCP project** with Cloud SQL.

---

## Prerequisites

- [ ] `gcloud` CLI installed ([install](https://cloud.google.com/sdk/docs/install))
- [ ] Logged in: `gcloud auth login`
- [ ] Project set: `gcloud config set project YOUR_PROJECT_ID`
- [ ] Cloud SQL instance created and tables set up
- [ ] Cloud Build API and Cloud Run API enabled

---

## Step 1: Get Your Cloud SQL Connection Name

```bash
gcloud sql instances list
```

Note your instance name (e.g. `aip-database`). Then:

```bash
gcloud sql instances describe YOUR_INSTANCE_NAME --format="value(connectionName)"
```

**Example output:** `my-project-123:us-central1:aip-database`

Save this — you need it for deployment.

---

## Step 2: Build the Docker Image

From the project root:

```bash
cd aip-backend

# Build and push to your project's Artifact Registry / GCR
gcloud builds submit --tag gcr.io/$(gcloud config get-value project)/aip-backend:latest
```

This builds the image and pushes it. Takes 2–5 minutes.

---

## Step 3: Deploy to Cloud Run

Replace the placeholders with your values:

```bash
# Set variables (replace with your values)
PROJECT_ID=$(gcloud config get-value project)
CONNECTION_NAME="YOUR_PROJECT:YOUR_REGION:YOUR_INSTANCE"   # From Step 1
DB_PASSWORD="TechsoDream2021!"
JWT_SECRET="your-super-secret-key-min-32-characters-long-change-this"
FRONTEND_URL="https://yourdomain.com"   # Or http://localhost:3000 for testing

# Deploy
gcloud run deploy aip-backend \
  --image gcr.io/${PROJECT_ID}/aip-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances "$CONNECTION_NAME" \
  --set-env-vars "DB_SOCKET_PATH=/cloudsql/$CONNECTION_NAME" \
  --set-env-vars "DB_NAME=postgres" \
  --set-env-vars "DB_USER=postgres" \
  --set-env-vars "DB_PASSWORD=$DB_PASSWORD" \
  --set-env-vars "JWT_SECRET=$JWT_SECRET" \
  --set-env-vars "JWT_EXPIRES_IN=7d" \
  --set-env-vars "FRONTEND_URL=$FRONTEND_URL" \
  --set-env-vars "FRONTEND_URL_WWW=$FRONTEND_URL" \
  --set-env-vars "NODE_ENV=production" \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10
```

**Important:** Cloud Run connects via **Unix socket** (`DB_SOCKET_PATH`), not via public IP. Do not use `DB_HOST` in Cloud Run.

---

## Step 4: Get Service URL

```bash
gcloud run services describe aip-backend --region us-central1 --format="value(status.url)"
```

Example: `https://aip-backend-xxxxx-uc.a.run.app`

---

## Step 5: Test the API

```bash
curl https://YOUR-SERVICE-URL/health
```

Expected response: `{"status":"ok","database":"connected",...}`

---

## Step 6: Update Frontend

Set `NEXT_PUBLIC_API_URL` to your Cloud Run URL:

```bash
# In .env.local (for local dev pointing to deployed backend)
NEXT_PUBLIC_API_URL=https://aip-backend-xxxxx-uc.a.run.app
```

Rebuild the frontend after changing this.

---

## Quick Deploy (Using Script)

```bash
cd aip-backend
./deploy-to-gcp.sh
```

The script will prompt for DB password and JWT secret. Make sure it uses your **new** project and Cloud SQL instance.

---

## Troubleshooting

**Cloud Run can't connect to DB**
- Check Cloud Run service account has **Cloud SQL Client** role
- Ensure `--add-cloudsql-instances` matches your instance exactly
- Use `DB_SOCKET_PATH` (not `DB_HOST`) in Cloud Run

**View logs:**
```bash
gcloud run services logs read aip-backend --region us-central1 --limit 50
```

**Health check fails:**
- Check logs for DB connection errors
- Verify `DB_PASSWORD` and `DB_NAME` are correct
