# Complete Admin Setup Guide

**Goal**: Create system admin user in database and enable API-based authentication

---

## Current State

- **Admin Auth**: Hardcoded in `src/lib/adminSession.ts` (localStorage only)
- **Backend Auth**: Already supports admin role via `/api/auth/login`
- **Database**: Has `users` and `admins` tables ready
- **Missing**: Admin user record in database

---

## Step-by-Step Setup

### Step 1: Generate Password Hash

**In Cloud Shell** (or local backend directory):

```bash
cd ~/aip-backend
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin@12345', 10).then(hash => console.log('Hash:', hash));"
```

**Example output**:
```
Hash: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

**Save this hash** - you'll need it in Step 2.

---

### Step 2: Run SQL in Cloud SQL

**Method A: GCP Console**
1. Go to: https://console.cloud.google.com/sql/instances
2. Click: `aip-database`
3. Click: "Databases" tab → "Open Cloud Shell" or SQL editor
4. Copy SQL from `docs/CREATE_ADMIN_USER.sql`
5. **Replace** `REPLACE_WITH_BCRYPT_HASH` with hash from Step 1
6. Run SQL

**Method B: Cloud Shell with psql**
```bash
gcloud sql connect aip-database --user=postgres
# Then paste SQL (after replacing hash)
```

---

### Step 3: Verify Admin Created

Run this SQL to verify:

```sql
SELECT 
    u.id as user_id,
    u.email,
    u.role,
    u.status,
    a.name as admin_name
FROM users u
LEFT JOIN admins a ON u.id = a.user_id
WHERE u.email = 'admin@aip.com';
```

**Expected result**: Should show 1 row with `role='admin'` and `status='active'`

---

### Step 4: Test Admin Login via API

**In Cloud Shell**:

```bash
curl -X POST https://aip-backend-112180822704.us-central1.run.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aip.com","password":"Admin@12345"}'
```

**Expected response**:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "admin-user-001",
    "email": "admin@aip.com",
    "role": "admin",
    "doctorId": null
  }
}
```

If this works, admin is in database correctly!

---

### Step 5: Update Admin Login Page (Optional - For Full Migration)

Currently admin login uses hardcoded credentials. To migrate to API:

**File**: `src/app/admin/login/page.tsx`

**Change**: Replace `validateAdminCredentials` check with API call to `/api/auth/login`

**Benefits**:
- Uses same auth system as doctors
- JWT tokens instead of localStorage-only
- Consistent authentication flow

---

## Quick SQL (Copy-Paste Ready)

**After generating hash**, use this SQL:

```sql
-- Create admin user
INSERT INTO users (
    id, email, password_hash, role, status, email_verified, created_at, updated_at
) VALUES (
    'admin-user-001',
    'admin@aip.com',
    'PASTE_YOUR_HASH_HERE', -- ⚠️ Replace with hash from Step 1
    'admin',
    'active',
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    status = 'active',
    updated_at = NOW();

-- Create admin record
INSERT INTO admins (
    id, user_id, name, email, created_at, updated_at
) VALUES (
    'admin-001',
    'admin-user-001',
    'System Administrator',
    'admin@aip.com',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;
```

---

## Default Credentials

**Email**: `admin@aip.com`  
**Password**: `Admin@12345`  
**Role**: `admin`  
**Status**: `active`

**⚠️ IMPORTANT**: Change password after first login!

---

## Troubleshooting

### Hash Generation Fails:
```bash
# Install bcrypt if needed
cd ~/aip-backend
npm install bcrypt
# Then try hash generation again
```

### SQL Fails - User Already Exists:
```sql
-- Update existing user instead
UPDATE users 
SET password_hash = 'YOUR_HASH',
    role = 'admin',
    status = 'active'
WHERE email = 'admin@aip.com';
```

### Login Returns 401:
- Check password hash is correct
- Verify user status is 'active'
- Check email matches exactly

### Login Returns 403 (Not Active):
```sql
-- Activate user
UPDATE users SET status = 'active' WHERE email = 'admin@aip.com';
```

---

## Summary

1. ✅ Generate bcrypt hash for password
2. ✅ Run SQL to create admin user
3. ✅ Verify admin exists
4. ✅ Test login via API
5. ⚠️ (Optional) Update admin login page to use API

**After Step 4**, you'll have a working admin user in the database!
