import express from 'express';
import crypto from 'crypto';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

function requireAdmin(req: AuthRequest, res: express.Response): boolean {
  if (req.userRole !== 'admin') {
    res.status(403).json({ error: 'Admin only' });
    return false;
  }
  return true;
}

function makeId(prefix: string): string {
  return prefix + '-' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

/**
 * GET /api/admin/community/reports
 * List all post reports (pending first)
 */
router.get('/reports', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const result = await pool.query(
      `SELECT r.id, r.post_id, r.reported_by_doctor_id, r.reason, r.status, r.created_at,
              p.title as post_title, p.body as post_body, p.section, p.author_display_name as post_author,
              d.full_name as reporter_name
       FROM community_post_reports r
       JOIN community_posts p ON p.id = r.post_id
       LEFT JOIN doctors d ON d.id = r.reported_by_doctor_id
       ORDER BY r.status = 'pending' DESC, r.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/admin/community/reports/:id
 * Dismiss report or mark action_taken
 */
router.patch('/reports/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { status } = req.body;
    if (!status || !['dismissed', 'action_taken'].includes(status)) {
      return res.status(400).json({ error: 'status must be dismissed or action_taken' });
    }
    const result = await pool.query(
      'UPDATE community_post_reports SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Report not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/community/moderation
 * List moderated users (suspended/banned)
 */
router.get('/moderation', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const result = await pool.query(
      `SELECT m.id, m.doctor_id, m.status, m.reason, m.until, m.created_at, m.updated_at,
              d.full_name, d.email
       FROM community_user_moderation m
       JOIN doctors d ON d.id = m.doctor_id
       ORDER BY m.updated_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching moderation list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/admin/community/users/:doctorId/moderation
 * Set user moderation status (active | suspended | banned). Body: { status, reason?, until? }
 */
router.put('/users/:doctorId/moderation', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const doctorId = req.params.doctorId;
    const { status, reason, until } = req.body;
    if (!status || !['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({ error: 'status must be active, suspended, or banned' });
    }
    const existing = await pool.query(
      'SELECT id FROM community_user_moderation WHERE doctor_id = $1',
      [doctorId]
    );
    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE community_user_moderation SET status = $1, reason = $2, until = $3, updated_at = NOW()
         WHERE doctor_id = $4`,
        [status, reason ?? null, until ?? null, doctorId]
      );
    } else {
      const id = makeId('cum');
      await pool.query(
        `INSERT INTO community_user_moderation (id, doctor_id, status, reason, until)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, doctorId, status, reason ?? null, until ?? null]
      );
    }
    const row = await pool.query(
      `SELECT m.*, d.full_name, d.email FROM community_user_moderation m
       JOIN doctors d ON d.id = m.doctor_id WHERE m.doctor_id = $1`,
      [doctorId]
    );
    if (row.rows.length === 0) return res.status(500).json({ error: 'Failed to read back' });
    res.json(row.rows[0]);
  } catch (error) {
    console.error('Error setting user moderation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
