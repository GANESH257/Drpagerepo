-- ============================================================================
-- CREATE SYSTEM ADMIN USER
-- ============================================================================
-- Run this SQL in Cloud SQL to create the system admin user
-- 
-- IMPORTANT: Generate password hash first using:
--   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin@12345', 10).then(hash => console.log(hash));"
-- 
-- Replace REPLACE_WITH_BCRYPT_HASH below with the generated hash
-- ============================================================================

-- Step 1: Create admin user in users table
INSERT INTO users (
    id,
    email,
    password_hash,
    role,
    status,
    email_verified,
    created_at,
    updated_at
) VALUES (
    'admin-user-001',
    'admin@aip.com',
    'REPLACE_WITH_BCRYPT_HASH', -- ⚠️ REPLACE THIS with bcrypt hash (see instructions below)
    'admin',
    'active',
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    status = 'active',
    email_verified = TRUE,
    updated_at = NOW();

-- Step 2: Create admin record in admins table
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

-- Step 3: Verify admin was created
SELECT 
    u.id as user_id,
    u.email,
    u.role,
    u.status,
    u.email_verified,
    a.id as admin_id,
    a.name as admin_name,
    u.created_at
FROM users u
LEFT JOIN admins a ON u.id = a.user_id
WHERE u.email = 'admin@aip.com';

-- ============================================================================
-- HOW TO GENERATE PASSWORD HASH
-- ============================================================================
-- 
-- Option 1: In Cloud Shell (if backend has bcrypt installed):
--   cd ~/aip-backend
--   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin@12345', 10).then(hash => console.log('Hash:', hash));"
--
-- Option 2: In local backend directory:
--   cd aip-backend
--   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin@12345', 10).then(hash => console.log('Hash:', hash));"
--
-- Option 3: Use online tool (temporary - for testing only):
--   https://bcrypt-generator.com/
--   Password: Admin@12345
--   Rounds: 10
--
-- ============================================================================
-- DEFAULT CREDENTIALS
-- ============================================================================
-- Email: admin@aip.com
-- Password: Admin@12345
-- 
-- ⚠️ CHANGE PASSWORD AFTER FIRST LOGIN!
-- ============================================================================
