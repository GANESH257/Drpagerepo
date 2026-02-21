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

    if (doctorId) {
      // Get referrals for specific doctor (sent or received)
      query = `
        SELECT r.*, 
               fd.full_name as from_doctor_name,
               td.full_name as to_doctor_name
        FROM referrals r
        LEFT JOIN doctors fd ON r.from_doctor_id = fd.id
        LEFT JOIN doctors td ON r.to_doctor_id = td.id
        WHERE r.from_doctor_id = $1 OR r.to_doctor_id = $1
        ORDER BY r.created_at DESC
      `;
      params = [doctorId];
    } else if (userRole === 'admin') {
      // Admin can see all referrals
      query = `
        SELECT r.*, 
               fd.full_name as from_doctor_name,
               td.full_name as to_doctor_name
        FROM referrals r
        LEFT JOIN doctors fd ON r.from_doctor_id = fd.id
        LEFT JOIN doctors td ON r.to_doctor_id = td.id
        ORDER BY r.created_at DESC
      `;
    } else {
      // Regular users see only their referrals
      const doctorResult = await pool.query(
        'SELECT id FROM doctors WHERE user_id = $1 LIMIT 1',
        [userId]
      );

      if (doctorResult.rows.length === 0) {
        return res.json([]);
      }

      const userDoctorId = doctorResult.rows[0].id;
      query = `
        SELECT r.*, 
               fd.full_name as from_doctor_name,
               td.full_name as to_doctor_name
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
 * Get single referral
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, 
              fd.full_name as from_doctor_name,
              td.full_name as to_doctor_name
       FROM referrals r
       LEFT JOIN doctors fd ON r.from_doctor_id = fd.id
       LEFT JOIN doctors td ON r.to_doctor_id = td.id
       WHERE r.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    res.json(result.rows[0]);
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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'new')
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
 * Update referral
 */
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Verify ownership
    const referralResult = await pool.query(
      'SELECT from_doctor_id FROM referrals WHERE id = $1',
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

    if (referral.from_doctor_id !== userDoctorId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Build update query
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ');

    const updateResult = await pool.query(
      `UPDATE referrals SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id, ...values]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Error updating referral:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
