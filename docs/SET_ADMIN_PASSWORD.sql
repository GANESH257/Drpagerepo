-- ============================================================================
-- Set Admin Password (run after CLOUD_SQL_FULL_FRESH_SETUP.sql)
-- ============================================================================
-- Email: admin@aip.com
-- Password: Admin@12345
--
-- IMPORTANT: The hash must start with $2b$10$ (do NOT strip the leading $)
-- ============================================================================

UPDATE users 
SET password_hash = '$2b$10$dI61AjlRehZudJP6cYiXtOaz49hrc5A8MTvZISByUK7g0YBHJjsNy',
    updated_at = NOW()
WHERE email = 'admin@aip.com';

-- Verify
SELECT id, email, role, status FROM users WHERE email = 'admin@aip.com';
