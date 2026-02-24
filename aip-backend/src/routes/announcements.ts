import express from 'express';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/announcements
 * Get announcements relevant to current doctor (all_doctors, their practice, their specialty)
 */
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const doctorResult = await pool.query(
      'SELECT id, practice_id, specialty FROM doctors WHERE user_id = $1 LIMIT 1',
      [userId]
    );
    if (doctorResult.rows.length === 0) {
      return res.json([]);
    }
    const doctor = doctorResult.rows[0];
    const doctorId = doctor.id;
    const practiceId = doctor.practice_id;
    const specialty = doctor.specialty;

    // Accept both the canonical DB values ('all_doctors') AND the legacy
    // short-form values ('all') that may have been stored before normalisation.
    const result = await pool.query(
      `SELECT a.*, ar.read_at IS NOT NULL as read
       FROM announcements a
       LEFT JOIN announcement_read ar ON ar.announcement_id = a.id AND ar.doctor_id = $1
       WHERE a.audience_type IN ('all_doctors', 'all')
          OR (a.audience_type IN ('practice_doctors', 'practice') AND a.audience_practice_id = $2)
          OR (a.audience_type IN ('specialty_doctors', 'specialty') AND a.audience_specialty = $3)
       ORDER BY a.created_at DESC
       LIMIT 100`,
      [doctorId, practiceId, specialty]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/announcements/:id/read
 * Mark announcement as read for current doctor
 */
router.patch('/:id/read', authenticateToken, async (req: AuthRequest, res) => {
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
    const announcementId = req.params.id;

    await pool.query(
      `INSERT INTO announcement_read (announcement_id, doctor_id)
       VALUES ($1, $2)
       ON CONFLICT (announcement_id, doctor_id) DO UPDATE SET read_at = NOW()`,
      [announcementId, doctorId]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Error marking announcement read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/announcements
 * Create announcement (admin or practice_admin for practice-scoped)
 */
// Normalize short-form audience_type values sent by the frontend into the
// canonical values stored in the DB and queried by the GET route.
function normalizeAudienceType(raw: string): string {
  const map: Record<string, string> = {
    'all':       'all_doctors',
    'specialty': 'specialty_doctors',
    'practice':  'practice_doctors',
    'specific':  'specific_doctors',
  };
  return map[raw] ?? raw; // pass through if already canonical
}

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.userRole;
    const { audience_practice_id, audience_specialty, title, body, doctor_ids } = req.body;
    const audience_type = normalizeAudienceType(req.body.audience_type ?? '');

    if (!title || !body || !audience_type) {
      return res.status(400).json({ error: 'title, body, and audience_type required' });
    }

    if (audience_type === 'practice_doctors' && userRole !== 'admin') {
      const doctorResult = await pool.query(
        'SELECT id, practice_id FROM doctors WHERE user_id = $1 LIMIT 1',
        [req.userId]
      );
      if (doctorResult.rows.length === 0) return res.status(403).json({ error: 'Unauthorized' });
      const practiceId = doctorResult.rows[0].practice_id;
      const isPA = await pool.query(
        "SELECT 1 FROM practice_roles WHERE doctor_id = $1 AND practice_id = $2 AND role = 'practice_admin'",
        [doctorResult.rows[0].id, practiceId]
      );
      if (isPA.rows.length === 0) return res.status(403).json({ error: 'Practice admin only' });
      if (audience_practice_id !== practiceId) {
        return res.status(403).json({ error: 'Can only create announcements for your practice' });
      }
    } else if (audience_type === 'all_doctors' && userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin only for all_doctors' });
    }

    const id = `ann-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const doctorResult = await pool.query(
      'SELECT id FROM doctors WHERE user_id = $1 LIMIT 1',
      [req.userId]
    );
    const createdBy = doctorResult.rows[0]?.id || null;

    await pool.query(
      `INSERT INTO announcements (id, audience_type, audience_practice_id, audience_specialty, title, body, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, audience_type, audience_practice_id || null, audience_specialty || null, title, body, createdBy]
    );

    const row = await pool.query('SELECT * FROM announcements WHERE id = $1', [id]);
    res.status(201).json(row.rows[0]);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
