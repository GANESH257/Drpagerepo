# Update Departments Endpoint to Use Departments Table

After running the SQL to create the `departments` table, update the backend endpoint.

## Step 1: Update Backend Route

**File**: `aip-backend/src/routes/departments.ts`

**Change from**:
```typescript
const result = await pool.query(
  `SELECT DISTINCT specialty as name, 
          LOWER(REPLACE(specialty, ' ', '-')) as slug,
          specialty as description
   FROM practice_specialties
   ORDER BY specialty ASC`
);
```

**Change to**:
```typescript
const result = await pool.query(
  `SELECT name, slug, description
   FROM departments
   ORDER BY name ASC`
);
```

## Step 2: Upload Updated File to Cloud Shell

Upload the updated `departments.ts` file to Cloud Shell.

## Step 3: Rebuild and Redeploy

```bash
cd ~/aip-backend
gcloud builds submit --tag us-central1-docker.pkg.dev/ensemble-portal/aip-backend/aip-backend:latest
gcloud run deploy aip-backend \
  --image us-central1-docker.pkg.dev/ensemble-portal/aip-backend/aip-backend:latest \
  --region us-central1 \
  --add-cloudsql-instances ensemble-portal:us-central1:aip-database \
  --set-env-vars "DB_SOCKET_PATH=/cloudsql/ensemble-portal:us-central1:aip-database" \
  --set-env-vars "DB_NAME=aip_production" \
  --set-env-vars "DB_USER=postgres" \
  --set-env-vars "DB_PASSWORD=TechsoDream2021!" \
  --set-env-vars "JWT_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890+/=" \
  --set-env-vars "JWT_EXPIRES_IN=7d" \
  --set-env-vars "FRONTEND_URL=https://ensembledemospace.com" \
  --set-env-vars "FRONTEND_URL_WWW=https://www.ensembledemospace.com" \
  --set-env-vars "NODE_ENV=production"
```
