#!/bin/bash

# Run SQL Migration on Cloud SQL
# This script connects to Cloud SQL and runs the migration

set -e

echo "🗄️  Running SQL Migration on Cloud SQL..."
echo ""

# Get Cloud SQL instance name
INSTANCE_NAME=$(gcloud sql instances list --format="value(name)" --limit=1)
if [ -z "$INSTANCE_NAME" ]; then
    echo "❌ ERROR: No Cloud SQL instance found"
    exit 1
fi

echo "📋 Cloud SQL Instance: $INSTANCE_NAME"
echo ""

# Run migration
echo "🔧 Running migration..."
gcloud sql connect "$INSTANCE_NAME" --user=postgres <<EOF
\c aip_production

-- Run migration file
\i migrations/001_approval_requests_schema.sql

-- Verify tables exist
\dt approval_requests
\dt approval_history
\dt practice_locations
\dt practice_services
\dt practice_insurance
\dt practice_specialties
\dt practice_roles

-- Check approval_requests columns
\d approval_requests

\q
EOF

echo ""
echo "✅ Migration complete!"
echo ""
echo "📝 Verify tables:"
echo "  - approval_requests"
echo "  - approval_history"
echo "  - practice_locations"
echo "  - practice_services"
echo "  - practice_insurance"
echo "  - practice_specialties"
echo "  - practice_roles"
