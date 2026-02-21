# Local Testing Guide

## Step 1: Test Backend Endpoints (Deployed)

The backend is already deployed. Test these endpoints:

### Health Check
```bash
curl https://aip-backend-112180822704.us-central1.run.app/health
```

### Public Endpoints (No Auth Required)
```bash
# Policies (public read)
curl https://aip-backend-112180822704.us-central1.run.app/api/policies

# Events (public read)
curl https://aip-backend-112180822704.us-central1.run.app/api/events

# Membership Plans (public read)
curl https://aip-backend-112180822704.us-central1.run.app/api/membership-plans

# Departments
curl https://aip-backend-112180822704.us-central1.run.app/api/departments
```

### Admin Endpoints (Require Auth Token)

First, login as admin to get token:
```bash
# Login as admin
curl -X POST https://aip-backend-112180822704.us-central1.run.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aip.com","password":"Admin@12345"}'

# Save the token from response, then use it:
TOKEN="YOUR_TOKEN_HERE"

# Test admin endpoints
curl -H "Authorization: Bearer $TOKEN" \
  https://aip-backend-112180822704.us-central1.run.app/api/join-requests

curl -H "Authorization: Bearer $TOKEN" \
  https://aip-backend-112180822704.us-central1.run.app/api/approval-requests

curl -H "Authorization: Bearer $TOKEN" \
  https://aip-backend-112180822704.us-central1.run.app/api/approval-requests/admin/history

curl -H "Authorization: Bearer $TOKEN" \
  https://aip-backend-112180822704.us-central1.run.app/api/notifications/admin/all

curl -H "Authorization: Bearer $TOKEN" \
  https://aip-backend-112180822704.us-central1.run.app/api/referrals
```

## Step 2: Test Frontend Locally

### Option A: Test Against Deployed Backend (Recommended)

1. **Set environment variable** (if you want to override the default):
```bash
# In your terminal before running npm run dev
export NEXT_PUBLIC_API_URL=https://aip-backend-112180822704.us-central1.run.app
```

2. **Start frontend dev server**:
```bash
cd /Users/ganesh/Desktop/DRPLatest/EnsembleDrPage-main
npm run dev
```

3. **Login as admin**:
   - Go to: http://localhost:3000/admin/login
   - Email: `admin@aip.com`
   - Password: `Admin@12345`

4. **Test Admin Console Pages**:
   - Dashboard: http://localhost:3000/admin
   - Join Requests: http://localhost:3000/admin/requests
   - Approval Requests V2: http://localhost:3000/admin/requests-v2
   - Membership Plans: http://localhost:3000/admin/memberships
   - Policies: http://localhost:3000/admin/policies
   - Events: http://localhost:3000/admin/events
   - Members: http://localhost:3000/admin/members
   - Practices: http://localhost:3000/admin/practices
   - Referrals: http://localhost:3000/admin/referrals
   - Notifications: http://localhost:3000/admin/notifications
   - History: http://localhost:3000/admin/history/approvals

### Option B: Run Backend Locally (Advanced)

If you want to test backend locally:

1. **Set up local backend**:
```bash
cd aip-backend

# Create .env file with your Cloud SQL connection
cat > .env << EOF
DB_HOST=35.225.60.9
DB_PORT=5432
DB_NAME=aip_production
DB_USER=postgres
DB_PASSWORD=TechsoDream2021!
JWT_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890+/=
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
FRONTEND_URL_WWW=http://localhost:3000
PORT=8080
NODE_ENV=development
EOF

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run backend
npm start
# Backend runs on http://localhost:8080
```

2. **Update frontend to use local backend**:
```bash
# In frontend directory, create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local

# Start frontend
npm run dev
```

## Step 3: Test Key Features

### Test Membership Plans (Empty Table)
1. Go to: http://localhost:3000/admin/memberships
2. Should show empty state or loading
3. Click "Add New Plan"
4. Fill in:
   - Name: "Basic Plan"
   - Monthly Price: 99
   - Annual Price: 990
   - Add features
5. Click "Save Plan"
6. Verify plan appears in list
7. Test edit and delete

### Test Join Requests
1. Go to: http://localhost:3000/admin/requests
2. Should load from API (may be empty if no requests)
3. If you have approval requests in DB, they should appear

### Test Approval Requests V2
1. Go to: http://localhost:3000/admin/requests-v2
2. Should show all approval request types
3. Click on a request to view details
4. Test approve/reject functionality

### Test Policies
1. Go to: http://localhost:3000/admin/policies
2. Should load policies from API
3. Test edit/create/delete

### Test Events
1. Go to: http://localhost:3000/admin/events
2. Should load events from API
3. Test edit/create/delete

## Step 4: Check Browser Console

Open browser DevTools (F12) and check:
- ✅ No errors about localStorage
- ✅ No errors about "Not using API yet"
- ✅ Network tab shows API calls to backend
- ✅ All API calls return 200 status

## Step 5: Verify Database Connection

Check that frontend can connect to backend:
```bash
# In browser console (F12), run:
fetch('https://aip-backend-112180822704.us-central1.run.app/health')
  .then(r => r.json())
  .then(console.log)
```

Should return: `{status: "ok", database: "connected", ...}`

## Troubleshooting

### If API calls fail:
1. Check CORS - backend should allow frontend URL
2. Check authentication - make sure you're logged in as admin
3. Check network tab for error messages

### If data is empty:
- Membership plans: This is expected if table is empty - admin can create first plan
- Join requests: This is expected if no approval requests exist yet
- Policies/Events: Should have default data after running SQL migration

### If you see localStorage errors:
- Check browser console
- All admin components should use API now
- If you see any localStorage usage, report it
