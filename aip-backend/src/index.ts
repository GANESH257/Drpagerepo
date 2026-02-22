import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { corsOptions } from './middleware/cors';
import { pool } from './db/connection';

// Import routes
import authRoutes from './routes/auth';
import doctorRoutes from './routes/doctors';
import practiceRoutes from './routes/practices';
import departmentRoutes from './routes/departments';
import membershipPlanRoutes from './routes/membership-plans';
import approvalRequestRoutes from './routes/approval-requests';
import joinRequestRoutes from './routes/join-requests';
import referralRoutes from './routes/referrals';
import appointmentRoutes from './routes/appointments';
import messageRoutes from './routes/messages';
import notificationRoutes from './routes/notifications';
import policyRoutes from './routes/policies';
import eventRoutes from './routes/events';
import communityRoutes from './routes/community';

dotenv.config();

const app = express();
// Cloud Run sets PORT automatically - must use process.env.PORT
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const dbResult = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString(),
      dbTime: dbResult.rows[0]?.now
    });
  } catch (error) {
    console.error('Health check DB error:', error);
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: (error as Error).message 
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/practices', practiceRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/membership-plans', membershipPlanRoutes);
app.use('/api/approval-requests', approvalRequestRoutes);
app.use('/api/join-requests', joinRequestRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/community', communityRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server (Cloud Run requires 0.0.0.0, not localhost)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Listening on 0.0.0.0:${PORT}`);
  
  // Test database connection (non-blocking)
  pool.query('SELECT NOW()')
    .then(() => {
      console.log('✅ Database connection successful');
    })
    .catch((err) => {
      console.error('⚠️  Database connection failed:', err.message);
      console.log('Server started but database operations may fail');
    });
});
