import express from 'express';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/referrals
 * Get referrals - filtered by doctor if provided
 * Query params: doctorId (optional)
 */
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { doctorId } = req.query;
    const userId = req.userId;
    const userRole = req.userRole;

    let query = '';
    let params: any[] = [];

    const selectCols = `
      r.*,
      fd.full_name as from_doctor_name,
      td.full_name as to_doctor_name,
      fd.practice_id as from_practice_id,
      td.practice_id as to_practice_id
    `;
    if (doctorId) {
      query = `
        SELECT ${selectCols}
        FROM referrals r
        LEFT JOIN doctors fd ON r.from_doctor_id = fd.id
        LEFT JOIN doctors td ON r.to_doctor_id = td.id
        WHERE r.from_doctor_id = $1 OR r.to_doctor_id = $1
        ORDER BY r.created_at DESC
      `;
      params = [doctorId];
    } else if (userRole === 'admin') {
      query = `
        SELECT ${selectCols}
        FROM referrals r
        LEFT JOIN doctors fd ON r.from_doctor_id = fd.id
        LEFT JOIN doctors td ON r.to_doctor_id = td.id
        ORDER BY r.created_at DESC
      `;
    } else {
      const doctorResult = await pool.query(
        'SELECT id FROM doctors WHERE user_id = $1 LIMIT 1',
        [userId]
      );

      if (doctorResult.rows.length === 0) {
        return res.json([]);
      }

      const userDoctorId = doctorResult.rows[0].id;
      query = `
        SELECT ${selectCols}
        FROM referrals r
        LEFT JOIN doctors fd ON r.from_doctor_id = fd.id
        LEFT JOIN doctors td ON r.to_doctor_id = td.id
        WHERE r.from_doctor_id = $1 OR r.to_doctor_id = $1
        ORDER BY r.created_at DESC
      `;
      params = [userDoctorId];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/referrals/:id
 * Get single referral (only sender, recipient, or admin)
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*,
              fd.full_name as from_doctor_name,
              td.full_name as to_doctor_name,
              fd.practice_id as from_practice_id,
              td.practice_id as to_practice_id
       FROM referrals r
       LEFT JOIN doctors fd ON r.from_doctor_id = fd.id
       LEFT JOIN doctors td ON r.to_doctor_id = td.id
       WHERE r.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    const referral = result.rows[0];
    if (req.userRole !== 'admin') {
      const doctorResult = await pool.query(
        'SELECT id FROM doctors WHERE user_id = $1 LIMIT 1',
        [req.userId]
      );
      if (doctorResult.rows.length === 0) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      const userDoctorId = doctorResult.rows[0].id;
      const isParticipant =
        referral.from_doctor_id === userDoctorId || referral.to_doctor_id === userDoctorId;
      if (!isParticipant) {
        return res.status(403).json({ error: 'You can only view your own referrals' });
      }
    }

    res.json(referral);
  } catch (error) {
    console.error('Error fetching referral:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/referrals
 * Create new referral
 */
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const {
      to_doctor_id,
      patient_name_or_initials,
      patient_age,
      patient_sex,
      patient_phone,
      condition_summary,
      notes,
    } = req.body;

    if (!to_doctor_id || !patient_name_or_initials || !condition_summary) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Get from_doctor_id from authenticated user
    const doctorResult = await pool.query(
      'SELECT id FROM doctors WHERE user_id = $1 LIMIT 1',
      [req.userId]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(403).json({ error: 'Doctor profile not found' });
    }

    const from_doctor_id = doctorResult.rows[0].id;

    if (from_doctor_id === to_doctor_id) {
      return res.status(400).json({ error: 'Cannot refer to yourself' });
    }

    const referralId = `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const result = await pool.query(
      `INSERT INTO referrals (
        id, from_doctor_id, to_doctor_id, patient_name_or_initials,
        patient_age, patient_sex, patient_phone, condition_summary, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'considering')
      RETURNING *`,
      [
        referralId,
        from_doctor_id,
        to_doctor_id,
        patient_name_or_initials,
        patient_age || null,
        patient_sex || null,
        patient_phone || null,
        condition_summary,
        notes || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating referral:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/referrals/:id
 * Update referral (status, notes, or attended_at only)
 */
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const referralResult = await pool.query(
      'SELECT from_doctor_id, to_doctor_id FROM referrals WHERE id = $1',
      [req.params.id]
    );

    if (referralResult.rows.length === 0) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    const doctorResult = await pool.query(
      'SELECT id FROM doctors WHERE user_id = $1 LIMIT 1',
      [req.userId]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const userDoctorId = doctorResult.rows[0].id;
    const referral = referralResult.rows[0];
    const isFrom = referral.from_doctor_id === userDoctorId;
    const isTo = referral.to_doctor_id === userDoctorId;
    const isAdmin = req.userRole === 'admin';

    if (!isFrom && !isTo && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const body = req.body as Record<string, unknown>;
    const updates: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];

    if (body.status !== undefined) {
      const status = String(body.status).toLowerCase().replace(/\s+/g, '_');
      const allowed = ['considering', 'accepted', 'no_show', 'cancelled'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Use: considering, accepted, no_show, cancelled' });
      }
      updates.push(`status = $${values.length + 1}`);
      values.push(status);
      if (status === 'accepted') {
        updates.push(`attended_at = COALESCE(attended_at, NOW())`);
      }
    }
    if (body.notes !== undefined) {
      updates.push(`notes = $${values.length + 1}`);
      values.push(body.notes === null ? null : String(body.notes));
    }
    if (body.attended_at !== undefined) {
      updates.push(`attended_at = $${values.length + 1}`);
      values.push(body.attended_at === null ? null : body.attended_at);
    }

    if (values.length === 0) {
      return res.status(400).json({ error: 'No allowed fields to update' });
    }

    const idParamIndex = values.length + 1;
    values.push(req.params.id);
    const updateResult = await pool.query(
      `UPDATE referrals SET ${updates.join(', ')} WHERE id = $${idParamIndex} RETURNING *`,
      values
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Error updating referral:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
