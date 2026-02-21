import express from 'express';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/appointments
 * Get appointment requests - filtered by doctor if provided
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
      query = `
        SELECT a.*, d.full_name as doctor_name
        FROM appointment_requests a
        LEFT JOIN doctors d ON a.doctor_id = d.id
        WHERE a.doctor_id = $1
        ORDER BY a.requested_date DESC, a.requested_time DESC
      `;
      params = [doctorId];
    } else if (userRole === 'admin') {
      query = `
        SELECT a.*, d.full_name as doctor_name
        FROM appointment_requests a
        LEFT JOIN doctors d ON a.doctor_id = d.id
        ORDER BY a.requested_date DESC, a.requested_time DESC
      `;
    } else {
      // Get appointments for authenticated doctor
      const doctorResult = await pool.query(
        'SELECT id FROM doctors WHERE user_id = $1 LIMIT 1',
        [userId]
      );

      if (doctorResult.rows.length === 0) {
        return res.json([]);
      }

      const userDoctorId = doctorResult.rows[0].id;
      query = `
        SELECT a.*, d.full_name as doctor_name
        FROM appointment_requests a
        LEFT JOIN doctors d ON a.doctor_id = d.id
        WHERE a.doctor_id = $1
        ORDER BY a.requested_date DESC, a.requested_time DESC
      `;
      params = [userDoctorId];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/appointments/:id
 * Get single appointment request
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, d.full_name as doctor_name
       FROM appointment_requests a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/appointments
 * Create new appointment request
 */
router.post('/', async (req, res) => {
  try {
    const {
      doctor_id,
      patient_name,
      requested_date,
      requested_time,
      reason,
      insurance,
    } = req.body;

    if (!doctor_id || !patient_name || !requested_date || !requested_time) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const appointmentId = `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const result = await pool.query(
      `INSERT INTO appointment_requests (
        id, doctor_id, patient_name, requested_date, requested_time, reason, insurance, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'New')
      RETURNING *`,
      [
        appointmentId,
        doctor_id,
        patient_name,
        requested_date,
        requested_time,
        reason || null,
        insurance || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/appointments/:id
 * Update appointment request
 */
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Verify ownership
    const appointmentResult = await pool.query(
      'SELECT doctor_id FROM appointment_requests WHERE id = $1',
      [req.params.id]
    );

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment request not found' });
    }

    const doctorResult = await pool.query(
      'SELECT id FROM doctors WHERE user_id = $1 LIMIT 1',
      [req.userId]
    );

    if (doctorResult.rows.length === 0 && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const appointment = appointmentResult.rows[0];
    const userDoctorId = doctorResult.rows.length > 0 ? doctorResult.rows[0].id : null;

    if (appointment.doctor_id !== userDoctorId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Build update query
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ');

    const updateResult = await pool.query(
      `UPDATE appointment_requests SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id, ...values]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
