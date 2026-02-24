import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { corsOptions } from './middleware/cors';
import { pool } from './db/connection';

// Import routes
import authRoutes from './routes/auth';
import uploadRoutes from './routes/upload';
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
import committeeRoutes from './routes/committees';
import leadershipRoutes from './routes/leadership';
import announcementRoutes from './routes/announcements';
import adminCommunityRoutes from './routes/admin-community';
import adminSettingsRoutes from './routes/admin-settings';
import insuranceProvidersRoutes from './routes/insurance-providers';
import specialtiesRoutes from './routes/specialties';
import conditionsRoutes from './routes/conditions';
import treatmentsRoutes from './routes/treatments';
import conditionTreatmentsRoutes from './routes/condition-treatments';

dotenv.config();

const app = express();
// Cloud Run sets PORT automatically - must use process.env.PORT
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadDir));

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
app.use('/api/upload', uploadRoutes);
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
app.use('/api/committees', committeeRoutes);
app.use('/api/leadership', leadershipRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/admin/community', adminCommunityRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/insurance-providers', insuranceProvidersRoutes);
app.use('/api/specialties', specialtiesRoutes);
app.use('/api/conditions', conditionsRoutes);
app.use('/api/treatments', treatmentsRoutes);
app.use('/api/condition-treatments', conditionTreatmentsRoutes);

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
