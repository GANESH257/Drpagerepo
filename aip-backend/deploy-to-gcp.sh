#!/bin/bash

# GCP Backend Deployment Script
# This script deploys the backend to Cloud Run on GCP

set -e  # Exit on error

echo "🚀 Starting GCP Backend Deployment..."
echo ""

# Configuration - uses current gcloud project (run: gcloud config set project YOUR_PROJECT_ID)
PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null)}"
if [ -z "$PROJECT_ID" ]; then
    echo "❌ ERROR: No project set. Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi
REGION="us-central1"
SERVICE_NAME="aip-backend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
# GCS bucket for image uploads (doctor profile, practice logo, badges). Leave empty to use local disk.
GCS_BUCKET="${GCS_BUCKET:-aipdr-488018-uploads}"
echo "📌 Project: $PROJECT_ID"
echo "📌 GCS bucket (uploads): $GCS_BUCKET"

# Get Cloud SQL connection name
echo "📋 Getting Cloud SQL connection name..."
INSTANCE_NAME=$(gcloud sql instances list --format="value(name)" --limit=1)
if [ -z "$INSTANCE_NAME" ]; then
    echo "❌ ERROR: No Cloud SQL instance found"
    exit 1
fi

CONNECTION_NAME=$(gcloud sql instances describe "$INSTANCE_NAME" --format="value(connectionName)")
echo "✅ Cloud SQL Connection: $CONNECTION_NAME"
echo ""

# Prompt for sensitive values
read -sp "Enter Cloud SQL database password: " DB_PASSWORD
echo ""
read -sp "Enter JWT secret (min 32 characters): " JWT_SECRET
echo ""
read -p "Enter frontend URL (e.g. https://yourdomain.com or http://localhost:3000): " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000}

echo ""
echo "🔨 Building Docker image..."
gcloud builds submit --tag "${IMAGE_NAME}:latest" --project="$PROJECT_ID" .

echo ""
echo "📦 Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image "${IMAGE_NAME}:latest" \
  --platform managed \
  --region "$REGION" \
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
  --set-env-vars "GCS_BUCKET=$GCS_BUCKET" \
  --set-env-vars "UPLOAD_STORAGE=gcs" \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --project="$PROJECT_ID"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Getting service URL..."
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format="value(status.url)" --project="$PROJECT_ID")
echo "🌐 Service URL: $SERVICE_URL"
echo ""
echo "🧪 Testing health endpoint..."
curl -s "$SERVICE_URL/health" | jq '.' || echo "⚠️  Health check failed or jq not installed"
echo ""
echo "✅ Backend deployed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Update frontend .env.local: NEXT_PUBLIC_API_URL=$SERVICE_URL"
echo "2. Rebuild frontend and test admin login at /admin/login"
echo "3. If using GCS: grant Cloud Run's service account Storage Object Admin on bucket $GCS_BUCKET (see docs/GCS_IMAGE_UPLOAD_SETUP.md)"
