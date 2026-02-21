import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables (only in production)
// Don't exit in Cloud Run - let health check handle it
if (!process.env.DB_PASSWORD && process.env.NODE_ENV === 'production') {
  console.error('⚠️  WARNING: DB_PASSWORD not set');
}

// Cloud Run uses Unix socket via Cloud SQL Proxy
// Local development uses TCP/IP with public IP
const isCloudRun = process.env.CLOUD_SQL_CONNECTION_NAME || process.env.DB_SOCKET_PATH;

let dbConfig: any;

if (isCloudRun && process.env.DB_SOCKET_PATH) {
  // Cloud Run: Use Unix socket (via Cloud SQL Proxy)
  dbConfig = {
    host: process.env.DB_SOCKET_PATH, // Unix socket path
    database: process.env.DB_NAME || 'aip_production',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    // No SSL needed for Unix socket
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 20,
  };
  console.log('🔌 Connecting via Unix socket (Cloud Run)');
} else {
  // Local development: Use TCP/IP with public IP
  dbConfig = {
    host: process.env.DB_HOST || '35.225.60.9',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'aip_production',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_HOST?.includes('localhost') ? false : {
      rejectUnauthorized: false, // Required for Cloud SQL public IP
    },
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 20,
  };
  console.log('🔌 Connecting via TCP/IP (local development)');
}

console.log('🔌 Database config:', {
  host: dbConfig.host,
  port: dbConfig.port || 'N/A (Unix socket)',
  database: dbConfig.database,
  user: dbConfig.user,
  ssl: dbConfig.ssl ? 'enabled' : 'disabled',
});

export const pool = new Pool(dbConfig);

// Handle connection events
pool.on('connect', () => {
  console.log('✅ Database client connected');
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
  // Don't exit - let health check handle failures
});
