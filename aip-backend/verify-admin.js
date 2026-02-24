/**
 * Verify admin user exists and password works.
 * Run: node verify-admin.js
 * Uses same DB config as the app (.env)
 */
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  host: process.env.DB_HOST || '34.133.206.33',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('Checking users table for admin@aip.com...\n');
  
  const res = await pool.query(
    "SELECT id, email, role, status, LEFT(password_hash, 30) as hash_preview FROM users WHERE email = 'admin@aip.com'"
  );
  
  if (res.rows.length === 0) {
    console.log('❌ No admin user found. Run the INSERT SQL in Cloud SQL Studio.');
    process.exit(1);
  }
  
  const user = res.rows[0];
  console.log('✅ Admin user exists:');
  console.log('   id:', user.id);
  console.log('   email:', user.email);
  console.log('   role:', user.role);
  console.log('   status:', user.status);
  console.log('   hash_preview:', user.hash_preview);
  
  // Get full hash for bcrypt compare
  const fullRes = await pool.query(
    "SELECT password_hash FROM users WHERE email = 'admin@aip.com'"
  );
  const hash = fullRes.rows[0].password_hash;
  
  const matches = await bcrypt.compare('Admin@12345', hash);
  console.log('\nPassword "Admin@12345" matches:', matches ? '✅ YES' : '❌ NO');
  
  if (!matches) {
    console.log('\nFix: Generate new hash and UPDATE:');
    console.log('  node -e "const bcrypt=require(\'bcrypt\');bcrypt.hash(\'Admin@12345\',10).then(h=>console.log(h));"');
    console.log('  Then in Cloud SQL: UPDATE users SET password_hash = \'NEW_HASH\' WHERE email = \'admin@aip.com\';');
  }
  
  await pool.end();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
