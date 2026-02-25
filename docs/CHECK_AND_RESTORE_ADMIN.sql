-- ============================================================================
-- CHECK AND RESTORE ADMIN (admin@aip.com / Admin@12345)
-- ============================================================================
-- Run this in your Cloud SQL / backend database.
-- 1. First block: check if admin exists (users + admins).
-- 2. Second block: restore password if user exists (no new row).
-- 3. Third block: create user + admin if missing (uses known bcrypt hash below).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CHECK: Does admin exist?
-- ----------------------------------------------------------------------------
SELECT 
    u.id AS user_id,
    u.email,
    u.role,
    u.status,
    u.email_verified,
    a.id AS admin_id,
    a.name AS admin_name
FROM users u
LEFT JOIN admins a ON u.id = a.user_id
WHERE u.email = 'admin@aip.com';

-- If the above returns a row: user exists. You can run block 2 to reset password.
-- If it returns no rows: run block 3 to create the admin from scratch.


-- ============================================================================
-- 2. RESTORE PASSWORD (use this if user exists but login fails)
-- ============================================================================
-- Password: Admin@12345 (bcrypt hash below)
-- ============================================================================

UPDATE users 
SET password_hash = '$2b$10$dI61AjlRehZudJP6cYiXtOaz49hrc5A8MTvZISByUK7g0YBHJjsNy',
    status = 'active',
    email_verified = TRUE,
    updated_at = NOW()
WHERE email = 'admin@aip.com';

-- Verify after update
SELECT id, email, role, status FROM users WHERE email = 'admin@aip.com';


-- ============================================================================
-- 3. CREATE ADMIN (use this if check in block 1 returned no rows)
-- ============================================================================
-- Creates both users row and admins row. Password: Admin@12345
-- ============================================================================

-- 3a. Insert into users (id must be unique; adjust if your DB uses different PK)
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
    '$2b$10$dI61AjlRehZudJP6cYiXtOaz49hrc5A8MTvZISByUK7g0YBHJjsNy',
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

-- 3b. Insert into admins (depends on users.id = 'admin-user-001')
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
    user_id = EXCLUDED.user_id,
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = NOW();

-- Verify
SELECT 
    u.id AS user_id,
    u.email,
    u.role,
    u.status,
    a.id AS admin_id,
    a.name AS admin_name
FROM users u
LEFT JOIN admins a ON u.id = a.user_id
WHERE u.email = 'admin@aip.com';


-- ============================================================================
-- CREDENTIALS
-- ============================================================================
-- Email:    admin@aip.com
-- Password: Admin@12345
-- Change password after first login if this is production.
-- ============================================================================
