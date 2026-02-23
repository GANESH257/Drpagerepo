import express from 'express';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/notifications
 * Get notifications for authenticated user
 * Query params: unreadOnly (optional boolean)
 */
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { unreadOnly } = req.query;
    const userId = req.userId;

    // Get user's doctor ID
    const doctorResult = await pool.query(
      'SELECT id FROM doctors WHERE user_id = $1 LIMIT 1',
      [userId]
    );

    if (doctorResult.rows.length === 0) {
      return res.json([]);
    }

    const doctorId = doctorResult.rows[0].id;

    let query = '';
    let params: any[] = [];

    if (unreadOnly === 'true') {
      query = `
        SELECT * FROM notifications
        WHERE doctor_id = $1 AND read_at IS NULL
        ORDER BY created_at DESC
      `;
      params = [doctorId];
    } else {
      query = `
        SELECT * FROM notifications
        WHERE doctor_id = $1
        ORDER BY created_at DESC
        LIMIT 100
      `;
      params = [doctorId];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const doctorResult = await pool.query(
      'SELECT id FROM doctors WHERE user_id = $1 LIMIT 1',
      [userId]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const doctorId = doctorResult.rows[0].id;

    const result = await pool.query(
      `UPDATE notifications 
       SET read_at = NOW() 
       WHERE id = $1 AND doctor_id = $2
       RETURNING *`,
      [req.params.id, doctorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for user
 */
router.put('/read-all', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const doctorResult = await pool.query(
      'SELECT id FROM doctors WHERE user_id = $1 LIMIT 1',
      [userId]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const doctorId = doctorResult.rows[0].id;

    await pool.query(
      `UPDATE notifications 
       SET read_at = NOW(), read = true
       WHERE doctor_id = $1 AND read_at IS NULL`,
      [doctorId]
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/notifications/admin/all
 * Get all notifications for all doctors (admin only)
 */
router.get('/admin/all', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.userRole;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      `SELECT n.*, d.full_name as doctor_name, d.email as doctor_email
       FROM notifications n
       LEFT JOIN doctors d ON n.doctor_id = d.id
       ORDER BY n.created_at DESC
       LIMIT 1000`
    );

    // Transform to include doctor info
    const notifications = result.rows.map(row => ({
      id: row.id,
      doctor_id: row.doctor_id,
      type: row.type,
      title: row.title,
      message: row.message,
      link: row.link,
      read: row.read || false,
      created_at: row.created_at,
      read_at: row.read_at,
      doctorName: row.doctor_name,
      doctorEmail: row.doctor_email,
    }));

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
