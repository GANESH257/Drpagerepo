#!/bin/bash

# GCP Backend Deployment Script
# This script deploys the backend to Cloud Run on GCP

set -e  # Exit on error

echo "🚀 Starting GCP Backend Deployment..."
echo ""

# Configuration (UPDATE THESE VALUES)
PROJECT_ID="aip-backend-112180822704"
REGION="us-central1"
SERVICE_NAME="aip-backend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

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
read -p "Enter frontend URL (default: https://ensembledemospace.com): " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-https://ensembledemospace.com}

echo ""
echo "🔨 Building Docker image..."
gcloud builds submit --tag "${IMAGE_NAME}:latest" --project="$PROJECT_ID"

echo ""
echo "📦 Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image "${IMAGE_NAME}:latest" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --add-cloudsql-instances "$CONNECTION_NAME" \
  --set-env-vars "DB_SOCKET_PATH=/cloudsql/$CONNECTION_NAME" \
  --set-env-vars "DB_NAME=aip_production" \
  --set-env-vars "DB_USER=postgres" \
  --set-env-vars "DB_PASSWORD=$DB_PASSWORD" \
  --set-env-vars "JWT_SECRET=$JWT_SECRET" \
  --set-env-vars "JWT_EXPIRES_IN=7d" \
  --set-env-vars "FRONTEND_URL=$FRONTEND_URL" \
  --set-env-vars "FRONTEND_URL_WWW=https://www.ensembledemospace.com" \
  --set-env-vars "NODE_ENV=production" \
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
echo "2. Run SQL migration: psql -h YOUR_DB_HOST -U postgres -d aip_production -f migrations/001_approval_requests_schema.sql"
echo "3. Test the join-us flow with a new doctor"
