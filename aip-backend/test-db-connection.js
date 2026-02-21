// Quick database connection test
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || '35.225.60.9',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'aip_production',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 30000,
});

console.log('Testing connection to:', {
  host: process.env.DB_HOST || '35.225.60.9',
  database: process.env.DB_NAME || 'aip_production',
  user: process.env.DB_USER || 'postgres',
});

pool.query('SELECT NOW()')
  .then((result) => {
    console.log('✅ SUCCESS: Database connected!');
    console.log('Database time:', result.rows[0].now);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ FAILED: Cannot connect to database');
    console.error('Error:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Your IP is not in Cloud SQL authorized networks');
    console.error('2. Wrong password in .env file');
    console.error('3. Cloud SQL instance is not running');
    console.error('4. Firewall blocking connection');
    console.error('\nTo fix:');
    console.error('1. Go to GCP Console → SQL → aip-database');
    console.error('2. Click "Connections" tab');
    console.error('3. Add your IP to "Authorized networks"');
    console.error('4. Or use Cloud SQL Proxy for secure connection');
    process.exit(1);
  });
