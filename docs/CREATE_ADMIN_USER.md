# Create System Admin User - Complete Guide

**Goal**: Create a system admin user in the database with proper authentication

---

## Current State

**Admin Authentication**: Currently uses hardcoded credentials in `src/lib/adminSession.ts`
- Email: `admin@aip.com`
- Password: `Admin@12345`
- Storage: localStorage only (not in database)

**Backend Auth**: `/api/auth/login` supports `users` table with roles, but admin login page doesn't use it yet.

---

## Solution: Create Admin in Database + Migrate Admin Login to API

### Step 1: Create Admin User in Database

Run this SQL in Cloud SQL:

```sql
-- Generate password hash (you'll need to generate this - see below)
-- For password: Admin@12345
-- Hash will be generated using bcrypt

-- Create admin user in users table
INSERT INTO users (
    id,
    email,
    password_hash,
    role,
    status,
    created_at,
    updated_at
) VALUES (
    'admin-user-001',
    'admin@aip.com',
    '$2b$10$YourHashedPasswordHere', -- Replace with actual bcrypt hash
    'admin',
    'active',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create admin record in admins table
INSERT INTO admins (
    id,
    user_id,
    name,
    email,
    created_at,
    updated_at
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

## Step 2: Generate Password Hash

You need to generate a bcrypt hash for the password. Options:

### Option A: Use Node.js (in Cloud Shell)

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin@12345', 10).then(hash => console.log(hash));"
```

### Option B: Use Online Tool (Temporary)
- Go to: https://bcrypt-generator.com/
- Enter password: `Admin@12345`
- Rounds: 10
- Copy the hash

### Option C: Use Backend API (if available)
Create a temporary endpoint to hash passwords.

---

## Step 3: Update Backend Auth Route

The backend `/api/auth/login` already supports admin role, but we need to verify it handles admin correctly.

**Current code** (lines 40-48):
```typescript
// Get doctor ID if user is a doctor
let doctorId = null;
if (user.role === 'doctor') {
  const doctorResult = await pool.query(
    'SELECT id FROM doctors WHERE user_id = $1 LIMIT 1',
    [user.id]
  );
  doctorId = doctorResult.rows[0]?.id || null;
}
```

This is fine - admin won't have a doctorId, which is correct.

---

## Step 4: Update Admin Login Page

Migrate admin login to use API instead of hardcoded credentials.

**File**: `src/app/admin/login/page.tsx`

**Change**: Replace `validateAdminCredentials` with API call to `/api/auth/login`

---

## Step 5: Update Admin Session Management

Update `src/lib/adminSession.ts` to use JWT tokens (like doctor auth) instead of localStorage-only session.

---

## Complete SQL Script (After Generating Hash)

```sql
-- Step 1: Create admin user
INSERT INTO users (
    id,
    email,
    password_hash,
    role,
    status,
    created_at,
    updated_at
) VALUES (
    'admin-user-001',
    'admin@aip.com',
    'REPLACE_WITH_BCRYPT_HASH', -- Generate this first!
    'admin',
    'active',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    status = 'active',
    updated_at = NOW();

-- Step 2: Create admin record
INSERT INTO admins (
    id,
    user_id,
    name,
    email,
    created_at,
    updated_at
) VALUES (
    'admin-001',
    'admin-user-001',
    'System Administrator',
    'admin@aip.com',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    name = 'System Administrator',
    email = 'admin@aip.com',
    updated_at = NOW();

-- Verify admin was created
SELECT u.id, u.email, u.role, u.status, a.name as admin_name
FROM users u
LEFT JOIN admins a ON u.id = a.user_id
WHERE u.email = 'admin@aip.com';
```

---

## Quick Setup Commands

### 1. Generate Password Hash (in Cloud Shell):

```bash
cd ~/aip-backend
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin@12345', 10).then(hash => console.log('Hash:', hash));"
```

**Save the hash** - you'll need it for SQL.

### 2. Run SQL in Cloud SQL:

Copy-paste the SQL above, replacing `REPLACE_WITH_BCRYPT_HASH` with the hash from step 1.

### 3. Test Login:

```bash
curl -X POST https://aip-backend-112180822704.us-central1.run.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aip.com","password":"Admin@12345"}'
```

Should return JWT token and user info.

---

## After Database Setup

1. ✅ Admin user created in database
2. ⚠️ Update admin login page to use API
3. ⚠️ Update admin session to use JWT tokens
4. ⚠️ Test admin login

---

## Default Admin Credentials

**Email**: `admin@aip.com`  
**Password**: `Admin@12345`  
**Role**: `admin`  
**Status**: `active`

**IMPORTANT**: Change password after first login!
